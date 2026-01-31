# Technology Stack

**Analysis Date:** 2026-01-28

## Languages

**Primary:**
- JavaScript (ES6+) - All application code

**Secondary:**
- CSS3 - Styling (`styles.css`, inline styles in `newtab.html`)
- HTML5 - UI markup (`popup.html`, `newtab.html`, `manage.html`)

## Runtime

**Environment:**
- Chrome Extension Manifest V3
- Browser JavaScript runtime (no Node.js)

**Package Manager:**
- None - No package.json, no npm dependencies
- All dependencies included as static files

## Frameworks

**Core:**
- Pico CSS 2.x - Minimal CSS framework (`lib/pico.min.css`)
- No JavaScript framework (vanilla JS)

**Testing:**
- Not detected - No test framework configured

**Build/Dev:**
- None - No build step required
- Direct file loading as Chrome extension

## Key Dependencies

**Critical:**
- Chrome Extension APIs - Core functionality (storage, tabs, activeTab)
- Pico CSS - UI styling foundation (`lib/pico.min.css`)

**Infrastructure:**
- Chrome Storage Sync API - Data persistence (`storage.js`)
- Google Favicons API - Icon fetching (external service)

## Configuration

**Environment:**
- No environment variables
- Settings stored in Chrome storage (`storage.js`)
- User preferences: `openInNewTab`, `dockPosition`

**Build:**
- `manifest.json` - Chrome extension manifest (V3)
- No build configuration (no bundler)

## Platform Requirements

**Development:**
- Chrome browser with Developer mode enabled
- Any OS with Chrome (Windows, macOS, Linux)
- No external tooling required

**Production:**
- Chrome Web Store distribution (planned)
- Chrome 88+ (Manifest V3 support)
- Runs in browser extension context

---

*Stack analysis: 2026-01-28*
*Update after major dependency changes*
