// newtab.js - Dock UI for Quick Bookmarks
let currentData = null;

// SVG Icons for context menu
const editIcon = `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" style="margin-right: 7px" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;

const deleteIcon = `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none" style="margin-right: 7px" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

async function init() {
    currentData = await loadData();
    renderDock(currentData);
    loadSettings(currentData.settings);
    attachEventListeners();

    // Listen for storage updates
    window.addEventListener('storageUpdated', async (e) => {
        currentData = e.detail || await loadData();
        renderDock(currentData);
        loadSettings(currentData.settings);
    });
}

// Handle search input
function attachEventListeners() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                if (query.includes('.') && !query.includes(' ')) {
                    const url = query.startsWith('http') ? query : `https://${query}`;
                    window.location.href = url;
                } else {
                    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                }
            }
        }
    });

    // Category modal handlers
    document.getElementById('close-category-modal').addEventListener('click', () => {
        document.getElementById('category-modal').close();
    });

    document.getElementById('cancel-category-btn').addEventListener('click', () => {
        document.getElementById('category-modal').close();
    });

    document.getElementById('category-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name').trim();
        const icon = formData.get('icon')?.trim() || null;
        const categoryId = formData.get('categoryId');

        if (!name || !categoryId) return;

        await updateCategory(categoryId, { name, ...(icon && { icon }) });
        document.getElementById('category-modal').close();
        currentData = await loadData();
        renderDock(currentData);
    });

    // Link modal handlers
    document.getElementById('close-link-modal').addEventListener('click', () => {
        document.getElementById('link-modal').close();
    });

    document.getElementById('cancel-link-btn').addEventListener('click', () => {
        document.getElementById('link-modal').close();
    });

    document.getElementById('link-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url').trim();
        const title = formData.get('title').trim();
        const categoryId = formData.get('category');
        const linkId = formData.get('linkId');
        const originalCategory = formData.get('originalCategory');

        if (!url || !title || !categoryId || !linkId) return;

        if (originalCategory !== categoryId) {
            // Move to different category
            await moveLink(linkId, originalCategory, categoryId);
            await updateLink(categoryId, linkId, { title, url });
        } else {
            // Update in same category
            await updateLink(categoryId, linkId, { title, url });
        }

        document.getElementById('link-modal').close();
        currentData = await loadData();
        renderDock(currentData);
    });

    // Settings button
    const settingsModal = document.getElementById('settings-modal');
    document.getElementById('settingsBtn').addEventListener('click', () => {
        settingsModal.showModal();
    });

    // Close settings
    document.getElementById('close-settings-modal').addEventListener('click', () => {
        settingsModal.close();
    });

    // Click outside modal to close (backdrop click)
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.close();
        }
    });

    // Dock position change
    document.getElementById('dockPositionSelect').addEventListener('change', async (e) => {
        await updateSetting('dockPosition', e.target.value);
        currentData = await loadData();
        renderDock(currentData);
    });

    // Open in new tab change
    document.getElementById('openInNewTabSelect').addEventListener('change', async (e) => {
        await updateSetting('openInNewTab', e.target.value === 'true');
        currentData = await loadData();
        renderDock(currentData);
    });

    // Manage categories button
    document.getElementById('manageCategoriesBtn').addEventListener('click', () => {
        // Open the old management interface
        window.location.href = 'manage.html';
    });
}

function loadSettings(settings) {
    document.getElementById('dockPositionSelect').value = settings.dockPosition || 'bottom';
    document.getElementById('openInNewTabSelect').value = settings.openInNewTab !== false ? 'true' : 'false';
}

function createBookmarkCard(category, openInNewTab) {
    const card = document.createElement('div');
    card.className = 'bookmark-card';

    const header = document.createElement('div');
    header.className = 'card-header';
    header.textContent = category.name;

    const list = document.createElement('div');
    list.className = 'bookmark-list';

    if (category.links.length === 0) {
        list.style.gridColumn = '1 / -1';
        list.style.textAlign = 'center';
        list.style.color = '#64748b';
        list.style.fontSize = '0.875rem';
        list.innerHTML = '📭 No bookmarks yet. Right-click to add!';
    } else {
        const sortedLinks = [...category.links].sort((a, b) => a.order - b.order);
        sortedLinks.forEach(bookmark => {
            const link = document.createElement('a');
            link.className = 'bookmark-link';
            link.href = bookmark.url;
            if (openInNewTab) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }

            // Add context menu for bookmark actions
            link.addEventListener('contextmenu', (e) => {
                showContextMenu(e, [
                    {
                        content: `${editIcon}Edit Bookmark`,
                        events: {
                            click: () => showLinkModal(bookmark, category.id)
                        }
                    },
                    {
                        content: `${deleteIcon}Delete Bookmark`,
                        divider: "top",
                        events: {
                            click: async () => {
                                const confirmed = await showConfirmDialog(`Delete "${bookmark.title}"?`);
                                if (confirmed) {
                                    await deleteLink(category.id, bookmark.id);
                                    currentData = await loadData();
                                    renderDock(currentData);
                                }
                            }
                        }
                    }
                ], 'dark');
            });

            const favicon = document.createElement('img');
            favicon.className = 'bookmark-favicon';
            favicon.src = getFaviconUrl(bookmark.url);
            favicon.alt = '';

            const title = document.createElement('span');
            title.className = 'bookmark-title';
            title.textContent = bookmark.title;

            link.appendChild(favicon);
            link.appendChild(title);
            list.appendChild(link);
        });
    }

    card.appendChild(header);
    card.appendChild(list);

    return card;
}

function renderDock(data) {
    const dockElement = document.getElementById('dock');
    const dockPosition = data.settings.dockPosition || 'bottom';
    const openInNewTab = data.settings.openInNewTab !== false;

    // Update dock position class
    dockElement.className = `dock dock-${dockPosition}`;

    // Clear dock
    dockElement.innerHTML = '';

    if (!data.categories || data.categories.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-dock';
        emptyMessage.innerHTML = '📂 No categories yet. Click ⚙️ to get started!';
        dockElement.appendChild(emptyMessage);
        return;
    }

    // Sort categories by order
    const sortedCategories = [...data.categories].sort((a, b) => a.order - b.order);

    sortedCategories.forEach(category => {
        const dockIcon = document.createElement('div');
        dockIcon.className = 'dock-icon';

        const iconCircle = document.createElement('div');
        iconCircle.className = 'icon-circle';
        iconCircle.textContent = category.icon || '📁';

        // Add context menu to icon for category actions
        iconCircle.addEventListener('contextmenu', (e) => {
            showContextMenu(e, [
                {
                    content: `${editIcon}Edit Category`,
                    events: {
                        click: () => showCategoryModal(category)
                    }
                },
                {
                    content: `${deleteIcon}Delete Category`,
                    divider: "top",
                    events: {
                        click: async () => {
                            const hasLinks = category.links && category.links.length > 0;
                            const message = hasLinks
                                ? `Delete "${category.name}" and all ${category.links.length} bookmark(s)?`
                                : `Delete "${category.name}"?`;

                            const confirmed = await showConfirmDialog(message);
                            if (confirmed) {
                                await deleteCategory(category.id);
                                currentData = await loadData();
                                renderDock(currentData);
                            }
                        }
                    }
                }
            ], 'dark');
        });

        const card = createBookmarkCard(category, openInNewTab);

        dockIcon.appendChild(iconCircle);
        dockIcon.appendChild(card);
        dockElement.appendChild(dockIcon);
    });
}

function showCategoryModal(category) {
    const modal = document.getElementById('category-modal');
    const nameInput = document.getElementById('category-name');
    const iconInput = document.getElementById('category-icon');
    const idInput = document.getElementById('category-id');

    nameInput.value = category.name;
    iconInput.value = category.icon || '';
    idInput.value = category.id;

    modal.showModal();
    nameInput.focus();
}

function showLinkModal(link, categoryId) {
    const modal = document.getElementById('link-modal');
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

    urlInput.value = link.url;
    titleInput.value = link.title;
    linkIdInput.value = link.id;
    originalCategoryInput.value = categoryId;

    modal.showModal();
    urlInput.focus();
}

// Show confirm dialog (replaces native confirm())
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

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
