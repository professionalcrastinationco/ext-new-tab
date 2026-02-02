// ui.js - Presentation Layer for rendering and event handling

let currentData = null;

// Populate icon picker grid
function populateIconPicker(selectedIcon) {
    const picker = document.getElementById('icon-picker');
    const hiddenInput = document.getElementById('category-icon');
    const previewIcon = document.getElementById('category-preview-icon');

    if (!picker || !hiddenInput) return;

    // Set hidden input value
    hiddenInput.value = selectedIcon || 'briefcase';

    // Update preview icon
    if (previewIcon) {
        previewIcon.innerHTML = CATEGORY_ICONS[hiddenInput.value] || CATEGORY_ICONS.briefcase;
    }

    // Get category icons from icons.js
    const iconNames = Object.keys(CATEGORY_ICONS);

    picker.innerHTML = iconNames.map(name => `
        <button type="button"
                class="icon-picker-item${hiddenInput.value === name ? ' selected' : ''}"
                data-icon="${name}"
                title="${name.replace(/-/g, ' ')}">
            ${CATEGORY_ICONS[name]}
        </button>
    `).join('');

    // Click handler for icon selection
    picker.onclick = (e) => {
        const item = e.target.closest('.icon-picker-item');
        if (!item) return;

        // Update selection
        picker.querySelectorAll('.icon-picker-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        hiddenInput.value = item.dataset.icon;

        // Update preview icon in real-time
        if (previewIcon) {
            previewIcon.innerHTML = CATEGORY_ICONS[item.dataset.icon] || CATEGORY_ICONS.briefcase;
        }
    };
}
let draggedElement = null;
let draggedCategoryId = null;
let draggedLinkId = null;

// Render all categories and links
function renderCategories(data) {
  currentData = data;
  const container = document.getElementById('categories-container');

  if (!data.categories || data.categories.length === 0) {
    container.innerHTML = '<p class="empty-state">No categories yet. Click "Add Category" to get started.</p>';
    return;
  }

  // Get openInNewTab preference (default to true)
  const openInNewTab = data.settings.openInNewTab !== false;

  // Sort categories by order
  const sortedCategories = [...data.categories].sort((a, b) => a.order - b.order);

  container.innerHTML = sortedCategories.map((category, index) => {
    const sortedLinks = [...category.links].sort((a, b) => a.order - b.order);
    const linkCount = category.links.length;
    const linksHtml = sortedLinks.map(link => renderLink(link, category.id, openInNewTab)).join('');

    return `
      <div class="category${index === 0 ? ' expanded' : ''}" data-category-id="${category.id}">
        <div class="category-header">
          <div class="category-expand">
            ${ICON_CARET_RIGHT}
          </div>
          <div class="category-icon">
            ${CATEGORY_ICONS[category.icon] || CATEGORY_ICONS.briefcase}
          </div>
          <div class="category-info">
            <div class="category-name">${escapeHtml(category.name)}</div>
            <div class="category-meta">${linkCount} bookmark${linkCount !== 1 ? 's' : ''}</div>
          </div>
          <div class="category-actions">
            <button class="icon-btn edit-category-btn" data-category-id="${category.id}" title="Edit">
              ${ICON_PENCIL_SIMPLE}
            </button>
            <button class="icon-btn delete-category-btn" data-category-id="${category.id}" title="Delete">
              ${ICON_TRASH}
            </button>
          </div>
        </div>
        <div class="category-content">
          <div class="links-list" data-category-id="${category.id}">
            ${linksHtml}
            <div class="add-link-row" data-category-id="${category.id}">
              ${ICON_PLUS} Add bookmark
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  attachCategoryEventListeners();
  attachLinkEventListeners();
  attachDragListeners();
}

// Render a single link
function renderLink(link, categoryId, openInNewTab = true) {
  const faviconUrl = getFaviconUrl(link.url);
  const targetAttr = openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
  let hostname = '';
  try {
    hostname = new URL(link.url).hostname;
  } catch (e) {
    hostname = link.url;
  }
  return `
    <div class="link-item" data-link-id="${link.id}" data-category-id="${categoryId}" draggable="true">
      <span class="link-drag">⋮⋮</span>
      <img class="link-favicon" src="${faviconUrl}" alt="" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22><rect width=%2224%22 height=%2224%22 fill=%22%23ccc%22/></svg>'">
      <div class="link-info">
        <a href="${escapeHtml(link.url)}" class="link-title"${targetAttr}>${escapeHtml(link.title)}</a>
        <div class="link-url">${escapeHtml(hostname)}</div>
      </div>
      <div class="link-actions">
        <button class="icon-btn edit-link-btn" data-link-id="${link.id}" data-category-id="${categoryId}" title="Edit">
          ${ICON_PENCIL_SIMPLE}
        </button>
        <button class="icon-btn delete-link-btn" data-link-id="${link.id}" data-category-id="${categoryId}" title="Delete">
          ${ICON_TRASH}
        </button>
      </div>
    </div>
  `;
}

// Attach category event listeners
function attachCategoryEventListeners() {
  // Edit category
  document.querySelectorAll('.edit-category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const categoryId = btn.dataset.categoryId;
      const category = currentData.categories.find(c => c.id === categoryId);
      if (category) {
        showCategoryModal(category);
      }
    });
  });

  // Delete category
  document.querySelectorAll('.delete-category-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const categoryId = btn.dataset.categoryId;
      const category = currentData.categories.find(c => c.id === categoryId);

      if (category) {
        if (category.links.length > 0) {
          const confirmed = await showConfirmDialog(
            `Delete "${category.name}" and all ${category.links.length} link(s) in it?`
          );
          if (!confirmed) return;
        }

        await deleteCategory(categoryId);
        const data = await loadData();
        renderCategories(data);
      }
    });
  });

  // Add link row inside category (accordion layout)
  document.querySelectorAll('.add-link-row').forEach(row => {
    row.addEventListener('click', (e) => {
      e.stopPropagation();
      const categoryId = row.dataset.categoryId;
      showLinkModal(null, categoryId);
    });
  });
}

// Attach link event listeners
function attachLinkEventListeners() {
  // Edit link
  document.querySelectorAll('.edit-link-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const linkId = btn.dataset.linkId;
      const categoryId = btn.dataset.categoryId;
      const category = currentData.categories.find(c => c.id === categoryId);
      const link = category?.links.find(l => l.id === linkId);

      if (link) {
        showLinkModal(link, categoryId);
      }
    });
  });

  // Delete link
  document.querySelectorAll('.delete-link-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const linkId = btn.dataset.linkId;
      const categoryId = btn.dataset.categoryId;

      await deleteLink(categoryId, linkId);
      const data = await loadData();
      renderCategories(data);
    });
  });
}

// Drag and Drop for Categories and Links
function attachDragListeners() {
  // Link drag and drop (links within categories)
  document.querySelectorAll('.link-item').forEach(link => {
    link.addEventListener('dragstart', (e) => {
      draggedElement = link;
      draggedLinkId = link.dataset.linkId;
      link.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.stopPropagation();
    });

    link.addEventListener('dragend', () => {
      link.classList.remove('dragging');
      draggedElement = null;
      draggedLinkId = null;
    });
  });

  // Link drop zones (vertical lists)
  document.querySelectorAll('.links-list').forEach(list => {
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (draggedLinkId) {
        e.dataTransfer.dropEffect = 'move';
        // Use Y position for vertical list
        const afterElement = getDragAfterElement(list, e.clientY, '.link-item');
        if (afterElement == null) {
          // Insert before the add-link-row (keep it at the bottom)
          const addLinkRow = list.querySelector('.add-link-row');
          if (addLinkRow) {
            list.insertBefore(draggedElement, addLinkRow);
          } else {
            list.appendChild(draggedElement);
          }
        } else {
          list.insertBefore(draggedElement, afterElement);
        }
      }
    });

    list.addEventListener('drop', async (e) => {
      e.preventDefault();
      if (draggedLinkId) {
        const targetCategoryId = list.dataset.categoryId;
        const originalCategoryId = draggedElement.dataset.categoryId;

        // Update link's category attribute
        draggedElement.dataset.categoryId = targetCategoryId;

        // Get ordered IDs (exclude add-link-row)
        const links = Array.from(list.querySelectorAll('.link-item'));
        const orderedIds = links.map(l => l.dataset.linkId);

        // If moved to different category
        if (originalCategoryId !== targetCategoryId) {
          await moveLink(draggedLinkId, originalCategoryId, targetCategoryId);
          // Reorder links in target category
          await reorderLinks(targetCategoryId, orderedIds);
        } else {
          // Just reorder in same category
          await reorderLinks(targetCategoryId, orderedIds);
        }

        // Reload to show updated state
        const data = await loadData();
        renderCategories(data);
      }
    });
  });
}

function getDragAfterElement(container, position, selector) {
  const draggableElements = [
    ...container.querySelectorAll(`${selector}:not(.dragging)`)
  ];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = position - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Show category modal (add or edit)
function showCategoryModal(category = null) {
  const modal = document.getElementById('category-modal');
  const form = document.getElementById('category-form');
  const nameInput = document.getElementById('category-name');
  const idInput = document.getElementById('category-id');
  const previewLabel = document.getElementById('category-preview-label');
  const previewTitle = document.getElementById('category-preview-title');
  const previewIcon = document.getElementById('category-preview-icon');
  const deleteBtn = document.getElementById('delete-category-btn');

  if (category) {
    // Edit mode
    previewLabel.textContent = 'Editing Category';
    previewTitle.textContent = category.name;
    nameInput.value = category.name;
    idInput.value = category.id;
    // Populate icon picker with current selection
    populateIconPicker(category.icon);
    // Show delete button
    deleteBtn.style.display = 'flex';
  } else {
    // Add mode
    previewLabel.textContent = 'New Category';
    previewTitle.textContent = 'Untitled';
    nameInput.value = '';
    idInput.value = '';
    // Populate icon picker with default
    populateIconPicker('briefcase');
    // Hide delete button
    deleteBtn.style.display = 'none';
  }

  modal.showModal();
  nameInput.focus();
}

// Show link modal (add or edit)
function showLinkModal(link = null, categoryId = null) {
  const modal = document.getElementById('link-modal');
  const form = document.getElementById('link-form');
  const urlInput = document.getElementById('link-url');
  const titleInput = document.getElementById('link-title');
  const categorySelect = document.getElementById('link-category');
  const linkIdInput = document.getElementById('link-id');
  const originalCategoryInput = document.getElementById('link-original-category');
  const previewLabel = document.getElementById('link-preview-label');
  const previewTitle = document.getElementById('link-preview-title');
  const previewFavicon = document.getElementById('link-preview-favicon');
  const faviconImg = document.getElementById('link-favicon-img');
  const deleteBtn = document.getElementById('delete-link-btn');

  // Populate category dropdown
  categorySelect.innerHTML = currentData.categories
    .sort((a, b) => a.order - b.order)
    .map(cat => `<option value="${cat.id}" ${cat.id === categoryId ? 'selected' : ''}>${escapeHtml(cat.name)}</option>`)
    .join('');

  if (link) {
    // Edit mode
    previewLabel.textContent = 'Editing Bookmark';
    // Truncate title if too long
    const displayTitle = link.title.length > 30 ? link.title.substring(0, 30) + '...' : link.title;
    previewTitle.textContent = displayTitle;
    // Set favicon using Google Favicons API
    try {
      const hostname = new URL(link.url).hostname;
      faviconImg.src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
      faviconImg.alt = link.title;
      faviconImg.style.display = 'block';
    } catch (e) {
      faviconImg.style.display = 'none';
    }
    urlInput.value = link.url;
    titleInput.value = link.title;
    linkIdInput.value = link.id;
    originalCategoryInput.value = categoryId;
    // Show delete button
    deleteBtn.style.display = 'flex';
  } else {
    // Add mode
    previewLabel.textContent = 'New Bookmark';
    previewTitle.textContent = 'Untitled';
    // Hide favicon in add mode or show placeholder
    faviconImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256" fill="%2394a3b8"><path d="M137.54,186.36a8,8,0,0,1,0,11.31l-9.94,10A56,56,0,0,1,48.38,128.4L72.5,104.28A56,56,0,0,1,149.31,102a8,8,0,1,1-10.64,12,40,40,0,0,0-54.85,1.63L59.7,139.72a40,40,0,0,0,56.58,56.58l9.94-9.94A8,8,0,0,1,137.54,186.36Zm70.08-138a56.08,56.08,0,0,0-79.22,0l-9.94,9.95a8,8,0,0,0,11.32,11.31l9.94-9.94a40,40,0,0,1,56.58,56.58L172.18,140a40,40,0,0,1-54.85,1.63,8,8,0,1,0-10.64,12,56,56,0,0,0,76.81-2.26l24.12-24.12A56.08,56.08,0,0,0,207.62,48.38Z"/></svg>';
    faviconImg.alt = '';
    faviconImg.style.display = 'block';
    urlInput.value = '';
    titleInput.value = '';
    linkIdInput.value = '';
    originalCategoryInput.value = '';
    // Hide delete button
    deleteBtn.style.display = 'none';
  }

  modal.showModal();
  urlInput.focus();
}

// Show confirm dialog
function showConfirmDialog(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    const messageEl = document.getElementById('confirm-message');
    const confirmBtn = document.getElementById('confirm-delete-btn');
    const cancelBtn = document.getElementById('cancel-confirm-btn');

    messageEl.textContent = message;

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      modal.close();
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);

    modal.showModal();
  });
}
