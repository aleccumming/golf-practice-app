# Golf Practice App

Multi-user, installable (PWA) mobile-web app for logging golf shots/putts, detecting personal miss patterns, and generating targeted practice sessions. See [golf-practice-app-brief.md](golf-practice-app-brief.md) for the original spec.

## Stack

- `server/` — Node/Express + TypeScript API, Postgres (via `@neondatabase/serverless`), Google Sign-In auth (stateless signed session cookie, no server-side session store)
- `client/` — React + Vite + TypeScript SPA, installable as a PWA with offline shot/putt logging
- `api/` — Vercel serverless entrypoint wrapping the same Express app for deployment

## Setup

```
npm install
cp server/.env.example server/.env   # fill in SESSION_SECRET, DATABASE_URL, GOOGLE_CLIENT_ID
cp client/.env.example client/.env   # fill in VITE_GOOGLE_CLIENT_ID (same client ID)
npm run db:migrate -w server          # applies schema + seeds the global drill library
```

`DATABASE_URL` needs a Postgres connection string — the project uses [Neon](https://neon.tech) (also available as "Vercel Postgres" from the Vercel dashboard's Storage tab), with a separate `dev` branch for local development so testing never touches production data.

`GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID` come from a Google Cloud OAuth 2.0 Client ID (Web application type). In Google Cloud Console → Credentials → your client → **Authorized JavaScript origins**, add every origin you'll actually load the app from (e.g. `http://localhost:5185` for local dev, plus your production URL once deployed) — Google rejects sign-in from any origin not on that list, and changes there can take a few minutes to propagate.

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

## Deploying to Vercel

1. Create a Postgres database (Vercel dashboard → Storage → Create Database → Postgres, or directly at neon.tech) with separate branches for `dev` and production.
2. `npm i -g vercel`, then `vercel login` and `vercel link` from the repo root.
3. Set env vars on the Vercel project (Settings → Environment Variables — `VITE_GOOGLE_CLIENT_ID` needs to be available at **build** time, not just runtime, since Vite bakes it into the client bundle):
   - `DATABASE_URL` (the **pooled** connection string, `-pooler` in the hostname)
   - `SESSION_SECRET` (a fresh, long random value — not the local dev one)
   - `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` (same value, both names required)
4. In Google Cloud Console, add your production URL (e.g. `https://your-app.vercel.app`) to the OAuth client's **Authorized JavaScript origins**. Also check the OAuth consent screen's publishing status — if it's still in "Testing," only explicitly-added test users can sign in; click **Publish App** to allow any Google account (safe here since we only request the default non-sensitive `email`/`profile` scopes, so this doesn't trigger a verification review).
5. Run `npm run db:migrate -w server` once, pointed at the **production** `DATABASE_URL`, before the first deploy goes live.
6. `vercel --prod` (or push to the connected Git branch).
7. After deploying, verify Google sign-in, logging a shot, and the "Add to Home Screen" install prompt on a real phone.

`vercel.json` builds the client as static output and routes `/api/**` to `api/index.ts`, a thin wrapper around the same `createApp()` factory used for local dev — no server code is duplicated for the serverless deploy.
