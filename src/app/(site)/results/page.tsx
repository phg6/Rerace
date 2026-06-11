import type { Metadata } from "next";
import { Flag } from "lucide-react";
import { getResults } from "@/lib/data/content";
import { SERIES, seriesMeta } from "@/lib/series";
import { SITE } from "@/lib/site";
import type { SeriesKey, SessionResult } from "@/lib/types";
import { SectionLabel } from "@/components/SectionLabel";
import { SeriesTag } from "@/components/SeriesTag";
import { LocalTime } from "@/components/LocalTime";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 300;

const description =
  "Recent motorsport session results — race classifications, qualifying times and points across F1, MotoGP, NASCAR, IndyCar, WEC, WRC and more.";

export const metadata: Metadata = {
  title: "Race Results",
  description,
  alternates: { canonical: "/results" },
  openGraph: {
    type: "website",
    title: `Race Results — ${SITE.name}`,
    description,
    url: `${SITE.url}/results`,
  },
  twitter: { card: "summary_large_image" },
};

function ResultCard({ result }: { result: SessionResult }) {
  return (
    <div className="glass overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-white">{result.eventName}</h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            {result.sessionName} · {result.season}
          </p>
        </div>
        {result.completedAt && (
          <p className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-500">
            <Flag className="h-3.5 w-3.5 text-race-bright" />
            <LocalTime iso={result.completedAt} mode="datetime" />
          </p>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 font-semibold">Pos</th>
              <th className="px-3 py-3 font-semibold">Driver</th>
              <th className="px-3 py-3 font-semibold">Team</th>
              <th className="px-3 py-3 text-right font-semibold">Time / Gap</th>
              <th className="px-5 py-3 text-right font-semibold">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {result.rows.map((row, i) => (
              <tr key={`${row.position}-${i}`} className="transition-colors hover:bg-white/[0.03]">
                <td className="font-display w-12 px-5 py-2.5 text-zinc-500">{row.position}</td>
                <td className="px-3 py-2.5 font-semibold text-white">{row.driver}</td>
                <td className="px-3 py-2.5 text-zinc-400">{row.team ?? "—"}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-zinc-300">{row.time ?? "—"}</td>
                <td className="px-5 py-2.5 text-right font-bold tabular-nums text-white">
                  {typeof row.points === "number" ? row.points : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function ResultsPage() {
  const results = await getResults();

  const bySeries = new Map<SeriesKey, SessionResult[]>();
  for (const result of results) {
    const list = bySeries.get(result.series) ?? [];
    list.push(result);
    bySeries.set(result.series, list);
  }
  const orderedSeries = (Object.keys(SERIES) as SeriesKey[]).filter((key) => bySeries.has(key));

  return (
    <div className="container-site space-y-10 pb-20 pt-10">
      <header>
        <SectionLabel className="mb-2">Chequered Flag</SectionLabel>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Results</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          The latest classifications from every series we cover, freshest first.
        </p>
      </header>

      {results.length === 0 ? (
        <EmptyState
          title="No results yet"
          message="Session results show up here shortly after the chequered flag drops."
          ctaHref="/schedule"
          ctaLabel="View schedule"
        />
      ) : (
        orderedSeries.map((key) => (
          <section key={key}>
            <div className="mb-5 flex items-center gap-3">
              <SeriesTag series={key} />
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {seriesMeta(key).name}
              </h2>
            </div>
            <div className="space-y-5">
              {(bySeries.get(key) ?? []).map((result) => (
                <ResultCard key={`${result.season}-${result.eventKey}-${result.sessionKey}`} result={result} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
