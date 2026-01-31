# Handoff: Git Commit and Push to GitHub

## Goal
Commit all project files and push to GitHub repository.

## GitHub Config (from config.json)
- **User:** professionalcrastinationco
- **Repo:** ext-new-tab
- **Branch:** dev

## Doppler Setup - COMPLETED
- Project: `new-tab-bookmarks-extension`
- Config: `dev`
- `GITHUB_TOKEN` is available

**Important:** The global `DOPPLER_TOKEN` env var (service token for photo-culler) overrides the scoped login. Use `--no-read-env` flag with doppler commands:
```bash
doppler secrets --no-read-env
doppler run --no-read-env -- <command>
```

## Current State
- On branch: `main`
- 5 modified files (newtab.css, popup.html, popup.js, ui.js, planning docs)
- Many untracked files (entire extension codebase)
- **No .gitignore exists** - needs to be created first

## Next Steps

### 1. Create .gitignore
```
node_modules/
nul
.env
.env.*
*.log
.DS_Store
Thumbs.db

# Test files (optional - decide if you want these in repo)
test-screenshot*.png
screenshots/Screenshot*.png
```

### 2. Add and Commit Files
```bash
git add .gitignore
git add manifest.json app.js ui.js popup.js popup.html newtab.css
git add context-menu.js import-export.js config.json
git add icons/ lib/
git add README.md CLAUDE.md
git add package.json package-lock.json
git add .planning/
# Add other files as needed
```

### 3. Push to GitHub
```bash
# Get the token from Doppler and push
doppler run --no-read-env -- git push -u origin main
```

Or configure git to use the token:
```bash
GITHUB_TOKEN=$(doppler secrets get GITHUB_TOKEN --plain --no-read-env)
git remote set-url origin https://${GITHUB_TOKEN}@github.com/professionalcrastinationco/ext-new-tab.git
git push -u origin main
```

## Files Overview

### Core Extension Files
- `manifest.json` - Chrome extension manifest
- `app.js` - Main application logic
- `ui.js` - UI components
- `popup.js` / `popup.html` - Extension popup
- `newtab.css` - New tab page styles
- `context-menu.js` - Right-click context menus
- `import-export.js` - Bookmark import/export

### Assets
- `icons/` - Extension icons
- `lib/` - Third-party libraries (Phosphor icons, etc.)

### Planning/Docs
- `.planning/` - GSD planning documents
- `CLAUDE.md` - Project instructions for Claude
- `README.md` - Project readme
- `HANDOFF*.md` - Various handoff documents

### Should NOT Commit
- `node_modules/` - Install via npm
- `nul` - Accidental Windows file
- `.playwright-mcp/` - Local playwright config (maybe)

## Questions to Decide
1. Should `.planning/` be in the repo? (Contains GSD workflow docs)
2. Should mockups and screenshots be in the repo?
3. Should `rightclick/` folder be included?
