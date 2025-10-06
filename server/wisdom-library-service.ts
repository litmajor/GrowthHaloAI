
import OpenAI from 'openai';
import { db } from './db';
import { wisdomEntries, wisdomCollections } from '../shared/phase4-wisdom-schema';
import { eq, desc, and } from 'drizzle-orm';
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

interface WisdomEntry {
  id: number;
  userId: string | number;
  insight: string;
  category: string;
  dateRealized: Date;
  sourceConversationId: string | null;
  contextWhenLearned: string | null;
  timesReferenced: number;
  applicability: string[];
  relatedWisdom: number[];
  confidence: number;
  significance: string;
}

interface WisdomCollection {
  theme: string;
  entries: WisdomEntry[];
  evolution: string;
}

interface WisdomBook {
  collections: WisdomCollection[];
  mostReferenced: WisdomEntry[];
  recentBreakthroughs: WisdomEntry[];
  totalWisdom: number;
}

export class WisdomLibraryService {
  async extractWisdom(
    userId: string | number,
    conversationId: string,
    message: string
  ): Promise<WisdomEntry | null> {
    const uidNum = Number(userId);
    try {
      const client = getOpenAIClient();

      const analysis = await client.chat.completions.create({
        model: "gpt-4",
        temperature: 0.3,
        messages: [{
          role: "system",
          content: `Identify if this message contains personal wisdom—a hard-won insight or realization worth remembering.

Signs of wisdom:
- "I'm realizing..."
- "What I've learned is..."
- "I think the truth is..."
- Epiphany or breakthrough statements
- Deep self-knowledge
- Counter-intuitive insights
- Lessons from experience

Not wisdom:
- Casual observations
- External facts
- Temporary feelings
- Surface-level thoughts

Message: "${message}"

If wisdom detected, return JSON:
{
  "hasWisdom": true,
  "insight": "distilled wisdom statement",
  "category": "self-knowledge" | "relationship-wisdom" | "life-philosophy" | "practical-strategy" | "creative-principle" | "emotional-truth",
  "contextWhenLearned": "brief context",
  "applicability": ["situation1", "situation2"],
  "significance": "minor" | "moderate" | "major"
}

If not wisdom, return: { "hasWisdom": false }`
        }]
      });

      const result = JSON.parse(analysis.choices[0].message.content || '{}');

      if (!result.hasWisdom || result.significance === 'minor') {
        return null;
      }

      // Store wisdom
      const [wisdom] = await db.insert(wisdomEntries).values({
        userId: uidNum,
        insight: result.insight,
        category: result.category,
        dateRealized: new Date(),
        sourceConversationId: conversationId,
        contextWhenLearned: result.contextWhenLearned,
        timesReferenced: 0,
        applicability: result.applicability || [],
        relatedWisdom: [],
        confidence: 0.7,
        significance: result.significance
      }).returning();

      // Find and link related wisdom
  await this.linkRelatedWisdom(wisdom.id, wisdom.insight, uidNum);

      return wisdom as WisdomEntry;
    } catch (error) {
      console.error('Error extracting wisdom:', error);
      return null;
    }
  }

  private async linkRelatedWisdom(wisdomId: number, insight: string, userId: string | number): Promise<void> {
    const uidNum = Number(userId);
    try {
      const client = getOpenAIClient();

      const existingWisdom = await db.select()
        .from(wisdomEntries)
        .where(and(
          eq(wisdomEntries.userId, uidNum),
          // Don't include the current wisdom
        ))
        .limit(50);

      if (existingWisdom.length === 0) return;

      const relatedCheck = await client.chat.completions.create({
        model: "gpt-4",
        temperature: 0.3,
        messages: [{
          role: "system",
          content: `Find insights that are thematically related to this new wisdom.

New wisdom: "${insight}"

Existing wisdom:
${existingWisdom.map((w, i) => `${w.id}. ${w.insight}`).join('\n')}

Return JSON with IDs of related insights (max 5):
{ "relatedIds": [id1, id2, ...] }`
        }]
      });

      const result = JSON.parse(relatedCheck.choices[0].message.content || '{}');
      
      if (result.relatedIds && result.relatedIds.length > 0) {
        await db.update(wisdomEntries)
          .set({ relatedWisdom: result.relatedIds })
          .where(eq(wisdomEntries.id, wisdomId));
      }
    } catch (error) {
      console.error('Error linking related wisdom:', error);
    }
  }

  async buildWisdomCollections(userId: string | number): Promise<WisdomCollection[]> {
    try {
      const uidNum = Number(userId);
      const client = getOpenAIClient();

      const allWisdom = await db.select()
        .from(wisdomEntries)
        .where(eq(wisdomEntries.userId, uidNum))
        .orderBy(desc(wisdomEntries.dateRealized));

      if (allWisdom.length === 0) return [];

      const clustering = await client.chat.completions.create({
        model: "gpt-4",
        temperature: 0.5,
        messages: [{
          role: "system",
          content: `Group these wisdom insights into thematic collections.

Insights:
${allWisdom.map((w, i) => `${i}. ${w.insight}`).join('\n')}

Create 3-7 meaningful themes and assign each insight to a theme.

Return JSON:
{
  "collections": [{
    "theme": "Theme name",
    "insightIndices": [0, 2, 5],
    "evolution": "How this theme has developed over time"
  }]
}`
        }]
      });

      const result = JSON.parse(clustering.choices[0].message.content || '{}');

      return result.collections.map((c: any) => ({
        theme: c.theme,
        entries: c.insightIndices.map((idx: number) => allWisdom[idx]),
        evolution: c.evolution
      }));
    } catch (error) {
      console.error('Error building wisdom collections:', error);
      return [];
    }
  }

  async findApplicableWisdom(
    userId: string | number,
    currentSituation: string
  ): Promise<WisdomEntry[]> {
    try {
      const uidNum = Number(userId);
      const client = getOpenAIClient();

      const allWisdom = await db.select()
        .from(wisdomEntries)
        .where(eq(wisdomEntries.userId, uidNum));

      if (allWisdom.length === 0) return [];

      const relevanceCheck = await client.chat.completions.create({
        model: "gpt-4",
        temperature: 0.3,
        messages: [{
          role: "system",
          content: `Find wisdom from this person's own insights that applies to their current situation.

Current situation: ${currentSituation}

Their wisdom:
${allWisdom.map((w, i) => `${i}. ${w.insight} (applies to: ${(w.applicability as string[]).join(', ')})`).join('\n')}

Return JSON with indices of relevant insights (max 3 most relevant):
{ "applicableWisdom": [0, 3, 7] }`
        }]
      });

      const result = JSON.parse(relevanceCheck.choices[0].message.content || '{}');

      const applicable = result.applicableWisdom.map((idx: number) => allWisdom[idx]);

      // Increment reference counter
      for (const wisdom of applicable) {
        await db.update(wisdomEntries)
          .set({ timesReferenced: wisdom.timesReferenced + 1 })
          .where(eq(wisdomEntries.id, wisdom.id));
      }

      return applicable as WisdomEntry[];
    } catch (error) {
      console.error('Error finding applicable wisdom:', error);
      return [];
    }
  }

  async generateWisdomBook(userId: string | number): Promise<WisdomBook> {
    try {
      const uidNum = Number(userId);
      const collections = await this.buildWisdomCollections(uidNum);
      
      const mostReferenced = await db.select()
        .from(wisdomEntries)
        .where(eq(wisdomEntries.userId, uidNum))
        .orderBy(desc(wisdomEntries.timesReferenced))
        .limit(5);

      const recentBreakthroughs = await db.select()
        .from(wisdomEntries)
        .where(eq(wisdomEntries.userId, uidNum))
        .orderBy(desc(wisdomEntries.dateRealized))
        .limit(5);

      return {
        collections,
        mostReferenced: mostReferenced as WisdomEntry[],
        recentBreakthroughs: recentBreakthroughs as WisdomEntry[],
        totalWisdom: collections.reduce((sum, c) => sum + c.entries.length, 0)
      };
    } catch (error) {
      console.error('Error generating wisdom book:', error);
      return {
        collections: [],
        mostReferenced: [],
        recentBreakthroughs: [],
        totalWisdom: 0
      };
    }
  }
}

export const wisdomLibraryService = new WisdomLibraryService();
