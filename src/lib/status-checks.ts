import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getIncidents } from "./data/content";

export type CheckStatus = "operational" | "degraded" | "down" | "unconfigured";

export interface StatusCheck {
  key: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface StatusReport {
  checks: StatusCheck[];
  overall: CheckStatus;
  checkedAt: string;
}

const TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, ms = TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timed out")), ms)),
  ]);
}

function anonSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

async function checkDatabase(): Promise<StatusCheck> {
  const base = { key: "database", label: "Database" };
  const sb = anonSupabase();
  if (!sb) return { ...base, status: "unconfigured", detail: "Supabase environment not configured" };
  try {
    const { error } = await withTimeout(
      (async () => sb.from("news_items").select("id").limit(1))()
    );
    if (error) return { ...base, status: "down", detail: error.message };
    return { ...base, status: "operational", detail: "Queries responding normally" };
  } catch (err) {
    return { ...base, status: "down", detail: err instanceof Error ? err.message : "Unreachable" };
  }
}

async function checkAuth(): Promise<StatusCheck> {
  const base = { key: "auth", label: "Authentication" };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { ...base, status: "unconfigured", detail: "Supabase environment not configured" };
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return { ...base, status: "down", detail: `Health endpoint returned ${res.status}` };
    return { ...base, status: "operational", detail: "Sign-in and sessions available" };
  } catch (err) {
    return { ...base, status: "down", detail: err instanceof Error ? err.message : "Unreachable" };
  }
}

async function checkCms(): Promise<StatusCheck> {
  const base = { key: "cms", label: "Content management" };
  if (!process.env.DATABASE_URI) {
    return { ...base, status: "unconfigured", detail: "CMS not configured — serving seed content" };
  }
  try {
    await withTimeout(getIncidents(1), TIMEOUT_MS);
    return { ...base, status: "operational", detail: "CMS reachable" };
  } catch (err) {
    return { ...base, status: "down", detail: err instanceof Error ? err.message : "CMS unreachable" };
  }
}

async function checkNewsCrawler(): Promise<StatusCheck> {
  const base = { key: "news", label: "News crawler" };
  const sb = anonSupabase();
  if (!sb) return { ...base, status: "unconfigured", detail: "Supabase environment not configured" };
  try {
    const { data, error } = await withTimeout(
      (async () =>
        sb
          .from("news_items")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(1))()
    );
    if (error) return { ...base, status: "down", detail: error.message };
    if (!data || data.length === 0) {
      return { ...base, status: "unconfigured", detail: "No crawled items yet" };
    }
    const newest = Date.parse(data[0].created_at as string);
    const ageH = Math.round((Date.now() - newest) / 3_600_000);
    if (Date.now() - newest < 24 * 3_600_000) {
      return { ...base, status: "operational", detail: `Last crawl ${ageH <= 0 ? "under an hour" : `${ageH}h`} ago` };
    }
    return { ...base, status: "degraded", detail: `No new items for ${ageH}h` };
  } catch (err) {
    return { ...base, status: "down", detail: err instanceof Error ? err.message : "Unreachable" };
  }
}

function checkEmail(): StatusCheck {
  const base = { key: "email", label: "Email delivery" };
  if (process.env.RESEND_API_KEY) {
    return { ...base, status: "operational", detail: "Configured" };
  }
  return { ...base, status: "unconfigured", detail: "Not configured" };
}

export async function runStatusChecks(): Promise<StatusReport> {
  const settled = await Promise.allSettled([
    checkDatabase(),
    checkAuth(),
    checkCms(),
    checkNewsCrawler(),
    Promise.resolve(checkEmail()),
  ]);

  const fallbackKeys = ["database", "auth", "cms", "news", "email"];
  const fallbackLabels = ["Database", "Authentication", "Content management", "News crawler", "Email delivery"];
  const checks: StatusCheck[] = settled.map((s, i) =>
    s.status === "fulfilled"
      ? s.value
      : { key: fallbackKeys[i], label: fallbackLabels[i], status: "down", detail: "Check failed" }
  );

  // Unconfigured services are informational and don't drag the overall status down.
  const considered = checks.filter((c) => c.status !== "unconfigured");
  const overall: CheckStatus = considered.some((c) => c.status === "down")
    ? "down"
    : considered.some((c) => c.status === "degraded")
      ? "degraded"
      : "operational";

  return { checks, overall, checkedAt: new Date().toISOString() };
}
