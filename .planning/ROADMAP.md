# Roadmap: Quick Bookmarks

## Overview

Transform the functional Chrome extension into a polished, professional-feeling product by consolidating scattered CSS into a maintainable stylesheet, fixing UI spacing and layout issues, and standardizing modal patterns across the codebase.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: CSS Consolidation** - Extract inline styles, create shared stylesheet, remove duplication
- [x] **Phase 2: UI Polish** - Fix spacing issues, improve layouts, add empty state feedback
- [x] **Phase 3: Modal Standardization** - Convert custom modals to native dialog element

## Phase Details

### Phase 1: CSS Consolidation
**Goal**: Extract 660+ lines of inline CSS from newtab.html into organized external stylesheets, eliminate duplicated utility functions
**Depends on**: Nothing (first phase)
**Research**: Unlikely (internal patterns, file restructuring)
**Plans**: TBD

Plans:
- [x] 01-01: Extract inline CSS to external stylesheet
- [x] 01-02: Consolidate duplicated utilities (escapeHtml, getFaviconUrl)

### Phase 2: UI Polish
**Goal**: Fix visual issues identified in PROJECT.md — search icon spacing, dock category padding, manage page layout, theme unification, empty states
**Depends on**: Phase 1
**Research**: Unlikely (CSS adjustments, internal patterns)
**Plans**: TBD

Plans:
- [x] 02-01: Fix search box and dock spacing issues
- [x] 02-02: Improve manage page button layout
- [x] 02-03: Unify dark theme across popup and new tab
- [x] 02-04: Add empty state visual feedback

### Phase 3: Modal Standardization
**Goal**: Replace custom div-based modals with native HTML5 `<dialog>` element for consistency and accessibility
**Depends on**: Phase 2
**Research**: Unlikely (native dialog is standard HTML5)
**Plans**: TBD

Plans:
- [x] 03-01: Convert settings modal and add confirm dialog

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. CSS Consolidation | 2/2 | Complete | 2026-01-28 |
| 2. UI Polish | 4/4 | Complete | 2026-01-28 |
| 3. Modal Standardization | 1/1 | Complete | 2026-01-28 |
