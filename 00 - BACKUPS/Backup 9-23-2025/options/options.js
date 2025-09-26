// options.js
// Settings page functionality (sync-aware)

class SettingsManager {
  constructor() {
    this.settings = null;
    this.layoutSettings = { cardWidth: 'sm', containerMargin: 'medium' };
    this.previewMode = false;
    this.originalSettings = null;
    this.init();
  }

  async init() {
    try {
      // Initialize theme system
      if (window.themeManager) {
        const savedTheme = await window.themeManager.loadTheme();
        window.themeManager.applyTheme(savedTheme);
      }

      // Load current settings + layout
      this.settings = await window.dashboardStorage.loadSettings();
      this.layoutSettings = await window.dashboardStorage.getLayoutSettings();
      this.originalSettings = { ...this.settings, ...this.layoutSettings };

      // Wire handlers, populate form, live preview
      this.setupEventListeners();
      this.populateForm();
      this.applyLayoutPreview();

      console.log('Settings page initialized');
    } catch (error) {
      console.error('Error initializing settings:', error);
      this.showMessage('Error loading settings', 'error');
    }
  }

  setupEventListeners() {
    const $ = (id) => document.getElementById(id);

    $('save-settings')?.addEventListener('click', () => this.saveSettings());
    $('reset-data')?.addEventListener('click', () => this.resetData());
    $('reset-layout')?.addEventListener('click', () => this.resetLayout());
    $('preview-settings')?.addEventListener('click', () => this.togglePreview());

    $('uniform-height')?.addEventListener('change', (e) => {
      this.settings.uniformCardHeight = e.target.checked;
      this.previewChanges();
    });

    $('icon-stroke-width')?.addEventListener('change', (e) => {
      this.settings.iconStrokeWidth = parseFloat(e.target.value);
      this.previewChanges();
    });

    $('card-width')?.addEventListener('change', (e) => {
      this.layoutSettings.cardWidth = e.target.value;
      this.previewChanges();
    });

    $('container-margin')?.addEventListener('change', (e) => {
      this.layoutSettings.containerMargin = e.target.value;
      this.previewChanges();
    });
  }

  populateForm() {
    const $ = (id) => document.getElementById(id);

    $('uniform-height').checked = !!this.settings.uniformCardHeight;
    $('icon-stroke-width').value = this.settings.iconStrokeWidth ?? 1;
    $('card-width').value = this.layoutSettings.cardWidth;
    $('container-margin').value = this.layoutSettings.containerMargin;
  }

  previewChanges() {
    this.applyLayoutPreview();

    const previewBtn = document.getElementById('preview-settings');
    if (!this.previewMode) {
      this.previewMode = true;
      previewBtn.textContent = 'Stop Preview';
      previewBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
      previewBtn.classList.add('bg-orange-600', 'hover:bg-orange-700');
    }
  }

  applyLayoutPreview() {
    const root = document.documentElement;
    const body = document.body;

    const cardWidthMap = {
      xs: { percentage: 20, minWidth: 250 },
      sm: { percentage: 25, minWidth: 280 },
      md: { percentage: 33.333, minWidth: 320 },
      lg: { percentage: 50, minWidth: 360 },
      xl: { percentage: 100, minWidth: 400 }
    };

    const containerMarginMap = { none: 0, narrow: 5, medium: 10, wide: 15, xwide: 20 };

    // Clear classes
    Object.keys(cardWidthMap).forEach((k) => body.classList.remove(`card-width-${k}`));
    Object.keys(containerMarginMap).forEach((k) => body.classList.remove(`container-margin-${k}`));

    // Add new
    body.classList.add(`card-width-${this.layoutSettings.cardWidth}`);
    body.classList.add(`container-margin-${this.layoutSettings.containerMargin}`);

    // Set CSS vars
    const cardCfg = cardWidthMap[this.layoutSettings.cardWidth];
    const marginCfg = containerMarginMap[this.layoutSettings.containerMargin];
    if (cardCfg) {
      root.style.setProperty('--card-width', `${cardCfg.percentage}%`);
      root.style.setProperty('--card-min-width', `${cardCfg.minWidth}px`);
    }
    if (marginCfg !== undefined) {
      root.style.setProperty('--container-margin', `${marginCfg}%`);
    }
  }

  async togglePreview() {
    const previewBtn = document.getElementById('preview-settings');

    if (this.previewMode) {
      // Revert to original
      this.previewMode = false;

      // Restore from original
      this.settings.uniformCardHeight = !!this.originalSettings.uniformCardHeight;
      this.settings.iconStrokeWidth = this.originalSettings.iconStrokeWidth ?? 1;
      this.layoutSettings.cardWidth = this.originalSettings.cardWidth ?? 'sm';
      this.layoutSettings.containerMargin = this.originalSettings.containerMargin ?? 'medium';

      this.populateForm();
      this.applyLayoutPreview();

      previewBtn.textContent = 'Preview Changes';
      previewBtn.classList.remove('bg-orange-600', 'hover:bg-orange-700');
      previewBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
    } else {
      this.previewMode = true;
      previewBtn.textContent = 'Stop Preview';
      previewBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
      previewBtn.classList.add('bg-orange-600', 'hover:bg-orange-700');
    }
  }

  async saveSettings() {
    try {
      // Persist layout first so dashboard picks up CSS changes
      await window.dashboardStorage.updateLayoutSettings({
        cardWidth: this.layoutSettings.cardWidth,
        containerMargin: this.layoutSettings.containerMargin
      });

      // Persist other settings
      const merged = await window.dashboardStorage.saveSettings({
        ...this.settings,
        cardWidth: this.layoutSettings.cardWidth,
        containerMargin: this.layoutSettings.containerMargin
      });

      this.originalSettings = { ...merged };
      this.showMessage('Settings saved', 'success');
    } catch (e) {
      console.error('Save failed:', e);
      this.showMessage('Failed to save settings', 'error');
    }
  }

  async resetLayout() {
    try {
      const defaults = { cardWidth: 'sm', containerMargin: 'medium' };
      await window.dashboardStorage.updateLayoutSettings(defaults);
      this.layoutSettings = { ...defaults };
      this.populateForm();
      this.applyLayoutPreview();
      this.showMessage('Layout reset', 'success');
    } catch (e) {
      console.error(e);
      this.showMessage('Failed to reset layout', 'error');
    }
  }

  async resetData() {
    // Optional: up to you; here we just confirm and replace with defaults
    if (!confirm('Reset dashboard cards/links to defaults?')) return;
    try {
      const defaults = window.dashboardStorage.getDefaultData
        ? window.dashboardStorage.getDefaultData()
        : {};
      await window.dashboardStorage.saveData(defaults);
      this.showMessage('Data reset to defaults', 'success');
    } catch (e) {
      console.error(e);
      this.showMessage('Failed to reset data', 'error');
    }
  }

  showMessage(text, type = 'info') {
    const el = document.getElementById('save-status');
    if (!el) return;
    el.textContent = text;
    el.className = `text-sm mt-2 ${type === 'error' ? 'text-red-400' : type === 'success' ? 'text-green-400' : 'text-slate-300'}`;
    setTimeout(() => (el.textContent = ''), 2500);
  }
}

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SettingsManager());
} else {
  new SettingsManager();
}
