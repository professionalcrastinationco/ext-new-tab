# Walkthrough: Hide Chrome's "Customize Chrome" Footer

## Problem
When Dockside replaces the new tab page, Chrome itself shows a footer at the bottom: the extension name on the left and a "Customize Chrome" pill on the right. The extension cannot hide it (no manifest key or API). The user can turn it off themselves in the Customize Chrome side panel.

## Idea (Adam, 2026-11-11)
After the user has used Dockside for about 3 days, show a small dismissible card that teaches them how to turn the footer off.

- Animated arrow pointing at the bottom-right corner where the pill sits.
- Short animated mock (CSS/SVG, no video file, no remote content) of the 3 steps: click "Customize Chrome", find the footer option in the side panel, switch it off.
- Show once. Never again after it is closed.
- Store first-use date in chrome.storage.local, show when 3+ days have passed.

## Notes
- Our page cannot see or detect Chrome's footer, so the arrow only points at where it usually is, and we cannot tell if it is already off.
- Before writing the step labels, open the real side panel in Chrome and copy the exact wording (Chrome changes these). Not verified against Chrome docs yet.
- Do not use redirect tricks to avoid the footer (flash of the default page, Web Store discourages it).
- Not in v2026.11.13. Future release.
