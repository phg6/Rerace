import Link from "next/link";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";
import { NewsletterForm } from "./NewsletterForm";
import { SERIES_LIST } from "@/lib/series";

const columns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Watch",
    links: [
      { href: "/live", label: "Live now" },
      { href: "/replays", label: "F1 Replays" },
      { href: "/documentaries", label: "Documentaries" },
      { href: "/movies", label: "Movies" },
      { href: "/videos", label: "Videos" },
    ],
  },
  {
    title: "Follow",
    links: [
      { href: "/schedule", label: "Schedule" },
      { href: "/standings", label: "Standings" },
      { href: "/results", label: "Results" },
      { href: "/news", label: "News" },
      { href: "/polls", label: "Daily poll" },
      { href: "/predictions", label: "Predictions" },
    ],
  },
  {
    title: "Series",
    links: SERIES_LIST.slice(0, 6).map((s) => ({ href: `/series/${s.key}`, label: s.name })),
  },
  {
    title: "Company",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/status", label: "Status" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/disclaimer", label: "Disclaimer" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-carbon/40 pb-28 lg:pb-10">
      <div className="container-site pt-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo className="text-2xl" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
              The exclusive worldwide online motorsport broadcaster. Every race, every series, one
              place.
            </p>
            <SocialIcons className="mt-5" />
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-white">Race weekend newsletter</p>
              <NewsletterForm />
            </div>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="section-label mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-zinc-400 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 border-t border-white/[0.06] pt-6 text-xs leading-relaxed text-zinc-500">
          <p>
            © {new Date().getFullYear()} Rerace. All rights reserved. Rerace is an independent
            platform and is not affiliated with, endorsed by, or associated with Formula 1, FIA,
            MotoGP, NASCAR, IndyCar, WRC, Porsche, or any other championship, team, or rights
            holder. All trademarks belong to their respective owners.{" "}
            <Link href="/disclaimer" className="underline decoration-zinc-600 underline-offset-2 hover:text-zinc-300">
              Read the full disclaimer
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
