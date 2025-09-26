/* newtab.js
 * Bookmark Dashboard (sync-aware)
 * - Uses window.dashboardStorage (from storage-hybrid.js)
 * - Works with theme-manager.js
 * - Exposes window.dashboardApp for DragDropManager to refresh UI
 */

(function () {
  // ---------- Small utilities ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Sync Status UI ----------
  class SyncStatusManager {
    constructor() {
      this.icon = $('#sync-icon');
      this.text = $('#sync-status-text');
      this.lastSyncEl = $('#last-sync-time');
      this.queueEl = $('#sync-queue-count');
      this.details = $('#sync-details');
      this.btn = $('#force-sync-btn');

      // Toggle details on click
      const status = $('#sync-status');
      if (status) {
        status.addEventListener('click', (e) => {
          // Only toggle if not clicking the button
          if (e.target && (e.target.id === 'force-sync-btn' || e.target.closest('#force-sync-btn'))) return;
          if (this.details) this.details.classList.toggle('hidden');
        });
      }

      if (this.btn) {
        this.btn.addEventListener('click', async () => {
          this.setBusy(true);
          try {
            if (window.dashboardStorage?.forceSync) {
              await window.dashboardStorage.forceSync();
            } else {
              // Fallback: rewrite current settings/data to trigger mirrors
              const settings = await window.dashboardStorage.loadSettings();
              await window.dashboardStorage.saveSettings(settings);
              const data = await window.dashboardStorage.loadData();
              await window.dashboardStorage.saveData(data);
            }
          } catch (e) {
            console.warn('Force sync failed:', e);
            this.setState('error', 0);
          } finally {
            this.setBusy(false);
          }
        });
      }

      // Listen for custom events your storage/background can dispatch
      document.addEventListener('syncStatusChanged', (ev) => {
        const { status, lastSync, queueLength, isOnline } = ev.detail || {};
        if (typeof queueLength === 'number') {
          if (this.queueEl) this.queueEl.textContent = `${queueLength} item${queueLength === 1 ? '' : 's'}`;
        }
        if (lastSync && this.lastSyncEl) {
          const dt = new Date(lastSync);
          this.lastSyncEl.textContent = dt.toLocaleString();
        }
        if (!isOnline) {
          this.setState('offline', queueLength || 0);
          return;
        }
        this.setState(status || 'synced', queueLength || 0);
      });
    }

    setBusy(isBusy) {
      if (!this.icon || !this.text) return;
      if (isBusy) {
        this.icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12a8 8 0 018-8v3m4 13a8 8 0 01-8 8v-3m8-5h3m-3-4h3m-3-4h3" />`;
        this.text.textContent = 'Syncing...';
      } else {
        this.setState('synced', 0);
      }
    }

    setState(state, queue = 0) {
      if (!this.icon || !this.text) return;
      switch (state) {
        case 'offline':
          this.icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18" />`;
          this.text.textContent = 'Offline';
          break;
        case 'error':
          this.icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M4.93 4.93l14.14 14.14" />`;
          this.text.textContent = 'Sync Error';
          break;
        case 'syncing':
          this.icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12a8 8 0 018-8v3m4 13a8 8 0 01-8 8v-3m8-5h3m-3-4h3m-3-4h3" />`;
          this.text.textContent = 'Syncing...';
          break;
        default:
          // 'synced'
          this.icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l2 2 4-4" />`;
          this.text.textContent = queue > 0 ? `Queued (${queue})` : 'Synced';
      }
    }
  }

  // ---------- Dashboard ----------
  class BookmarkDashboard {
    constructor() {
      this.data = null;
      this.settings = null;
      this.editMode = false;
      this.currentEditingCard = null;
      this.currentEditingLink = null;
      this.currentSubLinks = [];

      this.grid = $('#dashboard-grid');
      this.editBtn = $('#edit-mode-btn');
      this.addBtn = $('#add-card-btn');

      this.init();
    }

    async init() {
      try {
        // Load theme
        if (window.themeManager?.loadTheme) {
          const savedTheme = await window.themeManager.loadTheme();
          window.themeManager.applyTheme(savedTheme);
        }

        // Load data/settings
        this.data = await window.dashboardStorage.loadData();
        this.settings = await window.dashboardStorage.loadSettings();

        // UI hook-ups
        this.setupEventListeners();
        this.setupModalHandlers();

        // Render initial
        await this.renderDashboard();

        // Init Sync UI after render
        this.syncStatus = new SyncStatusManager();

        console.log('Bookmark Dashboard initialized');
      } catch (e) {
        console.error('Init error:', e);
        this.showErrorState();
      }
    }

    setupEventListeners() {
      if (this.editBtn) {
        this.editBtn.addEventListener('click', () => this.toggleEditMode());
      }
      if (this.addBtn) {
        this.addBtn.addEventListener('click', () => this.openCardModal());
      }

      // Simple and effective settings button handler using event delegation
      document.addEventListener('click', (e) => {
        const settingsBtn = e.target.closest('#settings-btn');
        if (settingsBtn) {
          e.preventDefault();
          this.openSettings();
        }
      });
    }

    openSettings() {
      // Use Chrome Extension API (primary method)
      if (chrome?.runtime?.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        // Simple fallback: open in new tab
        window.open(chrome.runtime.getURL('options/options.html'), '_blank');
      }
    }

    // Modal Helper Functions
    setupModalHandlers() {
      // Card Modal Handlers
      const cardForm = document.getElementById('card-form');
      const cancelCardBtn = document.getElementById('cancel-card');
      const closeModalBtn = document.getElementById('close-modal');

      if (cardForm) {
        cardForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.saveCardFromModal();
        });
      }

      if (cancelCardBtn) {
        cancelCardBtn.addEventListener('click', () => this.closeCardModal());
      }

      if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => this.closeCardModal());
      }

      // Link Modal Handlers
      const linkForm = document.getElementById('link-form');
      const cancelLinkBtn = document.getElementById('cancel-link');
      const closeLinkModalBtn = document.getElementById('close-link-modal');

      if (linkForm) {
        linkForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.saveLinkFromModal();
        });
      }

      if (cancelLinkBtn) {
        cancelLinkBtn.addEventListener('click', () => this.closeLinkModal());
      }

      if (closeLinkModalBtn) {
        closeLinkModalBtn.addEventListener('click', () => this.closeLinkModal());
      }

      // Delete Modal Handlers
      const cancelDeleteBtn = document.getElementById('cancel-delete');
      const confirmDeleteBtn = document.getElementById('confirm-delete');
      const closeDeleteModalBtn = document.getElementById('close-delete-modal');

      if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());
      }

      if (closeDeleteModalBtn) {
        closeDeleteModalBtn.addEventListener('click', () => this.closeDeleteModal());
      }

      if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
          if (this.deleteCallback) {
            await this.deleteCallback();
            this.closeDeleteModal();
          }
        });
      }

      // Setup color pickers and icon picker
      this.setupColorPickers();
      this.setupIconPicker();
    }

    setupColorPickers() {
      const colors = ['blue-500', 'green-500', 'red-500', 'yellow-500', 'purple-500', 'pink-500', 'indigo-500', 'gray-500'];
      const colorClasses = {
        'blue-500': 'bg-blue-500',
        'green-500': 'bg-green-500',
        'red-500': 'bg-red-500',
        'yellow-500': 'bg-yellow-500',
        'purple-500': 'bg-purple-500',
        'pink-500': 'bg-pink-500',
        'indigo-500': 'bg-indigo-500',
        'gray-500': 'bg-gray-500'
      };

      // Card color picker
      const cardColorPicker = document.getElementById('color-picker');
      if (cardColorPicker) {
        cardColorPicker.innerHTML = colors.map(color => `
          <button type="button" class="color-option w-8 h-8 rounded ${colorClasses[color]} border-2 border-transparent hover:border-gray-400 dark:hover:border-gray-600" data-color="${color}"></button>
        `).join('');

        cardColorPicker.addEventListener('click', (e) => {
          const btn = e.target.closest('.color-option');
          if (btn) {
            const color = btn.dataset.color;
            document.getElementById('card-color').value = color;
            cardColorPicker.querySelectorAll('.color-option').forEach(b => {
              b.classList.toggle('ring-2', b === btn);
              b.classList.toggle('ring-blue-500', b === btn);
            });
          }
        });
      }

      // Link color picker
      const linkColorPicker = document.getElementById('link-color-picker');
      if (linkColorPicker) {
        linkColorPicker.innerHTML = colors.map(color => `
          <button type="button" class="link-color-option w-8 h-8 rounded ${colorClasses[color]} border-2 border-transparent hover:border-gray-400 dark:hover:border-gray-600" data-color="${color}"></button>
        `).join('');

        linkColorPicker.addEventListener('click', (e) => {
          const btn = e.target.closest('.link-color-option');
          if (btn) {
            const color = btn.dataset.color;
            document.getElementById('link-color').value = color;
            linkColorPicker.querySelectorAll('.link-color-option').forEach(b => {
              b.classList.toggle('ring-2', b === btn);
              b.classList.toggle('ring-blue-500', b === btn);
            });
          }
        });
      }
    }

    setupIconPicker() {
      const iconPicker = document.getElementById('icon-picker');
      if (!iconPicker || !window.MATERIAL_ICONS) return;

      // Popular icons for quick access
      const popularIcons = ['link', 'home', 'star', 'heart', 'bookmark', 'folder', 'document', 'globe-alt',
                           'shopping-cart', 'mail', 'phone', 'camera', 'photo', 'play', 'musical-note'];

      iconPicker.innerHTML = `
        <div class="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
          ${popularIcons.map(icon => `
            <button type="button" class="icon-option p-2 rounded border border-gray-200 hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800" data-icon="${icon}">
              <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                ${window.MATERIAL_ICONS[icon] || ''}
              </svg>
            </button>
          `).join('')}
        </div>
        <details class="mt-2">
          <summary class="text-sm text-gray-600 dark:text-neutral-400 cursor-pointer">More icons...</summary>
          <div class="grid grid-cols-8 gap-2 mt-2 max-h-48 overflow-y-auto">
            ${Object.keys(window.MATERIAL_ICONS).filter(icon => !popularIcons.includes(icon)).map(icon => `
              <button type="button" class="icon-option p-2 rounded border border-gray-200 hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800" data-icon="${icon}">
                <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  ${window.MATERIAL_ICONS[icon]}
                </svg>
              </button>
            `).join('')}
          </div>
        </details>
      `;

      iconPicker.addEventListener('click', (e) => {
        const btn = e.target.closest('.icon-option');
        if (btn) {
          const icon = btn.dataset.icon;
          document.getElementById('link-icon').value = icon;
          iconPicker.querySelectorAll('.icon-option').forEach(b => {
            b.classList.toggle('ring-2', b === btn);
            b.classList.toggle('ring-blue-500', b === btn);
            b.classList.toggle('bg-blue-50', b === btn);
            b.classList.toggle('dark:bg-blue-900', b === btn);
          });
        }
      });
    }

    showErrorState() {
      if (!this.grid) return;
      this.grid.innerHTML = `
        <div style="text-align:center; padding: 40px; color: var(--text-muted);">
          <h3>Dashboard Initialization Error</h3>
          <p>Please refresh the page or reset the extension.</p>
        </div>
      `;
    }

    // ----- Edit Mode -----
    toggleEditMode() {
      this.editMode = !this.editMode;
      if (this.editBtn) {
        this.editBtn.classList.toggle('active', this.editMode);
        this.editBtn.innerHTML = `
          <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
          </svg>
          ${this.editMode ? 'Editing' : 'Edit Mode'}
        `;
      }
      if (this.addBtn) {
        this.addBtn.classList.toggle('hidden', !this.editMode);
      }
      this.renderDashboard(); // re-render to show edit controls
    }

    // Card Modal Functions
    openCardModal(card = null) {
      this.currentCard = card;
      const modal = document.getElementById('card-modal');
      const modalTitle = document.getElementById('modal-title');
      const titleInput = document.getElementById('card-title');
      const colorInput = document.getElementById('card-color');

      if (modal) {
        // Set modal title
        if (modalTitle) {
          modalTitle.textContent = card ? 'Edit Card' : 'Add New Card';
        }

        // Set form values
        if (titleInput) {
          titleInput.value = card ? card.title : '';
        }

        if (colorInput) {
          colorInput.value = card ? card.color : 'blue-500';
        }

        // Update color picker selection
        const colorPicker = document.getElementById('color-picker');
        if (colorPicker) {
          const selectedColor = card ? card.color : 'blue-500';
          colorPicker.querySelectorAll('.color-option').forEach(btn => {
            const isSelected = btn.dataset.color === selectedColor;
            btn.classList.toggle('ring-2', isSelected);
            btn.classList.toggle('ring-blue-500', isSelected);
          });
        }

        // Open modal using Preline
        HSOverlay.open(modal);
      }
    }

    closeCardModal() {
      const modal = document.getElementById('card-modal');
      if (modal) {
        HSOverlay.close(modal);
      }
      this.currentCard = null;
    }

    async saveCardFromModal() {
      const titleInput = document.getElementById('card-title');
      const colorInput = document.getElementById('card-color');

      const title = titleInput?.value?.trim();
      if (!title) return;

      const color = colorInput?.value || 'blue-500';

      if (this.currentCard) {
        // Edit existing card
        this.currentCard.title = title;
        this.currentCard.color = color;
      } else {
        // Add new card
        const newCard = {
          id: 'card_' + Date.now().toString(36),
          title,
          color,
          order: (this.data.cards?.length || 0),
          links: []
        };
        this.data.cards.push(newCard);
      }

      this.touchData();
      await window.dashboardStorage.saveData(this.data);
      await this.renderDashboard();
      this.closeCardModal();
    }

    // Link Modal Functions
    openLinkModal(card, link = null) {
      this.currentCardForLink = card;
      this.currentLink = link;
      const modal = document.getElementById('link-modal');
      const modalTitle = document.getElementById('link-modal-title');
      const titleInput = document.getElementById('link-title');
      const urlInput = document.getElementById('link-url');
      const iconInput = document.getElementById('link-icon');
      const colorInput = document.getElementById('link-color');
      const filledInput = document.getElementById('link-filled');

      if (modal) {
        // Set modal title
        if (modalTitle) {
          modalTitle.textContent = link ? 'Edit Link' : 'Add Quick Link';
        }

        // Set form values
        if (titleInput) {
          titleInput.value = link ? link.title : '';
        }

        if (urlInput) {
          urlInput.value = link ? link.url : 'https://';
        }

        if (iconInput) {
          iconInput.value = link ? link.icon : 'link';
        }

        if (colorInput) {
          colorInput.value = link ? link.color : 'slate-500';
        }

        if (filledInput) {
          filledInput.value = link ? link.filled : 'false';
        }

        // Update color picker selection
        const colorPicker = document.getElementById('link-color-picker');
        if (colorPicker) {
          const selectedColor = link ? link.color : 'slate-500';
          colorPicker.querySelectorAll('.link-color-option').forEach(btn => {
            const isSelected = btn.dataset.color === selectedColor;
            btn.classList.toggle('ring-2', isSelected);
            btn.classList.toggle('ring-blue-500', isSelected);
          });
        }

        // Update icon style radio buttons
        const strokeRadio = document.getElementById('icon-style-stroke');
        const fillRadio = document.getElementById('icon-style-fill');
        if (strokeRadio && fillRadio) {
          if (link && link.filled) {
            fillRadio.checked = true;
          } else {
            strokeRadio.checked = true;
          }
        }

        // Update icon picker selection
        const iconPicker = document.getElementById('icon-picker');
        if (iconPicker) {
          const selectedIcon = link ? link.icon : 'link';
          iconPicker.querySelectorAll('.icon-option').forEach(btn => {
            const isSelected = btn.dataset.icon === selectedIcon;
            btn.classList.toggle('ring-2', isSelected);
            btn.classList.toggle('ring-blue-500', isSelected);
            btn.classList.toggle('bg-blue-50', isSelected);
            btn.classList.toggle('dark:bg-blue-900', isSelected);
          });
        }

        // Open modal using Preline
        HSOverlay.open(modal);
      }
    }

    closeLinkModal() {
      const modal = document.getElementById('link-modal');
      if (modal) {
        HSOverlay.close(modal);
      }
      this.currentCardForLink = null;
      this.currentLink = null;
    }

    async saveLinkFromModal() {
      const titleInput = document.getElementById('link-title');
      const urlInput = document.getElementById('link-url');
      const iconInput = document.getElementById('link-icon');
      const colorInput = document.getElementById('link-color');
      const fillRadio = document.getElementById('icon-style-fill');

      const title = titleInput?.value?.trim();
      const url = urlInput?.value?.trim();

      if (!title || !url) return;

      const icon = iconInput?.value || 'link';
      const color = colorInput?.value || 'slate-500';
      const filled = fillRadio?.checked || false;

      if (this.currentLink) {
        // Edit existing link
        this.currentLink.title = title;
        this.currentLink.url = url;
        this.currentLink.icon = icon;
        this.currentLink.color = color;
        this.currentLink.filled = filled;
      } else if (this.currentCardForLink) {
        // Add new link
        const newLink = {
          id: 'link_' + Date.now().toString(36),
          title,
          url,
          icon,
          color,
          filled,
          order: (this.currentCardForLink.links?.length || 0),
          subLinks: []
        };
        this.currentCardForLink.links = this.currentCardForLink.links || [];
        this.currentCardForLink.links.push(newLink);
      }

      this.touchData();
      await window.dashboardStorage.saveData(this.data);
      await this.renderDashboard();
      this.closeLinkModal();
    }

    // Delete Modal Functions
    openDeleteModal(message, callback) {
      this.deleteCallback = callback;
      const modal = document.getElementById('delete-modal');
      const messageElement = document.getElementById('delete-message');

      if (modal && messageElement) {
        messageElement.textContent = message;
        HSOverlay.open(modal);
      }
    }

    closeDeleteModal() {
      const modal = document.getElementById('delete-modal');
      if (modal) {
        HSOverlay.close(modal);
      }
      this.deleteCallback = null;
    }

    // ----- Rendering -----
    async renderDashboard() {
      if (!this.grid) return;
      this.grid.innerHTML = '';

      const cards = (this.data?.cards || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      for (const card of cards) {
        const el = this.createCardElement(card);
        this.grid.appendChild(el);
      }
    }

    createCardElement(card) {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70';
      cardDiv.dataset.cardId = card.id;
      cardDiv.dataset.dragType = 'card';

      const title = card.title || 'Untitled';
      const links = (card.links || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      // Map old color format to Tailwind classes
      const colorMap = {
        'blue-500': 'bg-blue-600',
        'green-500': 'bg-green-600',
        'red-500': 'bg-red-600',
        'yellow-500': 'bg-yellow-600',
        'purple-500': 'bg-purple-600',
        'pink-500': 'bg-pink-600',
        'indigo-500': 'bg-indigo-600',
        'gray-500': 'bg-gray-600'
      };
      const bgColor = colorMap[card.color] || 'bg-blue-600';

      cardDiv.innerHTML = `
        <div class="h-16 flex flex-col justify-center items-center ${bgColor} rounded-t-xl relative">
          <span class="block text-lg font-semibold text-white px-4 text-center">
            ${escapeHtml(title)}
          </span>
          ${this.editMode ? `
            <div class="absolute top-2 right-2 flex gap-1">
              <button class="edit-card p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white" title="Edit Card">
                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"></path>
                </svg>
              </button>
              <button class="delete-card p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white" title="Delete Card">
                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"></path>
                </svg>
              </button>
            </div>
          ` : ''}
        </div>

        <div class="p-4 md:p-6 flex-grow">
          <div class="card-links space-y-2"></div>
          ${this.editMode ? `
            <button class="add-link mt-4 w-full py-2 px-3 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-300">
              <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15"></path>
              </svg>
              Add Link
            </button>
          ` : ''}
        </div>
      `;

      // Wire links
      const linksContainer = $('.card-links', cardDiv);
      links.forEach(link => {
        const linkEl = this.createLinkElement(card, link);
        linksContainer.appendChild(linkEl);
      });

      // Edit actions
      if (this.editMode) {
        $('.edit-card', cardDiv)?.addEventListener('click', () => this.openCardModal(card));
        $('.delete-card', cardDiv)?.addEventListener('click', () => this.deleteCard(card));
        $('.add-link', cardDiv)?.addEventListener('click', () => this.openLinkModal(card));
      }

      return cardDiv;
    }

    createLinkElement(card, link) {
      const linkDiv = document.createElement('div');
      linkDiv.className = 'flex group/link';
      linkDiv.dataset.linkId = link.id;
      linkDiv.dataset.dragType = 'link';

      // Check if link has sub-links
      const hasSubLinks = link.subLinks && link.subLinks.length > 0;

      // Get icon from link data or use default
      const iconName = link.icon || 'link';
      const iconHtml = window.HeroIcons?.[iconName] || window.HeroIcons?.link || `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"></path>
        </svg>
      `;

      // Determine icon color classes
      const colorClasses = link.color ? `text-${link.color}` : 'text-gray-600 dark:text-neutral-400';

      if (hasSubLinks) {
        // Create split button structure for links with sub-links
        linkDiv.innerHTML = `
          <a href="${link.url || '#'}" target="_blank" rel="noopener noreferrer"
             class="relative flex-1 py-2.5 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-s-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800">
            <span class="size-4 ${colorClasses}">${iconHtml}</span>
            <span>${escapeHtml(link.title || 'Link')}</span>
          </a>
          <div class="hs-dropdown relative [--placement:bottom-right] inline-flex">
            <button type="button" class="hs-dropdown-toggle relative -ms-px py-2.5 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-e-lg border border-gray-200 bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
              <svg class="hs-dropdown-open:rotate-180 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6"></path>
              </svg>
            </button>
            <div class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-60 bg-white shadow-md rounded-lg mt-2 dark:bg-neutral-800 dark:border dark:border-neutral-700 z-50">
              <div class="p-1 space-y-0.5">
                ${(link.subLinks || []).map(subLink => `
                  <a href="${subLink.url || '#'}" target="_blank" rel="noopener noreferrer"
                     class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700">
                    ${escapeHtml(subLink.title || 'Sub-link')}
                  </a>
                `).join('')}
              </div>
            </div>
          </div>
          ${this.editMode ? `
            <div class="flex items-center ms-2 opacity-0 group-hover/link:opacity-100 transition-opacity">
              <button class="edit-link p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-400" title="Edit Link">
                <svg class="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"></path>
                </svg>
              </button>
              <button class="delete-link p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-400" title="Delete Link">
                <svg class="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"></path>
                </svg>
              </button>
            </div>
          ` : ''}
        `;
      } else {
        // Simple button for links without sub-links
        linkDiv.innerHTML = `
          <a href="${link.url || '#'}" target="_blank" rel="noopener noreferrer"
             class="flex-1 py-2.5 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800">
            <span class="size-4 ${colorClasses}">${iconHtml}</span>
            <span>${escapeHtml(link.title || 'Link')}</span>
          </a>
          ${this.editMode ? `
            <div class="flex items-center ms-2 opacity-0 group-hover/link:opacity-100 transition-opacity">
              <button class="edit-link p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-400" title="Edit Link">
                <svg class="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"></path>
                </svg>
              </button>
              <button class="delete-link p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-400" title="Delete Link">
                <svg class="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"></path>
                </svg>
              </button>
            </div>
          ` : ''}
        `;
      }

      if (this.editMode) {
        $('.edit-link', linkDiv)?.addEventListener('click', (e) => {
          e.preventDefault();
          this.openLinkModal(card, link);
        });
        $('.delete-link', linkDiv)?.addEventListener('click', async (e) => {
          e.preventDefault();
          await this.deleteLink(card, link);
        });
      }

      // Re-initialize Preline dropdowns after adding new elements
      if (hasSubLinks && window.HSDropdown) {
        setTimeout(() => {
          window.HSDropdown.autoInit();
        }, 0);
      }

      return linkDiv;
    }

    // ----- Card CRUD -----

    async deleteCard(card) {
      this.openDeleteModal(`Delete card "${card.title}"?`, async () => {
        this.data.cards = (this.data.cards || []).filter(c => c.id !== card.id);
        // Reassign order
        this.data.cards.forEach((c, idx) => (c.order = idx));
        this.touchData();
        await window.dashboardStorage.saveData(this.data);
        await this.renderDashboard();
      });
    }

    // ----- Link CRUD -----

    async deleteLink(card, link) {
      this.openDeleteModal(`Delete link "${link.title}"?`, async () => {
        card.links = (card.links || []).filter(l => l.id !== link.id);
        // Reassign orders
        (card.links || []).forEach((l, idx) => (l.order = idx));
        this.touchData();
        await window.dashboardStorage.saveData(this.data);
        await this.renderDashboard();
      });
    }

    // ----- Reorder/move helpers used by DragDropManager -----
    async reorderCards(newCardIdOrder) {
      // newCardIdOrder: [cardId, cardId, ...]
      const map = new Map(newCardIdOrder.map((id, idx) => [id, idx]));
      (this.data.cards || []).forEach((c) => {
        if (map.has(c.id)) c.order = map.get(c.id);
      });
      this.touchData();
      await window.dashboardStorage.saveData(this.data);
    }

    async reorderLinks(cardId, newLinkIdOrder) {
      const card = (this.data.cards || []).find(c => c.id === cardId);
      if (!card) return;
      const map = new Map(newLinkIdOrder.map((id, idx) => [id, idx]));
      (card.links || []).forEach((l) => {
        if (map.has(l.id)) l.order = map.get(l.id);
      });
      // Sort by new order
      card.links.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      this.touchData();
      await window.dashboardStorage.saveData(this.data);
    }

    async moveLinkToCard(linkId, fromCardId, toCardId, newIndex = null) {
      if (fromCardId === toCardId) return;

      const fromCard = (this.data.cards || []).find(c => c.id === fromCardId);
      const toCard = (this.data.cards || []).find(c => c.id === toCardId);
      if (!fromCard || !toCard) return;

      const idx = (fromCard.links || []).findIndex(l => l.id === linkId);
      if (idx === -1) return;

      const [link] = fromCard.links.splice(idx, 1);
      toCard.links = toCard.links || [];

      if (newIndex === null || newIndex < 0 || newIndex > toCard.links.length) {
        toCard.links.push(link);
      } else {
        toCard.links.splice(newIndex, 0, link);
      }

      // Reassign orders
      (fromCard.links || []).forEach((l, i) => (l.order = i));
      (toCard.links || []).forEach((l, i) => (l.order = i));

      this.touchData();
      await window.dashboardStorage.saveData(this.data);
    }

    // ----- Misc -----
    touchData() {
      // marker to ensure lastModified is updated by storage
      if (!this.data) this.data = { cards: [] };
    }
  }

  // ---------- Helpers ----------
  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // ---------- Boot ----------
  function boot() {
    // Expose globally so DragDropManager can call render/reorder methods
    window.dashboardApp = new BookmarkDashboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
