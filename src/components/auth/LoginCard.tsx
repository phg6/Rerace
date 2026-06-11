"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Mail, MailCheck, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function LoginCard({
  next,
  reason,
  authError,
}: {
  next: string;
  reason?: string;
  authError?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [discordBusy, setDiscordBusy] = useState(false);

  const callbackUrl = () =>
    `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const signInWithDiscord = async () => {
    setError(null);
    setDiscordBusy(true);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: callbackUrl() },
    });
    if (oauthError) {
      setError("We couldn't reach Discord. Please try again.");
      setDiscordBusy(false);
    }
  };

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      // Block disposable domains server-side BEFORE any OTP is sent.
      const res = await fetch("/api/auth/validate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      if (!res.ok) {
        const body: { error?: string } | null = await res.json().catch(() => null);
        setError(
          body?.error === "disposable"
            ? "Disposable email addresses can't be used on Rerace."
            : "Please enter a valid email address."
        );
        setStatus("idle");
        return;
      }
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: value,
        options: { emailRedirectTo: callbackUrl() },
      });
      if (otpError) {
        setError("We couldn't send your sign-in link right now. Please try again in a moment.");
        setStatus("idle");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Something went wrong on our end. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <div className="glass-strong w-full max-w-md p-8 sm:p-10 animate-rise">
      {/* Wordmark */}
      <p className="font-display select-none text-center text-2xl tracking-[0.18em] text-white">
        RE<span className="text-race">RACE</span>
      </p>
      <p className="mt-2 text-center text-sm text-zinc-400">
        One free account for every race, every series.
      </p>

      {reason === "members" && (
        <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-field)] border border-race/30 bg-race/10 p-3.5 text-sm text-zinc-200">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-race-bright" />
          <p>That&apos;s members-only — create a free account to continue.</p>
        </div>
      )}
      {authError && (
        <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-field)] border border-race/30 bg-race/10 p-3.5 text-sm text-zinc-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-race-bright" />
          <p>We couldn&apos;t complete your sign-in. Please try again.</p>
        </div>
      )}

      {/* Discord */}
      <button
        onClick={signInWithDiscord}
        disabled={discordBusy}
        className="mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#5865F2] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#6b76f3] hover:shadow-[0_0_28px_-6px_rgba(88,101,242,0.7)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5865F2] disabled:pointer-events-none disabled:opacity-50"
      >
        {discordBusy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <DiscordIcon className="h-4.5 w-4.5" />
        )}
        Continue with Discord
      </button>

      {/* Divider */}
      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-white/[0.1]" />
        <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">or</span>
        <span className="h-px flex-1 bg-white/[0.1]" />
      </div>

      {/* Magic link */}
      {status === "sent" ? (
        <div className="rounded-[var(--radius-card)] border border-white/[0.1] bg-white/[0.04] p-6 text-center">
          <MailCheck className="mx-auto h-8 w-8 text-race-bright" />
          <p className="mt-3 text-sm font-semibold text-white">
            Check your inbox — we sent you a sign-in link.
          </p>
          <p className="mt-1.5 text-xs text-zinc-400">
            It can take a minute to arrive. Don&apos;t forget your spam folder.
          </p>
          <button
            onClick={() => {
              setStatus("idle");
              setEmail("");
            }}
            className="btn-ghost mt-4 text-xs"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={sendMagicLink} noValidate>
          <label htmlFor="login-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="you@example.com"
            className="field"
          />
          {error && (
            <p className="mt-2.5 flex items-start gap-1.5 text-sm text-race-bright" role="alert">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          )}
          <button type="submit" disabled={status === "sending"} className="btn-glass mt-4 w-full py-3">
            {status === "sending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Email me a sign-in link
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-zinc-500">
        Free forever. Verified email required.
      </p>
    </div>
  );
}
