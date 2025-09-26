// Emergency fix for storage initialization
// This file should be loaded BEFORE storage.js to ensure compatibility

// Ensure chrome.storage is available
if (typeof chrome === 'undefined' || !chrome.storage) {
    console.warn('Chrome storage API not available - using localStorage fallback');
    
    // Create a localStorage-based fallback
    const localStorageFallback = {
        getLocalStorageKey: (namespace, key) => `chrome_ext_${namespace}_${key}`,
        
        createStorageAPI: (namespace) => ({
            get: async (keys) => {
                const result = {};
                if (keys === null) {
                    // Get all items for this namespace
                    for (let i = 0; i < localStorage.length; i++) {
                        const storageKey = localStorage.key(i);
                        const prefix = `chrome_ext_${namespace}_`;
                        if (storageKey.startsWith(prefix)) {
                            const key = storageKey.substring(prefix.length);
                            try {
                                result[key] = JSON.parse(localStorage.getItem(storageKey));
                            } catch (e) {
                                result[key] = localStorage.getItem(storageKey);
                            }
                        }
                    }
                } else if (typeof keys === 'string') {
                    const storageKey = localStorageFallback.getLocalStorageKey(namespace, keys);
                    const value = localStorage.getItem(storageKey);
                    if (value !== null) {
                        try {
                            result[keys] = JSON.parse(value);
                        } catch (e) {
                            result[keys] = value;
                        }
                    }
                } else if (Array.isArray(keys)) {
                    keys.forEach(key => {
                        const storageKey = localStorageFallback.getLocalStorageKey(namespace, key);
                        const value = localStorage.getItem(storageKey);
                        if (value !== null) {
                            try {
                                result[key] = JSON.parse(value);
                            } catch (e) {
                                result[key] = value;
                            }
                        }
                    });
                } else if (typeof keys === 'object') {
                    // Keys is an object with defaults
                    Object.keys(keys).forEach(key => {
                        const storageKey = localStorageFallback.getLocalStorageKey(namespace, key);
                        const value = localStorage.getItem(storageKey);
                        if (value !== null) {
                            try {
                                result[key] = JSON.parse(value);
                            } catch (e) {
                                result[key] = value;
                            }
                        } else {
                            result[key] = keys[key]; // Use default value
                        }
                    });
                }
                return result;
            },
            
            set: async (items) => {
                try {
                    Object.keys(items).forEach(key => {
                        const storageKey = localStorageFallback.getLocalStorageKey(namespace, key);
                        const value = typeof items[key] === 'string' ? items[key] : JSON.stringify(items[key]);
                        localStorage.setItem(storageKey, value);
                    });
                    
                    // Trigger change listeners
                    if (window.chrome.storage.onChanged._listeners) {
                        const changes = {};
                        Object.keys(items).forEach(key => {
                            changes[key] = { newValue: items[key] };
                        });
                        window.chrome.storage.onChanged._listeners.forEach(listener => {
                            listener(changes, namespace);
                        });
                    }
                    return true;
                } catch (error) {
                    console.error('Error saving to localStorage:', error);
                    throw error;
                }
            },
            
            remove: async (keys) => {
                const keysArray = Array.isArray(keys) ? keys : [keys];
                keysArray.forEach(key => {
                    const storageKey = localStorageFallback.getLocalStorageKey(namespace, key);
                    localStorage.removeItem(storageKey);
                });
                
                // Trigger change listeners
                if (window.chrome.storage.onChanged._listeners) {
                    const changes = {};
                    keysArray.forEach(key => {
                        changes[key] = { oldValue: undefined };
                    });
                    window.chrome.storage.onChanged._listeners.forEach(listener => {
                        listener(changes, namespace);
                    });
                }
                return true;
            },
            
            clear: async () => {
                // Clear all items for this namespace
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(`chrome_ext_${namespace}_`)) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                // Trigger change listeners
                if (window.chrome.storage.onChanged._listeners) {
                    window.chrome.storage.onChanged._listeners.forEach(listener => {
                        listener({}, namespace);
                    });
                }
                return true;
            },
            
            getBytesInUse: async (keys) => {
                // Estimate bytes used
                let totalBytes = 0;
                if (!keys) {
                    // Get all items for this namespace
                    for (let i = 0; i < localStorage.length; i++) {
                        const storageKey = localStorage.key(i);
                        if (storageKey.startsWith(`chrome_ext_${namespace}_`)) {
                            const value = localStorage.getItem(storageKey);
                            totalBytes += storageKey.length + value.length;
                        }
                    }
                } else {
                    const keysArray = Array.isArray(keys) ? keys : [keys];
                    keysArray.forEach(key => {
                        const storageKey = localStorageFallback.getLocalStorageKey(namespace, key);
                        const value = localStorage.getItem(storageKey);
                        if (value) {
                            totalBytes += storageKey.length + value.length;
                        }
                    });
                }
                return totalBytes;
            }
        })
    };
    
    // Create mock chrome.storage with localStorage fallback
    window.chrome = window.chrome || {};
    window.chrome.storage = window.chrome.storage || {
        sync: localStorageFallback.createStorageAPI('sync'),
        local: localStorageFallback.createStorageAPI('local'),
        onChanged: {
            _listeners: [],
            addListener: (callback) => {
                if (!window.chrome.storage.onChanged._listeners) {
                    window.chrome.storage.onChanged._listeners = [];
                }
                window.chrome.storage.onChanged._listeners.push(callback);
            },
            removeListener: (callback) => {
                if (window.chrome.storage.onChanged._listeners) {
                    const index = window.chrome.storage.onChanged._listeners.indexOf(callback);
                    if (index > -1) {
                        window.chrome.storage.onChanged._listeners.splice(index, 1);
                    }
                }
            }
        }
    };
}

console.log('Storage fix loaded - Chrome storage API status:', 
    typeof chrome !== 'undefined' && chrome.storage && !chrome.storage._isLocalStorageFallback ? 'Native' : 'localStorage Fallback');