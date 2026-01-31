# Architecture

**Analysis Date:** 2026-01-28

## Pattern Overview

**Overall:** Chrome Extension with Layered Modules

**Key Characteristics:**
- Browser extension running in isolated contexts (popup, new tab)
- Vanilla JavaScript modules loaded via script tags
- Event-driven architecture with DOM events and Chrome storage events
- No build step - direct file loading

## Layers

**Presentation Layer (ui.js, newtab.js):**
- Purpose: DOM rendering and user interaction handling
- Contains: Render functions, event listeners, drag-and-drop logic
- Location: `ui.js`, `newtab.js`
- Depends on: Storage layer for data
- Used by: HTML pages

**Coordination Layer (app.js):**
- Purpose: Initialize app and coordinate modules
- Contains: Init function, global event listeners, module wiring
- Location: `app.js`
- Depends on: UI layer, Storage layer
- Used by: `manage.html`

**Data Layer (storage.js):**
- Purpose: CRUD operations on Chrome storage
- Contains: loadData, saveData, category/link operations
- Location: `storage.js`
- Depends on: Chrome Storage API
- Used by: All other layers

**Utility Layer (context-menu.js, import-export.js):**
- Purpose: Shared functionality
- Contains: Context menu class, export/import functions
- Location: `context-menu.js`, `import-export.js`
- Depends on: Storage layer (import-export)
- Used by: newtab.js, manage.html

## Data Flow

**Adding Bookmark (Popup):**

1. User clicks extension icon on any page
2. `popup.js` queries current tab for URL/title
3. User selects category and clicks Save
4. `saveData()` writes to Chrome storage sync
5. Storage change event fires in other contexts
6. New tab page refreshes UI automatically

**Viewing Bookmarks (New Tab):**

1. User opens new tab
2. `newtab.js` calls `loadData()` from storage
3. `renderDock()` creates DOM elements for dock UI
4. User hovers category icon to see bookmark cards
5. Click navigates to URL (new tab or same tab)

**State Management:**
- Chrome Storage Sync - Persistent state across devices
- No in-memory cache (always reads fresh from storage)
- Custom events (`storageUpdated`) for cross-context sync

## Key Abstractions

**Data Structure:**
- Purpose: Organize bookmarks hierarchically
- Pattern: Categories contain links, both have order property
- Schema: `{ categories: [{ id, name, icon, order, links: [{id, title, url, order}] }], settings }`

**Modal System:**
- Purpose: Edit categories and links
- Examples: `showCategoryModal()`, `showLinkModal()`, `showConfirmDialog()`
- Pattern: Native `<dialog>` elements with form handling

**Context Menu:**
- Purpose: Right-click actions on dock items
- Location: `context-menu.js`
- Pattern: Dynamic menu creation with event delegation

## Entry Points

**Popup:**
- Location: `popup.html` + `popup.js`
- Triggers: User clicks extension icon
- Responsibilities: Quick add current page to bookmarks

**New Tab:**
- Location: `newtab.html` + `newtab.js`
- Triggers: User opens new tab (chrome://newtab override)
- Responsibilities: Display dock UI, search, settings

**Management Page:**
- Location: `manage.html` + `app.js` + `ui.js`
- Triggers: User clicks "Manage Categories" in settings
- Responsibilities: Full CRUD UI for categories and links

## Error Handling

**Strategy:** Try/catch at function level, user alerts for failures

**Patterns:**
- Console logging for debugging (`console.error`)
- Alert dialogs for user-facing errors
- Graceful degradation (empty states when no data)

## Cross-Cutting Concerns

**Security:**
- XSS Prevention: `escapeHtml()` function in `ui.js`, `popup.js`, `newtab.js`
- URL Validation: Browser's native URL type validation
- CSP: Manifest V3 default (no inline scripts allowed)

**Storage Sync:**
- Chrome storage change listener in `storage.js`
- Custom `storageUpdated` event dispatched to window
- All UI contexts listen and refresh on changes

**Favicons:**
- External service: Google Favicons API
- Fallback: Gray placeholder SVG on error

---

*Architecture analysis: 2026-01-28*
*Update when major patterns change*
