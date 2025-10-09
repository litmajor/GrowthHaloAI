
import { pgTable, varchar, text, timestamp, jsonb, integer, boolean, real } from "drizzle-orm/pg-core";
import { users } from "./schema";

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").notNull(), // 'superadmin', 'admin', 'analyst'
  permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const userAnalytics = pgTable("user_analytics", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalSessions: integer("total_sessions").default(0),
  totalMessages: integer("total_messages").default(0),
  avgSessionDuration: integer("avg_session_duration").default(0), // in seconds
  lastActive: timestamp("last_active"),
  growthScore: integer("growth_score").default(0),
  engagementLevel: varchar("engagement_level"), // 'low', 'medium', 'high'
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
});

export const digitalTwinProfiles = pgTable("digital_twin_profiles", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  personalityVector: jsonb("personality_vector").$type<number[]>(),
  valueSystem: jsonb("value_system").$type<Record<string, any>>(),
  growthPatterns: jsonb("growth_patterns").$type<Record<string, any>>(),
  emotionalSignature: jsonb("emotional_signature").$type<Record<string, any>>(),
  conversationStyle: jsonb("conversation_style").$type<Record<string, any>>(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const perceptionProfiles = pgTable("perception_profiles", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  summary: text("summary"),
  traits: jsonb("traits").$type<{
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  }>(),
  emotionStyle: text("emotion_style"),
  engagementPatterns: jsonb("engagement_patterns").$type<Record<string, any>>(),
  cognitiveProxy: jsonb("cognitive_proxy").$type<{
    estimate: number;
    ci: [number, number];
    confidence: number;
    basis: string[];
  }>(),
  keyPhrases: jsonb("key_phrases").$type<string[]>(),
  confidenceOverall: real("confidence_overall"),
  consentGiven: boolean("consent_given").default(false),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const linguisticFeatures = pgTable("linguistic_features", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  lexicalDiversity: real("lexical_diversity"),
  avgSentenceDepth: real("avg_sentence_depth"),
  rareWordRate: real("rare_word_rate"),
  responseTimeMedian: real("response_time_median"),
  topicEntropy: real("topic_entropy"),
  futureOrientationScore: real("future_orientation_score"),
  affectVariability: real("affect_variability"),
  vocabularyRichness: real("vocabulary_richness"),
  syntacticComplexity: real("syntactic_complexity"),
  extractedAt: timestamp("extracted_at").defaultNow().notNull(),
});

export const cognitiveAssessments = pgTable("cognitive_assessments", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  assessmentType: varchar("assessment_type").notNull(), // 'reasoning', 'vocabulary', 'analogies', 'digit-span'
  score: real("score"),
  duration: integer("duration"), // seconds
  responses: jsonb("responses").$type<Record<string, any>>(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const experiments = pgTable("experiments", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  hypothesis: text("hypothesis").notNull(),
  description: text("description"),
  status: varchar("status").notNull(), // 'draft', 'active', 'completed', 'archived'
  participantCount: integer("participant_count").default(0),
  metrics: jsonb("metrics").$type<Record<string, any>>(),
  results: jsonb("results").$type<Record<string, any>>(),
  createdBy: varchar("created_by").notNull().references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const experimentParticipants = pgTable("experiment_participants", {
  id: varchar("id").primaryKey(),
  experimentId: varchar("experiment_id").notNull().references(() => experiments.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  consentGiven: boolean("consent_given").default(false),
  consentedAt: timestamp("consented_at"),
  dataPoints: jsonb("data_points").$type<Record<string, any>>(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const systemMetrics = pgTable("system_metrics", {
  id: varchar("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  activeUsers: integer("active_users").default(0),
  totalConversations: integer("total_conversations").default(0),
  avgResponseTime: integer("avg_response_time").default(0), // in ms
  errorRate: integer("error_rate").default(0), // percentage
  metrics: jsonb("metrics").$type<Record<string, any>>().default({}),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey(),
  adminId: varchar("admin_id").notNull().references(() => adminUsers.id),
  action: text("action").notNull(),
  targetType: varchar("target_type"), // 'user', 'system', 'data', 'experiment'
  targetId: varchar("target_id"),
  details: jsonb("details").$type<Record<string, any>>(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
