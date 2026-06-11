# Rerace — rerace.net

The exclusive worldwide online motorsport broadcaster. Live streams, F1 replays, documentaries, movies, videos, news, standings, schedules, daily polls and a predictions game — for Formula 1, F2, F3, MotoGP, NASCAR, IndyCar, WEC, WRC and Porsche Supercup.

Built with **Next.js 16** (App Router) · **Tailwind v4** · **Supabase** (Postgres, Auth, Realtime) · **Payload CMS 3** (embedded at `/admin`) · **Resend** · deployed on **Vercel**.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

The site renders out of the box with built-in demo content (a live Le Mans event, the F1 replay library, documentaries, news, standings). Real content takes over automatically as you connect the services below.

## Setup checklist

### 1. Supabase (already provisioned — project `jlvadzbimedbnkxuzibk`)

The database schema (profiles, chat with DB-level automod, polls, predictions, reminders, newsletter, news/standings caches) is already migrated. Remaining manual steps in the [Supabase dashboard](https://supabase.com/dashboard/project/jlvadzbimedbnkxuzibk):

1. **Service role key** — Project Settings → API keys → copy the `service_role` secret into `SUPABASE_SERVICE_ROLE_KEY` (.env.local + Vercel). Needed by the news crawler, standings refresh and reminder crons.
2. **Discord login** — Authentication → Providers → Discord → enable, using a Discord application's client id/secret (Discord Developer Portal → OAuth2 → redirect URL `https://jlvadzbimedbnkxuzibk.supabase.co/auth/v1/callback`).
3. **Auth URLs** — Authentication → URL Configuration → Site URL `https://rerace.net`, plus `http://localhost:3000/**` and `https://rerace.net/**` as redirect URLs.
4. **Email confirmations** — Authentication → Sign In / Up → keep "Confirm email" ON (accounts must verify email; disposable domains are blocked in the app).

### 2. Payload CMS (`/admin`)

Payload manages events & streams, replays, documentaries/movies/videos, news posts, polls, drivers, teams, ad slots and status incidents.

1. Supabase dashboard → **Connect** → copy the **Session pooler** connection string into `DATABASE_URI`:
   `postgresql://postgres.jlvadzbimedbnkxuzibk:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`
   (Reset the database password under Project Settings → Database if you don't have it.)
2. Start the app and open `/admin` — Payload creates its tables in the `payload` schema on first run and asks you to create the first admin user.
3. Content tips:
   - **Events**: the `eventId` is the public URL (`/watch/<eventId>`). Add sessions (with start times in UTC) and stream sources (iframe embed URLs or HLS `.m3u8`).
   - **Ad slots**: keys `mega-menu`, `news-feed`, `sidebar`, `between-rows`, `watch-below`. Mode `code` for HilltopAds/AdMaven snippets, `banner` for partner image + link.
   - **Polls**: create one per day (startsAt/endsAt 24h apart). The newest active poll shows on the homepage and `/polls`.

### 3. Resend (newsletter + session reminder emails)

Create an API key at [resend.com](https://resend.com), verify the `rerace.net` domain, set `RESEND_API_KEY` and `EMAIL_FROM`. (Sign-in magic links are sent by Supabase, not Resend.)

### 4. Vercel

```bash
vercel link && vercel deploy
```

- Add all variables from `.env.example` to the Vercel project.
- `vercel.json` schedules the crons: news crawler (hourly), standings refresh (6-hourly), reminders + go-live announcements (every 10 min). Cron requests authenticate with `CRON_SECRET`.
- Optional: create a Vercel Blob store and set `BLOB_READ_WRITE_TOKEN` if you want image uploads in the CMS later (image URL fields work without it).

### 5. Optional integrations

- **Discord/Telegram go-live posts** — set `DISCORD_WEBHOOK_URL` (server webhook) and `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` (`@rerace`).
- **Web push** — `npx web-push generate-vapid-keys`, fill the `VAPID_*` vars.

## Architecture notes

- `src/lib/data/content.ts` is the single content gateway: Payload first, seed/demo data as fallback — the site never renders empty.
- Supabase owns interactive data (chat, votes, predictions, reminders); chat automod (banned words + rate limiting) runs **inside Postgres** via trigger, so it can't be bypassed.
- Members-only content (chat, polls, predictions, movies, replays, reminders) requires a verified account; disposable email domains are rejected (`src/lib/disposable-domains.ts`).
- Standings come from `standings_cache` refreshed by `/api/cron/standings` (OpenF1-derived for F1, pluggable fetchers for other series). **Ergast is intentionally not used.**
- All schedule times render in the visitor's timezone; `/api/calendar` serves `.ics` files (single session or full feed).

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `node scripts/gen-posters.mjs` | Regenerate abstract series poster art |
| `npx payload generate:importmap` | Regenerate the CMS admin import map |
