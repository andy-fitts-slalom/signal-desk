# Meridian UI migration verification — 2026-09-30

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
