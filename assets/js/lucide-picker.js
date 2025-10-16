// ==================== LUCIDE ICON PICKER ====================

// State
let lucideIconsData = null;
let currentCallback = null;
let filteredIcons = [];

// Load Lucide icons data
async function loadLucideIconsData() {
    try {
        const response = await fetch('assets/data/lucide-icons.json');
        if (!response.ok) {
            throw new Error(`Failed to load icons: ${response.status}`);
        }
        lucideIconsData = await response.json();
        console.log('✅ Lucide icons loaded:', lucideIconsData.icons.length, 'icons');
        return true;
    } catch (error) {
        console.error('❌ Failed to load Lucide icons:', error);
        return false;
    }
}

// Initialize icon picker
document.addEventListener('DOMContentLoaded', async () => {
    await loadLucideIconsData();
    setupIconPickerEventListeners();
});

// Setup event listeners
function setupIconPickerEventListeners() {
    const overlay = document.getElementById('lucidePickerOverlay');
    const closeBtn = document.getElementById('lucidePickerClose');
    const searchInput = document.getElementById('lucidePickerSearch');

    // Close on overlay click
    if (overlay) {
        overlay.addEventListener('click', closeLucidePicker);
    }

    // Close on close button click
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLucidePicker);
    }

    // Search functionality with debounce
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterAndRenderIcons(e.target.value.toLowerCase().trim());
            }, 150);
        });
    }

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('lucidePickerModal');
            if (modal && modal.classList.contains('active')) {
                closeLucidePicker();
            }
        }
    });
}

// Open icon picker
function openLucidePicker(callback) {
    if (!lucideIconsData) {
        console.error('Lucide icons data not loaded');
        return;
    }

    currentCallback = callback;

    // Reset search
    const searchInput = document.getElementById('lucidePickerSearch');
    if (searchInput) {
        searchInput.value = '';
    }

    // Show modal
    const overlay = document.getElementById('lucidePickerOverlay');
    const modal = document.getElementById('lucidePickerModal');

    if (overlay) overlay.classList.add('active');
    if (modal) modal.classList.add('active');

    // Render all icons initially
    filterAndRenderIcons('');

    // Focus search input
    setTimeout(() => {
        if (searchInput) searchInput.focus();
    }, 100);
}

// Close icon picker
function closeLucidePicker() {
    const overlay = document.getElementById('lucidePickerOverlay');
    const modal = document.getElementById('lucidePickerModal');

    if (overlay) overlay.classList.remove('active');
    if (modal) modal.classList.remove('active');

    currentCallback = null;
    filteredIcons = [];
}

// Filter and render icons
function filterAndRenderIcons(query) {
    if (!lucideIconsData) return;

    // Filter icons based on query
    if (!query) {
        filteredIcons = [...lucideIconsData.icons];
    } else {
        filteredIcons = lucideIconsData.icons.filter(iconName => {
            // Check if icon name contains query
            if (iconName.includes(query)) return true;

            // Check if any word in icon name starts with query
            const words = iconName.split('-');
            if (words.some(word => word.startsWith(query))) return true;

            // Check category matches
            for (const [category, keywords] of Object.entries(lucideIconsData.categories)) {
                if (category.includes(query) && keywords.some(keyword => iconName.includes(keyword))) {
                    return true;
                }
            }

            return false;
        });
    }

    // Render icons
    renderIconGrid(filteredIcons);

    // Update count
    const countElement = document.getElementById('lucidePickerCount');
    if (countElement) {
        countElement.textContent = `${filteredIcons.length} icon${filteredIcons.length === 1 ? '' : 's'}`;
    }
}

// Render icon grid
function renderIconGrid(icons) {
    const grid = document.getElementById('lucidePickerGrid');
    if (!grid) return;

    // Limit to first 500 icons for performance
    const displayIcons = icons.slice(0, 500);

    // Generate HTML
    const html = displayIcons.map(iconName => `
        <div class="lucide-picker-icon" data-icon="${iconName}" onclick="selectLucideIcon('${iconName}')">
            <i data-lucide="${iconName}"></i>
            <span class="lucide-picker-icon-name">${iconName}</span>
        </div>
    `).join('');

    grid.innerHTML = html;

    // Show message if results truncated
    if (icons.length > 500) {
        grid.innerHTML += `<div class="lucide-picker-truncated">Showing first 500 of ${icons.length} results. Try a more specific search.</div>`;
    }

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

// Select icon
function selectLucideIcon(iconName) {
    if (currentCallback) {
        currentCallback(iconName);
    }
    closeLucidePicker();
}

// Global function to open picker (called from editor)
window.openLucidePicker = openLucidePicker;
window.selectLucideIcon = selectLucideIcon;
