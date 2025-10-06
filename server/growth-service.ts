
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
  async analyzeGrowthPatterns(userId: string, timeframe: 'week' | 'month' | '3months' | 'year'): Promise<{
    cyclicalPatterns: Array<{ pattern: string; frequency: number; predictability: number }>;
    phaseTransitionTriggers: Array<{ trigger: string; frequency: number; phases: string[] }>;
    energyCorrelations: Array<{ metric: string; correlation: number; insight: string }>;
    anomalies: Array<{ date: Date; description: string; significance: number }>;
    predictions: Array<{ prediction: string; confidence: number; timeframe: string }>;
  }> {
    try {
      // Get comprehensive historical data
      const phaseHistory = await storage.getAll(`
        SELECT * FROM phase_history 
        WHERE user_id = $1 AND start_date > NOW() - INTERVAL '${timeframe === 'week' ? '7 days' : timeframe === 'month' ? '30 days' : timeframe === '3months' ? '90 days' : '365 days'}'
        ORDER BY start_date DESC
      `, [userId]);

      const energyData = await storage.getAll(`
        SELECT * FROM energy_patterns 
        WHERE user_id = $1 AND date > NOW() - INTERVAL '${timeframe === 'week' ? '7 days' : timeframe === 'month' ? '30 days' : timeframe === '3months' ? '90 days' : '365 days'}'
        ORDER BY date DESC
      `, [userId]);

      const journalEntries = await storage.getAll(`
        SELECT content, ai_insights, detected_phase, sentiment, created_at FROM journal_entries 
        WHERE user_id = $1 AND created_at > NOW() - INTERVAL '${timeframe === 'week' ? '7 days' : timeframe === 'month' ? '30 days' : timeframe === '3months' ? '90 days' : '365 days'}'
        ORDER BY created_at DESC
      `, [userId]);

      // Analyze cyclical patterns
      const cyclicalPatterns = this.detectCyclicalPatterns(phaseHistory, energyData);
      
      // Identify transition triggers
      const transitionTriggers = this.analyzeTransitionTriggers(phaseHistory, journalEntries);
      
      // Calculate energy correlations
      const energyCorrelations = this.calculateEnergyCorrelations(energyData, phaseHistory);
      
      // Detect anomalies
      const anomalies = this.detectAnomalies(energyData, journalEntries);
      
      // Generate predictions
      const predictions = await this.generatePredictions(userId, phaseHistory, energyData, journalEntries);

      return {
        cyclicalPatterns,
        phaseTransitionTriggers: transitionTriggers,
        energyCorrelations,
        anomalies,
        predictions
      };
    } catch (error) {
      console.error('Error analyzing growth patterns:', error);
      return {
        cyclicalPatterns: [],
        phaseTransitionTriggers: [],
        energyCorrelations: [],
        anomalies: [],
        predictions: []
      };
    }
  }

  private detectCyclicalPatterns(phaseHistory: any[], energyData: any[]): Array<{ pattern: string; frequency: number; predictability: number }> {
  const patterns: Array<{ pattern: string; frequency: number; predictability: number }> = [];
    
    // Analyze phase cycle lengths
    if (phaseHistory.length >= 3) {
      const phaseDurations = phaseHistory.map((phase, index) => {
        if (index === 0) return null;
        const prevPhase = phaseHistory[index - 1];
        const duration = new Date(phase.start_date).getTime() - new Date(prevPhase.start_date).getTime();
        return { phase: phase.phase, duration: duration / (1000 * 60 * 60 * 24) }; // days
      }).filter(Boolean);

      const avgExpansionDuration = phaseDurations.filter(p => p?.phase === 'expansion').reduce((sum, p) => sum + (p?.duration || 0), 0) / phaseDurations.filter(p => p?.phase === 'expansion').length || 0;
      const avgContractionDuration = phaseDurations.filter(p => p?.phase === 'contraction').reduce((sum, p) => sum + (p?.duration || 0), 0) / phaseDurations.filter(p => p?.phase === 'contraction').length || 0;

      if (avgExpansionDuration > 0) {
        patterns.push({
          pattern: `Expansion phases typically last ${Math.round(avgExpansionDuration)} days`,
          frequency: phaseDurations.filter(p => p?.phase === 'expansion').length,
          predictability: this.calculatePredictability(phaseDurations.filter(p => p?.phase === 'expansion'))
        });
      }

      if (avgContractionDuration > 0) {
        patterns.push({
          pattern: `Contraction phases typically last ${Math.round(avgContractionDuration)} days`,
          frequency: phaseDurations.filter(p => p?.phase === 'contraction').length,
          predictability: this.calculatePredictability(phaseDurations.filter(p => p?.phase === 'contraction'))
        });
      }
    }

    // Analyze energy patterns
    if (energyData.length >= 7) {
      const weeklyPatterns = this.analyzeWeeklyEnergyPatterns(energyData);
      patterns.push(...weeklyPatterns);
    }

    return patterns;
  }

  private calculatePredictability(durations: any[]): number {
    if (durations.length < 2) return 0;
    const values = durations.map(d => d?.duration || 0);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(0, 100 - (stdDev / mean) * 100); // Lower standard deviation = higher predictability
  }

  private analyzeWeeklyEnergyPatterns(energyData: any[]): Array<{ pattern: string; frequency: number; predictability: number }> {
    const patterns = [];
  const dailyAverages: number[][] = [[], [], [], [], [], [], []]; // Sunday = 0

    energyData.forEach(entry => {
      const dayOfWeek = new Date(entry.date).getDay();
      const avgEnergy = (entry.mental_energy + entry.physical_energy + entry.emotional_energy + entry.spiritual_energy) / 4;
      dailyAverages[dayOfWeek].push(avgEnergy);
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let bestDay = -1;
    let worstDay = -1;
    let bestAvg = 0;
    let worstAvg = 10;

    for (let dayNum = 0; dayNum < dailyAverages.length; dayNum++) {
      const energies = dailyAverages[dayNum];
      if (energies.length > 0) {
        const avg = energies.reduce((sum: number, val: number) => sum + val, 0) / energies.length;
        if (avg > bestAvg) {
          bestAvg = avg;
          bestDay = dayNum;
        }
        if (avg < worstAvg) {
          worstAvg = avg;
          worstDay = dayNum;
        }
      }
  }

    if (bestDay >= 0) {
      patterns.push({
        pattern: `Highest energy levels typically occur on ${dayNames[bestDay]}`,
        frequency: dailyAverages[bestDay].length,
        predictability: 75
      });
    }

    if (worstDay >= 0) {
      patterns.push({
        pattern: `Lowest energy levels typically occur on ${dayNames[worstDay]}`,
        frequency: dailyAverages[worstDay].length,
        predictability: 75
      });
    }

    return patterns;
  }

  private analyzeTransitionTriggers(phaseHistory: any[], journalEntries: any[]): Array<{ trigger: string; frequency: number; phases: string[] }> {
    const triggers = new Map();

    phaseHistory.forEach(phase => {
      if (phase.triggers) {
        try {
          const phaseTriggers = JSON.parse(phase.triggers);
          phaseTriggers.forEach((trigger: string) => {
            const key = trigger.toLowerCase();
            if (!triggers.has(key)) {
              triggers.set(key, { trigger, frequency: 0, phases: new Set() });
            }
            triggers.get(key).frequency++;
            triggers.get(key).phases.add(phase.phase);
          });
        } catch (error) {
          // Invalid JSON, skip
        }
      }
    });

    // Analyze journal entries for implicit triggers
    journalEntries.forEach(entry => {
      const keywords = ['stress', 'deadline', 'relationship', 'work', 'health', 'family', 'travel', 'project', 'change'];
      keywords.forEach(keyword => {
        if (entry.content.toLowerCase().includes(keyword)) {
          const key = `journal_${keyword}`;
          if (!triggers.has(key)) {
            triggers.set(key, { trigger: `${keyword} (from journal)`, frequency: 0, phases: new Set() });
          }
          triggers.get(key).frequency++;
          if (entry.detected_phase) {
            triggers.get(key).phases.add(entry.detected_phase);
          }
        }
      });
    });

    return Array.from(triggers.values()).map(trigger => ({
      ...trigger,
      phases: Array.from(trigger.phases)
    })).sort((a, b) => b.frequency - a.frequency);
  }

  private calculateEnergyCorrelations(energyData: any[], phaseHistory: any[]): Array<{ metric: string; correlation: number; insight: string }> {
  const correlations: Array<{ metric: string; correlation: number; insight: string }> = [];

    if (energyData.length < 5) return correlations;

    // Calculate correlation between different energy types
    const mentalEnergy = energyData.map(e => e.mental_energy || 5);
    const physicalEnergy = energyData.map(e => e.physical_energy || 5);
    const emotionalEnergy = energyData.map(e => e.emotional_energy || 5);
    const spiritualEnergy = energyData.map(e => e.spiritual_energy || 5);

    const mentalPhysicalCorr = this.calculateCorrelation(mentalEnergy, physicalEnergy);
    const mentalEmotionalCorr = this.calculateCorrelation(mentalEnergy, emotionalEnergy);
    const emotionalSpiritualCorr = this.calculateCorrelation(emotionalEnergy, spiritualEnergy);

    correlations.push({
      metric: 'Mental-Physical Energy',
      correlation: mentalPhysicalCorr,
      insight: mentalPhysicalCorr > 0.7 ? 'Strong connection between mental and physical energy - physical activity boosts mental clarity' :
               mentalPhysicalCorr < -0.3 ? 'Mental energy tends to be low when physical energy is high - possible overexertion pattern' :
               'Mental and physical energy operate somewhat independently'
    });

    correlations.push({
      metric: 'Mental-Emotional Energy',
      correlation: mentalEmotionalCorr,
      insight: mentalEmotionalCorr > 0.7 ? 'Mental clarity strongly tied to emotional state - emotional regulation supports cognitive function' :
               mentalEmotionalCorr < -0.3 ? 'Mental energy increases as emotional energy decreases - possible coping mechanism through intellectualization' :
               'Mental and emotional energy have moderate connection'
    });

    correlations.push({
      metric: 'Emotional-Spiritual Energy',
      correlation: emotionalSpiritualCorr,
      insight: emotionalSpiritualCorr > 0.7 ? 'Strong spiritual-emotional connection - spiritual practices support emotional wellbeing' :
               emotionalSpiritualCorr < -0.3 ? 'Spiritual seeking increases during emotional challenges - growth through difficulty pattern' :
               'Emotional and spiritual energy are moderately connected'
    });

    return correlations;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;

    const xMean = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let xSumSquares = 0;
    let ySumSquares = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      numerator += xDiff * yDiff;
      xSumSquares += xDiff * xDiff;
      ySumSquares += yDiff * yDiff;
    }

    const denominator = Math.sqrt(xSumSquares * ySumSquares);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private detectAnomalies(energyData: any[], journalEntries: any[]): Array<{ date: Date; description: string; significance: number }> {
  const anomalies: Array<{ date: Date; description: string; significance: number }> = [];

    // Detect energy anomalies
    if (energyData.length >= 7) {
      const energyAverages = energyData.map(e => (e.mental_energy + e.physical_energy + e.emotional_energy + e.spiritual_energy) / 4);
      const mean = energyAverages.reduce((sum, val) => sum + val, 0) / energyAverages.length;
      const stdDev = Math.sqrt(energyAverages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / energyAverages.length);

      energyData.forEach(entry => {
        const avgEnergy = (entry.mental_energy + entry.physical_energy + entry.emotional_energy + entry.spiritual_energy) / 4;
        const zScore = Math.abs((avgEnergy - mean) / stdDev);
        
        if (zScore > 2) { // More than 2 standard deviations from mean
          anomalies.push({
            date: new Date(entry.date),
            description: avgEnergy > mean ? 'Unusually high energy levels across all dimensions' : 'Unusually low energy levels across all dimensions',
            significance: Math.min(100, zScore * 25)
          });
        }
      });
    }

    // Detect sentiment anomalies in journal entries
    if (journalEntries.length >= 5) {
      const sentiments = journalEntries.map(e => e.sentiment || 0);
      const sentimentMean = sentiments.reduce((sum, val) => sum + val, 0) / sentiments.length;
      const sentimentStdDev = Math.sqrt(sentiments.reduce((sum, val) => sum + Math.pow(val - sentimentMean, 2), 0) / sentiments.length);

      journalEntries.forEach(entry => {
        if (entry.sentiment !== null) {
          const zScore = Math.abs((entry.sentiment - sentimentMean) / sentimentStdDev);
          
          if (zScore > 2) {
            anomalies.push({
              date: new Date(entry.created_at),
              description: entry.sentiment > sentimentMean ? 'Unusually positive emotional state in journal' : 'Unusually challenging emotional state in journal',
              significance: Math.min(100, zScore * 25)
            });
          }
        }
      });
    }

  return anomalies.sort((a, b) => b.significance - a.significance);
  }

  private async generatePredictions(userId: string, phaseHistory: any[], energyData: any[], journalEntries: any[]): Promise<Array<{ prediction: string; confidence: number; timeframe: string }>> {
  const predictions: Array<{ prediction: string; confidence: number; timeframe: string }> = [];

    // Predict next phase transition based on historical patterns
    if (phaseHistory.length >= 2) {
      const currentPhase = phaseHistory[0];
      const phaseDurations = phaseHistory.slice(1).map(phase => {
        const duration = new Date(currentPhase.start_date).getTime() - new Date(phase.start_date).getTime();
        return duration / (1000 * 60 * 60 * 24); // days
      });

      const avgDuration = phaseDurations.reduce((sum, dur) => sum + dur, 0) / phaseDurations.length;
      const daysSinceStart = (Date.now() - new Date(currentPhase.start_date).getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceStart > avgDuration * 0.7) {
        const nextPhases = {
          expansion: 'contraction',
          contraction: 'renewal', 
          renewal: 'expansion'
        };
        
        predictions.push({
    prediction: `Likely to transition to ${nextPhases[String(currentPhase.phase) as 'expansion'|'contraction'|'renewal']} phase within the next ${Math.round(avgDuration - daysSinceStart)} days`,
          confidence: Math.min(85, 60 + (phaseDurations.length * 5)),
          timeframe: `${Math.round(avgDuration - daysSinceStart)} days`
        });
      }
    }

    // Predict energy patterns based on weekly cycles
    if (energyData.length >= 14) {
      const today = new Date().getDay();
      const nextDay = (today + 1) % 7;
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      const nextDayEnergies = energyData.filter(e => new Date(e.date).getDay() === nextDay);
      if (nextDayEnergies.length >= 2) {
        const avgEnergy = nextDayEnergies.reduce((sum, e) => sum + (e.mental_energy + e.physical_energy + e.emotional_energy + e.spiritual_energy) / 4, 0) / nextDayEnergies.length;
        
        predictions.push({
          prediction: `Tomorrow (${dayNames[nextDay]}) likely to have ${avgEnergy > 6.5 ? 'above average' : avgEnergy < 4.5 ? 'below average' : 'moderate'} energy levels`,
          confidence: Math.min(75, 50 + nextDayEnergies.length * 5),
          timeframe: '1 day'
        });
      }
    }

    return predictions;
  }

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
        detectGrowthPhase(userId, content)
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
      const recentEnergy = await storage.getAll(`
        SELECT * FROM energy_patterns 
        WHERE user_id = $1 
        ORDER BY date DESC 
        LIMIT 7
      `, [userId]) || [];

      // Get recent insights
      const recentInsights = await storage.getAll(`
        SELECT ai_insights FROM journal_entries 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 5
      `, [userId]) || [];

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
      const entries = await storage.getAll(`
        SELECT content FROM journal_entries 
        WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC
      `, [userId]) || [];

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
