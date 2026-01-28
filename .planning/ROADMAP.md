# Roadmap: Quick Bookmarks

## Milestones

- ✅ [v1.0 UI Polish](milestones/v1.0-ROADMAP.md) (Phases 1-3) — SHIPPED 2026-01-28
- 🚧 **v1.1 Icons & Chrome Integration** — Phases 4-5 (in progress)

## Completed Milestones

<details>
<summary>✅ v1.0 UI Polish (Phases 1-3) — SHIPPED 2026-01-28</summary>

- [x] Phase 1: CSS Consolidation (2/2 plans) — completed 2026-01-28
- [x] Phase 2: UI Polish (4/4 plans) — completed 2026-01-28
- [x] Phase 3: Modal Standardization (1/1 plan) — completed 2026-01-28

</details>

## 🚧 v1.1 Icons & Chrome Integration (In Progress)

**Milestone Goal:** Replace emoji icons with professional Phosphor Icons and integrate with Chrome's native bookmark system for persistent storage.

### Phase 4: Phosphor Icons

**Goal**: Replace all emoji icons throughout the extension with Phosphor Icons library, handling Chrome extension CORS constraints
**Depends on**: v1.0 complete
**Research**: Likely (external library, Chrome extension CORS)
**Research topics**: Phosphor Icons bundling options, Chrome extension CSP/CORS requirements, icon subset extraction
**Plans**: TBD

Plans:
- [ ] 04-01: TBD (run /gsd:plan-phase 4 to break down)

### Phase 5: Chrome Bookmarks

**Goal**: Integrate with Chrome Bookmarks API to store/restore bookmarks in a dedicated folder, mirroring extension's category structure
**Depends on**: Phase 4
**Research**: Likely (Chrome Bookmarks API, MV3 permissions)
**Research topics**: chrome.bookmarks API, folder creation/sync patterns, permission requirements
**Plans**: TBD

Plans:
- [ ] 05-01: TBD (run /gsd:plan-phase 5 to break down)

## Progress

**Execution Order:**
Phases execute in numeric order: 4 → 5

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. CSS Consolidation | v1.0 | 2/2 | Complete | 2026-01-28 |
| 2. UI Polish | v1.0 | 4/4 | Complete | 2026-01-28 |
| 3. Modal Standardization | v1.0 | 1/1 | Complete | 2026-01-28 |
| 4. Phosphor Icons | v1.1 | 0/? | Not started | - |
| 5. Chrome Bookmarks | v1.1 | 0/? | Not started | - |
