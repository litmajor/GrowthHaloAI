import { pgTable, varchar, text } from "drizzle-orm/pg-core";
import { users } from "./schema";

export const roles = pgTable("roles", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(), // e.g. 'admin', 'user', 'moderator', 'guest'
  description: text("description"),
});

export const userRoles = pgTable("user_roles", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  roleId: varchar("role_id").notNull().references(() => roles.id),
});
