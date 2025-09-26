import { storage } from './storage';
import OpenAI from 'openai'; // Assuming OpenAI is used for AI

// Mock OpenAI client for now, replace with actual initialization
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_MOCK_API_KEY',
  dangerouslyAllowBrowser: true, // Allow in browser environments if needed, otherwise remove
});

export interface UserContent {
  id: string;
  userId: string;
  title: string;
  description: string;
  contentType: 'practice' | 'meditation' | 'article' | 'video' | 'course';
  content: string;
  tags: string[];
  price: number; // 0 for free content
  rating: number;
  downloads: number;
  approved: boolean;
  createdAt: Date;
}

export interface ContentPurchase {
  id: string;
  userId: string;
  contentId: string;
  purchaseDate: Date;
  price: number;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'practice' | 'course' | 'community';
  phase?: string;
  difficulty?: string;
  duration?: number;
  tags?: string[];
  content?: string;
  aiGenerated?: boolean;
  relevanceScore?: number;
  reasoning?: string;
  expectedImpact?: string;
}

export class ContentService {
  async submitContent(userId: string, contentData: Partial<UserContent>): Promise<UserContent> {
    try {
      const content: UserContent = {
        id: Date.now().toString(),
        userId,
        title: contentData.title || '',
        description: contentData.description || '',
        contentType: contentData.contentType || 'article',
        content: contentData.content || '',
        tags: contentData.tags || [],
        price: contentData.price || 0,
        rating: 0,
        downloads: 0,
        approved: false,
        createdAt: new Date()
      };

      await storage.execute(`
        INSERT INTO user_content (id, user_id, title, description, content_type, content, tags, price, approved)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [content.id, content.userId, content.title, content.description, content.contentType,
          content.content, JSON.stringify(content.tags), content.price, content.approved]);

      return content;
    } catch (error) {
      console.error('Error submitting content:', error);
      throw new Error('Failed to submit content');
    }
  }

  async getMarketplaceContent(
    filters: {
      contentType?: string;
      tags?: string[];
      priceRange?: [number, number];
      rating?: number;
    } = {}
  ): Promise<UserContent[]> {
    try {
      // Mock marketplace content for development
      return [
        {
          id: '1',
          userId: 'creator-1',
          title: 'Mindful Breathing for Growth Phases',
          description: 'A guided practice to navigate phase transitions',
          contentType: 'meditation',
          content: 'Guided meditation content...',
          tags: ['breathing', 'transitions', 'mindfulness'],
          price: 9.99,
          rating: 4.8,
          downloads: 156,
          approved: true,
          createdAt: new Date()
        },
        {
          id: '2',
          userId: 'creator-2',
          title: 'Values Clarity Workbook',
          description: 'Comprehensive exercises for discovering core values',
          contentType: 'course',
          content: 'Workbook content...',
          tags: ['values', 'self-discovery', 'workbook'],
          price: 24.99,
          rating: 4.9,
          downloads: 89,
          approved: true,
          createdAt: new Date()
        }
      ];
    } catch (error) {
      console.error('Error getting marketplace content:', error);
      return [];
    }
  }

  async purchaseContent(userId: string, contentId: string): Promise<boolean> {
    try {
      const content = await this.getContentById(contentId);
      if (!content) throw new Error('Content not found');

      const purchase: ContentPurchase = {
        id: Date.now().toString(),
        userId,
        contentId,
        purchaseDate: new Date(),
        price: content.price
      };

      await storage.execute(`
        INSERT INTO content_purchases (id, user_id, content_id, purchase_date, price)
        VALUES ($1, $2, $3, $4, $5)
      `, [purchase.id, purchase.userId, purchase.contentId, purchase.purchaseDate, purchase.price]);

      // Update download count
      await storage.execute(`
        UPDATE user_content SET downloads = downloads + 1 WHERE id = $1
      `, [contentId]);

      return true;
    } catch (error) {
      console.error('Error purchasing content:', error);
      return false;
    }
  }

  async getContentById(contentId: string): Promise<UserContent | null> {
    try {
      const result = await storage.get(`
        SELECT * FROM user_content WHERE id = $1 AND approved = true
      `, [contentId]);

      if (!result) return null;

      return {
        id: result.id,
        userId: result.user_id,
        title: result.title,
        description: result.description,
        contentType: result.content_type,
        content: result.content,
        tags: JSON.parse(result.tags || '[]'),
        price: result.price,
        rating: result.rating || 0,
        downloads: result.downloads || 0,
        approved: result.approved,
        createdAt: new Date(result.created_at)
      };
    } catch (error) {
      console.error('Error getting content by ID:', error);
      return null;
    }
  }

  async getUserPurchasedContent(userId: string): Promise<UserContent[]> {
    try {
      // Mock user purchases for development
      return [];
    } catch (error) {
      console.error('Error getting user purchased content:', error);
      return [];
    }
  }
}


export class ContentCurationService {
  async generateAdvancedPersonalizedContent(
    userId: string,
    userContext: {
      currentPhase: string;
      recentMood: number;
      energyLevels: { mental: number; physical: number; emotional: number; spiritual: number };
      recentJournalTopics: string[];
      learningStyle: string;
      timeAvailable: number; // minutes
      currentStruggles: string[];
      recentGrowthAreas: string[];
      valuesPriority: Array<{ name: string; importance: number }>;
    }
  ): Promise<{
    immediateSupport: ContentItem[];
    phaseSpecific: ContentItem[];
    skillDevelopment: ContentItem[];
    longTermGrowth: ContentItem[];
    communityConnections: ContentItem[];
    insights: {
      reasoningChain: string[];
      adaptationNotes: string[];
      learningGoals: string[];
    }
  }> {
    // Advanced content curation using AI analysis
    const curationPrompt = `As an advanced AI content curator for the Growth Halo platform, analyze this user context and recommend highly personalized content:

User Context:
- Current Phase: ${userContext.currentPhase}
- Recent Mood: ${userContext.recentMood}/10
- Energy Levels: Mental ${userContext.energyLevels.mental}, Physical ${userContext.energyLevels.physical}, Emotional ${userContext.energyLevels.emotional}, Spiritual ${userContext.energyLevels.spiritual}
- Recent Journal Topics: ${userContext.recentJournalTopics.join(', ')}
- Learning Style: ${userContext.learningStyle}
- Time Available: ${userContext.timeAvailable} minutes
- Current Struggles: ${userContext.currentStruggles.join(', ')}
- Recent Growth Areas: ${userContext.recentGrowthAreas.join(', ')}
- Top Values: ${userContext.valuesPriority.slice(0, 3).map(v => `${v.name} (${v.importance}/10)`).join(', ')}

Recommend content across these categories:
1. Immediate Support (3-5 items for current emotional state/struggles)
2. Phase-Specific Content (3-4 items matching their growth phase)
3. Skill Development (2-3 items for building specific capabilities)
4. Long-term Growth (2-3 items for sustained development)
5. Community Connections (2-3 items for relationship building)

For each recommendation, provide:
- Title and brief description
- Why it's relevant now (reasoning)
- Expected impact and time investment
- Specific growth outcomes

Also provide insights about:
- Your reasoning chain for these recommendations
- How you adapted to their specific context
- Learning goals this content supports

Respond with detailed JSON matching the expected structure.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: curationPrompt }],
        temperature: 0.4,
        max_tokens: 1500,
      });

      const aiRecommendations = JSON.parse(completion.choices[0]?.message?.content || '{}');

      // Combine AI recommendations with curated content
      return {
        immediateSupport: this.enrichContentItems(aiRecommendations.immediateSupport || [], userContext),
        phaseSpecific: this.enrichContentItems(aiRecommendations.phaseSpecific || [], userContext),
        skillDevelopment: this.enrichContentItems(aiRecommendations.skillDevelopment || [], userContext),
        longTermGrowth: this.enrichContentItems(aiRecommendations.longTermGrowth || [], userContext),
        communityConnections: this.enrichContentItems(aiRecommendations.communityConnections || [], userContext),
        insights: {
          reasoningChain: aiRecommendations.reasoning || ['Personalized based on current growth phase and emotional state'],
          adaptationNotes: aiRecommendations.adaptations || ['Content adapted for available time and learning style'],
          learningGoals: aiRecommendations.learningGoals || ['Support current growth trajectory']
        }
      };
    } catch (error) {
      console.error('Error generating AI content recommendations:', error);

      // Fallback to rule-based recommendations
      return this.generateFallbackRecommendations(userContext);
    }
  }

  private enrichContentItems(aiItems: any[], userContext: any): ContentItem[] {
    return aiItems.map((item, index) => ({
      id: `ai_${Date.now()}_${index}`,
      title: item.title || 'Personalized Content',
      description: item.description || '',
      type: item.type || 'article',
      phase: userContext.currentPhase,
      difficulty: item.difficulty || 'beginner',
      duration: item.duration || userContext.timeAvailable,
      tags: item.tags || [],
      content: item.content || '',
      aiGenerated: true,
      relevanceScore: item.relevanceScore || 85,
      reasoning: item.reasoning || 'Recommended based on your current growth context',
      expectedImpact: item.expectedImpact || 'Support your current growth journey'
    }));
  }

  private generateFallbackRecommendations(userContext: any) {
    // Rule-based fallback system
    const phaseContent = {
      expansion: [
        { title: 'Embracing New Opportunities', type: 'article', reasoning: 'Perfect for your expansion phase' },
        { title: 'Setting Ambitious Goals', type: 'practice', reasoning: 'Channel your growth energy effectively' }
      ],
      contraction: [
        { title: 'The Power of Reflection', type: 'article', reasoning: 'Support your inward journey' },
        { title: 'Integration Meditation', type: 'practice', reasoning: 'Process recent experiences mindfully' }
      ],
      renewal: [
        { title: 'Crystallizing Your Insights', type: 'article', reasoning: 'Capture your transformation' },
        { title: 'Vision Setting for New Cycle', type: 'practice', reasoning: 'Prepare for what\'s next' }
      ]
    };

    const moodBasedContent = userContext.recentMood < 5 ? [
      { title: 'Gentle Self-Compassion Practice', type: 'practice', reasoning: 'Support during challenging times' },
      { title: 'Understanding Difficult Emotions', type: 'article', reasoning: 'Navigate current emotional landscape' }
    ] : [
      { title: 'Amplifying Positive Energy', type: 'practice', reasoning: 'Build on your current positive state' },
      { title: 'Gratitude and Growth Mindset', type: 'article', reasoning: 'Sustain your positive momentum' }
    ];

    return {
      immediateSupport: this.enrichContentItems(moodBasedContent, userContext),
      phaseSpecific: this.enrichContentItems(phaseContent[userContext.currentPhase] || [], userContext),
      skillDevelopment: this.enrichContentItems([
        { title: 'Emotional Intelligence Development', type: 'course', reasoning: 'Core skill for all growth phases' }
      ], userContext),
      longTermGrowth: this.enrichContentItems([
        { title: 'Building Sustainable Growth Habits', type: 'article', reasoning: 'Long-term development focus' }
      ], userContext),
      communityConnections: this.enrichContentItems([
        { title: 'Finding Your Growth Community', type: 'article', reasoning: 'Connect with like-minded individuals' }
      ], userContext),
      insights: {
        reasoningChain: ['Fallback recommendations based on phase and mood'],
        adaptationNotes: ['Basic rule-based personalization applied'],
        learningGoals: ['Support immediate needs and phase-appropriate growth']
      }
    };
  }

  async generatePersonalizedContent(userId: string): Promise<{
    articles: ContentItem[];
    practices: ContentItem[];
    courses: ContentItem[];
    communityPosts: ContentItem[];
  }> {
    // This method is now superseded by generateAdvancedPersonalizedContent,
    // but kept for backward compatibility or simpler use cases if needed.
    // A more robust solution might deprecate this or unify the logic.
    console.warn("generatePersonalizedContent is deprecated. Use generateAdvancedPersonalizedContent for better results.");

    // For demonstration, we'll call the advanced version with a minimal context.
    // In a real app, you'd fetch or derive this context properly.
    const mockUserContext = {
      currentPhase: 'expansion',
      recentMood: 7,
      energyLevels: { mental: 7, physical: 6, emotional: 8, spiritual: 7 },
      recentJournalTopics: ['goals', 'opportunities'],
      learningStyle: 'visual',
      timeAvailable: 30,
      currentStruggles: [],
      recentGrowthAreas: ['goal setting'],
      valuesPriority: [{ name: 'Growth', importance: 9 }, { name: 'Clarity', importance: 8 }]
    };

    const advancedContent = await this.generateAdvancedPersonalizedContent(userId, mockUserContext);

    // Map the advanced content structure to the older structure if necessary,
    // or adapt consumers of this method.
    return {
      articles: advancedContent.longTermGrowth.concat(advancedContent.phaseSpecific.filter(item => item.type === 'article')),
      practices: advancedContent.immediateSupport.concat(advancedContent.phaseSpecific.filter(item => item.type === 'practice')),
      courses: advancedContent.skillDevelopment.filter(item => item.type === 'course'),
      communityPosts: advancedContent.communityConnections.filter(item => item.type === 'community'),
    };
  }
}

export const contentService = new ContentService();
export const contentCurationService = new ContentCurationService();