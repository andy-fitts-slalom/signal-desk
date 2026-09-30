# Session handoff — 2026-09-30

## Current state

Signal Desk is implemented in this workspace and published to the dedicated public GitHub repository at https://github.com/andy-fitts-slalom/signal-desk on `main`. The user will connect Vercel themselves. **No Vercel project was created, linked, or deployed. There is no verified live URL.**

The root brief was compared with the supplied source, found byte-identical, and copied as requested. It remains unchanged. The workspace originally contained only that brief and no Git repository. No other case study, real client data, internal product material, or proprietary code was used.

## Completed implementation

- Vue 3 + TypeScript + Vite + Vuetify + modular Apache ECharts.
- 18 fictional issues, 72 coverage articles, 54 original stories (18 syndicated copies), five owners, three brands. JSON fixtures and types live under src/.
- Queue-first dark layout, four scoped cards, coordinated filters, hourly coverage and brand load charts, text equivalents, empty state, mobile cards and full-width mobile detail.
- Grouped coverage, transparent editorial severity, owner assignment/change/removal, acknowledgment, resolve/reopen, undo recent status, local activity, confirmation reset.
- Versioned browser persistence, invalid-state fallback, visible failed-save recovery and retry.
- URL query state for issue/filter direct loads. Closing detail preserves queue filters/position; keyboard focus returns to its opener.
- Root README, MIT LICENSE, BRIEF and AGENTS; data dictionary, deployment instructions, verification evidence and desktop screenshot under docs/.

## Domain decisions

- Fixed clock: 2025-10-21 09:00 America/Los_Angeles (16:00 UTC), with 48 hours of prior articles. Activity ordering uses append sequence at the same fixed time.
- Region selects matching articles first. Each related issue is included once. Brand/severity/status restrict issues; all cards, queue and charts share selectScope.
- Queue latest coverage and article counts use filtered articles. Detail intentionally shows all issue evidence and marks outside-scope regions.
- Open means new or acknowledged. Overdue is strictly before the snapshot; exactly at it is Due now. Owner assignment alone changes neither status nor deadline.
- Prioritize open before resolved, criticality, earliest deadline, stable ID.
- Original-story IDs are grouping keys; explicit isSyndicated flags identify copies. Copies cannot precede originals.
- State key: signal-desk:v1. Immutable editorial content is reconstructed from seed when loading saved state. Only valid owners/status and local activity are restored. No backend, notifications or cross-tab synchronization.

## Actual milestones

- `1e3fad0` — specification, plan, root documents and Git initialization.
- `64852fb` — Vue/Vuetify/ECharts structure; initial production build passed.
- `0d4815e` — fictional dataset, domain functions, data dictionary and nine unit tests.
- `c101eac` — responsive queue and persistent core workflow; all preceding milestones pushed.
- `46090a1` — production browser suite, accessibility/focus fixes, CI, documentation and final verification; GitHub CI passed.
- Final refinement records CI evidence, updates deprecated action runtimes and wraps chart dates without overlap; use `git log -5 --oneline` and docs/VERIFICATION.md for final checks. History records actual work; nothing was backdated.

## Accounts and publication scope

GitHub authentication initially appeared broken in the sandbox, but network-enabled verification succeeded as **andy-fitts-slalom** with repository access. The destination did not exist, so it was created private. User subsequently authorized public visibility, which was applied.

Vercel initially had no credentials; device login later succeeded and listed **Andy-Protogen** (`andy-protogen`). User then explicitly chose to connect the Vercel project to GitHub themselves and asked us to take the local/GitHub project as far as possible. The unused Vercel CLI dependency was removed. See docs/DEPLOYMENT.md for exact remaining steps and live acceptance checks.

## Verification and continuation

Use `npm ci`, `npm run check`, `npm test`, `npm run build`, and `npm run test:e2e`. Browser tests launch their own production preview on strict port **4371**, refusing to reuse an existing process. Port 4173 was occupied by an unrelated app; do not stop or reuse it. Browser binaries: `npx playwright install chromium`.

Read docs/VERIFICATION.md for final results. The verification workflow runs on main pushes and pull requests. Browser tests can target an actual deployment with `PLAYWRIGHT_BASE_URL=https://ACTUAL-URL npm run test:e2e`.

Remaining publication action: the user imports this repository into Vercel under `andy-protogen`, creates a separate `signal-desk` project (inspect any existing project before reuse), deploys `main`, then the actual production URL must be opened and checked for triage, persistence, direct issue loads/refreshes and phone layout. Add the real URL and verified commit to README and verification notes only after doing so.
