import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Users, Zap } from "lucide-react";
import { getDrivers, getStandings, getTeams } from "@/lib/data/content";
import { SITE } from "@/lib/site";
import type { Driver, StandingRow, Team } from "@/lib/types";
import { SectionLabel } from "@/components/SectionLabel";
import { TiltCard } from "@/components/TiltCard";
import { LocalTime } from "@/components/LocalTime";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 300;

const description =
  "All eleven Formula 1 teams of the 2026 season — drivers, team principals, power units, bases and live constructors' championship positions.";

export const metadata: Metadata = {
  title: "F1 Teams 2026",
  description,
  alternates: { canonical: "/teams" },
  openGraph: {
    type: "website",
    title: `F1 Teams 2026 — ${SITE.name}`,
    description,
    url: `${SITE.url}/teams`,
    images: [{ url: "/img/series/f1.svg" }],
  },
  twitter: { card: "summary_large_image" },
};

function teamDrivers(team: Team, drivers: Driver[]): Driver[] {
  if (team.driverSlugs?.length) {
    const found = team.driverSlugs
      .map((slug) => drivers.find((d) => d.slug === slug))
      .filter((d): d is Driver => Boolean(d));
    if (found.length > 0) return found;
  }
  return drivers.filter((d) => d.series === team.series && d.team === team.name);
}

function Fact({ icon: Icon, children }: { icon: typeof Users; children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-xs text-zinc-400">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

function TeamCard({
  team,
  lineup,
  standing,
}: {
  team: Team;
  lineup: Driver[];
  standing?: StandingRow;
}) {
  const color = team.color ?? "#e10600";
  return (
    <TiltCard className="h-full">
      <Link
        href={`/teams/${team.slug}`}
        className="relative flex h-full flex-col p-6 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-race"
      >
        {/* team-color accent: left edge bar + soft corner glow */}
        <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: color }} />
        <span
          aria-hidden
          className="absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-[0.09] blur-3xl transition-opacity duration-300 group-hover:opacity-25"
          style={{ backgroundColor: color }}
        />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold tracking-tight text-white">{team.name}</h2>
            {team.fullName && <p className="mt-0.5 truncate text-xs text-zinc-500">{team.fullName}</p>}
          </div>
          {standing && (
            <div className="shrink-0 text-right">
              <p className="text-2xl font-extrabold tabular-nums leading-none text-white">P{standing.position}</p>
              <p className="mt-1 text-xs tabular-nums text-zinc-400">{standing.points} pts</p>
            </div>
          )}
        </div>

        <div className="relative mt-5 space-y-1.5">
          {team.principal && <Fact icon={Users}>{team.principal}</Fact>}
          {team.engine && <Fact icon={Zap}>{team.engine}</Fact>}
          {team.base && <Fact icon={MapPin}>{team.base}</Fact>}
        </div>

        <div className="relative mt-5 flex-1 space-y-2">
          {lineup.map((d) => (
            <div
              key={d.slug}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2"
            >
              <span className="w-8 shrink-0 text-right text-sm font-extrabold tabular-nums" style={{ color }}>
                {d.number ?? "—"}
              </span>
              <span className="truncate text-sm font-semibold text-white">{d.name}</span>
              {d.country && <span className="ml-auto shrink-0 text-[11px] text-zinc-500">{d.country}</span>}
            </div>
          ))}
        </div>

        <p className="relative mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition-colors group-hover:text-race-bright">
          Team profile
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </p>
      </Link>
    </TiltCard>
  );
}

export default async function TeamsPage() {
  const [teams, drivers, standings] = await Promise.all([getTeams(), getDrivers(), getStandings("f1")]);

  const f1Teams = teams.filter((t) => t.series === "f1");
  const constructors = standings.find((t) => t.kind === "constructors" || t.kind === "teams");
  const standingByName = new Map((constructors?.rows ?? []).map((r) => [r.name, r]));

  const sorted = [...f1Teams].sort((a, b) => {
    const pa = standingByName.get(a.name)?.position ?? 99;
    const pb = standingByName.get(b.name)?.position ?? 99;
    return pa - pb || a.name.localeCompare(b.name);
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Formula 1 Teams 2026",
    itemListElement: sorted.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SportsTeam",
        name: t.fullName ?? t.name,
        alternateName: t.name,
        sport: "Formula One",
        url: `${SITE.url}/teams/${t.slug}`,
        ...(t.base ? { location: { "@type": "Place", name: t.base } } : {}),
        ...(t.principal ? { coach: { "@type": "Person", name: t.principal } } : {}),
      },
    })),
  };

  return (
    <div className="container-site space-y-8 pb-20 pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header>
        <SectionLabel className="mb-2">Constructors</SectionLabel>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Formula 1 teams</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          The full 2026 grid — eleven teams, twenty-two drivers, one championship. Ordered by current
          constructors&apos; position.
        </p>
        {constructors && (
          <p className="mt-2 text-xs text-zinc-500">
            Standings as of <LocalTime iso={constructors.updatedAt} mode="datetime" />
          </p>
        )}
      </header>

      {sorted.length === 0 ? (
        <EmptyState
          title="No teams to show yet"
          message="Team profiles appear here as soon as the season data lands."
          ctaHref="/standings"
          ctaLabel="View standings"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((team) => (
            <TeamCard
              key={team.slug}
              team={team}
              lineup={teamDrivers(team, drivers)}
              standing={standingByName.get(team.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
