# Signal Desk — Project Brief

## What is this?

Signal Desk is an operational dashboard for the media response lead at Meridian Signal Group, a fictional company spanning streaming entertainment, digital publications, podcasts, and live events. Central communications coordinates with brand and regional press teams. The lead starts each shift by deciding which developing stories need attention and who should respond.

Build a working P301 case study prototype that turns coverage into a manageable work queue. The primary journey is: find an urgent, unassigned issue → inspect the supporting coverage → assign a response owner → acknowledge or resolve the issue. Prioritize that journey over the number of charts.

All organizational details, brands, people, outlets, stories, and numbers are invented. This brief is the complete domain context. The application must not contain source-vault material, real client information, internal product names, or copied research findings.

## Data

Create a deterministic local JSON dataset under `src/data/`, with TypeScript types and a short data dictionary. Use approximately 72 coverage items grouped into 18 issues, five fictional response owners, and three fictional media brands. Invent scenarios such as a programming announcement, an event schedule change, and confusion about subscription features.

- Each coverage item has an ID, issue ID, fictional headline and excerpt, outlet, publication timestamp, region, channel, and original-story identifier. Include some syndicated copies.
- Each issue has an ID, title, brand, topic, severity (`critical`, `high`, `normal`), status (`new`, `acknowledged`, `resolved`), optional owner, response deadline, and short explanation of its severity. Severity is a transparent editorial label, not an unexplained AI score.
- Each owner has an ID, fictional name, and team. Store an activity history for assignments and status changes.
- Use a fixed demonstration snapshot, such as October 21, 2025 at 09:00 America/Los_Angeles, with 48 hours of preceding coverage. Calculate deadlines and ages against that snapshot so the demonstration does not become stale with the calendar.

Define counts explicitly. An issue is a group of related coverage items. An original story is a source article and its syndicated copies. Issue totals count distinct issues; coverage totals count articles. Do not label summed outlet readership as people reached.

Seed urgent unassigned issues, assigned issues approaching a deadline, resolved issues, and duplicate coverage. At least one filter combination should produce an empty result. Label the interface as a fictional demonstration with its snapshot date.

## Layout

- Header: Meridian Signal Group, Signal Desk, snapshot date, and reset-demo action.
- Filters: brand, region, severity, and status, with a clear-all action and visible selected scope.
- Four summary cards: open issues, unassigned open issues, overdue open issues, and coverage items in the selected scope. Each card defines its time window or denominator.
- Main area: a prioritized issue queue with severity, owner, status, latest coverage, and deadline. Use criticality and deadline to establish a clear default order.
- Supporting charts: hourly coverage volume and open issues by brand. Charts support queue decisions and never replace access to the underlying items.
- Issue detail: explanation, grouped coverage, ownership, response controls, and activity history. Use a side panel on desktop and a full-width view on mobile.

## Interactions and behavior

- Filters update the cards, charts, and queue consistently. Define how region-filtered article membership determines which issues are included; count each matching issue once.
- Selecting an issue opens its detail without losing the queue's filters or position.
- Assign or change its owner, acknowledge it, resolve it, and reopen it. Update the queue, counts, and activity immediately.
- Separate ownership from status. Assigning an owner alone does not resolve an issue. Acknowledging means it has been reviewed, not that work is complete.
- Persist changes in this browser. Explain that this is a local demonstration, not shared team state. Reset restores the original dataset after confirmation.
- Show useful empty states, clear validation, and recoverable storage errors. Offer a way to undo a recent status change or reopen an issue.
- Every visible action must work. Do not simulate sending actual email or external alerts.

## Style and design intent

Create a calm, credible internal operations tool. Use strong hierarchy, restrained color, readable tables, and generous detail-view spacing. Reserve alert colors for severity and overdue states. Pair color with text and icons. Dark mode is the default, with adequate contrast.

Keep the queue visually dominant. An operator should understand what needs attention before reading a chart. On small screens, use stacked issue cards and accessible filters. Support keyboard use, visible focus, labeled controls, readable chart summaries, and reduced motion.

## Tech

- Vue 3, TypeScript, and Vite.
- Vuetify for the application shell, controls, cards, and responsive layout.
- Apache ECharts, optionally through its Vue wrapper, for the supporting charts.
- Local JSON and browser storage; no live news feed, database, paid service, or AI API is required.
- Unit tests for filtering, distinct-issue counts, deadline calculations, and state transitions; browser tests for the main triage journey and reset.

## Acceptance criteria

A reviewer can identify an urgent unassigned issue, inspect its evidence, assign an owner, acknowledge it, and resolve it. The summary counts change correctly, a reload retains the changes, and reset restores the seed state. Region filtering does not duplicate issues. Empty results and a narrow phone viewport remain usable. The production build passes, and the deployed URL supports direct loads and refreshes.

## Repository and delivery

Use a dedicated private GitHub repository named `signal-desk` under `andy-fitts-slalom`, plus a separate Vercel project named `signal-desk` if that name is available. Record any necessary Vercel naming adjustment.

Keep `BRIEF.md`, `README.md`, and `LICENSE` in the root. Use an MIT license for original prototype code, without claiming rights to third-party dependencies. The README explains the fictional premise, setup, commands, data definitions, demo persistence/reset, limitations, and live URL. Keep agent instructions and dated decisions/progress under a small, organized `docs/` structure and an appropriate root `AGENTS.md`.

Make and push descriptive commits as actual milestones are completed: planning, dataset, application structure, core flows, and verification. Do not fabricate development history. Verify the final deployed core flow, and document any remaining limitations honestly.


---

## Naming and design migration addendum — 2026-09-30

The original plan above is retained as planning evidence. This addendum supersedes its product/parent names, repository destination and presentation dependency; the domain, intended user, queue-first workflow and acceptance criteria remain the plan.

- Rename Signal Desk to **Watchlight**, the operational media-response dashboard for fictional **Vesper Media Group**. Use `andy-fitts-slalom/watchlight`, with incremental commits and verified pushes on `main`; do not create a new branch or PR.
- Upgrade the already-adopted Meridian UI 1.0.0 to the supplied **Vesper UI 2.0.0**, vendored within this repository. Use the original V-and-star mark, shared VesperBrand lockup and dark/operations mode. Apply petrol, sky, sand, cream and coral through semantic roles, locally hosted DM Sans, readable tabular metrics, and 44px controls / 48px phone targets. Retain Vuetify controls and ECharts, their registration and lifecycle.
- Preserve the dominant response queue, four metrics, filters, grouped evidence, desktop side detail and stacked phone queue/full-width detail. Retain all 18 issues, 72 articles, 54 originals and the initial 15 open / 8 unassigned / 3 overdue, with the fixed 2025-10-21 09:00 America/Los_Angeles clock. Display issue labels as WL-01 etc.; internal IDs and query links remain stable.
- Keep `signal-desk:v1` as the compatibility storage key; do not rename or clear valid saved assignments, statuses or history. Recheck existing saves, reload, undo/reopen, confirmed reset and corrupt/blocked storage recovery.
- Verify desktop and phone renders at 320/390/768/1440px, 200% zoom/reflow, keyboard focus, reduced motion and empty/error states. Retain meaningful tests and historical screenshots. Record exact verification scope and limits.
- Audit against the supplied learner instructions: working end-to-end flows, visible media-response user fit, logical AI context docs, root README/LICENSE, real incremental history and plan/result alignment. Password protection is recommended, not mandatory.
- The live accessible site criterion remains **unmet** until a new Watchlight deployment is explicitly approved, created and verified. The parent task's automatic approval review blocked project creation; this request authorizes main commits/pushes, not that deployment. Never invent a live URL or treat localhost as deployment evidence.
