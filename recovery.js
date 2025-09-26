// Recovery script - run this in the browser console if your bookmarks disappeared
// This will restore your bookmarks from local storage backup

(async function recoverBookmarks() {
    console.log('Starting bookmark recovery...');
    
    try {
        // Check local storage for backup
        const localData = await chrome.storage.local.get('bookmarkDashboard');
        
        if (localData && localData.bookmarkDashboard) {
            console.log('Found backup data in local storage:', localData.bookmarkDashboard);
            
            // Clear any corrupted sync data
            console.log('Clearing sync storage...');
            await chrome.storage.sync.clear();
            
            // Save to sync storage
            console.log('Restoring data to sync storage...');
            await chrome.storage.sync.set({ bookmarkDashboard: localData.bookmarkDashboard });
            
            console.log('Recovery complete! Refreshing page...');
            location.reload();
        } else {
            console.log('No backup data found in local storage.');
            
            // Try to get from sync storage
            const syncData = await chrome.storage.sync.get(null);
            console.log('Current sync storage contents:', syncData);
            
            // If sync storage has chunked data, try to reconstruct
            if (syncData['bookmarkDashboard_meta']) {
                console.log('Found chunked data, attempting to reconstruct...');
                const meta = syncData['bookmarkDashboard_meta'];
                const chunks = [];
                
                for (let i = 0; i < meta.chunkCount; i++) {
                    const chunkKey = `bookmarkDashboard_chunk_${i}`;
                    if (syncData[chunkKey]) {
                        chunks.push(syncData[chunkKey]);
                    }
                }
                
                if (chunks.length === meta.chunkCount) {
                    const reconstructed = JSON.parse(chunks.join(''));
                    console.log('Reconstructed data:', reconstructed);
                    
                    // Save to both local and sync
                    await chrome.storage.local.set({ bookmarkDashboard: reconstructed });
                    
                    // Clear chunked data and save as single item if possible
                    const dataSize = JSON.stringify(reconstructed).length;
                    if (dataSize < 8000) {
                        await chrome.storage.sync.clear();
                        await chrome.storage.sync.set({ bookmarkDashboard: reconstructed });
                    }
                    
                    console.log('Recovery from chunked data complete! Refreshing...');
                    location.reload();
                } else {
                    console.log('Chunked data is incomplete.');
                }
            } else {
                console.log('No recoverable data found. The extension will use default bookmarks.');
                
                // Force reset to defaults
                await chrome.storage.sync.clear();
                await chrome.storage.local.clear();
                location.reload();
            }
        }
    } catch (error) {
        console.error('Recovery failed:', error);
        console.log('You may need to manually reset the extension.');
    }
})();
