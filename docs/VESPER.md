# Watchlight · Vesper UI 2.0.0 migration

## Package and asset provenance

This upgrades an existing Meridian UI 1.0.0 integration. `vendor/vesper-ui-2.0.0.tgz` is the unmodified supplied release; its SHA-256 matches the source release:

```
09608c3a9a83ef41aef49059a83054688f3faa92e8f1a7d8592d2eb363594d6f
```

`package.json` and the npm lockfile use `file:vendor/vesper-ui-2.0.0.tgz` with integrity, never a sibling directory or symlink. The obsolete Meridian tarball and favicon are removed from the current checkout, retained in Git history. Unrelated dependencies keep their locked versions.

`VesperBrand` renders the original shipped V-and-star SVG without modification. `public/vesper-mark.svg` is copied verbatim from the installed package; a browser test compares the served favicon to the package asset. Its SHA-256 is `e89d75857687024d9e55dbdf158224cc2993c7019a8a363c970e309aca750eb2`. Font declarations and files come only from Vesper: local DM Sans for operational text, with shipped font licenses retained in `public/licenses/`. The package's MIT license is in the tarball; the root MIT license remains scoped to original prototype code.

## Integration

- `index.html`: Watchlight / Vesper Media Group title and description, Vesper favicon and night theme color, `data-vs-theme="dark"`, `data-vs-mode="operations"`, `body.vs-root`. Teleported overlays inherit the same foundation.
- `src/main.ts`: framework CSS → Vesper fonts/styles → local composition. `vesperVuetifyTheme('dark')` and `vesperVuetifyDefaults` retain all registered components, directives and MDI icons. `VSelect.hideDetails: 'auto'` preserves real helper/error content.
- `src/App.vue`: `VesperBrand`, `VesperBadge`, `VesperEmpty`; project-local status/severity tone maps. Vuetify continues to own filters, owner picker, side/full-width detail, confirmation and snackbar. Existing nested Escape, focus return and reactive reduced-motion behavior remain. App-owned detail Escape dismissal also handles rapid reopening before Vuetify updates its asynchronous global-top flag; open owner pickers and reset confirmation retain their own handling.
- `src/style.css`: only `--vs-*` semantic presentation values, no conflicting Meridian palette/font rules. Petrol/night surfaces, sand/cream text, sky actions and coral danger are role-driven. Metrics use tabular numerals; metadata is at least 12px, controls 44px desktop / 48px phone, selected values 16px. Responsive queue and recovery layout remain intact.
- `src/components/SignalChart.vue`: `vesperChartStyle('dark')` supplies resolved canvas colors/type/grid/tooltips. A single semantic action series supports each chart. Registration, reactive updates, local-font redraw, ResizeObserver cleanup, disposal, animation:false and accessible text summaries are retained.
- Product-visible IDs now use WL-01 etc. Internal IDs (`issue-01`) and query parameters remain stable. The `signal-desk:v1` key is intentionally retained so existing assignments, status and complete activity survive. No storage migration or second key is needed.

No domain code, fixture data, clock, scope rules or rules package moved. Ownership still changes independently from status. The original 8 browser scenarios retain all behavior assertions; only the title expectation changes. The existing 10 presentation tests move from `meridian.spec.ts` to `vesper.spec.ts` with Vesper assertions. Additional coverage verifies existing v1 data, metadata and exact favicon provenance.

## Visual evidence

[Manifest](images/vesper-2.0.0/manifest.json) records 26 current captures and their viewports/states. The before-desktop/phone images record this migration's live baseline. All earlier images remain under their original paths.

- [1440px dashboard](images/vesper-2.0.0/desktop-1440.png) and [side detail](images/vesper-2.0.0/detail-1440.png)
- [320px stacked queue](images/vesper-2.0.0/queue-320.png) and [save failure](images/vesper-2.0.0/blocked-320.png)
- [390px owner picker](images/vesper-2.0.0/owner-picker-390.png), [empty queue](images/vesper-2.0.0/empty-390.png), [reset confirmation](images/vesper-2.0.0/reset-confirm-390.png)
- [768px dashboard](images/vesper-2.0.0/dashboard-768.png)
- [Native 200% zoom](images/vesper-2.0.0/native-zoom.json), [dashboard](images/vesper-2.0.0/native-zoom-200-dashboard.png), [detail](images/vesper-2.0.0/native-zoom-200-detail.png)

After `npm run build`, serve `npm run preview -- --port 4372 --strictPort`, then run `node scripts/capture-vesper.mjs` and `node scripts/capture-native-zoom.mjs`. The latter uses an isolated temporary Chromium profile/extension to set actual tab zoom to 2 and verify triage/reload/reset; it does not touch the user's browser profile. Port 4371 belongs to the browser suite. Both scripts test local production output, not a live deployment.

See [VERIFICATION.md](VERIFICATION.md) for actual check results and limits, [REVIEW-READINESS.md](REVIEW-READINESS.md) for the learner audit, and [DEPLOYMENT.md](DEPLOYMENT.md) for the outstanding approval and live verification steps.
