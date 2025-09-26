// theme-manager.js
// Theme Management System (sync-aware) v0.0.3

(function () {
  class ThemeManager {
    constructor() {
      this.currentTheme = 'light';
      this.themes = {
        dark: 'Dark',
        light: 'Light',
        'light-minimal': 'Light Minimal'
      };
      this.init();
    }

    async init() {
      try {
        const savedTheme = await this.loadTheme();
        this.currentTheme = savedTheme;
        this.applyTheme(this.currentTheme);
        this.setupThemeSelector();
        this.applyThemeSpecificStyles();
        // Theme manager initialized
      } catch (error) {
        // Error initializing theme manager
        this.applyTheme(this.currentTheme);
      }
    }

    async loadTheme() {
      try {
        const settings = (await window.dashboardStorage.loadSettings()) || {};
        return settings.selectedTheme ?? 'light';
      } catch (error) {
        console.error('Error loading theme:', error);
        return 'light';
      }
    }

    async saveTheme(theme) {
      try {
        const settings = (await window.dashboardStorage.loadSettings()) || {};
        settings.selectedTheme = theme;
        await window.dashboardStorage.saveSettings(settings);
        return true;
      } catch (error) {
        console.error('Error saving theme:', error);
        return false;
      }
    }

    applyTheme(theme) {
      // Remove any data-theme (we only set for non-dark)
      document.documentElement.removeAttribute('data-theme');
      if (theme !== 'dark') {
        document.documentElement.setAttribute('data-theme', theme);
      }
      this.currentTheme = theme;

      const selector = document.getElementById('theme-selector');
      if (selector) selector.value = theme;

      document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    setupThemeSelector() {
      const headerActions = document.querySelector('.header-actions');
      if (!headerActions) return;
      if (document.getElementById('theme-selector-container')) return;

      const container = document.createElement('div');
      container.className = 'theme-selector';
      container.id = 'theme-selector-container';

      const select = document.createElement('select');
      select.className = 'theme-dropdown';
      select.id = 'theme-selector';

      Object.entries(this.themes).forEach(([key, label]) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = label;
        opt.selected = key === this.currentTheme;
        select.appendChild(opt);
      });

      select.addEventListener('change', async (e) => {
        const newTheme = e.target.value;
        this.applyTheme(newTheme);
        await this.saveTheme(newTheme);
        this.applyThemeSpecificStyles();
      });

      container.appendChild(select);

      const settingsBtn = document.getElementById('settings-btn');
      if (settingsBtn) headerActions.insertBefore(container, settingsBtn);
      else headerActions.appendChild(container);
    }

    getThemedColor(name) {
      const root = document.documentElement;
      const cs = getComputedStyle(root);
      switch (name) {
        case 'primary': return cs.getPropertyValue('--text-primary').trim();
        case 'secondary': return cs.getPropertyValue('--text-secondary').trim();
        case 'muted': return cs.getPropertyValue('--text-muted').trim();
        case 'bg-primary': return cs.getPropertyValue('--bg-primary').trim();
        case 'bg-secondary': return cs.getPropertyValue('--bg-secondary').trim();
        case 'border': return cs.getPropertyValue('--border-primary').trim();
        default: return cs.getPropertyValue('--text-primary').trim();
      }
    }

    applyThemeSpecificStyles() {
      const theme = this.currentTheme;
      const brandTitle = document.querySelector('.brand-title');
      if (!brandTitle) return;

      if (theme === 'light-minimal') {
        brandTitle.style.background = 'linear-gradient(to right, #334155, #64748b)';
        brandTitle.style.webkitBackgroundClip = 'text';
        brandTitle.style.backgroundClip = 'text';
        brandTitle.style.color = 'transparent';
      } else {
        brandTitle.style.background = '';
        brandTitle.style.webkitBackgroundClip = '';
        brandTitle.style.backgroundClip = '';
        brandTitle.style.color = '';
      }
    }

    static initializeThemeSystem() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          window.themeManager = new ThemeManager();
        });
      } else {
        window.themeManager = new ThemeManager();
      }
    }
  }

  // Auto-init
  ThemeManager.initializeThemeSystem();
})();
