import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEvents } from "@/lib/data/content";
import { SITE } from "@/lib/site";
import type { RaceEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ReminderRow {
  id: string;
  user_id: string | null;
  event_id: string;
  session_key: string | null;
  remind_at: string;
  email: string | null;
  channel: string | null;
  sent: boolean;
}

function reminderHtml(event: RaceEvent, sessionName: string | undefined, watchUrl: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#0a0a0b;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0b;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:32px;">
            <tr>
              <td align="center">
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:4px;text-transform:uppercase;color:#ff2d23;font-weight:bold;">Rerace · Reminder</p>
                <h1 style="margin:0 0 6px;font-size:24px;line-height:1.25;color:#ffffff;">${event.title}</h1>
                <p style="margin:0 0 4px;font-size:14px;color:#a1a1aa;">${event.circuit}${event.country ? ` · ${event.country}` : ""}</p>
                ${sessionName ? `<p style="margin:0;font-size:14px;color:#e4e4e7;font-weight:bold;">${sessionName} is about to start</p>` : ""}
                <a href="${watchUrl}" style="display:inline-block;margin-top:24px;background-color:#e10600;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 36px;border-radius:999px;">&#9654;&nbsp; Watch live on Rerace</a>
                <p style="margin:28px 0 0;font-size:12px;color:#71717a;">You set this reminder on ${SITE.domain}. Times are shown in your local timezone on the site.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const events = await getEvents();
    const eventById = new Map(events.map((e) => [e.id, e]));
    const now = Date.now();

    /* ---------------- Job 1: due session reminders ---------------- */
    let remindersSent = 0;
    let remindersSkipped = 0;

    const nowIso = new Date(now).toISOString();
    const twoHoursAgoIso = new Date(now - 2 * 3_600_000).toISOString();
    const { data: dueRows, error: dueError } = await supabase
      .from("reminders")
      .select("*")
      .eq("sent", false)
      .lte("remind_at", nowIso)
      .gt("remind_at", twoHoursAgoIso);
    if (dueError) throw new Error(`reminders query failed: ${dueError.message}`);

    const due = (dueRows ?? []) as ReminderRow[];

    if (due.length > 0 && process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.EMAIL_FROM ?? `Rerace <noreply@${SITE.domain}>`;

      for (const reminder of due) {
        const event = eventById.get(reminder.event_id);
        if (!event || !reminder.email) {
          remindersSkipped++;
          // Mark unsendable reminders as handled so they don't pile up.
          await supabase.from("reminders").update({ sent: true }).eq("id", reminder.id);
          continue;
        }
        const session = reminder.session_key
          ? event.sessions.find((s) => s.key === reminder.session_key)
          : undefined;
        const watchUrl = `${SITE.url}/watch/${event.id}`;
        try {
          await resend.emails.send({
            from,
            to: reminder.email,
            subject: `🔴 ${event.title} starts soon`,
            html: reminderHtml(event, session?.name, watchUrl),
            text: `${event.title}${session ? ` — ${session.name}` : ""} starts soon. Watch live: ${watchUrl}`,
          });
          await supabase.from("reminders").update({ sent: true }).eq("id", reminder.id);
          remindersSent++;
        } catch (err) {
          console.error(`[cron/reminders] send failed for reminder ${reminder.id}:`, err);
          remindersSkipped++;
        }
      }
    } else if (due.length > 0) {
      // RESEND_API_KEY unset — skip sending entirely but still report ok.
      remindersSkipped = due.length;
    }

    /* ---------------- Job 2: go-live announcements ---------------- */
    // The cron runs every 10 minutes, so announcing sessions whose startsAt
    // falls inside [now-10min, now] naturally avoids duplicates.
    const windowStart = now - 10 * 60_000;
    const goneLive = events.filter((e) =>
      e.sessions.some((s) => {
        const start = Date.parse(s.startsAt);
        return start >= windowStart && start <= now;
      })
    );

    let announced = 0;
    for (const event of goneLive) {
      const url = `${SITE.url}/watch/${event.id}`;

      if (process.env.DISCORD_WEBHOOK_URL) {
        try {
          await fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: `🔴 **LIVE NOW:** ${event.title} — watch: ${url}` }),
          });
        } catch (err) {
          console.error("[cron/reminders] discord announce failed:", err);
        }
      }

      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        try {
          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: process.env.TELEGRAM_CHAT_ID,
              text: `🔴 LIVE NOW: ${event.title} — watch: ${url}`,
              disable_web_page_preview: false,
            }),
          });
        } catch (err) {
          console.error("[cron/reminders] telegram announce failed:", err);
        }
      }

      announced++;
    }

    return NextResponse.json({
      ok: true,
      due: due.length,
      remindersSent,
      remindersSkipped,
      emailConfigured: Boolean(process.env.RESEND_API_KEY),
      announced,
    });
  } catch (err) {
    console.error("[cron/reminders] run failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
