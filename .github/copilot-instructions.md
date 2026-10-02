# ElectroMart Copilot Instructions

## 🚫 Critical Rules for All AI Agents (Non-Negotiable)
1. **NO GIT WORKTREES OR EXTERNAL FOLDERS:** Work ONLY inside this single repository root directory (`C:\Users\Admin\Documents\GitHub\Electronic-Store`). NEVER run `git worktree add` or create external folders like `Electronic-Store-wt-*`.
2. **NO DUPLICATE CODE FILES:** NEVER create temporary files like `*-clean.js`, `*-fixed.js`, `*-complete.html`. Always edit the canonical original files directly.
3. **NO NEW LAUNCH SCRIPTS:** NEVER create new `.bat`, `.ps1`, or `.sh` scripts.
   - The ONLY standard way to launch from CLI: `npm start`
   - The ONLY standard way to launch from Windows: `open-electromart.bat` (or `start.bat`)

## Project Shape
- Frontend is static HTML, CSS, and JS at repository root (`http://127.0.0.1:5500/index.html`).
- Backend API lives in `backend/src` and runs with Express (`http://127.0.0.1:4000/api`).
- Single launcher: `npm start` runs `node launch-electromart.js` (starts both services).

## Non-Negotiables During Edits
- Preserve existing page IDs and hooks used by `script.js` and smoke tests.
- Maintain the unified Amazon-style theme in `styles.css`.
- Keep backend environment handling compatible with `backend/.env.example`.
- Avoid unrelated formatting-only changes in large static page files.

## Validation Matrix
- Frontend, smoke, or workflow changes:
  - npm run smoke
  - npm run smoke:baseline:verify
- Backend-only logic changes:
  - npm.cmd --prefix backend run test:unit
  - npm.cmd --prefix backend run start (or dev) for manual sanity
- Release guardrail changes:
  - npm run release:preflight
  - npm run release:rollback:dry

## CI and Governance Expectations
- Keep workflow action majors on current baselines:
  - actions/checkout v6
  - actions/setup-node v6
  - actions/upload-artifact v7
  - actions/cache restore and save v5
- Keep smoke and release workflows green before merge.

## Commit and PR Style
- Follow CONTRIBUTING.md for commit and PR format (`<type>(<scope>): <summary>`).
- Include concise validation evidence in PR descriptions.
- Never commit secrets or environment tokens.
