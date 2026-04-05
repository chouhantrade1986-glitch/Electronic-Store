# ElectroMart Copilot Instructions

## Project Shape
- Frontend is static HTML, CSS, and JS at repository root.
- Backend API lives in backend/src and runs with Express.
- QA and release automation live in root PowerShell and Node scripts.

## High-Value Entry Points
- Smoke orchestration: qa-full-smoke.js
- UI smoke snapshots: qa-ui-smoke.js
- Smoke workflow: .github/workflows/smoke-suite.yml
- Release workflow: .github/workflows/release-guardrails.yml
- Backend entrypoint: backend/src/server.js

## Non-Negotiables During Edits
- Preserve existing page IDs and hooks used by script.js and smoke tests.
- Do not remove or rename QA artifact schemas without updating validators.
- Keep backend environment handling compatible with backend/.env.example.
- Avoid unrelated formatting-only changes in large static page files.

## Validation Matrix
- Frontend, smoke, or workflow changes:
  - npm ci
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
- Prefer small focused commits with prefixes like fix(...), ci(...), chore(...), docs(...).
- Include concise validation evidence in PR descriptions.
- Never commit secrets or environment tokens.
