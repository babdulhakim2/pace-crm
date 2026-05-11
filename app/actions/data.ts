"use server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  businesses as bizTable,
  visits as visitTable,
  visitItems,
  userServices,
  userAreas,
  userOutcomes,
  stageOverrides as soTable,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth/guards";
import { seedUserData } from "@/db/seed";
import type { Business, Visit } from "@/lib/data";

export interface PaceServerData {
  userName: string;
  outcomes: Record<string, { label: string; dm: boolean; sale: boolean; tone: string }>;
  services: Record<string, { label: string }>;
  areas: string[];
  businesses: Business[];
  visits: Visit[];
  stageOverrides: Record<string, string>;
}

export async function fetchUserData(userId: string): Promise<PaceServerData> {
  const [
    userRows,
    bizRows,
    visitRows,
    itemRows,
    svcRows,
    areaRows,
    outRows,
    soRows,
  ] = await Promise.all([
    db.select({ displayName: users.displayName }).from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(bizTable).where(eq(bizTable.userId, userId)),
    db.select().from(visitTable).where(eq(visitTable.userId, userId)),
    db.select().from(visitItems).where(eq(visitItems.userId, userId)),
    db.select().from(userServices).where(eq(userServices.userId, userId)),
    db.select().from(userAreas).where(eq(userAreas.userId, userId)),
    db.select().from(userOutcomes).where(eq(userOutcomes.userId, userId)),
    db.select().from(soTable).where(eq(soTable.userId, userId)),
  ]);

  const userName = userRows[0]?.displayName ?? "";

  // Reconstruct services as Record
  const services: Record<string, { label: string }> = {};
  for (const s of svcRows.sort((a, b) => a.sortOrder - b.sortOrder)) {
    services[s.code] = { label: s.label };
  }

  // Reconstruct areas as string[]
  const areas = areaRows
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((a) => a.name);

  // Reconstruct outcomes as Record
  const outcomes: Record<string, { label: string; dm: boolean; sale: boolean; tone: string }> = {};
  for (const o of outRows.sort((a, b) => a.sortOrder - b.sortOrder)) {
    outcomes[o.code] = { label: o.label, dm: o.dm, sale: o.sale, tone: o.tone };
  }

  // Reconstruct businesses
  const businessesList: Business[] = bizRows.map((b) => ({
    id: b.id,
    name: b.name,
    type: b.type,
    area: b.area,
    contact: b.contact,
    role: b.role,
  }));

  // Group visit items by visitId
  const itemsByVisit: Record<string, { svc: string; out: string }[]> = {};
  for (const it of itemRows) {
    if (!itemsByVisit[it.visitId]) itemsByVisit[it.visitId] = [];
    itemsByVisit[it.visitId].push({ svc: it.svc, out: it.out });
  }

  // Reconstruct visits with items
  const visitsList: Visit[] = visitRows.map((v) => ({
    id: v.id,
    bizId: v.bizId,
    date: v.date.toISOString(),
    via: v.via,
    notes: v.notes,
    items: itemsByVisit[v.id] || [],
  }));

  // Reconstruct stage overrides
  const stageOverrides: Record<string, string> = {};
  for (const so of soRows) {
    stageOverrides[so.bizId] = so.stage;
  }

  return {
    userName,
    outcomes,
    services,
    areas,
    businesses: businessesList,
    visits: visitsList,
    stageOverrides,
  };
}

export async function resetToDemoAction(): Promise<PaceServerData> {
  const { userId } = await requireAuth();

  // Delete all user data
  await Promise.all([
    db.delete(visitItems).where(eq(visitItems.userId, userId)),
    db.delete(soTable).where(eq(soTable.userId, userId)),
  ]);
  await Promise.all([
    db.delete(visitTable).where(eq(visitTable.userId, userId)),
    db.delete(bizTable).where(eq(bizTable.userId, userId)),
    db.delete(userServices).where(eq(userServices.userId, userId)),
    db.delete(userAreas).where(eq(userAreas.userId, userId)),
    db.delete(userOutcomes).where(eq(userOutcomes.userId, userId)),
  ]);

  // Re-seed
  await seedUserData(userId);

  return fetchUserData(userId);
}

export async function clearAllAction(): Promise<PaceServerData> {
  const { userId } = await requireAuth();

  // Delete all user data
  await Promise.all([
    db.delete(visitItems).where(eq(visitItems.userId, userId)),
    db.delete(soTable).where(eq(soTable.userId, userId)),
  ]);
  await Promise.all([
    db.delete(visitTable).where(eq(visitTable.userId, userId)),
    db.delete(bizTable).where(eq(bizTable.userId, userId)),
    db.delete(userServices).where(eq(userServices.userId, userId)),
    db.delete(userAreas).where(eq(userAreas.userId, userId)),
    db.delete(userOutcomes).where(eq(userOutcomes.userId, userId)),
  ]);

  return fetchUserData(userId);
}
