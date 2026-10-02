# Contributing

## Branch names

`<type>/<short-slug>` — e.g. `fix/cart-total-rounding`, `security/cors-allowlist`, `docs/node-version`.

## Commit messages

Format (Conventional Commits):

```
<type>(<scope>): <summary in imperative, lower case, no period>

<optional body: why the change was needed>

<optional footer: Closes #123>
```

| type | use for |
| --- | --- |
| `feat` | new user-facing feature |
| `fix` | bug fix |
| `security` | vulnerability fix or hardening |
| `refactor` | code change with no behavior change |
| `perf` | performance improvement |
| `test` | tests, QA scripts, visual baselines |
| `docs` | documentation only |
| `ci` | GitHub workflows, release / preflight scripts |
| `chore` | dependencies, cleanup, tooling |

Common scopes: `ui`, `cart`, `checkout`, `auth`, `orders`, `admin`, `payments`, `backend`, `deps`, `qa`, `release`, `audit`, `devx`.

Examples:

```
feat(ui): add product compare page
fix(cart): keep quantity when item is re-added
security(auth): rate limit password login and register
chore(deps): upgrade nodemailer to v10
test(qa): refresh visual baseline for new header
ci(release): retry smoke step on transient failures
docs(readme): document required Node version
```

Rules:

- One logical change per commit; keep commits small.
- Summary line ≤ 72 characters.
- Never commit secrets, `.env` files or real customer data.

## Pull requests

- Title uses the same format as the commit summary (`<type>(<scope>): <summary>`).
- Fill in `.github/pull_request_template.md`, including validation output.
- Keep `smoke` and release workflows green before merge.
