# Security Policy

This repository is maintained with a security-first workflow.

## Supported scope

- Frontend storefront and admin panel
- Backend API and data store
- Import/export tooling and automation scripts

## Reporting a vulnerability

1. Do not open a public issue for sensitive vulnerabilities.
2. Share reproduction details privately with maintainers.
3. Include impact, affected files/routes, and mitigation ideas.

## Security guardrails

- Never commit real secrets (`.env`, API keys, private keys, tokens).
- Use strong unique credentials and enable 2FA on GitHub accounts.
- Keep branch protection enabled on `main`.
- Run dependency audit and tests before release:
  - `npm.cmd --prefix backend audit --omit=dev`
  - `npm.cmd --prefix backend test`
- For CSV imports, only use clean converted files and run preflight first.

