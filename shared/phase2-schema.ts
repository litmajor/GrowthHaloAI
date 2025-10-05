
import { pgTable, text, serial, integer, timestamp, boolean, jsonb, real, vector } from "drizzle-orm/pg-core";
import { users } from "./schema";

// Beliefs tracking table
export const beliefs = pgTable("beliefs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  statement: text("statement").notNull(),
  category: text("category").notNull(), // 'value' | 'goal' | 'identity' | 'preference' | 'intention'
  confidence: real("confidence").notNull(), // 0-1 scale
  firstStated: timestamp("first_stated").defaultNow().notNull(),
  lastConfirmed: timestamp("last_confirmed").defaultNow().notNull(),
  contradictingActions: jsonb("contradicting_actions").$type<string[]>().default([]),
  embedding: vector("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Contradictions tracking table
export const contradictions = pgTable("contradictions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  beliefId: integer("belief_id").references(() => beliefs.id),
  belief: text("belief").notNull(),
  contradictingStatement: text("contradicting_statement").notNull(),
  contradictionType: text("contradiction_type").notNull(), // 'action-value' | 'goal-behavior' | 'identity-action' | 'cognitive-distortion'
  severity: text("severity").notNull(), // 'low' | 'medium' | 'high'
  explanation: text("explanation"),
  mentioned: boolean("mentioned").default(false),
  userReaction: text("user_reaction"), // 'positive' | 'neutral' | 'negative'
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  mentionedAt: timestamp("mentioned_at")
});

// Cognitive distortions tracking
export const cognitiveDistortions = pgTable("cognitive_distortions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  messageContent: text("message_content").notNull(),
  distortionType: text("distortion_type").notNull(),
  evidence: text("evidence").notNull(),
  alternativePerspective: text("alternative_perspective"),
  mentioned: boolean("mentioned").default(false),
  detectedAt: timestamp("detected_at").defaultNow().notNull()
});

// Recalled memories tracking
export const recalledMemories = pgTable("recalled_memories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  memoryId: integer("memory_id").notNull(),
  recallContext: text("recall_context").notNull(),
  recallTypes: jsonb("recall_types").$type<string[]>().notNull(), // ['semantic', 'temporal', 'emotional', 'thematic', 'phase']
  relevanceScore: real("relevance_score").notNull(),
  wasUsed: boolean("was_used").default(false),
  recalledAt: timestamp("recalled_at").defaultNow().notNull()
});

export type Belief = typeof beliefs.$inferSelect;
export type NewBelief = typeof beliefs.$inferInsert;
export type Contradiction = typeof contradictions.$inferSelect;
export type NewContradiction = typeof contradictions.$inferInsert;
export type CognitiveDistortion = typeof cognitiveDistortions.$inferSelect;
export type NewCognitiveDistortion = typeof cognitiveDistortions.$inferInsert;
export type RecalledMemory = typeof recalledMemories.$inferSelect;
export type NewRecalledMemory = typeof recalledMemories.$inferInsert;
