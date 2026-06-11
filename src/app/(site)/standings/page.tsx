import type { Metadata } from "next";
import { getStandings } from "@/lib/data/content";
import { seriesMeta } from "@/lib/series";
import { SITE } from "@/lib/site";
import type { StandingRow, StandingsTable } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/SectionLabel";
import { LocalTime } from "@/components/LocalTime";
import { EmptyState } from "@/components/EmptyState";
import { StandingsTabs } from "@/components/standings/StandingsTabs";

export const revalidate = 300;

const description =
  "Live championship standings across Formula 1, MotoGP and more — drivers, constructors, riders and teams, updated throughout the season.";

export const metadata: Metadata = {
  title: "Championship Standings",
  description,
  alternates: { canonical: "/standings" },
  openGraph: {
    type: "website",
    title: `Championship Standings — ${SITE.name}`,
    description,
    url: `${SITE.url}/standings`,
  },
  twitter: { card: "summary_large_image" },
};

const KIND_LABEL: Record<StandingsTable["kind"], string> = {
  drivers: "Drivers",
  constructors: "Constructors",
  teams: "Teams",
  riders: "Riders",
  manufacturers: "Manufacturers",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ row, size = "h-16 w-16 text-lg" }: { row: StandingRow; size?: string }) {
  const color = row.teamColor ?? "#52525b";
  if (row.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={row.image}
        alt={row.name}
        className={cn("rounded-full border object-cover", size)}
        style={{ borderColor: `${color}66` }}
      />
    );
  }
  return (
    <span
      className={cn("flex items-center justify-center rounded-full border font-bold", size)}
      style={{ backgroundColor: `${color}26`, borderColor: `${color}55`, color }}
    >
      {initials(row.name)}
    </span>
  );
}

function PodiumCard({ row }: { row: StandingRow }) {
  const first = row.position === 1;
  return (
    <div
      className={cn(
        first
          ? "glass-strong order-first border-race/40 shadow-glow-red sm:order-none sm:-translate-y-5"
          : "glass",
        "flex flex-col items-center p-6 text-center transition-transform"
      )}
    >
      <span className={cn("font-display text-3xl", first ? "text-race-bright" : "text-zinc-500")}>
        {row.position}
      </span>
      <div className="mt-3">
        <Avatar row={row} />
      </div>
      <p className="mt-3 text-base font-bold text-white">{row.name}</p>
      {row.team && <p className="mt-0.5 text-xs text-zinc-400">{row.team}</p>}
      <p className="mt-4 text-3xl font-extrabold tabular-nums text-white">{row.points}</p>
      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">pts</p>
      {typeof row.wins === "number" && (
        <p className="mt-2 text-xs text-zinc-400">
          {row.wins} win{row.wins === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}

function PositionChange({ change }: { change?: number }) {
  if (typeof change !== "number" || change === 0) {
    return <span className="text-zinc-600">—</span>;
  }
  return change > 0 ? (
    <span className="font-semibold text-emerald-400">▲ {change}</span>
  ) : (
    <span className="font-semibold text-race-bright">▼ {Math.abs(change)}</span>
  );
}

function StandingsSection({ table }: { table: StandingsTable }) {
  const top3 = table.rows.slice(0, 3);
  // Desktop podium order: 2nd | 1st (elevated) | 3rd. Champion comes first on mobile.
  const podium = [top3[1], top3[0], top3[2]].filter((r): r is StandingRow => Boolean(r));

  return (
    <div>
      <p className="mb-6 text-sm text-zinc-400">
        {seriesMeta(table.series).name} · {KIND_LABEL[table.kind]} championship · {table.season} season
      </p>

      {/* ============ PODIUM ============ */}
      {podium.length > 0 && (
        <div className="mb-8 grid gap-4 pt-5 sm:grid-cols-3 sm:items-end">
          {podium.map((row) => (
            <PodiumCard key={row.position} row={row} />
          ))}
        </div>
      )}

      {/* ============ FULL TABLE ============ */}
      <div className="glass overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-left text-[11px] uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3.5 font-semibold">#</th>
              <th className="px-3 py-3.5 font-semibold">Name</th>
              <th className="px-3 py-3.5 text-right font-semibold">Points</th>
              <th className="px-3 py-3.5 text-right font-semibold">Wins</th>
              <th className="px-5 py-3.5 text-right font-semibold">+/−</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {table.rows.map((row) => (
              <tr key={`${row.position}-${row.name}`} className="transition-colors hover:bg-white/[0.03]">
                <td className="font-display w-12 px-5 py-3 text-base text-zinc-500">{row.position}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-7 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: row.teamColor ?? "#52525b" }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{row.name}</p>
                      {row.team && <p className="truncate text-xs text-zinc-500">{row.team}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-right font-bold tabular-nums text-white">{row.points}</td>
                <td className="px-3 py-3 text-right tabular-nums text-zinc-300">{row.wins ?? 0}</td>
                <td className="px-5 py-3 text-right text-xs tabular-nums">
                  <PositionChange change={row.positionChange} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        Updated <LocalTime iso={table.updatedAt} mode="relative" />
      </p>
    </div>
  );
}

export default async function StandingsPage() {
  const tables = await getStandings();

  const tabs = tables.map((t) => ({
    id: `${t.series}-${t.kind}-${t.season}`,
    label: `${seriesMeta(t.series).shortName} — ${KIND_LABEL[t.kind]}`,
  }));
  const panels = tables.map((t) => <StandingsSection key={`${t.series}-${t.kind}-${t.season}`} table={t} />);

  return (
    <div className="container-site space-y-8 pb-20 pt-10">
      <header>
        <SectionLabel className="mb-2">Championship</SectionLabel>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Standings</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Title fights at a glance — points, wins and movement across every championship we cover.
        </p>
      </header>

      {tables.length === 0 ? (
        <EmptyState
          title="No standings available yet"
          message="Championship tables appear here as soon as the season data lands."
          ctaHref="/schedule"
          ctaLabel="View schedule"
        />
      ) : (
        <StandingsTabs tabs={tabs} panels={panels} />
      )}
    </div>
  );
}
