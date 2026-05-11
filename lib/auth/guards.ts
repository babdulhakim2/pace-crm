import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./session";

export async function requireAuth(): Promise<{ userId: string; email: string }> {
  const session = await getSession();
  if (!session) redirect("/login");
  return { userId: session.userId, email: session.email };
}
