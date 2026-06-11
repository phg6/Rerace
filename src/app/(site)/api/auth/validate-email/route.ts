import { NextResponse } from "next/server";
import { isDisposableEmail } from "@/lib/disposable-domains";

/**
 * Pre-flight email validation for magic-link signups.
 * Blocks malformed addresses and disposable domains BEFORE any OTP is sent.
 */
export async function POST(req: Request) {
  let email: string;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json(
      { error: "invalid", message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  email = (email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: "invalid", message: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (isDisposableEmail(email)) {
    return NextResponse.json(
      { error: "disposable", message: "Disposable email addresses can't be used on Rerace." },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
