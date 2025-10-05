
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

// Goal Management & Progress Intelligence
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category", { 
    enum: ["career", "health", "learning", "relationships", "financial", "personal", "spiritual", "creative"]
  }).notNull(),
  priority: integer("priority").default(5), // 1-10 scale
  status: text("status", { 
    enum: ["active", "completed", "paused", "cancelled"]
  }).default("active"),
  progress: integer("progress").default(0), // 0-100 percentage
  detectedFromConversation: boolean("detected_from_conversation").default(true),
  emotionalInvestment: integer("emotional_investment").default(5), // 1-10 scale
  urgency: integer("urgency").default(5), // 1-10 scale
  targetDate: timestamp("target_date"),
  completedAt: timestamp("completed_at"),
  lastMentioned: timestamp("last_mentioned").defaultNow(),
  aiInsights: jsonb("ai_insights"), // AI-generated insights about the goal
  conversationContext: jsonb("conversation_context"), // Where it was first detected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Goal Progress Tracking (conversation-based updates)
export const goalProgress = pgTable("goal_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").notNull().references(() => goals.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  progressPercentage: integer("progress_percentage").notNull(), // 0-100
  detectedActivity: text("detected_activity"), // What activity was mentioned
  conversationExcerpt: text("conversation_excerpt"), // What the user said
  aiConfidence: real("ai_confidence").default(0.8), // How confident AI is about this progress
  momentum: text("momentum", { enum: ["accelerating", "steady", "slowing", "stalled"] }).default("steady"),
  obstacles: jsonb("obstacles"), // Detected obstacles
  createdAt: timestamp("created_at").defaultNow(),
});

// Goal Relationships and Influence Mapping
export const goalRelationships = pgTable("goal_relationships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  primaryGoalId: varchar("primary_goal_id").notNull().references(() => goals.id),
  relatedGoalId: varchar("related_goal_id").notNull().references(() => goals.id),
  relationshipType: text("relationship_type", { 
    enum: ["supports", "conflicts", "depends_on", "enables", "competes_with"]
  }).notNull(),
  strength: real("strength").default(0.5), // 0-1 how strong the relationship is
  aiDetected: boolean("ai_detected").default(true),
  userConfirmed: boolean("user_confirmed").default(false),
  impact: text("impact"), // Description of how they influence each other
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversation Topic to Goal Linking
export const conversationGoalLinks = pgTable("conversation_goal_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  goalId: varchar("goal_id").notNull().references(() => goals.id),
  conversationSnippet: text("conversation_snippet").notNull(),
  linkType: text("link_type", { 
    enum: ["progress_update", "obstacle_mention", "motivation_change", "strategy_discussion", "completion"]
  }).notNull(),
  sentiment: real("sentiment"), // -1 to 1
  confidence: real("confidence").default(0.8),
  extractedInsight: text("extracted_insight"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced Milestone Tracking (builds on existing milestones table)
export const goalMilestones = pgTable("goal_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").notNull().references(() => goals.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  targetDate: timestamp("target_date"),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  celebrationSuggestion: text("celebration_suggestion"), // AI-suggested way to celebrate
  progressImpact: integer("progress_impact").default(10), // How much this milestone contributes to overall goal (%)
  autoDetected: boolean("auto_detected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
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

// Goal management schemas
export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertGoalProgressSchema = createInsertSchema(goalProgress).omit({
  id: true,
  createdAt: true,
});
export const insertGoalRelationshipSchema = createInsertSchema(goalRelationships).omit({
  id: true,
  createdAt: true,
});
export const insertConversationGoalLinkSchema = createInsertSchema(conversationGoalLinks).omit({
  id: true,
  createdAt: true,
});
export const insertGoalMilestoneSchema = createInsertSchema(goalMilestones).omit({
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

// Goal management types
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type GoalProgress = typeof goalProgress.$inferSelect;
export type InsertGoalProgress = z.infer<typeof insertGoalProgressSchema>;
export type GoalRelationship = typeof goalRelationships.$inferSelect;
export type InsertGoalRelationship = z.infer<typeof insertGoalRelationshipSchema>;
export type ConversationGoalLink = typeof conversationGoalLinks.$inferSelect;
export type InsertConversationGoalLink = z.infer<typeof insertConversationGoalLinkSchema>;
export type GoalMilestone = typeof goalMilestones.$inferSelect;
export type InsertGoalMilestone = z.infer<typeof insertGoalMilestoneSchema>;

// Memory System Tables
export const memories = pgTable("memories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  conversationId: varchar("conversation_id"),
  content: text("content").notNull(),
  memoryType: text("memory_type", { 
    enum: ["insight", "goal", "value", "pattern", "emotion"] 
  }).notNull(),
  emotionalValence: real("emotional_valence").default(0), // -1 to 1
  importance: real("importance").default(0.5), // 0 to 1
  tags: jsonb("tags").default([]), // Array of strings
  relatedMemoryIds: jsonb("related_memory_ids").default([]), // Array of memory IDs
  embedding: jsonb("embedding"), // Vector embedding for semantic search
  createdAt: timestamp("created_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  accessCount: integer("access_count").default(0),
});

export const conversationThemes = pgTable("conversation_themes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  theme: text("theme").notNull(),
  category: text("category", {
    enum: ["work", "relationships", "health", "personal_growth", "creativity", "other"]
  }).default("other"),
  firstMentioned: timestamp("first_mentioned").defaultNow(),
  lastMentioned: timestamp("last_mentioned").defaultNow(),
  frequency: integer("frequency").default(1),
  relatedMemoryIds: jsonb("related_memory_ids").default([]),
  emotionalTrend: text("emotional_trend", { 
    enum: ["improving", "declining", "stable"] 
  }).default("stable"),
  averageValence: real("average_valence").default(0),
});

// Emotional Tracking Tables
export const emotionalDataPoints = pgTable("emotional_data_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow(),
  valence: real("valence").notNull(), // -1 to 1
  arousal: real("arousal").notNull(), // 0 to 1
  dominantEmotion: text("dominant_emotion").notNull(),
  secondaryEmotions: jsonb("secondary_emotions").default([]),
  intensity: real("intensity").default(0.5), // 0 to 1
  context: text("context"),
  growthPhase: text("growth_phase", { 
    enum: ["expansion", "contraction", "renewal"] 
  }),
  journalEntryId: varchar("journal_entry_id").references(() => journalEntries.id),
  conversationId: varchar("conversation_id"),
});

export const emotionalPatterns = pgTable("emotional_patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  patternType: text("pattern_type", { 
    enum: ["daily_cycle", "weekly_cycle", "trigger_based", "phase_transition"] 
  }).notNull(),
  description: text("description").notNull(),
  confidence: real("confidence").default(0.5),
  firstDetected: timestamp("first_detected").defaultNow(),
  lastConfirmed: timestamp("last_confirmed").defaultNow(),
  triggerFactors: jsonb("trigger_factors").default([]),
  frequency: integer("frequency").default(1),
});

// Memory schemas
export const insertMemorySchema = createInsertSchema(memories).omit({
  id: true,
  createdAt: true,
  lastAccessedAt: true,
  accessCount: true,
});

export const insertConversationThemeSchema = createInsertSchema(conversationThemes).omit({
  id: true,
  firstMentioned: true,
  lastMentioned: true,
});

export const insertEmotionalDataPointSchema = createInsertSchema(emotionalDataPoints).omit({
  id: true,
  timestamp: true,
});

export const insertEmotionalPatternSchema = createInsertSchema(emotionalPatterns).omit({
  id: true,
  firstDetected: true,
  lastConfirmed: true,
});

// Memory types
export type Memory = typeof memories.$inferSelect;
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type ConversationTheme = typeof conversationThemes.$inferSelect;
export type InsertConversationTheme = z.infer<typeof insertConversationThemeSchema>;
export type EmotionalDataPoint = typeof emotionalDataPoints.$inferSelect;
export type InsertEmotionalDataPoint = z.infer<typeof insertEmotionalDataPointSchema>;
export type EmotionalPattern = typeof emotionalPatterns.$inferSelect;
export type InsertEmotionalPattern = z.infer<typeof insertEmotionalPatternSchema>;
