"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const SUBJECTS = [
  "General",
  "Stream issue",
  "Rights holder / takedown",
  "Partnership",
  "Press",
] as const;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      subject: String(data.get("subject") ?? "General"),
      message: String(data.get("message") ?? "").trim(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Something went wrong — please try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      form.reset();
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="glass flex flex-col items-center px-8 py-14 text-center">
        <CheckCircle2 className="mb-4 h-10 w-10 text-race-bright" />
        <h3 className="text-lg font-bold text-white">Message sent</h3>
        <p className="mt-2 max-w-sm text-sm text-zinc-400">
          Thanks — we usually reply within 48 hours.
        </p>
        <button type="button" className="btn-glass mt-6" onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass space-y-5 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            maxLength={120}
            placeholder="Your name"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={254}
            placeholder="you@example.com"
            className="field"
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-subject" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Subject
        </label>
        <select id="contact-subject" name="subject" className="field appearance-none" defaultValue="General">
          {SUBJECTS.map((s) => (
            <option key={s} value={s} className="bg-carbon text-white">
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder="How can we help? For takedown requests, include the URL(s) concerned and proof of rights."
          className="field resize-y"
        />
      </div>
      {error && <p className="text-sm text-race-bright">{error}</p>}
      <button type="submit" className="btn-race w-full sm:w-auto" disabled={status === "sending"}>
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Send message
          </>
        )}
      </button>
    </form>
  );
}
