
import OpenAI from 'openai';
import { db } from './db';
import { conversationTopics, emotionalStates } from '../shared/growth-schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { formatDistanceToNow } from 'date-fns';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

interface DormantConcept {
  id: number;
  userId: number;
  concept: string;
  category: 'value' | 'interest' | 'skill' | 'dream' | 'insight' | 'approach';
  lastMentioned: Date;
  mentionCount: number;
  emotionalValence: number;
  context: string[];
  potentialRelevance: number;
  connection?: string;
  reactivationPrompt?: string;
}

interface ConceptBridge {
  concept1: string;
  concept2: string;
  distance: number;
  potentialSynergy: string;
  novelInsight: string;
  applicability: string;
}

export class DormantConceptService {
  async identifyDormantConcepts(userId: number): Promise<DormantConcept[]> {
    // Get all topics that haven't been mentioned recently
    const themes = await db.select()
      .from(conversationTopics)
      .where(eq(conversationTopics.userId, userId))
      .orderBy(desc(conversationTopics.lastMentioned));

    const dormant: DormantConcept[] = [];
    const now = Date.now();

    for (const theme of themes) {
      const daysSinceLastMention = 
        (now - theme.lastMentioned.getTime()) / (1000 * 60 * 60 * 24);

      // If mentioned 3+ times but not in past 60 days, it's dormant
      if (theme.frequency >= 3 && daysSinceLastMention > 60) {
        const category = await this.categorizeConcept(theme.topic);
        const emotionalValence = await this.getAverageValence(userId, theme.topic);
        const context = await this.getContexts(userId, theme.topic);

        dormant.push({
          id: theme.id,
          userId,
          concept: theme.topic,
          category,
          lastMentioned: theme.lastMentioned,
          mentionCount: theme.frequency,
          emotionalValence,
          context,
          potentialRelevance: 0
        });
      }
    }

    return dormant;
  }

  private async categorizeConcept(concept: string): Promise<DormantConcept['category']> {
    try {
      const client = getOpenAIClient();
      
      const response = await client.chat.completions.create({
        model: "gpt-4",
        temperature: 0.3,
        messages: [{
          role: "system",
          content: `Categorize this concept into one of: value, interest, skill, dream, insight, approach
          
          Concept: ${concept}
          
          Return only the category word.`
        }]
      });

      const category = response.choices[0].message.content?.trim().toLowerCase();
      
      if (['value', 'interest', 'skill', 'dream', 'insight', 'approach'].includes(category || '')) {
        return category as DormantConcept['category'];
      }
      
      return 'interest';
    } catch (error) {
      console.error('Error categorizing concept:', error);
      return 'interest';
    }
  }

  private async getAverageValence(userId: number, topic: string): Promise<number> {
    try {
      const emotions = await db.select()
        .from(emotionalStates)
        .where(eq(emotionalStates.userId, userId))
        .limit(100);

      if (emotions.length === 0) return 0.5;

      const sum = emotions.reduce((acc, e) => acc + e.valence, 0);
      return sum / emotions.length;
    } catch (error) {
      console.error('Error getting average valence:', error);
      return 0.5;
    }
  }

  private async getContexts(userId: number, topic: string): Promise<string[]> {
    // Return some example contexts - in production, would extract from conversation history
    return ['working on projects', 'discussing future plans', 'reflecting on growth'];
  }

  async checkRelevance(
    dormantConcepts: DormantConcept[],
    currentMessage: string,
    currentContext: string
  ): Promise<DormantConcept[]> {
    try {
      const client = getOpenAIClient();

      const relevanceChecks = await Promise.all(
        dormantConcepts.map(async (concept) => {
          const analysis = await client.chat.completions.create({
            model: "gpt-4",
            temperature: 0.3,
            messages: [{
              role: "system",
              content: `This user once cared about this concept but hasn't mentioned it in months: "${concept.concept}"
              
              They used to talk about it in these contexts:
              ${concept.context.join(', ')}
              
              Current situation: ${currentContext}
              Current message: ${currentMessage}
              
              Could this dormant concept be relevant or useful now?
              
              Return JSON:
              {
                "isRelevant": boolean,
                "relevanceScore": number (0-1),
                "connection": string (how it relates),
                "reactivationPrompt": string (how to bring it up naturally)
              }`
            }]
          });

          const result = JSON.parse(analysis.choices[0].message.content || '{}');

          return {
            ...concept,
            potentialRelevance: result.relevanceScore,
            connection: result.connection,
            reactivationPrompt: result.reactivationPrompt
          };
        })
      );

      return relevanceChecks.filter(c => c.potentialRelevance > 0.7);
    } catch (error) {
      console.error('Error checking relevance:', error);
      return [];
    }
  }

  formatReactivation(concept: DormantConcept): string {
    const timeSince = formatDistanceToNow(concept.lastMentioned, { addSuffix: true });

    return `This reminds me of something you haven't talked about in a while...

${timeSince}, you were really interested in ${concept.concept}. 
You mentioned it ${concept.mentionCount} times when you were ${concept.context[0]}.

${concept.connection || ''}

I wonder if that perspective might be useful here? Has that interest faded, 
or could it be part of the solution you're looking for?`;
  }

  async bridgeDistantConcepts(
    userId: number,
    currentChallenge: string
  ): Promise<ConceptBridge[]> {
    try {
      const client = getOpenAIClient();

      // Get user's diverse topics
      const userTopics = await db.select()
        .from(conversationTopics)
        .where(eq(conversationTopics.userId, userId))
        .orderBy(desc(conversationTopics.frequency))
        .limit(20);

      if (userTopics.length < 2) return [];

      // Generate embeddings for topics
      const conceptEmbeddings = await Promise.all(
        userTopics.map(async (t) => ({
          concept: t.topic,
          embedding: await this.generateEmbedding(t.topic)
        }))
      );

      // Find distant pairs
      const distantPairs: Array<{ concept1: string; concept2: string; distance: number }> = [];
      
      for (let i = 0; i < conceptEmbeddings.length; i++) {
        for (let j = i + 1; j < conceptEmbeddings.length; j++) {
          const similarity = this.cosineSimilarity(
            conceptEmbeddings[i].embedding,
            conceptEmbeddings[j].embedding
          );
          const distance = 1 - similarity;

          if (distance > 0.7) {
            distantPairs.push({
              concept1: conceptEmbeddings[i].concept,
              concept2: conceptEmbeddings[j].concept,
              distance
            });
          }
        }
      }

      // Generate insights from top 3 combinations
      const bridges = await Promise.all(
        distantPairs.slice(0, 3).map(async (pair) => {
          const insight = await client.chat.completions.create({
            model: "gpt-4",
            temperature: 0.7,
            messages: [{
              role: "system",
              content: `Create a novel insight by bridging these two unrelated concepts from the user's life:
              
              Concept 1: ${pair.concept1}
              Concept 2: ${pair.concept2}
              
              Current challenge: ${currentChallenge}
              
              Generate a creative synthesis:
              - What unexpected connection exists between these concepts?
              - What novel insight emerges from combining them?
              - How could this insight help with the current challenge?
              
              Return JSON: {
                "potentialSynergy": string,
                "novelInsight": string,
                "applicability": string
              }`
            }]
          });

          const result = JSON.parse(insight.choices[0].message.content || '{}');

          return {
            ...pair,
            ...result
          };
        })
      );

      return bridges;
    } catch (error) {
      console.error('Error bridging concepts:', error);
      return [];
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const client = getOpenAIClient();
      
      const response = await client.embeddings.create({
        model: "text-embedding-ada-002",
        input: text
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return [];
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length === 0 || b.length === 0) return 0;
    
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

export const dormantConceptService = new DormantConceptService();
