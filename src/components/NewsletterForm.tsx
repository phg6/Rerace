"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Something went wrong");
      setState("done");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-400">
        <Check className="h-4 w-4" /> You&apos;re in — see you on race day.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex max-w-xs items-center gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="field h-10 py-0"
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        aria-label="Subscribe"
        className="btn-glass h-10 w-10 shrink-0 !p-0"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
      {state === "error" && <p className="text-xs text-race-bright">{message}</p>}
    </form>
  );
}
