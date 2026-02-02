// popup.js - Browser action popup logic

let currentTab = null;

// Get favicon URL for a given page URL
function getFaviconUrl(pageUrl) {
  try {
    const url = new URL(pageUrl);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
  } catch {
    return '';
  }
}

// Get hostname from URL for display
function getHostname(pageUrl) {
  try {
    const url = new URL(pageUrl);
    return url.hostname;
  } catch {
    return pageUrl;
  }
}

// Initialize popup
async function initPopup() {
  // Set empty state icon
  const emptyIcon = document.getElementById('empty-icon');
  if (emptyIcon && typeof ICON_FOLDER_OPEN !== 'undefined') {
    emptyIcon.innerHTML = ICON_FOLDER_OPEN;
  }

  try {
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    // Don't allow bookmarking chrome:// or extension pages
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      showMessage('Cannot bookmark Chrome internal pages', 'error');
      document.getElementById('save-btn').disabled = true;
      return;
    }

    // Populate card header with page info
    const favicon = document.getElementById('favicon');
    const pageTitleDisplay = document.getElementById('page-title-display');
    const pageUrlDisplay = document.getElementById('page-url-display');

    if (favicon) favicon.src = getFaviconUrl(tab.url);
    if (pageTitleDisplay) pageTitleDisplay.textContent = tab.title;
    if (pageUrlDisplay) pageUrlDisplay.textContent = getHostname(tab.url);

    // Pre-fill URL and title form fields
    document.getElementById('url').value = tab.url;
    document.getElementById('title').value = tab.title;

    // Load categories
    const data = await loadData();

    if (!data.categories || data.categories.length === 0) {
      // Show empty state, hide card and quick actions
      document.getElementById('bookmark-card').style.display = 'none';
      document.querySelector('.quick-actions').style.display = 'none';
      document.getElementById('empty-state').style.display = 'block';
      return;
    }

    // Populate category dropdown
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = data.categories
      .sort((a, b) => a.order - b.order)
      .map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`)
      .join('');

    // Load open in new tab preference
    const openInNewTab = data.settings.openInNewTab !== false; // default to true
    document.getElementById('openInNewTab').checked = openInNewTab;

    // Focus on title field and select all text for easy editing
    const titleInput = document.getElementById('title');
    titleInput.focus();
    titleInput.select();

  } catch (error) {
    console.error('Failed to initialize popup:', error);
    showMessage('Failed to load. Please try again.', 'error');
  }
}

// Show message
function showMessage(text, type = 'success') {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  messageEl.style.display = 'block';

  if (type === 'success') {
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 2000);
  }
}

// Save bookmark
async function saveBookmark(formData) {
  try {
    const url = formData.get('url');
    const title = formData.get('title');
    const categoryId = formData.get('category');
    const openInNewTab = formData.get('openInNewTab') === 'on';

    console.log('Saving bookmark:', { title, url, categoryId });

    // Load current data
    const data = await loadData();

    // Update settings
    data.settings.openInNewTab = openInNewTab;

    // Add the link to the category
    const category = data.categories.find(c => c.id === categoryId);
    if (category) {
      const newLink = {
        id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: title,
        url: url,
        order: category.links.length,
        addedAt: Date.now()
      };
      category.links.push(newLink);

      // Save everything in one operation
      await saveData(data);
      console.log('Bookmark saved successfully');

      showMessage('Bookmark saved!', 'success');

      // Close popup after short delay
      setTimeout(() => {
        window.close();
      }, 800);
    } else {
      throw new Error('Category not found');
    }

  } catch (error) {
    console.error('Failed to save bookmark:', error);
    showMessage('Failed to save bookmark', 'error');
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  initPopup();

  // Form submit
  document.getElementById('bookmark-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveBookmark(formData);
  });

  // Cancel button
  document.getElementById('cancel-btn').addEventListener('click', () => {
    window.close();
  });

  // Open new tab link (Settings quick action)
  document.getElementById('open-newtab').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'chrome://newtab' });
    window.close();
  });

  // Open new tab link (empty state)
  const openNewtabEmpty = document.getElementById('open-newtab-empty');
  if (openNewtabEmpty) {
    openNewtabEmpty.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'chrome://newtab' });
      window.close();
    });
  }
});
