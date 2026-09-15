# Golf Practice App

Multi-user, installable (PWA) mobile-web app for logging golf shots/putts, detecting personal miss patterns, and generating targeted practice sessions. See [golf-practice-app-brief.md](golf-practice-app-brief.md) for the original spec.

## Stack

- `server/` — Node/Express + TypeScript API, Postgres (via `@neondatabase/serverless`), email+password auth
- `client/` — React + Vite + TypeScript SPA, installable as a PWA with offline shot/putt logging
- `api/` — Vercel serverless entrypoint wrapping the same Express app for deployment

## Setup

```
npm install
cp server/.env.example server/.env   # fill in SESSION_SECRET and DATABASE_URL
npm run db:migrate -w server          # applies schema + seeds the global drill library
```

`DATABASE_URL` needs a Postgres connection string — the project uses [Neon](https://neon.tech) (also available as "Vercel Postgres" from the Vercel dashboard's Storage tab), with a separate `dev` branch for local development so testing never touches production data.

## Development

```
npm run dev
```

Starts the API on `http://localhost:3057` and the client (with hot reload) on `http://localhost:5185`, proxying `/api/*` to the server.

## Production build

```
npm run build
npm start
```

Builds the client into `client/dist` and serves it, along with the API, from a single Express process on `PORT` (default 3057).

## Tests

```
npm test -w client
```

Unit tests for the miss-direction compass geometry (`client/src/components/compass/compassMath.ts`).

## Deploying to Vercel

1. Create a Postgres database (Vercel dashboard → Storage → Create Database → Postgres, or directly at neon.tech) with separate branches for `dev` and production.
2. `npm i -g vercel`, then `vercel login` and `vercel link` from the repo root.
3. Set env vars on the Vercel project: `DATABASE_URL` (the **pooled** connection string, `-pooler` in the hostname) and `SESSION_SECRET` (a new one, not the local dev value).
4. Run `npm run db:migrate -w server` once, pointed at the **production** `DATABASE_URL`, before the first deploy goes live.
5. `vercel --prod` (or push to the connected Git branch).
6. After deploying, verify signup/login, logging a shot, and the "Add to Home Screen" install prompt on a real phone.

`vercel.json` builds the client as static output and routes `/api/**` to `api/index.ts`, a thin wrapper around the same `createApp()` factory used for local dev — no server code is duplicated for the serverless deploy.
