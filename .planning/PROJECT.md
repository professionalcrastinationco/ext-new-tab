# Quick Bookmarks

## What This Is

A Chrome extension that replaces the new tab page with a macOS-inspired dock showing categorized bookmarks. Users can quickly add bookmarks via popup, organize them into emoji-labeled categories, and access them from a clean, dark-themed interface with Google search integration.

## Core Value

Fast access to frequently used bookmarks from the new tab page without navigating Chrome's bookmarks menu.

## Current State

**Shipped:** v1.0 UI Polish (2026-01-28)

Polished Chrome extension with:
- Consolidated CSS in external stylesheets (newtab.css, popup.css, styles.css)
- Shared utilities in utils.js
- Unified dark slate theme with cyan accents
- Native HTML5 `<dialog>` modals
- Emoji-enriched empty states

**Codebase:** 5,492 LOC (JavaScript/CSS/HTML), vanilla JS, no build step

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

### Active

- [ ] Integrate Phosphor Icons (replace emoji icons)
- [ ] Integrate with Chrome bookmark system

### Out of Scope

- Firefox/Safari support — Chrome-only per constraint
- Build step or bundler — keeping vanilla JS architecture
- Test framework — codebase is stable, manual testing sufficient
- Backend/cloud sync — Chrome storage sync is adequate

## Constraints

- **Stack**: Vanilla JavaScript, no frameworks, no build step
- **Platform**: Chrome extension only (Manifest V3)
- **Compatibility**: Chrome 88+ (MV3 minimum)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep vanilla JS | User preference, avoid complexity | Good |
| Chrome only | User preference, simplify testing | Good |
| Focus on UI polish first | User's primary pain point | Good |
| Translucent glassmorphism style | Modern macOS aesthetic | Good |
| Native `<dialog>` for modals | Better accessibility, standard API | Good |

---
*Last updated: 2026-01-28 after v1.0 milestone*
