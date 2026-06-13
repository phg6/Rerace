import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Play } from "lucide-react";
import { getReplays } from "@/lib/data/content";
import type { ReplayItem } from "@/lib/types";
import { seriesMeta } from "@/lib/series";
import { SectionLabel } from "@/components/SectionLabel";
import { TiltCard } from "@/components/TiltCard";
import { LocalTime } from "@/components/LocalTime";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "F1 Replays — Full Race Weekend Sessions",
  description:
    "Watch full Formula 1 replays on Rerace: every practice, qualifying, sprint and race session of the season, organised by race weekend. Free account required.",
  openGraph: {
    title: "F1 Replays — Full Race Weekend Sessions",
    description:
      "Every Formula 1 session of the season as a full replay — FP1 to the chequered flag, organised by race weekend.",
    images: [{ url: "/img/series/f1.svg" }],
  },
};

interface Weekend {
  key: string;
  season: number;
  round: number;
  eventName: string;
  airedAt: string; // earliest session of the weekend
  sessions: ReplayItem[];
}

function groupWeekends(replays: ReplayItem[]): Weekend[] {
  const map = new Map<string, Weekend>();
  for (const r of replays) {
    const key = `${r.season}-r${r.round}`;
    const existing = map.get(key);
    if (existing) {
      existing.sessions.push(r);
      if (Date.parse(r.airedAt) < Date.parse(existing.airedAt)) existing.airedAt = r.airedAt;
    } else {
      map.set(key, {
        key,
        season: r.season,
        round: r.round,
        eventName: r.eventName,
        airedAt: r.airedAt,
        sessions: [r],
      });
    }
  }
  const weekends = [...map.values()];
  for (const w of weekends) {
    w.sessions.sort((a, b) => Date.parse(a.airedAt) - Date.parse(b.airedAt));
  }
  // Latest weekend first
  return weekends.sort((a, b) => Date.parse(b.airedAt) - Date.parse(a.airedAt));
}

function SessionChips({ sessions }: { sessions: ReplayItem[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {sessions.map((s) => (
        <Link
          key={s.id}
          href={`/replays/${s.id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-1.5 text-xs font-semibold text-zinc-200 backdrop-blur-xl transition-all duration-200 hover:border-race/60 hover:bg-white/[0.1] hover:text-white hover:shadow-glow-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race"
        >
          <Play className="h-3 w-3 fill-current" />
          {s.session}
        </Link>
      ))}
    </div>
  );
}

export default async function ReplaysPage() {
  const replays = await getReplays();
  const weekends = groupWeekends(replays);
  const season = weekends[0]?.season;
  const f1Poster = seriesMeta("f1").poster;

  return (
    <div className="container-site pb-20 pt-10">
      {/* ============ HEADER ============ */}
      <header className="max-w-3xl animate-rise">
        <SectionLabel className="mb-2">Formula 1</SectionLabel>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Replays</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          {season ? `Every session of the ${season} season` : "Every session of the season"} — practice,
          qualifying, sprints and races, organised by race weekend.{" "}
          <span className="text-zinc-500">Only Formula 1 has full session replays on Rerace.</span>
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1 text-xs text-zinc-400">
          <Lock className="h-3 w-3 text-race-bright" /> Free account required to watch replays
        </p>
      </header>

      {/* ============ SEASON BROWSER ============ */}
      {weekends.length === 0 ? (
        <EmptyState
          className="mt-12"
          title="No replays yet"
          message="The replay library is empty right now. Check the schedule for upcoming sessions instead."
          ctaHref="/schedule"
          ctaLabel="View schedule"
        />
      ) : (
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {weekends.map((w, i) => {
            const featured = i === 0;
            return (
              <TiltCard
                key={w.key}
                maxTilt={featured ? 3 : 6}
                className={
                  featured ? "glass-strong p-7 sm:p-10 md:col-span-2" : "p-6"
                }
              >
                {featured && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={w.sessions[0]?.image || f1Poster}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-25"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/40" />
                  </>
                )}
                <div className="relative">
                  <div className="flex items-start gap-5 sm:gap-7">
                    <span
                      className={
                        featured
                          ? "font-display text-6xl leading-none text-race-bright sm:text-8xl"
                          : "font-display text-4xl leading-none text-zinc-600 sm:text-5xl"
                      }
                    >
                      {String(w.round).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 pt-1">
                      {featured && <SectionLabel className="mb-1.5">Latest weekend</SectionLabel>}
                      <h2
                        className={
                          featured
                            ? "text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
                            : "text-lg font-bold tracking-tight text-white"
                        }
                      >
                        {w.eventName}
                      </h2>
                      <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                        Round {w.round} · {w.season} · Aired{" "}
                        <LocalTime iso={w.airedAt} mode="date" className="text-zinc-300" />
                      </p>
                    </div>
                  </div>
                  <div className={featured ? "mt-7" : "mt-5"}>
                    <SessionChips sessions={w.sessions} />
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
