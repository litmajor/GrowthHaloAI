
import { storage } from './storage';
import { detectGrowthPhase, analyzeSentiment, generateJournalInsights } from './ai-service';

export interface UserGrowthData {
  userId: string;
  currentPhase: "expansion" | "contraction" | "renewal";
  phaseConfidence: number;
  energyLevels: {
    mental: number;
    physical: number;
    emotional: number;
    spiritual: number;
  };
  recentInsights: string[];
  growthPatterns: Array<{
    pattern: string;
    frequency: number;
    lastOccurrence: Date;
  }>;
}

export class GrowthTrackingService {
  async trackPhaseTransition(userId: string, newPhase: "expansion" | "contraction" | "renewal", confidence: number, trigger?: string) {
    try {
      // Update current phase
      await storage.execute(`
        UPDATE user_profiles 
        SET current_phase = $1, phase_confidence = $2, updated_at = NOW()
        WHERE user_id = $3
      `, [newPhase, confidence, userId]);

      // Record phase history
      await storage.execute(`
        INSERT INTO phase_history (user_id, phase, confidence, triggers)
        VALUES ($1, $2, $3, $4)
      `, [userId, newPhase, confidence, trigger ? JSON.stringify([trigger]) : null]);

      return { success: true };
    } catch (error) {
      console.error('Error tracking phase transition:', error);
      throw error;
    }
  }

  async updateEnergyPatterns(userId: string, energyData: {
    mental: number;
    physical: number;
    emotional: number;
    spiritual: number;
    mood: number;
    notes?: string;
  }) {
    try {
      await storage.execute(`
        INSERT INTO energy_patterns (user_id, mental_energy, physical_energy, emotional_energy, spiritual_energy, overall_mood, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [userId, energyData.mental, energyData.physical, energyData.emotional, energyData.spiritual, energyData.mood, energyData.notes]);

      return { success: true };
    } catch (error) {
      console.error('Error updating energy patterns:', error);
      throw error;
    }
  }

  async saveJournalEntry(userId: string, content: string) {
    try {
      // Analyze sentiment and detect phase
      const [sentimentAnalysis, phaseDetection] = await Promise.all([
        analyzeSentiment(content),
        detectGrowthPhase(content)
      ]);

      // Save journal entry with AI insights
      await storage.execute(`
        INSERT INTO journal_entries (user_id, content, ai_insights, detected_phase, sentiment, tags)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        userId,
        content, // In production, this should be encrypted
        JSON.stringify({
          sentimentAnalysis,
          phaseInsights: phaseDetection.insights,
          emotionalTone: sentimentAnalysis.emotionalTone
        }),
        phaseDetection.phase,
        sentimentAnalysis.sentiment,
        JSON.stringify(sentimentAnalysis.keywords)
      ]);

      // Update user's phase if confidence is high enough
      if (phaseDetection.confidence > 80) {
        await this.trackPhaseTransition(userId, phaseDetection.phase, phaseDetection.confidence, 'journal_entry');
      }

      return {
        success: true,
        insights: phaseDetection.insights,
        detectedPhase: phaseDetection.phase,
        confidence: phaseDetection.confidence
      };
    } catch (error) {
      console.error('Error saving journal entry:', error);
      throw error;
    }
  }

  async getUserGrowthData(userId: string): Promise<UserGrowthData> {
    try {
      // Get user profile
      const profile = await storage.get(`
        SELECT * FROM user_profiles WHERE user_id = $1
      `, [userId]);

      // Get recent energy patterns
      const recentEnergy = await storage.get(`
        SELECT * FROM energy_patterns 
        WHERE user_id = $1 
        ORDER BY date DESC 
        LIMIT 7
      `, [userId]);

      // Get recent insights
      const recentInsights = await storage.all(`
        SELECT ai_insights FROM journal_entries 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 5
      `, [userId]);

      // Calculate average energy levels
      const avgEnergy = recentEnergy.length > 0 ? {
        mental: Math.round(recentEnergy.reduce((sum: number, entry: any) => sum + (entry.mental_energy || 5), 0) / recentEnergy.length),
        physical: Math.round(recentEnergy.reduce((sum: number, entry: any) => sum + (entry.physical_energy || 5), 0) / recentEnergy.length),
        emotional: Math.round(recentEnergy.reduce((sum: number, entry: any) => sum + (entry.emotional_energy || 5), 0) / recentEnergy.length),
        spiritual: Math.round(recentEnergy.reduce((sum: number, entry: any) => sum + (entry.spiritual_energy || 5), 0) / recentEnergy.length),
      } : { mental: 5, physical: 5, emotional: 5, spiritual: 5 };

      return {
        userId,
        currentPhase: profile?.current_phase || 'expansion',
        phaseConfidence: profile?.phase_confidence || 75,
        energyLevels: avgEnergy,
        recentInsights: recentInsights.map((entry: any) => {
          try {
            const insights = JSON.parse(entry.ai_insights || '{}');
            return insights.phaseInsights || [];
          } catch {
            return [];
          }
        }).flat().slice(0, 10),
        growthPatterns: [] // Would be calculated from historical data
      };
    } catch (error) {
      console.error('Error getting user growth data:', error);
      // Return default data
      return {
        userId,
        currentPhase: 'expansion',
        phaseConfidence: 75,
        energyLevels: { mental: 5, physical: 5, emotional: 5, spiritual: 5 },
        recentInsights: [],
        growthPatterns: []
      };
    }
  }

  async generateWeeklyInsights(userId: string) {
    try {
      // Get journal entries from the past week
      const entries = await storage.all(`
        SELECT content FROM journal_entries 
        WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC
      `, [userId]);

      if (entries.length === 0) {
        return { insights: 'No journal entries this week to analyze.' };
      }

      const entryTexts = entries.map((entry: any) => entry.content);
      const insights = await generateJournalInsights(entryTexts, 'week');

      return insights;
    } catch (error) {
      console.error('Error generating weekly insights:', error);
      return { insights: 'Unable to generate insights at this time.' };
    }
  }
}

export const growthTracker = new GrowthTrackingService();
