# External Integrations

**Analysis Date:** 2026-01-28

## APIs & External Services

**Favicon Service:**
- Google Favicons API - Automatic favicon fetching for bookmarked URLs
  - Endpoint: `https://www.google.com/s2/favicons?domain={domain}&sz=32`
  - Auth: None required (public API)
  - Usage: `ui.js`, `newtab.js` - `getFaviconUrl()` function
  - Fallback: Gray placeholder SVG on error

**Search:**
- Google Search - Redirect for search queries
  - Endpoint: `https://www.google.com/search?q={query}`
  - Auth: None required
  - Usage: `newtab.js` - Search box Enter key handler

## Data Storage

**Databases:**
- Chrome Storage Sync API - Primary data store
  - Connection: `chrome.storage.sync` (built-in Chrome API)
  - Client: Direct API calls in `storage.js`
  - Sync: Automatic across signed-in Chrome browsers
  - Limit: ~8KB (sufficient for 100-200 bookmarks)

**File Storage:**
- Not applicable - No file uploads

**Caching:**
- None - Always reads fresh from Chrome storage

## Authentication & Identity

**Auth Provider:**
- None required - Extension uses Chrome's built-in storage
- Data syncs via user's Google account (Chrome sync feature)

**OAuth Integrations:**
- Not applicable

## Monitoring & Observability

**Error Tracking:**
- None configured - Console logging only

**Analytics:**
- None

**Logs:**
- Browser DevTools console
- No external logging service

## CI/CD & Deployment

**Hosting:**
- Chrome Web Store (planned)
- Currently: Local unpacked extension

**CI Pipeline:**
- Not configured
- Manual deployment

## Environment Configuration

**Development:**
- Required: Chrome browser with Developer mode
- Secrets: None
- Setup: Load unpacked extension from directory

**Staging:**
- Not applicable (single environment)

**Production:**
- Distribution: Chrome Web Store
- Updates: Chrome auto-update mechanism

## Chrome Extension Permissions

**From `manifest.json`:**
```json
{
  "permissions": ["storage", "tabs", "activeTab"]
}
```

**Permission Usage:**
- `storage` - Save/load bookmarks to chrome.storage.sync
- `tabs` - Query current tab for URL/title (popup quick-add)
- `activeTab` - Access active tab information

## Chrome URL Override

**New Tab Override:**
- `chrome_url_overrides.newtab` points to `newtab.html`
- Replaces default Chrome new tab page

## Webhooks & Callbacks

**Incoming:**
- Not applicable

**Outgoing:**
- Not applicable

## External Service Dependencies

**Critical:**
- Chrome Storage API - App non-functional without it
- Google Favicons API - Graceful degradation (placeholder on failure)

**Optional:**
- Google Search - Only used for search box feature

---

*Integration audit: 2026-01-28*
*Update when adding/removing external services*
