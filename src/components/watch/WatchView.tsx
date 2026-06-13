"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Globe, Info, MessageSquare, MonitorPlay, X } from "lucide-react";
import type { RaceEvent, StreamSource } from "@/lib/types";
import { cn, eventStatus, nextSession, sessionStatus } from "@/lib/utils";
import { seriesMeta } from "@/lib/series";
import { ReracePlayer } from "@/components/player/ReracePlayer";
import { PlayerOverlay } from "@/components/player/PlayerOverlay";
import { Countdown } from "@/components/Countdown";
import { LiveBar, LivePill } from "@/components/LiveBadge";
import { SeriesTag } from "@/components/SeriesTag";
import { SectionLabel } from "@/components/SectionLabel";
import { LocalTime } from "@/components/LocalTime";
import { ReminderButton } from "@/components/ReminderButton";
import { LiveChat } from "./LiveChat";

type MobileTab = "chat" | "streams" | "info";

const MOBILE_TABS: { key: MobileTab; label: string; icon: typeof MessageSquare }[] = [
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "streams", label: "Streams", icon: MonitorPlay },
  { key: "info", label: "Info", icon: Info },
];

/**
 * Client orchestrator for the watch page: theater-first player, stream/language
 * selector, collapsible chat (right-side panel on desktop, tab on mobile) and a
 * cinematic pre-show panel while the event is still upcoming.
 */
export function WatchView({ event }: { event: RaceEvent }) {
  // Re-evaluate live/upcoming status every 30s so the page flips to live without a reload.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const status = eventStatus(event, now);
  const next = nextSession(event, now);
  const poster = event.image || seriesMeta(event.series).poster;

  const feeds = event.streams.filter((s) => (s.role ?? "feed") !== "onboard");
  // Never auto-select an onboard: onboards are members-only and their urls are
  // stripped from the public payload — without feeds we show the pre-show panel.
  const firstStream = feeds[0] ?? null;
  // Selected stream is held as an object: gated onboard sources come from the
  // authed route handler via PlayerOverlay and aren't in event.streams.
  const [selected, setSelected] = useState<StreamSource | null>(firstStream);
  const [activeLang, setActiveLang] = useState(firstStream?.language ?? "");

  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileTab>("chat");

  // Track the breakpoint so only one LiveChat instance (and one Realtime
  // subscription) is ever mounted at a time.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Compact fallback selector (feeds only) — the in-player overlay is the
  // primary stream/language/onboard UX; onboards stay gated inside it.
  const selector = (
    <StreamSelector
      streams={feeds}
      activeLang={activeLang}
      onLang={setActiveLang}
      selectedId={selected?.id ?? null}
      onSelect={(id) => setSelected(feeds.find((s) => s.id === id) ?? null)}
    />
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* ============ PLAYER COLUMN ============ */}
      <div className="min-w-0 flex-1">
        {status === "live" && selected ? (
          <div>
            <ReracePlayer
              url={selected.url}
              kind={selected.kind}
              title={`${event.title} — ${selected.label}`}
              poster={poster}
              autoPlay
              live
              overlay={
                <PlayerOverlay
                  eventId={event.id}
                  streams={event.streams}
                  series={event.series}
                  selectedId={selected?.id ?? null}
                  onSelect={(s) => {
                    setSelected(s);
                    setActiveLang(s.language);
                  }}
                  activeLang={activeLang}
                  onLang={setActiveLang}
                />
              }
            />
            <LiveBar className="mt-3" />
          </div>
        ) : (
          <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-card)] border border-white/[0.08] bg-night">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-night/55" />
            <div className="img-overlay" />
            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              {status === "upcoming" && next ? (
                <>
                  <SectionLabel>Pre-show</SectionLabel>
                  <p className="text-xl font-extrabold text-white sm:text-3xl">
                    {next.name} is up next.
                  </p>
                  <Countdown to={next.startsAt} />
                  <p className="text-sm text-zinc-300">
                    The stream goes live{" "}
                    <LocalTime
                      iso={next.startsAt}
                      mode="weekday-time"
                      className="font-semibold text-white"
                    />
                    .
                  </p>
                </>
              ) : status === "live" ? (
                <>
                  <LivePill />
                  <p className="text-lg font-bold text-white">
                    We are bringing the stream sources online — hang tight.
                  </p>
                </>
              ) : (
                <>
                  <SectionLabel>Chequered Flag</SectionLabel>
                  <p className="text-xl font-extrabold text-white sm:text-3xl">
                    This broadcast has ended.
                  </p>
                  <Link href="/replays" className="btn-glass">
                    Browse replays
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* ============ TITLE ROW ============ */}
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2.5">
              <SeriesTag series={event.series} />
              {status === "live" && <LivePill />}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {event.title}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {event.circuit} · {event.country}
            </p>
          </div>
          <button
            onClick={() => setChatOpen((o) => !o)}
            aria-expanded={chatOpen}
            className={cn(
              "btn-glass hidden lg:inline-flex",
              chatOpen && "border-race/60 text-race-bright"
            )}
          >
            {chatOpen ? <X className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
            Live chat
          </button>
        </div>

        {/* ============ MOBILE TABS: Chat | Streams | Info ============ */}
        <div className="mt-6 lg:hidden">
          <div className="flex gap-2" role="tablist" aria-label="Event panels">
            {MOBILE_TABS.map(({ key, label, icon: TabIcon }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeTab === key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold backdrop-blur-xl transition-all",
                  activeTab === key
                    ? "border-race/70 bg-white/[0.1] text-white shadow-glow-red"
                    : "border-white/[0.1] bg-white/[0.04] text-zinc-300 hover:border-white/[0.25] hover:text-white"
                )}
              >
                <TabIcon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
          <div className="mt-4">
            {activeTab === "chat" && !isDesktop && (
              <LiveChat eventId={event.id} className="h-[480px]" />
            )}
            {activeTab === "streams" && selector}
            {activeTab === "info" && (
              <div className="space-y-6">
                {event.description && (
                  <p className="text-sm leading-relaxed text-zinc-300">{event.description}</p>
                )}
                <SessionsList event={event} />
              </div>
            )}
          </div>
        </div>

        {/* ============ DESKTOP STREAM SELECTOR ============ */}
        <div className="mt-8 hidden lg:block">
          <SectionLabel className="mb-4">Streams &amp; Languages</SectionLabel>
          {selector}
        </div>
      </div>

      {/* ============ COLLAPSIBLE CHAT PANEL (desktop) ============ */}
      {chatOpen && isDesktop && (
        <aside className="hidden w-full shrink-0 lg:block lg:w-[360px]">
          <LiveChat
            eventId={event.id}
            className="sticky top-20 h-[calc(100vh-7rem)] min-h-[420px]"
          />
        </aside>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stream selector — language pill chips, then source buttons          */
/* ------------------------------------------------------------------ */

function StreamSelector({
  streams,
  activeLang,
  onLang,
  selectedId,
  onSelect,
}: {
  streams: StreamSource[];
  activeLang: string;
  onLang: (lang: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (streams.length === 0) {
    return (
      <p className="glass px-5 py-4 text-sm text-zinc-400">
        No stream sources have been published for this event yet — check back closer to the start.
      </p>
    );
  }

  const languages: string[] = [];
  for (const s of streams) {
    if (!languages.includes(s.language)) languages.push(s.language);
  }
  const inLang = streams.filter((s) => s.language === activeLang);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Stream languages">
        {languages.map((lang) => (
          <button
            key={lang}
            role="tab"
            aria-selected={activeLang === lang}
            onClick={() => onLang(lang)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold backdrop-blur-xl transition-all",
              activeLang === lang
                ? "border-race/70 bg-white/[0.1] text-white shadow-glow-red"
                : "border-white/[0.1] bg-white/[0.04] text-zinc-300 hover:border-white/[0.25] hover:text-white"
            )}
          >
            <Globe className="h-3.5 w-3.5" /> {lang}
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {inLang.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={cn(
              "glass flex items-center gap-3 px-4 py-3 text-left transition-all",
              selectedId === s.id
                ? "border-race/70 shadow-glow-red"
                : "hover:border-white/[0.25] hover:bg-white/[0.06]"
            )}
          >
            <MonitorPlay
              className={cn(
                "h-4 w-4 shrink-0",
                selectedId === s.id ? "text-race-bright" : "text-zinc-400"
              )}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">{s.label}</span>
              <span className="block truncate text-xs text-zinc-400">{s.source}</span>
            </span>
            {selectedId === s.id && <Check className="h-4 w-4 shrink-0 text-race-bright" />}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sessions list — shared by the watch page and the mobile Info tab    */
/* ------------------------------------------------------------------ */

export function SessionsList({ event, className }: { event: RaceEvent; className?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const sessions = [...event.sessions].sort(
    (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)
  );

  return (
    <ul className={cn("space-y-2", className)}>
      {sessions.map((s) => {
        const st = sessionStatus(s, now);
        return (
          <li key={s.key} className="glass flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{s.name}</p>
              <p className="text-xs text-zinc-400">
                <LocalTime iso={s.startsAt} mode="weekday-time" />
              </p>
            </div>
            {st === "live" ? (
              <LivePill />
            ) : (
              <span
                className={cn(
                  "rounded-full border border-white/[0.1] bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  st === "upcoming" ? "text-zinc-300" : "text-zinc-500"
                )}
              >
                {st === "upcoming" ? "Upcoming" : "Finished"}
              </span>
            )}
            {st === "upcoming" && (
              <ReminderButton
                eventId={event.id}
                sessionKey={s.key}
                sessionName={s.name}
                startsAt={s.startsAt}
                compact
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
