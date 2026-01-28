# Quick Bookmarks

## What This Is

A Chrome extension that replaces the new tab page with a macOS-inspired dock showing categorized bookmarks. Users can quickly add bookmarks via popup, organize them into emoji-labeled categories, and access them from a clean, dark-themed interface with Google search integration.

## Core Value

Fast access to frequently used bookmarks from the new tab page without navigating Chrome's bookmarks menu.

## Requirements

### Validated

- ✓ New tab page with macOS-style dock UI — existing
- ✓ Quick-add popup for current page — existing
- ✓ Categories with emoji icons — existing
- ✓ Drag-and-drop reordering — existing
- ✓ Import/export functionality — existing
- ✓ Settings (dock position, link behavior) — existing
- ✓ Right-click context menu — existing
- ✓ Google search integration — existing
- ✓ Chrome storage sync — existing

### Active

- [ ] Fix search icon spacing in Google search box
- [ ] Adjust spacing/padding on dock category icons
- [ ] Unify theme (dark) across popup and new tab
- [ ] Improve manage page button layout
- [ ] Standardize modals to use native `<dialog>` element
- [ ] Add empty state visual feedback for dock

### Out of Scope

- Firefox/Safari support — Chrome-only per constraint
- Build step or bundler — keeping vanilla JS architecture
- Test framework — codebase is stable, manual testing sufficient for now
- Backend/cloud sync — Chrome storage sync is adequate

## Context

**Current state:** Functional Chrome extension with all core features working. UI needs polish to feel professional.

**Architecture:** Vanilla JavaScript modules loaded via script tags, Pico CSS for base styling, no build step. Manifest V3 compliant.

**Tech debt identified:**
- Duplicated utility functions across files (escapeHtml, getFaviconUrl)
- 660 lines of inline CSS in newtab.html
- Mixed modal patterns (custom div vs native dialog)

## Constraints

- **Stack**: Vanilla JavaScript, no frameworks, no build step
- **Platform**: Chrome extension only (Manifest V3)
- **Compatibility**: Chrome 88+ (MV3 minimum)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep vanilla JS | User preference, avoid complexity | — Pending |
| Chrome only | User preference, simplify testing | — Pending |
| Focus on UI polish first | User's primary pain point | — Pending |

---
*Last updated: 2026-01-28 after initialization*
