import { pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { users } from "./schema";

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  data: text("data"), // optional session data (e.g. JWT, metadata)
});
