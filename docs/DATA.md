# Fictional data dictionary

All entities and editorial content are invented for Meridian Signal Group. The deterministic JSON files are independent from other case studies and contain no live feed, client material, audience estimates, or external article links.

## Snapshot and denominators

Snapshot: **October 21, 2025, 09:00 America/Los_Angeles**, equivalent to `2025-10-21T16:00:00.000Z`. Coverage is restricted to the preceding 48 hours, inclusive of the boundary. The charts contain 48 hourly bins; a coverage item exactly at the snapshot belongs to the last bin. Age, time remaining, and overdue calculations always use the snapshot, never the computer clock. A deadline at exactly the snapshot is due now; a deadline before it is overdue. Resolved issues never contribute to open or overdue totals.

There are 18 issues, 72 coverage items, 54 distinct original stories, five response owners, and three brands. Each issue has four articles, including one original and one syndicated copy sharing an original-story ID, plus two independent originals. Coverage counts articles, including syndication. Issue counts use distinct issue IDs. No measure represents audience reach.

Baseline summary: 15 open issues, 8 unassigned open issues, 3 overdue open issues, 72 coverage items. Seed assignments/statuses describe the starting snapshot; the activity list records changes made during the demo session and starts empty.

## JSON records

| File | Fields and meaning |
| --- | --- |
| `brands.json` | Fictional brand names: Luma Stream, Folio Press, Echo Live. |
| `owners.json` | `id`: stable owner key; `name`: fictional response lead; `team`: response team. |
| `issues.json` | `id`: stable grouping key; `title`; `brand`; `topic`; `severity`: critical/high/normal; `severityReason`: transparent editorial explanation; `status`: new/acknowledged/resolved; `ownerId`: owner reference or null; `deadline`: UTC ISO response deadline. |
| `articles.json` | `id`: stable article key; `issueId`: parent issue; `headline`; `excerpt`; `outlet`: fictional outlet; `publishedAt`: UTC ISO timestamp; `region`: North America/Europe/Asia Pacific; `channel`; `originalStoryId`: story grouping key shared by original and syndicated copies (not an article ID); `isSyndicated`: true only for a syndicated copy. Each copy is published ten minutes after its original. |

## Scope and state

`selectScope` is the shared selector for queue, cards and charts. Brand, severity and status filter issues. Region filters articles first; an issue belongs if at least one matching article is in the 48-hour window. Each matching issue appears once. Coverage totals and hourly bins then include only region-matching articles belonging to the selected issues. The brand chart counts open issues using the same scope, with explicit zero values for other brands. Folio Press + Asia Pacific intentionally returns empty results.

Default queue priority is open before resolved, then severity (critical, high, normal), earliest deadline, stable ID. Ownership is independent of status. Assignment does not acknowledge or resolve. Acknowledgement remains open. Reopen returns to new and retains the owner.

Local state schema version 1 stores issue ownership/status and a chronological activity array. Each activity includes an ID, issue ID, kind (assignment/status), fixed-snapshot timestamp and readable message. Events sharing the snapshot retain their array order. Persistence validation rebuilds fixed editorial content from seed JSON, validates references and status values, and rejects incompatible/corrupt records. A rejected storage value should be shown as a recoverable error by the application. All state and history are confined to the current browser; no real messages or alerts are sent.
