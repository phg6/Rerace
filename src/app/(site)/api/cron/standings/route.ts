import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StandingRow, StandingsTable } from "@/lib/types";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* OpenF1-derived Formula 1 standings (best effort — never Ergast).    */
/* ------------------------------------------------------------------ */

const OPENF1 = "https://api.openf1.org/v1";
const RACE_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1];

interface OpenF1Session {
  session_key: number;
  session_name: string; // "Race" | "Sprint"
  date_start: string;
  date_end: string;
  year: number;
}

interface OpenF1Result {
  position: number | null;
  driver_number: number;
  dsq?: boolean;
}

interface OpenF1Driver {
  driver_number: number;
  full_name: string;
  team_name?: string;
  team_colour?: string;
  country_code?: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return (await res.json()) as T;
}

async function fetchF1(): Promise<StandingsTable[]> {
  const season = new Date().getFullYear();
  const sessions = await fetchJson<OpenF1Session[]>(`${OPENF1}/sessions?year=${season}&session_type=Race`);
  const now = Date.now();
  const finished = sessions.filter(
    (s) =>
      (s.session_name === "Race" || s.session_name === "Sprint") &&
      s.date_end &&
      Date.parse(s.date_end) < now
  );
  if (finished.length === 0) return [];

  const driverPoints = new Map<
    string,
    { points: number; wins: number; team?: string; teamColor?: string; nationality?: string }
  >();
  const teamPoints = new Map<string, { points: number; wins: number; color?: string }>();

  for (const session of finished) {
    // Per-session try/catch — one bad session must not kill the whole run.
    try {
      const [results, drivers] = await Promise.all([
        fetchJson<OpenF1Result[]>(`${OPENF1}/session_result?session_key=${session.session_key}`),
        fetchJson<OpenF1Driver[]>(`${OPENF1}/drivers?session_key=${session.session_key}`),
      ]);
      const byNumber = new Map(drivers.map((d) => [d.driver_number, d]));
      const pointsMap = session.session_name === "Sprint" ? SPRINT_POINTS : RACE_POINTS;

      for (const r of results) {
        if (!r.position || r.dsq) continue;
        const driver = byNumber.get(r.driver_number);
        if (!driver) continue;
        const pts = pointsMap[r.position - 1] ?? 0;
        const isRaceWin = session.session_name === "Race" && r.position === 1;

        const d = driverPoints.get(driver.full_name) ?? { points: 0, wins: 0 };
        d.points += pts;
        if (isRaceWin) d.wins += 1;
        d.team = driver.team_name ?? d.team;
        d.teamColor = driver.team_colour ? `#${driver.team_colour.replace(/^#/, "")}` : d.teamColor;
        d.nationality = driver.country_code ?? d.nationality;
        driverPoints.set(driver.full_name, d);

        if (driver.team_name) {
          const t = teamPoints.get(driver.team_name) ?? { points: 0, wins: 0 };
          t.points += pts;
          if (isRaceWin) t.wins += 1;
          t.color = driver.team_colour ? `#${driver.team_colour.replace(/^#/, "")}` : t.color;
          teamPoints.set(driver.team_name, t);
        }
      }
    } catch (err) {
      console.warn(`[cron/standings] f1 session ${session.session_key} skipped:`, err);
    }
  }

  if (driverPoints.size === 0) return [];
  const updatedAt = new Date().toISOString();

  const driverRows: StandingRow[] = [...driverPoints.entries()]
    .sort((a, b) => b[1].points - a[1].points || b[1].wins - a[1].wins)
    .map(([name, d], i) => ({
      position: i + 1,
      name,
      team: d.team,
      nationality: d.nationality,
      points: d.points,
      wins: d.wins,
      teamColor: d.teamColor,
    }));

  const teamRows: StandingRow[] = [...teamPoints.entries()]
    .sort((a, b) => b[1].points - a[1].points || b[1].wins - a[1].wins)
    .map(([name, t], i) => ({
      position: i + 1,
      name,
      points: t.points,
      wins: t.wins,
      teamColor: t.color,
    }));

  return [
    { series: "f1", kind: "drivers", season, rows: driverRows, updatedAt },
    { series: "f1", kind: "constructors", season, rows: teamRows, updatedAt },
  ];
}

/* ------------------------------------------------------------------ */
/* Pluggable per-series fetchers.                                      */
/* ------------------------------------------------------------------ */

const FETCHERS: Record<string, () => Promise<StandingsTable[]>> = {
  f1: fetchF1,
  // TODO: cached scraping of official MotoGP standings to be added.
  motogp: async () => [],
  // TODO: cached scraping of official NASCAR standings to be added.
  nascar: async () => [],
  // TODO: cached scraping of official IndyCar standings to be added.
  indycar: async () => [],
  // TODO: cached scraping of official WRC standings to be added.
  wrc: async () => [],
};

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const written: string[] = [];
    const skipped: string[] = [];

    for (const [series, fetcher] of Object.entries(FETCHERS)) {
      // Fully best-effort: a failing fetcher just skips its series — the site
      // keeps serving the existing cache / seed standings.
      try {
        const tables = await fetcher();
        for (const table of tables) {
          if (table.rows.length === 0) continue;
          const { error } = await supabase.from("standings_cache").upsert(
            {
              series: table.series,
              kind: table.kind,
              season: table.season,
              data: table.rows,
              updated_at: table.updatedAt,
            },
            { onConflict: "series,kind,season" }
          );
          if (error) {
            skipped.push(`${series}/${table.kind}: ${error.message}`);
          } else {
            written.push(`${series}/${table.kind}/${table.season}`);
          }
        }
        if (tables.length === 0) skipped.push(`${series}: no data`);
      } catch (err) {
        skipped.push(`${series}: ${err instanceof Error ? err.message : "fetch failed"}`);
      }
    }

    return NextResponse.json({ ok: true, written, skipped });
  } catch (err) {
    console.error("[cron/standings] run failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
