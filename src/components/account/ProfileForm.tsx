"use client";

import { useState } from "react";
import { AlertCircle, Check, Loader2, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SERIES_LIST } from "@/lib/series";

interface ProfileFields {
  username: string;
  display_name: string;
  bio: string;
  favorite_series: string;
}

const USERNAME_RE = /^[a-z0-9_]{3,24}$/;

export function ProfileForm({ userId, initial }: { userId: string; initial: ProfileFields }) {
  const [form, setForm] = useState<ProfileFields>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof ProfileFields, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
    setError(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = form.username.trim().toLowerCase();
    if (!USERNAME_RE.test(username)) {
      setError("Usernames are 3–24 characters: lowercase letters, numbers and underscores only.");
      return;
    }
    const bio = form.bio.trim();
    if (bio.length > 280) {
      setError("Bios are limited to 280 characters.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username,
        display_name: form.display_name.trim() || null,
        bio: bio || null,
        favorite_series: form.favorite_series || null,
      })
      .eq("id", userId);
    setSaving(false);
    if (updateError) {
      if (updateError.code === "23505" || updateError.message.includes("duplicate")) {
        setError("That username is taken.");
      } else {
        setError("We couldn't save your changes. Please try again.");
      }
      return;
    }
    setForm((f) => ({ ...f, username }));
    setSaved(true);
  };

  return (
    <form onSubmit={save} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-username" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Username
          </label>
          <input
            id="pf-username"
            type="text"
            value={form.username}
            onChange={(e) => set("username", e.target.value)}
            placeholder="e.g. maxfan_33"
            maxLength={24}
            className="field"
          />
          <p className="mt-1.5 text-[11px] text-zinc-500">
            3–24 characters. Lowercase letters, numbers and underscores.
          </p>
        </div>
        <div>
          <label htmlFor="pf-display" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Display name
          </label>
          <input
            id="pf-display"
            type="text"
            value={form.display_name}
            onChange={(e) => set("display_name", e.target.value)}
            placeholder="How your name appears around Rerace"
            maxLength={64}
            className="field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="pf-bio" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Bio
        </label>
        <textarea
          id="pf-bio"
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Tell the paddock a little about yourself."
          maxLength={280}
          rows={3}
          className="field resize-none"
        />
        <p className="mt-1.5 text-right text-[11px] tabular-nums text-zinc-500">
          {form.bio.length}/280
        </p>
      </div>

      <div className="sm:max-w-xs">
        <label htmlFor="pf-series" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Favorite series
        </label>
        <select
          id="pf-series"
          value={form.favorite_series}
          onChange={(e) => set("favorite_series", e.target.value)}
          className="field appearance-none"
        >
          <option value="" className="bg-carbon">
            No favorite yet
          </option>
          {SERIES_LIST.map((s) => (
            <option key={s.key} value={s.key} className="bg-carbon">
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="flex items-start gap-1.5 text-sm text-race-bright" role="alert">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving} className="btn-glass">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save changes
        </button>
        {saved && <p className="text-sm text-emerald-400">Your profile has been updated.</p>}
      </div>
    </form>
  );
}

/** Signs the user out everywhere on this device and returns home. */
export function SignOutButton() {
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    await createClient().auth.signOut();
    window.location.href = "/";
  };

  return (
    <button onClick={signOut} disabled={busy} className="btn-glass">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Sign out
    </button>
  );
}
