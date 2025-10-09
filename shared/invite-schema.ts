import { pgTable, varchar, timestamp, text, boolean } from "drizzle-orm/pg-core";
import { users } from "./schema";

export const invites = pgTable("invites", {
  id: varchar("id").primaryKey(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientEmail: text("recipient_email").notNull(),
  token: text("token").notNull(),
  status: text("status").default("pending"), // 'pending', 'accepted', 'declined', 'expired'
  sentAt: timestamp("sent_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  expiredAt: timestamp("expired_at"),
});
