import { NextResponse } from "next/server";
import { getEvent } from "@/lib/data/content";
import { getUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Onboard stream sources (urls included) — signed-in members only. */
export async function GET(_req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  let user = null;
  try {
    user = await getUser();
  } catch {
    user = null;
  }
  if (!user) {
    return NextResponse.json({ error: "Free account required" }, { status: 401 });
  }

  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const onboards = event.series === "f1" ? event.streams.filter((s) => s.role === "onboard") : [];
  return NextResponse.json({ onboards }, { headers: { "Cache-Control": "private, no-store" } });
}
