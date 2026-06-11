import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { LoginCard } from "@/components/auth/LoginCard";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Rerace with Discord or a magic link. Free accounts unlock chat, polls, predictions, movies, replays and reminders.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") ? params.next : "/";

  // Already signed in? Straight back to where they were headed.
  const user = await getUser();
  if (user) redirect(next);

  return (
    <div className="container-site flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
      <LoginCard next={next} reason={params.reason} authError={params.error === "auth"} />
    </div>
  );
}
