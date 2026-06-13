import type { Metadata } from "next";
import { runStatusChecks, type CheckStatus } from "@/lib/status-checks";
import { getIncidents } from "@/lib/data/content";
import { SectionLabel, SectionHeading } from "@/components/SectionLabel";
import { LocalTime } from "@/components/LocalTime";
import { AutoRefresh } from "@/components/AutoRefresh";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Status",
  description: "Live operational status of Rerace — streams, database, auth, news crawler and email, plus incident history.",
};

const DOT: Record<CheckStatus, string> = {
  operational: "bg-emerald-400",
  degraded: "bg-amber-400",
  down: "bg-race",
  unconfigured: "bg-zinc-500",
};

const STATUS_LABEL: Record<CheckStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
  unconfigured: "Not configured",
};

const SEVERITY_CLASS: Record<string, string> = {
  minor: "border-amber-400/40 text-amber-300",
  major: "border-orange-400/40 text-orange-300",
  critical: "border-race/60 text-race-bright",
};

const INCIDENT_STATUS_CLASS: Record<string, string> = {
  investigating: "border-race/60 text-race-bright",
  identified: "border-orange-400/40 text-orange-300",
  monitoring: "border-amber-400/40 text-amber-300",
  resolved: "border-emerald-400/40 text-emerald-300",
};

export default async function StatusPage() {
  const [report, incidents] = await Promise.all([runStatusChecks(), getIncidents()]);

  const banner =
    report.overall === "operational"
      ? { text: "All systems operational", cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" }
      : report.overall === "degraded"
        ? { text: "Some systems degraded", cls: "border-amber-400/30 bg-amber-400/10 text-amber-300" }
        : { text: "Service disruption", cls: "border-race/50 bg-race/10 text-race-bright" };

  return (
    <div className="container-site pb-20 pt-10">
      <AutoRefresh intervalMs={60_000} />
      <div className="mx-auto max-w-3xl animate-rise">
        <header>
          <SectionLabel className="mb-2">Race Control</SectionLabel>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Status</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Checked <LocalTime iso={report.checkedAt} mode="relative" /> — refreshes every minute.
          </p>
        </header>

        {/* Overall banner */}
        <div
          className={cn(
            "mt-8 flex items-center gap-3 rounded-[var(--radius-card)] border px-5 py-4 text-sm font-semibold backdrop-blur-xl",
            banner.cls
          )}
        >
          <span className={cn("h-2.5 w-2.5 animate-pulse-soft rounded-full", DOT[report.overall])} />
          {banner.text}
        </div>

        {/* Check rows */}
        <div className="glass mt-6 divide-y divide-white/[0.06]">
          {report.checks.map((c) => (
            <div key={c.key} className="flex items-center gap-4 px-5 py-4">
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", DOT[c.status])} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{c.label}</p>
                <p className="truncate text-xs text-zinc-500">{c.detail}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-xs font-semibold",
                  c.status === "operational" && "text-emerald-300",
                  c.status === "degraded" && "text-amber-300",
                  c.status === "down" && "text-race-bright",
                  c.status === "unconfigured" && "text-zinc-500"
                )}
              >
                {STATUS_LABEL[c.status]}
              </span>
            </div>
          ))}
        </div>

        {/* Incidents */}
        <section className="mt-14">
          <SectionHeading label="History" title="Incidents" />
          {incidents.length === 0 ? (
            <p className="text-sm text-zinc-500">No incidents reported.</p>
          ) : (
            <div className="space-y-4">
              {incidents.map((inc) => (
                <article key={inc.id} className="glass p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        INCIDENT_STATUS_CLASS[inc.status] ?? "border-white/[0.12] text-zinc-300"
                      )}
                    >
                      {inc.status}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        SEVERITY_CLASS[inc.severity] ?? "border-white/[0.12] text-zinc-300"
                      )}
                    >
                      {inc.severity}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-white">{inc.title}</h3>
                  {inc.body && <p className="mt-2 text-sm leading-relaxed text-zinc-400">{inc.body}</p>}
                  <p className="mt-3 text-xs text-zinc-500">
                    Started <LocalTime iso={inc.startedAt} mode="datetime" />
                    {inc.resolvedAt && (
                      <>
                        {" · "}Resolved <LocalTime iso={inc.resolvedAt} mode="datetime" />
                      </>
                    )}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
