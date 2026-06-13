"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Check } from "lucide-react";
import type { Poll } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { SectionLabel } from "./SectionLabel";
import { cn } from "@/lib/utils";

/** Daily poll: vote (signed-in only), then animated live results via Realtime. */
export function PollWidget({ poll, className }: { poll: Poll; className?: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [counts, setCounts] = useState<number[]>(() => poll.options.map(() => 0));
  const [myVote, setMyVote] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const loadVotes = useCallback(async () => {
    const { data } = await supabase
      .from("poll_votes")
      .select("option_index, user_id")
      .eq("poll_id", poll.id);
    if (!data) return;
    const next = poll.options.map(() => 0);
    for (const row of data) {
      if (row.option_index < next.length) next[row.option_index]++;
    }
    setCounts(next);
  }, [supabase, poll.id, poll.options]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUserId(data.user?.id ?? null);
      if (data.user) {
        const { data: mine } = await supabase
          .from("poll_votes")
          .select("option_index")
          .eq("poll_id", poll.id)
          .eq("user_id", data.user.id)
          .maybeSingle();
        if (mine) setMyVote(mine.option_index);
      }
      void loadVotes();
    });

    const channel = supabase
      .channel(`poll-${poll.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "poll_votes", filter: `poll_id=eq.${poll.id}` },
        () => loadVotes()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, poll.id, loadVotes]);

  const vote = async (index: number) => {
    if (!userId || myVote !== null || busy) return;
    setBusy(true);
    const { error } = await supabase
      .from("poll_votes")
      .insert({ poll_id: poll.id, user_id: userId, option_index: index });
    if (!error) {
      setMyVote(index);
      setCounts((c) => c.map((v, i) => (i === index ? v + 1 : v)));
    }
    setBusy(false);
  };

  const total = counts.reduce((a, b) => a + b, 0);
  const showResults = myVote !== null;

  return (
    <div className={cn("glass p-6", className)}>
      <div className="mb-1 flex items-center justify-between">
        <SectionLabel>Daily Poll</SectionLabel>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          <BarChart3 className="h-3.5 w-3.5" />
          {total} vote{total === 1 ? "" : "s"}
        </span>
      </div>
      <h3 className="mb-4 text-lg font-bold text-white">{poll.question}</h3>
      <div className="space-y-2.5">
        {poll.options.map((opt, i) => {
          const pct = total > 0 ? Math.round((counts[i] / total) * 100) : 0;
          return (
            <button
              key={i}
              onClick={() => vote(i)}
              disabled={!userId || showResults || busy}
              className={cn(
                "relative block w-full overflow-hidden rounded-[14px] border px-4 py-3 text-left text-sm transition-all",
                showResults
                  ? "cursor-default border-white/[0.07]"
                  : "border-white/[0.1] hover:border-race/60 hover:bg-white/[0.05]",
                myVote === i && "border-race/70"
              )}
            >
              {showResults && (
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-[12px] transition-[width] duration-700 ease-out",
                    myVote === i ? "bg-race/30" : "bg-white/[0.07]"
                  )}
                  style={{ width: `${pct}%` }}
                />
              )}
              <span className="relative flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-zinc-100">
                  {myVote === i && <Check className="h-4 w-4 text-race-bright" />}
                  {opt}
                </span>
                {showResults && <span className="text-xs font-bold tabular-nums text-zinc-300">{pct}%</span>}
              </span>
            </button>
          );
        })}
      </div>
      {!userId && (
        <p className="mt-4 text-xs text-zinc-500">
          <Link href="/login" className="text-race-bright hover:underline">
            Sign in
          </Link>{" "}
          to vote — a new poll drops every 24 hours.
        </p>
      )}
    </div>
  );
}
