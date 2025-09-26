// storage.js (legacy shim)
// If hybrid storage is already present, do nothing.
(function () {
  if (window.dashboardStorage) {
    console.info('[storage.js] Hybrid storage detected; legacy storage shim is inactive.');
    return;
  }

  // Minimal local-only fallback to satisfy callers in dev environments
  class LocalOnlyStorage {
    constructor() {
      this.dataKey = 'bookmarkDashboard';
      this.settingsKey = 'dashboardSettings';
      this.version = '0.0.7';
    }
    async loadData() {
      const v = (await chrome.storage.local.get(this.dataKey))?.[this.dataKey];
      return v || {
        version: this.version,
        lastModified: Date.now(),
        lastModifiedBy: 'local',
        cards: []
      };
    }
    async saveData(data) {
      await chrome.storage.local.set({ [this.dataKey]: data });
      return data;
    }
    async loadSettings() {
      const v = (await chrome.storage.local.get(this.settingsKey))?.[this.settingsKey];
      return v || {
        version: this.version,
        uniformCardHeight: false,
        theme: 'light',
        gridColumns: 'auto',
        cardWidth: 'sm',
        containerMargin: 'medium',
        iconStrokeWidth: 1
      };
    }
    async saveSettings(s) {
      await chrome.storage.local.set({ [this.settingsKey]: s });
      return s;
    }
    async getLayoutSettings() {
      const s = await this.loadSettings();
      return { cardWidth: s.cardWidth ?? 'sm', containerMargin: s.containerMargin ?? 'medium' };
    }
    async updateLayoutSettings(newLayout) {
      const s = await this.loadSettings();
      const merged = { ...s, ...newLayout };
      await this.saveSettings(merged);
      return merged;
    }
  }

  window.dashboardStorage = new LocalOnlyStorage();
})();
