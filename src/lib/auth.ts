import { redirect } from "next/navigation";
import { getUser } from "./supabase/server";

/**
 * Gate for member-only content (chat, polls, predictions, movies, replays).
 * Redirects to /login (with return path) when there is no verified account.
 */
export async function requireUser(nextPath: string) {
  const user = await getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}&reason=members`);
  }
  return user;
}
