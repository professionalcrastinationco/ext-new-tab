# Dockside Design Pass Spec (2026-11-11)

Figma: https://www.figma.com/design/XfMRXTyiXBJSSkQhwvQhSL (file "Dockside UI Design Pass", pages Tokens, Components, Screens).
No extension code was changed. This doc is enough to implement without opening Figma.

Goal: new tab, Manage page, popup and every modal read as one product: same mesh background, one system font stack, one primary button, explicit interaction states, aligned settings rows, consistent modal header, brand header on Manage and popup.

## 0. FINAL DOCK AND QUICK LINKS (owner chose the hybrid, 2026-11-11)

This section SUPERSEDES every "Dock A", "Dock B", "dock icon", "quick link" and "folder panel dock" statement further down. Goal: as noiseless as possible, context only on hover.

Figma: Screens page frames 1 New Tab (24:528), 2 First-Run (24:589), 3 Category Dock Open (24:657), 4 Apps Menu (24:722), Settings backdrop (6:117). Dock Options page "Final Dock (Hybrid)" frames: Default 24:1049, Hover On Dock Icon 24:1110, Hover On Quick Link 24:1173, Active Category 24:1236, Night Sky Aurora Default 24:1298, Night Sky Aurora Hover 24:1431. Components: "Dock Icon" (State: Default, Hover, Pressed, Focus, Active, Disabled) and "Quick Link" (same states).

### 0.1 Glass dock (one pill, translucent)
Same pill as the search bar: fully rounded, 64px high, same 1px border. It is the single owner-approved exception to "no transparency" (token `--surface-glass`).
```css
:root {
  --surface-glass: rgba(255, 255, 255, 0.08);  /* white at 8%: clearly translucent, the mesh shows through */
  --border-glass: rgba(255, 255, 255, 0.14);   /* white at 14%, 1px dock outline */
}

.dock {
  position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%);
  display: flex; align-items: center; gap: var(--space-8);
  height: 64px; padding: 0 var(--space-16);
  background: var(--surface-glass);
  -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-resting);
}
```
Exact values: background `rgba(255,255,255,0.08)`, border `1px solid rgba(255,255,255,0.14)`, `backdrop-filter: blur(20px)`, radius 999px, height 64px. The blur only shows when something behind the dock has detail (glow, light shape, stars); on the plain dark mesh the dock simply reads as a faint lighter pill. The dock is centered, 24px from the bottom of the window (top edge at 712px in an 800px window). If the window is short, keep the bottom offset. No container labels, no card per icon.

### 0.2 Dock icon (icons only by default, name on hover)
Each icon is a 44 x 44 circular hit area (`border-radius: var(--radius-pill)`) holding a 26px icon. By default there is nothing but the icon (`--text-muted`).
```css
.dock-icon { position: relative; width: 44px; height: 44px; border-radius: var(--radius-pill); background: transparent; color: var(--text-muted);
  transition: background-color var(--transition), color var(--transition); }
.dock-icon:hover, .dock-icon:focus-visible { background: var(--border-glass); color: var(--text); }  /* stacks on the glass, so it reads lighter */
.dock-icon:active { background: var(--border); }
.dock-icon:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 0; }
.dock-icon.active { color: var(--focus-ring); }                     /* open category: cyan icon, no highlight */
.dock-icon.active::after { content: ""; position: absolute; left: 20px; top: 37px; width: 4px; height: 4px; border-radius: 50%; background: var(--focus-ring); } /* small dot under the icon */

/* name label: small tooltip pill ABOVE the icon (chosen over the expanding pill: it never shifts the other icons) */
.dock-icon .tip { position: absolute; left: 50%; bottom: calc(100% + 6px); transform: translateX(-50%) translateY(2px);
  padding: 4px 8px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-pill);
  box-shadow: var(--shadow-resting); font-size: var(--text-label); line-height: 16px; color: var(--text); white-space: nowrap;
  opacity: 0; pointer-events: none; transition: opacity var(--transition), transform var(--transition); }
.dock-icon:hover .tip, .dock-icon:focus-visible .tip { opacity: 1; transform: translateX(-50%) translateY(0); }
```
The dock must not clip overflow (`overflow: visible`) so the tooltip can sit above it. Behavior: hover or keyboard focus shows a circular `--border-glass` highlight (white at 14%, it stacks on the glass fill) behind the icon, brightens the icon to `--text`, and fades the category name in above it over 0.15s ease. Chosen: tooltip above, because the expanding name pill would push the neighboring icons sideways (layout shift).

### 0.3 Quick links (icon only by default, label on hover)
No card, border or tile. The label slot is always reserved so nothing shifts; the label is just transparent until hover.
```css
.quick-link { width: 80px; height: 72px; display: flex; flex-direction: column; align-items: center; gap: var(--space-8); padding-top: 4px;
  color: var(--text-muted); background: none; border: 0;
  transition: color var(--transition), transform var(--transition); }
.quick-link .label { font-size: var(--text-label); line-height: 16px; color: var(--text-muted); opacity: 0; transition: opacity var(--transition); }
.quick-link:hover, .quick-link:focus-visible { color: var(--text); transform: translateY(-2px); }
.quick-link:hover .label, .quick-link:focus-visible .label { opacity: 1; }
.quick-link:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 0; border-radius: var(--radius-small); }
.quick-link:disabled { color: var(--text-muted); }
```
Icon 28px. Quick links are 24px apart, centered, row top about 36px under the search bar (468px in an 800px window). Hover: icon brightens to `--text`, lifts 2px, label fades in (0.15s ease). Pressed keeps the hover look.

### 0.3b Group dimming on hover (dock and quick links, each group on its own)
While one icon in a group is hovered or keyboard focused, the OTHER icons in that same group drop to 35% opacity. The hovered icon keeps full brightness with its existing highlight, lift and label. When nothing in the group is hovered, everything returns to normal. Works for any icon including the first and last. The dock and the quick links never dim each other. The active (open) category icon dims like the rest.
```css
.dock-icon, .quick-link { transition: background-color var(--transition), color var(--transition), transform var(--transition), opacity var(--transition); }  /* add opacity to the existing transitions, 0.15s ease in and out */

/* dock */
.dock:has(.dock-icon:hover) .dock-icon:not(:hover),
.dock:has(.dock-icon:focus-visible) .dock-icon:not(:focus-visible) { opacity: .35; }

/* quick links (container class .quick-links wraps the four links) */
.quick-links:has(.quick-link:hover) .quick-link:not(:hover),
.quick-links:has(.quick-link:focus-visible) .quick-link:not(:focus-visible) { opacity: .35; }
```
Use `:has(.dock-icon:hover)` (not `.dock:hover`), so hovering the padding or the gaps between icons does not dim everything. 35% was chosen after trying the frames: icons stay recognizable but clearly recede; below 30% they start to read as disabled. Do not apply the dimming to the tooltip (it lives inside the hovered icon, so it stays bright). `:has()` is supported in Chrome 105 and later, which is fine for an extension.

Figma: component variants `Dock Icon / State=Dimmed` and `Quick Link / State=Dimmed` (35% opacity) document the sibling state, with a group rule note under each set. Example frames on the Dock Options page: Hover On Dock Icon 24:1110 (Learning hovered, others dimmed), Hover On Quick Link 24:1173 (Calendar hovered, other three dimmed, dock untouched), Night Sky Aurora Hover 24:1431 (Work hovered, Dev active icon dimmed too).

### 0.4 Readability on both backgrounds
Checked in Figma over Spotlight Mesh and over Night Sky Aurora (including the bottom horizon bloom behind the dock): the 8% white fill plus 20px blur keeps the `--text-muted` icons and the cyan active icon readable, and the 14% white outline keeps the pill edge visible on both. The Final Dock frames put a cyan and blue glow and a light bar behind the dock to prove the see-through blur. Tuned: only the hover highlight (now `--border-glass`); the cyan active icon stayed readable as is. If it gets weak on a bright wallpaper, raise the fill toward 12%, not above 20%. The Night Sky frames in Figma use an approximation of the animated background (static gradient, glows and stars).

### 0.5 Other screens
Every screen that shows the dock uses the glass pill with icons only: New Tab, First-Run (dock sits dimmed under the scrim), Category Dock Open (Dev active, panel sits 16px above the dock), Apps Menu (menu ends at 700px, clear of the dock top at 712px), Settings backdrop. Quick links appear on New Tab and the Apps Menu frame only. Delete the Dock A and Dock B variants and the five Dock Options options (removed from Figma).

### 0.6 Token additions
Add to the token list in section 1.1: `--surface-glass: rgba(255, 255, 255, 0.08);` and `--border-glass: rgba(255, 255, 255, 0.14);` (Figma variables `surface-glass` and `border-glass`, plus effect style `glass` = background blur 20 and shadow-resting). Figma now has 20 variables and 3 effect styles. No existing variable fit the border: `--border` is opaque slate-700.

## 1. Tokens (SIMPLIFIED, owner approved 2026-11-11): replace the contents of tokens.css :root

Final set: 11 colors, 3 radii, 4 spacings, 4 type sizes (8 size and weight combos), 2 shadows, 1 motion value. Figma has 18 variables (down from 47), 8 text styles (down from 9), 2 effect styles (down from 4). Every fill, stroke, radius, gap and padding in the Figma file is bound to these.

IMPORTANT: the state tables and per-screen notes further down were written with the old color names and hex values. Read them through the mapping table in section 1.4: for example "#0f172a" now means `--surface`, "#1e293b" means `--surface-hover`, "#334155" means `--border`, "#083344" means `--surface-hover`, "#22d3ee" means `--focus-ring`.

### 1.1 CSS custom properties
```css
:root {
  /* colors (11) */
  --background: #0b1224;      /* page base under the mesh */
  --surface: #0f172a;         /* slate-900: cards, modals, pills, popovers, dock bar, search bar */
  --surface-hover: #1e293b;   /* slate-800: inputs, selects, rows, secondary buttons, hover fill, dividers, disabled fill, icon tint tiles */
  --border: #334155;          /* slate-700: all borders; also hover and pressed fill on raised items */
  --text: #f1f5f9;            /* slate-100: all primary text, white text on buttons */
  --text-muted: #94a3b8;      /* slate-400: secondary text, icons, placeholders, disabled text, checkbox tick */
  --accent: #0891b2;          /* cyan-600: primary buttons */
  --accent-hover: #0e7490;    /* cyan-700: primary hover and pressed */
  --danger: #dc2626;          /* red-600: danger buttons, delete icons */
  --focus-ring: #22d3ee;      /* cyan-400: focus ring, active icons, cyan icon accents, glow dot */
  --surface-glass: rgba(255, 255, 255, 0.08); /* dock pill fill only, see section 0 */
  --border-glass: rgba(255, 255, 255, 0.14);  /* dock pill border only */
  --warning: #fbbf24;         /* amber-400: the one warning icon (Cannot Bookmark popup). Added because a warning needs a color that is not danger or accent. */

  /* radii (3) */
  --radius-small: 8px;        /* checkbox, buttons, inputs, selects, tiles, rows, icon grid */
  --radius-medium: 16px;      /* cards, modals, popovers, panels, category cards */
  --radius-pill: 999px;       /* search bar, docks, tooltips, chips */

  /* spacing (4): all gaps and paddings use one of these. 2px line gaps in text stacks are typography, not spacing. */
  --space-8: 8px; --space-16: 16px; --space-24: 24px; --space-32: 32px;

  /* type sizes (4), weights 400 / 500 / 600 */
  --font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  --text-label: 12px;   /* line 16 */
  --text-body: 14px;    /* line 20 */
  --text-heading: 18px; /* line 24 */
  --text-title: 28px;   /* line 36 */

  /* shadows (2) */
  --shadow-resting: 0 8px 24px rgba(2,6,23,.35);                              /* search bar, docks, tooltips */
  --shadow-raised: 0 24px 64px rgba(2,6,23,.55), 0 4px 12px rgba(2,6,23,.30); /* modals, popovers, panels */

  /* motion (1) */
  --transition: 0.15s ease;   /* use for every transition */
}
/* focus: outline: 2px solid var(--focus-ring); outline-offset: 0; */
```
Delete every other custom property in tokens.css (the old glass tokens, `--glass-*`, `--color-*`, `--space-1..12`, `--radius-sm..2xl`, `--font-size-*`, `--transition-fast/base/slow/bounce`). Delete the sky-blue `#0ea5e9` and `#0284c7` primaries.

### 1.2 Text styles (Figma name: size / line, weight, use)
| Style | Size / line | Weight | Use |
|---|---|---|---|
| title-semibold | 28 / 36 | 600 | page titles, empty state titles |
| heading-semibold | 18 / 24 | 600 | modal titles, category names, folder title, brand name |
| heading-regular | 18 / 24 | 400 | search bar text |
| body-semibold | 14 / 20 | 600 | buttons |
| body-medium | 14 / 20 | 500 | row titles, field labels |
| body-regular | 14 / 20 | 400 | body text, inputs, selects |
| label-regular | 12 / 16 | 400 | domain, counts, helper text |
| label-caps | 12 / 16 | 500, uppercase, +8% tracking | modal eyebrow, settings section labels |

### 1.3 Spotlight Mesh (unchanged recipe, not a token)
See the recipe block below (section "Spotlight Mesh").

### 1.4 Mapping: old value to new token (replace mechanically)

Named tokens and hex values in the old tokens.css and Figma file:
| Old | New |
|---|---|
| `--color-base`, `#0b1224`, page background `#0f172a` | `--background` |
| `--color-surface-1`, `--color-surface-2`, `#0f172a` or `#162033` as card fill | `--surface` |
| `#1e293b` (slate-800), `--color-surface-3`, disabled bg, `#083344` icon tint | `--surface-hover` |
| `#263247`, `#334155` used as hover or pressed fill | `--border` |
| `#334155`, `#475569` borders, `--color-border`, `--glass-border` | `--border` |
| `#1e293b` divider or subtle border | `--surface-hover` |
| `--color-text`, `#f1f5f9`, `#cbd5e1`, `#fff` on buttons | `--text` |
| `--color-text-muted`, `--color-text-subtle`, `#94a3b8`, `#64748b`, disabled text, checkbox tick | `--text-muted` |
| `--color-primary` `#0ea5e9`, `#06b6d4`, `#0891b2` | `--accent` |
| `--color-primary-hover` `#0284c7`, `#0e7490`, `#155e75` (pressed) | `--accent-hover` |
| `--color-accent` `#22d3ee`, `#06b6d4` as outline or ring, cyan-400 icon color | `--focus-ring` |
| `#ef4444`, `#dc2626`, `#b91c1c`, `#991b1b`, `#f87171` | `--danger` |
| `#fbbf24`, `#d97706` | `--warning` |
| success greens `#22c55e`, `rgba(34,197,94,...)`, `#059669`, `#34d399` | removed (no success state in the new design) |
| `--radius-sm` 4px, `--radius-md` 8px, 6px, 14px | `--radius-small` |
| `--radius-lg` 12px, `--radius-xl` 16px, `--radius-2xl` 20px | `--radius-medium` |
| `--radius-pill`, 50px, 999px, 50% on pills | `--radius-pill` |
| `--space-1..12` and raw px | nearest of 8, 16, 24, 32 (5 to 10 becomes 8, 11 to 20 becomes 16, 21 to 28 becomes 24, 29 and up becomes 32) |
| `--font-size-sm` .875rem, `--font-size-base` .95rem | 14px (`--text-body`) |
| `--font-size-lg` 1.125rem, `--font-size-xl` 1.25rem | 18px (`--text-heading`) |
| `--font-size-2xl` 1.5rem and the 2rem page title | 28px (`--text-title`) |
| 0.75rem, 11px, 12px | 12px (`--text-label`) |
| `--glass-shadow`, `--glass-shadow-subtle`, `0 8px 32px rgba(0,0,0,.3)` | `--shadow-resting` |
| `--glass-shadow-elevated`, `0 20px 50px rgba(0,0,0,.5)` | `--shadow-raised` |
| `--transition-fast`, `--transition-base`, `--transition-slow`, .2s, .3s | `--transition` |
| `--transition-bounce` (cubic-bezier .34,1.56,.64,1) | delete, use `--transition` |
| `--glass-blur*`, `backdrop-filter` | delete (solid fills only) |

The 69 one-off `rgba()` values in newtab.css, manage.css, popup.css and tokens.css (use count in brackets), grouped:
| Old rgba values | New token |
|---|---|
| rgba(148,163,184,.1) [14], (.15) [8], (.2) [12], (.25), (.3) [5], (.35) as borders and dividers | `--border` |
| rgba(255,255,255,.03), (.05) [3], (.08) [4], (.1) [10] as light overlays, hairlines, hover tints | `--surface-hover` (fills) or `--border` (lines) |
| rgba(51,65,85,.15), (.2) [5], (.25), (.3) [6], (.4) [4], (.45), (.5) [10], (.6) [6], (.8) [3] as raised and hover fills | `--surface-hover` (resting fill) and `--border` (hover or pressed fill) |
| rgba(30,41,59,.4), (.5), (.55), (.6) [4], (.7) [3], (.8) [3], (.9), (.92), (.95) as card and modal fills | `--surface` |
| rgba(15,23,42,.85), (.95) [2] as modal and popover fills | `--surface` |
| rgba(10,20,28,.09 to .8) [about 12], rgb(10,20,28) as dark panel and backdrop fills | `--surface` (panels) or `--background` at 75% (modal backdrop) |
| rgba(71,85,105,.8) | `--border` |
| rgba(6,182,212,.1) [7], (.2), (.3) [4], (.5) [12] cyan tints, borders, focus | `--surface-hover` (tint fill), `--focus-ring` (border or ring) |
| rgba(34,211,238,.03), (.1) [4], (.15), (.3) [2] cyan tints and glows | `--surface-hover` (tint) or `--focus-ring` (glow dot) |
| rgba(14,165,233,.3) [5], (.4) sky blue glows | `--accent` (solid) or removed |
| rgba(239,68,68,.1) [3], (.15), (.3) [2] red tints and borders | `--danger` for borders and icons, `--surface-hover` for tint fills |
| rgba(34,197,94,.15), (.3) green | removed |
| rgba(0,0,0,.05 to .7) [about 25] and `rgb(0 0 0 / 3% to 9%)` layered shadow steps | `--shadow-resting` or `--shadow-raised` (backdrop dim: `--background` at 75%) |
| rgba(255,255,255,.45), (.85) text on dark | `--text-muted`, `--text` |
| Mesh glows rgba(8,145,178,...), rgba(37,99,235,...), rgba(34,211,238,.06 and .14), rgba(2,6,23,...) | KEEP only inside the mesh recipe, not as tokens |

### 1.5 What changed visually (small)
- Modal, card and panel corners are 16px (were 20 and 12). Rows, tiles, inputs and buttons are 8px (were 8 and 12). The checkbox box is 8px (was 4).
- Hover and pressed fills on raised items (secondary buttons, selects, rows, icon button, picker tile) are all `--border` slate-700, one step brighter than the resting `--surface-hover`. Primary pressed equals primary hover. Select and input hover no longer change the border color (it already is `--border`).
- Icon tint tiles (modal header icon tile, picker selected fill) are slate-800 instead of dark cyan; the cyan stays on the icon (`--focus-ring`, cyan-400, unchanged).
- Disabled elements use `--surface-hover` fill and `--text-muted` text (no separate dimmer gray).
- Type: page title 28 (was 32), modal title and category names 18 (were 20 and 16), search text 18 (was 16), captions 12 (were 12 and 11). Spacing snapped to 8, 16, 24, 32, so a few paddings grew or shrank by up to 4px.
- Danger and delete icons use the single `--danger` red-600 (were red-400, so they read slightly darker).
- Modal backdrop is `--background` at 75% opacity.
- Brand artwork stays as literal colors, not tokens: the 16 colored tiles in the quick-link picker and the 9 colored icons in the Google Apps menu. They stand for real site icons.

### Spotlight Mesh (one class, `.mesh-bg`, used on newtab, manage and popup body)
```css
body {
  background-color: #0b1224;
  background-image:
    radial-gradient(ellipse farthest-corner at 50% 50%, rgba(2,6,23,0) 55%, rgba(2,6,23,.55) 100%),
    radial-gradient(ellipse 23vw 28vh at 50% 48%, rgba(34,211,238,.14), rgba(34,211,238,.06) 50%, rgba(34,211,238,0) 100%),
    radial-gradient(ellipse 36vw 42vh at 76% 70%, rgba(37,99,235,.30), rgba(37,99,235,.13) 50%, rgba(37,99,235,0) 100%),
    radial-gradient(ellipse 34vw 42vh at 27% 28%, rgba(8,145,178,.34), rgba(8,145,178,.15) 50%, rgba(8,145,178,0) 100%),
    linear-gradient(135deg, #0b1224 0%, #111c33 100%);
  background-attachment: fixed;
}
```
This is the exact stack already in newtab.css (lines about 98 to 104). Move it to tokens.css (or a shared `base.css`) and use it on manage.html and popup.html. In the 400px popup, use `background-size: 400px 100%` or swap the vw/vh sizes for percentages so the glows are visible (Figma uses glow sizes relative to the frame: 34% x 42%, 36% x 42%, 23% x 28%).

## 2. Components and states

Focus-visible for every interactive element: `outline: 2px solid var(--primary-ring); outline-offset: 0;` (outside the box, no layout shift). Hover and pressed use only the listed solid colors, never rgba overlays. Transitions: `background-color .15s ease, border-color .15s ease`. Disabled: `cursor: not-allowed`, no hover change, colors below.

### Buttons (height 40, padding 0 16, radius 8, gap 8, 14/600, icon 18 optional on the left)
| Type | Default | Hover | Pressed | Disabled |
|---|---|---|---|---|
| Primary | bg #0891b2, text #fff | bg #0e7490 | bg #155e75 | bg #1e293b, text #64748b |
| Secondary | bg #1e293b, border #334155, text #f1f5f9 | bg #263247, border #475569 | bg #334155, border #475569 | bg #1e293b, border #1e293b, text #64748b |
| Ghost | no bg, text #cbd5e1 | bg #1e293b | bg #334155 | text #64748b |
| Danger | bg #dc2626, text #fff | bg #b91c1c | bg #991b1b | same as Primary disabled |

Rules: Primary is the single focal action per screen. Primary replaces `.save-btn`, `.welcome-btn`, `.manage-categories-btn`, `.toolbar-btn` (Quick Add) and `.confirm-delete-btn` stays Danger. Secondary replaces `.cancel-btn` and `.secondary-btn`. No button is ever labeled "Reset". Labels are Title Case. A button never wraps its label (`white-space: nowrap`).

### Icon button (36 x 36, radius 8, icon 20): `.icon-btn`, `.close-btn`, `.settings-btn`
Default: transparent, icon #94a3b8. Hover: bg #1e293b, icon #f1f5f9. Pressed: bg #334155, icon #f1f5f9. Focus: ring. Disabled: icon #64748b.

### Dock icon (52 x 52 hit area, icon 26): `.dock-icon`. NO card, NO border on any icon in either dock style.
Two styles in Figma (owner picks one, see Dock A and Dock B frames):
- Style A, bare icons, no container (matches the real extension): the icons sit directly on the mesh, 16px apart, centered at the bottom (icon row top about 724px in an 800px frame).
  - Default: icon #94a3b8. Hover: icon #f1f5f9 and lifts 2px (`transform: translateY(-2px)`). Pressed: icon #cbd5e1, no lift. Active (folder open): icon #22d3ee. Focus: 2px ring around the 52px hit area. Disabled: icon #64748b. No background in any state.
- Style B, one shared dock: a single pill around all icons (bg #0f172a solid, border 1px #1e293b, radius 20, padding 8, gap 8, solid color, no backdrop blur). Icons inside stay bare.
  - Default and Active as in A. Hover: icon #f1f5f9 plus a subtle highlight behind that one icon only (bg #1e293b, radius 12), no lift. Pressed: highlight bg #334155. Focus and Disabled as in A.
Figma component: "Dock Icon" with properties Style (A, B) and State.

### Quick link (bare, no card): `.quick-link`, `.quick-link-icon`, `.quick-link-title`
80 x 72 hit area, vertical: icon 28 over a 12/400 label (#94a3b8), gap 8. No background, border or tile in any state.
Default: icon #94a3b8. Hover: icon #f1f5f9 and lifts 2px (label stays #94a3b8). Pressed: icon #cbd5e1. Focus: 2px ring. Disabled: icon and label #64748b. Quick links are 24px apart, centered 36px under the search bar.

### List row (manage `.link-item`, 64 high, radius 12, padding 12, gap 12)
Default bg #1e293b. Hover bg #263247. Pressed bg #334155. Focus ring. Disabled: text #64748b. Drag handle (`.link-drag`) and the edit and delete icons (`.link-actions`) are always in the layout and use `opacity: 0` by default, `opacity: 1` on row hover and focus-within, so rows never shift. Favicon is a bare 18px icon in a 32 x 32 slot, no tile, no background. Title 14/500 #f1f5f9, domain 12/400 #94a3b8. Delete icon color #f87171.

### Category header (manage `.category-header`, 72 high, radius 12, padding 16, gap 14)
Default bg #0f172a, border 1px #334155. Hover bg #1e293b. Pressed bg #334155. Focus ring. Caret (18) rotates, category icon is bare (22px, #22d3ee, 40 x 40 slot, no tile or tint), name 16/600, count 12/400 #94a3b8. Edit and delete icons appear on hover with the same no-shift rule as list rows. An expanded category is one card (bg #0f172a, border #334155, radius 16): the header has no border of its own, rows sit inside with 12px padding and 8px gap.

### Form input (`.field-input`, 44 high, radius 8, padding 0 14)
Default: bg #1e293b, border #334155, text #f1f5f9, placeholder #64748b. Hover: border #475569. Focus (and pressed): border #22d3ee plus the 2px ring. Error: border #dc2626 (error text appears below in #f87171, reserve the line to avoid shift). Disabled: bg #1e293b, border #1e293b, text #64748b.

### Select (`.field-select`, 40 high, radius 8, padding 0 10 0 12, caret 16)
Same colors as input; hover bg #263247 and border #475569; open/pressed bg #334155. EVERY select in the extension is exactly 200px wide (settings rows, popup category select is the only exception: it fills the card). Never size selects by content.

### Checkbox (`.checkbox-field`, box 20 x 20, radius 4, gap 10)
Unchecked: bg #1e293b, border #475569. Checked: same box, tick is a 14px slate-400 (#94a3b8) check, NOT a cyan fill. Hover: bg #263247, border #94a3b8. Pressed: bg #334155. Focus ring on the box. Disabled: bg #1e293b, border #1e293b, tick and label #64748b. Label 14/400 #cbd5e1.

### Icon picker tile (`.icon-picker-item`, 40 x 40, radius 8, icon 20)
Default: transparent, icon #94a3b8. Hover: bg #1e293b, icon #f1f5f9. Pressed: bg #334155. Selected: bg #083344, border 1px #22d3ee, icon #22d3ee. Focus ring. Disabled: icon #64748b. Grid container: bg #1e293b, border #334155, radius 12, padding 12; give it `overflow: visible` so the focus ring is not clipped. Six tiles per row for categories, eight 44px brand tiles per row for quick links (tiles are solid shade-600 colors, white glyph, selected one gets the 2px ring).

## 3. Modals (settings, category, quick link, delete confirm)

Shell: width 480 (settings), 440 (category), 520 (quick link). bg #0f172a, border 1px #334155, radius 20, shadow-lg, backdrop scrim #020617 at 60%. No vertical scrollbar inside the modal; size to content.
Header (padding 20 20 20 24, gap 14): icon tile 40 x 40 radius 8 bg #083344 with 22px icon in #22d3ee; text stack with eyebrow (label style, #64748b) above title (title style, #f1f5f9); icon button X on the right. 1px divider #1e293b under the header.
Body: padding 24, gap 20.
Footer: 1px divider #1e293b, then a row padded 16 24 20 24, buttons right aligned, Secondary "Cancel" then Primary "Save". The footer has the SAME background as the modal. Delete the darker `.modal-footer` background (this is the leftover dark band under Save).
Default titles: category modal title "New Category" (edit mode: the category name), eyebrow "Category". Quick link modal title "New Quick Link", eyebrow "Quick Link". Never render "Untitled": change the initial text of `#category-preview-title` and `#link-preview-title` in manage.html (lines about 78 and 146) and the JS that updates them (ui.js and newtab.js reference "Untitled").

### Settings modal rows
Section label (label style, #64748b, padding-top 16) then rows 56 high with the label on the left (body-medium) and the control right-aligned, 1px #1e293b divider between rows, no per-row boxes. Rows: Dock Position (select), Background (select), Open Links In (select). Categories row: label "Categories" with caption "Add, Rename And Reorder" and a Primary "Manage Categories" button on the right. All selects 200 wide, same right edge. Changes auto-save (no Save button).

## 4. Per-screen change list

Frame names match the Figma Screens page. Icons sit bare (no card or tile) everywhere except: the app logo tile, modal header icon tiles, and icon-picker tiles in modals. Cards stay only where they group real content (modals, settings rows, welcome card, category cards, popup card). Node ids: New Tab Dock A 12:432 and Dock B 12:491, First Run A 12:550 and B 12:614, Folder A 12:678 and B 12:738, Apps Menu 12:800, Settings 6:117, Category 6:198, Quick Link 6:293, Manage 7:244, Manage Empty 7:416, Popup 7:470, Popup Cannot Bookmark 7:524.

### 1 New Tab (newtab.html, newtab.css)
- Search bar: solid #0f172a, border 1px #334155, radius pill, 520 x 64, shadow-md, text 16/400 #94a3b8, apps button right (dots grid icon 22, becomes the Icon button states).
- Quick links: bare icon plus label, NO tile or card (spec above). Hover only brightens and lifts the icon.
- Dock: two frames per screen, "Dock A: Bare Icons" (frames at x 0) and "Dock B: One Shared Dock" (frames at x 1400), same for First-Run and Category Dock Open. Owner chooses one; the other style is then deleted from the code. Settings gear top right is an Icon button at 24px from top and right.
- Remove all `backdrop-filter` glass on the search bar, dock and cards (solid colors only).
- Files: newtab.css (`.search-box`, `.search-container`, `.quick-link*`, `.dock`, `.dock-icon`, `.settings-btn`, `.apps-btn`).

### 2 First-run welcome (newtab.css `.welcome-card`, `.welcome-head`, `.welcome-btn`)
Scrim over the page, card 440 wide, bg #0f172a, border #334155, radius 20, shadow-lg, padding 32, gap 20. Brand tile 48 x 48 (#0891b2, white bookmark glyph 26, this is the logo so it keeps its tile), title "Welcome To Dockside" (title style), body 14/400 #94a3b8, a list of four starter categories (rows bg #1e293b radius 8, bare 20px #22d3ee icon, no tile), footer right aligned: Ghost "Start Empty", Primary "Add Starter Categories". Only one primary.

### 3 Category dock open (newtab.css `.dock`, `.bookmark-list`, `.bookmark-card`)
Panel 480 wide, bg #0f172a, border #334155, radius 16, shadow-lg, padding 24, sits 8px above the dock bar. Header: bare 22px #22d3ee category icon (no tile), name 16/600, edit Icon button on the right, 1px #1e293b divider. Two column grid of link rows (padding 10 12, radius 8, bare 20px #22d3ee favicon, no tile, label 14/400). Row hover: bg #1e293b (rows are text links, a hover row highlight is fine). Active dock icon uses the Active state.

### 4 Google apps menu (newtab.css `.apps-menu`, `.apps-item`)
Popover bg #0f172a, border #334155, radius 16, shadow-lg, padding 16, label "Google Apps" (label style). 3 x 3 grid of 96 x 62 cells: bare 30px app icon (no tile), 12px caption #cbd5e1, 6px gap. Icon colors (400 shades, no tiles): red #f87171, blue #60a5fa, amber #fbbf24, emerald #34d399, cyan #22d3ee, slate #94a3b8. Cell hover: icon brightens only, no box. Panel right edge aligns with the search bar's right edge, top 8px below the search bar. Total height about 266px so it ends above the dock (706px vs dock top 724px at 1280 x 800). Set `max-height` so the panel never reaches the dock, and let it scroll only if the window is shorter than about 560px.

### 5 Settings (newtab.html settings modal, newtab.css `.settings-section`, `.setting-item`, `.field-select`, `.manage-categories-btn`, `.section-label`)
Per section 3. Remove the per-row boxes and the different select widths and offsets. One 200px select width and one right edge. Close button is the standard Icon button.

### 6 New and edit category (manage.html `#category-modal`, manage.css, newtab.css duplicates)
Modal shell per section 3. Fields: label "Category Name" (14/500 #cbd5e1) over a full-width input; "Choose Icon" over the 6 x 3 grid. Footer Cancel and Save. Title never "Untitled". Remove the extra dark footer strip.

### 7 New and edit quick link (manage.html `#link-modal`, newtab.css modal copy)
520 wide. Name and Web Address side by side (two inputs, equal width). Icon block: search input (icon 18 plus placeholder "Search Icons", 40 high), then the brand icon grid (8 columns, 44px tiles, first tile "Auto" = site icon, selected with 2px ring), helper caption "Auto Uses The Site Icon. Pick Another To Override It." Footer Cancel and Save.

### 8 Manage page (manage.html, manage.css `.page-header`, `.floating-toolbar`, `.toolbar-btn`, `.category*`, `.link-item`, `.add-category`)
- Apply the mesh body background (manage.css currently uses flat slate).
- Replace the centered floating pill toolbar with a full-width top bar (76 high, padding 0 32): brand on the left (36px tile #0891b2 with white bookmark glyph, name "Dockside" in title style), actions on the right: Ghost "Back To Dock", Ghost "Import", Ghost "Export", Primary "Quick Add". Only Quick Add is primary.
- Page title "Manage Bookmarks" in display style (600, not the current light weight), subtitle 14/400 #94a3b8. 24px above, 32px below.
- Column 720 wide, centered, gap 12. Expanded card and collapsed headers per section 2. "Add Category" is a full-width Secondary button. "Add Bookmark" inside a card is a Ghost button with a plus icon.
- Page needs no custom scrollbar styling beyond the browser default; keep the page scroll, no inner scrollbars.

### 9 Manage empty state (manage.html, manage.css, new `.empty-state` block)
Same top bar and title. A centered card 720 wide (bg #0f172a, border #334155, radius 20, padding 64 48, gap 24): a bare 64px bookmark icon in #22d3ee (no tile), title "No Categories Yet" (display), body 14/400 #94a3b8 max 440 wide centered, buttons Primary "Add Category" and Secondary "Import Bookmarks". Show it whenever there are zero categories.

### 10 Popup save (popup.html, popup.css `.bookmark-card`, `.card-header`, `.card-body`, `.card-footer`, `.field*`, `.options-row`, `.option-check`, `.save-btn`, `.quick-actions`, `.quick-action`)
- Width stays 400. Apply the mesh to the popup body. Body padding 16, gap 16, `height: auto` with no `min-height` (this removes the empty space under Save; the content is about 500 high with the checkbox and footer).
- Brand header row: 32px tile (#0891b2, white bookmark glyph 18) plus "Dockside" in heading style. Remove the old window close button (the popup closes itself) or keep it as an Icon button right aligned.
- Card: bg #0f172a, border #334155, radius 16, padding 16, gap 16. Page preview row (bare 22px #22d3ee favicon in a 40px slot, no tile, page title 14/500 truncated, domain 12/400), 1px divider, field "Title" (input), field "Category" (select, fills card width), checkbox "Open In New Tab" (checked by default), full-width Primary "Save Bookmark" with the bookmark icon.
- Footer: centered Ghost buttons "Settings" and "Manage" (gear and folder icons), below the card, same background as the page (no band).
- Use the standard input, select, checkbox and button components. Drop the cyan top border glow on the card.

### 11 Popup cannot bookmark (popup.html `.empty-state`, `.empty-state-icon`, `.message`)
Brand header and footer as in 10. Card bg #0f172a, border #334155, radius 16, padding 32 24, centered: a bare 40px warning icon in #fbbf24 (no tile), heading "Cannot Bookmark This Page", body 14/400 #94a3b8 centered. No button in the card: the footer's "Manage" link is the only way to Manage (the earlier duplicate "Open Manage" button was removed). Height about 374, sized to content.

## 5. File map summary
- tokens.css: replace tokens per section 1, add `.mesh-bg` or body mesh, remove glass tokens.
- newtab.css: remove custom font-family, remove backdrop-filter, restyle search, quick links, dock, folder panel, apps menu, welcome card, modal shell, settings rows, buttons and field states, single primary color. Add tokens.css link in newtab.html.
- manage.css and manage.html: mesh body, full-width top bar with brand, title weight, category and row states, modal shell (remove dark footer band), "New Category" and "New Quick Link" default titles, empty state block, 200px selects only if any exist.
- popup.css and popup.html: mesh body, brand header, content-sized height, standard field and button styles, new empty state, footer buttons.
- Shared (copy or move to tokens.css so there is one source): button, icon button, field, select, checkbox, icon picker tile, modal header and footer styles. Today `.modal-*`, `.field*`, `.icon-picker*`, `.checkbox*`, `.close-btn`, `.save-btn` are duplicated in newtab.css and manage.css and have drifted.

## 6. Notes and open items
- Gear icon: the Figma stand-in is a simple spoked gear; use the real Phosphor `gear` regular glyph in code (and Phosphor regular for all other icons). Icons are 1.5px stroke line icons.
- Brand icons in the quick-link picker are shown as generic colored tiles in Figma; production keeps the real brand icon library.
- Figma stand-in font is Inter. Production is `system-ui`, so line widths differ slightly; keep `white-space: nowrap` on buttons and headings.
- Focus ring in Figma is an outside 2px stroke in cyan-400 (variant "Focus"). The Figma effect style `focus-ring` also exists for reference.
- Input "Pressed" is the same as Focus. Dock "Active" is the open-folder state; Dock "Disabled" is included for completeness only.
- All sample data is fake (Work, Dev, Learning, Fun, example.com).
