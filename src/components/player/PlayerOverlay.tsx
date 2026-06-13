"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Globe, Lock, MonitorPlay, Video, type LucideIcon } from "lucide-react";
import type { SeriesKey, StreamSource } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type OverlayTab = "source" | "language" | "onboards";

/**
 * In-player panel content for /watch: SOURCE and LANGUAGE tabs for everyone,
 * plus an ONBOARDS tab (F1 only) gated behind a free account. Selecting any
 * entry switches the player source in place — fullscreen survives.
 */
export function PlayerOverlay({
  eventId,
  streams,
  series,
  selectedId,
  onSelect,
  activeLang,
  onLang,
}: {
  eventId: string;
  streams: StreamSource[];
  series: SeriesKey;
  selectedId: string | null;
  onSelect: (stream: StreamSource) => void;
  activeLang: string;
  onLang: (lang: string) => void;
}) {
  const feeds = streams.filter((s) => (s.role ?? "feed") !== "onboard");
  const onboards = streams.filter((s) => s.role === "onboard");
  const showOnboards = series === "f1";

  const [tab, setTab] = useState<OverlayTab>("source");
  const [authed, setAuthed] = useState<boolean | null>(null);
  // Onboard urls are stripped from the public payload; signed-in members
  // fetch the playable sources from the authenticated route handler.
  const [memberOnboards, setMemberOnboards] = useState<StreamSource[] | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!showOnboards) return;
    let cancelled = false;
    let check: Promise<boolean>;
    try {
      check = createClient()
        .auth.getUser()
        .then(({ data }) => Boolean(data.user));
    } catch {
      // Supabase not configured — treat as signed out instead of crashing the tree.
      check = Promise.resolve(false);
    }
    check
      .then((isAuthed) => {
        if (!cancelled) setAuthed(isAuthed);
      })
      .catch(() => {
        if (!cancelled) setAuthed(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showOnboards]);

  useEffect(() => {
    if (!showOnboards || authed !== true) return;
    let cancelled = false;
    fetch(`/api/onboards/${eventId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { onboards?: StreamSource[] }) => {
        if (!cancelled) setMemberOnboards(data.onboards ?? []);
      })
      .catch(() => {
        if (!cancelled) setMemberOnboards([]);
      });
    return () => {
      cancelled = true;
    };
  }, [showOnboards, authed, eventId]);

  const languages: string[] = [];
  for (const s of feeds) {
    if (!languages.includes(s.language)) languages.push(s.language);
  }
  const sourceList = feeds.some((s) => s.language === activeLang)
    ? feeds.filter((s) => s.language === activeLang)
    : feeds;

  const tabs: { key: OverlayTab; label: string }[] = [
    { key: "source", label: "Source" },
    { key: "language", label: "Language" },
    ...(showOnboards ? [{ key: "onboards" as const, label: "Onboards" }] : []),
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <div role="tablist" aria-label="Stream panel tabs" className="flex gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all",
              tab === t.key
                ? "border-race/70 bg-white/[0.1] text-white shadow-glow-red"
                : "border-white/[0.1] bg-white/[0.04] text-zinc-400 hover:border-white/[0.25] hover:text-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "source" && (
        <div className="space-y-2">
          {sourceList.length === 0 ? (
            <p className="rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-xs text-zinc-400">
              No stream sources published yet — check back closer to the start.
            </p>
          ) : (
            sourceList.map((s) => (
              <StreamRow
                key={s.id}
                icon={MonitorPlay}
                active={selectedId === s.id}
                onClick={() => onSelect(s)}
                primary={s.label}
                secondary={`${s.source} · ${s.language}`}
              />
            ))
          )}
        </div>
      )}

      {tab === "language" && (
        <div className="flex flex-wrap gap-2">
          {languages.length === 0 ? (
            <p className="text-xs text-zinc-400">No languages available yet.</p>
          ) : (
            languages.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  onLang(lang);
                  const first = feeds.find((s) => s.language === lang);
                  if (first) onSelect(first);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
                  activeLang === lang
                    ? "border-race/70 bg-white/[0.1] text-white shadow-glow-red"
                    : "border-white/[0.1] bg-white/[0.04] text-zinc-300 hover:border-white/[0.25] hover:text-white"
                )}
              >
                <Globe className="h-3.5 w-3.5" /> {lang}
              </button>
            ))
          )}
        </div>
      )}

      {tab === "onboards" && showOnboards && (
        <OnboardsTab
          onboards={onboards}
          memberOnboards={memberOnboards}
          authed={authed}
          selectedId={selectedId}
          onSelect={onSelect}
          loginHref={`/login?next=${encodeURIComponent(pathname)}&reason=members`}
        />
      )}
    </div>
  );
}

function StreamRow({
  icon: Icon,
  active,
  onClick,
  primary,
  secondary,
}: {
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  primary: string;
  secondary: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
        active
          ? "border-race/70 bg-white/[0.08] shadow-glow-red"
          : "border-white/[0.1] bg-white/[0.04] hover:border-white/[0.25] hover:bg-white/[0.06]"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-race-bright" : "text-zinc-400")} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-white">{primary}</span>
        <span className="block truncate text-xs text-zinc-400">{secondary}</span>
      </span>
      {active && <Check className="h-4 w-4 shrink-0 text-race-bright" />}
    </button>
  );
}

function OnboardsTab({
  onboards,
  memberOnboards,
  authed,
  selectedId,
  onSelect,
  loginHref,
}: {
  onboards: StreamSource[];
  memberOnboards: StreamSource[] | null;
  authed: boolean | null;
  selectedId: string | null;
  onSelect: (stream: StreamSource) => void;
  loginHref: string;
}) {
  if (onboards.length === 0) {
    return (
      <p className="rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-xs text-zinc-400">
        Onboard cameras appear here once the session is live.
      </p>
    );
  }

  if (authed === null || (authed && memberOnboards === null)) {
    return (
      <div className="space-y-2">
        {onboards.map((s) => (
          <div key={s.id} className="skeleton h-[60px]" />
        ))}
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="relative min-h-[230px]">
        <div className="pointer-events-none select-none space-y-2 blur-sm" aria-hidden>
          {onboards.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-3"
            >
              <Video className="h-4 w-4 shrink-0 text-zinc-400" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">
                  {s.driver ?? s.label}
                </span>
                <span className="block truncate text-xs text-zinc-400">Onboard camera</span>
              </span>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 rounded-2xl bg-night/40 px-4 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06]">
            <Lock className="h-4 w-4 text-race-bright" />
          </span>
          <p className="text-sm font-semibold text-white">Free account required</p>
          <p className="text-xs text-zinc-400">Onboard cameras are for signed-in members.</p>
          <Link href={loginHref} className="btn-glass mt-1 px-4 py-2 text-xs">
            Sign in free
          </Link>
        </div>
      </div>
    );
  }

  const playable = (memberOnboards ?? []).filter((s) => s.url);
  if (playable.length === 0) {
    return (
      <p className="rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-xs text-zinc-400">
        Onboard cameras are unavailable right now — try again in a moment.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {playable.map((s) => (
        <StreamRow
          key={s.id}
          icon={Video}
          active={selectedId === s.id}
          onClick={() => onSelect(s)}
          primary={s.driver ?? s.label}
          secondary={`Onboard · ${s.source}`}
        />
      ))}
    </div>
  );
}
