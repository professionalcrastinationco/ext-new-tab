# Quick Bookmarks Chrome Extension

A Chrome new tab extension for organizing quick links into user-managed categories. Built with vanilla JavaScript, Pico CSS, and Chrome's Manifest V3.

## Features

- **Browser Action Popup**: Click the extension icon to quickly bookmark the current page
- **Category Management**: Create, rename, delete, and reorder categories
- **Link Management**: Add, edit, delete, and reorder links within categories
- **Open in New Tab**: Choose whether bookmarks open in new tab or current tab
- **Drag & Drop**: Reorder categories and links by dragging
- **Favicons**: Automatic favicon display for all links
- **Import/Export**: Backup and restore your bookmarks as JSON
- **Responsive Design**: Works on all screen sizes

## Installation

### Loading as Unpacked Extension (Development)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" toggle (top right corner)
3. Click "Load unpacked"
4. Select the `D:\APP\Quick Bookmarks` directory
5. Open a new tab (Ctrl+T) to see the extension

### Reloading After Changes

After making code changes:
1. Go to `chrome://extensions/`
2. Click the reload icon on the Quick Bookmarks extension card
3. Open a new tab to see the changes

## Usage

### Quick Bookmark (Browser Popup)

The easiest way to save a bookmark:

1. Browse to any website you want to bookmark
2. Click the Quick Bookmarks extension icon in Chrome's toolbar
3. A popup appears with the URL and title pre-filled
4. Select a category from the dropdown
5. Choose whether links should open in a new tab (checkbox)
6. Click "Save Bookmark"

The "Open links in new tab" preference is saved and will be used for all your bookmarks.

### Managing Categories

On the new tab page:

- **Add Category**: Click the "+ Add Category" button at the bottom
- **Rename Category**: Click the ✏️ icon next to the category name
- **Delete Category**: Click the 🗑️ icon (confirms if category has links)
- **Reorder Categories**: Drag the ⋮⋮ handle to reorder

### Managing Links

On the new tab page:

- **Add Link**: Click the "+ Add Link" button in any category
- **Edit Link**: Click the ✏️ icon next to any link
- **Delete Link**: Click the 🗑️ icon next to any link
- **Move Link**: Edit the link and change its category
- **Reorder Links**: Drag any link to reorder within or across categories
- **Open Link**: Click on any link (opens in new tab or current tab based on your preference)

### Import/Export

- **Export**: Click "Export" to download all bookmarks as JSON
- **Import**: Click "Import", select a JSON file, and confirm to replace all data

## File Structure

```
Quick Bookmarks/
├── manifest.json           # Manifest V3 config
├── newtab.html            # New tab page UI
├── popup.html             # Browser action popup UI
├── popup.js               # Popup logic
├── styles.css             # Custom styles
├── app.js                 # Main initialization
├── storage.js             # Data persistence layer
├── ui.js                  # DOM rendering & events
├── import-export.js       # JSON import/export
├── lib/
│   └── pico.min.css       # Pico CSS framework
└── icons/
    ├── icon16.svg         # Extension icons
    ├── icon48.svg
    └── icon128.svg
```

## Data Storage

All data is stored in `chrome.storage.sync` (syncs across Chrome browsers when signed in). Maximum storage: ~8KB (sufficient for 100-200 links).

## Debugging

Open DevTools on the new tab page (F12) and use:

```javascript
// View all data
chrome.storage.sync.get(null, (data) => console.log(data));

// Clear all data (reset)
chrome.storage.sync.clear();
```

## Security

- XSS Prevention: All user input is HTML-escaped before rendering
- URL Validation: Browser validation for all URL inputs
- Minimal Permissions: Only `storage` and `tabs`
- Content Security Policy: Default Manifest V3 CSP (no inline scripts)

## Technologies

- Vanilla JavaScript (ES6+)
- Pico CSS (minimal CSS framework)
- Chrome Extension Manifest V3
- Chrome Storage API
- HTML5 Drag and Drop API

## License

MIT License - Free to use and modify
