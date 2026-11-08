# North Yard Pickleball — Vercel + Neon

The original North Yard dashboard and live display now use native Node.js APIs and persistent PostgreSQL. No PHP host, browser-only database, sample players or automatic administrator login is used by this deployment.

[Deploy on Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fblanckton33-spec%2Fnorthyardpickleballsystem&env=ADMIN_EMAIL,ADMIN_PASSWORD&project-name=northyard-pickleball)

Alternatively import this GitHub repository into a new Vercel project. Select the `main` branch. Build settings are already in `vercel.json`.

## Setup

1. Import/deploy the repository in Vercel.
2. In that project's **Storage**, create a **Neon** database and connect it to Production. Verify the integration added `DATABASE_URL` (the pooled URL).
3. In **Settings → Environment Variables**, add `ADMIN_EMAIL` and `ADMIN_PASSWORD` (at least 12 characters). These are the initial administrator credentials, not an existing InfinityFree account. Do not commit them to GitHub.
4. Redeploy after adding the database and variables. Open the site and log in. Tables are created safely on the first database request; the initial administrator is created on the first login attempt when no users exist.
5. Use Users to add staff and administrators. The initial password is hashed, sessions expire after 12 hours, and login attempts are limited. Change passwords through Users. You may remove ADMIN_PASSWORD from Vercel after initialization.

The first deployment may show a database connection message until Neon is attached and the deployment is refreshed. The repository does not provision or charge for a Neon/Vercel account. Vercel Hobby is restricted to non-commercial personal use; choose a suitable plan for business operation.

## Included behavior

- Original dashboard, mobile/desktop display, derby poster and registration links.
- Real authentication, persistent sessions, administrator-controlled accounts; no public admin signup.
- Beginner/novice separation, maximum four players per queue, sequential numbering, new arrivals ahead of returning groups, separate two-player return queues, no games-played priority.
- Continuous four-hour player allowance, round timers, server-enforced expiration, logbook and payment records.
- Court reservation overlap checks, entered rates (including zero), equipment returns, retained cancellation history.
- Inventory base stock plus stock movements, suppliers and existing client-side reports.

## Existing records and backups

This deployment starts empty. It does **not** copy the live InfinityFree users, passwords, players or historical records. Keep the current production database export and running system until any migration has been completed and verified. The old MySQL SQL file cannot be imported directly into this Postgres schema.

Data lives in Neon, independent of Vercel deployments. Never reset/delete the database to update the website. Configure backups appropriate to the business; free-tier retention is limited.

## Implementation and limits

The small single-venue application's operational state is stored as a JSONB document in `northyard_state`; users and authentication sessions have their own tables. Database transactions and an advisory lock serialize operations to prevent lost updates across Vercel instances. Unchanged snapshots are not rewritten. This prioritizes consistency for the current small installation; growing history or high concurrency will require splitting operational data into indexed tables. There is no in-memory production persistence.

`public/` is the canonical UI. Older root HTML/React files are retained for reference and are not built. The build uses an explicit asset list so source/API files and secrets cannot be published as static files. PHP-looking URLs are compatibility rewrites to Node functions.

## Development and checks

- `npm ci`
- `npm test` — domain workflows and embedded PostgreSQL integration tests (PGlite). The embedded test substitutes the advisory lock call; actual Neon/serverless concurrency must be checked on the deployed project.
- `npm run build`
- `DATABASE_URL=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run dev` — prefer exporting secrets through your shell/session rather than recording them in shell history. Local HTTP testing requires appropriate cookie handling; deployed login uses Secure cookies over HTTPS.

Live Neon connectivity, Vercel deployment and production data migration are separate from local verification. They require your connected project and database.
