
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// User Profile with Growth Journey Data
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  currentPhase: text("current_phase", { enum: ["expansion", "contraction", "renewal"] }).default("expansion"),
  phaseConfidence: integer("phase_confidence").default(75), // 1-100
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Phase History Tracking
export const phaseHistory = pgTable("phase_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  phase: text("phase", { enum: ["expansion", "contraction", "renewal"] }).notNull(),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  confidence: integer("confidence").default(75),
  triggers: jsonb("triggers"), // What caused the phase transition
  insights: jsonb("insights"), // AI-generated insights about the phase
});

// Energy Patterns Tracking
export const energyPatterns = pgTable("energy_patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow(),
  mentalEnergy: integer("mental_energy"), // 1-10
  physicalEnergy: integer("physical_energy"), // 1-10
  emotionalEnergy: integer("emotional_energy"), // 1-10
  spiritualEnergy: integer("spiritual_energy"), // 1-10
  overallMood: integer("overall_mood"), // 1-10
  notes: text("notes"),
});

// Journal Entries (encrypted)
export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(), // Will be encrypted
  aiInsights: jsonb("ai_insights"), // AI-generated insights
  detectedPhase: text("detected_phase", { enum: ["expansion", "contraction", "renewal"] }),
  sentiment: real("sentiment"), // -1 to 1
  tags: jsonb("tags"), // Array of strings
  createdAt: timestamp("created_at").defaultNow(),
});

// Milestone Tracking
export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  phase: text("phase", { enum: ["expansion", "contraction", "renewal"] }),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community Engagement
export const communityEngagement = pgTable("community_engagement", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  circleParticipation: jsonb("circle_participation"), // Array of circle IDs
  contributionScore: integer("contribution_score").default(0),
  supportNetworkSize: integer("support_network_size").default(0),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
});

export const userFollows = pgTable("user_follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Learning Progress
export const learningProgress = pgTable("learning_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  contentConsumption: jsonb("content_consumption"), // Articles read, time spent
  practiceCompletion: jsonb("practice_completion"), // Completed practices
  skillDevelopment: jsonb("skill_development"), // Skills and progress
  learningPath: text("learning_path"), // Current focus area
});

// AI Personalization Data
export const aiPersonalization = pgTable("ai_personalization", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  conversationHistory: jsonb("conversation_history"), // Summarized conversation patterns
  preferenceProfile: jsonb("preference_profile"), // Learned preferences
  growthPatterns: jsonb("growth_patterns"), // Identified patterns
  personalityInsights: jsonb("personality_insights"), // AI-detected personality traits
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Values and Compass Data
export const valuesData = pgTable("values_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  coreValues: jsonb("core_values"), // Ranked list of values
  valueEvolution: jsonb("value_evolution"), // How values change over time
  alignmentScore: real("alignment_score"), // How well actions align with values
  lastAssessment: timestamp("last_assessment").defaultNow(),
});

// Schemas for validation
export const insertUserProfileSchema = createInsertSchema(userProfiles);
export const insertJournalEntrySchema = createInsertSchema(journalEntries);
export const insertEnergyPatternSchema = createInsertSchema(energyPatterns);
export const insertCommunityEngagementSchema = createInsertSchema(communityEngagement).omit({
  id: true,
});
export const insertUserFollowSchema = createInsertSchema(userFollows).omit({
  id: true,
  createdAt: true,
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type PhaseHistory = typeof phaseHistory.$inferSelect;
export type EnergyPattern = typeof energyPatterns.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertCommunityEngagement = z.infer<typeof insertCommunityEngagementSchema>;
export type CommunityEngagement = typeof communityEngagement.$inferSelect;
export type InsertUserFollow = z.infer<typeof insertUserFollowSchema>;
export type UserFollow = typeof userFollows.$inferSelect;
