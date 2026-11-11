/* utils.js - Shared utility functions */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} unsafe - The string to escape
 * @returns {string} The escaped string safe for HTML insertion
 */
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Gets the favicon URL for a given website URL using Google's favicon service
 * @param {string} url - The website URL to get the favicon for
 * @returns {string} The favicon URL, or empty string if URL is invalid
 */
function getFaviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch (e) {
    return '';
  }
}

/* Any button marked data-close closes the dialog it sits in (Cancel buttons) */
document.addEventListener('click', (e) => {
  const closer = e.target.closest('[data-close]');
  if (!closer) return;
  const dialog = closer.closest('dialog');
  if (dialog) dialog.close();
});
