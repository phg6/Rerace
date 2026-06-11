import Link from "next/link";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SectionLabel } from "@/components/SectionLabel";
import { EmptyState } from "@/components/EmptyState";

interface LeaderRow {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  prediction_points: number | null;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

const PODIUM_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32"];

/** Season leaderboard — top 20 predictors by points. Server component. */
export async function Leaderboard() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, prediction_points")
    .order("prediction_points", { ascending: false })
    .limit(20);
  const rows = ((data ?? []) as LeaderRow[]).filter((r) => r.username);

  return (
    <div className="glass p-6">
      <div className="mb-5 flex items-center justify-between">
        <SectionLabel>Leaderboard</SectionLabel>
        <Trophy className="h-4 w-4 text-race-bright" />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Nobody on the board yet"
          message="Be the first to call a podium and claim the top spot."
          className="border-0 bg-transparent px-4 py-10 backdrop-blur-none"
        />
      ) : (
        <ol className="space-y-2.5">
          {rows.map((row, i) => {
            const name = row.display_name || row.username!;
            return (
              <li key={row.username}>
                <Link
                  href={`/u/${row.username}`}
                  className="group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-colors hover:bg-white/[0.05]"
                >
                  <span
                    className="font-display w-7 shrink-0 text-right text-lg"
                    style={{ color: PODIUM_COLORS[i] ?? "#71717a" }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.12] bg-white/[0.06]">
                    {row.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-300">{initials(name)}</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white group-hover:text-race-bright">
                      {name}
                    </span>
                    <span className="block truncate text-[11px] text-zinc-500">@{row.username}</span>
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-200">
                    {row.prediction_points ?? 0}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
