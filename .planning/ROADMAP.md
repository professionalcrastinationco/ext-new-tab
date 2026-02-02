# Roadmap: Quick Bookmarks

## Milestones

- ✅ [v1.0 UI Polish](milestones/v1.0-ROADMAP.md) (Phases 1-3) — SHIPPED 2026-01-28
- ✅ **v1.1 Icons** (Phase 4) — SHIPPED 2026-01-28
- ✅ [v1.2 Glassmorphism Polish](milestones/v1.2-ROADMAP.md) (Phase 5) — SHIPPED 2026-01-28
- ✅ [v1.2.1 UI Consistency Fix](milestones/v1.2.1-ROADMAP.md) (Phase 5.1) — SHIPPED 2026-01-28
- ✅ [v1.3 Quick Access Icons](milestones/v1.3-ROADMAP.md) (Phase 6, 6.1, 6.2) — SHIPPED 2026-01-29
- 🚧 **v1.4 Settings & Manager UI Overhaul** (Phases 7-9) — IN PROGRESS

---

## Current Status

**Current Milestone:** v1.4 Settings & Manager UI Overhaul
**Status:** Ready to plan Phase 7

---

## 🚧 v1.4 Settings & Manager UI Overhaul (In Progress)

**Milestone Goal:** Unify manage.html and popup.html with newtab.html's glassmorphism aesthetic using the approved mockup designs.

**Design Decisions (confirmed via mockups):**
- Manage page: #3 Minimal Centered (floating pill toolbar, accordion categories)
- Popup: #3 Floating Card (newtab-style card, dropdown for category)
- Edit Category modal: #3 Floating
- Edit Bookmark modal: #3 Floating

### Phase 7: Manage Page Overhaul

**Goal:** Rebuild manage.html with minimal centered design — floating pill toolbar, accordion categories, centered layout
**Depends on:** Phase 6.2
**Research:** Unlikely (mockup approved, internal patterns)
**Plans:** TBD

Plans:
- [ ] 07-01: TBD (run /gsd:plan-phase 7 to break down)

### Phase 8: Popup Redesign

**Goal:** Rebuild popup.html with floating card design — newtab-style glassmorphism card, dropdown category selector
**Depends on:** Phase 7
**Research:** Unlikely (mockup approved, internal patterns)
**Plans:** TBD

Plans:
- [ ] 08-01: TBD (run /gsd:plan-phase 8 to break down)

### Phase 9: Modal Unification

**Goal:** Apply floating modal style to Edit Category and Edit Bookmark modals across all pages
**Depends on:** Phase 8
**Research:** Unlikely (mockup approved, internal patterns)
**Plans:** TBD

Plans:
- [ ] 09-01: TBD (run /gsd:plan-phase 9 to break down)

---

## Completed Milestones (v1.3)

<details>
<summary>✅ v1.3 Quick Access Icons (Phase 6, 6.1, 6.2) — SHIPPED 2026-01-29</summary>

**Milestone Goal:** Add customizable quick access icons/links for frequently used websites directly under the search bar.

### Phase 6: Quick Access Icons ✅

**Goal:** Add user-editable quick access icon strip below the search bar with custom SVG icons matching the extension's visual style
**Depends on:** Phase 5.1
**Plans:** 3

Plans:
- [x] 06-01: Data Layer & Icons (brand SVGs + storage CRUD)
- [x] 06-02: UI Component & Rendering (HTML/CSS/JS display)
- [x] 06-03: Edit Modal & Settings (context menu + modal for add/edit/delete)

### Phase 6.1: Real Brand Logos ✅

**Goal:** Replace custom Phosphor-style brand icons with official monochrome versions of Claude, ChatGPT, and GitHub logos while maintaining the current color palette
**Depends on:** Phase 6
**Plans:** 1

Plans:
- [x] 06.1-01: Replace brand icon SVGs with official logos

### Phase 6.2: Icon Fixes (INSERTED) ✅

**Goal:** Replace Iceberg icon with Kanban icon, replace Anthropic "A" logo with Claude logo, ensure consistent icon sizing
**Depends on:** Phase 6.1
**Plans:** 1

Plans:
- [x] 06.2-01: Icon updates (Claude starburst + Kanban icon)

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
| 6. Quick Access Icons | v1.3 | 3/3 | ✅ Complete | 2026-01-28 |
| 6.1 Real Brand Logos | v1.3 | 1/1 | ✅ Complete | 2026-01-29 |
| 6.2 Icon Fixes | v1.3 | 1/1 | ✅ Complete | 2026-01-29 |
| 7. Manage Page Overhaul | v1.4 | 0/? | Not started | - |
| 8. Popup Redesign | v1.4 | 0/? | Not started | - |
| 9. Modal Unification | v1.4 | 0/? | Not started | - |
