
import { pgTable, serial, text, integer, timestamp, jsonb, real } from 'drizzle-orm/pg-core';

export const wisdomEntries = pgTable('wisdom_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  insight: text('insight').notNull(),
  category: text('category').notNull(), // 'self-knowledge' | 'relationship-wisdom' | 'life-philosophy' | etc.
  dateRealized: timestamp('date_realized').notNull().defaultNow(),
  sourceConversationId: text('source_conversation_id'),
  contextWhenLearned: text('context_when_learned'),
  timesReferenced: integer('times_referenced').notNull().default(0),
  applicability: jsonb('applicability').$type<string[]>().notNull().default([]),
  relatedWisdom: jsonb('related_wisdom').$type<number[]>().notNull().default([]),
  confidence: real('confidence').notNull().default(0.7),
  significance: text('significance').notNull().default('moderate'), // 'minor' | 'moderate' | 'major'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const wisdomCollections = pgTable('wisdom_collections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  theme: text('theme').notNull(),
  evolution: text('evolution'),
  entryIds: jsonb('entry_ids').$type<number[]>().notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});
