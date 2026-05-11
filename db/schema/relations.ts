import { relations } from "drizzle-orm";
import { users } from "./users";
import { businesses } from "./businesses";
import { visits } from "./visits";
import { visitItems } from "./visit-items";
import { userServices, userAreas, userOutcomes, stageOverrides } from "./config";

export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
  visits: many(visits),
  visitItems: many(visitItems),
  services: many(userServices),
  areas: many(userAreas),
  outcomes: many(userOutcomes),
  stageOverrides: many(stageOverrides),
}));

export const businessesRelations = relations(businesses, ({ one }) => ({
  user: one(users, { fields: [businesses.userId], references: [users.id] }),
}));

export const visitsRelations = relations(visits, ({ one, many }) => ({
  user: one(users, { fields: [visits.userId], references: [users.id] }),
  items: many(visitItems),
}));

export const visitItemsRelations = relations(visitItems, ({ one }) => ({
  user: one(users, { fields: [visitItems.userId], references: [users.id] }),
  visit: one(visits, { fields: [visitItems.visitId], references: [visits.id] }),
}));

export const userServicesRelations = relations(userServices, ({ one }) => ({
  user: one(users, { fields: [userServices.userId], references: [users.id] }),
}));

export const userAreasRelations = relations(userAreas, ({ one }) => ({
  user: one(users, { fields: [userAreas.userId], references: [users.id] }),
}));

export const userOutcomesRelations = relations(userOutcomes, ({ one }) => ({
  user: one(users, { fields: [userOutcomes.userId], references: [users.id] }),
}));

export const stageOverridesRelations = relations(stageOverrides, ({ one }) => ({
  user: one(users, { fields: [stageOverrides.userId], references: [users.id] }),
}));
