# Roadmap: Quick Bookmarks

## Milestones

- ✅ [v1.0 UI Polish](milestones/v1.0-ROADMAP.md) (Phases 1-3) — SHIPPED 2026-01-28
- ✅ **v1.1 Icons** (Phase 4) — SHIPPED 2026-01-28
- 🚧 **v1.2 Glassmorphism Polish** (Phase 5) — in progress

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

## 🚧 v1.2 Glassmorphism Polish (In Progress)

**Milestone Goal:** Unify the visual design across all extension surfaces with consistent glassmorphism styling, proper spacing, and cohesive component design.

### Phase 5: UI Glassmorphism Polish

**Goal:** Apply consistent glassmorphism effect (like the context menu) across all UI components, fix padding/margin inconsistencies, and create visual coherence
**Depends on:** v1.1 complete
**Research:** TBD
**Plans:** 3

**Design direction:**
- Keep: Rounded search field style, current color palette
- Apply everywhere: Glassmorphism effect from right-click context menu (`backdrop-filter: blur`, semi-transparent gradients, layered shadows)
- Fix: Padding/margin inconsistencies across manage page, modals, dock, buttons

**Known issues (from screenshots):**
- Manage page: Disjointed button styles, inconsistent card styling
- Edit Category modal: Different styling than other components
- Dock category icon: Different treatment than other elements
- Settings icon: Lacks cohesive styling with rest of UI

Plans:
- [x] 05-01: Design Tokens Foundation (tokens.css + manage.html background)
- [x] 05-02: Glass Components (categories, buttons, inputs)
- [ ] 05-03: Modals & Link Items (dialogs, links, empty states)

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
| 5. UI Glassmorphism Polish | v1.2 | 2/3 | In progress | - |
