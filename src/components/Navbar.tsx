"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ChevronDown, UserCircle2, LogOut, Radio } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Logo } from "./Logo";
import { NAV_LINKS } from "@/lib/site";
import { SERIES_LIST } from "@/lib/series";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface MegaItem {
  href: string;
  title: string;
  subtitle?: string;
  image: string;
}

const WATCH_MENU: MegaItem[] = [
  { href: "/live", title: "Live Now", subtitle: "Every stream, every language", image: "/img/series/general.svg" },
  { href: "/replays", title: "F1 Replays", subtitle: "Every session of the season", image: "/img/series/f1.svg" },
  { href: "/documentaries", title: "Documentaries", subtitle: "All Access, Drive to Survive…", image: "/img/series/nascar.svg" },
  { href: "/movies", title: "Movies", subtitle: "Motorsport cinema", image: "/img/series/wec.svg" },
  { href: "/videos", title: "Videos", subtitle: "Highlights & onboards", image: "/img/series/motogp.svg" },
];

export function Navbar({ adSlot }: { adSlot?: React.ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<"watch" | "series" | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ?? null);
      });
      return () => sub.subscription.unsubscribe();
    } catch {
      // Supabase not configured — render the signed-out navbar.
    }
  }, []);

  // Close any open mega menu when the route changes (adjust-state-during-render).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenMenu(null);
  }

  const openSearch = () => window.dispatchEvent(new CustomEvent("rerace:search"));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/[0.07] bg-night/70 backdrop-blur-2xl"
          : "bg-gradient-to-b from-night/90 to-transparent"
      )}
      onMouseLeave={() => setOpenMenu(null)}
    >
      <nav className="container-site flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden items-center gap-1 lg:flex">
            {/* Watch mega menu trigger */}
            <button
              className={cn(
                "btn-ghost text-sm",
                openMenu === "watch" && "bg-white/[0.06] text-white"
              )}
              onMouseEnter={() => setOpenMenu("watch")}
              onClick={() => setOpenMenu(openMenu === "watch" ? null : "watch")}
            >
              Watch <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", openMenu === "watch" && "rotate-180")} />
            </button>
            {/* Series mega menu trigger */}
            <button
              className={cn(
                "btn-ghost text-sm",
                openMenu === "series" && "bg-white/[0.06] text-white"
              )}
              onMouseEnter={() => setOpenMenu("series")}
              onClick={() => setOpenMenu(openMenu === "series" ? null : "series")}
            >
              Series <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", openMenu === "series" && "rotate-180")} />
            </button>
            {NAV_LINKS.filter((l) => !["/replays", "/videos"].includes(l.href)).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onMouseEnter={() => setOpenMenu(null)}
                className={cn(
                  "btn-ghost text-sm",
                  pathname?.startsWith(l.href) && "text-white"
                )}
              >
                {l.href === "/live" && <Radio className="h-3.5 w-3.5 text-race" />}
                {l.label}
              </Link>
            ))}
            <Link
              href="/teams"
              onMouseEnter={() => setOpenMenu(null)}
              className={cn("btn-ghost text-sm", pathname?.startsWith("/teams") && "text-white")}
            >
              Teams
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openSearch}
            aria-label="Search"
            className="flex h-9 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-3 text-sm text-zinc-400 backdrop-blur transition hover:border-race/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden rounded-md border border-white/[0.1] bg-white/[0.05] px-1.5 text-[10px] text-zinc-500 md:inline">
              ⌘K
            </kbd>
          </button>
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/login" className="btn-glass h-9 px-4 text-sm">
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* Mega menus */}
      <div
        className={cn(
          "absolute inset-x-0 top-16 origin-top transition-all duration-200",
          openMenu ? "pointer-events-auto scale-y-100 opacity-100" : "pointer-events-none scale-y-95 opacity-0"
        )}
      >
        <div className="container-site pb-4">
          <div className="glass-strong overflow-hidden p-4 shadow-2xl">
            {openMenu === "watch" && (
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                {WATCH_MENU.map((item) => (
                  <MegaCard key={item.href} item={item} />
                ))}
              </div>
            )}
            {openMenu === "series" && (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {SERIES_LIST.map((s) => (
                    <MegaCard
                      key={s.key}
                      item={{
                        href: `/series/${s.key}`,
                        title: s.name,
                        subtitle: "Schedule · Streams · News",
                        image: s.poster,
                      }}
                    />
                  ))}
                </div>
                {adSlot && <div className="mt-3">{adSlot}</div>}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MegaCard({ item }: { item: MegaItem }) {
  return (
    <Link
      href={item.href}
      className="group/mc relative block overflow-hidden rounded-[14px] border border-white/[0.07] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-race"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image}
        alt=""
        className="aspect-[16/8] w-full object-cover transition-transform duration-500 group-hover/mc:scale-105"
      />
      <div className="img-overlay" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="text-sm font-bold text-white">{item.title}</p>
        {item.subtitle && <p className="text-[11px] text-zinc-400">{item.subtitle}</p>}
      </div>
    </Link>
  );
}

function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const avatar = (user.user_metadata?.avatar_url as string) || null;

  const signOut = async () => {
    await createClient().auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/[0.12] bg-white/[0.05] transition hover:border-race/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserCircle2 className="h-5 w-5 text-zinc-300" />
        )}
      </button>
      {open && (
        <div className="glass-strong absolute right-0 top-11 w-48 overflow-hidden p-1.5 shadow-2xl">
          <Link href="/account" className="block rounded-xl px-3 py-2 text-sm text-zinc-200 hover:bg-white/[0.07]" onClick={() => setOpen(false)}>
            My profile
          </Link>
          <Link href="/predictions" className="block rounded-xl px-3 py-2 text-sm text-zinc-200 hover:bg-white/[0.07]" onClick={() => setOpen(false)}>
            Predictions
          </Link>
          <Link href="/account/reminders" className="block rounded-xl px-3 py-2 text-sm text-zinc-200 hover:bg-white/[0.07]" onClick={() => setOpen(false)}>
            My reminders
          </Link>
          <button onClick={signOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-200 hover:bg-white/[0.07]">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
