"use server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses, stageOverrides } from "@/db/schema";
import { requireAuth } from "@/lib/auth/guards";
import { addBusinessSchema, updateStageSchema, updateBusinessSchema } from "@/lib/validations";

export async function addBusinessAction(data: {
  id: string;
  name: string;
  type: string;
  area: string;
  contact: string;
  role: string;
}) {
  const { userId } = await requireAuth();
  const parsed = addBusinessSchema.parse(data);

  await db.insert(businesses).values({
    id: parsed.id,
    userId,
    name: parsed.name,
    type: parsed.type,
    area: parsed.area,
    contact: parsed.contact,
    role: parsed.role,
  });
}

export async function updateBusinessAction(data: {
  id: string;
  name: string;
  type: string;
  area: string;
  contact: string;
  role: string;
}) {
  const { userId } = await requireAuth();
  const parsed = updateBusinessSchema.parse(data);

  await db
    .update(businesses)
    .set({
      name: parsed.name,
      type: parsed.type,
      area: parsed.area,
      contact: parsed.contact,
      role: parsed.role,
    })
    .where(
      and(eq(businesses.userId, userId), eq(businesses.id, parsed.id)),
    );
}

export async function updateBusinessStageAction(bizId: string, stage: string) {
  const { userId } = await requireAuth();
  updateStageSchema.parse({ bizId, stage });

  // Upsert: delete existing then insert
  await db
    .delete(stageOverrides)
    .where(
      and(eq(stageOverrides.userId, userId), eq(stageOverrides.bizId, bizId)),
    );

  await db.insert(stageOverrides).values({
    userId,
    bizId,
    stage,
  });
}
