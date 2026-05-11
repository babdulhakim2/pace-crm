"use server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAuth } from "@/lib/auth/guards";
import { verifyPassword } from "@/lib/auth/password";
import { deleteSession } from "@/lib/auth/session";

export async function deleteAccountAction(
  password: string,
): Promise<{ error?: string }> {
  const { userId } = await requireAuth();

  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return { error: "Account not found" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Incorrect password" };
  }

  // CASCADE constraints auto-delete all related data
  await db.delete(users).where(eq(users.id, userId));

  await deleteSession();
  redirect("/signup");
}
