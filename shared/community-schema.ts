import { pgTable, varchar, timestamp, text, jsonb } from "drizzle-orm/pg-core";
import { users } from "./schema";

export const communities = pgTable("communities", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communityMembers = pgTable("community_members", {
  id: varchar("id").primaryKey(),
  communityId: varchar("community_id").notNull().references(() => communities.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").default("member"), // 'member', 'admin', 'moderator'
  joinedAt: timestamp("joined_at").defaultNow(),
});
