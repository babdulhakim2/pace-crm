import { pgTable, varchar, uuid, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const businesses = pgTable(
  "businesses",
  {
    id: varchar("id", { length: 50 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    type: varchar("type", { length: 100 }).notNull(),
    area: varchar("area", { length: 100 }).notNull(),
    contact: varchar("contact", { length: 200 }).notNull(),
    role: varchar("role", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("businesses_user_id_idx").on(t.userId, t.id),
    index("businesses_user_area_idx").on(t.userId, t.area),
  ],
);
