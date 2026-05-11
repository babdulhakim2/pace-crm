import { db } from "@/db";
import {
  businesses,
  visits,
  visitItems,
  userServices,
  userAreas,
  userOutcomes,
} from "@/db/schema";
import {
  SEED_BUSINESSES,
  SEED_VISITS,
  OUTCOMES,
  SERVICES,
  AREAS,
} from "@/lib/data";

export async function seedUserData(userId: string) {
  // Insert businesses
  if (SEED_BUSINESSES.length > 0) {
    await db.insert(businesses).values(
      SEED_BUSINESSES.map((b) => ({
        id: b.id,
        userId,
        name: b.name,
        type: b.type,
        area: b.area,
        contact: b.contact,
        role: b.role,
      })),
    );
  }

  // Insert visits + visit items
  if (SEED_VISITS.length > 0) {
    await db.insert(visits).values(
      SEED_VISITS.map((v) => ({
        id: v.id,
        userId,
        bizId: v.bizId,
        date: new Date(v.date),
        via: v.via,
        notes: v.notes,
      })),
    );

    const allItems = SEED_VISITS.flatMap((v) =>
      v.items.map((it) => ({
        visitId: v.id,
        userId,
        svc: it.svc,
        out: it.out,
      })),
    );
    if (allItems.length > 0) {
      await db.insert(visitItems).values(allItems);
    }
  }

  // Insert services
  const svcEntries = Object.entries(SERVICES);
  if (svcEntries.length > 0) {
    await db.insert(userServices).values(
      svcEntries.map(([code, info], i) => ({
        userId,
        code,
        label: info.label,
        sortOrder: i,
      })),
    );
  }

  // Insert areas
  if (AREAS.length > 0) {
    await db.insert(userAreas).values(
      AREAS.map((name, i) => ({
        userId,
        name,
        sortOrder: i,
      })),
    );
  }

  // Insert outcomes
  const outEntries = Object.entries(OUTCOMES);
  if (outEntries.length > 0) {
    await db.insert(userOutcomes).values(
      outEntries.map(([code, info], i) => ({
        userId,
        code,
        label: info.label,
        dm: info.dm,
        sale: info.sale,
        tone: info.tone,
        sortOrder: i,
      })),
    );
  }
}
