"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Radio, MonitorPlay, Newspaper, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/live", label: "Live", icon: Radio },
  { href: "/replays", label: "Replays", icon: MonitorPlay },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
];

/** App-style bottom tab bar — mobile only. */
export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-3 bottom-3 z-50 lg:hidden"
    >
      <div className="glass-strong flex items-stretch justify-around px-1 py-1.5 shadow-2xl">
        {tabs.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname?.startsWith(t.href);
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex min-w-[56px] flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-[10px] font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-race",
                active ? "bg-race/15 text-race-bright" : "text-zinc-400 hover:text-white"
              )}
            >
              <Icon className={cn("h-5 w-5", t.href === "/live" && !active && "text-race")} />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
