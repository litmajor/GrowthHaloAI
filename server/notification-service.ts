
import { db } from './db';
import { notifications } from '../shared/notification-schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateBlissResponse } from './ai-service';

export type NotificationType = 
  | 'daily_checkin'
  | 'community_update'
  | 'growth_insight'
  | 'weekly_reflection'
  | 'phase_transition'
  | 'belief_revision'
  | 'wisdom_discovery'
  | 'circle_invitation'
  | 'message'
  | 'event_reminder'
  | 'system';

interface NotificationPreferences {
  dailyCheckin: boolean;
  communityUpdates: boolean;
  growthInsights: boolean;
  weeklyReflections: boolean;
  phaseTransitions: boolean;
  beliefRevisions: boolean;
  wisdomDiscoveries: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

class NotificationService {
  async createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    metadata?: any
  ) {
    const [notification] = await db.insert(notifications).values({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      message,
      read: false,
      metadata: metadata ? JSON.stringify(metadata) : null,
    }).returning();

    return notification;
  }

  async getUserNotifications(userId: string, limit: number = 50) {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const unread = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        )
      );
    return unread.length;
  }

  async markAsRead(notificationId: string, userId: string) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      );
  }

  async markAllAsRead(userId: string) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        )
      );
  }

  async deleteNotification(notificationId: string, userId: string) {
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      );
  }

  // Smart notification generation based on user activity
  async generateDailyCheckinReminder(userId: string) {
    const messages = [
      "How are you feeling today? Your daily check-in helps track your growth journey.",
      "Ready to reflect on your day? A few moments of mindfulness can reveal powerful insights.",
      "Your growth journey continues! Take a moment to check in with yourself.",
      "What's on your mind today? Share your thoughts in your daily check-in."
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    
    return await this.createNotification(
      userId,
      'daily_checkin',
      message,
      { action: '/checkin' }
    );
  }

  async generateGrowthInsight(userId: string, insight: string) {
    return await this.createNotification(
      userId,
      'growth_insight',
      `✨ New insight discovered: ${insight}`,
      { action: '/analytics' }
    );
  }

  async generatePhaseTransition(userId: string, fromPhase: string, toPhase: string) {
    const messages: Record<string, string> = {
      expansion: "🌱 You're entering an Expansion phase - a time of growth and new possibilities!",
      contraction: "🌙 You're entering a Contraction phase - a time for rest and reflection.",
      renewal: "☀️ You're entering a Renewal phase - a time of transformation and fresh starts!"
    };

    return await this.createNotification(
      userId,
      'phase_transition',
      messages[toPhase] || `Your growth phase has shifted from ${fromPhase} to ${toPhase}`,
      { fromPhase, toPhase, action: '/dashboard' }
    );
  }

  async generateBeliefRevisionCelebration(userId: string, revision: string) {
    return await this.createNotification(
      userId,
      'belief_revision',
      `🎉 Growth moment: ${revision}`,
      { action: '/patterns' }
    );
  }

  async generateWisdomDiscovery(userId: string, wisdom: string) {
    return await this.createNotification(
      userId,
      'wisdom_discovery',
      `💎 New wisdom added to your library: "${wisdom}"`,
      { action: '/wisdom' }
    );
  }

  async generateCommunityUpdate(userId: string, message: string, circleId?: string) {
    return await this.createNotification(
      userId,
      'community_update',
      message,
      { circleId, action: '/community' }
    );
  }

  async generateWeeklyReflection(userId: string) {
    return await this.createNotification(
      userId,
      'weekly_reflection',
      "📊 Your weekly insights are ready! See how you've grown this week.",
      { action: '/analytics' }
    );
  }
}

export const notificationService = new NotificationService();
