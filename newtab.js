// newtab.js - Dock UI for Quick Bookmarks
let currentData = null;

// Context menu icons (sized for menu)
const editIcon = `<span style="display:inline-flex;width:13px;height:13px;margin-right:7px">${ICON_PENCIL_SIMPLE}</span>`;
const deleteIcon = `<span style="display:inline-flex;width:13px;height:13px;margin-right:7px">${ICON_TRASH}</span>`;
const addIcon = `<span style="display:inline-flex;width:13px;height:13px;margin-right:7px">${ICON_PLUS}</span>`;

// Helper to render category icon (supports both emoji and Phosphor names)
function renderCategoryIcon(icon) {
    if (!icon) return CATEGORY_ICONS.folder || '📁';
    // Check if it's a Phosphor icon name (in CATEGORY_ICONS)
    if (CATEGORY_ICONS[icon]) {
        return CATEGORY_ICONS[icon];
    }
    // Otherwise treat as emoji/text
    return icon;
}

// Helper to render quick link icon
function renderQuickLinkIcon(iconName) {
    // Check QUICK_ACCESS_ICONS first, then fall back to CATEGORY_ICONS
    if (typeof QUICK_ACCESS_ICONS !== 'undefined' && QUICK_ACCESS_ICONS[iconName]) {
        return QUICK_ACCESS_ICONS[iconName];
    }
    if (CATEGORY_ICONS[iconName]) {
        return CATEGORY_ICONS[iconName];
    }
    // Fallback to globe
    return CATEGORY_ICONS['globe'] || ICON_GLOBE;
}

// Populate icon picker grid
function populateIconPicker(selectedIcon, updatePreview = true) {
    const picker = document.getElementById('icon-picker');
    const hiddenInput = document.getElementById('category-icon');
    const previewIcon = document.getElementById('category-preview-icon');

    // Set hidden input value
    hiddenInput.value = selectedIcon || 'briefcase';

    // Update preview icon
    if (updatePreview && previewIcon) {
        previewIcon.innerHTML = CATEGORY_ICONS[hiddenInput.value] || CATEGORY_ICONS['briefcase'];
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
            previewIcon.innerHTML = CATEGORY_ICONS[item.dataset.icon] || CATEGORY_ICONS['briefcase'];
        }
    };
}

// Populate quick link icon picker grid (includes both brand and category icons)
function populateQuickLinkIconPicker(selectedIcon, updatePreview = true) {
    const picker = document.getElementById('quick-link-icon-picker');
    const hiddenInput = document.getElementById('quick-link-icon');
    const previewIcon = document.getElementById('quick-link-preview-icon');
    if (!picker || !hiddenInput) return;

    hiddenInput.value = selectedIcon || 'globe';

    // Combine quick access icons and category icons
    const allIcons = {
        ...(typeof QUICK_ACCESS_ICONS !== 'undefined' ? QUICK_ACCESS_ICONS : {}),
        ...CATEGORY_ICONS
    };
    const iconNames = Object.keys(allIcons);

    // Update preview icon
    if (updatePreview && previewIcon) {
        previewIcon.innerHTML = allIcons[hiddenInput.value] || allIcons['globe'] || CATEGORY_ICONS['globe'];
    }

    picker.innerHTML = iconNames.map(name => `
        <button type="button"
                class="icon-picker-item${hiddenInput.value === name ? ' selected' : ''}"
                data-icon="${name}"
                title="${name.replace(/-/g, ' ')}">
            ${allIcons[name]}
        </button>
    `).join('');

    picker.onclick = (e) => {
        const item = e.target.closest('.icon-picker-item');
        if (!item) return;

        picker.querySelectorAll('.icon-picker-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        hiddenInput.value = item.dataset.icon;

        // Update preview icon in real-time
        if (previewIcon) {
            previewIcon.innerHTML = allIcons[item.dataset.icon] || allIcons['globe'] || CATEGORY_ICONS['globe'];
        }
    };
}

// Render quick access links
function renderQuickLinks(quickLinks, openInNewTab) {
    const container = document.getElementById('quickLinks');
    if (!container) return;

    container.innerHTML = '';

    // Remove old context menu listener by cloning
    const newContainer = container.cloneNode(false);
    container.parentNode.replaceChild(newContainer, container);

    // Add context menu to container for adding new links (must be added before populating)
    newContainer.addEventListener('contextmenu', (e) => {
        // Only show add menu if clicking on container itself or empty state
        if (e.target === newContainer || e.target.classList.contains('quick-links-empty')) {
            e.preventDefault();
            showContextMenu(e, [
                {
                    content: `${addIcon}Add Quick Link`,
                    events: {
                        click: () => showQuickLinkModal(null)
                    }
                }
            ], 'dark');
        }
    });

    if (!quickLinks || quickLinks.length === 0) {
        newContainer.innerHTML = '<span class="quick-links-empty">No quick links. Right-click to add!</span>';
        return;
    }

    // Sort by order
    const sortedLinks = [...quickLinks].sort((a, b) => a.order - b.order);

    sortedLinks.forEach(link => {
        const linkEl = document.createElement('a');
        linkEl.className = 'quick-link';
        linkEl.href = link.url;
        if (openInNewTab) {
            linkEl.target = '_blank';
            linkEl.rel = 'noopener noreferrer';
        }

        // Add context menu for edit/delete
        linkEl.addEventListener('contextmenu', (e) => {
            showContextMenu(e, [
                {
                    content: `${editIcon}Edit Quick Link`,
                    events: {
                        click: () => showQuickLinkModal(link)
                    }
                },
                {
                    content: `${deleteIcon}Delete Quick Link`,
                    divider: "top",
                    events: {
                        click: async () => {
                            const confirmed = await showConfirmDialog(`Delete "${link.title}"?`);
                            if (confirmed) {
                                await deleteQuickLink(link.id);
                                currentData = await loadData();
                                renderQuickLinks(currentData.quickLinks, currentData.settings.openInNewTab !== false);
                            }
                        }
                    }
                }
            ], 'dark');
        });

        const iconEl = document.createElement('div');
        iconEl.className = 'quick-link-icon';
        iconEl.innerHTML = renderQuickLinkIcon(link.icon);

        const titleEl = document.createElement('span');
        titleEl.className = 'quick-link-title';
        titleEl.textContent = link.title;

        linkEl.appendChild(iconEl);
        linkEl.appendChild(titleEl);
        newContainer.appendChild(linkEl);
    });
}

async function init() {
    // Set Phosphor icons
    document.getElementById('settingsIcon').innerHTML = ICON_GEAR;

    currentData = await loadData();
    renderDock(currentData);
    renderQuickLinks(currentData.quickLinks, currentData.settings.openInNewTab !== false);
    loadSettings(currentData.settings);
    attachEventListeners();

    // Listen for storage updates
    window.addEventListener('storageUpdated', async (e) => {
        currentData = e.detail || await loadData();
        renderDock(currentData);
        renderQuickLinks(currentData.quickLinks, currentData.settings.openInNewTab !== false);
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

    // Delete category button
    document.getElementById('delete-category-btn').addEventListener('click', async () => {
        const categoryId = document.getElementById('category-id').value;
        const category = currentData.categories.find(c => c.id === categoryId);
        if (!category) return;

        const hasLinks = category.links && category.links.length > 0;
        const message = hasLinks
            ? `Delete "${category.name}" and all ${category.links.length} bookmark(s)?`
            : `Delete "${category.name}"?`;

        const confirmed = await showConfirmDialog(message);
        if (confirmed) {
            await deleteCategory(categoryId);
            document.getElementById('category-modal').close();
            currentData = await loadData();
            renderDock(currentData);
        }
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

    // Delete link button
    document.getElementById('delete-link-btn').addEventListener('click', async () => {
        const linkId = document.getElementById('link-id').value;
        const categoryId = document.getElementById('link-original-category').value;
        const linkTitle = document.getElementById('link-title').value;

        const confirmed = await showConfirmDialog(`Delete "${linkTitle}"?`);
        if (confirmed) {
            await deleteLink(categoryId, linkId);
            document.getElementById('link-modal').close();
            currentData = await loadData();
            renderDock(currentData);
        }
    });

    document.getElementById('link-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url').trim();
        const title = formData.get('title').trim();
        const categoryId = formData.get('category');
        const linkId = formData.get('linkId');
        const originalCategory = formData.get('originalCategory');
        const addAsQuickLink = formData.get('addQuickLink') === 'on';

        if (!url || !title || !categoryId || !linkId) return;

        if (originalCategory !== categoryId) {
            // Move to different category
            await moveLink(linkId, originalCategory, categoryId);
            await updateLink(categoryId, linkId, { title, url });
        } else {
            // Update in same category
            await updateLink(categoryId, linkId, { title, url });
        }

        // Also add as quick link if checkbox was checked
        if (addAsQuickLink) {
            await addQuickLink({ title, url, icon: 'globe' });
        }

        document.getElementById('link-modal').close();
        currentData = await loadData();
        renderDock(currentData);
        renderQuickLinks(currentData.quickLinks, currentData.settings.openInNewTab !== false);
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

    // Quick link modal handlers
    document.getElementById('close-quick-link-modal').addEventListener('click', () => {
        document.getElementById('quick-link-modal').close();
    });

    // Delete quick link button
    document.getElementById('delete-quick-link-btn').addEventListener('click', async () => {
        const linkId = document.getElementById('quick-link-id').value;
        const linkTitle = document.getElementById('quick-link-title').value;

        if (!linkId) return;

        const confirmed = await showConfirmDialog(`Delete "${linkTitle}"?`);
        if (confirmed) {
            await deleteQuickLink(linkId);
            document.getElementById('quick-link-modal').close();
            currentData = await loadData();
            renderQuickLinks(currentData.quickLinks, currentData.settings.openInNewTab !== false);
        }
    });

    document.getElementById('quick-link-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const title = formData.get('title').trim();
        const url = formData.get('url').trim();
        const icon = formData.get('icon')?.trim() || 'globe';
        const linkId = formData.get('linkId');

        if (!title || !url) return;

        if (linkId) {
            // Update existing
            await updateQuickLink(linkId, { title, url, icon });
        } else {
            // Add new
            await addQuickLink({ title, url, icon });
        }

        document.getElementById('quick-link-modal').close();
        currentData = await loadData();
        renderQuickLinks(currentData.quickLinks, currentData.settings.openInNewTab !== false);
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
        list.innerHTML = `<span class="ph-icon" style="margin-right:6px">${ICON_FOLDER_OPEN}</span>No bookmarks yet. Right-click to add!`;
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
        emptyMessage.innerHTML = `<span class="ph-icon" style="margin-right:6px">${ICON_FOLDER_OPEN}</span>No categories yet. Click <span class="ph-icon" style="margin:0 4px">${ICON_GEAR}</span> to get started!`;
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
        const iconContent = renderCategoryIcon(category.icon);
        // Check if it's an SVG (Phosphor) or text (emoji)
        if (iconContent.startsWith('<svg')) {
            iconCircle.innerHTML = iconContent;
        } else {
            iconCircle.textContent = iconContent;
        }

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
    const idInput = document.getElementById('category-id');
    const previewTitle = document.getElementById('category-preview-title');
    const deleteBtn = document.getElementById('delete-category-btn');

    nameInput.value = category.name;
    idInput.value = category.id;

    // Populate preview header
    if (previewTitle) {
        previewTitle.textContent = category.name || 'Edit Category';
    }

    // Show delete button (editing existing category)
    if (deleteBtn) {
        deleteBtn.style.display = 'flex';
    }

    // Populate icon picker with current selection (also updates preview icon)
    populateIconPicker(category.icon);

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
    const previewTitle = document.getElementById('link-preview-title');
    const previewImg = document.getElementById('link-preview-img');
    const deleteBtn = document.getElementById('delete-link-btn');

    // Populate category dropdown
    categorySelect.innerHTML = currentData.categories
        .sort((a, b) => a.order - b.order)
        .map(cat => `<option value="${cat.id}" ${cat.id === categoryId ? 'selected' : ''}>${escapeHtml(cat.name)}</option>`)
        .join('');

    urlInput.value = link.url;
    titleInput.value = link.title;
    linkIdInput.value = link.id;
    originalCategoryInput.value = categoryId;

    // Populate preview header
    if (previewTitle) {
        previewTitle.textContent = link.title || 'Edit Bookmark';
    }
    if (previewImg) {
        previewImg.src = getFaviconUrl(link.url);
        previewImg.alt = link.title || '';
    }

    // Show delete button (editing existing bookmark)
    if (deleteBtn) {
        deleteBtn.style.display = 'flex';
    }

    // Reset checkbox (unchecked by default)
    const addQuickLinkCheckbox = document.getElementById('link-add-quick-link');
    if (addQuickLinkCheckbox) {
        addQuickLinkCheckbox.checked = false;
    }

    modal.showModal();
    titleInput.focus();
}

// Show quick link edit modal
function showQuickLinkModal(link = null) {
    const modal = document.getElementById('quick-link-modal');
    const titleInput = document.getElementById('quick-link-title');
    const urlInput = document.getElementById('quick-link-url');
    const linkIdInput = document.getElementById('quick-link-id');
    const previewLabel = document.getElementById('quick-link-preview-label');
    const previewTitle = document.getElementById('quick-link-preview-title');
    const deleteBtn = document.getElementById('delete-quick-link-btn');

    if (link) {
        // Editing existing link
        if (previewLabel) previewLabel.textContent = 'Edit Quick Link';
        if (previewTitle) previewTitle.textContent = link.title || 'Quick Link';
        titleInput.value = link.title;
        urlInput.value = link.url;
        linkIdInput.value = link.id;
        populateQuickLinkIconPicker(link.icon);

        // Show delete button
        if (deleteBtn) deleteBtn.style.display = 'flex';
    } else {
        // Adding new link
        if (previewLabel) previewLabel.textContent = 'New Quick Link';
        if (previewTitle) previewTitle.textContent = 'Untitled';
        titleInput.value = '';
        urlInput.value = '';
        linkIdInput.value = '';
        populateQuickLinkIconPicker('globe');

        // Hide delete button
        if (deleteBtn) deleteBtn.style.display = 'none';
    }

    modal.showModal();
    titleInput.focus();
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
