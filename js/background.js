// background.js (MV3, module)

const MIRROR_FLAG = '__mirror_op__';

// Simple debounce
const debounce = (fn, ms = 250) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

// On first install or on any update, copy SYNC → LOCAL so local fallback is fresh
chrome.runtime.onInstalled.addListener(async () => {
  try {
    if (!chrome.storage?.sync || !chrome.storage?.local) return;
    const syncAll = await chrome.storage.sync.get(null);
    if (syncAll && Object.keys(syncAll).length) {
      await chrome.storage.local.set({ ...syncAll, [MIRROR_FLAG]: true });
    }
  } catch (e) {
    // Snapshot sync->local failed
  }
});

// Mirror SYNC → LOCAL (guard for our own mirror writes)
const mirrorSyncToLocal = debounce(async (changes) => {
  const payload = {};
  for (const [key, change] of Object.entries(changes)) {
    if (key === MIRROR_FLAG) continue;
    payload[key] = change?.newValue;
  }
  if (Object.keys(payload).length) {
    await chrome.storage.local.set({ ...payload, [MIRROR_FLAG]: true });
  }
}, 150);

// Mirror LOCAL → SYNC (guard + catch quota/offline)
const mirrorLocalToSync = debounce(async (changes) => {
  if (!chrome.storage?.sync) return;
  const payload = {};
  for (const [key, change] of Object.entries(changes)) {
    if (key === MIRROR_FLAG) continue;
    payload[key] = change?.newValue;
  }
  if (Object.keys(payload).length) {
    try {
      await chrome.storage.sync.set({ ...payload, [MIRROR_FLAG]: true });
    } catch (e) {
      // Quota/offline: ignore; hybrid layer will still have LOCAL
      // Local->Sync mirror skipped - quota/offline
    }
  }
}, 150);

// Listen for changes in either area and mirror across
chrome.storage.onChanged.addListener((changes, area) => {
  // Ignore writes originated by our own mirror
  if (changes?.[MIRROR_FLAG]?.newValue) return;

  if (area === 'sync') {
    mirrorSyncToLocal(changes);
  } else if (area === 'local') {
    mirrorLocalToSync(changes);
  }
});
