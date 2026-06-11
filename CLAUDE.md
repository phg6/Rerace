# Rerace — rerace.net

Exclusive worldwide online motorsport broadcaster: F1, F2, F3, MotoGP, NASCAR, IndyCar, WEC/endurance, WRC, Porsche Supercup.

## Stack

- **Next.js 16** (App Router, `src/` dir, Turbopack, TypeScript) on **Vercel**
- **Tailwind CSS v4** (CSS-first config in `src/app/globals.css` via `@theme`)
- **Supabase** (project ref `jlvadzbimedbnkxuzibk`): Postgres, Auth (Discord OAuth + email magic link), Realtime (chat, poll votes)
- **Payload CMS 3** embedded at `/admin` (`@payloadcms/db-postgres` → same Supabase Postgres via `DATABASE_URI`)
- **Resend** for newsletters + reminder emails (Supabase sends auth emails)
- **Lucide** icons, **Geist** (body/UI) + **Zen Dots** (logo & section labels only) via `next/font/google`

## Design system (LOCKED — follow exactly)

- **Dark-only**, near-black neutral bg `#0a0a0b`. No light mode.
- **Racing red** accent `#e10600` (hover `#ff2d23`).
- **Glassmorphism**: translucent surfaces `bg-white/[0.04]`, `backdrop-blur`, 1px `border-white/[0.08]`. Use the `.glass` utility class.
- **Very rounded**: cards `rounded-card` (18px), buttons fully rounded (pill).
- **Buttons**: glass with red accents (`.btn-glass`); solid red reserved for primary "Watch Live" CTAs (`.btn-race`).
- **Card hover**: 3D tilt + red edge glow + reveal of extra info — use the `<TiltCard>` component.
- **Cinematic & spacious** density; wide container ~1536px via `.container-site`.
- **Zen Dots** ONLY for the wordmark and small uppercase section labels (`<SectionLabel>`); everything else Geist.
- **Live indicator**: red pill badge + slim animated red progress bar (`.live-bar`).
- **Imagery**: photos with dark gradient overlays; abstract series-colored SVG posters in `/public/img/` as fallbacks.
- **Loading**: shimmer skeletons (`.skeleton`). **Empty states**: branded illustration + helpful CTA (`<EmptyState>`).
- **Motion**: moderate — hover states, tilt, fade/slide on scroll. No heavy page transitions.
- Subtle per-series accent colors: see `src/lib/series.ts` (`SERIES` map).

## Architecture

- `src/lib/types.ts` — shared content types (RaceEvent, StreamSource, ReplayItem, MediaItem, NewsArticle, Poll, Driver, Team, …)
- `src/lib/data/*` — ALL content access goes through these functions. They try Payload first and **fall back to seed data** (`src/lib/data/seed.ts`) when `DATABASE_URI` is unset, so the site always renders.
- `src/lib/supabase/` — `client.ts` (browser), `server.ts` (RSC/route handlers, cookie-based), `admin.ts` (service-role, server-only).
- `src/payload/` — Payload collections; config at `src/payload.config.ts`. Admin UI: `/admin`.
- Supabase owns: profiles, chat (DB-trigger automod: banned words + rate limit), poll votes, predictions, reminders, push subscriptions, newsletter subscribers, crawled `news_items`, `standings_cache`, `results_cache`.
- Payload owns: events+streams, replays, media (docs/movies/videos), news posts (Rerace originals), polls, drivers, teams, ad slots, status incidents.
- Crons (Vercel): `/api/cron/news` (RSS crawler), `/api/cron/standings` (refresh caches), `/api/cron/reminders` (send due reminders + go-live Discord/Telegram). All require `Authorization: Bearer CRON_SECRET`.

## Rules

- Accounts (free, verified email) are REQUIRED for: chat, polls, predictions, profiles, movies, replays. Watching livestreams is open.
- Disposable email domains are blocked at signup (`src/lib/disposable-domains.ts`).
- All schedule times render in the **viewer's timezone** (client component using `Intl`).
- English only — no i18n.
- SEO matters: metadata + OpenGraph on every page, JSON-LD where apt, sitemap, robots.
- Ad slots are placeholder components (`<AdSlot slotKey="...">`) fed by the Payload `ad-slots` collection (HilltopAds/AdMaven embed code or partner image+link).
- Never use the Ergast F1 API. Standings come from `standings_cache` (hybrid: OpenF1-derived + cached scraping), refreshed by cron.
- Socials: Discord https://discord.gg/PZXCb77fj8 · X https://x.com/Rerace_ · Telegram https://t.me/rerace · Instagram https://instagram.com/rerace.io

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — eslint
