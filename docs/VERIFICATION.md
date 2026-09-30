# Verification — 2026-09-30

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

## External publication

The dedicated GitHub repository was created private, then changed to public on explicit user authorization. Descriptive planning, application structure, dataset and core workflow commits were pushed when those milestones were completed.

Vercel deployment is pending the user's GitHub import into `andy-protogen`, project `signal-desk`, production branch `main`. No Vercel URL has been opened or verified. Local route/refresh testing is not evidence of a working deployed rewrite. Use docs/DEPLOYMENT.md to finish live verification.

## Limitations

- Fictional static data and browser-local persistence; no backend, real alerts, shared state, or cross-tab synchronization.
- Automated browser coverage is Chromium only. Axe checks provide accessibility basics, not a complete assistive-technology audit.
- Fixed demo timestamps intentionally remain unchanged after actions; activity sequence supplies ordering.
- Production deployment, public URL, and live direct-load behavior remain unverified until the user's Vercel import is complete.
