
import OpenAI from "openai";
import { db } from "./db";
import { memories, conversationThemes, emotionalDataPoints } from "../shared/growth-schema";
import type { Memory, EmotionalDataPoint, ConversationTheme } from '@shared/growth-schema';
import { eq, desc, sql, and, gte } from "drizzle-orm";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://growth-halo.replit.app',
    'X-Title': 'Growth Halo AI'
  }
});

interface MemoryExtractionResult {
  memories: Array<{
    content: string;
    memoryType: 'insight' | 'goal' | 'value' | 'pattern' | 'emotion';
    emotionalValence: number;
    importance: number;
    tags: string[];
  }>;
  themes: string[];
  emotionalAnalysis: {
    valence: number;
    arousal: number;
    dominantEmotion: string;
    secondaryEmotions: string[];
    intensity: number;
  };
}

export class EnhancedMemoryService {
  // Extract memories, themes, and emotions from a message
  async extractFromMessage(
    userId: string,
    conversationId: string,
    message: string
  ): Promise<MemoryExtractionResult> {
    try {
      const extraction = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{
          role: "system",
          content: `Extract important memories and analyze emotions from this message. Return ONLY valid JSON with this exact structure:
{
  "memories": [
    {
      "content": "brief summary of the memory",
      "memoryType": "insight" | "goal" | "value" | "pattern" | "emotion",
      "emotionalValence": number between -1 and 1,
      "importance": number between 0 and 1,
      "tags": ["tag1", "tag2"]
    }
  ],
  "themes": ["theme1", "theme2"],
  "emotionalAnalysis": {
    "valence": number between -1 and 1,
    "arousal": number between 0 and 1,
    "dominantEmotion": "emotion name",
    "secondaryEmotions": ["emotion1", "emotion2"],
    "intensity": number between 0 and 1
  }
}

Extract memories that are:
- Personal insights or realizations
- Goals or intentions mentioned
- Values expressed or referenced
- Behavioral patterns described
- Significant emotional states

Only extract truly meaningful content, not casual statements.`
        }, {
          role: "user",
          content: message
        }],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(extraction.choices[0].message.content || "{}");
      
      // Store memories
      if (result.memories && result.memories.length > 0) {
        for (const memory of result.memories) {
          const embedding = await this.generateEmbedding(memory.content);
          
          await db.insert(memories).values({
            userId,
            conversationId,
            content: memory.content,
            memoryType: memory.memoryType,
            emotionalValence: memory.emotionalValence,
            importance: memory.importance,
            tags: memory.tags || [],
            embedding: embedding,
            relatedMemoryIds: [],
          });
        }
      }

      // Store themes
      if (result.themes && result.themes.length > 0) {
        await this.updateThemes(userId, result.themes);
      }

      // Store emotional data point
      if (result.emotionalAnalysis) {
        await db.insert(emotionalDataPoints).values({
          userId,
          conversationId,
          valence: result.emotionalAnalysis.valence,
          arousal: result.emotionalAnalysis.arousal,
          dominantEmotion: result.emotionalAnalysis.dominantEmotion,
          secondaryEmotions: result.emotionalAnalysis.secondaryEmotions || [],
          intensity: result.emotionalAnalysis.intensity,
          context: message.substring(0, 200),
        });
      }

      return result;
    } catch (error) {
      console.error("Error extracting memories:", error);
      return {
        memories: [],
        themes: [],
        emotionalAnalysis: {
          valence: 0,
          arousal: 0.5,
          dominantEmotion: "neutral",
          secondaryEmotions: [],
          intensity: 0.5
        }
      };
    }
  }

  // Find relevant memories using semantic search
  async findRelevantMemories(
    userId: string,
    currentContext: string,
    limit: number = 5
  ): Promise<Memory[]> {
    try {
      const contextEmbedding = await this.generateEmbedding(currentContext);
      
      // Get all memories for the user
      const userMemories = await db
        .select()
        .from(memories)
        .where(eq(memories.userId, userId))
        .orderBy(desc(memories.createdAt))
        .limit(100); // Get recent memories to search through

      // Calculate relevance scores
      const scoredMemories = userMemories.map(memory => {
        const embedding = memory.embedding as number[] || [];
        const similarity = this.cosineSimilarity(contextEmbedding, embedding);
        
        // Calculate days since creation
  const createdAtMs = memory.createdAt ? memory.createdAt.getTime() : Date.now();
  const daysSinceCreated = (Date.now() - createdAtMs) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.pow(1 / (1 + Math.log(daysSinceCreated + 1)), 0.5);
        
        // Combined relevance score
        const relevanceScore = 
          (memory.importance || 0.5) * 0.4 +
          similarity * 0.4 +
          recencyScore * 0.2;

        return {
          ...memory,
          relevanceScore,
          similarity
        };
      });

      // Sort by relevance and return top results
      return scoredMemories
        .filter(m => m.similarity > 0.5) // Only reasonably similar memories
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    } catch (error) {
      console.error("Error finding relevant memories:", error);
      return [];
    }
  }

  // Update conversation themes
  private async updateThemes(userId: string, newThemes: string[]): Promise<void> {
    for (const theme of newThemes) {
      const existing = await db
        .select()
        .from(conversationThemes)
        .where(and(
          eq(conversationThemes.userId, userId),
          eq(conversationThemes.theme, theme)
        ))
        .limit(1);

      const first = existing[0];
      if (first) {
        // Update existing theme (guard possible nulls)
        const freq = (first.frequency ?? 0) + 1;
        await db
          .update(conversationThemes)
          .set({
            frequency: freq,
            lastMentioned: new Date(),
          })
          .where(eq(conversationThemes.id, first.id));
      } else {
        // Create new theme
        await db.insert(conversationThemes).values({
          userId,
          theme,
          frequency: 1,
        });
      }
    }
  }

  // Generate embedding for semantic search
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error("Error generating embedding:", error);
      return [];
    }
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length === 0 || b.length === 0) return 0;
    
    const dotProduct = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Get emotional trajectory over time
  async getEmotionalTrajectory(
    userId: string,
    days: number = 30
  ): Promise<EmotionalDataPoint[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return await db
      .select()
      .from(emotionalDataPoints)
      .where(and(
        eq(emotionalDataPoints.userId, userId),
        gte(emotionalDataPoints.timestamp, startDate)
      ))
      .orderBy(emotionalDataPoints.timestamp);
  }

  // Get user's conversation themes
  async getUserThemes(userId: string): Promise<ConversationTheme[]> {
    return await db
      .select()
      .from(conversationThemes)
      .where(eq(conversationThemes.userId, userId))
      .orderBy(desc(conversationThemes.frequency))
      .limit(20);
  }
}

export const enhancedMemoryService = new EnhancedMemoryService();
