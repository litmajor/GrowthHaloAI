
import OpenAI from 'openai';
import { db } from './db';
import { causalRelationships, outcomeAnalyses, domainAnalogies } from '../shared/phase3-schema';
import { eq, gte, desc, ne, and } from 'drizzle-orm';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CausalRelationship {
  id: string;
  userId: string | number;
  cause: string;
  effect: string;
  confidence: number;
  domain: string;
  evidence: string[];
  firstObserved: Date;
  lastConfirmed: Date;
  observationCount: number;
  contextFactors?: string[] | null;
}

export interface ActionSuggestion {
  suggestedAction: string;
  reasoning: string;
  pastExample: string;
  confidence: number;
}

export interface ApproachAnalysis {
  domain: string;
  mostEffective: {
    approach: string;
    successRate: number;
    sampleSize: number;
    examples: any[];
  };
  leastEffective: {
    approach: string;
    successRate: number;
    sampleSize: number;
    examples: any[];
  };
  allApproaches: any[];
}

export class CausalReasoningService {
  async extractCausalRelationships(
    userId: string | number,
    message: string,
    conversationId: string
  ): Promise<CausalRelationship[]> {
    const uidNum = Number(userId);
    try {
      const analysis = await openai.chat.completions.create({
        model: "gpt-4",
        temperature: 0.3,
        messages: [{
          role: "system",
          content: `Identify cause-and-effect relationships in this message.
          
          Look for patterns like:
          - "When I do X, Y happens"
          - "After I started X, I noticed Y"
          - "X helped me Y"
          - "X made me feel Y"
          - "Because of X, Y occurred"
          
          Return JSON array of relationships:
          {
            cause: string (the action/condition),
            effect: string (the result/outcome),
            confidence: number (0-1),
            domain: "work" | "relationships" | "health" | "creativity" | "wellbeing",
            evidence: quote from message,
            contextFactors: any conditions mentioned
          }`
        }, {
          role: "user",
          content: message
        }]
      });

      const relationships = JSON.parse(analysis.choices[0].message.content || '[]');
      
      // Store or update existing relationships
      for (const rel of relationships) {
        await this.updateOrCreateRelationship(uidNum, rel, conversationId);
      }

      return relationships;
    } catch (error) {
      console.error('Error extracting causal relationships:', error);
      return [];
    }
  }

  private async updateOrCreateRelationship(
    userId: string | number,
    rel: any,
    conversationId: string
  ): Promise<void> {
    const uidNum = Number(userId);
    // Check if similar relationship exists
      const existing = await db.select()
      .from(causalRelationships)
      .where(
        and(
          eq(causalRelationships.userId, uidNum),
          eq(causalRelationships.cause, rel.cause),
          eq(causalRelationships.effect, rel.effect)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      const updated = existing[0];
      await db.update(causalRelationships)
        .set({
          confidence: Math.min(1, updated.confidence + 0.1),
          lastConfirmed: new Date(),
          observationCount: updated.observationCount + 1,
          evidence: [...(updated.evidence as string[]), conversationId],
        })
        .where(eq(causalRelationships.id, updated.id));
    } else {
      // Create new
      await db.insert(causalRelationships).values({
        userId: uidNum,
        cause: rel.cause,
        effect: rel.effect,
        confidence: rel.confidence,
        domain: rel.domain,
        evidence: [conversationId],
        contextFactors: rel.contextFactors,
      });
    }
  }

  async getPatterns(
    userId: string | number,
    domain?: string,
    minConfidence: number = 0.6
  ): Promise<CausalRelationship[]> {
    const uidNum = Number(userId);
    let conditions = [
      eq(causalRelationships.userId, uidNum),
      gte(causalRelationships.confidence, minConfidence),
      gte(causalRelationships.observationCount, 2)
    ];

    if (domain) {
      conditions.push(eq(causalRelationships.domain, domain));
    }

    return await db.select()
      .from(causalRelationships)
      .where(and(...conditions))
      .orderBy(desc(causalRelationships.confidence));
  }

  async suggestActions(
    userId: string | number,
    currentSituation: string,
    desiredOutcome: string
  ): Promise<ActionSuggestion[]> {
    const uidNum = Number(userId);
    try {
      const pastOutcomes = await db.select()
        .from(outcomeAnalyses)
        .where(
          and(
            eq(outcomeAnalyses.userId, uidNum),
            eq(outcomeAnalyses.outcomeQuality, 'positive')
          )
        )
        .limit(10);

      if (pastOutcomes.length === 0) {
        return [];
      }

      const analysis = await openai.chat.completions.create({
        model: "gpt-4",
        temperature: 0.3,
        messages: [{
          role: "system",
          content: `Given this current situation and desired outcome, 
          find relevant patterns from past successes.
          
          Current: ${currentSituation}
          Desired: ${desiredOutcome}
          
          Past successes:
          ${pastOutcomes.map(o => `
            Situation: ${o.situation}
            Approach: ${o.approach}
            Outcome: ${o.outcome}
          `).join('\n')}
          
          Return JSON array of suggestions based on what worked before:
          {
            suggestedAction: string,
            reasoning: string (why this might work),
            pastExample: string (reference to past success),
            confidence: number (0-1)
          }`
        }]
      });

      return JSON.parse(analysis.choices[0].message.content || '[]');
    } catch (error) {
      console.error('Error suggesting actions:', error);
      return [];
    }
  }

  async analyzeApproaches(userId: string | number, domain: string): Promise<ApproachAnalysis | null> {
    const uidNum = Number(userId);
    try {
      const outcomes = await db.select()
        .from(outcomeAnalyses)
        .where(
          and(
            eq(outcomeAnalyses.userId, uidNum),
            eq(outcomeAnalyses.domain, domain)
          )
        );

      if (outcomes.length === 0) {
        return null;
      }

      // Cluster by approach type
      const approaches = new Map<string, typeof outcomes>();
      for (const outcome of outcomes) {
        const key = outcome.approach;
        if (!approaches.has(key)) approaches.set(key, []);
        approaches.get(key)!.push(outcome);
      }

      // Calculate success rates
      const analysis = Array.from(approaches.entries()).map(([approach, outcomes]) => {
        const positiveCount = outcomes.filter(o => o.outcomeQuality === 'positive').length;
        const successRate = positiveCount / outcomes.length;
        
        return {
          approach,
          successRate,
          sampleSize: outcomes.length,
          examples: outcomes.slice(0, 3)
        };
      }).sort((a, b) => b.successRate - a.successRate);

      return {
        domain,
        mostEffective: analysis[0],
        leastEffective: analysis[analysis.length - 1],
        allApproaches: analysis
      };
    } catch (error) {
      console.error('Error analyzing approaches:', error);
      return null;
    }
  }

  async findAnalogies(
    userId: string | number,
    currentSituation: string,
    currentDomain: string
  ): Promise<any[]> {
    const uidNum = Number(userId);
    try {
      const pastSolutions = await db.select()
        .from(outcomeAnalyses)
        .where(
          and(
            eq(outcomeAnalyses.userId, uidNum),
            ne(outcomeAnalyses.domain, currentDomain),
            eq(outcomeAnalyses.outcomeQuality, 'positive')
          )
        )
        .limit(10);

      if (pastSolutions.length === 0) {
        return [];
      }

      const analogyAnalysis = await openai.chat.completions.create({
        model: "gpt-4",
        temperature: 0.3,
        messages: [{
          role: "system",
          content: `Find analogies between this current challenge and past 
          successes from other life domains.
          
          Current situation (${currentDomain}): ${currentSituation}
          
          Past successes from other domains:
          ${pastSolutions.map(s => `
            Domain: ${s.domain}
            Situation: ${s.situation}
            Solution: ${s.approach}
            Outcome: ${s.outcome}
          `).join('\n')}
          
          Look for structural similarities:
          - Similar relationship dynamics
          - Similar emotional challenges
          - Similar constraints
          - Similar goals
          
          Return JSON array of top 3 analogies with:
          {
            sourceId: which past situation,
            analogyStrength: 0-1,
            transferability: 0-1,
            reasoning: why they're similar,
            adaptedSolution: how to apply the past solution here
          }`
        }]
      });

      const analogies = JSON.parse(analogyAnalysis.choices[0].message.content || '[]');

      // Store analogies
      for (const analogy of analogies) {
        const source = pastSolutions.find(s => s.id === analogy.sourceId);
        if (source) {
          await db.insert(domainAnalogies).values({
            userId: uidNum,
            sourceId: analogy.sourceId,
            sourceDomain: source.domain,
            sourceSituation: source.situation,
            sourceSolution: source.approach,
            targetDomain: currentDomain,
            targetSituation: currentSituation,
            analogyStrength: analogy.analogyStrength,
            transferability: analogy.transferability,
            reasoning: analogy.reasoning,
          });
        }
      }

      return analogies;
    } catch (error) {
      console.error('Error finding analogies:', error);
      return [];
    }
  }
}

export const causalReasoningService = new CausalReasoningService();
