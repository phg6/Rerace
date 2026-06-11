"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Loader2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Countdown } from "@/components/Countdown";

export interface PredictionRow {
  p1: string;
  p2: string;
  p3: string;
  pole: string;
  points: number | null;
}

interface DriverOption {
  id: string;
  name: string;
  team?: string;
}

const SLOTS = [
  { key: "p1", label: "P1 — Winner" },
  { key: "p2", label: "P2" },
  { key: "p3", label: "P3" },
  { key: "pole", label: "Pole position" },
] as const;

export function PredictionForm({
  eventId,
  userId,
  drivers,
  lockAt,
  existing,
}: {
  eventId: string;
  userId: string;
  drivers: DriverOption[];
  lockAt: string;
  existing: PredictionRow | null;
}) {
  const lockTime = Date.parse(lockAt);
  const [picks, setPicks] = useState({
    p1: existing?.p1 ?? "",
    p2: existing?.p2 ?? "",
    p3: existing?.p3 ?? "",
    pole: existing?.pole ?? "",
  });
  const [locked, setLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flip to locked the moment the race starts.
  useEffect(() => {
    const check = () => setLocked(Date.now() >= lockTime);
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, [lockTime]);

  const scored = existing !== null && existing.points !== null;
  const readOnly = locked || scored;

  const setPick = (key: keyof typeof picks, value: string) => {
    setPicks((p) => ({ ...p, [key]: value }));
    setSaved(false);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (!picks.p1 || !picks.p2 || !picks.p3 || !picks.pole) {
      setError("Pick a driver for every slot before locking it in.");
      return;
    }
    if (new Set([picks.p1, picks.p2, picks.p3]).size !== 3) {
      setError("Pick three different drivers for the podium.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: upsertError } = await supabase.from("predictions").upsert(
      {
        event_id: eventId,
        user_id: userId,
        p1: picks.p1,
        p2: picks.p2,
        p3: picks.p3,
        pole: picks.pole,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_id,user_id" }
    );
    setSaving(false);
    if (upsertError) {
      setError("We couldn't save your prediction. It may already be locked for scoring.");
      return;
    }
    setSaved(true);
  };

  return (
    <div>
      {/* Lock state / countdown */}
      {readOnly ? (
        <div className="mb-6 flex items-center gap-3 rounded-[var(--radius-field)] border border-white/[0.1] bg-white/[0.04] p-3.5 text-sm text-zinc-300">
          <Lock className="h-4 w-4 shrink-0 text-race-bright" />
          {scored ? (
            <p>
              This prediction has been scored — you earned{" "}
              <span className="font-display text-race-bright">{existing?.points} pts</span>.
            </p>
          ) : (
            <p>Predictions are locked — the race has started.</p>
          )}
        </div>
      ) : (
        <div className="mb-6">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
            Predictions lock in
          </p>
          <Countdown to={lockAt} />
        </div>
      )}

      <form onSubmit={submit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          {SLOTS.map((slot) => (
            <div key={slot.key}>
              <label
                htmlFor={`pred-${slot.key}`}
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                {slot.label}
              </label>
              <select
                id={`pred-${slot.key}`}
                value={picks[slot.key]}
                onChange={(e) => setPick(slot.key, e.target.value)}
                disabled={readOnly}
                className="field appearance-none disabled:opacity-50"
              >
                <option value="" className="bg-carbon">
                  Pick a driver
                </option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.name} className="bg-carbon">
                    {d.name}
                    {d.team ? ` — ${d.team}` : ""}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 flex items-start gap-1.5 text-sm text-race-bright" role="alert">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}

        {!readOnly && (
          <div className="mt-6 flex items-center gap-4">
            <button type="submit" disabled={saving} className="btn-glass">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {existing ? "Update prediction" : "Lock it in"}
            </button>
            {saved && (
              <p className="text-sm text-emerald-400">
                Prediction saved. You can change it until the race starts.
              </p>
            )}
          </div>
        )}
      </form>

      {/* Current prediction summary */}
      {existing && (
        <div className="mt-7 border-t border-white/[0.07] pt-5">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-zinc-400">Your current prediction</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "P1", value: existing.p1 },
              { label: "P2", value: existing.p2 },
              { label: "P3", value: existing.p3 },
              { label: "Pole", value: existing.pole },
            ].map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-xs text-zinc-200"
              >
                <span className="font-display text-race-bright">{c.label}</span>
                {c.value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
