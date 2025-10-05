
import OpenAI from 'openai';
import { db } from './db';
import { beliefRevisions, memories } from '../shared/phase2-schema';
import { eq, and, desc } from 'drizzle-orm';

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

export interface BeliefRevision {
  id: number;
  userId: string;
  originalBelief: string;
  revisedBelief: string;
  catalystConversationId: string;
  revisedAt: Date;
  revisionType: 'expansion' | 'softening' | 'transformation' | 'integration';
  userAwareness: 'explicit' | 'implicit';
  significance: 'minor' | 'moderate' | 'major';
  explanation: string;
  celebrated: boolean;
}

export class BeliefRevisionService {
  // Detect if a current belief represents a revision of past beliefs
  async detectBeliefRevision(
    userId: string,
    currentBelief: string,
    conversationId: string
  ): Promise<BeliefRevision | null> {
    try {
      // Get past beliefs from memories (identity-related)
      const pastBeliefs = await db
        .select()
        .from(memories)
        .where(and(
          eq(memories.userId, userId),
          eq(memories.memoryType, 'value')
        ))
        .orderBy(desc(memories.createdAt))
        .limit(20);

      if (pastBeliefs.length === 0) {
        return null;
      }

      // Check each past belief for potential revision
      for (const pastBelief of pastBeliefs) {
        const client = getOpenAIClient();
        const analysis = await client.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [{
            role: "system",
            content: `Compare these two beliefs about self. Determine if there has been meaningful growth or shift.

Past belief (${this.getTimeAgo(pastBelief.createdAt)}): "${pastBelief.content}"
Current statement: "${currentBelief}"

Return ONLY valid JSON with this structure:
{
  "hasShifted": boolean,
  "revisionType": "expansion" | "softening" | "transformation" | "integration",
  "significance": "minor" | "moderate" | "major",
  "explanation": "brief explanation of the shift"
}

Revision types:
- expansion: broadened possibilities or capabilities
- softening: reduced harsh self-judgment
- transformation: fundamental change in self-concept
- integration: incorporated new aspects of identity`
          }],
          response_format: { type: "json_object" }
        });

        const result = JSON.parse(analysis.choices[0].message.content || '{}');

        if (result.hasShifted && result.significance !== 'minor') {
          // Create belief revision record
          const [revision] = await db.insert(beliefRevisions).values({
            userId,
            originalBelief: pastBelief.content,
            revisedBelief: currentBelief,
            catalystConversationId: conversationId,
            revisionType: result.revisionType,
            userAwareness: 'implicit',
            significance: result.significance,
            explanation: result.explanation,
            celebrated: false,
          }).returning();

          return revision as BeliefRevision;
        }
      }

      return null;
    } catch (error) {
      console.error('Error detecting belief revision:', error);
      return null;
    }
  }

  // Generate celebration message for belief revision
  generateCelebrationMessage(revision: BeliefRevision): string {
    const timeAgo = this.getTimeAgo(revision.revisedAt);
    const verb = this.getRevisionVerb(revision.revisionType);

    return `I want to pause and acknowledge something beautiful:

${timeAgo}, you believed: "${revision.originalBelief}"

Just now, you expressed: "${revision.revisedBelief}"

That's significant growth. You've ${verb} in a really meaningful way. Do you notice how your relationship to yourself has evolved? This is what transformation looks like. 🌱`;
  }

  // Get user's belief journey
  async getBeliefJourney(userId: string, limit: number = 10): Promise<BeliefRevision[]> {
    return await db
      .select()
      .from(beliefRevisions)
      .where(eq(beliefRevisions.userId, userId))
      .orderBy(desc(beliefRevisions.revisedAt))
      .limit(limit);
  }

  // Mark revision as celebrated
  async markCelebrated(revisionId: number): Promise<void> {
    await db
      .update(beliefRevisions)
      .set({ celebrated: true })
      .where(eq(beliefRevisions.id, revisionId));
  }

  // Helper: Get revision verb based on type
  private getRevisionVerb(type: BeliefRevision['revisionType']): string {
    const verbs = {
      expansion: "expanded your sense of what's possible for yourself",
      softening: "softened some of those harsh judgments about yourself",
      transformation: "fundamentally transformed how you see yourself",
      integration: "integrated new aspects of who you are"
    };
    return verbs[type];
  }

  // Helper: Get human-readable time ago
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths >= 1) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    } else if (diffDays >= 1) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return 'recently';
    }
  }
}

export const beliefRevisionService = new BeliefRevisionService();
