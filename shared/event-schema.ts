import { pgTable, varchar, timestamp, text, jsonb } from "drizzle-orm/pg-core";
import { users } from "./schema";
import { communities } from "./community-schema";

export const events = pgTable("events", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  location: text("location"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  communityId: varchar("community_id").references(() => communities.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventParticipants = pgTable("event_participants", {
  id: varchar("id").primaryKey(),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rsvpStatus: text("rsvp_status").default("pending"), // 'pending', 'accepted', 'declined'
  joinedAt: timestamp("joined_at").defaultNow(),
});
