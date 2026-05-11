"use server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, userServices, userAreas, userOutcomes } from "@/db/schema";
import { requireAuth } from "@/lib/auth/guards";
import { serviceSchema, areaSchema, userNameSchema, outcomeSchema } from "@/lib/validations";

export async function addServiceAction(code: string, label: string) {
  const { userId } = await requireAuth();
  serviceSchema.parse({ code, label });

  await db.insert(userServices).values({
    userId,
    code,
    label,
    sortOrder: 0,
  });
}

export async function updateServiceAction(code: string, label: string) {
  const { userId } = await requireAuth();
  serviceSchema.parse({ code, label });

  await db
    .update(userServices)
    .set({ label })
    .where(
      and(eq(userServices.userId, userId), eq(userServices.code, code)),
    );
}

export async function removeServiceAction(code: string) {
  const { userId } = await requireAuth();

  await db
    .delete(userServices)
    .where(
      and(eq(userServices.userId, userId), eq(userServices.code, code)),
    );
}

export async function addAreaAction(name: string) {
  const { userId } = await requireAuth();
  areaSchema.parse({ name });

  await db.insert(userAreas).values({
    userId,
    name,
    sortOrder: 0,
  });
}

export async function removeAreaAction(name: string) {
  const { userId } = await requireAuth();

  await db
    .delete(userAreas)
    .where(
      and(eq(userAreas.userId, userId), eq(userAreas.name, name)),
    );
}

export async function setUserNameAction(name: string) {
  const { userId } = await requireAuth();
  userNameSchema.parse({ name });

  await db.update(users).set({ displayName: name }).where(eq(users.id, userId));
}

export async function addOutcomeAction(
  code: string,
  label: string,
  dm: boolean,
  sale: boolean,
  tone: string,
) {
  const { userId } = await requireAuth();
  const parsed = outcomeSchema.parse({ code, label, dm, sale, tone });

  await db.insert(userOutcomes).values({
    userId,
    code: parsed.code,
    label: parsed.label,
    dm: parsed.dm,
    sale: parsed.sale,
    tone: parsed.tone,
    sortOrder: 0,
  });
}

export async function updateOutcomeAction(
  code: string,
  label: string,
  dm: boolean,
  sale: boolean,
  tone: string,
) {
  const { userId } = await requireAuth();
  const parsed = outcomeSchema.parse({ code, label, dm, sale, tone });

  await db
    .update(userOutcomes)
    .set({ label: parsed.label, dm: parsed.dm, sale: parsed.sale, tone: parsed.tone })
    .where(
      and(eq(userOutcomes.userId, userId), eq(userOutcomes.code, parsed.code)),
    );
}

export async function removeOutcomeAction(code: string) {
  const { userId } = await requireAuth();

  await db
    .delete(userOutcomes)
    .where(
      and(eq(userOutcomes.userId, userId), eq(userOutcomes.code, code)),
    );
}
