# Planning backend: tech stack choices

## Application

- **Next.js 15** (App Router) — UI and **Route Handlers** for the planning API.
- **TypeScript** — shared types for API and domain logic.
- **Prisma 7** + **SQLite** — persistence for zones, reservations, forecasts, spot requests, and planning events. Connection URL lives in [`prisma.config.ts`](../prisma.config.ts) (`DATABASE_URL`). SQLite keeps local dev simple; point `DATABASE_URL` at PostgreSQL in production when you are ready. Instantiating `PrismaClient` in app code uses Prisma 7’s driver adapter pattern for SQLite (see Prisma docs).

## Job runner / polling

- **Vercel Cron** (or any HTTP cron) can hit a dedicated poll route (e.g. `/api/cron/poll-external`) once you add it. Protect with `CRON_SECRET` in the `Authorization` header.
- Alternatively, run the same URL from **GitHub Actions**, **Cloud Scheduler**, or a small worker—no in-process `node-cron` required.

## External providers (API keys)

| Capability | Suggested providers | Env vars |
|------------|---------------------|----------|
| Vessel ETAs / port arrivals (USMOB) | VesselFinder, VesselAPI, MarineTraffic-class AIS APIs | `AIS_API_URL`, `AIS_API_KEY` (provider-specific; adjust client in cron route when you subscribe) |
| Weather / marine alerts | NOAA National Weather Service (no key for `api.weather.gov`; identify with `User-Agent`) | `NWS_MARINE_ZONES` (comma-separated zone ids, e.g. `GMZ335,GMZ532`) |

Copy [`.env.example`](../.env.example) to `.env` and fill values.

## Operations

- Run migrations: `npx prisma migrate dev` (dev) or `npx prisma migrate deploy` (CI/prod).
- Generate client after schema changes: `npx prisma generate`.
