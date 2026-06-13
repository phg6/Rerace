import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Newspaper, Trophy } from "lucide-react";
import { getDrivers, getNews, getStandings, getTeam, getTeams } from "@/lib/data/content";
import { SITE } from "@/lib/site";
import type { Driver, Team } from "@/lib/types";
import { SectionLabel, SectionHeading } from "@/components/SectionLabel";
import { TiltCard } from "@/components/TiltCard";
import { LocalTime } from "@/components/LocalTime";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 300;

export async function generateStaticParams() {
  const teams = await getTeams();
  return teams.filter((t) => t.series === "f1").map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeam(slug);
  if (!team) return { title: "Team not found" };
  const title = `${team.name} — F1 Team Profile`;
  const description = `${team.fullName ?? team.name}: drivers, team principal, power unit, base and current championship standing on ${SITE.name}.`;
  return {
    title,
    description,
    alternates: { canonical: `/teams/${team.slug}` },
    openGraph: {
      type: "website",
      title: `${title} — ${SITE.name}`,
      description,
      url: `${SITE.url}/teams/${team.slug}`,
      images: [{ url: team.image || "/img/series/f1.svg" }],
    },
    twitter: { card: "summary_large_image" },
  };
}

function teamDrivers(team: Team, drivers: Driver[]): Driver[] {
  if (team.driverSlugs?.length) {
    const found = team.driverSlugs
      .map((slug) => drivers.find((d) => d.slug === slug))
      .filter((d): d is Driver => Boolean(d));
    if (found.length > 0) return found;
  }
  return drivers.filter((d) => d.series === team.series && d.team === team.name);
}

const careerStats = (d: Driver) => [
  { label: "Titles", value: d.championships },
  { label: "Wins", value: d.careerWins },
  { label: "Podiums", value: d.careerPodiums },
  { label: "Poles", value: d.careerPoles },
];

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [team, drivers, standings, news] = await Promise.all([
    getTeam(slug),
    getDrivers(),
    getStandings("f1"),
    getNews(60),
  ]);
  if (!team) notFound();

  const color = team.color ?? "#e10600";
  const lineup = teamDrivers(team, drivers);
  const constructorsTable = standings.find((t) => t.kind === "constructors" || t.kind === "teams");
  const driversTable = standings.find((t) => t.kind === "drivers");
  const standing = constructorsTable?.rows.find((r) => r.name === team.name);
  const teamNews = news.filter((n) => n.series === team.series).slice(0, 4);

  const facts = [
    { label: "Team principal", value: team.principal },
    { label: "Power unit", value: team.engine },
    { label: "Base", value: team.base },
    { label: "First entry", value: team.firstEntry ? String(team.firstEntry) : undefined },
    { label: "Championships", value: team.championships !== undefined ? String(team.championships) : undefined },
    { label: "Race wins", value: team.raceWins !== undefined ? String(team.raceWins) : undefined },
    { label: "2026 car", value: team.carName },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.fullName ?? team.name,
    alternateName: team.name,
    sport: "Formula One",
    url: `${SITE.url}/teams/${team.slug}`,
    ...(team.principal ? { coach: { "@type": "Person", name: team.principal } } : {}),
    ...(team.base ? { location: { "@type": "Place", name: team.base } } : {}),
    ...(team.firstEntry ? { foundingDate: String(team.firstEntry) } : {}),
    athlete: lineup.map((d) => ({
      "@type": "Person",
      name: d.name,
      ...(d.country ? { nationality: d.country } : {}),
    })),
    memberOf: { "@type": "SportsOrganization", name: "Formula 1" },
  };

  return (
    <div className="space-y-12 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* ============ HERO ============ */}
      <section className="relative -mt-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 90% at 12% 0%, ${color}45, transparent 55%), radial-gradient(90% 70% at 88% 110%, ${color}26, transparent 60%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
        <div className="container-site relative pb-12 pt-28 animate-rise">
          <Link href="/teams" className="btn-ghost -ml-4 mb-6 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> All teams
          </Link>
          <SectionLabel className="mb-3">Constructor</SectionLabel>
          <h1 className="flex items-center gap-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            <span
              className="h-4 w-4 shrink-0 rounded-full sm:h-5 sm:w-5"
              style={{ backgroundColor: color, boxShadow: `0 0 24px ${color}` }}
              aria-hidden
            />
            {team.name}
          </h1>
          {team.fullName && <p className="mt-3 text-sm text-zinc-300 sm:text-base">{team.fullName}</p>}
          {team.bio && <p className="mt-3 max-w-2xl text-sm text-zinc-400">{team.bio}</p>}
        </div>
      </section>

      {/* ============ FACTS ============ */}
      <section className="container-site">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          {facts.map((f) => (
            <div key={f.label} className="glass p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{f.label}</p>
              <p className="mt-1.5 text-sm font-bold text-white">{f.value ?? "—"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CHAMPIONSHIP STANDING ============ */}
      {standing && constructorsTable && (
        <section className="container-site">
          <div className="glass flex flex-wrap items-center gap-x-8 gap-y-4 p-6">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-race/15 text-race-bright">
                <Trophy className="h-5 w-5" />
              </span>
              <span className="text-4xl font-extrabold tabular-nums text-white">P{standing.position}</span>
              <span className="h-10 w-1 rounded-full" style={{ backgroundColor: color }} aria-hidden />
              <div>
                <p className="text-sm font-bold text-white">Constructors&apos; Championship</p>
                <p className="text-xs text-zinc-500">
                  {constructorsTable.season} season · as of{" "}
                  <LocalTime iso={constructorsTable.updatedAt} mode="datetime" />
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-8">
              <div className="text-right">
                <p className="text-2xl font-extrabold tabular-nums text-white">{standing.points}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">points</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold tabular-nums text-white">{standing.wins ?? 0}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">wins</p>
              </div>
              <Link href="/standings" className="btn-glass text-xs">
                Full standings <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============ DRIVERS ============ */}
      <section className="container-site">
        <SectionHeading label="Drivers" title="2026 line-up" />
        {lineup.length === 0 ? (
          <EmptyState
            title="Line-up to be confirmed"
            message="Driver profiles for this team appear here once announced."
            ctaHref="/teams"
            ctaLabel="All teams"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {lineup.map((d) => {
              const ds = driversTable?.rows.find((r) => r.name === d.name);
              return (
                <TiltCard key={d.slug} className="h-full">
                  <div className="relative flex h-full flex-col p-6">
                    <span
                      aria-hidden
                      className="absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-[0.09] blur-3xl transition-opacity duration-300 group-hover:opacity-25"
                      style={{ backgroundColor: color }}
                    />
                    <div className="relative flex items-start gap-4">
                      <span
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-xl font-extrabold tabular-nums"
                        style={{ backgroundColor: `${color}1f`, borderColor: `${color}55`, color }}
                      >
                        {d.number ?? "—"}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-lg font-extrabold tracking-tight text-white">{d.name}</h3>
                        {d.country && <p className="text-xs text-zinc-500">{d.country}</p>}
                        {ds && (
                          <p className="mt-1 text-xs text-zinc-400">
                            2026: <span className="font-bold text-white">P{ds.position}</span> ·{" "}
                            <span className="tabular-nums">{ds.points} pts</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {d.bio && <p className="relative mt-4 flex-1 text-sm leading-relaxed text-zinc-400">{d.bio}</p>}
                    <div className="relative mt-5 grid grid-cols-4 gap-2">
                      {careerStats(d).map((s) => (
                        <div
                          key={s.label}
                          className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center"
                        >
                          <p className="text-base font-extrabold tabular-nums text-white">{s.value ?? "—"}</p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-500">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        )}
      </section>

      {/* ============ NEWS ============ */}
      <section className="container-site">
        <SectionHeading
          label="Paddock"
          title="Latest F1 news"
          action={
            <Link href="/news" className="btn-ghost text-xs">
              All news <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {teamNews.length === 0 ? (
          <EmptyState
            title="Quiet in the paddock"
            message="No Formula 1 headlines right now — browse all motorsport news instead."
            ctaHref="/news"
            ctaLabel="All news"
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {teamNews.map((n) => (
              <Link
                key={n.id}
                href={n.url}
                className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race"
              >
                <TiltCard maxTilt={4} className="flex items-center gap-4 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={n.image || "/img/series/f1.svg"}
                    alt=""
                    loading="lazy"
                    className="h-16 w-28 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-race-bright">
                      {n.title}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-zinc-500">
                      <Newspaper className="h-3 w-3" />
                      {n.isOriginal ? (
                        <span className="font-display text-[10px] uppercase tracking-widest text-race-bright">
                          Rerace
                        </span>
                      ) : (
                        n.source
                      )}{" "}
                      · <LocalTime iso={n.publishedAt} mode="relative" />
                    </p>
                  </div>
                </TiltCard>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
