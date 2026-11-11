/**
 * Custom icons for quick links and categories.
 *
 *   "url:https://example.com/logo.png"  linked image. Just text, so it syncs with the
 *                                        rest of the data and works on every device.
 *   "upload:ic_abc123"                  uploaded image, resized to 64px and kept in
 *                                        chrome.storage.local (this computer only).
 *
 * Images are always shown through <img>, never as page code, so a bad link or file
 * cannot run anything. A broken image falls back to the globe icon.
 */
const CUSTOM_ICON_MAX_FILE = 2 * 1024 * 1024; // 2 MB
const CUSTOM_ICON_SIZE = 64;
let CUSTOM_UPLOADS = {};

async function loadCustomUploads() {
  try {
    const result = await chrome.storage.local.get('customIcons');
    CUSTOM_UPLOADS = (result && result.customIcons) || {};
  } catch (e) {
    CUSTOM_UPLOADS = {};
  }
}

function isCustomIcon(value) {
  return typeof value === 'string' && (value.startsWith('url:') || value.startsWith('upload:'));
}

// Only https image links are accepted
function cleanIconUrl(text) {
  try {
    const u = new URL(String(text).trim());
    return u.protocol === 'https:' ? u.href : null;
  } catch (e) {
    return null;
  }
}

function escapeAttr(text) {
  return String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// Returns <img> markup, or null when the value cannot be shown
function customIconMarkup(value) {
  let src = null;
  if (value.startsWith('url:')) {
    src = cleanIconUrl(value.slice(4));
  } else if (value.startsWith('upload:')) {
    src = CUSTOM_UPLOADS[value.slice(7)] || null;
  }
  if (!src) return null;
  return `<img class="custom-icon" src="${escapeAttr(src)}" alt="" referrerpolicy="no-referrer" draggable="false">`;
}

// A broken image becomes the globe icon (error events do not bubble, so listen on capture)
document.addEventListener('error', (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || !img.classList.contains('custom-icon')) return;
  const holder = img.parentElement;
  if (holder && typeof CATEGORY_ICONS !== 'undefined' && CATEGORY_ICONS.globe) {
    holder.innerHTML = CATEGORY_ICONS.globe;
  }
}, true);

// Shrink an uploaded image to at most 64px and save it on this computer
function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || CUSTOM_ICON_SIZE;
      const h = img.naturalHeight || CUSTOM_ICON_SIZE;
      const scale = Math.min(1, CUSTOM_ICON_SIZE / Math.max(w, h));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(w * scale)) || CUSTOM_ICON_SIZE;
      canvas.height = Math.max(1, Math.round(h * scale)) || CUSTOM_ICON_SIZE;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file could not be read as an image.'));
    };
    img.src = url;
  });
}

async function saveUploadedIcon(file) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  if (file.size > CUSTOM_ICON_MAX_FILE) throw new Error('That image is over 2 MB. Please choose a smaller one.');
  const dataUrl = await resizeImageFile(file);
  const id = 'ic_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  CUSTOM_UPLOADS[id] = dataUrl;
  await chrome.storage.local.set({ customIcons: CUSTOM_UPLOADS });
  return 'upload:' + id;
}

/**
 * Wires the "paste a link / upload" row under an icon picker.
 * prefix: "quick-link" or "category" (element ids are <prefix>-icon-url, -icon-upload, -icon-file)
 */
function initCustomIconRow(prefix, hiddenId, previewId) {
  const urlInput = document.getElementById(prefix + '-icon-url');
  const uploadBtn = document.getElementById(prefix + '-icon-upload');
  const fileInput = document.getElementById(prefix + '-icon-file');
  const hidden = document.getElementById(hiddenId);
  const preview = document.getElementById(previewId);
  if (!urlInput || !uploadBtn || !fileInput || !hidden) return;

  const deselectPicker = () => {
    const modal = hidden.closest('dialog');
    if (modal) modal.querySelectorAll('.icon-picker-item.selected').forEach(el => el.classList.remove('selected'));
  };

  const apply = (value) => {
    hidden.value = value;
    deselectPicker();
    const markup = customIconMarkup(value);
    if (preview && markup) preview.innerHTML = markup;
  };

  urlInput.addEventListener('input', () => {
    const clean = cleanIconUrl(urlInput.value);
    urlInput.setAttribute('aria-invalid', urlInput.value.trim() && !clean ? 'true' : 'false');
    if (clean) apply('url:' + clean);
  });

  uploadBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    try {
      const value = await saveUploadedIcon(file);
      urlInput.value = '';
      apply(value);
    } catch (err) {
      window.alert(err.message || 'The icon could not be added.');
    }
  });
}

// Call when a dialog opens or a built-in icon is picked, so the link field matches the icon
function syncCustomIconRow(prefix, iconValue) {
  const urlInput = document.getElementById(prefix + '-icon-url');
  if (!urlInput) return;
  urlInput.value = typeof iconValue === 'string' && iconValue.startsWith('url:') ? iconValue.slice(4) : '';
  urlInput.setAttribute('aria-invalid', 'false');
}
