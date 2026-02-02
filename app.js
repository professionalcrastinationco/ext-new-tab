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
  // Category accordion expand/collapse
  document.getElementById('categories-container').addEventListener('click', (e) => {
    const header = e.target.closest('.category-header');
    if (!header) return;

    // Don't toggle if clicking action buttons
    if (e.target.closest('.category-actions')) return;

    const category = header.closest('.category');
    category.classList.toggle('expanded');
  });

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

  // Delete category button (in modal)
  document.getElementById('delete-category-btn').addEventListener('click', async () => {
    const categoryId = document.getElementById('category-id').value;
    if (!categoryId) return;

    const category = (await loadData()).categories.find(c => c.id === categoryId);
    if (!category) return;

    let confirmMessage = `Delete "${category.name}"?`;
    if (category.links.length > 0) {
      confirmMessage = `Delete "${category.name}" and all ${category.links.length} bookmark(s) in it?`;
    }

    const confirmed = await showConfirmDialog(confirmMessage);
    if (!confirmed) return;

    await deleteCategory(categoryId);
    document.getElementById('category-modal').close();
    const data = await loadData();
    renderCategories(data);
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
    const addAsQuickLink = formData.get('addQuickLink') === 'on';

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

    // Also add as quick link if checkbox was checked
    if (addAsQuickLink) {
      await addQuickLink({ title, url, icon: 'globe' });
    }

    document.getElementById('link-modal').close();
    const data = await loadData();
    renderCategories(data);
  });

  // Link modal close buttons
  document.getElementById('close-link-modal').addEventListener('click', () => {
    document.getElementById('link-modal').close();
  });

  // Delete link button (in modal)
  document.getElementById('delete-link-btn').addEventListener('click', async () => {
    const linkId = document.getElementById('link-id').value;
    const categoryId = document.getElementById('link-original-category').value;
    if (!linkId || !categoryId) return;

    const data = await loadData();
    const category = data.categories.find(c => c.id === categoryId);
    const link = category?.links.find(l => l.id === linkId);
    if (!link) return;

    const confirmed = await showConfirmDialog(`Delete "${link.title}"?`);
    if (!confirmed) return;

    await deleteLink(categoryId, linkId);
    document.getElementById('link-modal').close();
    const updatedData = await loadData();
    renderCategories(updatedData);
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
