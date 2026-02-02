# Project Instructions

## ALWAYS! TEST UI AFTER NEW FEATURES TO FUNCTIONALITY  

After a new feature or function has been created, and that new feature or functionality is visible to users on the front end, you MUST ALWAYS launch Playwright OR Agent-Browser and test that new feature or functionality. 


## Browser Automation

Use `agent-browser` for web automation tasks. It's installed globally and called via Bash commands (not MCP).

**Important**: Must set PATH to include Node.js when calling from Claude Code's shell:
```bash
PATH="/c/Program Files/nodejs:$PATH" "/c/Users/itsne/AppData/Roaming/npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe" <command>
```

Core workflow:
1. `... agent-browser-win32-x64.exe open <url>` - Navigate to page
2. `... agent-browser-win32-x64.exe snapshot -i` - Get interactive elements with refs (@e1, @e2)
3. `... agent-browser-win32-x64.exe click @e1` / `fill @e2 "text"` - Interact using refs
4. Re-snapshot after page changes

Use `--json` flag for machine-readable output.
Use `--headed` flag to show visible browser window.
Use `--debug` flag for troubleshooting.

Run with `--help` for all commands.
