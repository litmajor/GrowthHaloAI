
import OpenAI from 'openai';
import { db } from './db';
import { userHypotheses, personalityInsights, predictiveInsights } from '../shared/phase3-schema';
import { outcomeAnalyses } from '../shared/phase3-schema';
import { memories, emotionalDataPoints, conversationThemes } from '../shared/growth-schema';
import { eq, desc, and, gte } from 'drizzle-orm';

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

export interface HypothesisTestResult {
  result: 'supports' | 'contradicts' | 'neutral';
  newConfidence: number;
  reasoning: string;
}

export interface PredictiveInsightData {
  situation: string;
  likelyOutcome: string;
  confidence: number;
  basedOn: string[];
  preventativeActions?: string[];
  alternativeApproaches?: string[];
}

export class HypothesisFormationService {
  async generateHypotheses(userId: number): Promise<any[]> {
    try {
      const client = getOpenAIClient();

      // Gather user data
      const conversations = await db.select()
        .from(memories)
        .where(eq(memories.userId, userId))
        .orderBy(desc(memories.createdAt))
        .limit(50);

      const outcomes = await db.select()
        .from(outcomeAnalyses)
        .where(eq(outcomeAnalyses.userId, userId))
        .limit(20);

      const emotions = await db.select()
        .from(emotionalDataPoints)
        .where(eq(emotionalDataPoints.userId, userId))
        .orderBy(desc(emotionalDataPoints.timestamp))
        .limit(30);

      const themes = await db.select()
        .from(conversationThemes)
        .where(eq(conversationThemes.userId, userId))
        .orderBy(desc(conversationThemes.frequency))
        .limit(10);

      const userData = {
        recentMemories: conversations.map(c => c.content),
        outcomes: outcomes.map(o => ({
          situation: o.situation,
          approach: o.approach,
          outcome: o.outcome,
          quality: o.outcomeQuality
        })),
        emotionalPatterns: emotions.map(e => ({
          emotion: e.dominantEmotion,
          valence: e.valence,
          intensity: e.intensity
        })),
        themes: themes.map(t => t.theme)
      };

      const hypothesisGeneration = await client.chat.completions.create({
        model: "gpt-4",
        temperature: 0.3,
        messages: [{
          role: "system",
          content: `Analyze this user data and generate testable hypotheses about their patterns, preferences, and growth style.
          
          Categories:
          1. preference: What they value, enjoy, avoid
          2. trigger: What energizes or depletes them
          3. strength: Natural abilities and tendencies
          4. growth_style: How they learn and change
          5. communication: How they process and express
          
          For each hypothesis:
          - Make it specific and testable
          - Assign confidence based on evidence strength (0-1)
          - List supporting evidence quotes
          - Note any contradictions
          
          Return JSON array with format:
          [{
            category: string,
            hypothesis: string,
            confidence: number,
            evidence: string[],
            counterEvidence: string[]
          }]`
        }, {
          role: "user",
          content: JSON.stringify(userData, null, 2)
        }]
      });

      const hypotheses = JSON.parse(hypothesisGeneration.choices[0].message.content || '[]');
      
      // Store in database
      for (const hyp of hypotheses) {
        await db.insert(userHypotheses).values({
          userId,
          category: hyp.category,
          hypothesis: hyp.hypothesis,
          confidence: hyp.confidence,
          evidence: hyp.evidence || [],
          counterEvidence: hyp.counterEvidence || [],
          testCount: 0,
          confirmed: hyp.confidence > 0.8
        });
      }

      return hypotheses;
    } catch (error) {
      console.error('Error generating hypotheses:', error);
      return [];
    }
  }

  async testHypothesis(
    hypothesisId: number,
    newEvidence: string
  ): Promise<HypothesisTestResult | null> {
    try {
      const client = getOpenAIClient();

      const hypothesis = await db.select()
        .from(userHypotheses)
        .where(eq(userHypotheses.id, hypothesisId))
        .limit(1);

      if (hypothesis.length === 0) return null;

      const hyp = hypothesis[0];

      const test = await client.chat.completions.create({
        model: "gpt-4",
        temperature: 0.3,
        messages: [{
          role: "system",
          content: `Test this hypothesis against new evidence:
          
          Hypothesis: ${hyp.hypothesis}
          Current confidence: ${hyp.confidence}
          Supporting evidence: ${hyp.evidence.join('; ')}
          Counter evidence: ${hyp.counterEvidence.join('; ')}
          
          New evidence: ${newEvidence}
          
          Does this support, contradict, or neither?
          Return JSON: {
            result: 'supports' | 'contradicts' | 'neutral',
            newConfidence: number (updated 0-1),
            reasoning: string
          }`
        }]
      });

      const result = JSON.parse(test.choices[0].message.content || '{}');
      
      // Update hypothesis
      const updatedEvidence = result.result === 'supports' 
        ? [...hyp.evidence, newEvidence]
        : hyp.evidence;
      
      const updatedCounterEvidence = result.result === 'contradicts'
        ? [...hyp.counterEvidence, newEvidence]
        : hyp.counterEvidence;

      await db.update(userHypotheses)
        .set({
          confidence: result.newConfidence,
          evidence: updatedEvidence,
          counterEvidence: updatedCounterEvidence,
          lastTested: new Date(),
          testCount: hyp.testCount + 1,
          confirmed: result.newConfidence > 0.8
        })
        .where(eq(userHypotheses.id, hypothesisId));

      return result;
    } catch (error) {
      console.error('Error testing hypothesis:', error);
      return null;
    }
  }

  async getPersonalityInsights(userId: number): Promise<any[]> {
    try {
      const client = getOpenAIClient();

      const confirmedHypotheses = await db.select()
        .from(userHypotheses)
        .where(and(
          eq(userHypotheses.userId, userId),
          eq(userHypotheses.confirmed, true)
        ));

      if (confirmedHypotheses.length === 0) {
        return [];
      }

      const synthesis = await client.chat.completions.create({
        model: "gpt-4",
        temperature: 0.3,
        messages: [{
          role: "system",
          content: `Synthesize these confirmed hypotheses into a personality profile with actionable implications for guidance.
          
          Hypotheses:
          ${confirmedHypotheses.map(h => `- ${h.hypothesis} (confidence: ${h.confidence})`).join('\n')}
          
          Create a profile across dimensions like:
          - Decision-making style
          - Stress response patterns
          - Growth orientation
          - Relationship dynamics
          - Communication preferences
          
          For each dimension, provide:
          - Profile description
          - Confidence level (0-1)
          - Implications array (how to best support this person)
          
          Return JSON array with format:
          [{
            dimension: string,
            profile: string,
            confidence: number,
            implications: string[]
          }]`
        }]
      });

      const insights = JSON.parse(synthesis.choices[0].message.content || '[]');

      // Store or update insights
      for (const insight of insights) {
        const existing = await db.select()
          .from(personalityInsights)
          .where(and(
            eq(personalityInsights.userId, userId),
            eq(personalityInsights.dimension, insight.dimension)
          ))
          .limit(1);

        if (existing.length > 0) {
          await db.update(personalityInsights)
            .set({
              profile: insight.profile,
              confidence: insight.confidence,
              implications: insight.implications,
              updatedAt: new Date()
            })
            .where(eq(personalityInsights.id, existing[0].id));
        } else {
          await db.insert(personalityInsights).values({
            userId,
            dimension: insight.dimension,
            profile: insight.profile,
            confidence: insight.confidence,
            implications: insight.implications
          });
        }
      }

      return insights;
    } catch (error) {
      console.error('Error getting personality insights:', error);
      return [];
    }
  }

  async predictOutcome(
    userId: number,
    plannedAction: string,
    context: string
  ): Promise<PredictiveInsightData | null> {
    try {
      const client = getOpenAIClient();

      // Find similar past situations
      const pastOutcomes = await db.select()
        .from(outcomeAnalyses)
        .where(eq(outcomeAnalyses.userId, userId))
        .limit(10);

      if (pastOutcomes.length === 0) {
        return null;
      }

      const prediction = await client.chat.completions.create({
        model: "gpt-4",
        temperature: 0.3,
        messages: [{
          role: "system",
          content: `Based on this user's history, predict the likely outcome of their planned action.
          
          Planned action: ${plannedAction}
          Context: ${context}
          
          Similar past situations:
          ${pastOutcomes.map(s => `
            What they did: ${s.approach}
            What happened: ${s.outcome}
            Quality: ${s.outcomeQuality}
          `).join('\n')}
          
          Predict:
          - Most likely outcome
          - Confidence level (0-1)
          - Which past situations this is based on
          - Potential risks or pitfalls (preventativeActions)
          - Alternative approaches that might work better
          
          Return JSON with format:
          {
            likelyOutcome: string,
            confidence: number,
            basedOn: string[],
            preventativeActions: string[],
            alternativeApproaches: string[]
          }`
        }]
      });

      const result = JSON.parse(prediction.choices[0].message.content || '{}');

      // Store the prediction
      await db.insert(predictiveInsights).values({
        userId,
        situation: context,
        plannedAction,
        likelyOutcome: result.likelyOutcome,
        confidence: result.confidence,
        basedOn: result.basedOn || [],
        preventativeActions: result.preventativeActions,
        alternativeApproaches: result.alternativeApproaches
      });

      return result;
    } catch (error) {
      console.error('Error predicting outcome:', error);
      return null;
    }
  }

  async getUserHypotheses(userId: number, confirmed?: boolean): Promise<any[]> {
    let conditions = [eq(userHypotheses.userId, userId)];
    
    if (confirmed !== undefined) {
      conditions.push(eq(userHypotheses.confirmed, confirmed));
    }

    return await db.select()
      .from(userHypotheses)
      .where(and(...conditions))
      .orderBy(desc(userHypotheses.confidence));
  }
}

export const hypothesisFormationService = new HypothesisFormationService();
