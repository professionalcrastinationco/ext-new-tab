# Quick Bookmarks

## What This Is

A Chrome extension that replaces the new tab page with a macOS-inspired dock showing categorized bookmarks. Users can quickly add bookmarks via popup, organize them into emoji-labeled categories, and access them from a clean, dark-themed interface with Google search integration.

## Core Value

Fast access to frequently used bookmarks from the new tab page without navigating Chrome's bookmarks menu.

## Current State

**Shipped:** v1.2.1 UI Consistency Fix (2026-01-28)

Polished Chrome extension with:
- Unified design tokens system (`tokens.css`) with 32 CSS custom properties
- Glassmorphism styling across all components (blur, semi-transparent backgrounds, layered shadows)
- Primary cyan / secondary glass button hierarchy
- Glass-styled dialogs, link items, and empty states
- Visual consistency between manage.html and newtab.html
- Phosphor Icons throughout (40+ icon options for categories)
- Native HTML5 `<dialog>` modals with Promise-based API
- Category cards match context menu glassmorphism (gradient, layered shadows)

**Codebase:** ~7,500 LOC (JavaScript/CSS/HTML), vanilla JS, no build step

## Requirements

### Validated

- New tab page with macOS-style dock UI — v1.0
- Quick-add popup for current page — v1.0
- Categories with emoji icons — v1.0
- Drag-and-drop reordering — v1.0
- Import/export functionality — v1.0
- Settings (dock position, link behavior) — v1.0
- Right-click context menu — v1.0
- Google search integration — v1.0
- Chrome storage sync — v1.0
- Consolidated external stylesheets — v1.0
- Unified dark theme across popup and new tab — v1.0
- Native `<dialog>` modals — v1.0
- Empty state visual feedback — v1.0
- ✓ Phosphor Icons library integration — v1.1
- ✓ Category icon picker with 40+ icons — v1.1
- ✓ Design tokens system (tokens.css) — v1.2
- ✓ Glassmorphism styling across all components — v1.2
- ✓ Visual consistency between manage.html and newtab.html — v1.2

### Active

(None — feature complete for current needs)

### Out of Scope

- Firefox/Safari support — Chrome-only per constraint
- Build step or bundler — keeping vanilla JS architecture
- Test framework — codebase is stable, manual testing sufficient
- Backend/cloud sync — Chrome storage sync is adequate
- Chrome Bookmarks API integration — researched, complexity outweighs benefits (chrome.storage.sync already syncs)

## Constraints

- **Stack**: Vanilla JavaScript, no frameworks, no build step
- **Platform**: Chrome extension only (Manifest V3)
- **Compatibility**: Chrome 88+ (MV3 minimum)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep vanilla JS | User preference, avoid complexity | ✓ Good |
| Chrome only | User preference, simplify testing | ✓ Good |
| Focus on UI polish first | User's primary pain point | ✓ Good |
| Translucent glassmorphism style | Modern macOS aesthetic | ✓ Good |
| Native `<dialog>` for modals | Better accessibility, standard API | ✓ Good |
| Phosphor Icons over emoji | Professional appearance, scalable | ✓ Good |
| Skip Chrome Bookmarks API | Complexity vs benefit; sync already works | ✓ Good |
| Design tokens system | Maintainable, consistent styling | ✓ Good |
| Pico CSS override at :root | Maintain base while customizing | ✓ Good |

---
*Last updated: 2026-01-28 after v1.2.1 milestone*
