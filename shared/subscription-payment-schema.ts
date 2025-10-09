import { pgTable, varchar, timestamp, text, real } from "drizzle-orm/pg-core";
import { subscriptions } from "./subscription-schema";
import { users } from "./schema";

export const subscriptionPayments = pgTable("subscription_payments", {
  id: varchar("id").primaryKey(),
  subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  currency: text("currency").default("USD"),
  paidAt: timestamp("paid_at").defaultNow(),
  status: text("status").default("completed"), // 'completed', 'failed', 'pending'
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
});
