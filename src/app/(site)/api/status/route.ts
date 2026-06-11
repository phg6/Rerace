import { NextResponse } from "next/server";
import { runStatusChecks } from "@/lib/status-checks";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const report = await runStatusChecks();
    return NextResponse.json(report, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { checks: [], overall: "down", checkedAt: new Date().toISOString() },
      { status: 500 }
    );
  }
}
