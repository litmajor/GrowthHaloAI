import { pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { sessions } from "./session-schema";
import { users } from "./schema";

export const sessionAudits = pgTable("session_audits", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").notNull().references(() => sessions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  event: text("event").notNull(), // e.g. 'login', 'logout', 'refresh'
  timestamp: timestamp("timestamp").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});
