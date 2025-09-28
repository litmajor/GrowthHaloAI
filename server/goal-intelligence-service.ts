import OpenAI from 'openai';
import { storage } from './storage';
import type { 
  Goal, 
  InsertGoal, 
  GoalProgress, 
  InsertGoalProgress,
  ConversationGoalLink,
  InsertConversationGoalLink,
  GoalRelationship,
  InsertGoalRelationship
} from '@shared/growth-schema';

// Create OpenAI client conditionally
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface DetectedGoal {
  title: string;
  description: string;
  category: 'career' | 'health' | 'learning' | 'relationships' | 'financial' | 'personal' | 'spiritual' | 'creative';
  priority: number; // 1-10
  emotionalInvestment: number; // 1-10
  urgency: number; // 1-10
  targetDate?: string;
  confidence: number; // 0-1
}

export interface ProgressUpdate {
  goalId: string;
  progressPercentage: number;
  detectedActivity: string;
  momentum: 'accelerating' | 'steady' | 'slowing' | 'stalled';
  obstacles: string[];
  confidence: number;
}

export class GoalIntelligenceService {
  
  /**
   * Intelligent Goal Detection from Natural Conversations
   * Analyzes conversation content to extract implicit goals
   */
  async detectGoalsFromConversation(
    userId: string, 
    conversationText: string, 
    conversationHistory: Array<{role: string; content: string}> = []
  ): Promise<DetectedGoal[]> {
    try {
      const recentHistory = conversationHistory.slice(-6); // Last 6 messages for context
      
      const prompt = `Analyze this conversation to detect implicit goals the person might have. Look for:
      - Things they want to achieve or change
      - Problems they want to solve
      - Skills they want to develop
      - Situations they want to improve
      - Dreams or aspirations mentioned
      - Challenges they're facing

      Current message: "${conversationText}"
      
      Recent conversation context: ${recentHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

      Extract goals that are clearly implied or explicitly mentioned. Be conservative - only extract goals you're confident about.
      
      For each goal, determine:
      - Category (career, health, learning, relationships, financial, personal, spiritual, creative)
      - Priority (1-10 based on how much they emphasize it)
      - Emotional investment (1-10 based on how passionate they seem)
      - Urgency (1-10 based on timeline pressure or importance)
      - Confidence (0-1 how sure you are this is actually a goal)

      Respond with JSON array of goals:
      {
        "goals": [
          {
            "title": "Brief descriptive title",
            "description": "Detailed description of what they want to achieve",
            "category": "category",
            "priority": number,
            "emotionalInvestment": number,
            "urgency": number,
            "targetDate": "ISO date if mentioned or null",
            "confidence": number
          }
        ]
      }`;

      const completion = await getOpenAIClient().chat.completions.create({
        model: 'gpt-5', // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const response = JSON.parse(completion.choices[0].message.content || '{"goals": []}');
      
      // Filter goals by confidence threshold
      const highConfidenceGoals = response.goals.filter((goal: DetectedGoal) => goal.confidence >= 0.7);
      
      // Check for existing goals to avoid duplicates
      const existingGoals = await this.getUserGoals(userId);
      const newGoals = await this.filterDuplicateGoals(highConfidenceGoals, existingGoals);
      
      // Store new goals in database
      for (const goal of newGoals) {
        await this.createDetectedGoal(userId, goal, conversationText);
      }
      
      return newGoals;
    } catch (error) {
      console.error('Error detecting goals from conversation:', error);
      return [];
    }
  }

  /**
   * Progress Detection from Conversations
   * Analyzes conversations to detect progress updates for existing goals
   */
  async detectProgressUpdates(
    userId: string, 
    conversationText: string,
    existingGoals: Goal[]
  ): Promise<ProgressUpdate[]> {
    try {
      if (existingGoals.length === 0) return [];

      const goalContext = existingGoals.map(g => `"${g.title}" (${g.category}, current progress: ${g.progress}%)`).join(', ');
      
      const prompt = `Analyze this conversation for progress updates on existing goals.

      User's active goals: ${goalContext}
      
      Conversation: "${conversationText}"
      
      Look for:
      - Completed activities related to goals
      - Progress mentions or achievements
      - Obstacles or challenges faced
      - Changes in motivation or approach
      - Milestones reached

      For each goal that has progress mentioned, estimate:
      - New progress percentage (0-100)
      - What specific activity was done
      - Momentum (accelerating, steady, slowing, stalled)
      - Any obstacles mentioned
      - Confidence in this assessment (0-1)

      Respond with JSON:
      {
        "progressUpdates": [
          {
            "goalTitle": "exact goal title from list above",
            "progressPercentage": number,
            "detectedActivity": "what they did/mentioned",
            "momentum": "accelerating|steady|slowing|stalled",
            "obstacles": ["obstacle1", "obstacle2"],
            "confidence": number
          }
        ]
      }`;

      const completion = await getOpenAIClient().chat.completions.create({
        model: 'gpt-5', // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });

      const response = JSON.parse(completion.choices[0].message.content || '{"progressUpdates": []}');
      
      // Match detected updates to actual goal IDs and store them
      const progressUpdates: ProgressUpdate[] = [];
      
      for (const update of response.progressUpdates) {
        const matchingGoal = existingGoals.find(g => g.title === update.goalTitle);
        if (matchingGoal && update.confidence >= 0.6) {
          const progressUpdate: ProgressUpdate = {
            goalId: matchingGoal.id,
            progressPercentage: Math.min(100, Math.max(0, update.progressPercentage)),
            detectedActivity: update.detectedActivity,
            momentum: update.momentum,
            obstacles: update.obstacles || [],
            confidence: update.confidence,
          };
          
          await this.recordProgressUpdate(userId, progressUpdate, conversationText);
          progressUpdates.push(progressUpdate);
        }
      }
      
      return progressUpdates;
    } catch (error) {
      console.error('Error detecting progress updates:', error);
      return [];
    }
  }

  /**
   * Analyze Goal Relationships and Conflicts
   * Identifies how goals influence each other
   */
  async analyzeGoalRelationships(userId: string, goals: Goal[]): Promise<void> {
    try {
      if (goals.length < 2) return;

      const goalsDescription = goals.map(g => `"${g.title}" (${g.category}): ${g.description}`).join('\n');
      
      const prompt = `Analyze these goals for relationships and potential conflicts:

      ${goalsDescription}

      Identify relationships where goals:
      - Support each other (working on one helps the other)
      - Conflict with each other (competing for time/resources)
      - Have dependencies (one must happen before the other)
      - Enable each other (success in one unlocks the other)
      - Compete for attention (similar goals that might fragment focus)

      Respond with JSON:
      {
        "relationships": [
          {
            "primaryGoal": "exact goal title",
            "relatedGoal": "exact goal title", 
            "relationshipType": "supports|conflicts|depends_on|enables|competes_with",
            "strength": number_between_0_and_1,
            "impact": "description of how they influence each other"
          }
        ]
      }`;

      const completion = await getOpenAIClient().chat.completions.create({
        model: 'gpt-5', // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });

      const response = JSON.parse(completion.choices[0].message.content || '{"relationships": []}');
      
      // Store relationships in database
      for (const rel of response.relationships) {
        const primaryGoal = goals.find(g => g.title === rel.primaryGoal);
        const relatedGoal = goals.find(g => g.title === rel.relatedGoal);
        
        if (primaryGoal && relatedGoal && rel.strength >= 0.3) {
          await this.createGoalRelationship(primaryGoal.id, relatedGoal.id, rel);
        }
      }
    } catch (error) {
      console.error('Error analyzing goal relationships:', error);
    }
  }

  /**
   * Get Enhanced Goal Insights for Bliss AI
   * Provides contextual information about goals for personalized responses
   */
  async getGoalInsightsForAI(userId: string): Promise<any> {
    try {
      const goals = await this.getUserGoals(userId);
      const recentProgress = await this.getRecentProgress(userId, 7); // Last 7 days
      
      if (goals.length === 0) return null;

      return {
        activeGoalsCount: goals.filter(g => g.status === 'active').length,
        primaryGoals: goals
          .filter(g => g.status === 'active')
          .sort((a, b) => ((b.priority || 0) + (b.emotionalInvestment || 0)) - ((a.priority || 0) + (a.emotionalInvestment || 0)))
          .slice(0, 3)
          .map(g => ({
            title: g.title,
            category: g.category,
            progress: g.progress,
            momentum: this.calculateMomentum(g.id, recentProgress),
            lastMentioned: g.lastMentioned,
          })),
        progressTrend: this.calculateOverallProgressTrend(recentProgress),
        stagnantGoals: goals.filter(g => 
          g.status === 'active' && 
          (!g.lastMentioned || new Date(g.lastMentioned) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))
        ).map(g => g.title),
      };
    } catch (error) {
      console.error('Error getting goal insights for AI:', error);
      return null;
    }
  }

  // Helper methods
  private async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      return await storage.getGoalsByUserId(userId);
    } catch (error) {
      console.error('Error getting user goals:', error);
      return [];
    }
  }

  private async filterDuplicateGoals(detectedGoals: DetectedGoal[], existingGoals: Goal[]): Promise<DetectedGoal[]> {
    return detectedGoals.filter(detected => {
      const similarity = existingGoals.some(existing => 
        this.calculateTitleSimilarity(detected.title, existing.title) > 0.7 ||
        this.calculateDescriptionSimilarity(detected.description, existing.description || '') > 0.8
      );
      return !similarity;
    });
  }

  private calculateTitleSimilarity(title1: string, title2: string): number {
    const words1 = title1.toLowerCase().split(' ');
    const words2 = title2.toLowerCase().split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private calculateDescriptionSimilarity(desc1: string, desc2: string): number {
    if (!desc1 || !desc2) return 0;
    const words1 = desc1.toLowerCase().split(' ').filter(w => w.length > 3);
    const words2 = desc2.toLowerCase().split(' ').filter(w => w.length > 3);
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private async createDetectedGoal(userId: string, goal: DetectedGoal, conversationContext: string): Promise<void> {
    try {
      const goalData: InsertGoal = {
        userId,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        priority: goal.priority,
        emotionalInvestment: goal.emotionalInvestment,
        urgency: goal.urgency,
        targetDate: goal.targetDate ? new Date(goal.targetDate) : null,
        detectedFromConversation: true,
        conversationContext: { originalMessage: conversationContext, confidence: goal.confidence },
        aiInsights: { detectionMethod: 'conversation_analysis', initialConfidence: goal.confidence },
      };
      
      await storage.createGoal(goalData);
    } catch (error) {
      console.error('Error creating detected goal:', error);
    }
  }

  private async recordProgressUpdate(userId: string, update: ProgressUpdate, conversationExcerpt: string): Promise<void> {
    try {
      const progressData: InsertGoalProgress = {
        goalId: update.goalId,
        userId,
        progressPercentage: update.progressPercentage,
        detectedActivity: update.detectedActivity,
        conversationExcerpt,
        aiConfidence: update.confidence,
        momentum: update.momentum,
        obstacles: update.obstacles,
      };
      
      await storage.createGoalProgress(progressData);
      
      // Update the goal's overall progress
      await storage.updateGoalProgress(update.goalId, update.progressPercentage);
    } catch (error) {
      console.error('Error recording progress update:', error);
    }
  }

  private async createGoalRelationship(primaryGoalId: string, relatedGoalId: string, relationship: any): Promise<void> {
    try {
      const relationshipData: InsertGoalRelationship = {
        primaryGoalId,
        relatedGoalId,
        relationshipType: relationship.relationshipType,
        strength: relationship.strength,
        impact: relationship.impact,
        aiDetected: true,
        userConfirmed: false,
      };
      
      await storage.createGoalRelationship(relationshipData);
    } catch (error) {
      console.error('Error creating goal relationship:', error);
    }
  }

  private async getRecentProgress(userId: string, days: number): Promise<GoalProgress[]> {
    try {
      return await storage.getRecentGoalProgress(userId, days);
    } catch (error) {
      console.error('Error getting recent progress:', error);
      return [];
    }
  }

  private calculateMomentum(goalId: string, recentProgress: GoalProgress[]): string {
    const goalProgress = recentProgress.filter(p => p.goalId === goalId);
    if (goalProgress.length < 2) return 'steady';
    
    const recent = goalProgress.slice(-2);
    if (recent[1].progressPercentage > recent[0].progressPercentage) return 'accelerating';
    if (recent[1].progressPercentage < recent[0].progressPercentage) return 'slowing';
    return 'steady';
  }

  private calculateOverallProgressTrend(recentProgress: GoalProgress[]): string {
    if (recentProgress.length === 0) return 'no_data';
    
    const accelerating = recentProgress.filter(p => p.momentum === 'accelerating').length;
    const total = recentProgress.length;
    
    if (accelerating / total > 0.6) return 'strong_progress';
    if (accelerating / total > 0.3) return 'steady_progress';
    return 'needs_attention';
  }
}

export const goalIntelligence = new GoalIntelligenceService();