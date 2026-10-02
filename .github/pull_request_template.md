## Summary

<!-- What changed and why. Link the issue: Closes #123 -->

## Type

- [ ] feat — new feature
- [ ] fix — bug fix
- [ ] security — vulnerability / hardening fix
- [ ] refactor — no behavior change
- [ ] docs — documentation only
- [ ] test — tests / QA baselines
- [ ] ci — workflows / release tooling
- [ ] chore — deps, cleanup, housekeeping

## Area

- [ ] Frontend (static pages at repo root)
- [ ] Backend (`backend/src`)
- [ ] QA / smoke (`qa-*.js`, `qa-baselines/`)
- [ ] CI / release (`.github/workflows`, `*.ps1`)
- [ ] Docs

## Validation

<!-- Paste command + result. Remove lines that don't apply. -->

- [ ] `npm --prefix backend test` →
- [ ] `npm run smoke` →
- [ ] `npm run smoke:baseline:verify` →
- [ ] Manual check (pages / flows) →

## Risk & rollback

- [ ] No new env vars (or added to `backend/.env.example` and README)
- [ ] No secrets, tokens or real customer data committed
- [ ] Page IDs / hooks used by `script.js` and smoke tests preserved
- [ ] Rollback: revert this PR
