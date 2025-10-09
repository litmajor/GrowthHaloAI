import { pgTable, varchar, timestamp, text, integer, real } from "drizzle-orm/pg-core";
import { users } from "./schema";

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  plan: text("plan").notNull(), // e.g. 'free', 'pro', 'enterprise'
  status: text("status").notNull().default('active'), // 'active', 'cancelled', 'expired'
  startedAt: timestamp("started_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  renewalDate: timestamp("renewal_date"),
  price: real("price"),
  features: text("features"), // optional, comma-separated or JSON
});
