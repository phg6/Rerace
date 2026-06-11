"use client";

import { useState } from "react";
import Link from "next/link";
import { BellRing, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LocalTime } from "@/components/LocalTime";

export interface ReminderRow {
  id: string | number;
  event_id: string;
  session_key: string;
  remind_at: string;
  channel: string;
}

function prettySession(key: string): string {
  const names: Record<string, string> = {
    fp1: "Free Practice 1",
    fp2: "Free Practice 2",
    fp3: "Free Practice 3",
    quali: "Qualifying",
    sprint: "Sprint",
    "sprint-quali": "Sprint Qualifying",
    race: "Race",
    main: "Main event",
  };
  return names[key] ?? key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function prettyEvent(eventId: string): string {
  return eventId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function RemindersList({ initial }: { initial: ReminderRow[] }) {
  const [reminders, setReminders] = useState(initial);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const remove = async (id: string | number) => {
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("reminders").delete().eq("id", id);
    if (!error) {
      setReminders((rs) => rs.filter((r) => r.id !== id));
    }
    setDeletingId(null);
  };

  if (reminders.length === 0) {
    return (
      <div className="glass p-8 text-center">
        <BellRing className="mx-auto h-7 w-7 text-zinc-500" />
        <p className="mt-3 text-sm font-semibold text-white">No reminders set.</p>
        <p className="mt-1 text-sm text-zinc-400">
          Hit &ldquo;Remind me&rdquo; on any upcoming session and we&apos;ll give you a nudge before lights out.
        </p>
        <Link href="/schedule" className="btn-glass mt-5">
          Browse the schedule
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {reminders.map((r) => (
        <li key={r.id} className="glass flex items-center gap-4 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-race/30 bg-race/10">
            <BellRing className="h-4 w-4 text-race-bright" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              <Link href={`/watch/${r.event_id}`} className="hover:text-race-bright">
                {prettyEvent(r.event_id)}
              </Link>
              <span className="text-zinc-400"> · {prettySession(r.session_key)}</span>
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">
              Reminds you <LocalTime iso={r.remind_at} mode="datetime" className="text-zinc-300" /> via{" "}
              {r.channel}.
            </p>
          </div>
          <button
            onClick={() => remove(r.id)}
            disabled={deletingId === r.id}
            aria-label="Delete reminder"
            className="btn-ghost h-9 w-9 p-0 text-zinc-400 hover:text-race-bright"
          >
            {deletingId === r.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
