import type { Metadata } from "next";
import Link from "next/link";
import { Flag, Medal, Target, Timer, Trophy } from "lucide-react";
import { getDrivers, getEvents } from "@/lib/data/content";
import { getUser, createClient } from "@/lib/supabase/server";
import type { RaceEvent } from "@/lib/types";
import { sessionStatus } from "@/lib/utils";
import { SectionLabel } from "@/components/SectionLabel";
import { SeriesTag } from "@/components/SeriesTag";
import { TiltCard } from "@/components/TiltCard";
import { LocalTime } from "@/components/LocalTime";
import { EmptyState } from "@/components/EmptyState";
import { PredictionForm, type PredictionRow } from "@/components/predictions/PredictionForm";
import { Leaderboard } from "@/components/predictions/Leaderboard";

export const metadata: Metadata = {
  title: "Predictions",
  description:
    "Call the podium and pole before lights out. Score points on every F1 race and climb the Rerace leaderboard.",
};

const SCORING = [
  { icon: Target, points: "10 pts", text: "For every podium driver you place on the exact step." },
  { icon: Medal, points: "4 pts", text: "For a podium driver you picked but placed on the wrong step." },
  { icon: Timer, points: "5 pts", text: "For correctly calling pole position." },
  { icon: Trophy, points: "+15 pts", text: "Bonus for nailing the entire podium in the right order." },
] as const;

/** Next F1 event with an upcoming (not finished) race session. */
function nextF1Race(events: RaceEvent[]) {
  const now = Date.now();
  return events
    .filter((e) => e.series === "f1")
    .flatMap((e) => {
      const race = e.sessions.find((s) => s.key === "race");
      return race && sessionStatus(race, now) !== "finished" ? [{ event: e, race }] : [];
    })
    .sort((a, b) => Date.parse(a.race.startsAt) - Date.parse(b.race.startsAt))[0];
}

export default async function PredictionsPage() {
  const [events, drivers, user] = await Promise.all([getEvents(), getDrivers(), getUser()]);

  const target = nextF1Race(events);

  // Unique F1 drivers for the pickers.
  const seen = new Set<string>();
  const f1Drivers: { id: string; name: string; team?: string }[] = [];
  for (const d of drivers) {
    if (d.series !== "f1" || seen.has(d.name)) continue;
    seen.add(d.name);
    f1Drivers.push({ id: d.id, name: d.name, team: d.team });
  }
  f1Drivers.sort((a, b) => a.name.localeCompare(b.name));

  // Signed-in users see their current prediction for the target race.
  let existing: PredictionRow | null = null;
  if (user && target) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("predictions")
      .select("p1, p2, p3, pole, points")
      .eq("event_id", target.event.id)
      .eq("user_id", user.id)
      .maybeSingle();
    existing = (data ?? null) as PredictionRow | null;
  }

  return (
    <div className="container-site space-y-12 pb-20 pt-10">
      {/* ============ HEADER ============ */}
      <section className="animate-rise">
        <SectionLabel className="mb-2">Play</SectionLabel>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Predictions
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
          Call the podium and pole before lights out. Points land after the chequered flag, and the
          season leaderboard never forgets.
        </p>
      </section>

      {/* ============ SCORING ============ */}
      <section>
        <SectionLabel className="mb-4">How Scoring Works</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SCORING.map((rule) => (
            <TiltCard key={rule.points} className="p-5">
              <rule.icon className="h-5 w-5 text-race-bright" />
              <p className="font-display mt-3 text-lg text-white">{rule.points}</p>
              <p className="mt-1.5 text-sm text-zinc-400">{rule.text}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        {/* ============ NEXT RACE + FORM ============ */}
        <div className="lg:col-span-2">
          {target ? (
            <div className="glass-strong p-6 sm:p-8">
              <div className="mb-1 flex items-center gap-3">
                <SectionLabel>Next Race</SectionLabel>
                <SeriesTag series="f1" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">{target.event.title}</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {target.event.circuit} · {target.event.country} — race starts{" "}
                <LocalTime iso={target.race.startsAt} mode="datetime" className="font-semibold text-zinc-200" />
              </p>

              <div className="mt-7">
                {user ? (
                  <PredictionForm
                    eventId={target.event.id}
                    userId={user.id}
                    drivers={f1Drivers}
                    lockAt={target.race.startsAt}
                    existing={existing}
                  />
                ) : (
                  <div className="rounded-[var(--radius-card)] border border-white/[0.08] bg-white/[0.03] p-8 text-center">
                    <Flag className="mx-auto h-7 w-7 text-race-bright" />
                    <p className="mt-3 text-sm font-semibold text-white">
                      You need a free account to play.
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Sign in to lock in your podium before the formation lap.
                    </p>
                    <Link href="/login?next=%2Fpredictions" className="btn-race mt-5">
                      Sign in to predict
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No upcoming F1 race to predict"
              message="The next round hasn't been scheduled yet. Check back once the calendar fills up."
              ctaHref="/schedule"
              ctaLabel="View the schedule"
            />
          )}
        </div>

        {/* ============ LEADERBOARD ============ */}
        <div className="lg:col-span-1">
          <Leaderboard />
        </div>
      </section>
    </div>
  );
}
