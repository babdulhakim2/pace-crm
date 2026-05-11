import { pgTable, varchar, uuid, timestamp, text, uniqueIndex, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const visits = pgTable(
  "visits",
  {
    id: varchar("id", { length: 50 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bizId: varchar("biz_id", { length: 50 }).notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    via: varchar("via", { length: 20 }).notNull(),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("visits_user_id_idx").on(t.userId, t.id),
    index("visits_user_biz_idx").on(t.userId, t.bizId),
    index("visits_user_date_idx").on(t.userId, t.date),
  ],
);
