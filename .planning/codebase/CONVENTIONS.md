# Coding Conventions

**Analysis Date:** 2026-01-28

## Naming Patterns

**Files:**
- kebab-case for multi-word files (`import-export.js`, `context-menu.js`)
- Single lowercase word for main modules (`storage.js`, `popup.js`)
- UPPERCASE.md for documentation files (`README.md`, `HANDOFF.md`)

**Functions:**
- camelCase for all functions (`loadData`, `renderCategories`, `attachEventListeners`)
- Verb prefix for actions (`get`, `create`, `update`, `delete`, `render`, `show`, `attach`)
- No special prefix for async functions

**Variables:**
- camelCase for variables (`currentData`, `draggedElement`, `isInitialized`)
- UPPER_SNAKE_CASE for constants (`STORAGE_KEY`, `DEFAULT_DATA`, `DEFAULT_ICONS`)
- Descriptive names (`categoryId`, `linkData`, `orderedIds`)

**DOM Elements:**
- kebab-case IDs in HTML (`category-modal`, `link-form`, `add-category-btn`)
- Consistent suffix patterns (`*-btn`, `*-modal`, `*-form`, `*-input`)

## Code Style

**Formatting:**
- 2 space indentation
- Single quotes for strings (mostly, some double quotes)
- No trailing semicolons (mixed - some files have them, some don't)
- ~100 character line length

**Linting:**
- Not configured - No ESLint or Prettier
- Manual code style enforcement

## Import Organization

**Script Loading:**
```html
<!-- Dependencies first, then app modules -->
<script src="storage.js"></script>
<script src="import-export.js"></script>
<script src="context-menu.js"></script>
<script src="newtab.js"></script>
```

**Order:**
1. Data layer (`storage.js`)
2. Utilities (`import-export.js`, `context-menu.js`)
3. UI layer (`ui.js`, app-specific JS)
4. Coordinator (`app.js`)

**Path Style:**
- Relative paths without `./` prefix
- No module system (global scope)

## Error Handling

**Patterns:**
- Try/catch around async operations
- Console.error for debugging
- Alert dialogs for user-facing errors

**Example from `popup.js`:**
```javascript
try {
  // operation
} catch (error) {
  console.error('Failed to initialize popup:', error);
  showMessage('Failed to load. Please try again.', 'error');
}
```

**Error Types:**
- Chrome API errors (storage, tabs)
- Validation errors (missing category, invalid data)
- Network errors (favicon loading - handled with fallback)

## Logging

**Framework:**
- Browser console only (console.log, console.error)

**Patterns:**
- Debug logging with context: `console.log('Saving bookmark:', { title, url, categoryId })`
- Error logging with error object: `console.error('Failed to save:', error)`
- Change notifications: `console.log('Storage changed, dispatching update event...')`

## Comments

**When to Comment:**
- File purpose at top: `// storage.js - Data Layer for chrome.storage.sync operations`
- Section dividers: `// Category CRUD Operations`
- Complex logic explanations (minimal - code is generally self-documenting)

**Style:**
- Single-line comments with `//`
- Space after `//`
- No JSDoc (no documentation generator)

**TODO Comments:**
- Not commonly used in current codebase

## Function Design

**Size:**
- Most functions under 30 lines
- Longer functions for complex rendering (`renderCategories`, `attachDragListeners`)

**Parameters:**
- Max 3-4 parameters
- Object destructuring for complex params: `{ target, menuItems, mode }`
- Default values: `function showContextMenu(e, menuItems, mode = "dark")`

**Return Values:**
- Explicit returns
- Async functions return Promises
- CRUD functions return the created/updated object or boolean

## Module Design

**Pattern:**
- Global functions (no ES modules)
- Each file adds functions to global scope
- Files designed to be loaded in specific order

**Exports:**
- Not applicable (no module system)
- All functions are globally accessible

**File Organization:**
```javascript
// 1. Constants at top
const STORAGE_KEY = 'quickBookmarks';
const DEFAULT_DATA = { ... };

// 2. Main functions
async function loadData() { ... }
async function saveData(data) { ... }

// 3. CRUD operations grouped
async function createCategory() { ... }
async function deleteCategory() { ... }

// 4. Event listeners at bottom
chrome.storage.onChanged.addListener(...);
```

## HTML/CSS Conventions

**HTML:**
- Semantic elements (`<article>`, `<header>`, `<nav>`)
- Native `<dialog>` for modals
- Data attributes for element relationships (`data-category-id`, `data-link-id`)

**CSS:**
- CSS custom properties for theming (`--category-border`, `--drag-handle-color`)
- BEM-like class names (`.category-header`, `.link-item`, `.icon-btn`)
- Responsive with media queries

**Inline vs External:**
- `newtab.html`: Extensive inline styles (dock-specific)
- `manage.html`: External `styles.css`

---

*Convention analysis: 2026-01-28*
*Update when patterns change*
