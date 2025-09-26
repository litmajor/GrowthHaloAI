
import { storage } from "./storage";
import { generateBlissResponse, analyzeSentiment } from "./ai-service";

export interface UserCompatibility {
  userId: string;
  compatibilityScore: number;
  reasons: string[];
  complementaryAreas: string[];
}

export interface DiscussionGuidance {
  guidance: string;
  reflectionQuestions: string[];
  needsProfessionalInput: boolean;
  moderationLevel: 'none' | 'gentle' | 'active';
}

export interface CommunityMember {
  id: string;
  currentPhase: "expansion" | "contraction" | "renewal";
  growthGoals: string[];
  communicationStyle: string;
  interests: string[];
  engagementPatterns: {
    postsPerWeek: number;
    responseRate: number;
    supportGiven: number;
    vulnerabilityLevel: number;
  };
  recentActivity: {
    circles: string[];
    topics: string[];
    sentiment: number;
  };
}

class CommunityIntelligenceService {
  async findCompatibleMembers(
    userId: string, 
    targetCircleType?: string,
    limit: number = 5
  ): Promise<UserCompatibility[]> {
    try {
      // Get user's profile and preferences
      const userProfile = await this.getUserCommunityProfile(userId);
      if (!userProfile) {
        return [];
      }

      // Get potential matches from the community
      const potentialMatches = await storage.getAll(`
        SELECT 
          up.user_id,
          up.current_phase,
          ce.contribution_score,
          ce.circle_participation,
          ai.personality_insights,
          ai.preference_profile
        FROM user_profiles up
        JOIN community_engagement ce ON up.user_id = ce.user_id
        LEFT JOIN ai_personalization ai ON up.user_id = ai.user_id
        WHERE up.user_id != $1
        AND ce.last_active_at > NOW() - INTERVAL '30 days'
        ORDER BY ce.contribution_score DESC
        LIMIT 50
      `, [userId]);

      // Calculate compatibility scores
      const compatibilityScores = await Promise.all(
        potentialMatches.map(async (match) => {
          const score = await this.calculateCompatibilityScore(userProfile, match);
          return score;
        })
      );

      // Sort by compatibility and return top matches
      return compatibilityScores
        .filter(score => score.compatibilityScore > 0.6)
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, limit);

    } catch (error) {
      console.error('Error finding compatible members:', error);
      return [];
    }
  }

  private async calculateCompatibilityScore(
    user: any, 
    potentialMatch: any
  ): Promise<UserCompatibility> {
    const reasons: string[] = [];
    const complementaryAreas: string[] = [];
    let score = 0;

    // Phase compatibility (0.3 weight)
    const phaseScore = this.calculatePhaseCompatibility(user.current_phase, potentialMatch.current_phase);
    score += phaseScore * 0.3;
    
    if (phaseScore > 0.7) {
      reasons.push(`Both in ${user.current_phase} phase - shared understanding`);
    } else if (phaseScore > 0.4) {
      reasons.push(`Complementary phases - mutual learning opportunity`);
      complementaryAreas.push('Phase perspective exchange');
    }

    // Growth goals alignment (0.25 weight)
    const goalsScore = this.calculateGoalsAlignment(
      user.personality_insights?.growth_goals || [],
      potentialMatch.personality_insights?.growth_goals || []
    );
    score += goalsScore * 0.25;

    if (goalsScore > 0.6) {
      reasons.push('Aligned growth objectives');
    }

    // Communication style compatibility (0.2 weight)
    const commScore = this.calculateCommunicationCompatibility(
      user.preference_profile?.communication_style,
      potentialMatch.preference_profile?.communication_style
    );
    score += commScore * 0.2;

    // Engagement pattern complementarity (0.15 weight)
    const engagementScore = this.calculateEngagementComplementarity(user, potentialMatch);
    score += engagementScore * 0.15;

    if (engagementScore > 0.7) {
      complementaryAreas.push('Balanced giving and receiving support');
    }

    // Shared interests bonus (0.1 weight)
    const interestsScore = this.calculateSharedInterests(
      user.personality_insights?.interests || [],
      potentialMatch.personality_insights?.interests || []
    );
    score += interestsScore * 0.1;

    return {
      userId: potentialMatch.user_id,
      compatibilityScore: Math.min(score, 1.0),
      reasons,
      complementaryAreas
    };
  }

  private calculatePhaseCompatibility(phase1: string, phase2: string): number {
    if (phase1 === phase2) return 0.8; // Same phase - good understanding
    
    // Complementary phases
    const complementaryPairs = [
      ['expansion', 'contraction'], // Balance
      ['contraction', 'renewal'],   // Natural progression
      ['renewal', 'expansion']      // Fresh energy meets new growth
    ];
    
    const isComplementary = complementaryPairs.some(pair => 
      (pair[0] === phase1 && pair[1] === phase2) ||
      (pair[1] === phase1 && pair[0] === phase2)
    );
    
    return isComplementary ? 0.6 : 0.3;
  }

  private calculateGoalsAlignment(goals1: string[], goals2: string[]): number {
    if (!goals1.length || !goals2.length) return 0.3;
    
    const intersection = goals1.filter(goal => 
      goals2.some(g2 => g2.toLowerCase().includes(goal.toLowerCase()) || 
                       goal.toLowerCase().includes(g2.toLowerCase()))
    );
    
    return intersection.length / Math.max(goals1.length, goals2.length);
  }

  private calculateCommunicationCompatibility(style1: string, style2: string): number {
    if (!style1 || !style2) return 0.5;
    
    const compatibleStyles = {
      'reflective': ['deep', 'thoughtful', 'analytical'],
      'supportive': ['encouraging', 'empathetic', 'nurturing'],
      'direct': ['honest', 'straightforward', 'clear'],
      'creative': ['expressive', 'imaginative', 'artistic']
    };
    
    // Check if styles complement each other
    for (const [style, compatible] of Object.entries(compatibleStyles)) {
      if (style1.includes(style) && compatible.some(c => style2.includes(c))) {
        return 0.8;
      }
    }
    
    return style1 === style2 ? 0.7 : 0.4;
  }

  private calculateEngagementComplementarity(user1: any, user2: any): number {
    const user1Engagement = user1.engagement_patterns || {};
    const user2Engagement = user2.engagement_patterns || {};
    
    // Look for complementary patterns (giver/receiver balance)
    const user1GiveRatio = (user1Engagement.support_given || 0) / 
                          Math.max(user1Engagement.posts_per_week || 1, 1);
    const user2GiveRatio = (user2Engagement.support_given || 0) / 
                          Math.max(user2Engagement.posts_per_week || 1, 1);
    
    // Complementary if one is more giving, other more receiving
    const ratioBalance = Math.abs(user1GiveRatio - user2GiveRatio) > 0.3 ? 0.8 : 0.5;
    
    // Also consider activity level compatibility
    const activityBalance = 1 - Math.abs(
      (user1Engagement.posts_per_week || 0) - (user2Engagement.posts_per_week || 0)
    ) / 10;
    
    return (ratioBalance + Math.max(activityBalance, 0)) / 2;
  }

  private calculateSharedInterests(interests1: string[], interests2: string[]): number {
    if (!interests1.length || !interests2.length) return 0;
    
    const sharedCount = interests1.filter(interest => 
      interests2.some(i2 => i2.toLowerCase() === interest.toLowerCase())
    ).length;
    
    return sharedCount / Math.max(interests1.length, interests2.length);
  }

  async generateDiscussionGuidance(
    circleId: string,
    discussionContent: string,
    recentMessages: Array<{ content: string; authorPhase: string; timestamp: Date }>,
    participantPhases: string[]
  ): Promise<DiscussionGuidance> {
    try {
      // Analyze sentiment and tone of recent messages
      const sentiments = await Promise.all(
        recentMessages.map(msg => analyzeSentiment(msg.content))
      );
      
      const avgSentiment = sentiments.reduce((sum, s) => sum + s.sentiment, 0) / sentiments.length;
      const emotionalTones = sentiments.map(s => s.emotionalTone);
      
      // Check for concerning patterns
      const needsProfessionalInput = this.detectProfessionalInputNeeded(
        discussionContent, 
        sentiments, 
        emotionalTones
      );
      
      // Generate contextual guidance
      const guidance = await this.generateContextualGuidance(
        discussionContent,
        participantPhases,
        avgSentiment,
        emotionalTones
      );
      
      // Generate reflection questions
      const reflectionQuestions = await this.generateReflectionQuestions(
        discussionContent,
        participantPhases,
        emotionalTones
      );
      
      // Determine moderation level
      const moderationLevel = this.determineModerationLevel(
        avgSentiment,
        emotionalTones,
        needsProfessionalInput
      );
      
      return {
        guidance,
        reflectionQuestions,
        needsProfessionalInput,
        moderationLevel
      };
      
    } catch (error) {
      console.error('Error generating discussion guidance:', error);
      return {
        guidance: "Let's continue this conversation with openness and authenticity.",
        reflectionQuestions: ["What feels most important to explore here?"],
        needsProfessionalInput: false,
        moderationLevel: 'none'
      };
    }
  }

  private detectProfessionalInputNeeded(
    content: string, 
    sentiments: any[], 
    emotionalTones: string[]
  ): boolean {
    // Keywords that might indicate need for professional support
    const concerningKeywords = [
      'suicide', 'self-harm', 'ending it all', 'can\'t go on',
      'abuse', 'trauma', 'addiction', 'substance',
      'severe depression', 'panic attacks', 'mental breakdown'
    ];
    
    const hasConceptKeywords = concerningKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    
    // Very negative sentiment pattern
    const avgSentiment = sentiments.reduce((sum, s) => sum + s.sentiment, 0) / sentiments.length;
    const severeNegativity = avgSentiment < -0.7;
    
    // Concerning emotional tones
    const concerningTones = ['hopeless', 'desperate', 'suicidal', 'crisis'];
    const hasConceptTones = emotionalTones.some(tone => 
      concerningTones.some(ct => tone.toLowerCase().includes(ct))
    );
    
    return hasConceptKeywords || severeNegativity || hasConceptTones;
  }

  private async generateContextualGuidance(
    content: string,
    phases: string[],
    sentiment: number,
    tones: string[]
  ): Promise<string> {
    const prompt = `As the Growth Halo AI Bliss, provide gentle guidance for this community discussion:

Content context: "${content.substring(0, 200)}..."
Participant phases: ${phases.join(', ')}
Emotional sentiment: ${sentiment > 0 ? 'positive' : sentiment < -0.3 ? 'challenging' : 'neutral'}
Emotional tones: ${tones.join(', ')}

Provide a brief, warm guidance message that:
1. Honors the current emotional climate
2. Considers the growth phases present
3. Gently guides toward constructive dialogue
4. Maintains Growth Halo philosophy

Keep it under 100 words and speak in Bliss's authentic voice.`;

    try {
      const response = await generateBlissResponse(prompt);
      return response.message;
    } catch (error) {
      return "I sense depth in this conversation. Let's continue with openness to what each person brings.";
    }
  }

  private async generateReflectionQuestions(
    content: string,
    phases: string[],
    tones: string[]
  ): Promise<string[]> {
    const phaseQuestions = {
      expansion: [
        "What new perspective is trying to emerge here?",
        "How might this challenge be an invitation to grow?",
        "What would courage look like in this situation?"
      ],
      contraction: [
        "What wisdom is this difficulty offering?",
        "What needs to be honored or released here?",
        "How can we hold space for this experience?"
      ],
      renewal: [
        "What new understanding is crystallizing?",
        "How has this experience transformed your perspective?",
        "What wants to be born from this insight?"
      ]
    };
    
    const dominantPhase = phases[0] || 'expansion';
    const baseQuestions = phaseQuestions[dominantPhase as keyof typeof phaseQuestions] || phaseQuestions.expansion;
    
    // Add universal questions for difficult conversations
    if (tones.some(tone => ['frustrated', 'angry', 'sad', 'confused'].includes(tone.toLowerCase()))) {
      return [
        ...baseQuestions.slice(0, 2),
        "What would it look like to approach this with self-compassion?",
        "How might vulnerability serve the conversation here?"
      ];
    }
    
    return baseQuestions.slice(0, 3);
  }

  private determineModerationLevel(
    sentiment: number,
    tones: string[],
    needsProfessional: boolean
  ): 'none' | 'gentle' | 'active' {
    if (needsProfessional) return 'active';
    
    const concerningTones = ['angry', 'hostile', 'attacking', 'judgmental'];
    const hasConcerningTones = tones.some(tone => 
      concerningTones.some(ct => tone.toLowerCase().includes(ct))
    );
    
    if (sentiment < -0.5 || hasConcerningTones) return 'gentle';
    
    return 'none';
  }

  private async getUserCommunityProfile(userId: string): Promise<CommunityMember | null> {
    try {
      const profile = await storage.get(`
        SELECT 
          up.user_id as id,
          up.current_phase,
          ce.circle_participation,
          ai.personality_insights,
          ai.preference_profile,
          ce.contribution_score,
          ce.support_network_size
        FROM user_profiles up
        LEFT JOIN community_engagement ce ON up.user_id = ce.user_id
        LEFT JOIN ai_personalization ai ON up.user_id = ai.user_id
        WHERE up.user_id = $1
      `, [userId]);

      if (!profile) return null;

      return {
        id: profile.id,
        currentPhase: profile.current_phase,
        growthGoals: profile.personality_insights?.growth_goals || [],
        communicationStyle: profile.preference_profile?.communication_style || 'balanced',
        interests: profile.personality_insights?.interests || [],
        engagementPatterns: {
          postsPerWeek: profile.contribution_score / 10, // Rough estimate
          responseRate: 0.7, // Default
          supportGiven: profile.contribution_score || 0,
          vulnerabilityLevel: 0.5 // Default
        },
        recentActivity: {
          circles: profile.circle_participation || [],
          topics: [],
          sentiment: 0.5
        }
      };
    } catch (error) {
      console.error('Error getting user community profile:', error);
      return null;
    }
  }

  async updateEngagementMetrics(
    userId: string,
    action: 'post' | 'reply' | 'support' | 'share',
    metadata?: { circleId?: string; sentiment?: number }
  ): Promise<void> {
    try {
      const updates: Record<string, any> = {
        last_active_at: new Date()
      };

      switch (action) {
        case 'post':
          await storage.execute(`
            UPDATE community_engagement 
            SET contribution_score = contribution_score + 5,
                last_active_at = NOW()
            WHERE user_id = $1
          `, [userId]);
          break;
          
        case 'reply':
          await storage.execute(`
            UPDATE community_engagement 
            SET contribution_score = contribution_score + 3,
                last_active_at = NOW()
            WHERE user_id = $1
          `, [userId]);
          break;
          
        case 'support':
          await storage.execute(`
            UPDATE community_engagement 
            SET contribution_score = contribution_score + 2,
                last_active_at = NOW()
            WHERE user_id = $1
          `, [userId]);
          break;
      }
    } catch (error) {
      console.error('Error updating engagement metrics:', error);
    }
  }
}

export const communityIntelligence = new CommunityIntelligenceService();
