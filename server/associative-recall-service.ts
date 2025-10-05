
import { db } from './db';
import { memories, conversations } from '../shared/growth-schema';
import { recalledMemories } from '../shared/phase2-schema';
import { eq, sql, and, gte, desc } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface RecallResult {
  memory: any;
  relevanceScore: number;
  recallTypes: string[];
}

interface Message {
  role: string;
  content: string;
  timestamp?: Date;
}

export class AssociativeRecallService {
  
  async recall(
    userId: number,
    currentMessage: string,
    conversationHistory: Message[]
  ): Promise<RecallResult[]> {
    
    // 1. Semantic similarity search
    const semanticallyRelated = await this.findSimilarMemories(userId, currentMessage);

    // 2. Temporal patterns
    const temporallyRelated = await this.findTemporalMatches(userId, new Date());

    // 3. Emotional resonance
    const currentEmotion = await this.analyzeEmotionQuick(currentMessage);
    const emotionallyRelated = await this.findEmotionalMatches(userId, currentEmotion);

    // 4. Theme/topic overlap
    const currentThemes = await this.extractThemesQuick(currentMessage);
    const thematicallyRelated = await this.findThemeMatches(userId, currentThemes);

    // 5. Growth phase alignment
    const currentPhase = await this.detectGrowthPhaseQuick(conversationHistory);
    const phaseRelated = await this.findPhaseMatches(userId, currentPhase);

    // Combine and rank by relevance
    const allRecalls = this.combineAndRank([
      ...semanticallyRelated,
      ...temporallyRelated,
      ...emotionallyRelated,
      ...thematicallyRelated,
      ...phaseRelated
    ]);

    // Track recalls for analytics
    await this.trackRecalls(userId, allRecalls.slice(0, 3), currentMessage);

    // Return top 3 most relevant
    return allRecalls.slice(0, 3);
  }

  private async findSimilarMemories(
    userId: number,
    query: string
  ): Promise<RecallResult[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    
    const results = await db.execute(sql`
      SELECT 
        m.*,
        1 - (m.embedding <=> ${queryEmbedding}::vector) as similarity,
        EXTRACT(EPOCH FROM (NOW() - m.created_at)) / 86400 as days_ago
      FROM memories m
      WHERE m.user_id = ${userId}
        AND 1 - (m.embedding <=> ${queryEmbedding}::vector) > 0.7
      ORDER BY similarity DESC
      LIMIT 10
    `);

    return results.rows.map((r: any) => ({
      memory: r,
      relevanceScore: r.similarity * (1 / (1 + Math.log(r.days_ago + 1))),
      recallTypes: ['semantic']
    }));
  }

  private async findTemporalMatches(
    userId: number,
    currentTime: Date
  ): Promise<RecallResult[]> {
    const hour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay();
    
    // Find memories from similar times
    const results = await db.select()
      .from(memories)
      .where(
        and(
          eq(memories.userId, userId),
          sql`EXTRACT(HOUR FROM ${memories.createdAt}) BETWEEN ${hour - 2} AND ${hour + 2}`,
          sql`EXTRACT(DOW FROM ${memories.createdAt}) = ${dayOfWeek}`
        )
      )
      .orderBy(desc(memories.createdAt))
      .limit(5);

    return results.map(memory => ({
      memory,
      relevanceScore: 0.6,
      recallTypes: ['temporal']
    }));
  }

  private async findEmotionalMatches(
    userId: number,
    currentEmotion: { valence: number; arousal: number }
  ): Promise<RecallResult[]> {
    const results = await db.execute(sql`
      SELECT *,
        ABS(CAST(emotional_context->>'valence' AS FLOAT) - ${currentEmotion.valence}) +
        ABS(CAST(emotional_context->>'arousal' AS FLOAT) - ${currentEmotion.arousal}) as emotion_distance
      FROM memories
      WHERE user_id = ${userId}
        AND emotional_context IS NOT NULL
      ORDER BY emotion_distance ASC
      LIMIT 5
    `);

    return results.rows.map((memory: any) => ({
      memory,
      relevanceScore: 1 / (1 + memory.emotion_distance),
      recallTypes: ['emotional']
    }));
  }

  private async findThemeMatches(
    userId: number,
    currentThemes: string[]
  ): Promise<RecallResult[]> {
    if (currentThemes.length === 0) return [];

    const results = await db.execute(sql`
      SELECT *,
        (SELECT COUNT(*) FROM jsonb_array_elements_text(themes) theme
         WHERE theme = ANY(${currentThemes})) as theme_overlap
      FROM memories
      WHERE user_id = ${userId}
        AND themes IS NOT NULL
        AND (SELECT COUNT(*) FROM jsonb_array_elements_text(themes) theme
             WHERE theme = ANY(${currentThemes})) > 0
      ORDER BY theme_overlap DESC
      LIMIT 5
    `);

    return results.rows.map((memory: any) => ({
      memory,
      relevanceScore: memory.theme_overlap / currentThemes.length,
      recallTypes: ['thematic']
    }));
  }

  private async findPhaseMatches(
    userId: number,
    currentPhase: string
  ): Promise<RecallResult[]> {
    const results = await db.select()
      .from(memories)
      .where(
        and(
          eq(memories.userId, userId),
          sql`growth_phase_context = ${currentPhase}`
        )
      )
      .orderBy(desc(memories.createdAt))
      .limit(5);

    return results.map(memory => ({
      memory,
      relevanceScore: 0.7,
      recallTypes: ['phase']
    }));
  }

  private combineAndRank(recalls: RecallResult[]): RecallResult[] {
    const memoryMap = new Map<number, RecallResult>();
    
    for (const recall of recalls) {
      const existing = memoryMap.get(recall.memory.id);
      if (existing) {
        // Boost score for multi-pathway recalls
        existing.relevanceScore += recall.relevanceScore * 0.5;
        existing.recallTypes.push(...recall.recallTypes);
      } else {
        memoryMap.set(recall.memory.id, {
          ...recall,
          recallTypes: [...recall.recallTypes]
        });
      }
    }

    return Array.from(memoryMap.values())
      .sort((a, b) => {
        const aBoost = a.recallTypes.length > 1 ? 1.5 : 1;
        const bBoost = b.recallTypes.length > 1 ? 1.5 : 1;
        return (b.relevanceScore * bBoost) - (a.relevanceScore * aBoost);
      });
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text
    });
    return response.data[0].embedding;
  }

  private async analyzeEmotionQuick(message: string): Promise<{ valence: number; arousal: number }> {
    // Simple emotion detection - could be enhanced
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "Analyze emotion. Return JSON: { valence: -1 to 1, arousal: 0 to 1 }"
      }, {
        role: "user",
        content: message
      }]
    });

    return JSON.parse(response.choices[0].message.content || '{"valence":0,"arousal":0}');
  }

  private async extractThemesQuick(message: string): Promise<string[]> {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "Extract 1-3 key themes. Return JSON array of strings."
      }, {
        role: "user",
        content: message
      }]
    });

    return JSON.parse(response.choices[0].message.content || '[]');
  }

  private async detectGrowthPhaseQuick(history: Message[]): Promise<string> {
    if (history.length === 0) return 'expansion';
    
    const recentMessages = history.slice(-5).map(m => m.content).join(' ');
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "Detect growth phase: expansion, contraction, or renewal. Return only the phase name."
      }, {
        role: "user",
        content: recentMessages
      }]
    });

    return response.choices[0].message.content?.toLowerCase() || 'expansion';
  }

  private async trackRecalls(userId: number, recalls: RecallResult[], context: string): Promise<void> {
    for (const recall of recalls) {
      await db.insert(recalledMemories).values({
        userId,
        memoryId: recall.memory.id,
        recallContext: context,
        recallTypes: recall.recallTypes,
        relevanceScore: recall.relevanceScore,
        wasUsed: false
      });
    }
  }

  formatRecallsForContext(recalls: RecallResult[]): string {
    if (recalls.length === 0) return '';

    return `
Relevant memories to consider:
${recalls.map((r, i) => `
${i + 1}. From ${new Date(r.memory.created_at).toLocaleDateString()} (${r.memory.memory_type}):
   "${r.memory.content}"
   [Recalled via: ${r.recallTypes.join(', ')}]
`).join('\n')}

Instructions: Naturally reference these memories if relevant. Don't force it.
Use phrases like:
- "I remember when you mentioned..."
- "This reminds me of what you shared about..."
- "You've explored this before when you were..."
`;
  }
}

export const associativeRecallService = new AssociativeRecallService();
