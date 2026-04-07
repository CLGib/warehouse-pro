# Warehouse Pro

Warehouse operations and inventory management. Source repository: [github.com/CLGib/warehouse-pro](https://github.com/CLGib/warehouse-pro).

## Getting started

```bash
npm install
cp .env.example .env
# Set AUTH_SECRET in .env (e.g. openssl rand -base64 32)
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then **Sign in** and use the seeded account:

- **Email:** `demo@warehouse.local`
- **Password:** `Demo123!`

The **Stowage planner** (`/dashboard` after login) stores your **warehouse sq ft**, **floor strength (psf)**, **roof / clear height (ft)**, and **cargo lots with time windows**. It recomputes an interval-by-interval plan (area, weight vs slab model, stack vs clear height) when you refresh or change data. This is a **planning aid**, not structural engineering.

## Scripts

- `npm run dev` — development server (Turbopack)
- `npm run dev:webpack` — dev without Turbopack if you hit toolchain issues
- `npm run build` — `prisma generate` + production build
- `npm run start` — run production server
- `npm run lint` — ESLint
- `npm run db:migrate` — Prisma migrate (dev)
- `npm run db:seed` — seed demo user + sample warehouse/cargo

## Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/) + SQLite (swap `DATABASE_URL` for Postgres in production)
- [NextAuth.js v5](https://authjs.dev/) (credentials)

## Push to GitHub

If this folder is not yet linked to the remote:

```bash
git init
git add .
git commit -m "Initial commit: Next.js app scaffold"
git branch -M main
git remote add origin https://github.com/CLGib/warehouse-pro.git
git push -u origin main
```
