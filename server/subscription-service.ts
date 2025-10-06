
import { storage } from './storage';

export interface UserSubscription {
  userId: string;
  tier: 'free' | 'growth' | 'transformation' | 'facilitator';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UsageStats {
  blissInteractions: { used: number; limit: number };
  communityCircles: { access: number; total: number };
  coachingSessions: { used: number; included: number };
}

type TierLimits = {
  blissInteractions: number;
  communityCircles: number;
  coachingSessions: number;
  advancedFeatures: boolean;
  prioritySupport: boolean;
  moderationTools: boolean;
  whiteLabel: boolean;
};

const TIER_LIMITS: Record<UserSubscription['tier'], TierLimits> = {
  free: {
    blissInteractions: 10,
    communityCircles: 3,
    coachingSessions: 0,
    advancedFeatures: false,
    prioritySupport: false,
    moderationTools: false,
    whiteLabel: false
  },
  growth: {
    blissInteractions: -1, // unlimited
    communityCircles: 8,
    coachingSessions: 1,
    advancedFeatures: true,
    prioritySupport: false,
    moderationTools: false,
    whiteLabel: false
  },
  transformation: {
    blissInteractions: -1,
    communityCircles: 14,
    coachingSessions: 2,
    advancedFeatures: true,
    prioritySupport: true,
    moderationTools: false,
    whiteLabel: false
  },
  facilitator: {
    blissInteractions: -1,
    communityCircles: 20,
    coachingSessions: 5,
    advancedFeatures: true,
    prioritySupport: true,
    moderationTools: true,
    whiteLabel: true
  }
};

export class SubscriptionService {
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const subscription = await storage.get(`
        SELECT * FROM user_subscriptions WHERE user_id = $1
      `, [userId]);

      if (!subscription) {
        // Create free tier subscription for new users
        return await this.createFreeSubscription(userId);
      }

      return {
        userId: subscription.user_id,
        tier: subscription.tier,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start),
        currentPeriodEnd: new Date(subscription.current_period_end),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end) : undefined,
        stripeCustomerId: subscription.stripe_customer_id,
        stripeSubscriptionId: subscription.stripe_subscription_id
      };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }

  async createFreeSubscription(userId: string): Promise<UserSubscription> {
    const now = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 10); // Free forever

    await storage.execute(`
      INSERT INTO user_subscriptions (
        user_id, tier, status, current_period_start, current_period_end, cancel_at_period_end
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO NOTHING
    `, [userId, 'free', 'active', now, endDate, false]);

    return {
      userId,
      tier: 'free',
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: endDate,
      cancelAtPeriodEnd: false
    };
  }

  async getUsageStats(userId: string): Promise<UsageStats> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) throw new Error('No subscription found');

      const limits = TIER_LIMITS[subscription.tier];
      
      // Get current period usage
      const startOfPeriod = subscription.currentPeriodStart;
      
      // Bliss interactions
      const blissUsage = await storage.get(`
        SELECT COUNT(*) as count FROM chat_messages 
        WHERE user_id = $1 AND created_at >= $2 AND is_user = true
      `, [userId, startOfPeriod]);

      // Community access (simplified)
      const communityAccess = limits.communityCircles;

      // Coaching sessions
      const coachingUsage = await storage.get(`
        SELECT COUNT(*) as count FROM coaching_sessions 
        WHERE user_id = $1 AND session_date >= $2
      `, [userId, startOfPeriod]);

      return {
        blissInteractions: {
          used: parseInt(blissUsage?.count || '0'),
          limit: limits.blissInteractions
        },
        communityCircles: {
          access: communityAccess,
          total: 8 // Total available circles
        },
        coachingSessions: {
          used: parseInt(coachingUsage?.count || '0'),
          included: limits.coachingSessions
        }
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        blissInteractions: { used: 0, limit: 5 },
        communityCircles: { access: 1, total: 8 },
        coachingSessions: { used: 0, included: 0 }
      };
    }
  }

  async canUseFeature(userId: string, feature: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return false;

      const limits = TIER_LIMITS[subscription.tier];
      const usage = await this.getUsageStats(userId);

      switch (feature) {
        case 'bliss_interaction':
          return limits.blissInteractions === -1 || usage.blissInteractions.used < limits.blissInteractions;
        case 'advanced_features':
          return limits.advancedFeatures || false;
        case 'priority_support':
          return limits.prioritySupport || false;
        case 'moderation_tools':
          return limits.moderationTools || false;
        case 'coaching_session':
          return usage.coachingSessions.used < limits.coachingSessions;
        default:
          return true;
      }
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  async upgradeSubscription(userId: string, newTier: string, opts?: { stripeCustomerId?: string; stripeSubscriptionId?: string }): Promise<boolean> {
    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const params: any[] = [newTier, now, endDate];
      let setExtra = '';
      if (opts?.stripeCustomerId) {
        setExtra += ', stripe_customer_id = $4';
        params.push(opts.stripeCustomerId);
      }
      if (opts?.stripeSubscriptionId) {
        setExtra += (opts?.stripeCustomerId ? ', stripe_subscription_id = $5' : ', stripe_subscription_id = $4');
        params.push(opts.stripeSubscriptionId);
      }

      params.push(userId);

      await storage.execute(`
        UPDATE user_subscriptions 
        SET tier = $1, current_period_start = $2, current_period_end = $3 ${setExtra}, updated_at = NOW()
        WHERE user_id = $${params.length}
      `, params);

      return true;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return false;
    }
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      await storage.execute(`
        UPDATE user_subscriptions 
        SET cancel_at_period_end = true, updated_at = NOW()
        WHERE user_id = $1
      `, [userId]);

      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  }

  async trackUsage(userId: string, feature: string): Promise<void> {
    try {
      // This could be expanded to track specific usage patterns
      // For now, usage is tracked through existing tables (chat_messages, etc.)
      console.log(`Usage tracked: ${userId} used ${feature}`);
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  }
}

export const subscriptionService = new SubscriptionService();
