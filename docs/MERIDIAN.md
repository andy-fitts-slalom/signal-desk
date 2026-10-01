# Meridian UI 1.0.0 migration

## Scope and provenance

Only shared presentation is reused. Signal Desk retains Vue 3, TypeScript, Vite, Vuetify, ECharts and its independent application code/data. No sibling app source or records were imported. The parent branding reuse supersedes the original isolation rule only for the supplied design system.

`vendor/meridian-ui-1.0.0.tgz` is the unmodified supplied release, installed as `file:vendor/meridian-ui-1.0.0.tgz`. Both tarball and lockfile are deliverables. SHA-256:

```
867f3f8b38d3e45160964cd26fc1f527999c3876ad6c5253c4dcc9ac9cfd8123
```

The checksum matches the supplied sibling release. `public/meridian-mark.svg` is copied verbatim from `@meridian/ui/assets/brand/meridian-mark.svg`. The old Signal Desk waveform favicon was removed. DM Sans and the shared package's font declarations are bundled locally; the application uses DM Sans, with no remote font service. Copies of the shipped font licenses are in `public/licenses/`. The fonts retain their SIL Open Font Licenses; the shared UI package retains its MIT license in the tarball.

## Integration choices

- `index.html`: `data-ms-theme="dark"`, `data-ms-mode="operations"`, and `body.ms-root` cover teleported framework overlays.
- `src/main.ts`: framework CSS → shared fonts/styles → app CSS. `meridianVuetifyTheme('dark')` and shared defaults retain registered components, directives and MDI icons. VSelect uses `hideDetails: 'auto'` so future real messages are not globally suppressed.
- `src/App.vue`: shipped MeridianBrand, MeridianBadge and MeridianEmpty. Product title remains Signal Desk. Project-local severity/status tone maps keep the domain out of the design package. Vuetify continues to own controls, overlays, reset confirmation and feedback. Reduced-motion changes are observed reactively and disable the framework's JavaScript menu/dialog transitions while retaining opener focus. A scoped owner-menu Escape handler prevents the no-motion nested overlay from also dismissing its parent.
- `src/style.css`: existing composition rewritten using semantic palette, type, spacing, radius and state roles. No legacy palette/font override sheet remains. Metadata is at least 12px; controls are at least 44px desktop/48px phone, with 16px selected values. Field labels retain contrast and a visible focus outline. Selected values wrap; phone alert recovery occupies its own grid row.
- `src/components/SignalChart.vue`: `meridianChartStyle('dark')` supplies resolved font, axis/grid/tooltip values; the action token supplies the single series. No CSS-variable strings are passed as canvas colors. Labels are at least 12px; local-font readiness triggers a redraw. Counts, summaries, ResizeObserver and disposal remain intact.

The domain module, JSON fixtures, existing domain tests and original eight browser tests remain unchanged. Counts, fixed demo clock, region membership, evidence scope, storage key, transitions, undo/reset and URL/focus/scroll behavior retain their original contracts.

## Review and evidence

Read [VERIFICATION.md](VERIFICATION.md) for final check results and limits. [Screenshot manifest](images/meridian-1.0.0/manifest.json) records each local viewport/state. Representative captures:

- [1440px dashboard](images/meridian-1.0.0/desktop-1440.png)
- [390px queue](images/meridian-1.0.0/queue-390.png)
- [390px owner picker](images/meridian-1.0.0/owner-picker-390.png)
- [320px save failure](images/meridian-1.0.0/blocked-320.png)
- [390px empty queue](images/meridian-1.0.0/empty-390.png)
- [390px reset confirmation](images/meridian-1.0.0/reset-confirm-390.png)
- [1440px local activity](images/meridian-1.0.0/activity-1440.png)
- [200% zoom-reflow detail proxy](images/meridian-1.0.0/zoom-detail-200-1440.png)

To regenerate after building, start `npm run preview -- --port 4372 --strictPort` and run `node scripts/capture-meridian.mjs`. The script verifies the local theme/brand, uses isolated browser contexts and fictional local state, waits for stable fonts/animations, and records viewport screenshots. It does not access a deployed site. Port 4371 is exclusively for the browser suite; unrelated processes must not be reused/stopped.

The user subsequently authorized milestone pushes to GitHub on `refactor/meridian-ui-1.0.0`. This does not authorize merging/pushing main or manually publishing/deploying. No live Signal Desk migration is claimed here.
