"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Radio, MonitorPlay, Clapperboard, Newspaper, User, CalendarDays, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Hit {
  type: "event" | "replay" | "media" | "news" | "driver" | "page";
  title: string;
  subtitle?: string;
  href: string;
}

const typeIcon = {
  event: Radio,
  replay: MonitorPlay,
  media: Clapperboard,
  news: Newspaper,
  driver: User,
  page: CalendarDays,
};

/** Global ⌘K search across events, replays, media, news, drivers and pages. */
export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("rerace:search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("rerace:search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setHits([]);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setHits([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const body = await res.json();
        setHits(body.hits ?? []);
        setActive(0);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [query]);

  const go = useCallback(
    (hit: Hit) => {
      setOpen(false);
      if (hit.href.startsWith("http")) window.open(hit.href, "_blank");
      else router.push(hit.href);
    },
    [router]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="glass-strong w-full max-w-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-race" />
          ) : (
            <Search className="h-4 w-4 text-zinc-400" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, hits.length - 1));
              if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
              if (e.key === "Enter" && hits[active]) go(hits[active]);
            }}
            placeholder="Search streams, replays, news, drivers…"
            className="h-14 w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="rounded-md border border-white/[0.1] px-1.5 py-0.5 text-[10px] text-zinc-500">esc</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {hits.length === 0 && query && !loading && (
            <p className="px-3 py-8 text-center text-sm text-zinc-500">No results for “{query}”</p>
          )}
          {hits.length === 0 && !query && (
            <p className="px-3 py-8 text-center text-sm text-zinc-500">
              Type to search across the whole of Rerace.
            </p>
          )}
          {hits.map((hit, i) => {
            const Icon = typeIcon[hit.type] ?? Search;
            return (
              <button
                key={`${hit.href}-${i}`}
                onClick={() => go(hit)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  i === active ? "bg-race/15" : "hover:bg-white/[0.05]"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", i === active ? "text-race-bright" : "text-zinc-500")} />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-white">{hit.title}</span>
                  {hit.subtitle && (
                    <span className="block truncate text-xs text-zinc-500">{hit.subtitle}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
