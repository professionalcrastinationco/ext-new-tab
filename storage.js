// storage.js - Data Layer for chrome.storage.sync operations

const STORAGE_KEY = 'quickBookmarks';

const DEFAULT_DATA = {
  version: 2,
  categories: [],
  quickLinks: [],
  settings: {
    defaultCategoryId: null,
    openInNewTab: true,
    dockPosition: 'bottom' // 'top' or 'bottom'
  }
};

// Default quick links for new installations
const DEFAULT_QUICK_LINKS = [
  { id: 'ql_claude', title: 'Claude', url: 'https://claude.ai', icon: 'claude', order: 0 },
  { id: 'ql_chatgpt', title: 'ChatGPT', url: 'https://chat.openai.com', icon: 'chatgpt', order: 1 },
  { id: 'ql_github', title: 'GitHub', url: 'https://github.com', icon: 'github', order: 2 },
  { id: 'ql_iceberg', title: 'Iceberg', url: 'https://iceberg.pm', icon: 'kanban', order: 3 }
];

// Load all data from chrome.storage.sync
async function loadData() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEY, (result) => {
      if (result[STORAGE_KEY]) {
        const data = result[STORAGE_KEY];
        // Migrate: ensure all categories have icons
        let needsSave = false;
        if (data.categories) {
          data.categories.forEach((cat, index) => {
            if (!cat.icon) {
              cat.icon = DEFAULT_ICONS[index % DEFAULT_ICONS.length];
              needsSave = true;
            }
          });
        }
        // Migrate: ensure dockPosition setting exists
        if (!data.settings) {
          data.settings = { ...DEFAULT_DATA.settings };
          needsSave = true;
        } else if (data.settings.dockPosition === undefined) {
          data.settings.dockPosition = 'bottom';
          needsSave = true;
        }
        // Migrate: ensure quickLinks exists
        if (!data.quickLinks) {
          data.quickLinks = DEFAULT_QUICK_LINKS;
          needsSave = true;
        }
        if (needsSave) {
          saveData(data);
        }
        resolve(data);
      } else {
        resolve(DEFAULT_DATA);
      }
    });
  });
}

// Save all data to chrome.storage.sync
async function saveData(data) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: data }, () => {
      resolve();
    });
  });
}

// Generate unique ID with prefix
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Category CRUD Operations

// Default icons for categories (Phosphor icon names)
const DEFAULT_ICONS = ['briefcase', 'gear', 'users', 'book-open', 'film-strip', 'globe', 'target', 'palette', 'lightning', 'fire'];

async function createCategory(name, icon = null) {
  const data = await loadData();
  // Use provided icon or pick a default one based on category count
  const defaultIcon = icon || DEFAULT_ICONS[data.categories.length % DEFAULT_ICONS.length];
  const newCategory = {
    id: generateId('cat'),
    name: name,
    icon: defaultIcon,
    order: data.categories.length,
    links: []
  };
  data.categories.push(newCategory);
  await saveData(data);
  return newCategory;
}

async function renameCategory(categoryId, newName) {
  const data = await loadData();
  const category = data.categories.find(c => c.id === categoryId);
  if (category) {
    category.name = newName;
    await saveData(data);
  }
  return category;
}

async function updateCategory(categoryId, updates) {
  const data = await loadData();
  const category = data.categories.find(c => c.id === categoryId);
  if (category) {
    Object.assign(category, updates);
    await saveData(data);
  }
  return category;
}

async function deleteCategory(categoryId) {
  const data = await loadData();
  const index = data.categories.findIndex(c => c.id === categoryId);
  if (index !== -1) {
    data.categories.splice(index, 1);
    // Reorder remaining categories
    data.categories.forEach((cat, idx) => {
      cat.order = idx;
    });
    await saveData(data);
    return true;
  }
  return false;
}

async function reorderCategories(orderedIds) {
  const data = await loadData();
  const categoryMap = new Map(data.categories.map(c => [c.id, c]));

  data.categories = orderedIds
    .map(id => categoryMap.get(id))
    .filter(c => c !== undefined);

  data.categories.forEach((cat, idx) => {
    cat.order = idx;
  });

  await saveData(data);
}

// Link CRUD Operations

async function addLink(categoryId, linkData) {
  const data = await loadData();
  const category = data.categories.find(c => c.id === categoryId);

  if (category) {
    const newLink = {
      id: generateId('link'),
      title: linkData.title,
      url: linkData.url,
      order: category.links.length,
      addedAt: Date.now()
    };
    category.links.push(newLink);
    await saveData(data);
    return newLink;
  }
  return null;
}

async function updateLink(categoryId, linkId, updates) {
  const data = await loadData();
  const category = data.categories.find(c => c.id === categoryId);

  if (category) {
    const link = category.links.find(l => l.id === linkId);
    if (link) {
      Object.assign(link, updates);
      await saveData(data);
      return link;
    }
  }
  return null;
}

async function deleteLink(categoryId, linkId) {
  const data = await loadData();
  const category = data.categories.find(c => c.id === categoryId);

  if (category) {
    const index = category.links.findIndex(l => l.id === linkId);
    if (index !== -1) {
      category.links.splice(index, 1);
      // Reorder remaining links
      category.links.forEach((link, idx) => {
        link.order = idx;
      });
      await saveData(data);
      return true;
    }
  }
  return false;
}

async function moveLink(linkId, fromCategoryId, toCategoryId) {
  const data = await loadData();
  const fromCategory = data.categories.find(c => c.id === fromCategoryId);
  const toCategory = data.categories.find(c => c.id === toCategoryId);

  if (fromCategory && toCategory) {
    const linkIndex = fromCategory.links.findIndex(l => l.id === linkId);
    if (linkIndex !== -1) {
      const [link] = fromCategory.links.splice(linkIndex, 1);
      link.order = toCategory.links.length;
      toCategory.links.push(link);

      // Reorder both categories
      fromCategory.links.forEach((l, idx) => {
        l.order = idx;
      });

      await saveData(data);
      return true;
    }
  }
  return false;
}

async function reorderLinks(categoryId, orderedIds) {
  const data = await loadData();
  const category = data.categories.find(c => c.id === categoryId);

  if (category) {
    const linkMap = new Map(category.links.map(l => [l.id, l]));
    category.links = orderedIds
      .map(id => linkMap.get(id))
      .filter(l => l !== undefined);

    category.links.forEach((link, idx) => {
      link.order = idx;
    });

    await saveData(data);
  }
}

// Settings Operations

async function updateSetting(key, value) {
  const data = await loadData();
  data.settings[key] = value;
  await saveData(data);
  return data.settings;
}

async function getSettings() {
  const data = await loadData();
  return data.settings;
}

// Quick Link CRUD Operations

async function addQuickLink(linkData) {
  const data = await loadData();
  const newLink = {
    id: generateId('ql'),
    title: linkData.title,
    url: linkData.url,
    icon: linkData.icon || 'globe',  // fallback to globe icon
    order: data.quickLinks.length
  };
  data.quickLinks.push(newLink);
  await saveData(data);
  return newLink;
}

async function updateQuickLink(linkId, updates) {
  const data = await loadData();
  const link = data.quickLinks.find(l => l.id === linkId);
  if (link) {
    Object.assign(link, updates);
    await saveData(data);
  }
  return link;
}

async function deleteQuickLink(linkId) {
  const data = await loadData();
  const index = data.quickLinks.findIndex(l => l.id === linkId);
  if (index !== -1) {
    data.quickLinks.splice(index, 1);
    // Reorder remaining
    data.quickLinks.forEach((link, idx) => {
      link.order = idx;
    });
    await saveData(data);
    return true;
  }
  return false;
}

async function reorderQuickLinks(orderedIds) {
  const data = await loadData();
  const linkMap = new Map(data.quickLinks.map(l => [l.id, l]));
  data.quickLinks = orderedIds
    .map(id => linkMap.get(id))
    .filter(l => l !== undefined);
  data.quickLinks.forEach((link, idx) => {
    link.order = idx;
  });
  await saveData(data);
}

// Listen for storage changes from other tabs/windows
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes[STORAGE_KEY]) {
    console.log('Storage changed, dispatching update event...');
    // Notify app to reload UI
    window.dispatchEvent(new CustomEvent('storageUpdated', {
      detail: changes[STORAGE_KEY].newValue
    }));
  }
});
