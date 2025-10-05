
import { pgTable, text, timestamp, integer, real, jsonb, uuid } from 'drizzle-orm/pg-core';
import { users } from './schema';

export const causalRelationships = pgTable('causal_relationships', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  cause: text('cause').notNull(),
  effect: text('effect').notNull(),
  confidence: real('confidence').notNull().default(0.5),
  domain: text('domain').notNull(), // 'work' | 'relationships' | 'health' | 'creativity' | 'wellbeing'
  evidence: jsonb('evidence').$type<string[]>().notNull().default([]),
  firstObserved: timestamp('first_observed').notNull().defaultNow(),
  lastConfirmed: timestamp('last_confirmed').notNull().defaultNow(),
  observationCount: integer('observation_count').notNull().default(1),
  contextFactors: jsonb('context_factors').$type<string[]>(),
});

export const outcomeAnalyses = pgTable('outcome_analyses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  situation: text('situation').notNull(),
  approach: text('approach').notNull(),
  outcome: text('outcome').notNull(),
  outcomeQuality: text('outcome_quality').notNull(), // 'positive' | 'negative' | 'mixed' | 'neutral'
  contributingFactors: jsonb('contributing_factors').$type<string[]>().notNull().default([]),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  growthPhase: text('growth_phase'),
  domain: text('domain').notNull(),
});

export const domainAnalogies = pgTable('domain_analogies', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  sourceId: uuid('source_id').notNull(),
  sourceDomain: text('source_domain').notNull(),
  sourceSituation: text('source_situation').notNull(),
  sourceSolution: text('source_solution').notNull(),
  targetDomain: text('target_domain').notNull(),
  targetSituation: text('target_situation').notNull(),
  analogyStrength: real('analogy_strength').notNull(),
  transferability: real('transferability').notNull(),
  reasoning: text('reasoning').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});



// Hypothesis Formation Schema
export const userHypotheses = pgTable('user_hypotheses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  category: text('category').notNull(), // 'preference' | 'trigger' | 'strength' | 'growth_style' | 'communication'
  hypothesis: text('hypothesis').notNull(),
  confidence: real('confidence').notNull().default(0.5),
  evidence: text('evidence').array().notNull().default([]),
  counterEvidence: text('counter_evidence').array().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastTested: timestamp('last_tested').defaultNow().notNull(),
  testCount: integer('test_count').notNull().default(0),
  confirmed: boolean('confirmed').notNull().default(false),
});

export const personalityInsights = pgTable('personality_insights', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  dimension: text('dimension').notNull(),
  profile: text('profile').notNull(),
  confidence: real('confidence').notNull(),
  implications: text('implications').array().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const predictiveInsights = pgTable('predictive_insights', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  situation: text('situation').notNull(),
  plannedAction: text('planned_action').notNull(),
  likelyOutcome: text('likely_outcome').notNull(),
  confidence: real('confidence').notNull(),
  basedOn: text('based_on').array().notNull(),
  preventativeActions: text('preventative_actions').array(),
  alternativeApproaches: text('alternative_approaches').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type UserHypothesis = typeof userHypotheses.$inferSelect;
export type InsertUserHypothesis = typeof userHypotheses.$inferInsert;
export type PersonalityInsight = typeof personalityInsights.$inferSelect;
export type InsertPersonalityInsight = typeof personalityInsights.$inferInsert;
export type PredictiveInsight = typeof predictiveInsights.$inferSelect;
export type InsertPredictiveInsight = typeof predictiveInsights.$inferInsert;
