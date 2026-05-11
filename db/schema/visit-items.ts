import { pgTable, serial, varchar, uuid, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const visitItems = pgTable(
  "visit_items",
  {
    id: serial("id").primaryKey(),
    visitId: varchar("visit_id", { length: 50 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    svc: varchar("svc", { length: 20 }).notNull(),
    out: varchar("out", { length: 20 }).notNull(),
  },
  (t) => [
    index("visit_items_visit_idx").on(t.visitId),
    index("visit_items_user_idx").on(t.userId),
  ],
);
