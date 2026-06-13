"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, BellRing, CalendarPlus } from "lucide-react";
import { useNow } from "@/lib/hooks";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * "Remind me" — stores an email reminder (sent ~15 min before the session)
 * for the signed-in user's verified address. Includes an add-to-calendar link.
 */
export function ReminderButton({
  eventId,
  sessionKey = "main",
  sessionName,
  startsAt,
  compact = false,
  className,
}: {
  eventId: string;
  sessionKey?: string;
  sessionName?: string;
  startsAt: string;
  compact?: boolean;
  className?: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const now = useNow(60_000);
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [email, setEmail] = useState<string | null>(null);
  const [isSet, setIsSet] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUserId(data.user?.id ?? null);
      setEmail(data.user?.email ?? null);
      if (data.user) {
        const { data: existing } = await supabase
          .from("reminders")
          .select("id")
          .eq("user_id", data.user.id)
          .eq("event_id", eventId)
          .eq("session_key", sessionKey)
          .eq("channel", "email")
          .maybeSingle();
        setIsSet(Boolean(existing));
      }
    });
  }, [supabase, eventId, sessionKey]);

  const toggle = async () => {
    if (!userId || !email || busy) return;
    setBusy(true);
    if (isSet) {
      await supabase
        .from("reminders")
        .delete()
        .eq("user_id", userId)
        .eq("event_id", eventId)
        .eq("session_key", sessionKey)
        .eq("channel", "email");
      setIsSet(false);
    } else {
      const remindAt = new Date(Date.parse(startsAt) - 15 * 60_000).toISOString();
      const { error } = await supabase.from("reminders").insert({
        user_id: userId,
        event_id: eventId,
        session_key: sessionKey,
        remind_at: remindAt,
        email,
        channel: "email",
      });
      if (!error) setIsSet(true);
    }
    setBusy(false);
  };

  if (now !== null && Date.parse(startsAt) < now) return null;

  if (userId === null) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/watch/${eventId}`)}`}
        className={cn("btn-glass", compact && "h-8 px-3 text-xs", className)}
      >
        <Bell className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        Remind me
      </Link>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <button
        onClick={toggle}
        disabled={busy || userId === undefined}
        className={cn(
          "btn-glass",
          compact && "h-8 px-3 text-xs",
          isSet && "border-race/60 text-race-bright"
        )}
        title={
          isSet
            ? "Reminder set — we'll email you 15 minutes before the start"
            : `Email me 15 minutes before ${sessionName ?? "the session"} starts`
        }
      >
        {isSet ? (
          <BellRing className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        ) : (
          <Bell className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        )}
        {isSet ? "Reminder set" : "Remind me"}
      </button>
      <a
        href={`/api/calendar?event=${encodeURIComponent(eventId)}&session=${encodeURIComponent(sessionKey)}`}
        className={cn("btn-ghost", compact ? "h-8 px-2 text-xs" : "text-sm")}
        title="Add to calendar (.ics)"
      >
        <CalendarPlus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </a>
    </span>
  );
}
