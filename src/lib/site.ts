export const SITE = {
  name: "Rerace",
  domain: "rerace.net",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://rerace.net",
  tagline: "Every race. Every series. One place.",
  description:
    "Rerace is the exclusive worldwide online motorsport broadcaster — live streams, replays, documentaries, news, standings and schedules for Formula 1, F2, F3, MotoGP, NASCAR, IndyCar, WEC, WRC and Porsche Supercup.",
  socials: {
    discord: "https://discord.gg/PZXCb77fj8",
    x: "https://x.com/Rerace_",
    telegram: "https://t.me/rerace",
    instagram: "https://instagram.com/rerace.io",
  },
  contactEmail: "contact@rerace.net",
} as const;

export const NAV_LINKS = [
  { href: "/live", label: "Live" },
  { href: "/replays", label: "Replays" },
  { href: "/videos", label: "Videos" },
  { href: "/news", label: "News" },
  { href: "/schedule", label: "Schedule" },
  { href: "/standings", label: "Standings" },
] as const;
