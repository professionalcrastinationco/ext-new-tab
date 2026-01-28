// ui.js - Presentation Layer for rendering and event handling

let currentData = null;
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

  container.innerHTML = sortedCategories.map(category => {
    const sortedLinks = [...category.links].sort((a, b) => a.order - b.order);

    return `
      <article class="category" data-category-id="${category.id}" draggable="true">
        <header class="category-header">
          <div class="category-title-section">
            <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
            <h2 class="category-name">${escapeHtml(category.name)}</h2>
          </div>
          <div class="category-actions">
            <button class="icon-btn edit-category-btn" data-category-id="${category.id}" title="Rename category">✏️</button>
            <button class="icon-btn delete-category-btn" data-category-id="${category.id}" title="Delete category">🗑️</button>
            <button class="add-link-btn" data-category-id="${category.id}">+ Add Link</button>
          </div>
        </header>
        <div class="links-grid" data-category-id="${category.id}">
          ${sortedLinks.length === 0
            ? '<p class="empty-links">No links yet. Click "Add Link" to add one.</p>'
            : sortedLinks.map(link => renderLink(link, category.id, openInNewTab)).join('')}
        </div>
      </article>
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
  return `
    <div class="link-item" data-link-id="${link.id}" data-category-id="${categoryId}" draggable="true">
      <a href="${escapeHtml(link.url)}" class="link-content" title="${escapeHtml(link.url)}"${targetAttr}>
        <img src="${faviconUrl}"
             alt=""
             class="favicon"
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22><rect width=%2224%22 height=%2224%22 fill=%22%23ccc%22/></svg>'">
        <span class="link-title">${escapeHtml(link.title)}</span>
      </a>
      <div class="link-actions">
        <button class="icon-btn edit-link-btn" data-link-id="${link.id}" data-category-id="${categoryId}" title="Edit link">✏️</button>
        <button class="icon-btn delete-link-btn" data-link-id="${link.id}" data-category-id="${categoryId}" title="Delete link">🗑️</button>
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

  // Add link to category
  document.querySelectorAll('.add-link-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const categoryId = btn.dataset.categoryId;
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

// Drag and Drop for Categories
function attachDragListeners() {
  // Category drag and drop
  document.querySelectorAll('.category').forEach(category => {
    category.addEventListener('dragstart', (e) => {
      draggedElement = category;
      draggedCategoryId = category.dataset.categoryId;
      category.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    category.addEventListener('dragend', () => {
      category.classList.remove('dragging');
      draggedElement = null;
      draggedCategoryId = null;
    });

    category.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (draggedCategoryId && !draggedLinkId) {
        e.dataTransfer.dropEffect = 'move';
        const afterElement = getDragAfterElement(
          document.getElementById('categories-container'),
          e.clientY,
          '.category'
        );
        const container = document.getElementById('categories-container');
        if (afterElement == null) {
          container.appendChild(draggedElement);
        } else {
          container.insertBefore(draggedElement, afterElement);
        }
      }
    });

    category.addEventListener('drop', async (e) => {
      e.preventDefault();
      if (draggedCategoryId && !draggedLinkId) {
        const categories = Array.from(document.querySelectorAll('.category'));
        const orderedIds = categories.map(cat => cat.dataset.categoryId);
        await reorderCategories(orderedIds);
      }
    });
  });

  // Link drag and drop
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

  // Link drop zones (grids)
  document.querySelectorAll('.links-grid').forEach(grid => {
    grid.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (draggedLinkId) {
        e.dataTransfer.dropEffect = 'move';
        const afterElement = getDragAfterElement(grid, e.clientX, '.link-item');
        if (afterElement == null) {
          grid.appendChild(draggedElement);
        } else {
          grid.insertBefore(draggedElement, afterElement);
        }
      }
    });

    grid.addEventListener('drop', async (e) => {
      e.preventDefault();
      if (draggedLinkId) {
        const targetCategoryId = grid.dataset.categoryId;
        const originalCategoryId = draggedElement.dataset.categoryId;

        // Update link's category attribute
        draggedElement.dataset.categoryId = targetCategoryId;

        // Get ordered IDs
        const links = Array.from(grid.querySelectorAll('.link-item'));
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
  const title = document.getElementById('category-modal-title');
  const nameInput = document.getElementById('category-name');
  const iconInput = document.getElementById('category-icon');
  const idInput = document.getElementById('category-id');

  if (category) {
    title.textContent = 'Edit Category';
    nameInput.value = category.name;
    if (iconInput) iconInput.value = category.icon || '';
    idInput.value = category.id;
  } else {
    title.textContent = 'Add Category';
    nameInput.value = '';
    if (iconInput) iconInput.value = '';
    idInput.value = '';
  }

  modal.showModal();
  nameInput.focus();
}

// Show link modal (add or edit)
function showLinkModal(link = null, categoryId = null) {
  const modal = document.getElementById('link-modal');
  const form = document.getElementById('link-form');
  const title = document.getElementById('link-modal-title');
  const urlInput = document.getElementById('link-url');
  const titleInput = document.getElementById('link-title');
  const categorySelect = document.getElementById('link-category');
  const linkIdInput = document.getElementById('link-id');
  const originalCategoryInput = document.getElementById('link-original-category');

  // Populate category dropdown
  categorySelect.innerHTML = currentData.categories
    .sort((a, b) => a.order - b.order)
    .map(cat => `<option value="${cat.id}" ${cat.id === categoryId ? 'selected' : ''}>${escapeHtml(cat.name)}</option>`)
    .join('');

  if (link) {
    title.textContent = 'Edit Link';
    urlInput.value = link.url;
    titleInput.value = link.title;
    linkIdInput.value = link.id;
    originalCategoryInput.value = categoryId;
  } else {
    title.textContent = 'Add Link';
    urlInput.value = '';
    titleInput.value = '';
    linkIdInput.value = '';
    originalCategoryInput.value = '';
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
