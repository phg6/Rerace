import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isDisposableEmail } from "@/lib/disposable-domains";

export async function POST(req: Request) {
  let email: string;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  email = (email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (isDisposableEmail(email)) {
    return NextResponse.json({ error: "Disposable email addresses are not allowed" }, { status: 400 });
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
  const { error } = await supabase.from("newsletter_subscribers").insert({ email });
  if (error && !error.message.includes("duplicate")) {
    return NextResponse.json({ error: "Could not subscribe right now" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
