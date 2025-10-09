import { pgTable, varchar, timestamp, text, boolean } from "drizzle-orm/pg-core";
import { users } from "./schema";

export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  key: text("key").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  revoked: boolean("revoked").default(false),
});
