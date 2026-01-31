// app.js - Main coordinator and initialization

let isInitialized = false;

// Initialize application
async function init() {
  if (isInitialized) return;
  isInitialized = true;

  // Load and render initial data
  const data = await loadData();
  renderCategories(data);

  // Attach global event listeners
  attachGlobalListeners();

  // Listen for storage updates from other tabs/windows (includes popup saves)
  window.addEventListener('storageUpdated', async (e) => {
    console.log('Storage updated, refreshing UI...');
    const data = e.detail || await loadData();
    renderCategories(data);
  });
}

// Attach global event listeners
function attachGlobalListeners() {
  // Add Category button
  document.getElementById('add-category-btn').addEventListener('click', () => {
    showCategoryModal();
  });

  // Category form submit
  document.getElementById('category-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name').trim();
    const icon = formData.get('icon')?.trim() || null;
    const categoryId = formData.get('categoryId');

    if (!name) return;

    if (categoryId) {
      // Edit existing category
      await updateCategory(categoryId, { name, ...(icon && { icon }) });
    } else {
      // Create new category
      await createCategory(name, icon);
    }

    document.getElementById('category-modal').close();
    const data = await loadData();
    renderCategories(data);
  });

  // Category modal close buttons
  document.getElementById('close-category-modal').addEventListener('click', () => {
    document.getElementById('category-modal').close();
  });

  document.getElementById('cancel-category-btn').addEventListener('click', () => {
    document.getElementById('category-modal').close();
  });

  // Link form submit
  document.getElementById('link-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();
    const title = formData.get('title').trim();
    const categoryId = formData.get('category');
    const linkId = formData.get('linkId');
    const originalCategory = formData.get('originalCategory');

    if (!url || !title || !categoryId) return;

    if (linkId) {
      // Edit existing link
      if (originalCategory !== categoryId) {
        // Move to different category
        await moveLink(linkId, originalCategory, categoryId);
        await updateLink(categoryId, linkId, { title, url });
      } else {
        // Update in same category
        await updateLink(categoryId, linkId, { title, url });
      }
    } else {
      // Create new link
      await addLink(categoryId, { title, url });
    }

    document.getElementById('link-modal').close();
    const data = await loadData();
    renderCategories(data);
  });

  // Link modal close buttons
  document.getElementById('close-link-modal').addEventListener('click', () => {
    document.getElementById('link-modal').close();
  });

  document.getElementById('cancel-link-btn').addEventListener('click', () => {
    document.getElementById('link-modal').close();
  });

  // Quick Add button
  document.getElementById('quick-add-btn').addEventListener('click', async () => {
    try {
      // Get the current tab (this new tab page)
      const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Query for all tabs in the current window
      const tabs = await chrome.tabs.query({ currentWindow: true });

      // Filter out new tab pages, chrome pages, and the current tab itself
      const validTabs = tabs.filter(tab =>
        tab.id !== currentTab.id &&
        !tab.url.startsWith('chrome://') &&
        !tab.url.startsWith('chrome-extension://') &&
        tab.url !== 'about:blank'
      );

      if (validTabs.length === 0) {
        alert('No valid tab found to quick-add. Browse to a website first, then open a new tab.');
        return;
      }

      // Sort by last accessed and get most recent (or just get the first one if lastAccessed not available)
      validTabs.sort((a, b) => {
        const timeA = a.lastAccessed || 0;
        const timeB = b.lastAccessed || 0;
        return timeB - timeA;
      });
      const previousTab = validTabs[0];

      // Pre-fill modal with tab data
      const data = await loadData();
      if (data.categories.length === 0) {
        alert('Create at least one category first.');
        return;
      }

      // Show modal with pre-filled data
      const modal = document.getElementById('link-modal');
      const urlInput = document.getElementById('link-url');
      const titleInput = document.getElementById('link-title');

      urlInput.value = previousTab.url;
      titleInput.value = previousTab.title;

      showLinkModal(null, data.categories[0].id);
    } catch (error) {
      console.error('Quick add failed:', error);
      alert('Failed to quick-add link. Make sure you have browsed to a website first.');
    }
  });

  // Export button
  document.getElementById('export-btn').addEventListener('click', async () => {
    await exportBookmarks();
  });

  // Import button
  document.getElementById('import-btn').addEventListener('click', async () => {
    await importBookmarks();
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
