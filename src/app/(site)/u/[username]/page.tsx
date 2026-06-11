import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Award, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SectionLabel } from "@/components/SectionLabel";
import { SeriesTag } from "@/components/SeriesTag";
import { LocalTime } from "@/components/LocalTime";

interface ProfileRow {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  favorite_series: string | null;
  prediction_points: number | null;
  created_at: string;
}

interface BadgeRow {
  slug: string;
  name: string;
  description: string | null;
  tier: string;
}

interface UserBadgeRow {
  badge_slug: string;
  awarded_at: string;
}

const TIER_COLORS: Record<string, string> = {
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#ffd700",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username}`,
    description: `@${username}'s profile on Rerace — badges, prediction points and favorite series.`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, favorite_series, prediction_points, created_at")
    .eq("username", username)
    .maybeSingle();
  const profile = (data ?? null) as ProfileRow | null;
  if (!profile) notFound();

  // Earned badges (public read).
  const { data: earnedData } = await supabase
    .from("user_badges")
    .select("badge_slug, awarded_at")
    .eq("user_id", profile.id)
    .order("awarded_at", { ascending: false });
  const earned = (earnedData ?? []) as UserBadgeRow[];

  let badges: BadgeRow[] = [];
  if (earned.length > 0) {
    const { data: badgeData } = await supabase
      .from("badges")
      .select("slug, name, description, tier")
      .in(
        "slug",
        earned.map((e) => e.badge_slug)
      );
    badges = (badgeData ?? []) as BadgeRow[];
  }
  const awardedAt = new Map(earned.map((e) => [e.badge_slug, e.awarded_at]));

  const displayName = profile.display_name || profile.username;

  return (
    <div className="container-site space-y-12 py-12">
      {/* ============ HERO ============ */}
      <section className="glass-strong flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center animate-rise">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.12] bg-white/[0.06]">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-3xl text-zinc-300">{initials(displayName)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-3xl font-extrabold tracking-tight text-white">
              {displayName}
            </h1>
            {profile.favorite_series && <SeriesTag series={profile.favorite_series} />}
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            @{profile.username} · Member since <LocalTime iso={profile.created_at} mode="date" />
          </p>
          {profile.bio && <p className="mt-3 max-w-xl text-sm text-zinc-300">{profile.bio}</p>}
        </div>
        <div className="glass flex items-center gap-3 px-5 py-3">
          <Trophy className="h-5 w-5 text-race-bright" />
          <div>
            <p className="font-display text-xl text-white">{profile.prediction_points ?? 0}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Prediction pts</p>
          </div>
        </div>
      </section>

      {/* ============ BADGES ============ */}
      <section>
        <SectionLabel className="mb-2">Trophy Cabinet</SectionLabel>
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-white">Badges</h2>
        {badges.length === 0 ? (
          <div className="glass p-8 text-center text-sm text-zinc-400">
            No badges earned yet — the season is long.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {badges.map((badge) => {
              const color = TIER_COLORS[badge.tier] ?? "#a1a1aa";
              const date = awardedAt.get(badge.slug);
              return (
                <div
                  key={badge.slug}
                  className="glass p-5"
                  style={{ borderColor: `${color}66`, boxShadow: `0 0 24px -8px ${color}55` }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
                      style={{ borderColor: `${color}55`, backgroundColor: `${color}1a`, color }}
                    >
                      <Award className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{badge.name}</p>
                      <p
                        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                        style={{ color }}
                      >
                        {badge.tier}
                      </p>
                    </div>
                  </div>
                  {badge.description && (
                    <p className="mt-3 line-clamp-2 text-xs text-zinc-400">{badge.description}</p>
                  )}
                  {date && (
                    <p className="mt-3 text-[11px] text-zinc-500">
                      Earned <LocalTime iso={date} mode="date" />
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
