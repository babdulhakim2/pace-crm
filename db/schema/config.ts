import { pgTable, serial, varchar, uuid, integer, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userServices = pgTable(
  "user_services",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 20 }).notNull(),
    label: varchar("label", { length: 200 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("user_services_user_code_idx").on(t.userId, t.code)],
);

export const userAreas = pgTable(
  "user_areas",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("user_areas_user_name_idx").on(t.userId, t.name)],
);

export const userOutcomes = pgTable(
  "user_outcomes",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 20 }).notNull(),
    label: varchar("label", { length: 200 }).notNull(),
    dm: boolean("dm").notNull().default(false),
    sale: boolean("sale").notNull().default(false),
    tone: varchar("tone", { length: 30 }).notNull().default("muted"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("user_outcomes_user_code_idx").on(t.userId, t.code)],
);

export const stageOverrides = pgTable(
  "stage_overrides",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bizId: varchar("biz_id", { length: 50 }).notNull(),
    stage: varchar("stage", { length: 20 }).notNull(),
  },
  (t) => [uniqueIndex("stage_overrides_user_biz_idx").on(t.userId, t.bizId)],
);
