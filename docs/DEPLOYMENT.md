# Vercel publication handoff

## Ownership and current status — 2026-09-30

The user chose to connect Vercel themselves after prioritizing a public GitHub repository. The authorized destination is the **Andy-Protogen** team (`andy-protogen`), project **signal-desk**, production branch **main**.

GitHub repository: https://github.com/andy-fitts-slalom/signal-desk

Vercel CLI authentication eventually succeeded and listed the intended team. No project was created, linked, or deployed during this build. Do not infer a live URL from the project name. An existing project must be inspected before reuse; unrelated work must never be overwritten.

## Connect GitHub in Vercel

1. Open [Andy-Protogen](https://vercel.com/andy-protogen).
2. Add a new project and import `andy-fitts-slalom/signal-desk`. If the repository is not listed, connect the appropriate GitHub account/integration and grant repository access through GitHub/Vercel; never paste credentials into project files or chat.
3. Use project name `signal-desk` if available. If it already exists, inspect its repository and purpose before reusing it. Choose a distinct name if unrelated, and record the change here.
4. Set framework **Vite**, root directory **repository root**, production branch **main**, install command **npm ci**, build command **npm run build**, output directory **dist**, Node.js **22.x**. No environment variables are required.
5. Deploy. `vercel.json` already configures the Vite build and SPA fallback for direct loads. Keep Git deployments enabled for main.

## Required live verification

After deployment, open the **actual production URL** reported by Vercel and complete these checks:

- Baseline counts: 15 / 8 / 3 / 72.
- Open SD-01, inspect grouped coverage, save an owner, acknowledge and resolve. Counts become 14 / 7 / 2 / 72. Refresh and verify persistence.
- Open `/?region=Europe&issue=issue-01` directly and refresh; detail and filter context must survive.
- Verify `/queue?issue=issue-01` directly if using the configured SPA fallback. This is an alias of the same workspace, not a separate screen.
- Confirm reset returns to the baseline; exercise the empty state and a 390px viewport.
- Run `PLAYWRIGHT_BASE_URL=https://ACTUAL-URL npm run test:e2e` for the automated browser checks. Deployment protection may require opening/authenticating through Vercel first; do not disable unrelated team settings.
- Record the URL, associated Git commit, actual browser evidence and any failures in docs/VERIFICATION.md and README.md.

Until those checks occur, deployment is **pending and unverified**.
