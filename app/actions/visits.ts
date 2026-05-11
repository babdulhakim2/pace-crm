"use server";
import { db } from "@/db";
import { visits, visitItems } from "@/db/schema";
import { requireAuth } from "@/lib/auth/guards";
import { addVisitSchema } from "@/lib/validations";

export async function addVisitAction(data: {
  id: string;
  bizId: string;
  date: string;
  via: string;
  notes: string;
  items: { svc: string; out: string }[];
}) {
  const { userId } = await requireAuth();
  const parsed = addVisitSchema.parse(data);

  await db.insert(visits).values({
    id: parsed.id,
    userId,
    bizId: parsed.bizId,
    date: new Date(parsed.date),
    via: parsed.via,
    notes: parsed.notes,
  });

  if (parsed.items.length > 0) {
    await db.insert(visitItems).values(
      parsed.items.map((it) => ({
        visitId: parsed.id,
        userId,
        svc: it.svc,
        out: it.out,
      })),
    );
  }
}
