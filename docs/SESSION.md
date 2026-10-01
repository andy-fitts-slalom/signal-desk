# Watchlight migration session — 2026-09-30

Migration in progress on clean `main`, starting at `d77835a29763fe94902525bf071a8f4a99676a3b`, matching origin/main. The checkout is `/Users/mfittand/Projects/Protogen/p-case-studies/p301-dashboard`; the old workspace path no longer exists. User authorization supersedes the historical branch-only restriction below.

Baseline: `npm run check`, `npm test` (9/9), `npm run build`, `npm run test:e2e` (18/18, 31.2s) all passed before edits. Rendered desktop 1440×1000 queue and 390×844 detail inspected; new baseline screenshots retained under `docs/images/vesper-2.0.0/before-*`. Existing screenshots remain untouched.

GitHub read-only verification confirms public `andy-fitts-slalom/watchlight`, default branch main, About “Watchlight | Vesper's fictional media-response dashboard”. Vercel: no Watchlight project or verified live URL per the user handoff; new deployment requires explicit approval after the parent task's automatic-review block. No deployment attempted.

The sections below are historical records, not current branch/deployment instructions.

---

# Session handoff — 2026-09-30

## Current state

Signal Desk's **Meridian UI 1.0.0 migration is complete** on `refactor/meridian-ui-1.0.0`. The user explicitly authorized discrete milestone pushes to GitHub after initially requesting local-only work. The branch is reviewable at https://github.com/andy-fitts-slalom/signal-desk/tree/refactor/meridian-ui-1.0.0 . Production `main` remains at `4cef204ba4c5f778769fe32458b99763aaa641f2`; no merge, production-branch push, or manual deployment was performed. No live migration URL has been verified. Automatic previews, if configured externally, are not evidence of verification.

Current workspace: `/Users/mfittand/Projects/Protogen/p-case-studies/p301-dashboard` (the old root path contains only residual Vite cache). Read [MERIDIAN.md](MERIDIAN.md) for integration, provenance and screenshot links, and [VERIFICATION.md](VERIFICATION.md) for actual results. The earlier build/publication record below is retained as history.

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

## Meridian UI migration — 2026-09-30

The workspace has moved to `/Users/mfittand/Projects/Protogen/p-case-studies/p301-dashboard`. Starting branch main was clean at migration start. Baseline type check, 9 unit tests, production build and all 8 Chromium browser tests passed (12.5s). Before screenshots are in docs/images/meridian-1.0.0/ (1440×1000 dashboard, 390×844 issue detail).

The supplied Meridian UI 1.0.0 release is copied into vendor/ and installed with a repository-relative file dependency and integrity lock. This sharing is authorized only for parent branding/presentation; application records/domain behavior remain independent. Work is on refactor/meridian-ui-1.0.0. The user's follow-up authorizes discrete milestone pushes to GitHub; main must remain untouched and no deployment is requested. Some integrations may automatically preview non-production branches; no preview is claimed verified here.

Migration implementation and expanded visual verification are complete. The existing domain module, fixtures, domain tests and original browser tests are unchanged.

### Presentation milestone

Meridian masthead/favicon, local DM Sans, dark/operations attributes, shared Vuetify theme/defaults, semantic badges/empty state, rewritten token-based product styles and resolved ECharts adapter are implemented. Larger metadata and control targets retain responsive queue/detail behavior. Visual/test findings fixed: floating-label contrast, phone target sizes, recovery-action overlap, clipped selected labels, reduced-motion JavaScript overlay animation, and nested Escape propagation. Final full production browser suite passes all 18 tests, including the original 8 unchanged. Domain code/data/tests are unchanged. The verification milestone packages the additional regressions, reproducible screenshots, asset provenance, final notes, and branch-push CI.

### Migration continuation

- `c16f35c`: vendored release, baseline evidence and local refactor branch; pushed.
- `7e3d256`: complete Meridian presentation migration and initial visual fixes; pushed.
- `16dc3b7`: nested Escape/focus and narrow-phone filter refinements; pushed.
- Final verification commit: expanded tests/screenshots, narrow-phone filter refinement, branch CI and durable notes. Obtain exact SHA with `git log -1`.
- Package: `@meridian/ui` 1.0.0, installed from checked-in vendor tarball. An isolated temporary checkout successfully ran `npm ci` and `npm run build`; installed package is not a symlink. No sibling path is required.
- Run `npm run check`, `npm test`, `npm run build`, `npm run test:e2e`. Browser suite remains on dedicated strict port 4371; the screenshot preview uses 4372. Do not reuse or stop unrelated servers.
- To continue review: compare this feature branch to main, read docs/MERIDIAN.md, and inspect docs/images/meridian-1.0.0/manifest.json. Publication/merge/deployment is a separate future user decision; original BRIEF publication language does not authorize it for this migration.
