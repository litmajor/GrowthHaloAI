
import { storage } from './storage';

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

export const contentService = new ContentService();
