
import { pgTable, varchar, text, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
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
  targetType: varchar("target_type"), // 'user', 'system', 'data'
  targetId: varchar("target_id"),
  details: jsonb("details").$type<Record<string, any>>(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
