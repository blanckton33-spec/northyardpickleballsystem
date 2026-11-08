# North Yard — exact original interface on Vercel

This build serves the original dashboard and live display, including current queue fixes and derby announcement. The former React demo and mock localStorage database are not the deployed entry points. Existing React source is retained for reference only.

## Backend required

Set `PHP_BACKEND_ORIGIN` in Vercel to the HTTPS origin (optionally including a subdirectory) of a compatible PHP/MySQL host. The Node API adapters forward requests and session cookies to the original PHP API. No database credentials belong in frontend code. Without configuration API calls return 503; no sample data or automatic administrator login is supplied.

InfinityFree free hosting blocks this external API access. Do not point the adapter at it and expect it to work. Move the PHP API and MySQL database to compatible hosting, or undertake a separate Node/database migration. Vercel Hobby permits non-commercial personal projects only; this business requires an appropriate plan.

## Preserve all records

1. Export the CURRENT production MySQL database using phpMyAdmin, including users, password hashes, match results, timers, queue, logbook, payments, inventory and rentals. The bundled old SQL file is not a backup of current records.
2. Import the export into the new MySQL host. Copy the working `htdocs/api/*.php` backend there and configure that host's `api/config.php` privately.
3. Keep a backup and stop writes during final cutover. Verify row counts and sample records; preserve IDs and password hashes.
4. Set `PHP_BACKEND_ORIGIN`, deploy, and verify actual login/logout, roles, two-device queue synchronization, timers, payments, rentals and reports. PHP remains responsible for authorization and transactions.
5. Keep the original running system available until verification is complete. This repository change does not migrate or modify any production database.

## Build

`npm run build` copies the canonical `public/` interface into `dist/`. Failures are not suppressed. `npm test` verifies the adapter and frontend source. Do not upload PHP source or credentials into `public/`. `display.php` is a compatibility URL rewritten to static `display.html`; the live data comes from the API.

Do not deploy until a compatible backend and a current database export are ready. No live migration has been performed by this repair.
