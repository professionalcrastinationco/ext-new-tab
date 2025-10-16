// Existing hamburger menu functionality
const hamburgerMenu = document.getElementById('hamburgerMenu');
const settingsPanel = document.getElementById('settingsPanel');
const settingsOverlay = document.getElementById('settingsOverlay');
const flipAllToggle = document.getElementById('flipAllToggle');
const dragDropToggle = document.getElementById('dragDropToggle');
const showCardNamesToggle = document.getElementById('showCardNamesToggle');
const clearOnClickToggle = document.getElementById('clearOnClickToggle');
const flipContainer = document.querySelector('.flip-container');

// Toggle settings panel
hamburgerMenu.addEventListener('click', function() {
    hamburgerMenu.classList.toggle('active');
    settingsPanel.classList.toggle('active');
    settingsOverlay.classList.toggle('active');
});

// Close settings when clicking overlay
settingsOverlay.addEventListener('click', function() {
    hamburgerMenu.classList.remove('active');
    settingsPanel.classList.remove('active');
    settingsOverlay.classList.remove('active');
});

// Flip all cards toggle
flipAllToggle.addEventListener('change', function() {
    if (this.checked) {
        flipContainer.classList.add('show-all-backs');
    } else {
        flipContainer.classList.remove('show-all-backs');
    }
});

// Load saved state from localStorage
const savedFlipState = localStorage.getItem('flipAllCards');
if (savedFlipState === 'true') {
    flipAllToggle.checked = true;
    flipContainer.classList.add('show-all-backs');
}

// Save state to localStorage
flipAllToggle.addEventListener('change', function() {
    localStorage.setItem('flipAllCards', this.checked);
});

// Show Card Names toggle - save to localStorage
showCardNamesToggle.addEventListener('change', function() {
    localStorage.setItem('showCardNames', this.checked);
});

// Load saved Show Card Names state
const savedShowCardNames = localStorage.getItem('showCardNames');
if (savedShowCardNames !== null) {
    showCardNamesToggle.checked = savedShowCardNames === 'true';
} else {
    // Default to true
    showCardNamesToggle.checked = true;
    localStorage.setItem('showCardNames', 'true');
}

// Clear on Click toggle - save to localStorage
clearOnClickToggle.addEventListener('change', function() {
    localStorage.setItem('clearOnClick', this.checked);
});

// Load saved Clear on Click state
const savedClearOnClick = localStorage.getItem('clearOnClick');
if (savedClearOnClick !== null) {
    clearOnClickToggle.checked = savedClearOnClick === 'true';
} else {
    // Default to false
    clearOnClickToggle.checked = false;
    localStorage.setItem('clearOnClick', 'false');
}

// ============ DRAG & DROP FUNCTIONALITY ============

// Drag & Drop state
let draggedElement = null;
let draggedType = null; // 'card' or 'bookmark'
let sourceCardId = null;
let draggedBookmarkId = null;

// Drag & Drop toggle
dragDropToggle.addEventListener('change', function() {
    if (this.checked) {
        // Enable drag & drop mode
        flipContainer.classList.add('show-all-backs');
        flipContainer.classList.add('drag-mode');
        localStorage.setItem('dragDropMode', 'true');
        initializeDragDrop();
    } else {
        // Disable drag & drop mode
        flipContainer.classList.remove('drag-mode');
        localStorage.setItem('dragDropMode', 'false');
        removeDragDrop();

        // Trigger JSON download after all changes are complete
        if (typeof window.downloadUpdatedJSON === 'function') {
            window.downloadUpdatedJSON();
        }
    }
});

// Load saved drag & drop state
const savedDragDropState = localStorage.getItem('dragDropMode');
if (savedDragDropState === 'true') {
    dragDropToggle.checked = true;
    flipContainer.classList.add('show-all-backs');
    flipContainer.classList.add('drag-mode');
}

// Initialize drag & drop functionality
function initializeDragDrop() {
    // Make cards draggable
    const cards = document.querySelectorAll('.flip');
    cards.forEach(card => {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', handleCardDragStart);
        card.addEventListener('dragover', handleCardDragOver);
        card.addEventListener('drop', handleCardDrop);
        card.addEventListener('dragend', handleDragEnd);
        card.addEventListener('dragenter', handleDragEnter);
        card.addEventListener('dragleave', handleDragLeave);
    });

    // Make bookmarks draggable
    const bookmarks = document.querySelectorAll('.link-item');
    bookmarks.forEach(bookmark => {
        bookmark.setAttribute('draggable', 'true');
        bookmark.addEventListener('dragstart', handleBookmarkDragStart);
        bookmark.addEventListener('dragover', handleBookmarkDragOver);
        bookmark.addEventListener('drop', handleBookmarkDrop);
        bookmark.addEventListener('dragend', handleDragEnd);
    });

    // Make columns drop zones for bookmarks
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        column.addEventListener('dragover', handleColumnDragOver);
        column.addEventListener('drop', handleColumnDrop);
        column.addEventListener('dragenter', handleColumnDragEnter);
        column.addEventListener('dragleave', handleColumnDragLeave);
    });
}

// Remove drag & drop functionality
function removeDragDrop() {
    // Remove draggable from cards
    const cards = document.querySelectorAll('.flip');
    cards.forEach(card => {
        card.removeAttribute('draggable');
        card.removeEventListener('dragstart', handleCardDragStart);
        card.removeEventListener('dragover', handleCardDragOver);
        card.removeEventListener('drop', handleCardDrop);
        card.removeEventListener('dragend', handleDragEnd);
        card.removeEventListener('dragenter', handleDragEnter);
        card.removeEventListener('dragleave', handleDragLeave);
    });

    // Remove draggable from bookmarks
    const bookmarks = document.querySelectorAll('.link-item');
    bookmarks.forEach(bookmark => {
        bookmark.removeAttribute('draggable');
        bookmark.removeEventListener('dragstart', handleBookmarkDragStart);
        bookmark.removeEventListener('dragover', handleBookmarkDragOver);
        bookmark.removeEventListener('drop', handleBookmarkDrop);
        bookmark.removeEventListener('dragend', handleDragEnd);
    });

    // Remove column drop zones
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        column.removeEventListener('dragover', handleColumnDragOver);
        column.removeEventListener('drop', handleColumnDrop);
        column.removeEventListener('dragenter', handleColumnDragEnter);
        column.removeEventListener('dragleave', handleColumnDragLeave);
    });
}

// ============ CARD DRAG HANDLERS ============

function handleCardDragStart(e) {
    draggedElement = this;
    draggedType = 'card';
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleCardDragOver(e) {
    if (draggedType === 'card') {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }
}

function handleCardDrop(e) {
    if (draggedType === 'card') {
        e.stopPropagation();
        e.preventDefault();

        if (draggedElement !== this) {
            // Get all cards
            const allCards = Array.from(flipContainer.querySelectorAll('.flip'));
            const draggedIndex = allCards.indexOf(draggedElement);
            const targetIndex = allCards.indexOf(this);

            // Reorder in DOM
            if (draggedIndex < targetIndex) {
                this.parentNode.insertBefore(draggedElement, this.nextSibling);
            } else {
                this.parentNode.insertBefore(draggedElement, this);
            }

            // Update order in bookmarksData
            updateCardOrder();
        }
        return false;
    }
}

function handleDragEnter(e) {
    if (draggedType === 'card' && this !== draggedElement) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

// ============ BOOKMARK DRAG HANDLERS ============

function handleBookmarkDragStart(e) {
    draggedElement = this;
    draggedType = 'bookmark';
    this.classList.add('dragging');

    // Find the card this bookmark belongs to
    const card = this.closest('.flip');
    const cardBack = card.querySelector('.back');
    sourceCardId = getCardIdFromElement(card);
    draggedBookmarkId = this.dataset.modalId || getBookmarkIdFromElement(this);

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    e.stopPropagation(); // Prevent card drag
}

function handleBookmarkDragOver(e) {
    if (draggedType === 'bookmark' && e.target.classList.contains('link-item')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }
}

function handleBookmarkDrop(e) {
    if (draggedType === 'bookmark' && draggedElement !== this) {
        e.stopPropagation();
        e.preventDefault();

        const column = this.parentElement;
        const allBookmarks = Array.from(column.querySelectorAll('.link-item'));
        const draggedIndex = allBookmarks.indexOf(draggedElement);
        const targetIndex = allBookmarks.indexOf(this);

        // Reorder in DOM
        if (draggedIndex < targetIndex) {
            column.insertBefore(draggedElement, this.nextSibling);
        } else {
            column.insertBefore(draggedElement, this);
        }

        // Update bookmarks data
        updateBookmarkOrder();
        return false;
    }
}

// ============ COLUMN DROP HANDLERS ============

function handleColumnDragOver(e) {
    if (draggedType === 'bookmark') {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
}

function handleColumnDrop(e) {
    if (draggedType === 'bookmark') {
        e.preventDefault();
        e.stopPropagation();

        // Add bookmark to this column
        this.appendChild(draggedElement);

        // Update bookmarks data
        updateBookmarkOrder();
    }
}

function handleColumnDragEnter(e) {
    if (draggedType === 'bookmark' && e.target.classList.contains('column')) {
        this.classList.add('drag-over');
    }
}

function handleColumnDragLeave(e) {
    if (e.target.classList.contains('column')) {
        this.classList.remove('drag-over');
    }
}

// ============ COMMON DRAG HANDLERS ============

function handleDragEnd(e) {
    this.classList.remove('dragging');

    // Remove all drag-over classes
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });

    // Reset drag state
    draggedElement = null;
    draggedType = null;
    sourceCardId = null;
    draggedBookmarkId = null;
}

// ============ DATA UPDATE FUNCTIONS ============

function updateCardOrder() {
    if (!bookmarksData || !bookmarksData.cards) return;

    // Get current order of cards in DOM
    const cardElements = Array.from(flipContainer.querySelectorAll('.flip'));

    // Update order property for each card
    cardElements.forEach((cardElement, index) => {
        const cardId = getCardIdFromElement(cardElement);
        const card = bookmarksData.cards.find(c => c.id === cardId);
        if (card) {
            card.order = index + 1;
        }
    });

    console.log('✅ Card order updated');
}

function updateBookmarkOrder() {
    if (!bookmarksData || !bookmarksData.cards) return;

    // Iterate through all cards
    const cardElements = Array.from(flipContainer.querySelectorAll('.flip'));

    cardElements.forEach(cardElement => {
        const cardId = getCardIdFromElement(cardElement);
        const card = bookmarksData.cards.find(c => c.id === cardId);

        if (card) {
            // Get columns in this card
            const columns = cardElement.querySelectorAll('.column');
            const newBookmarks = [];

            columns.forEach(column => {
                const bookmarkElements = column.querySelectorAll('.link-item');
                bookmarkElements.forEach(bookmarkElement => {
                    const bookmarkId = bookmarkElement.dataset.modalId || getBookmarkIdFromElement(bookmarkElement);

                    // Find bookmark in original data (search in all cards)
                    let foundBookmark = null;
                    for (const c of bookmarksData.cards) {
                        foundBookmark = c.bookmarks.find(b => b.id === bookmarkId);
                        if (foundBookmark) break;
                    }

                    if (foundBookmark && !newBookmarks.find(b => b.id === bookmarkId)) {
                        newBookmarks.push(foundBookmark);
                    }
                });
            });

            // Update card's bookmarks array
            card.bookmarks = newBookmarks;
        }
    });

    console.log('✅ Bookmark order updated');
}

// Helper function to get card ID from element
function getCardIdFromElement(cardElement) {
    const title = cardElement.querySelector('.front h1')?.textContent.trim();
    if (!title) return null;

    // Find card by title
    const card = bookmarksData.cards.find(c => c.title === title);
    return card ? card.id : null;
}

// Helper function to get bookmark ID from element
function getBookmarkIdFromElement(bookmarkElement) {
    const label = bookmarkElement.querySelector('a')?.textContent.trim();
    if (!label) return null;

    // Find bookmark by label in all cards
    for (const card of bookmarksData.cards) {
        const bookmark = card.bookmarks.find(b => b.label === label);
        if (bookmark) return bookmark.id;
    }
    return null;
}

// ============ DATA LOADING SYSTEM ============

// Global state variable for bookmarks data
let bookmarksData = null;

// Load bookmarks data from JSON file
async function loadBookmarksData() {
    try {
        const response = await fetch('assets/data/bookmarks.json');
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Bookmarks file not found. Make sure assets/data/bookmarks.json exists.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        bookmarksData = await response.json();

        // Validate data structure
        if (!bookmarksData || !bookmarksData.cards || !Array.isArray(bookmarksData.cards)) {
            throw new Error('Invalid JSON structure: missing cards array');
        }

        console.log('✅ Bookmarks data loaded successfully:', bookmarksData.cards.length, 'cards');
        return true;
    } catch (error) {
        console.error('❌ Failed to load bookmarks data:', error);
        const container = document.querySelector('.flip-container');
        if (container) {
            container.innerHTML = `
                <div style="color: #dc2626; text-align: center; padding: 2rem;">
                    <h2>Failed to Load Bookmarks</h2>
                    <p>${error.message}</p>
                    <p>Check the browser console for details.</p>
                </div>
            `;
        }
        return false;
    }
}

// ============ DYNAMIC RENDERING FUNCTIONS ============

// Render bookmark icon based on type
function renderBookmarkIcon(bookmark) {
    if (!bookmark.iconType || !bookmark.icon) {
        return `<div class="bookmark-emoji">🔗</div>`;
    }

    switch (bookmark.iconType) {
        case 'emoji':
            return `<div class="bookmark-emoji">${bookmark.icon}</div>`;
        case 'local':
            return `<div class="bookmark-emoji"><img src="/assets/icons_logos/${bookmark.icon}" alt="${bookmark.label}" onerror="this.parentElement.innerHTML='🔗'" style="width: 2rem; height: 2rem; object-fit: contain;"></div>`;
        case 'url':
            return `<div class="bookmark-emoji"><img src="${bookmark.icon}" alt="${bookmark.label}" onerror="this.parentElement.innerHTML='🔗'" style="width: 2rem; height: 2rem; object-fit: contain;"></div>`;
        case 'lucide':
            return `<div class="bookmark-emoji"><i data-lucide="${bookmark.icon}" style="width: 2rem; height: 2rem;"></i></div>`;
        default:
            return `<div class="bookmark-emoji">🔗</div>`;
    }
}

// Render bookmark tags
function renderBookmarkTags(tags) {
    return tags.map(tag => `<span class="tag">${tag}</span>`).join('');
}

// Render individual bookmark
function renderBookmark(bookmark) {
    // Validate required fields
    if (!bookmark.id || !bookmark.label || !bookmark.url) {
        console.warn('Skipping invalid bookmark:', bookmark);
        return '';
    }

    const hasChildren = bookmark.children && bookmark.children.length > 0;
    const modalAttr = hasChildren ? `data-modal-id="${bookmark.id}"` : '';
    const modalIndicator = hasChildren ? `<span class="modal-indicator">▼</span>` : '';

    return `
        <div class="link-item" ${modalAttr}>
            ${renderBookmarkIcon(bookmark)}
            <div class="bookmark-content">
                <a href="${bookmark.url}" target="_blank">${bookmark.label}</a>
                ${modalIndicator}
            </div>
        </div>
    `;
}

// Render complete card
function renderCard(card) {
    // Skip disabled cards
    if (!card.enabled) return '';

    // Split bookmarks into two columns
    const bookmarks = card.bookmarks;
    const midpoint = Math.ceil(bookmarks.length / 2);
    const column1 = bookmarks.slice(0, midpoint);
    const column2 = bookmarks.slice(midpoint);

    return `
        <div class="flip" data-pattern="${card.pattern}">
            <div class="front">
                <h1 class="text-shadow">${card.title}</h1>
                <p>${card.description}</p>
            </div>
            <div class="back back-two-columns layout-grid">
                <div class="columns-wrapper">
                    <div class="column">
                        ${column1.map(bookmark => renderBookmark(bookmark)).join('')}
                    </div>
                    <div class="column">
                        ${column2.map(bookmark => renderBookmark(bookmark)).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render all cards
function renderAllCards() {
    const container = document.querySelector('.flip-container');
    if (!container || !bookmarksData) return;

    // Sort cards by order
    const sortedCards = [...bookmarksData.cards].sort((a, b) => a.order - b.order);

    // Render all cards
    const cardsHTML = sortedCards.map(card => renderCard(card)).join('');
    container.innerHTML = cardsHTML;

    console.log('✅ Rendered', sortedCards.length, 'cards');

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

// Build modal data from JSON
function buildModalData() {
    const modalData = {};

    if (!bookmarksData) return modalData;

    bookmarksData.cards.forEach(card => {
        card.bookmarks.forEach(bookmark => {
            if (bookmark.children && bookmark.children.length > 0) {
                modalData[bookmark.id] = {
                    title: bookmark.label,
                    pattern: card.pattern,
                    columns: 3,
                    interactionType: 'click',
                    links: bookmark.children.map(child => ({
                        label: child.label,
                        url: child.url
                    }))
                };
            }
        });
    });

    return modalData;
}

// ============ MODAL SYSTEM ============

// Modal elements
const modalOverlay = document.getElementById('modalOverlay');
const modalContainer = document.getElementById('modalContainer');
const modalContent = document.getElementById('modalContent');

let currentModal = null;
let currentLockedCard = null;
let closeTimeout = null;
let isMouseInModal = false;
let modalClickHandler = null;

// Mouse event handlers for modal
function modalMouseEnter() {
    isMouseInModal = true;
    // Clear any pending close timeout when mouse enters modal
    if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
    }
}

function modalMouseLeave() {
    isMouseInModal = false;
    // Close modal after delay when mouse leaves
    closeSubBookmarkModal(false);
}

// ============ SMART POSITIONING HELPER FUNCTIONS ============

// Detect which quadrant of the viewport the element is in
function detectQuadrant(element) {
    const rect = element.getBoundingClientRect();
    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    const isTop = elementCenterY < viewportCenterY;
    const isLeft = elementCenterX < viewportCenterX;

    if (isTop && isLeft) return 'top-left';
    if (isTop && !isLeft) return 'top-right';
    if (!isTop && isLeft) return 'bottom-left';
    return 'bottom-right';
}

// Enforce viewport boundaries with minimum padding
function enforceViewportBounds(position, modalWidth, modalHeight) {
    const minPadding = 20;
    const maxRight = window.innerWidth - modalWidth - minPadding;
    const maxBottom = window.innerHeight - modalHeight - minPadding;

    // Adjust position to stay within bounds
    position.left = Math.max(minPadding, Math.min(position.left, maxRight));
    position.top = Math.max(minPadding, Math.min(position.top, maxBottom));

    return position;
}

// Calculate smart modal position based on element location
function calculateModalPosition(linkItem) {
    // On mobile, use centered positioning (CSS will handle it)
    if (window.innerWidth < 768) {
        return null;
    }

    const rect = linkItem.getBoundingClientRect();
    const quadrant = detectQuadrant(linkItem);
    const offset = 12; // Gap between element and modal

    // Temporarily show modal to measure its dimensions
    modalContainer.style.opacity = '0';
    modalContainer.style.visibility = 'hidden';
    modalContainer.style.display = 'block';

    const modalRect = modalContainer.getBoundingClientRect();
    const modalWidth = modalRect.width;
    const modalHeight = modalRect.height;

    // Hide it again
    modalContainer.style.display = '';
    modalContainer.style.opacity = '';
    modalContainer.style.visibility = '';

    let position = { top: 0, left: 0, transformOrigin: '' };

    // Calculate position based on quadrant
    switch (quadrant) {
        case 'top-left':
            // Modal appears to bottom-right of element
            position.top = rect.bottom + offset;
            position.left = rect.right + offset;
            position.transformOrigin = 'top left';
            break;
        case 'top-right':
            // Modal appears to bottom-left of element
            position.top = rect.bottom + offset;
            position.left = rect.left - modalWidth - offset;
            position.transformOrigin = 'top right';
            break;
        case 'bottom-left':
            // Modal appears to top-right of element
            position.top = rect.top - modalHeight - offset;
            position.left = rect.right + offset;
            position.transformOrigin = 'bottom left';
            break;
        case 'bottom-right':
            // Modal appears to top-left of element
            position.top = rect.top - modalHeight - offset;
            position.left = rect.left - modalWidth - offset;
            position.transformOrigin = 'bottom right';
            break;
    }

    // Apply boundary protection
    position = enforceViewportBounds(position, modalWidth, modalHeight);

    return position;
}

// Function to create modal content
function createModalContent(data) {
    const columnsClass = `modal-columns-${data.columns || 3}`;

    let linksHTML = data.links.map(link => `
        <div class="modal-link-item">
            <a href="${link.url}" target="_blank">${link.label}</a>
        </div>
    `).join('');

    return `
        <h2>${data.title}</h2>
        <div class="modal-links ${columnsClass}">
            ${linksHTML}
        </div>
    `;
}

// Show modal on click (using dynamic modal data)
function showModalClick(modalId, linkItem, modalData) {
    // If clicking the same modal that's already open, close it (toggle behavior)
    if (currentModal === modalId) {
        closeSubBookmarkModal(true);
        return;
    }

    // Close any other existing modal first
    if (currentModal && currentModal !== modalId) {
        closeSubBookmarkModal(true); // Force immediate close
    }

    const data = modalData[modalId];
    if (!data) return;

    currentModal = modalId;

    // Lock the parent card
    const card = linkItem.closest('.flip');
    if (card) {
        card.classList.add('modal-open-lock');
        currentLockedCard = card;
    }

    // Set the pattern data attribute on modal container
    modalContainer.setAttribute('data-pattern', data.pattern);

    // Create and insert content
    modalContent.innerHTML = createModalContent(data);

    // Apply smart positioning
    const position = calculateModalPosition(linkItem);
    if (position) {
        // Desktop: use smart positioning
        modalContainer.style.top = `${position.top}px`;
        modalContainer.style.left = `${position.left}px`;
        modalContainer.style.transform = 'scale(0.95)';
        modalContainer.style.transformOrigin = position.transformOrigin;
    } else {
        // Mobile: use centered positioning
        modalContainer.style.top = '50%';
        modalContainer.style.left = '50%';
        modalContainer.style.transform = 'translate(-50%, -50%) scale(0.95)';
        modalContainer.style.transformOrigin = 'center';
    }

    // Show modal with animation
    modalOverlay.classList.add('active');
    modalContainer.classList.add('active');

    // Add mouse event listeners for modal close behavior
    modalContainer.addEventListener('mouseenter', modalMouseEnter);
    modalContainer.addEventListener('mouseleave', modalMouseLeave);

    // Prevent clicks inside modal from closing it
    modalClickHandler = (e) => {
        e.stopPropagation();
    };
    modalContainer.addEventListener('click', modalClickHandler);

    // Update active transform for animation
    setTimeout(() => {
        if (position) {
            modalContainer.style.transform = 'scale(1)';
        } else {
            modalContainer.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    }, 10);
}

// Function to close sub-bookmark modal
function closeSubBookmarkModal(immediate = false) {
    const doClose = () => {
        // Clear any pending close timeout
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            closeTimeout = null;
        }

        // Smart card unlock - check if mouse is still hovering over the locked card
        if (currentLockedCard) {
            // Check if mouse is still hovering over the locked card
            const isHovering = currentLockedCard.matches(':hover');

            if (isHovering) {
                // Mouse still on card - keep it locked until mouse leaves
                const unlockOnLeave = () => {
                    currentLockedCard.classList.remove('modal-open-lock');
                    currentLockedCard.removeEventListener('mouseleave', unlockOnLeave);
                    currentLockedCard = null;
                };
                currentLockedCard.addEventListener('mouseleave', unlockOnLeave, { once: true });
            } else {
                // Mouse already left - unlock immediately
                currentLockedCard.classList.remove('modal-open-lock');
                currentLockedCard = null;
            }
        }

        // Also remove any other locked cards (fallback cleanup)
        const lockedCard = document.querySelector('.flip.modal-open-lock');
        if (lockedCard && lockedCard !== currentLockedCard) {
            lockedCard.classList.remove('modal-open-lock');
        }

        modalOverlay.classList.remove('active');
        modalContainer.classList.remove('active');
        currentModal = null;

        // Remove modal event listeners
        modalContainer.removeEventListener('mouseenter', modalMouseEnter);
        modalContainer.removeEventListener('mouseleave', modalMouseLeave);
        if (modalClickHandler) {
            modalContainer.removeEventListener('click', modalClickHandler);
            modalClickHandler = null;
        }

        // Clean up after animation
        setTimeout(() => {
            if (!modalContainer.classList.contains('active')) {
                modalContent.innerHTML = '';
                modalContainer.removeAttribute('data-pattern');
            }
        }, 500);
    };

    if (immediate) {
        doClose();
    } else {
        // Add delay to prevent accidental closes
        closeTimeout = setTimeout(doClose, 300);
    }
}

// Initialize modal triggers (click-based only)
function initializeModalTriggers() {
    const modalData = buildModalData();
    const linkItems = document.querySelectorAll('[data-modal-id]');

    linkItems.forEach(linkItem => {
        const modalId = linkItem.dataset.modalId;
        const data = modalData[modalId];

        if (!data) return;

        // Only use 'click' interaction type
        const indicator = linkItem.querySelector('.modal-indicator');
        if (indicator) {
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent bubbling to parent link
                showModalClick(modalId, linkItem, modalData);
            });
        }
    });
}

// Close modal on overlay click
modalOverlay.addEventListener('click', () => {
    closeSubBookmarkModal(true);
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close search modal if open
        const searchModalContainer = document.getElementById('searchModalContainer');
        if (searchModalContainer && searchModalContainer.classList.contains('active')) {
            closeSearchModal();
            return;
        }

        // Close sub-bookmark modal if open
        if (currentModal) {
            closeSubBookmarkModal(true);
        }
    }
});

// ============ SEARCH FUNCTIONALITY ============

// Build search results from bookmarksData
function buildSearchResults(query) {
    const results = {
        bookmarkMatches: [],
        tagMatches: []
    };

    if (!bookmarksData || !bookmarksData.cards) return results;

    const lowerQuery = query.toLowerCase();

    bookmarksData.cards.forEach(card => {
        if (!card.enabled) return;

        card.bookmarks.forEach(bookmark => {
            // Check if bookmark name matches
            const bookmarkNameMatches = bookmark.label.toLowerCase().includes(lowerQuery);

            // Check if any tags match
            const tagMatches = bookmark.tags && bookmark.tags.some(tag =>
                tag.toLowerCase().includes(lowerQuery)
            );

            // Add to appropriate results array
            if (bookmarkNameMatches) {
                results.bookmarkMatches.push({
                    cardName: card.title,
                    cardPattern: card.pattern,
                    bookmark: bookmark,
                    isChild: false,
                    parent: null
                });
            } else if (tagMatches) {
                results.tagMatches.push({
                    cardName: card.title,
                    cardPattern: card.pattern,
                    bookmark: bookmark,
                    isChild: false,
                    parent: null
                });
            }

            // Check children/sub-bookmarks
            if (bookmark.children && bookmark.children.length > 0) {
                bookmark.children.forEach(child => {
                    const childNameMatches = child.label.toLowerCase().includes(lowerQuery);
                    const childTagMatches = child.tags && child.tags.some(tag =>
                        tag.toLowerCase().includes(lowerQuery)
                    );

                    if (childNameMatches) {
                        results.bookmarkMatches.push({
                            cardName: card.title,
                            cardPattern: card.pattern,
                            bookmark: child,
                            isChild: true,
                            parent: bookmark.label
                        });
                    } else if (childTagMatches) {
                        results.tagMatches.push({
                            cardName: card.title,
                            cardPattern: card.pattern,
                            bookmark: child,
                            isChild: true,
                            parent: bookmark.label
                        });
                    }
                });
            }
        });
    });

    return results;
}

// Display search results in modal
function displaySearchResults(results, query) {
    const searchModalContainer = document.getElementById('searchModalContainer');
    const searchModalOverlay = document.getElementById('searchModalOverlay');
    const searchModalResults = document.getElementById('searchModalResults');

    // Check if there are any results
    const hasBookmarkMatches = results.bookmarkMatches.length > 0;
    const hasTagMatches = results.tagMatches.length > 0;
    const hasResults = hasBookmarkMatches || hasTagMatches;

    // Get settings
    const showCardNames = localStorage.getItem('showCardNames') !== 'false'; // default true

    if (!hasResults) {
        // Show empty state
        searchModalResults.innerHTML = `
            <div class="search-empty-state">
                <p>No Bookmarks Match The Search Term(s)</p>
            </div>
        `;
    } else {
        let html = '';

        // Render bookmark matches section
        if (hasBookmarkMatches) {
            html += '<div class="search-results-section">';
            html += '<div class="search-section-header">Bookmark Matches</div>';
            results.bookmarkMatches.forEach(result => {
                html += renderSearchResultItem(result, showCardNames);
            });
            html += '</div>';
        }

        // Render tag matches section
        if (hasTagMatches) {
            html += '<div class="search-results-section">';
            html += '<div class="search-section-header">Tag Matches</div>';
            results.tagMatches.forEach(result => {
                html += renderSearchResultItem(result, showCardNames);
            });
            html += '</div>';
        }

        searchModalResults.innerHTML = html;

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }

        // Add click listeners to all result buttons
        attachSearchResultListeners();
    }

    // Show modal
    searchModalOverlay.classList.add('active');
    searchModalContainer.classList.add('active');
}

// Render a single search result item
function renderSearchResultItem(result, showCardNames) {
    const { cardName, cardPattern, bookmark, isChild, parent } = result;

    // Build the path string
    let pathHTML = '';
    if (showCardNames) {
        pathHTML += `<span class="search-result-card-name">${cardName}</span>`;
        pathHTML += `<span class="search-result-separator">›</span>`;
    }

    if (isChild && parent) {
        pathHTML += `<span>${bookmark.label}</span>`;
        pathHTML += `<span class="search-result-separator">›</span>`;
        pathHTML += `<span>${parent}</span>`;
    } else {
        pathHTML += `<span>${bookmark.label}</span>`;
    }

    // Render icon
    const iconHTML = renderBookmarkIconForSearch(bookmark);

    return `
        <div class="search-result-item">
            <div class="search-result-icon">${iconHTML}</div>
            <div class="search-result-info">
                <div class="search-result-path">${pathHTML}</div>
            </div>
            <div class="search-result-actions">
                <button class="search-result-btn search-result-btn-current" data-url="${bookmark.url}" data-target="current">
                    Current Tab
                </button>
                <button class="search-result-btn" data-url="${bookmark.url}" data-target="new">
                    New Tab
                </button>
            </div>
        </div>
    `;
}

// Render bookmark icon for search results (helper function)
function renderBookmarkIconForSearch(bookmark) {
    if (!bookmark.iconType || !bookmark.icon) {
        return '🔗';
    }

    switch (bookmark.iconType) {
        case 'emoji':
            return bookmark.icon;
        case 'local':
            return `<img src="/assets/icons_logos/${bookmark.icon}" alt="${bookmark.label}" onerror="this.outerHTML='🔗'" style="width: 2rem; height: 2rem; object-fit: contain;">`;
        case 'url':
            return `<img src="${bookmark.icon}" alt="${bookmark.label}" onerror="this.outerHTML='🔗'" style="width: 2rem; height: 2rem; object-fit: contain;">`;
        case 'lucide':
            return `<i data-lucide="${bookmark.icon}" style="width: 2rem; height: 2rem;"></i>`;
        default:
            return '🔗';
    }
}

// Attach click listeners to search result buttons
function attachSearchResultListeners() {
    const buttons = document.querySelectorAll('.search-result-btn');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const url = button.dataset.url;
            const target = button.dataset.target;
            const clearOnClick = localStorage.getItem('clearOnClick') === 'true';

            // Check for Ctrl/Cmd key
            const modifierKey = e.ctrlKey || e.metaKey;

            if (target === 'current') {
                if (modifierKey) {
                    // Ctrl/Cmd + click on current tab button = open in new tab
                    window.open(url, '_blank');
                } else {
                    // Normal click = open in current tab
                    window.location.href = url;
                }
            } else {
                // New tab button - let browser handle Ctrl/Cmd behavior
                window.open(url, '_blank');
            }

            // Clear search if setting is enabled
            if (clearOnClick) {
                const searchInput = document.getElementById('bookmarkSearch');
                const clearButton = document.getElementById('clearSearch');
                searchInput.value = '';
                if (clearButton) clearButton.style.display = 'none';
                closeSearchModal();
            }
        });
    });
}

// Close search modal
function closeSearchModal() {
    const searchModalContainer = document.getElementById('searchModalContainer');
    const searchModalOverlay = document.getElementById('searchModalOverlay');

    searchModalOverlay.classList.remove('active');
    searchModalContainer.classList.remove('active');
}

function initializeSearch() {
    const searchInput = document.getElementById('bookmarkSearch');
    const clearButton = document.getElementById('clearSearch');
    const flipContainer = document.querySelector('.flip-container');

    if (!searchInput || !flipContainer) return;

    let searchTimeout = null;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        // Show/hide clear button
        if (clearButton) {
            clearButton.style.display = query ? 'block' : 'none';
        }

        // Debounce search
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 150);
    });

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            clearButton.style.display = 'none';
            performSearch('');
            searchInput.focus();
        });
    }
}

function performSearch(query) {
    // If query is empty or less than 3 characters, hide the search modal
    if (!query || query.length < 3) {
        closeSearchModal();
        // Show all cards
        const cards = document.querySelectorAll('.flip');
        cards.forEach(card => card.classList.remove('search-hidden'));
        return;
    }

    // Build search results from bookmarksData
    const results = buildSearchResults(query);

    // Display results in modal
    displaySearchResults(results, query);
}

// ============ CARD VISIBILITY CONTROLS ============

// Render card visibility checkboxes in settings panel
function renderCardVisibilityList() {
    const container = document.getElementById('cardVisibilityList');
    if (!container || !bookmarksData) return;

    // Sort cards by order
    const sortedCards = [...bookmarksData.cards].sort((a, b) => a.order - b.order);

    // Generate checkbox HTML
    const html = sortedCards.map((card, index) => {
        const originalIndex = bookmarksData.cards.findIndex(c => c.id === card.id);
        const checked = card.enabled ? 'checked' : '';
        const textClass = card.enabled ? '' : 'disabled-card';

        return `
            <label class="card-visibility-item ${textClass}">
                <input type="checkbox"
                       class="card-visibility-checkbox"
                       data-card-index="${originalIndex}"
                       ${checked} />
                <span class="card-visibility-label">${card.title}</span>
            </label>
        `;
    }).join('');

    container.innerHTML = html;
}

// Initialize card visibility controls
function initializeCardVisibilityControls() {
    const container = document.getElementById('cardVisibilityList');
    if (!container) return;

    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('card-visibility-checkbox')) {
            const cardIndex = parseInt(e.target.dataset.cardIndex);
            toggleCardVisibility(cardIndex);
        }
    });
}

// Toggle card visibility
function toggleCardVisibility(cardIndex) {
    if (!bookmarksData || !bookmarksData.cards[cardIndex]) return;

    // Toggle enabled state
    bookmarksData.cards[cardIndex].enabled = !bookmarksData.cards[cardIndex].enabled;

    // Re-render all cards
    renderAllCards();

    // Re-initialize modal triggers
    initializeModalTriggers();

    // Update the visibility list to reflect the change
    updateCardVisibilityList();

    console.log(`Card "${bookmarksData.cards[cardIndex].title}" visibility: ${bookmarksData.cards[cardIndex].enabled}`);
}

// Update card visibility list (refresh checkboxes)
function updateCardVisibilityList() {
    renderCardVisibilityList();
    initializeCardVisibilityControls();
}

// Initialize save button for card visibility
function initializeCardVisibilitySaveButton() {
    const saveBtn = document.getElementById('saveCardVisibilityBtn');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', () => {
        // Check if the downloadUpdatedJSON function is available
        if (typeof window.downloadUpdatedJSON === 'function') {
            window.downloadUpdatedJSON();
            console.log('✅ Card visibility changes saved to JSON');
        } else {
            console.error('❌ downloadUpdatedJSON function not available');
            alert('Error: Unable to save changes. Please refresh the page.');
        }
    });
}

// ============ INITIALIZATION ============

// Initialize search modal event listeners
function initializeSearchModalEvents() {
    const searchModalClose = document.getElementById('searchModalClose');
    const searchModalOverlay = document.getElementById('searchModalOverlay');

    // Close button
    if (searchModalClose) {
        searchModalClose.addEventListener('click', closeSearchModal);
    }

    // Click outside modal
    if (searchModalOverlay) {
        searchModalOverlay.addEventListener('click', closeSearchModal);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
    // Load data first
    const loaded = await loadBookmarksData();
    if (!loaded) return;

    // Render cards
    renderAllCards();

    // Initialize modal triggers
    initializeModalTriggers();

    // Initialize search
    initializeSearch();

    // Initialize search modal events
    initializeSearchModalEvents();

    // Initialize card visibility controls
    renderCardVisibilityList();
    initializeCardVisibilityControls();
    initializeCardVisibilitySaveButton();

    // Load saved flip state
    const savedFlipState = localStorage.getItem('flipAllCards');
    if (savedFlipState === 'true') {
        flipAllToggle.checked = true;
        document.querySelector('.flip-container').classList.add('show-all-backs');
    }

    // Initialize drag & drop if enabled
    const savedDragDropState = localStorage.getItem('dragDropMode');
    if (savedDragDropState === 'true') {
        initializeDragDrop();
    }
});
