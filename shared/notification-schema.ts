import { pgTable, varchar, timestamp, text, boolean, jsonb } from "drizzle-orm/pg-core";
import { users } from "./schema";

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // e.g. 'invite', 'message', 'event', 'system'
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata"),
});
