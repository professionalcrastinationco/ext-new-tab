/* dragdrop.js
 * Drag and Drop for cards and links
 * - Works with newtab.js BookmarkDashboard via window.dashboardApp
 * - Uses dataset: data-drag-type, data-card-id, data-link-id
 */

(function () {
  class DragDropManager {
    constructor() {
      this.draggedElement = null;
      this.draggedType = null; // 'card' | 'link'
      this.draggedData = null; // { cardId?, linkId? }
      this.currentDropTarget = null;

      this.init();
    }

    init() {
      document.addEventListener('dragstart', this.handleDragStart.bind(this));
      document.addEventListener('dragend', this.handleDragEnd.bind(this));
      document.addEventListener('dragover', this.handleDragOver.bind(this));
      document.addEventListener('dragenter', this.handleDragEnter.bind(this));
      document.addEventListener('dragleave', this.handleDragLeave.bind(this));
      document.addEventListener('drop', this.handleDrop.bind(this));
    }

    // ---------- General ----------
    getDropTarget(el) {
      if (!el) return null;
      return el.closest('.bookmark-card, .quick-link');
    }

    isValidDropTarget(target) {
      if (!target) return false;
      // Cards can be dropped on other cards (reorder)
      if (this.draggedType === 'card') {
        return target.classList.contains('bookmark-card');
      }
      // Links can be dropped:
      // - on a link (reorder within same card)
      // - on a card (move into that card)
      if (this.draggedType === 'link') {
        return target.classList.contains('quick-link') || target.classList.contains('bookmark-card');
      }
      return false;
    }

    // ---------- Events ----------
    handleDragStart(e) {
      const handle = e.target.closest('[data-drag-type]');
      if (!handle) return;

      this.draggedElement = handle;
      this.draggedType = handle.dataset.dragType;

      if (this.draggedType === 'card') {
        this.draggedData = {
          type: 'card',
          cardId: handle.dataset.cardId
        };
      } else if (this.draggedType === 'link') {
        const cardEl = handle.closest('.bookmark-card');
        this.draggedData = {
          type: 'link',
          linkId: handle.dataset.linkId,
          fromCardId: cardEl?.dataset.cardId
        };
      }

      // Visual feedback
      handle.classList.add('dragging');

      // Drag meta
      e.dataTransfer.effectAllowed = 'move';
      try {
        e.dataTransfer.setData('text/plain', JSON.stringify(this.draggedData));
      } catch (_) {}

      // If the element is a link, prevent default navigation on accidental click after drag
      if (this.draggedType === 'link') {
        handle.addEventListener('click', this.preventClickAfterDrag, { once: true });
      }
    }

    handleDragEnd() {
      if (this.draggedElement) {
        this.draggedElement.classList.remove('dragging');
      }
      if (this.currentDropTarget) {
        this.currentDropTarget.classList.remove('drag-over');
      }
      this.draggedElement = null;
      this.draggedType = null;
      this.draggedData = null;
      this.currentDropTarget = null;
    }

    handleDragOver(e) {
      if (!this.draggedElement) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
      if (!this.draggedElement) return;

      const dropTarget = this.getDropTarget(e.target);
      if (dropTarget && this.isValidDropTarget(dropTarget)) {
        if (this.currentDropTarget && this.currentDropTarget !== dropTarget) {
          this.currentDropTarget.classList.remove('drag-over');
        }
        this.currentDropTarget = dropTarget;
        dropTarget.classList.add('drag-over');
      }
    }

    handleDragLeave(e) {
      const dropTarget = this.getDropTarget(e.target);
      if (dropTarget && !dropTarget.contains(e.relatedTarget)) {
        dropTarget.classList.remove('drag-over');
        if (this.currentDropTarget === dropTarget) {
          this.currentDropTarget = null;
        }
      }
    }

    async handleDrop(e) {
      if (!this.draggedElement || !this.draggedData) return;
      e.preventDefault();

      const dropTarget = this.getDropTarget(e.target);
      if (!dropTarget || !this.isValidDropTarget(dropTarget)) return;

      dropTarget.classList.remove('drag-over');

      try {
        if (this.draggedType === 'card') {
          await this.handleCardDrop(dropTarget);
        } else if (this.draggedType === 'link') {
          await this.handleLinkDrop(dropTarget, e);
        }
      } catch (err) {
        console.error('Drop error:', err);
      } finally {
        // Force refresh
        await this.forceRefreshDashboard();
      }
    }

    preventClickAfterDrag(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // ---------- Card drop logic ----------
    async handleCardDrop(dropTarget) {
      // Reorder cards based on visual order in grid
      const grid = document.getElementById('dashboard-grid');
      if (!grid) return;

      // If dropping on a card, we’ll move dragged card before/after it,
      // but since browser doesn't tell us "before/after" reliably here,
      // we recompute from the DOM after drop: swap the nodes right now.
      const dragged = this.draggedElement;
      if (dragged === dropTarget) return;

      // Decide placement: insert before if coming from above, otherwise after.
      const draggedRect = dragged.getBoundingClientRect();
      const targetRect = dropTarget.getBoundingClientRect();
      const insertBefore = draggedRect.top < targetRect.top;

      if (insertBefore) {
        grid.insertBefore(dragged, dropTarget);
      } else {
        grid.insertBefore(dragged, dropTarget.nextSibling);
      }

      // Build new order from DOM
      const newOrder = Array.from(grid.querySelectorAll('.bookmark-card'))
        .map((el) => el.dataset.cardId);

      if (window.dashboardApp?.reorderCards) {
        await window.dashboardApp.reorderCards(newOrder);
      }
    }

    // ---------- Link drop logic ----------
    async handleLinkDrop(dropTarget, e) {
      const dragged = this.draggedElement;
      const { linkId, fromCardId } = this.draggedData || {};
      if (!linkId || !fromCardId) return;

      // If dropping on a link (reorder within same card or move to its card),
      // If dropping on a card (move link into that card, to the end)
      if (dropTarget.classList.contains('quick-link')) {
        const toCardEl = dropTarget.closest('.bookmark-card');
        const toCardId = toCardEl?.dataset.cardId;
        const linkList = Array.from(toCardEl.querySelectorAll('.quick-link'));

        // Decide index to insert: before or after target depending on cursor Y
        const targetRect = dropTarget.getBoundingClientRect();
        const insertBefore = (e.clientY - targetRect.top) < targetRect.height / 2;
        const targetIndex = linkList.findIndex((el) => el === dropTarget);
        let newIndex = insertBefore ? targetIndex : targetIndex + 1;

        // If dragging within same card, reorder; else move between cards
        if (toCardId === fromCardId) {
          // Reorder within same card
          const idOrder = linkList.map((el) => el.dataset.linkId).filter(Boolean);

          // Mutate order to move dragged link to newIndex
          const oldIndex = idOrder.indexOf(linkId);
          if (oldIndex !== -1) {
            idOrder.splice(oldIndex, 1);
            if (newIndex > idOrder.length) newIndex = idOrder.length;
            idOrder.splice(newIndex, 0, linkId);
          }

          if (window.dashboardApp?.reorderLinks) {
            await window.dashboardApp.reorderLinks(fromCardId, idOrder);
          }
        } else {
          // Move to different card at computed index
          if (window.dashboardApp?.moveLinkToCard) {
            await window.dashboardApp.moveLinkToCard(linkId, fromCardId, toCardId, newIndex);
          }
        }
      } else if (dropTarget.classList.contains('bookmark-card')) {
        // Move to the end of this card
        const toCardId = dropTarget.dataset.cardId;
        if (window.dashboardApp?.moveLinkToCard) {
          await window.dashboardApp.moveLinkToCard(linkId, fromCardId, toCardId, null);
        }
      }
    }

    // ---------- Refresh ----------
    async forceRefreshDashboard() {
      try {
        if (window.dashboardStorage && window.dashboardApp) {
          const fresh = await window.dashboardStorage.loadData();
          window.dashboardApp.data = fresh;
          await window.dashboardApp.renderDashboard();
        } else {
          // fallback hard reload
          window.location.reload();
        }
      } catch (e) {
        console.warn('Refresh failed, reloading page:', e);
        window.location.reload();
      }
    }
  }

  // Boot once per page
  if (!window.dragDropManager) {
    window.dragDropManager = new DragDropManager();
  }
})();
