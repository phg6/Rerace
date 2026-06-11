import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SITE } from "@/lib/site";

const SUBJECTS = ["General", "Stream issue", "Rights holder / takedown", "Partnership", "Press"];

export async function POST(req: Request) {
  let body: { name?: unknown; email?: unknown; subject?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const subjectRaw = String(body.subject ?? "General").trim();
  const subject = SUBJECTS.includes(subjectRaw) ? subjectRaw : "General";
  const message = String(body.message ?? "").trim();

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (message.length < 10 || message.length > 5000) {
    return NextResponse.json(
      { error: "Message must be between 10 and 5000 characters" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
  const { error } = await supabase.from("contact_messages").insert({ name, email, subject, message });
  if (error) {
    return NextResponse.json({ error: "Could not send your message right now" }, { status: 500 });
  }

  // Notify the team via Resend — best-effort, never fails the request.
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? `Rerace <noreply@${SITE.domain}>`,
        to: SITE.contactEmail,
        replyTo: email,
        subject: `[Contact] ${subject} — ${name}`,
        text: `New contact message on ${SITE.domain}\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      });
    } catch (err) {
      console.error("[contact] notification email failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
