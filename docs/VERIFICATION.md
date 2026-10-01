# Watchlight / Vesper UI 2.0.0 verification — 2026-09-30

## README visual refresh — 2026-10-01

Captured `docs/images/vesper-3.0.0/readme-dashboard.png` from the local 3.0 production build at 1440 × 1000 after fonts loaded. The browser reported no page errors; the image and README link were inspected. `npm run check`, 9/9 unit tests, `npm run build` and 19/19 browser tests passed. This documentation change does not claim a new production deployment verification.

## Live result — 2026-10-01

Pushed `f080bd5` to `main`. [GitHub Actions run 36832940005](https://github.com/andy-fitts-slalom/watchlight/actions/runs/36832940005) succeeded, including the 19 browser checks. Vercel's commit status reported deployment complete. Opened [production Watchlight](https://watchlight-rouge.vercel.app/) in Chrome and inspected the dark dashboard, filter controls, response queue and 15 open / 8 unassigned / 3 overdue / 72 coverage metrics. The subtle palette change is present; the existing operations layout remains intact.


## Vesper UI 3.0.0 — 2026-10-01

- Installed the portable `vendor/vesper-ui-3.0.0.tgz`; package and lockfile point only to that repository-local tarball.
- `npm run check`, `npm test` (9/9), `npm run build`, and `npm run test:e2e` (19/19) passed. The initial browser run could not bind its local server in the sandbox; the same suite passed with local-server access.
- Inspected the 1440px local Chrome dashboard: dark petrol/charcoal surfaces, cool off-white text, visible filter arrows and status labels. Existing browser checks cover 320/390/768/1440px, focus, accessibility basics, storage, reset and zoom proxy.
- This is local verification; production commit/deployment status must be checked after push. The 2.0.0 results below are historical.


## Documentation sweep — 2026-09-30

Refreshed README onboarding, workflows, setup, project structure and dated verification context. Corrected current branding guidance and explicitly marked superseded planning/migration records as historical. Vesper UI 2.0.0 remains the vendored dependency; runtime source and package manifests contain no Meridian references. Historical screenshots, branch deployment exclusions and compatibility storage keys are preserved.

Validation: 9 unit tests, production build and 19 local browser tests passed; README local links resolve. Browser preview startup initially hit sandbox EPERM, then passed with approved local-server access. No application behavior or dataset changed. Existing production evidence remains dated; this documentation sweep does not claim a new live-site verification.

## Current results

| Check                       | Actual result                                                                                                                                                                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`             | Passed, Vue/TypeScript                                                                                                                                                                                                                                     |
| `npm test`                  | 9/9 domain tests passed                                                                                                                                                                                                                                    |
| `npm run build`             | Passed, local font/mark assets, no oversized JavaScript chunk warning                                                                                                                                                                                      |
| `npm run test:e2e`          | 19/19 Chromium tests passed, 29.8s                                                                                                                                                                                                                         |
| Isolated committed checkout | `npm ci` and build passed in isolated archived checkouts with no sibling dependency; Vesper 2.0.0 installed, not a symlink; zero npm audit vulnerabilities. `74e0edb` also passed check/unit tests; its browser run exposed the Escape race repaired below |
| Native 200% zoom            | Actual `chrome.tabs.setZoom(2)` in isolated Chromium; 1440×913 CSS/DPR1 → 720×456 CSS/DPR2; triage, reload, confirmed reset and reload passed                                                                                                              |
| Accessibility basics        | Existing axe WCAG2 A/AA + 2.1 AA checks: zero dashboard/detail violations; keyboard focus, return focus, nested Escape and reduced-motion regressions passed                                                                                               |
| Integrity                   | All 52 consumed Vesper CSS variables defined; domain/data/original unit tests unchanged; prior brief is verbatim before addendum; historical screenshots retained                                                                                          |

## Migration baseline and coverage

Started from clean main `d77835a29763fe94902525bf071a8f4a99676a3b`, already containing Meridian 1.0.0 and matching origin/main. Before edits, type check, 9 domain tests, build and 18 browser tests passed (31.2s). The running baseline was inspected at 1440×1000 and 390×844 and captured under `images/vesper-2.0.0/before-*`.

The original 8 workflow scenarios remain. The 10 Meridian presentation scenarios now live in `tests/vesper.spec.ts`; theme/name expectations changed, behavior assertions were retained. One additional scenario seeds pre-rebrand v1 ownership, resolution and complete history, checks byte-identical persistence through reload/direct region+issue loads, checks grouped evidence and counts, cancels reset, then confirms reset without deleting an unrelated storage key. The foundation scenario also validates title/description and the served favicon against the exact package SVG.

Coverage includes owner picker/save, independent assignment/status, acknowledge/resolve/reopen/undo, activity, confirmation/cancel, snackbar dismissal, reload/reset, article-first Europe scope (29 articles / 18 distinct issues), all evidence with outside-region labeling, empty queue and clear recovery, corrupt-state seed fallback, failed-save memory retention/retry, direct `/queue` loads, URL filter/detail retention and queue scroll/focus restoration.

At 320/390/768/1440px the suite measures page/detail overflow, actual enabled controls (44px desktop / 48px phone), readable values and non-overlapping storage-recovery actions. Native VSelect focus remains visible. Repeated nested Escape sequences pass with and without reduced motion. Actual overlay animation calls have no positive duration under reduced motion. DM Sans loads locally, metrics use tabular numerals, chart text is at least 12px and canvas colors are resolved values. The shared package still contains presentation only.

Final staging review found `index.html` missing from the first implementation commit `b4f76a9`, despite being present during local testing. GitHub run [36824997894](https://github.com/andy-fitts-slalom/watchlight/actions/runs/36824997894) failed its theme/title/accessibility expectations. Commit `74e0edb` adds the tested entrypoint, Vesper root attributes, favicon and Watchlight metadata. History was preserved rather than amended.

An isolated checkout then exposed intermittent immediate Escape dismissal after reopening detail: 2/10 targeted repetitions reproduced it. Vuetify defers the overlay global-top flag using a timer. A capture listener now dismisses only the active app-owned detail when neither its owner menu nor reset confirmation is open; existing nested-picker handling and after-leave focus/scroll restoration remain. The existing regression assertions were not weakened. After the fix, all 19 browser tests passed (29.8s), and 10/10 targeted repetitions passed (22.4s). Fresh screenshots and native zoom workflow were captured against the fixed build.

An initial run of the new saved-state test could not load the browser suite because importing the Vite domain module from Node required JSON import attributes. The fixture was corrected to read the unchanged JSON directly, without modifying application code or weakening an assertion. The final 19-test run above passed.

## Rendered inspection and screenshots

The [Vesper manifest](images/vesper-2.0.0/manifest.json) records 26 standard viewport captures, sizes, local query paths and reduced-motion settings; no page errors were recorded. Separate [native zoom evidence](images/vesper-2.0.0/native-zoom.json) records actual tab zoom and the tested flow. Native zoom screenshots use Chromium viewport capture after finite animations settle, avoiding Playwright's CSS-pixel clipping under tab zoom. The automated 720×500 DPR2 reflow proxy remains clearly labeled as a proxy.

Inspected current images: 1440 dashboard/side detail/activity, 768 dashboard, 390 dashboard/owner picker/reset/corrupt fallback/empty queue, 320 stacked queue/failed-save recovery, 200% reflow detail, and actual native-zoom dashboard/detail. The petrol/night surfaces, sand/cream text, sky actions and coral danger use semantic tokens. Labels remain legible, the owner menu is opaque/focused, recovery actions sit below phone error text, and scrollable evidence/activity remain usable. The queue precedes supporting charts and phone detail fills the width.

Reproduce against the local production preview at strict port 4372 with `node scripts/capture-vesper.mjs` and `node scripts/capture-native-zoom.mjs`. The latter uses a temporary test extension/profile and does not access personal browser state. Port 4371 remains exclusive to the production-build browser suite. No historical screenshots were deleted or overwritten.

## GitHub, learner audit and deployment

`fbdf5bd` (plan/baseline) and `b4f76a9` (implementation) were pushed to main after checks. GitHub authenticated read confirms public [watchlight](https://github.com/andy-fitts-slalom/watchlight), default main, and the About description was updated with the full Vesper Media Group name and operational purpose. No branch, PR or rewritten history. GitHub run [36825236930](https://github.com/andy-fitts-slalom/watchlight/actions/runs/36825236930) passed on the document correction `74e0edb`. Final application commit `c3e9d5c` passed GitHub run [36825681307](https://github.com/andy-fitts-slalom/watchlight/actions/runs/36825681307), including clean install, type checks, 9 unit tests, production build and the 19-test browser suite on Linux (job duration 1m55s). The follow-up commit recording this result changes documentation only.

The [learner-requirements audit](REVIEW-READINESS.md) checks core flows, industry/user fit, context docs, root README/LICENSE, real commit milestones and plan/result alignment. **Live accessible site: unmet.** There is no verified live Watchlight deployment. The user's handoff says no Vercel project exists; Vercel inventory was not re-queried in this run. No creation/link/deployment was attempted. Parent-task automatic approval review blocked a new production project; obtain explicit user approval before creating/deploying Watchlight. See [DEPLOYMENT.md](DEPLOYMENT.md). Password protection is recommended, not mandatory.

## Limits

Native Chromium zoom and local production behavior are verified; Safari/Firefox, full screen-reader review, physical-phone keyboards/safe areas and live URL routing remain unverified. State remains local to the origin/browser with no backend, notifications or cross-tab synchronization. Fixed activity timestamps intentionally use sequence for ordering.

The records below describe earlier milestones and their historical authorization/status, not current instructions.

---

# Meridian UI migration verification — 2026-09-30 (historical)

This section records a superseded release. Package paths, test filenames, branch instructions and deployment status below apply to that revision only; current Vesper evidence appears above.

## Baseline and integrity

- Started from clean `main` at `4cef204ba4c5f778769fe32458b99763aaa641f2` in the relocated workspace.
- Before changes: type check, 9 domain tests, production build and original 8 Chromium tests passed (12.5 seconds). Before screenshots are retained in the migration image folder.
- `vendor/meridian-ui-1.0.0.tgz` matches the supplied release SHA-256; package and lockfile use `file:vendor/meridian-ui-1.0.0.tgz`. A fresh isolated `/tmp` checkout ran `npm ci` and `npm run build` successfully with no sibling package or symlink (1.0.0 installed). Its dependency audit reported zero vulnerabilities.
- `src/domain.ts`, all `src/data/` fixtures, `tests/domain.test.ts` and `tests/triage.spec.ts` are unchanged from baseline. The 18 issues/72 articles/54 originals, baseline 15/8/3/72, fixed clock, ownership/status, scope, persistence key and URL/focus/scroll contracts remain intact.

## Automated checks

- `npm run check`: passed.
- `npm test`: 9/9 passed.
- `npm run build`: passed, including local font and mark assets.
- `npm run test:e2e`: 18/18 production-build Chromium tests passed (25.2 seconds). Original eight retained without weakened assertions; ten migration tests added in tests/meridian.spec.ts.
- Original coverage includes owner → acknowledge → resolve, reload, activity, reopen/undo, confirmed/cancelled reset, region distinct counts, empty recovery, corrupt/failed storage, phone detail, direct loads, keyboard focus and queue position.
- Added coverage checks 320/390/768/1440px dashboard/detail/empty/corrupt/blocked layouts, page/detail overflow, actual 44px desktop/48px phone control boxes, and recovery text/button non-overlap.
- Shared branding and dark/operations attributes, loaded local DM Sans, tabular metrics, resolved semantic colors, and actual canvas text at least 12px are verified in the browser.
- VSelect keyboard focus is visible in filters and owner dialog; original dashboard/detail axe WCAG2 A/AA and 2.1 AA checks pass with zero violations.
- Repeated nested Escape checks in normal and reduced-motion modes (three cycles each) verify that the first Escape closes only the owner menu, the second closes the dialog, and both restore the correct focus.
- Reduced-motion checks intercept actual Element.animate overlay calls: no positive-duration dialog/picker animation; picker and dialog focus return still work. CSS transitions and chart animation are disabled as appropriate.
- 200% **browser-zoom reflow proxy** uses a 720×500 CSS viewport at DPR 2 (1440×1000 physical output), with readable counts/detail, un-clipped queue content, and working filter/empty recovery. This exercises the responsive breakpoints that native browser zoom would use; CSS `zoom: 2` was rejected as an inaccurate proxy because it leaves media queries at the original viewport. This is not a native browser zoom or physical-device certification.

## Visual evidence and observations

[Migration notes](MERIDIAN.md) link representative images. [Manifest](images/meridian-1.0.0/manifest.json) records 26 final viewport captures, their exact sizes/states, local URL paths and reduced-motion setting. Two baseline captures are also retained. `scripts/capture-meridian.mjs` reproduces the final captures from a production preview on port 4372 and records page errors (none).

Actual rendered images inspected include the 1440px dashboard/detail/activity, 768px dashboard, 320px queue, 390px owner picker, empty result, reset, corrupt fallback, 320px blocked-save recovery, and zoomed detail. The queue remains the primary region, metadata/chart text is readable, status text accompanies semantic color, the owner menu is opaque and focused, and evidence/activity remain scrollable. At 320px, filters stack to avoid broken option words. Phone detail occupies the full viewport width; desktop uses the side sheet.

Verification found and fixed:

- Vuetify inline 44px min-height overriding phone sizing → explicit 48px touch minimum.
- Floating labels dimmed by framework opacity → semantic muted color at full opacity with native visibility retained.
- Recovery button overlapping the message on phones → explicit alert grid areas with a separate action row, now measured by regression tests.
- Selected values ellipsized after raising input size → wrapping values and a single filter column at the narrowest phone width.
- Vuetify JavaScript overlay animations bypassing reduced-motion CSS → reactive preference and native transition props; actual animation calls tested.
- Removing those transitions exposed a nested Escape propagation race → a scoped handler closes only the open owner picker before the parent receives the event, with explicit focus return. Repeated normal/reduced tests pass.

## Publication and limits

Milestones were pushed only to `refactor/meridian-ui-1.0.0` under the user's follow-up authorization. Verification CI now runs on `refactor/**` pushes as well as main/PRs. This migration does not change main, create a deployment, or claim a verified live URL. Local route testing is not live deployment evidence.

Chromium automation and desktop screenshots do not establish Safari/Firefox behavior, a complete screen-reader audit, physical-phone keyboard/safe-area behavior, or native 200% browser zoom. Those remain manual follow-up limits. Demo state remains local; no shared backend or notifications were introduced.

---

# Original release verification — 2026-09-30

## Confirmed local checks

- `npm run check`: passed, strict Vue/TypeScript compilation.
- `npm test`: nine domain tests passed: deterministic data integrity, 48h membership, original/copy ordering, distinct counts, combined scope, empty/resolved scope, deadline boundaries, independent ownership/status transitions, reopen, and saved-state validation.
- `npm run build`: passed. Production chunks split into application, Vue, controls, charts and chart renderer; no oversized JavaScript chunk warnings. SVG icons replace the full icon font.
- `npm audit`: zero advisories in the final dependency tree.
- Browser opened at local URL, desktop 1440×1000 and mobile 390×844 visually inspected. Queue is dominant on desktop; phone uses stacked issue cards and a full-width detail panel. Browser console reported zero errors and warnings after a fresh load.
- Read-only independent review found no blocking domain defects. Review caught ambiguous 48-hour chart time labels; dates now accompany hours. Automated accessibility caught faded resolved-row text; opacity was removed to preserve contrast.

## Browser suite

`npm run test:e2e`: **8/8 tests passed against the production build**, Chromium, 13.6 seconds. The runner builds the app and starts Vite preview on dedicated strict port 4371; no unrelated server reuse is allowed.

1. Urgent issue owner assignment → acknowledgment → resolution; correct counts, activity, reload persistence, reopen/undo, reset cancel/confirmation and reload.
2. Europe scope: 18 distinct issues and 29 articles, filtered detail reload; Folio Press + Asia Pacific empty state and clear recovery.
3. Corrupt browser state fallback and explicit save retry; invalid issue URL stays usable.
4. Blocked writes keep in-memory changes and persist after storage recovery/retry.
5. 390px phone: filters, queue and full-width detail without horizontal overflow.
6. 320px phone: same checks at the narrower viewport.
7. Automated axe WCAG 2 A/AA and 2.1 AA checks: zero violations on dashboard and detail. Keyboard opening, Escape dismissal and focus restoration pass.
8. Nested `/queue?region=Europe&issue=issue-01` direct load and refresh, retained filters, lower-row keyboard focus and queue scroll preservation within 2px.

Verification found and fixed resolved-row contrast and missing dialog focus return; the final suite confirms both repairs. Port 4173 was occupied by another app during initial setup and was not reused or stopped.

## GitHub verification

[Verification run 36780573546](https://github.com/andy-fitts-slalom/signal-desk/actions/runs/36780573546) passed on pushed commit `46090a1`, including clean install, type checks, unit tests, production build and browser tests on Linux. Its deprecation notice prompted an update to official current GitHub Action releases; the final refinement commit also fixes chart date-label wrapping. The final commit's run can be found in the repository Actions tab.

## External publication

The dedicated GitHub repository was created private, then changed to public on explicit user authorization. Descriptive planning, application structure, dataset and core workflow commits were pushed when those milestones were completed.

Vercel deployment is pending the user's GitHub import into `andy-protogen`, project `signal-desk`, production branch `main`. No Vercel URL has been opened or verified. Local route/refresh testing is not evidence of a working deployed rewrite. Use docs/DEPLOYMENT.md to finish live verification.

## Limitations

- Fictional static data and browser-local persistence; no backend, real alerts, shared state, or cross-tab synchronization.
- Automated browser coverage is Chromium only. Axe checks provide accessibility basics, not a complete assistive-technology audit.
- Fixed demo timestamps intentionally remain unchanged after actions; activity sequence supplies ordering.
- Production deployment, public URL, and live direct-load behavior remain unverified until the user's Vercel import is complete.
