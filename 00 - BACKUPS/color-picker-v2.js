/**
 * Two-Step Color Picker Component
 * Uses Preline UI patterns with complete Tailwind CSS v4 colors
 */

class TwoStepColorPicker {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    // Options
    this.inputId = options.inputId || null;
    this.onSelect = options.onSelect || null;
    this.defaultColor = options.defaultColor || 'blue-500';

    // State
    this.selectedCategory = null;
    this.selectedColor = this.defaultColor;

    // Parse default color to get category
    const [defaultCategory] = this.defaultColor.split('-');
    this.selectedCategory = defaultCategory;

    // Initialize
    this.init();
  }

  init() {
    if (!window.TAILWIND_COLORS) {
      console.error('Tailwind colors data not loaded');
      return;
    }

    this.render();
    this.attachEventListeners();

    // Set initial value if input exists
    if (this.inputId) {
      const input = document.getElementById(this.inputId);
      if (input) {
        input.value = this.selectedColor;
      }
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="color-picker-v2 space-y-3">
        <!-- Step 1: Color Categories -->
        <div id="${this.container.id}-categories" class="color-categories">
          <label class="block text-sm font-medium mb-2 dark:text-white">Select Color</label>
          <div class="grid grid-cols-6 sm:grid-cols-8 gap-2">
            ${this.renderColorCategories()}
          </div>
        </div>

        <!-- Step 2: Color Shades (initially hidden) -->
        <div id="${this.container.id}-shades" class="color-shades hidden">
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-gray-700 dark:text-neutral-300">
              <span class="color-name"></span> Shades
            </label>
            <button type="button" class="back-to-colors text-xs text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200 flex items-center gap-1">
              <svg class="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to colors
            </button>
          </div>
          <div class="shades-grid grid grid-cols-6 sm:grid-cols-11 gap-1">
            <!-- Shades will be dynamically inserted here -->
          </div>
        </div>
      </div>
    `;
  }

  renderColorCategories() {
    const colors = window.TAILWIND_COLORS.getColorNames();

    return colors.map(colorName => {
      const colorHex = window.TAILWIND_COLORS.getColor(colorName, 500);
      const isSelected = this.selectedColor.startsWith(colorName);

      return `
        <div class="relative group">
          <input type="radio"
            name="${this.container.id}-category"
            value="${colorName}"
            id="${this.container.id}-${colorName}"
            class="sr-only peer"
            ${isSelected ? 'checked' : ''}>
          <label for="${this.container.id}-${colorName}"
            class="color-category-btn block w-full aspect-square rounded-lg cursor-pointer overflow-hidden border-2 transition-all duration-200
              border-transparent hover:border-gray-400 dark:hover:border-gray-600
              peer-checked:border-gray-900 dark:peer-checked:border-white
              peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-blue-500 dark:peer-checked:ring-offset-neutral-900
              hover:scale-110 peer-checked:scale-110"
            style="background-color: ${colorHex}"
            data-color="${colorName}"
            title="${this.formatColorName(colorName)}">
            <span class="sr-only">${this.formatColorName(colorName)}</span>
          </label>
          <!-- Tooltip -->
          <div class="absolute z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200
            bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded whitespace-nowrap pointer-events-none">
            ${this.formatColorName(colorName)}
          </div>
        </div>
      `;
    }).join('');
  }

  renderColorShades(colorName) {
    const shades = window.TAILWIND_COLORS.getShades();
    const shadesContainer = this.container.querySelector('.shades-grid');
    const colorNameLabel = this.container.querySelector('.color-name');

    if (!shadesContainer || !colorNameLabel) return;

    colorNameLabel.textContent = this.formatColorName(colorName);

    shadesContainer.innerHTML = shades.map(shade => {
      const colorHex = window.TAILWIND_COLORS.getColor(colorName, shade);
      const colorValue = `${colorName}-${shade}`;
      const isSelected = this.selectedColor === colorValue;

      // Determine if we need light or dark text based on shade
      const needsLightText = shade >= 600;

      return `
        <div class="relative group">
          <input type="radio"
            name="${this.container.id}-shade"
            value="${colorValue}"
            id="${this.container.id}-${colorValue}"
            class="sr-only peer"
            ${isSelected ? 'checked' : ''}>
          <label for="${this.container.id}-${colorValue}"
            class="color-shade-btn flex flex-col items-center justify-center w-full aspect-square rounded-lg cursor-pointer overflow-hidden border-2 transition-all duration-200
              border-transparent hover:border-gray-400 dark:hover:border-gray-600
              peer-checked:border-gray-900 dark:peer-checked:border-white
              peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-blue-500 dark:peer-checked:ring-offset-neutral-900
              hover:scale-110 peer-checked:scale-110"
            style="background-color: ${colorHex}"
            data-color="${colorValue}"
            title="${this.formatColorName(colorName)} ${shade}">
            <span class="text-[10px] font-semibold ${needsLightText ? 'text-white' : 'text-gray-900'} select-none">${shade}</span>
            <span class="sr-only">${this.formatColorName(colorName)} ${shade}</span>
          </label>
        </div>
      `;
    }).join('');
  }

  attachEventListeners() {
    // Category selection
    this.container.addEventListener('click', (e) => {
      const categoryBtn = e.target.closest('.color-category-btn');
      if (categoryBtn) {
        e.preventDefault();
        const colorName = categoryBtn.dataset.color;
        this.showShades(colorName);
      }

      const shadeBtn = e.target.closest('.color-shade-btn');
      if (shadeBtn) {
        e.preventDefault();
        const colorValue = shadeBtn.dataset.color;
        this.selectColor(colorValue);
      }

      const backBtn = e.target.closest('.back-to-colors');
      if (backBtn) {
        e.preventDefault();
        this.showCategories();
      }
    });

    // Radio input changes (for keyboard navigation)
    this.container.addEventListener('change', (e) => {
      if (e.target.name === `${this.container.id}-category`) {
        this.showShades(e.target.value);
      } else if (e.target.name === `${this.container.id}-shade`) {
        this.selectColor(e.target.value);
      }
    });
  }

  showShades(colorName) {
    this.selectedCategory = colorName;

    // Render shades for selected color
    this.renderColorShades(colorName);

    // Hide categories, show shades
    const categoriesDiv = this.container.querySelector('.color-categories');
    const shadesDiv = this.container.querySelector('.color-shades');

    if (categoriesDiv && shadesDiv) {
      categoriesDiv.classList.add('hidden');
      shadesDiv.classList.remove('hidden');

      // Focus first shade for keyboard navigation
      const firstShade = shadesDiv.querySelector('input[type="radio"]');
      if (firstShade) {
        firstShade.focus();
      }
    }
  }

  showCategories() {
    const categoriesDiv = this.container.querySelector('.color-categories');
    const shadesDiv = this.container.querySelector('.color-shades');

    if (categoriesDiv && shadesDiv) {
      shadesDiv.classList.add('hidden');
      categoriesDiv.classList.remove('hidden');

      // Focus selected category for keyboard navigation
      const selectedCategory = categoriesDiv.querySelector('input[type="radio"]:checked');
      if (selectedCategory) {
        selectedCategory.focus();
      }
    }
  }

  selectColor(colorValue) {
    this.selectedColor = colorValue;

    // Update hidden input if provided
    if (this.inputId) {
      const input = document.getElementById(this.inputId);
      if (input) {
        input.value = colorValue;

        // Trigger change event
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
      }
    }

    // Call callback if provided
    if (this.onSelect) {
      this.onSelect(colorValue);
    }

    // Show visual feedback
    this.showColorFeedback(colorValue);

    // Return to categories after selection
    setTimeout(() => {
      this.showCategories();
      // Update selected category radio
      const [categoryName] = colorValue.split('-');
      const categoryRadio = this.container.querySelector(`input[value="${categoryName}"]`);
      if (categoryRadio) {
        categoryRadio.checked = true;
      }
    }, 300);
  }

  showColorFeedback(colorValue) {
    // Find the selected shade button and add a pulse animation
    const shadeBtn = this.container.querySelector(`[data-color="${colorValue}"]`);
    if (shadeBtn) {
      shadeBtn.classList.add('animate-pulse');
      setTimeout(() => {
        shadeBtn.classList.remove('animate-pulse');
      }, 600);
    }
  }

  formatColorName(colorName) {
    // Capitalize first letter
    return colorName.charAt(0).toUpperCase() + colorName.slice(1);
  }

  // Public methods
  setValue(colorValue) {
    this.selectedColor = colorValue;
    const [categoryName] = colorValue.split('-');
    this.selectedCategory = categoryName;

    // Update UI
    const categoryRadio = this.container.querySelector(`input[value="${categoryName}"]`);
    if (categoryRadio) {
      categoryRadio.checked = true;
    }

    // Update input if exists
    if (this.inputId) {
      const input = document.getElementById(this.inputId);
      if (input) {
        input.value = colorValue;
      }
    }
  }

  getValue() {
    return this.selectedColor;
  }

  reset() {
    this.selectedColor = this.defaultColor;
    const [defaultCategory] = this.defaultColor.split('-');
    this.selectedCategory = defaultCategory;
    this.showCategories();
    this.setValue(this.defaultColor);
  }

  destroy() {
    // Clean up event listeners
    this.container.innerHTML = '';
  }
}

// Export for use
window.TwoStepColorPicker = TwoStepColorPicker;