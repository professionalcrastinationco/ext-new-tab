---
phase: 05-ui-glassmorphism-polish
plan: 01
subsystem: ui-styling
tags: [css, design-tokens, glassmorphism, dark-theme]

dependency-graph:
  requires: []
  provides: [design-tokens, unified-theme-foundation]
  affects: [05-02, 05-03, 05-04]

tech-stack:
  added: []
  patterns: [css-custom-properties, design-tokens, pico-css-override]

key-files:
  created:
    - tokens.css
  modified:
    - manage.html

decisions:
  - name: Pico CSS Variable Override Strategy
    choice: Override at :root level with --pico-* prefix
    rationale: Maintains Pico base styling while applying custom theme

metrics:
  duration: ~3 minutes
  completed: 2026-01-28
---

# Phase 5 Plan 1: Design Tokens Foundation Summary

**One-liner:** Created unified CSS custom properties system (tokens.css) with slate-based colors, glassmorphism effects, 8px spacing grid, and applied dark theme to manage.html.

## What Was Done

### Task 1: Create tokens.css with design system

Created `tokens.css` (96 lines) in root directory containing:

**Color Palette (Slate-based):**
- `--color-base: #0f172a` - Body background
- `--color-surface-1/2/3` - rgba surfaces at 0.6/0.8/0.5 opacity
- `--color-border`, `--color-border-focus` - Default and focus borders
- `--color-text`, `--color-text-muted`, `--color-text-subtle` - Text hierarchy
- `--color-primary: #0ea5e9`, `--color-primary-hover`, `--color-accent: #22d3ee`

**Glassmorphism Effects:**
- `--glass-blur: 20px`, `--glass-blur-subtle: 10px`, `--glass-blur-heavy: 30px`
- `--glass-bg-light/medium/heavy` - Layered glass backgrounds
- `--glass-border`, `--glass-border-glow` - Standard and focus borders
- `--glass-shadow` - Multi-layer shadow from context menu
- `--glass-shadow-subtle`, `--glass-shadow-elevated` - Shadow variants

**Spacing (8px grid):**
- `--space-1` through `--space-12` (4px to 48px)

**Border Radius:**
- `--radius-sm` through `--radius-pill` (4px to 50px)

**Typography:**
- `--font-family` - System font stack
- `--font-size-sm/base/lg/xl/2xl` - Size scale

**Transitions:**
- `--transition-fast/base/slow/bounce` - Animation timing

### Task 2: Update manage.html to use tokens and dark background

Modified `manage.html` head section:
1. Added `<link rel="stylesheet" href="tokens.css">` before styles.css
2. Added inline `<style>` block that:
   - Maps Pico CSS variables to design tokens (`--pico-background-color`, `--pico-card-background-color`, `--pico-muted-border-color`)
   - Sets body background to `var(--color-base)` (#0f172a)

## Verification Results

| Check | Status |
|-------|--------|
| tokens.css exists | PASS (96 lines) |
| All token categories present | PASS (32 token definitions) |
| manage.html imports tokens.css | PASS (line 8) |
| tokens.css imported before styles.css | PASS |
| manage.html uses #0f172a background | PASS (via var(--color-base)) |

## Deviations from Plan

None - plan executed exactly as written.

## Files Changed

| File | Change Type | Lines |
|------|-------------|-------|
| tokens.css | Created | 96 |
| manage.html | Modified | +10 lines |

## Key Code Snippets

**tokens.css excerpt (glassmorphism effects):**
```css
--glass-blur: 20px;
--glass-bg-light: rgba(30, 41, 59, 0.6);
--glass-border: 1px solid rgba(148, 163, 184, 0.2);
--glass-shadow:
  0 0 0 1px rgba(255, 255, 255, 0.08),
  0 2px 2px rgb(0 0 0 / 3%),
  0 4px 4px rgb(0 0 0 / 4%),
  0 10px 8px rgb(0 0 0 / 5%),
  0 15px 15px rgb(0 0 0 / 6%),
  0 30px 30px rgb(0 0 0 / 7%),
  0 70px 65px rgb(0 0 0 / 9%);
```

**manage.html Pico override:**
```css
:root {
  --pico-background-color: var(--color-base);
  --pico-card-background-color: var(--glass-bg-light);
  --pico-muted-border-color: var(--color-border);
}
body {
  background-color: var(--color-base);
}
```

## Next Phase Readiness

Ready for 05-02 (Glass Category Cards):
- Design tokens are available via tokens.css import
- manage.html already imports tokens.css
- `.glass-card` pattern can be applied to category containers
- All spacing, radius, and glass effect values are tokenized

## Notes

- Token values extracted directly from working newtab.css patterns
- Context menu's layered shadow used as `--glass-shadow` (proven to look professional)
- Pico CSS override strategy allows incremental adoption without breaking existing styling
