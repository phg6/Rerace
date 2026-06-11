"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LogIn, MessageSquare, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  username: string;
  content: string;
  created_at: string;
  user_id: string;
  is_deleted: boolean;
}

/** Keep at most this many messages in memory — old ones fall off the top. */
const MAX_MESSAGES = 200;
/** Within this many px of the bottom we keep auto-scrolling on new messages. */
const NEAR_BOTTOM_PX = 80;

/** Deterministic, subtle username tint — zinc-range lightness with a hint of hue. */
function usernameColor(name: string): string {
  let hue = 0;
  for (let i = 0; i < name.length; i++) hue = (hue * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${hue} 26% 74%)`;
}

function shortTime(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

/**
 * Realtime event chat. Loads the last 100 messages, then appends inserts from
 * Supabase Realtime. Automod (banned words + rate limit) is enforced by a DB
 * trigger — we only translate its errors into friendly copy.
 */
export function LiveChat({ eventId, className }: { eventId: string; className?: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  /** undefined = auth check in flight, null = signed out */
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);

  // Refresh relative timestamps once a minute.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setUserId(data.user?.id ?? null);
    });

    supabase
      .from("chat_messages")
      .select("id, username, content, created_at, user_id, is_deleted")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (cancelled) return;
        setMessages([...((data ?? []) as ChatMessage[])].reverse());
        setLoading(false);
      });

    const channel = supabase
      .channel(`chat-${eventId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `event_id=eq.${eventId}` },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg].slice(-MAX_MESSAGES)
          );
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [supabase, eventId]);

  const onScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
  }, []);

  // Auto-scroll on new messages, but only when the viewer is already near the bottom.
  useEffect(() => {
    const el = listRef.current;
    if (el && nearBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const send = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !userId || sending) return;
    setSending(true);
    setError(null);
    // The DB trigger overwrites `username` with the sender's profile name.
    const { error: insertError } = await supabase.from("chat_messages").insert({
      event_id: eventId,
      user_id: userId,
      content,
      username: "",
    });
    if (insertError) {
      if (insertError.message.includes("RATE_LIMITED")) {
        setError("You're sending messages too fast — slow down.");
      } else if (insertError.message.includes("MESSAGE_BLOCKED")) {
        setError("That message isn't allowed here.");
      } else {
        setError("Your message could not be sent. Please try again.");
      }
    } else {
      setInput("");
    }
    setSending(false);
  };

  const visible = messages.filter((m) => !m.is_deleted);

  return (
    <div className={cn("glass flex flex-col overflow-hidden", className)}>
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.08] px-4 py-3">
        <MessageSquare className="h-4 w-4 text-race-bright" />
        <h2 className="text-sm font-bold text-white">Live chat</h2>
      </div>

      <div
        ref={listRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3"
        aria-live="polite"
      >
        {loading ? (
          <div className="space-y-3" aria-hidden>
            <div className="skeleton h-10" />
            <div className="skeleton h-10" />
            <div className="skeleton h-10" />
          </div>
        ) : visible.length === 0 ? (
          <p className="py-8 text-center text-xs text-zinc-500">
            No messages yet — be the first to say hello.
          </p>
        ) : (
          visible.map((m) => (
            <div key={m.id} className="text-sm leading-snug">
              <span className="font-bold" style={{ color: usernameColor(m.username) }}>
                {m.username}
              </span>
              <span className="ml-2 text-[10px] tabular-nums text-zinc-500">
                {shortTime(m.created_at)}
              </span>
              <p className="break-words text-zinc-200">{m.content}</p>
            </div>
          ))
        )}
      </div>

      {error && (
        <p className="shrink-0 border-t border-white/[0.08] bg-race/10 px-4 py-2 text-xs text-race-bright">
          {error}
        </p>
      )}

      <div className="shrink-0 border-t border-white/[0.08] p-3">
        {userId === null ? (
          <Link
            href={`/login?next=${encodeURIComponent(`/watch/${eventId}`)}`}
            className="btn-glass w-full text-xs"
          >
            <LogIn className="h-3.5 w-3.5" /> Sign in to join the chat
          </Link>
        ) : (
          <form onSubmit={send} className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Send a message…"
              disabled={userId === undefined || sending}
              aria-label="Chat message"
              className="field px-3 py-2 text-xs"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending || userId === undefined}
              aria-label="Send message"
              className="btn-glass h-9 w-9 shrink-0 p-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
