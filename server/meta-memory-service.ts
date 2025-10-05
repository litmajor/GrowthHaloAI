
import OpenAI from 'openai';
import { db } from './db';
import { ideaEvolutions, ideaDevelopmentMilestones, memoryFormationEvents } from '../shared/phase3-schema';
import { eq, or, desc } from 'drizzle-orm';

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

export interface IdeaJourneyVisualization {
  summary: string;
  timeline: Array<{
    phase: string;
    date: Date;
    description: string;
    catalyst: string;
    emotion: string;
    confidence?: number;
  }>;
  currentStatus: {
    form: string;
    maturity: string;
    readiness: string;
  };
  insights: string[];
}

export class MetaMemoryService {
  async detectIdeaSeed(
    userId: number,
    message: string,
    conversationId: string
  ): Promise<any | null> {
    try {
      const client = getOpenAIClient();

      const analysis = await client.chat.completions.create({
        model: "gpt-4",
        temperature: 0.3,
        messages: [{
          role: "system",
          content: `Detect if this message contains the seed of a new idea, intention, or realization.
          
          Look for phrases like:
          - "I'm thinking about..."
          - "What if I..."
          - "I'm realizing..."
          - "Maybe I should..."
          - "I've been wondering if..."
          
          Return JSON:
          {
            hasSeed: boolean,
            ideaSummary: string,
            initialForm: string,
            catalyst: string,
            category: 'career' | 'project' | 'relationship' | 'identity' | 'creative',
            emotionalState: string
          }`
        }, {
          role: "user",
          content: message
        }]
      });

      const result = JSON.parse(analysis.choices[0].message.content || '{}');
      
      if (!result.hasSeed) return null;

      // Create idea evolution record
      const [idea] = await db.insert(ideaEvolutions).values({
        userId,
        ideaSummary: result.ideaSummary,
        category: result.category,
        seedConversationId: conversationId,
        seedTimestamp: new Date(),
        seedInitialForm: result.initialForm,
        seedEmotionalState: result.emotionalState,
        seedCatalyst: result.catalyst,
        currentForm: result.initialForm,
        maturityLevel: 'seed',
        influencingFactors: [result.catalyst],
        relatedIdeas: []
      }).returning();

      return idea;
    } catch (error) {
      console.error('Error detecting idea seed:', error);
      return null;
    }
  }

  async trackIdeaDevelopment(userId: number, message: string): Promise<void> {
    try {
      const client = getOpenAIClient();

      // Find active ideas
      const existingIdeas = await db.select()
        .from(ideaEvolutions)
        .where(eq(ideaEvolutions.userId, userId));

      const activeIdeas = existingIdeas.filter(idea => 
        ['seed', 'germinating', 'growing'].includes(idea.maturityLevel)
      );

      for (const idea of activeIdeas) {
        const development = await client.chat.completions.create({
          model: "gpt-4",
          temperature: 0.3,
          messages: [{
            role: "system",
            content: `Does this new message develop or relate to this idea?
            
            Original idea: ${idea.ideaSummary}
            Last form: ${idea.currentForm}
            
            New message: ${message}
            
            Return JSON:
            {
              isDevelopment: boolean,
              newForm: string,
              catalyst: string,
              maturityChange: 'same' | 'advanced' | 'regressed',
              confidence: number,
              emotionalState: string
            }`
          }]
        });

        const result = JSON.parse(development.choices[0].message.content || '{}');

        if (result.isDevelopment) {
          // Add milestone
          await db.insert(ideaDevelopmentMilestones).values({
            ideaId: idea.id,
            timestamp: new Date(),
            form: result.newForm,
            catalyst: result.catalyst,
            confidence: result.confidence,
            emotionalState: result.emotionalState
          });

          // Update idea
          let newMaturity = idea.maturityLevel;
          if (result.maturityChange === 'advanced') {
            newMaturity = this.advanceMaturity(idea.maturityLevel);
          }

          await db.update(ideaEvolutions)
            .set({
              currentForm: result.newForm,
              maturityLevel: newMaturity,
              updatedAt: new Date()
            })
            .where(eq(ideaEvolutions.id, idea.id));
        }
      }
    } catch (error) {
      console.error('Error tracking idea development:', error);
    }
  }

  private advanceMaturity(current: string): string {
    const progression = ['seed', 'germinating', 'growing', 'mature'];
    const currentIndex = progression.indexOf(current);
    return currentIndex < progression.length - 1 
      ? progression[currentIndex + 1] 
      : current;
  }

  async visualizeIdeaJourney(ideaId: number): Promise<IdeaJourneyVisualization> {
    const [idea] = await db.select()
      .from(ideaEvolutions)
      .where(eq(ideaEvolutions.id, ideaId))
      .limit(1);

    if (!idea) throw new Error('Idea not found');

    const milestones = await db.select()
      .from(ideaDevelopmentMilestones)
      .where(eq(ideaDevelopmentMilestones.ideaId, ideaId))
      .orderBy(ideaDevelopmentMilestones.timestamp);

    const timeline = [
      {
        phase: 'Seed',
        date: idea.seedTimestamp,
        description: idea.seedInitialForm,
        catalyst: idea.seedCatalyst,
        emotion: idea.seedEmotionalState
      },
      ...milestones.map((m, idx) => ({
        phase: `Development ${idx + 1}`,
        date: m.timestamp,
        description: m.form,
        catalyst: m.catalyst,
        emotion: m.emotionalState,
        confidence: m.confidence
      }))
    ];

    const insights = await this.generateIdeaInsights(idea, milestones);
    const readiness = this.assessReadiness(idea, milestones);

    return {
      summary: idea.ideaSummary,
      timeline,
      currentStatus: {
        form: idea.currentForm,
        maturity: idea.maturityLevel,
        readiness
      },
      insights
    };
  }

  private async generateIdeaInsights(idea: any, milestones: any[]): Promise<string[]> {
    try {
      const client = getOpenAIClient();

      const analysis = await client.chat.completions.create({
        model: "gpt-4",
        temperature: 0.3,
        messages: [{
          role: "system",
          content: `Analyze this idea's evolution and provide insights.
          
          Idea: ${idea.ideaSummary}
          Seed: ${idea.seedInitialForm}
          Catalysts: ${milestones.map(m => m.catalyst).join(', ')}
          Current form: ${idea.currentForm}
          
          Provide 3-5 insights about:
          - What's been driving this idea forward
          - How it's evolved (expanded? focused? transformed?)
          - What might be needed for it to mature further
          - Patterns in when/how the person thinks about it
          
          Return JSON array of insight strings.`
        }]
      });

      return JSON.parse(analysis.choices[0].message.content || '[]');
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }

  private assessReadiness(idea: any, milestones: any[]): string {
    if (milestones.length === 0) {
      return "This idea is still new. Give it time to percolate before making big decisions.";
    }

    const avgConfidence = milestones.reduce((sum, m) => sum + m.confidence, 0) / milestones.length;
    const timeSpan = Date.now() - idea.seedTimestamp.getTime();
    const hasMatured = timeSpan > 30 * 24 * 60 * 60 * 1000; // 30 days

    if (avgConfidence > 0.8 && hasMatured && idea.maturityLevel === 'mature') {
      return "This idea seems ready for action. You've thought it through thoroughly and it's had time to develop.";
    } else if (idea.maturityLevel === 'dormant') {
      return "This idea went quiet. It might need a new catalyst, or it might not be the right time.";
    } else {
      return "This idea is developing. Keep exploring it—it's not quite ready for action yet.";
    }
  }

  async getUserIdeas(userId: number, includeAll: boolean = false): Promise<any[]> {
    let query = db.select()
      .from(ideaEvolutions)
      .where(eq(ideaEvolutions.userId, userId));

    if (!includeAll) {
      // Only active ideas
      const ideas = await query;
      return ideas.filter(idea => idea.maturityLevel !== 'dormant');
    }

    return await query.orderBy(desc(ideaEvolutions.updatedAt));
  }
}

export const metaMemoryService = new MetaMemoryService();
