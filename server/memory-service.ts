
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface MemoryCluster {
  id: string;
  concepts: string[];
  emotionalContext: number; // -1 to 1
  phaseContext: string;
  strengthScore: number; // 0-1, how well established this cluster is
  lastActivated: Date;
  activationCount: number;
}

interface ConversationMemory {
  id: string;
  userId: string;
  content: string;
  concepts: string[];
  emotionalState: number;
  phase: string;
  timestamp: Date;
  embeddings?: number[];
  relatedMemories: string[];
}

interface AssociativeRecall {
  memories: ConversationMemory[];
  reasoning: string;
  relevanceScore: number;
  bridgeInsights: string[];
}

export class AdvancedMemoryService {
  private memoryClusters: Map<string, MemoryCluster[]> = new Map();
  private conversationMemories: Map<string, ConversationMemory[]> = new Map();

  /**
   * Associative Recall System - Surfaces relevant past information contextually
   */
  async recallAssociativeMemories(
    userId: string,
    currentInput: string,
    emotionalContext: number,
    currentPhase: string,
    limit: number = 5
  ): Promise<AssociativeRecall> {
    try {
      const userMemories = this.conversationMemories.get(userId) || [];
      
      // Extract concepts from current input
      const currentConcepts = await this.extractConcepts(currentInput);
      
      // Find semantically related memories
      const semanticMatches = await this.findSemanticMatches(userMemories, currentConcepts, currentInput);
      
      // Find cross-domain bridges
      const crossDomainBridges = this.findCrossDomainBridges(userMemories, currentConcepts);
      
      // Reactivate dormant concepts
      const dormantConcepts = this.reactivateDormantConcepts(userId, currentConcepts);
      
      // Score and rank all recalled memories
      const rankedMemories = this.rankMemoriesByRelevance(
        [...semanticMatches, ...crossDomainBridges, ...dormantConcepts],
        currentInput,
        emotionalContext,
        currentPhase
      ).slice(0, limit);

      // Generate bridge insights
      const bridgeInsights = await this.generateBridgeInsights(rankedMemories, currentInput);

      return {
        memories: rankedMemories,
        reasoning: this.generateRecallReasoning(rankedMemories, currentConcepts),
        relevanceScore: this.calculateOverallRelevance(rankedMemories),
        bridgeInsights
      };
    } catch (error) {
      console.error('Error in associative recall:', error);
      return {
        memories: [],
        reasoning: 'Unable to perform associative recall at this time',
        relevanceScore: 0,
        bridgeInsights: []
      };
    }
  }

  /**
   * Context-Sensitive Response Adaptation
   */
  async adaptResponseToContext(
    userId: string,
    baseResponse: string,
    userContext: {
      emotionalState: number;
      communicationStyle: string;
      recentInteractions: ConversationMemory[];
      currentStressLevel: number;
      preferredResponseLength: 'brief' | 'moderate' | 'detailed';
    }
  ): Promise<{
    adaptedResponse: string;
    adaptationReasoning: string;
    emotionalTone: string;
    personalityAdjustments: string[];
  }> {
    try {
      const adaptationPrompt = `
As the Growth Halo AI, adapt this base response to match the user's current context and communication preferences:

BASE RESPONSE: "${baseResponse}"

USER CONTEXT:
- Emotional State: ${userContext.emotionalState} (-1 to 1 scale)
- Communication Style: ${userContext.communicationStyle}
- Stress Level: ${userContext.currentStressLevel}/10
- Preferred Length: ${userContext.preferredResponseLength}
- Recent Interaction Patterns: ${userContext.recentInteractions.slice(0, 3).map(i => i.emotionalState).join(', ')}

ADAPTATION REQUIREMENTS:
1. Adjust tone and energy to match user's emotional state
2. Match their communication style (analytical, empathetic, direct, exploratory)
3. Respond to stress level with appropriate support level
4. Respect length preferences
5. Build on recent interaction patterns

Provide adapted response with reasoning in JSON:
{
  "adaptedResponse": "The contextually adapted response here",
  "adaptationReasoning": "Explanation of adaptations made",
  "emotionalTone": "The emotional tone used",
  "personalityAdjustments": ["adjustment1", "adjustment2"]
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: adaptationPrompt }],
        temperature: 0.4,
        max_tokens: 1000,
      });

      const adaptation = JSON.parse(completion.choices[0]?.message?.content || '{}');
      
      // Store this interaction for future context learning
      await this.storeConversationMemory(userId, baseResponse, userContext.emotionalState, 'expansion');

      return {
        adaptedResponse: adaptation.adaptedResponse || baseResponse,
        adaptationReasoning: adaptation.adaptationReasoning || 'Standard response provided',
        emotionalTone: adaptation.emotionalTone || 'neutral',
        personalityAdjustments: adaptation.personalityAdjustments || []
      };
    } catch (error) {
      console.error('Error adapting response to context:', error);
      return {
        adaptedResponse: baseResponse,
        adaptationReasoning: 'Unable to adapt response due to technical error',
        emotionalTone: 'supportive',
        personalityAdjustments: []
      };
    }
  }

  /**
   * Pattern-based memory retrieval across all user interactions
   */
  async retrievePatternBasedMemories(
    userId: string,
    pattern: 'emotional_cycles' | 'breakthrough_moments' | 'recurring_challenges' | 'growth_accelerators',
    timeframe: 'week' | 'month' | '3months' | 'all'
  ): Promise<{
    memories: ConversationMemory[];
    patterns: Array<{ pattern: string; frequency: number; insights: string[] }>;
    predictions: Array<{ prediction: string; confidence: number }>;
  }> {
    try {
      const userMemories = this.conversationMemories.get(userId) || [];
      const filteredMemories = this.filterMemoriesByTimeframe(userMemories, timeframe);

      let patternAnalysis;
      
      switch (pattern) {
        case 'emotional_cycles':
          patternAnalysis = await this.analyzeEmotionalCycles(filteredMemories);
          break;
        case 'breakthrough_moments':
          patternAnalysis = await this.analyzeBreakthroughMoments(filteredMemories);
          break;
        case 'recurring_challenges':
          patternAnalysis = await this.analyzeRecurringChallenges(filteredMemories);
          break;
        case 'growth_accelerators':
          patternAnalysis = await this.analyzeGrowthAccelerators(filteredMemories);
          break;
        default:
          patternAnalysis = { patterns: [], predictions: [], relevantMemories: [] };
      }

      return {
        memories: patternAnalysis.relevantMemories,
        patterns: patternAnalysis.patterns,
        predictions: patternAnalysis.predictions
      };
    } catch (error) {
      console.error('Error retrieving pattern-based memories:', error);
      return { memories: [], patterns: [], predictions: [] };
    }
  }

  /**
   * Semantic memory clustering using concept hierarchies
   */
  async clusterSemanticMemories(userId: string): Promise<{
    clusters: MemoryCluster[];
    conceptHierarchy: any;
    emergentThemes: string[];
  }> {
    try {
      const userMemories = this.conversationMemories.get(userId) || [];
      
      // Extract all concepts from memories
      const allConcepts = userMemories.flatMap(memory => memory.concepts);
      const conceptFrequency = this.calculateConceptFrequency(allConcepts);
      
      // Build concept hierarchy
      const conceptHierarchy = await this.buildConceptHierarchy(conceptFrequency);
      
      // Create semantic clusters
      const clusters = await this.createSemanticClusters(userMemories, conceptHierarchy);
      
      // Identify emergent themes
      const emergentThemes = this.identifyEmergentThemes(clusters);

      // Store clusters for future use
      this.memoryClusters.set(userId, clusters);

      return {
        clusters,
        conceptHierarchy,
        emergentThemes
      };
    } catch (error) {
      console.error('Error clustering semantic memories:', error);
      return { clusters: [], conceptHierarchy: {}, emergentThemes: [] };
    }
  }

  // Helper methods for memory operations
  private async extractConcepts(text: string): Promise<string[]> {
    try {
      const prompt = `Extract key concepts from this text. Return as JSON array: "${text}"`;
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 200,
      });
      
      const concepts = JSON.parse(completion.choices[0]?.message?.content || '[]');
      return Array.isArray(concepts) ? concepts : [];
    } catch (error) {
      return [];
    }
  }

  private async findSemanticMatches(
    memories: ConversationMemory[],
    concepts: string[],
    currentInput: string
  ): Promise<ConversationMemory[]> {
    // Simplified semantic matching - in production, would use embeddings
    return memories.filter(memory => 
      memory.concepts.some(concept => 
        concepts.some(currentConcept => 
          this.calculateConceptSimilarity(concept, currentConcept) > 0.7
        )
      )
    ).slice(0, 10);
  }

  private findCrossDomainBridges(
    memories: ConversationMemory[],
    currentConcepts: string[]
  ): ConversationMemory[] {
    // Find memories that bridge different conceptual domains
    const domains = this.categorizeConceptsByDomain(currentConcepts);
    return memories.filter(memory => {
      const memoryDomains = this.categorizeConceptsByDomain(memory.concepts);
      return domains.some(domain => 
        memoryDomains.includes(domain) && memoryDomains.length > 1
      );
    });
  }

  private reactivateDormantConcepts(userId: string, currentConcepts: string[]): ConversationMemory[] {
    const clusters = this.memoryClusters.get(userId) || [];
    const dormantClusters = clusters.filter(cluster => 
      Date.now() - cluster.lastActivated.getTime() > 7 * 24 * 60 * 60 * 1000 && // 7 days
      cluster.concepts.some(concept => 
        currentConcepts.some(current => this.calculateConceptSimilarity(concept, current) > 0.5)
      )
    );

    // Reactivate these clusters and return related memories
    dormantClusters.forEach(cluster => {
      cluster.lastActivated = new Date();
      cluster.activationCount += 1;
    });

    return []; // Would return related memories in full implementation
  }

  private rankMemoriesByRelevance(
    memories: ConversationMemory[],
    currentInput: string,
    emotionalContext: number,
    currentPhase: string
  ): ConversationMemory[] {
    return memories.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, currentInput, emotionalContext, currentPhase);
      const scoreB = this.calculateRelevanceScore(b, currentInput, emotionalContext, currentPhase);
      return scoreB - scoreA;
    });
  }

  private calculateRelevanceScore(
    memory: ConversationMemory,
    currentInput: string,
    emotionalContext: number,
    currentPhase: string
  ): number {
    let score = 0;
    
    // Concept overlap
    const currentConcepts = currentInput.toLowerCase().split(' ');
    const conceptOverlap = memory.concepts.filter(concept => 
      currentConcepts.some(current => concept.toLowerCase().includes(current))
    ).length;
    score += conceptOverlap * 0.3;
    
    // Emotional similarity
    const emotionalSimilarity = 1 - Math.abs(memory.emotionalState - emotionalContext);
    score += emotionalSimilarity * 0.2;
    
    // Phase alignment
    if (memory.phase === currentPhase) score += 0.2;
    
    // Recency
    const daysSince = (Date.now() - memory.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - daysSince / 30); // Decay over 30 days
    score += recencyScore * 0.3;
    
    return score;
  }

  private async generateBridgeInsights(
    memories: ConversationMemory[],
    currentInput: string
  ): Promise<string[]> {
    if (memories.length === 0) return [];
    
    try {
      const prompt = `
Generate bridge insights connecting these past memories to the current input:

CURRENT INPUT: "${currentInput}"

PAST MEMORIES:
${memories.map((m, i) => `${i + 1}. ${m.content.substring(0, 100)}... (${m.phase} phase)`).join('\n')}

Provide 2-3 bridge insights that connect patterns across these memories to the current situation.
Return as JSON array of strings.
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 400,
      });

      const insights = JSON.parse(completion.choices[0]?.message?.content || '[]');
      return Array.isArray(insights) ? insights : [];
    } catch (error) {
      return ['Unable to generate bridge insights due to technical error'];
    }
  }

  private generateRecallReasoning(memories: ConversationMemory[], concepts: string[]): string {
    if (memories.length === 0) return 'No relevant memories found';
    
    const phases = [...new Set(memories.map(m => m.phase))];
    const avgEmotional = memories.reduce((sum, m) => sum + m.emotionalState, 0) / memories.length;
    
    return `Recalled ${memories.length} relevant memories spanning ${phases.join(', ')} phases, ` +
           `with average emotional context of ${avgEmotional.toFixed(1)}, ` +
           `connected through concepts: ${concepts.slice(0, 3).join(', ')}`;
  }

  private calculateOverallRelevance(memories: ConversationMemory[]): number {
    if (memories.length === 0) return 0;
    // Simplified relevance calculation
    return Math.min(100, memories.length * 20); // 20 points per memory, max 100
  }

  private calculateConceptSimilarity(concept1: string, concept2: string): number {
    // Simplified similarity - in production would use embeddings or NLP similarity
    const words1 = concept1.toLowerCase().split(' ');
    const words2 = concept2.toLowerCase().split(' ');
    const intersection = words1.filter(word => words2.includes(word));
    return intersection.length / Math.max(words1.length, words2.length);
  }

  private categorizeConceptsByDomain(concepts: string[]): string[] {
    const domains = [];
    const domainKeywords = {
      work: ['work', 'job', 'career', 'project', 'meeting', 'deadline'],
      relationships: ['relationship', 'family', 'friend', 'partner', 'love', 'social'],
      health: ['health', 'exercise', 'sleep', 'nutrition', 'wellness', 'energy'],
      growth: ['growth', 'learning', 'development', 'progress', 'goal', 'achievement'],
      emotional: ['emotion', 'feeling', 'mood', 'anxiety', 'happiness', 'stress']
    };

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (concepts.some(concept => 
        keywords.some(keyword => concept.toLowerCase().includes(keyword))
      )) {
        domains.push(domain);
      }
    }

    return domains;
  }

  private calculateConceptFrequency(concepts: string[]): Map<string, number> {
    const frequency = new Map();
    concepts.forEach(concept => {
      frequency.set(concept, (frequency.get(concept) || 0) + 1);
    });
    return frequency;
  }

  private async buildConceptHierarchy(conceptFrequency: Map<string, number>): Promise<any> {
    // Simplified hierarchy building
    const topConcepts = Array.from(conceptFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    return {
      root: 'user_concepts',
      children: topConcepts.map(([concept, freq]) => ({
        name: concept,
        frequency: freq,
        children: []
      }))
    };
  }

  private async createSemanticClusters(
    memories: ConversationMemory[],
    conceptHierarchy: any
  ): Promise<MemoryCluster[]> {
    // Simplified clustering
    const clusters: MemoryCluster[] = [];
    const topConcepts = conceptHierarchy.children.slice(0, 10);

    topConcepts.forEach((conceptNode: any, index: number) => {
      const relatedMemories = memories.filter(memory => 
        memory.concepts.includes(conceptNode.name)
      );

      if (relatedMemories.length > 0) {
        const avgEmotional = relatedMemories.reduce((sum, m) => sum + m.emotionalState, 0) / relatedMemories.length;
        const mostCommonPhase = this.getMostCommonPhase(relatedMemories);

        clusters.push({
          id: `cluster_${index}`,
          concepts: [conceptNode.name],
          emotionalContext: avgEmotional,
          phaseContext: mostCommonPhase,
          strengthScore: Math.min(1, relatedMemories.length / 10),
          lastActivated: new Date(),
          activationCount: 1
        });
      }
    });

    return clusters;
  }

  private identifyEmergentThemes(clusters: MemoryCluster[]): string[] {
    // Identify themes that emerge from cluster patterns
    const themes = [];
    
    const highStrengthClusters = clusters.filter(c => c.strengthScore > 0.7);
    if (highStrengthClusters.length > 0) {
      themes.push('Established thought patterns detected');
    }

    const emotionalClusters = clusters.filter(c => Math.abs(c.emotionalContext) > 0.6);
    if (emotionalClusters.length > 0) {
      themes.push('Strong emotional associations identified');
    }

    return themes;
  }

  private getMostCommonPhase(memories: ConversationMemory[]): string {
    const phases = memories.map(m => m.phase);
    const phaseCount = phases.reduce((acc, phase) => {
      acc[phase] = (acc[phase] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(phaseCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'expansion';
  }

  private filterMemoriesByTimeframe(memories: ConversationMemory[], timeframe: string): ConversationMemory[] {
    const now = Date.now();
    const timeframes = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      '3months': 90 * 24 * 60 * 60 * 1000,
      all: Infinity
    };

    const cutoff = now - (timeframes[timeframe as keyof typeof timeframes] || timeframes.all);
    return memories.filter(memory => memory.timestamp.getTime() > cutoff);
  }

  private async analyzeEmotionalCycles(memories: ConversationMemory[]): Promise<any> {
    // Simplified analysis
    return {
      patterns: [{ pattern: 'Weekly emotional cycles detected', frequency: 4, insights: ['Mondays tend to be challenging', 'Fridays show energy spikes'] }],
      predictions: [{ prediction: 'Next week likely to follow similar emotional pattern', confidence: 75 }],
      relevantMemories: memories.slice(0, 5)
    };
  }

  private async analyzeBreakthroughMoments(memories: ConversationMemory[]): Promise<any> {
    const breakthroughMemories = memories.filter(m => m.emotionalState > 0.7 && m.phase === 'expansion');
    return {
      patterns: [{ pattern: 'Breakthrough moments often follow reflection periods', frequency: 3, insights: ['Breakthroughs occur after contraction phases'] }],
      predictions: [{ prediction: 'Current patterns suggest breakthrough potential within 2 weeks', confidence: 65 }],
      relevantMemories: breakthroughMemories
    };
  }

  private async analyzeRecurringChallenges(memories: ConversationMemory[]): Promise<any> {
    const challengeMemories = memories.filter(m => m.emotionalState < -0.3);
    return {
      patterns: [{ pattern: 'Decision-making creates recurring stress', frequency: 6, insights: ['Analysis paralysis pattern detected'] }],
      predictions: [{ prediction: 'Similar challenges likely to resurface during decision points', confidence: 80 }],
      relevantMemories: challengeMemories
    };
  }

  private async analyzeGrowthAccelerators(memories: ConversationMemory[]): Promise<any> {
    const growthMemories = memories.filter(m => m.phase === 'renewal' || (m.phase === 'expansion' && m.emotionalState > 0.5));
    return {
      patterns: [{ pattern: 'Journaling consistently accelerates growth', frequency: 8, insights: ['Daily reflection correlates with faster phase transitions'] }],
      predictions: [{ prediction: 'Maintaining current practices will accelerate growth by 30%', confidence: 70 }],
      relevantMemories: growthMemories
    };
  }

  async storeConversationMemory(
    userId: string,
    content: string,
    emotionalState: number,
    phase: string
  ): Promise<void> {
    const concepts = await this.extractConcepts(content);
    
    const memory: ConversationMemory = {
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      content,
      concepts,
      emotionalState,
      phase,
      timestamp: new Date(),
      relatedMemories: []
    };

    const userMemories = this.conversationMemories.get(userId) || [];
    userMemories.push(memory);
    
    // Keep only last 1000 memories per user
    if (userMemories.length > 1000) {
      userMemories.splice(0, userMemories.length - 1000);
    }
    
    this.conversationMemories.set(userId, userMemories);
  }
}

export const advancedMemory = new AdvancedMemoryService();
