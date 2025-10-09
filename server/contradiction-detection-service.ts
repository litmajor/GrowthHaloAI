
import { db } from './db';
import { beliefs, contradictions, cognitiveDistortions } from '../shared/phase2-schema';
import { eq, gt, and, desc, sql } from 'drizzle-orm';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set. Contradiction detection will fail.');
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://growth-halo.replit.app',
    'X-Title': 'Growth Halo AI'
  }
});

interface BeliefExtraction {
  statement: string;
  category: 'value' | 'goal' | 'identity' | 'preference' | 'intention';
  confidence: number;
}

interface ContradictionResult {
  beliefId: number;
  belief: string;
  contradictingStatement: string;
  contradictionType: 'action-value' | 'goal-behavior' | 'identity-action' | 'cognitive-distortion';
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  shouldMention: boolean;
}

interface DistortionResult {
  type: string;
  evidence: string;
  alternativePerspective: string;
}

export class ContradictionDetectionService {
  
  async extractBeliefs(message: string, userId: string | number): Promise<void> {
    const uidNum = Number(userId);
    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: `Identify beliefs, values, goals, or intentions in this message.
        Extract statements like:
        - "I want to be more present with my family" (intention)
        - "Authenticity is really important to me" (value)
        - "I'm trying to set better boundaries" (goal)
        - "I'm not a creative person" (identity belief)
        
        Return as JSON array with: statement, category, confidence (0-1)`
      }, {
        role: "user",
        content: message
      }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(analysis.choices[0].message.content || '{"beliefs":[]}');
    const extracted: BeliefExtraction[] = result.beliefs || [];

    // Store or update beliefs
    for (const belief of extracted) {
      // Check if similar belief exists
      const existing = await db.select()
        .from(beliefs)
        .where(
          and(
            eq(beliefs.userId, uidNum),
            sql`similarity(${beliefs.statement}, ${belief.statement}) > 0.8`
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update confidence and last confirmed
        await db.update(beliefs)
          .set({
            confidence: Math.min(existing[0].confidence + 0.1, 1),
            lastConfirmed: new Date()
          })
          .where(eq(beliefs.id, existing[0].id));
      } else {
        // Insert new belief
        const embedding = await this.generateEmbedding(belief.statement);
        await db.insert(beliefs).values({
          userId: uidNum,
          statement: belief.statement,
          category: belief.category,
          confidence: belief.confidence,
          embedding
        });
      }
    }
  }

  async detectContradictions(
    userId: string | number,
    currentMessage: string
  ): Promise<ContradictionResult[]> {
    const uidNum = Number(userId);
    // Get well-established beliefs
      const userBeliefs = await db.select()
      .from(beliefs)
      .where(
        and(
          eq(beliefs.userId, uidNum),
          gt(beliefs.confidence, 0.6)
        )
      )
      .orderBy(desc(beliefs.lastConfirmed));

    const contradictionsFound: ContradictionResult[] = [];

    for (const belief of userBeliefs) {
      const analysis = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: `Does this current message contradict or conflict with this belief?
          
          Belief: "${belief.statement}"
          Current message: "${currentMessage}"
          
          Analyze if there's a contradiction. Consider:
          - Action-value misalignment (saying X is important but doing opposite)
          - Goal-behavior conflict (stating goal but describing avoidance)
          - Identity-action mismatch (defining self one way but acting differently)
          - Cognitive distortions (all-or-nothing, catastrophizing, etc.)
          
          Return JSON: { 
            isContradiction: boolean,
            contradictionType: string,
            explanation: string,
            severity: 'low'|'medium'|'high',
            shouldMention: boolean
          }`
        }],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(analysis.choices[0].message.content || '{"isContradiction":false}');

      if (result.isContradiction) {
          const shouldMention = await this.shouldMentionContradiction(
          uidNum,
          result.severity
        );

        if (shouldMention && result.shouldMention) {
          contradictionsFound.push({
            beliefId: belief.id,
            belief: belief.statement,
            contradictingStatement: currentMessage,
            contradictionType: result.contradictionType,
            severity: result.severity,
            explanation: result.explanation,
            shouldMention: true
          });

          // Store contradiction
          await db.insert(contradictions).values({
            userId: uidNum,
            beliefId: belief.id,
            belief: belief.statement,
            contradictingStatement: currentMessage,
            contradictionType: result.contradictionType,
            severity: result.severity,
            explanation: result.explanation
          });
        }
      }
    }

    return contradictionsFound;
  }

  async detectCognitiveDistortions(message: string, userId: string | number): Promise<DistortionResult[]> {
    const uidNum = Number(userId);
    const distortionTypes = [
      'all-or-nothing thinking',
      'overgeneralization',
      'mental filter (focusing only on negatives)',
      'discounting the positive',
      'jumping to conclusions',
      'catastrophizing',
      'emotional reasoning',
      'should statements',
      'labeling',
      'personalization'
    ];

    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: `Identify cognitive distortions in this message:
        ${distortionTypes.map((d, i) => `${i + 1}. ${d}`).join('\n')}
        
        Return JSON: {
          distortions: [
            {
              type: string,
              evidence: string,
              alternativePerspective: string
            }
          ]
        }`
      }, {
        role: "user",
        content: message
      }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(analysis.choices[0].message.content || '{"distortions":[]}');
    const distortions: DistortionResult[] = result.distortions || [];

    // Store distortions
    for (const distortion of distortions) {
      await db.insert(cognitiveDistortions).values({
        userId: uidNum,
        messageContent: message,
        distortionType: distortion.type,
        evidence: distortion.evidence,
        alternativePerspective: distortion.alternativePerspective
      });
    }

    return distortions;
  }

  private async shouldMentionContradiction(
    userId: string | number,
    severity: string
  ): Promise<boolean> {
    const uidNum = Number(userId);
    // Don't overwhelm with contradictions
    const recentMentions = await db.select()
      .from(contradictions)
      .where(
        and(
          eq(contradictions.userId, uidNum),
          eq(contradictions.mentioned, true),
          sql`${contradictions.mentionedAt} > NOW() - INTERVAL '7 days'`
        )
      );

    if (recentMentions.length > 2) return false;

    // Only mention medium/high severity
    if (severity === 'low') return false;

    return true;
  }

  formatContradictionResponse(contradiction: ContradictionResult): string {
    const gentle = [
      "I'm noticing something... ",
      "Can I point out something I'm observing? ",
      "I want to mention something gently... ",
      "This might be worth reflecting on... "
    ];

    const templates: Record<string, string> = {
      'action-value': `${gentle[0]}You've shared that ${contradiction.belief}, but ${contradiction.contradictingStatement}. I'm curious about that gap—what do you think is making it hard to align your actions with what matters to you?`,
      
      'goal-behavior': `${gentle[1]}You mentioned wanting to ${contradiction.belief}, and I believe you mean that. But I also heard you describe ${contradiction.contradictingStatement}. Sometimes there are invisible barriers between our intentions and actions. What do you think might be in the way?`,
      
      'identity-action': `${gentle[2]}You've described yourself as someone who ${contradiction.belief}, but I'm hearing about ${contradiction.contradictingStatement}. That's not a judgment—I'm just curious about the gap between how you see yourself and what you're experiencing right now.`,
      
      'cognitive-distortion': `${gentle[3]}I'm hearing some pretty harsh self-talk in what you just said. Sometimes our thoughts can be more absolute than reality. ${contradiction.explanation}`
    };

    return templates[contradiction.contradictionType] || templates['action-value'];
  }

  formatDistortionResponse(distortion: DistortionResult): string {
    return `I'm noticing a pattern in how you're thinking about this. ${distortion.evidence} sounds like ${distortion.type}. ${distortion.alternativePerspective}`;
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text
    });
    return response.data[0].embedding;
  }
}

export const contradictionDetectionService = new ContradictionDetectionService();
