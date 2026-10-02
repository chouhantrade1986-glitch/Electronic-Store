# 🤖 UNIVERSAL AI AGENT GUIDELINES (ElectroMart)

> **CRITICAL INSTRUCTIONS FOR ALL AI AGENTS (Claude, Copilot, Cursor, Windsurf, Antigravity, ChatGPT, etc.)**
> You MUST read and strictly adhere to these rules before taking any action in this repository.

---

## 🚫 1. STRICTLY FORBIDDEN ACTIONS

1. **NO GIT WORKTREES OR EXTERNAL FOLDERS**
   - **NEVER** run `git worktree add` or create external folders (such as `Electronic-Store-wt-*`).
   - Work **ONLY** inside this single repository root directory:
     `C:\Users\Admin\Documents\GitHub\Electronic-Store`

2. **NO DUPLICATE / ALTERNATE CODE FILES**
   - **NEVER** create temporary or variant files like:
     - `*-clean.js`
     - `*-fixed.js`
     - `*-complete.js` / `*-complete.html`
     - `*-new.css` / `*-copy.html`
   - **ALWAYS** modify the original canonical files directly (`index.html`, `products.html`, `products.js`, `script.js`, `styles.css`, etc.).

3. **NO NEW LAUNCHER SCRIPTS**
   - **NEVER** create new `.bat`, `.ps1`, `.sh`, or `.cmd` files to start the application (e.g., do not create `start-server.bat`, `run.ps1`, `launch.bat`, etc.).
   - There is **ONLY ONE** standard launch mechanism (see below).

---

## 🚀 2. THE ONLY APPROVED WAYS TO LAUNCH THE PROJECT

There are only two standard ways to run this project. Do not invent any others:

### A. Terminal Command (All Platforms)
```bash
npm start
```
*(This automatically runs `node launch-electromart.js`, starting both the backend on port 4000 and the frontend on port 5500).*

### B. Windows GUI Launcher (File Explorer)
Double-click:
* **`open-electromart.bat`** (or **`start.bat`**)

---

## 🌐 3. ARCHITECTURE & PORT ASSIGNMENTS

* **Frontend:**
  - Root static files (`index.html`, `styles.css`, `script.js`, etc.)
  - URL: **`http://127.0.0.1:5500/index.html`**
  - Static Server: `qa-static-server.js` (Port `5500`)

* **Backend API:**
  - Express server located at `backend/src/server.js`
  - URL: **`http://127.0.0.1:4000/api`**
  - Health Check: **`http://127.0.0.1:4000/api/health`**
  - Database: `backend/src/data/db.json`

---

## 📋 4. EDITING CONVENTIONS

1. **Preserve IDs and Hooks:** Keep all HTML element IDs and data attributes intact, as they are consumed by `script.js` and automated QA tests.
2. **Amazon Theme Consistency:** Maintain the established Amazon-style theme (`styles.css`). Do not introduce conflicting style systems.
3. **Keep Commits Clean:** Always commit changes directly within this repository using concise messages (e.g., `feat(ui): ...`, `fix(cart): ...`).
