"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Tiny tab switcher for standings tables.
 * Panels are server-rendered nodes; only visibility is toggled client-side.
 */
export function StandingsTabs({
  tabs,
  panels,
}: {
  tabs: { id: string; label: string }[];
  panels: React.ReactNode[];
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Championship standings">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            id={tab.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race",
              i === active
                ? "border-race/70 bg-race/15 text-white shadow-glow-red"
                : "border-white/[0.1] bg-white/[0.04] text-zinc-400 hover:border-white/25 hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-8 animate-rise" key={tabs[active]?.id}>
        {panels[active] ?? null}
      </div>
    </div>
  );
}
