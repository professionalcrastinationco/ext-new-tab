# Roadmap: Quick Bookmarks

## Milestones

- ✅ [v1.0 UI Polish](milestones/v1.0-ROADMAP.md) (Phases 1-3) — SHIPPED 2026-01-28
- ✅ **v1.1 Icons** (Phase 4) — SHIPPED 2026-01-28
- ✅ [v1.2 Glassmorphism Polish](milestones/v1.2-ROADMAP.md) (Phase 5) — SHIPPED 2026-01-28
- ✅ [v1.2.1 UI Consistency Fix](milestones/v1.2.1-ROADMAP.md) (Phase 5.1) — SHIPPED 2026-01-28
- ✅ [v1.3 Quick Access Icons](milestones/v1.3-ROADMAP.md) (Phase 6) — SHIPPED 2026-01-29

---

## Current Status

All planned milestones complete. Extension is feature-complete for current needs.

---

## Completed Milestones (v1.3)

<details>
<summary>✅ v1.3 Quick Access Icons (Phase 6) — SHIPPED 2026-01-29</summary>

**Milestone Goal:** Add customizable quick access icons/links for frequently used websites directly under the search bar.

### Phase 6: Quick Access Icons

**Goal:** Add user-editable quick access icon strip below the search bar with custom SVG icons matching the extension's visual style
**Depends on:** Phase 5.1
**Plans:** 3

Plans:
- [x] 06-01: Data Layer & Icons (brand SVGs + storage CRUD)
- [x] 06-02: UI Component & Rendering (HTML/CSS/JS display)
- [x] 06-03: Edit Modal & Settings (context menu + modal for add/edit/delete)

</details>

## Completed Milestones (v1.2.1)

<details>
<summary>✅ v1.2.1 UI Consistency Fix (Phase 5.1) — SHIPPED 2026-01-28</summary>

### Phase 5.1: Category Card Glassmorphism

**Goal:** Match category card styling to the context menu glassmorphism effect
**Plans:** 1

- [x] 5.1-01: Bookmark card glassmorphism update

</details>

---

## Completed Milestones

<details>
<summary>✅ v1.0 UI Polish (Phases 1-3) — SHIPPED 2026-01-28</summary>

- [x] Phase 1: CSS Consolidation (2/2 plans) — completed 2026-01-28
- [x] Phase 2: UI Polish (4/4 plans) — completed 2026-01-28
- [x] Phase 3: Modal Standardization (1/1 plan) — completed 2026-01-28

</details>

## Completed Milestones (v1.1)

<details>
<summary>✅ v1.1 Icons (Phase 4) — SHIPPED 2026-01-28</summary>

**Milestone Goal:** Replace emoji icons with professional Phosphor Icons.

### Phase 4: Phosphor Icons

**Goal**: Replace all emoji icons throughout the extension with Phosphor Icons library
**Plans**: 3

- [x] 04-01: Icon module + manifest PNG conversion
- [x] 04-02: Replace UI icons in all pages
- [x] 04-03: Category icon picker component

</details>

## Completed Milestones (v1.2)

<details>
<summary>✅ v1.2 Glassmorphism Polish (Phase 5) — SHIPPED 2026-01-28</summary>

**Milestone Goal:** Unify the visual design across all extension surfaces with consistent glassmorphism styling, proper spacing, and cohesive component design.

### Phase 5: UI Glassmorphism Polish

**Goal:** Apply consistent glassmorphism effect (like the context menu) across all UI components, fix padding/margin inconsistencies, and create visual coherence
**Plans:** 3

Plans:
- [x] 05-01: Design Tokens Foundation (tokens.css + manage.html background)
- [x] 05-02: Glass Components (categories, buttons, inputs)
- [x] 05-03: Modals & Link Items (dialogs, links, empty states)

</details>

---

## Decisions

- **Chrome Bookmarks integration skipped** (2026-01-28): Researched but decided against. Complexity outweighs benefits since chrome.storage.sync already syncs across devices. JSON export/import already exists in `import-export.js` for data portability.

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. CSS Consolidation | v1.0 | 2/2 | Complete | 2026-01-28 |
| 2. UI Polish | v1.0 | 4/4 | Complete | 2026-01-28 |
| 3. Modal Standardization | v1.0 | 1/1 | Complete | 2026-01-28 |
| 4. Phosphor Icons | v1.1 | 3/3 | Complete | 2026-01-28 |
| 5. UI Glassmorphism Polish | v1.2 | 3/3 | ✅ Shipped | 2026-01-28 |
| 5.1 Category Card Glassmorphism | v1.2.1 | 1/1 | ✅ Shipped | 2026-01-28 |
| 6. Quick Access Icons | v1.3 | 3/3 | ✅ Shipped | 2026-01-29 |
