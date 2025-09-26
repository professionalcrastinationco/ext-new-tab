// storage-hybrid.js
// Hybrid Dashboard Storage: sync-first with local mirror & fallback
(function () {
  const MIRROR_FLAG = '__mirror_op__';

  class HybridDashboardStorage {
    constructor() {
      this.storageDataKey = 'bookmarkDashboard';
      this.storageSettingsKey = 'dashboardSettings';
      this.version = '0.0.7';

      this.sync = chrome?.storage?.sync ?? null;
      this.local = chrome?.storage?.local ?? null;

      this.deviceId = this.getOrCreateDeviceId();
      this.lastSyncTime = null;
    }

    // ---------- Device ID ----------
    getOrCreateDeviceId() {
      try {
        const k = 'dashboardDeviceId';
        let v = localStorage.getItem(k);
        if (!v) {
          v = 'device_' + Date.now().toString(36) + Math.random().toString(36).slice(2);
          localStorage.setItem(k, v);
        }
        return v;
      } catch {
        // if blocked, still return a pseudo
        return 'device_' + Math.random().toString(36).slice(2);
      }
    }

    // ---------- Defaults ----------
    getDefaultSettings() {
      return {
        version: this.version,
        uniformCardHeight: false,
        theme: 'light',
        gridColumns: 'auto',
        cardWidth: 'sm',
        containerMargin: 'medium',
        iconStrokeWidth: 1
      };
    }

    getDefaultData() {
      // Based on your earlier defaults (trimmed but complete & valid)
      return {
        version: this.version,
        lastModified: Date.now(),
        lastModifiedBy: this.deviceId,
        cards: [
          {
            id: 'google-workspace',
            title: 'Google Workspace',
            color: 'blue-500',
            order: 0,
            links: [
              {
                id: 'gmail',
                title: 'Gmail',
                url: 'https://mail.google.com',
                icon: 'mail',
                color: 'red-500',
                filled: false,
                order: 0,
                subLinks: [
                  { id: 'gmail-sub1', title: 'Compose New Email', url: 'https://mail.google.com/mail/u/0/#compose', starred: true },
                  { id: 'gmail-sub2', title: 'Sent Items', url: 'https://mail.google.com/mail/u/0/#sent', starred: false }
                ]
              },
              {
                id: 'drive',
                title: 'Google Drive',
                url: 'https://drive.google.com',
                icon: 'folder',
                color: 'yellow-500',
                filled: false,
                order: 1,
                subLinks: [
                  { id: 'drive-sub1', title: 'My Drive', url: 'https://drive.google.com/drive/my-drive', starred: true },
                  { id: 'drive-sub2', title: 'Shared with Me', url: 'https://drive.google.com/drive/shared-with-me', starred: false },
                  { id: 'drive-sub3', title: 'Recent', url: 'https://drive.google.com/drive/recent', starred: false }
                ]
              }
            ]
          },
          {
            id: 'ai-tools',
            title: 'AI Tools',
            color: 'purple-500',
            order: 1,
            links: [
              { id: 'chatgpt', title: 'ChatGPT', url: 'https://chat.openai.com', icon: 'cpu-chip', color: 'green-500', filled: false, order: 0, subLinks: [] },
              { id: 'claude', title: 'Claude', url: 'https://claude.ai', icon: 'brain', color: 'orange-500', filled: false, order: 1, subLinks: [] }
            ]
          }
        ]
      };
    }

    // ---------- Migration helpers ----------
    async migrateData(data) {
      if (!data || !data.cards || !Array.isArray(data.cards)) return null;

      let needsMigration = false;

      // Ensure version
      if (!data.version || data.version !== this.version) {
        needsMigration = true;
      }

      // Ensure subLinks arrays exist
      data.cards.forEach(card => {
        (card.links || []).forEach(link => {
          if (!Array.isArray(link.subLinks)) {
            link.subLinks = [];
            needsMigration = true;
          }
        });
      });

      if (needsMigration) {
        data.version = this.version;
      }
      return data;
    }

    async migrateSettings(settings) {
      const defaults = this.getDefaultSettings();
      let needsMigration = false;

      if (!settings || typeof settings !== 'object') {
        return { ...defaults };
      }

      // Fill missing keys
      for (const [k, v] of Object.entries(defaults)) {
        if (settings[k] === undefined) {
          settings[k] = v;
          needsMigration = true;
        }
      }

      if (!settings.version || settings.version !== this.version) {
        settings.version = this.version;
        needsMigration = true;
      }

      return settings;
    }

    // ---------- Low-level get/set with fallback ----------
    async getAll(area) {
      const store = area === 'sync' ? this.sync : this.local;
      if (!store) return {};
      try {
        return await store.get(null);
      } catch {
        return {};
      }
    }

    async get(keys, area) {
      const store = area === 'sync' ? this.sync : this.local;
      if (!store) return {};
      try {
        return await store.get(keys);
      } catch {
        return {};
      }
    }

    async set(items, area) {
      const store = area === 'sync' ? this.sync : this.local;
      if (!store) return false;
      try {
        await store.set(items);
        this.lastSyncTime = Date.now();
        return true;
      } catch {
        return false;
      }
    }

    // ---------- Public API (same surface your app expects) ----------
    async loadData() {
      // Prefer SYNC → fallback to LOCAL → fallback to defaults
      let data = (await this.get(this.storageDataKey, 'sync'))?.[this.storageDataKey];
      if (!data) data = (await this.get(this.storageDataKey, 'local'))?.[this.storageDataKey];
      if (!data) {
        data = this.getDefaultData();
        // Save to both so first write seeds storage
        await this.set({ [this.storageDataKey]: data, [MIRROR_FLAG]: true }, 'local');
        if (this.sync) {
          await this.set({ [this.storageDataKey]: data, [MIRROR_FLAG]: true }, 'sync');
        }
      } else {
        data = await this.migrateData(data) || this.getDefaultData();
      }
      return data;
    }

    async saveData(data) {
      // Stamp and write sync-first, mirror local on success/failure
      const stamped = {
        ...data,
        version: this.version,
        lastModified: Date.now(),
        lastModifiedBy: this.deviceId
      };

      let ok = false;
      if (this.sync) {
        ok = await this.set({ [this.storageDataKey]: stamped }, 'sync');
      }
      if (!ok) {
        await this.set({ [this.storageDataKey]: stamped }, 'local');
      } else {
        // Also mirror to local so fallback is current
        await this.set({ [this.storageDataKey]: stamped, [MIRROR_FLAG]: true }, 'local');
      }
      return stamped;
    }

    async loadSettings() {
      let settings = (await this.get(this.storageSettingsKey, 'sync'))?.[this.storageSettingsKey];
      if (!settings) settings = (await this.get(this.storageSettingsKey, 'local'))?.[this.storageSettingsKey];
      settings = await this.migrateSettings(settings);
      // Keep both areas updated to latest schema
      await this.set({ [this.storageSettingsKey]: settings, [MIRROR_FLAG]: true }, 'local');
      if (this.sync) {
        await this.set({ [this.storageSettingsKey]: settings, [MIRROR_FLAG]: true }, 'sync');
      }
      return settings;
    }

    async saveSettings(settings) {
      const merged = await this.migrateSettings(settings);
      let ok = false;
      if (this.sync) {
        ok = await this.set({ [this.storageSettingsKey]: merged }, 'sync');
      }
      if (!ok) {
        await this.set({ [this.storageSettingsKey]: merged }, 'local');
      } else {
        await this.set({ [this.storageSettingsKey]: merged, [MIRROR_FLAG]: true }, 'local');
      }
      return merged;
    }

    // --- Helpers used by Options/Layout code you already have ---
    async getLayoutSettings() {
      const s = await this.loadSettings();
      return {
        cardWidth: s.cardWidth ?? 'sm',
        containerMargin: s.containerMargin ?? 'medium'
      };
    }

    async updateLayoutSettings(newLayout) {
      const s = await this.loadSettings();
      const merged = { ...s, ...newLayout };
      return this.saveSettings(merged);
    }
  }

  // Expose globally
  window.dashboardStorage = new HybridDashboardStorage();
})();
