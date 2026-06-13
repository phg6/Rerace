import type { Metadata } from "next";
import { Award, Lock, Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionLabel } from "@/components/SectionLabel";
import { LocalTime } from "@/components/LocalTime";
import { ProfileForm, SignOutButton } from "@/components/account/ProfileForm";
import { RemindersList } from "@/components/account/RemindersList";

export const metadata: Metadata = {
  title: "My account",
  description: "Manage your Rerace profile, badges and reminders.",
};

interface ProfileRow {
  id: string;
  username: string | null;
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

export default async function AccountPage() {
  const user = await requireUser("/account");
  const supabase = await createClient();

  const [profileRes, badgesRes, earnedRes, remindersRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, favorite_series, prediction_points, created_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("badges").select("slug, name, description, tier"),
    supabase.from("user_badges").select("badge_slug, awarded_at").eq("user_id", user.id),
    supabase
      .from("reminders")
      .select("id, event_id, session_key, remind_at, channel")
      .eq("user_id", user.id)
      .order("remind_at", { ascending: true }),
  ]);

  const profile = (profileRes.data ?? null) as ProfileRow | null;
  const allBadges = (badgesRes.data ?? []) as BadgeRow[];
  const earned = new Map(
    ((earnedRes.data ?? []) as UserBadgeRow[]).map((b) => [b.badge_slug, b.awarded_at])
  );
  const reminders = (remindersRes.data ?? []) as {
    id: string | number;
    event_id: string;
    session_key: string;
    remind_at: string;
    channel: string;
  }[];

  const displayName =
    profile?.display_name ||
    profile?.username ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Racer";
  const avatarUrl =
    profile?.avatar_url || (user.user_metadata?.avatar_url as string | undefined) || null;
  const username = profile?.username ?? null;
  const memberSince = profile?.created_at ?? user.created_at;
  const points = profile?.prediction_points ?? 0;

  // Sort badges so earned ones come first, then by tier weight.
  const tierWeight = (t: string) => (t === "gold" ? 0 : t === "silver" ? 1 : 2);
  const sortedBadges = [...allBadges].sort((a, b) => {
    const ea = earned.has(a.slug) ? 0 : 1;
    const eb = earned.has(b.slug) ? 0 : 1;
    return ea - eb || tierWeight(a.tier) - tierWeight(b.tier) || a.name.localeCompare(b.name);
  });

  return (
    <div className="container-site space-y-12 pb-20 pt-10">
      {/* ============ HEADER ============ */}
      <section className="glass-strong flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center animate-rise">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.12] bg-white/[0.06]">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-2xl text-zinc-300">{initials(displayName)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {displayName}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {username ? `@${username}` : "Pick a username below to claim your public profile."}
            {" · "}
            Member since <LocalTime iso={memberSince} mode="date" />
          </p>
        </div>
        <div className="glass flex items-center gap-3 px-5 py-3">
          <Trophy className="h-5 w-5 text-race-bright" />
          <div>
            <p className="font-display text-xl text-white">{points}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Prediction pts</p>
          </div>
        </div>
      </section>

      {/* ============ PROFILE ============ */}
      <section>
        <SectionLabel className="mb-2">Profile</SectionLabel>
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-white">Your details</h2>
        <div className="glass p-6 sm:p-8">
          <ProfileForm
            userId={user.id}
            initial={{
              username: profile?.username ?? "",
              display_name: profile?.display_name ?? "",
              bio: profile?.bio ?? "",
              favorite_series: profile?.favorite_series ?? "",
            }}
          />
        </div>
      </section>

      {/* ============ BADGES ============ */}
      <section>
        <SectionLabel className="mb-2">Trophy Cabinet</SectionLabel>
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-white">Badges</h2>
        {sortedBadges.length === 0 ? (
          <div className="glass p-8 text-center text-sm text-zinc-400">
            No badges exist yet. Check back after the next race weekend.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedBadges.map((badge) => {
              const awardedAt = earned.get(badge.slug);
              const color = TIER_COLORS[badge.tier] ?? "#a1a1aa";
              return (
                <div
                  key={badge.slug}
                  className="glass relative p-5"
                  style={
                    awardedAt
                      ? { borderColor: `${color}66`, boxShadow: `0 0 24px -8px ${color}55` }
                      : { opacity: 0.35 }
                  }
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
                      style={{
                        borderColor: `${color}55`,
                        backgroundColor: `${color}1a`,
                        color: awardedAt ? color : "#71717a",
                      }}
                    >
                      {awardedAt ? <Award className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{badge.name}</p>
                      <p
                        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                        style={{ color: awardedAt ? color : "#71717a" }}
                      >
                        {badge.tier}
                      </p>
                    </div>
                  </div>
                  {badge.description && (
                    <p className="mt-3 line-clamp-2 text-xs text-zinc-400">{badge.description}</p>
                  )}
                  <p className="mt-3 text-[11px] text-zinc-500">
                    {awardedAt ? (
                      <>
                        Earned <LocalTime iso={awardedAt} mode="date" />
                      </>
                    ) : (
                      "Not earned yet."
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============ REMINDERS ============ */}
      <section>
        <SectionLabel className="mb-2">Race Control</SectionLabel>
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-white">My reminders</h2>
        <RemindersList initial={reminders} />
      </section>

      {/* ============ SIGN OUT ============ */}
      <section className="flex justify-end border-t border-white/[0.07] pt-8">
        <SignOutButton />
      </section>
    </div>
  );
}
