
import { storage } from './storage';
import { generateAdvancedJournalInsights, detectGrowthPhase, analyzeSentiment } from './ai-service';

export interface GrowthTimelineData {
  date: Date;
  phase: "expansion" | "contraction" | "renewal";
  confidence: number;
  energyLevels: {
    mental: number;
    physical: number;
    emotional: number;
    spiritual: number;
  };
  journalSentiment?: number;
  keyEvents: string[];
  phaseTransition?: {
    from: string;
    to: string;
    trigger: string;
  };
}

export interface PatternVisualization {
  cyclicPatterns: Array<{
    pattern: string;
    frequency: number;
    predictability: number;
    visualization: {
      type: 'line' | 'circular' | 'heatmap';
      data: any[];
    };
  }>;
  energyFlowMaps: Array<{
    dimension: string;
    correlations: Array<{ with: string; strength: number; trend: 'positive' | 'negative' | 'neutral' }>;
    peaks: Array<{ date: Date; value: number; context: string }>;
    valleys: Array<{ date: Date; value: number; context: string }>;
  }>;
  phaseTransitionMap: {
    nodes: Array<{ phase: string; duration: number; frequency: number }>;
    edges: Array<{ from: string; to: string; frequency: number; avgDuration: number; triggers: string[] }>;
  };
}

export interface PredictiveModel {
  phaseTransitionPredictions: Array<{
    fromPhase: string;
    toPhase: string;
    probability: number;
    timeframe: string;
    confidenceInterval: { min: number; max: number };
    triggerIndicators: string[];
  }>;
  energyLevelForecasts: Array<{
    dimension: string;
    predictions: Array<{ date: Date; predictedValue: number; confidence: number }>;
    seasonalPatterns: Array<{ period: string; effect: number }>;
  }>;
  growthOpportunityWindows: Array<{
    phase: string;
    optimalActivities: string[];
    timeframe: string;
    probability: number;
  }>;
  riskFactors: Array<{
    factor: string;
    riskLevel: 'low' | 'medium' | 'high';
    indicators: string[];
    preventiveMeasures: string[];
  }>;
}

export interface CommunityCompatibilityMatrix {
  userProfile: {
    growthVector: number[];
    interactionStyle: string;
    supportNeeds: string[];
    supportGiving: string[];
  };
  compatibilityScores: Array<{
    userId: string;
    overallScore: number;
    dimensionScores: {
      phase: number;
      energy: number;
      values: number;
      communication: number;
      growth: number;
    };
    mutualBenefitPotential: number;
    conflictRisk: number;
    complementarityIndex: number;
  }>;
  networkAnalysis: {
    clusterMembership: string[];
    centralityScore: number;
    bridgePotential: number;
    influenceRadius: number;
  };
}

class AdvancedAnalyticsService {
  
  async generateGrowthTimeline(
    userId: string, 
    timeframe: '3months' | '6months' | '1year' | '2years'
  ): Promise<GrowthTimelineData[]> {
    try {
      const intervalDays = {
        '3months': 90,
        '6months': 180,
        '1year': 365,
        '2years': 730
      };

      // Get phase history
      const phaseHistory = await storage.getAll(`
        SELECT * FROM phase_history 
        WHERE user_id = $1 AND start_date > NOW() - INTERVAL '${intervalDays[timeframe]} days'
        ORDER BY start_date ASC
      `, [userId]);

      // Get energy patterns
      const energyData = await storage.getAll(`
        SELECT * FROM energy_patterns 
        WHERE user_id = $1 AND date > NOW() - INTERVAL '${intervalDays[timeframe]} days'
        ORDER BY date ASC
      `, [userId]);

      // Get journal entries with sentiment
      const journalData = await storage.getAll(`
        SELECT created_at, sentiment, ai_insights FROM journal_entries 
        WHERE user_id = $1 AND created_at > NOW() - INTERVAL '${intervalDays[timeframe]} days'
        ORDER BY created_at ASC
      `, [userId]);

      // Create daily timeline points
      const timeline: GrowthTimelineData[] = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - intervalDays[timeframe]);

      for (let i = 0; i <= intervalDays[timeframe]; i += 7) { // Weekly points
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        // Find closest phase data
        const closestPhase = this.findClosestPhaseData(currentDate, phaseHistory);
        
        // Find energy data for this week
        const weekEnergy = this.aggregateEnergyForWeek(currentDate, energyData);
        
        // Find journal sentiment for this week
        const weekSentiment = this.aggregateJournalSentiment(currentDate, journalData);
        
        // Extract key events
        const keyEvents = this.extractKeyEvents(currentDate, journalData, phaseHistory);

        // Detect phase transitions
        const phaseTransition = this.detectPhaseTransition(currentDate, phaseHistory);

        timeline.push({
          date: new Date(currentDate),
          phase: closestPhase?.phase || 'expansion',
          confidence: closestPhase?.confidence || 50,
          energyLevels: weekEnergy,
          journalSentiment: weekSentiment,
          keyEvents,
          phaseTransition
        });
      }

      return timeline;
    } catch (error) {
      console.error('Error generating growth timeline:', error);
      return [];
    }
  }

  async generatePatternVisualization(
    userId: string,
    timeframe: '3months' | '6months' | '1year'
  ): Promise<PatternVisualization> {
    try {
      const timeline = await this.generateGrowthTimeline(userId, timeframe);
      
      // Analyze cyclic patterns
      const cyclicPatterns = this.analyzeCyclicPatterns(timeline);
      
      // Generate energy flow maps
      const energyFlowMaps = this.generateEnergyFlowMaps(timeline);
      
      // Create phase transition map
      const phaseTransitionMap = this.createPhaseTransitionMap(timeline);

      return {
        cyclicPatterns,
        energyFlowMaps,
        phaseTransitionMap
      };
    } catch (error) {
      console.error('Error generating pattern visualization:', error);
      return {
        cyclicPatterns: [],
        energyFlowMaps: [],
        phaseTransitionMap: { nodes: [], edges: [] }
      };
    }
  }

  async generatePredictiveModel(
    userId: string,
    historicalData?: GrowthTimelineData[]
  ): Promise<PredictiveModel> {
    try {
      const data = historicalData || await this.generateGrowthTimeline(userId, '1year');
      
      // Phase transition predictions
      const phaseTransitionPredictions = this.predictPhaseTransitions(data);
      
      // Energy level forecasts
      const energyLevelForecasts = this.forecastEnergyLevels(data);
      
      // Growth opportunity windows
      const growthOpportunityWindows = this.identifyGrowthWindows(data);
      
      // Risk factors
      const riskFactors = this.assessRiskFactors(data);

      return {
        phaseTransitionPredictions,
        energyLevelForecasts,
        growthOpportunityWindows,
        riskFactors
      };
    } catch (error) {
      console.error('Error generating predictive model:', error);
      return {
        phaseTransitionPredictions: [],
        energyLevelForecasts: [],
        growthOpportunityWindows: [],
        riskFactors: []
      };
    }
  }

  async generateCompatibilityMatrix(
    userId: string,
    potentialMatches: string[]
  ): Promise<CommunityCompatibilityMatrix> {
    try {
      // Get user's profile and growth patterns
      const userProfile = await this.buildUserGrowthProfile(userId);
      
      // Calculate compatibility with each potential match
      const compatibilityScores = await Promise.all(
        potentialMatches.map(matchId => this.calculateDeepCompatibility(userId, matchId))
      );
      
      // Perform network analysis
      const networkAnalysis = await this.analyzeUserNetworkPosition(userId);

      return {
        userProfile,
        compatibilityScores,
        networkAnalysis
      };
    } catch (error) {
      console.error('Error generating compatibility matrix:', error);
      return {
        userProfile: {
          growthVector: [0, 0, 0, 0, 0],
          interactionStyle: 'balanced',
          supportNeeds: [],
          supportGiving: []
        },
        compatibilityScores: [],
        networkAnalysis: {
          clusterMembership: [],
          centralityScore: 0,
          bridgePotential: 0,
          influenceRadius: 0
        }
      };
    }
  }

  // Helper methods

  private findClosestPhaseData(date: Date, phaseHistory: any[]) {
    let closest = null;
    let minDiff = Infinity;

    for (const phase of phaseHistory) {
      const diff = Math.abs(new Date(phase.start_date).getTime() - date.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closest = phase;
      }
    }

    return closest;
  }

  private aggregateEnergyForWeek(date: Date, energyData: any[]) {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - 3);
    const weekEnd = new Date(date);
    weekEnd.setDate(date.getDate() + 3);

    const weekData = energyData.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });

    if (weekData.length === 0) {
      return { mental: 5, physical: 5, emotional: 5, spiritual: 5 };
    }

    return {
      mental: Math.round(weekData.reduce((sum, entry) => sum + (entry.mental_energy || 5), 0) / weekData.length),
      physical: Math.round(weekData.reduce((sum, entry) => sum + (entry.physical_energy || 5), 0) / weekData.length),
      emotional: Math.round(weekData.reduce((sum, entry) => sum + (entry.emotional_energy || 5), 0) / weekData.length),
      spiritual: Math.round(weekData.reduce((sum, entry) => sum + (entry.spiritual_energy || 5), 0) / weekData.length)
    };
  }

  private aggregateJournalSentiment(date: Date, journalData: any[]): number | undefined {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - 3);
    const weekEnd = new Date(date);
    weekEnd.setDate(date.getDate() + 3);

    const weekEntries = journalData.filter(entry => {
      const entryDate = new Date(entry.created_at);
      return entryDate >= weekStart && entryDate <= weekEnd && entry.sentiment !== null;
    });

    if (weekEntries.length === 0) return undefined;

    return weekEntries.reduce((sum, entry) => sum + entry.sentiment, 0) / weekEntries.length;
  }

  private extractKeyEvents(date: Date, journalData: any[], phaseHistory: any[]): string[] {
    const events: string[] = [];
    
    // Check for phase transitions
    const transition = phaseHistory.find(phase => {
      const phaseDate = new Date(phase.start_date);
      const diff = Math.abs(phaseDate.getTime() - date.getTime());
      return diff < 7 * 24 * 60 * 60 * 1000; // Within a week
    });

    if (transition) {
      events.push(`Phase transition to ${transition.phase}`);
    }

    // Check for significant journal insights
    const weekEntries = journalData.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const diff = Math.abs(entryDate.getTime() - date.getTime());
      return diff < 7 * 24 * 60 * 60 * 1000;
    });

    weekEntries.forEach(entry => {
      if (entry.ai_insights) {
        try {
          const insights = JSON.parse(entry.ai_insights);
          if (insights.significance > 80) {
            events.push(`Significant insight: ${insights.summary}`);
          }
        } catch (e) {
          // Invalid JSON, skip
        }
      }
    });

    return events;
  }

  private detectPhaseTransition(date: Date, phaseHistory: any[]) {
    const transition = phaseHistory.find(phase => {
      const phaseDate = new Date(phase.start_date);
      const diff = Math.abs(phaseDate.getTime() - date.getTime());
      return diff < 3 * 24 * 60 * 60 * 1000; // Within 3 days
    });

    if (!transition) return undefined;

    // Find previous phase
    const prevPhase = phaseHistory.find(p => 
      new Date(p.start_date) < new Date(transition.start_date)
    );

    if (!prevPhase) return undefined;

    return {
      from: prevPhase.phase,
      to: transition.phase,
      trigger: transition.triggers ? JSON.parse(transition.triggers)[0] : 'Natural progression'
    };
  }

  private analyzeCyclicPatterns(timeline: GrowthTimelineData[]) {
    const patterns = [];

    // Analyze phase cycles
    const phaseCycles = this.detectPhaseCycles(timeline);
    if (phaseCycles.length > 0) {
      patterns.push({
        pattern: 'Phase Cycle Duration',
        frequency: phaseCycles.length,
        predictability: this.calculateCyclePredictability(phaseCycles),
        visualization: {
          type: 'circular' as const,
          data: phaseCycles.map(cycle => ({
            phase: cycle.phase,
            duration: cycle.duration,
            position: cycle.position
          }))
        }
      });
    }

    // Analyze energy oscillations
    const energyPatterns = this.detectEnergyOscillations(timeline);
    patterns.push(...energyPatterns);

    return patterns;
  }

  private detectPhaseCycles(timeline: GrowthTimelineData[]) {
    const cycles = [];
    let currentCycle = { phase: timeline[0]?.phase, start: 0, duration: 0 };

    for (let i = 1; i < timeline.length; i++) {
      if (timeline[i].phase !== currentCycle.phase) {
        currentCycle.duration = i - currentCycle.start;
        cycles.push({
          ...currentCycle,
          position: currentCycle.start / timeline.length
        });
        currentCycle = { phase: timeline[i].phase, start: i, duration: 0 };
      }
    }

    return cycles;
  }

  private calculateCyclePredictability(cycles: any[]): number {
    if (cycles.length < 2) return 0;
    
    const durations = cycles.map(c => c.duration);
    const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);
    
    return Math.max(0, 100 - (stdDev / mean) * 100);
  }

  private detectEnergyOscillations(timeline: GrowthTimelineData[]) {
    const patterns = [];
    const dimensions = ['mental', 'physical', 'emotional', 'spiritual'];

    dimensions.forEach(dimension => {
      const values = timeline.map(t => t.energyLevels[dimension as keyof typeof t.energyLevels]);
      const oscillations = this.findOscillations(values);
      
      if (oscillations.frequency > 0) {
        patterns.push({
          pattern: `${dimension} Energy Oscillation`,
          frequency: oscillations.frequency,
          predictability: oscillations.regularity,
          visualization: {
            type: 'line' as const,
            data: values.map((value, index) => ({ x: index, y: value }))
          }
        });
      }
    });

    return patterns;
  }

  private findOscillations(values: number[]) {
    let peaks = 0;
    let valleys = 0;
    
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i-1] && values[i] > values[i+1]) peaks++;
      if (values[i] < values[i-1] && values[i] < values[i+1]) valleys++;
    }
    
    const totalCycles = Math.min(peaks, valleys);
    const regularity = totalCycles > 0 ? (peaks + valleys) / (2 * totalCycles) * 100 : 0;
    
    return {
      frequency: totalCycles,
      regularity: Math.min(regularity, 100)
    };
  }

  private generateEnergyFlowMaps(timeline: GrowthTimelineData[]) {
    const dimensions = ['mental', 'physical', 'emotional', 'spiritual'];
    const flowMaps = [];

    for (const dimension of dimensions) {
      const values = timeline.map(t => t.energyLevels[dimension as keyof typeof t.energyLevels]);
      
      // Calculate correlations with other dimensions
      const correlations = dimensions
        .filter(d => d !== dimension)
        .map(otherDim => {
          const otherValues = timeline.map(t => t.energyLevels[otherDim as keyof typeof t.energyLevels]);
          const correlation = this.calculateCorrelation(values, otherValues);
          return {
            with: otherDim,
            strength: Math.abs(correlation),
            trend: correlation > 0.1 ? 'positive' as const : correlation < -0.1 ? 'negative' as const : 'neutral' as const
          };
        });

      // Find peaks and valleys
      const peaks = [];
      const valleys = [];
      
      for (let i = 1; i < values.length - 1; i++) {
        if (values[i] > values[i-1] && values[i] > values[i+1] && values[i] >= 7) {
          peaks.push({
            date: timeline[i].date,
            value: values[i],
            context: timeline[i].keyEvents.length > 0 ? timeline[i].keyEvents[0] : 'High energy period'
          });
        }
        if (values[i] < values[i-1] && values[i] < values[i+1] && values[i] <= 3) {
          valleys.push({
            date: timeline[i].date,
            value: values[i],
            context: timeline[i].keyEvents.length > 0 ? timeline[i].keyEvents[0] : 'Low energy period'
          });
        }
      }

      flowMaps.push({
        dimension,
        correlations,
        peaks: peaks.slice(0, 5), // Top 5 peaks
        valleys: valleys.slice(0, 5) // Top 5 valleys
      });
    }

    return flowMaps;
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

  private createPhaseTransitionMap(timeline: GrowthTimelineData[]) {
    const phases = ['expansion', 'contraction', 'renewal'];
    const nodes = phases.map(phase => {
      const phaseData = timeline.filter(t => t.phase === phase);
      return {
        phase,
        duration: phaseData.length,
        frequency: phaseData.length / timeline.length
      };
    });

    const edges = [];
    const transitions = timeline.filter(t => t.phaseTransition);
    
    for (const phase1 of phases) {
      for (const phase2 of phases) {
        if (phase1 !== phase2) {
          const relevantTransitions = transitions.filter(t => 
            t.phaseTransition?.from === phase1 && t.phaseTransition?.to === phase2
          );
          
          if (relevantTransitions.length > 0) {
            const triggers = relevantTransitions.map(t => t.phaseTransition?.trigger || '').filter(Boolean);
            edges.push({
              from: phase1,
              to: phase2,
              frequency: relevantTransitions.length,
              avgDuration: 7, // Placeholder - would calculate from actual data
              triggers: [...new Set(triggers)]
            });
          }
        }
      }
    }

    return { nodes, edges };
  }

  private predictPhaseTransitions(timeline: GrowthTimelineData[]) {
    // Simplified prediction logic - in production would use more sophisticated ML
    const currentPhase = timeline[timeline.length - 1]?.phase || 'expansion';
    const phaseSequence = { expansion: 'contraction', contraction: 'renewal', renewal: 'expansion' };
    
    return [{
      fromPhase: currentPhase,
      toPhase: phaseSequence[currentPhase as keyof typeof phaseSequence],
      probability: 0.75,
      timeframe: '2-4 weeks',
      confidenceInterval: { min: 0.6, max: 0.9 },
      triggerIndicators: ['Decreased energy levels', 'Reflective journal entries', 'Completion of current goals']
    }];
  }

  private forecastEnergyLevels(timeline: GrowthTimelineData[]) {
    const dimensions = ['mental', 'physical', 'emotional', 'spiritual'];
    return dimensions.map(dimension => ({
      dimension,
      predictions: [], // Would implement time series forecasting
      seasonalPatterns: []
    }));
  }

  private identifyGrowthWindows(timeline: GrowthTimelineData[]) {
    return [
      {
        phase: 'expansion',
        optimalActivities: ['New skill learning', 'Network expansion', 'Goal setting'],
        timeframe: 'Next 2-3 weeks',
        probability: 0.8
      }
    ];
  }

  private assessRiskFactors(timeline: GrowthTimelineData[]) {
    return [
      {
        factor: 'Energy depletion',
        riskLevel: 'medium' as const,
        indicators: ['Consistently low energy scores', 'Negative journal sentiment'],
        preventiveMeasures: ['Schedule rest periods', 'Review energy management practices']
      }
    ];
  }

  private async buildUserGrowthProfile(userId: string) {
    // Simplified profile building
    return {
      growthVector: [0.7, 0.6, 0.8, 0.5, 0.9], // 5-dimensional growth vector
      interactionStyle: 'collaborative',
      supportNeeds: ['emotional validation', 'practical advice'],
      supportGiving: ['active listening', 'resource sharing']
    };
  }

  private async calculateDeepCompatibility(userId1: string, userId2: string) {
    // Simplified compatibility calculation
    return {
      userId: userId2,
      overallScore: 0.75,
      dimensionScores: {
        phase: 0.8,
        energy: 0.7,
        values: 0.8,
        communication: 0.7,
        growth: 0.75
      },
      mutualBenefitPotential: 0.8,
      conflictRisk: 0.2,
      complementarityIndex: 0.85
    };
  }

  private async analyzeUserNetworkPosition(userId: string) {
    return {
      clusterMembership: ['growth-focused', 'authentic-success'],
      centralityScore: 0.6,
      bridgePotential: 0.7,
      influenceRadius: 0.5
    };
  }
}

export const advancedAnalytics = new AdvancedAnalyticsService();
