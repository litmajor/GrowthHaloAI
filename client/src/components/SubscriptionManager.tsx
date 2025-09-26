import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Star, Crown, Zap, Sparkles, ArrowRight, Check, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UserSubscription {
  tier: 'free' | 'growth' | 'transformation' | 'facilitator';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  usageStats: {
    blissInteractions: { used: number; limit: number };
    communityCircles: { access: number; total: number };
    coachingSessions: { used: number; included: number };
  };
}

const tierInfo = {
  free: {
    name: 'First Steps',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'gray',
    price: 0
  },
  growth: {
    name: 'Growth',
    icon: <Zap className="w-5 h-5" />,
    color: 'indigo',
    price: 19
  },
  transformation: {
    name: 'Transformation',
    icon: <Star className="w-5 h-5" />,
    color: 'purple',
    price: 39
  },
  facilitator: {
    name: 'Facilitator',
    icon: <Crown className="w-5 h-5" />,
    color: 'amber',
    price: 99
  }
};

// Define subscription tiers for easier access and management
const subscriptionTiers = [
  { id: 'free', name: 'First Steps', icon: <Sparkles className="w-5 h-5" />, color: 'gray', price: 0 },
  { id: 'growth', name: 'Growth', icon: <Zap className="w-5 h-5" />, color: 'indigo', price: 19 },
  { id: 'transformation', name: 'Transformation', icon: <Star className="w-5 h-5" />, color: 'purple', price: 39 },
  { id: 'facilitator', name: 'Facilitator', icon: <Crown className="w-5 h-5" />, color: 'amber', price: 99 },
];

interface SubscriptionManagerProps {
  userId: string;
}

export default function SubscriptionManager({ userId }: SubscriptionManagerProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [userId]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/subscription`);
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else {
        // Handle non-OK responses, e.g., subscription not found
        setSubscription(null); // Or set to a default free tier state
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Mock data for demo if fetch fails
      setSubscription({
        tier: 'growth',
        status: 'active',
        currentPeriodEnd: '2024-02-15',
        cancelAtPeriodEnd: false,
        usageStats: {
          blissInteractions: { used: 87, limit: -1 },
          communityCircles: { access: 8, total: 8 },
          coachingSessions: { used: 0, included: 0 }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (newTier: string) => {
    try {
      const response = await fetch(`/api/user/${userId}/subscription/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: newTier })
      });

      if (response.ok) {
        await fetchSubscription();
        setShowUpgrade(false);
      } else {
        console.error('Upgrade failed:', response.statusText);
        // Optionally show an error message to the user
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/subscription/cancel`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchSubscription();
      } else {
        console.error('Cancellation failed:', response.statusText);
        // Optionally show an error message to the user
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
        <div className="h-24 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  // Get current tier info with fallback to free tier if subscription is null or tier is not found
  const currentTier = subscriptionTiers.find(tier => tier.id === subscription?.tier) || subscriptionTiers[0];

  if (!subscription) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="text-center text-muted-foreground">
          Loading subscription information...
        </div>
      </Card>
    );
  }

  const usagePercentage = subscription.usageStats.blissInteractions.limit > 0
    ? (subscription.usageStats.blissInteractions.used / subscription.usageStats.blissInteractions.limit) * 100
    : 0;

  const tierConfig = {
    free: {
      color: "text-muted-foreground",
      bgColor: "bg-muted/20",
      icon: Zap
    },
    growth: {
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      icon: TrendingUp
    },
    transformation: {
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      icon: Sparkles
    },
    facilitator: {
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      icon: Crown
    }
  };

  if (!subscription) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="text-center text-muted-foreground">
          Loading subscription information...
        </div>
      </Card>
    );
  }

  const usagePercentage = subscription.usageStats.blissInteractions.limit > 0
    ? (subscription.usageStats.blissInteractions.used / subscription.usageStats.blissInteractions.limit) * 100
    : 0;

  const config = tierConfig[subscription.tier] || tierConfig.free;
  const TierIcon = config?.icon || Zap;

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                `bg-${currentTier.color}-100 text-${currentTier.color}-600`
              )}>
                {currentTier.icon}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 truncate">
                  {currentTier.name}
                  <Badge
                    variant={subscription.status === 'active' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {subscription.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="truncate">
                  {subscription.tier === 'free'
                    ? 'Free forever'
                    : `$${currentTier.price}/month • Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                  }
                </CardDescription>
              </div>
            </div>

            {subscription.tier !== 'facilitator' && (
              <Button
                onClick={() => setShowUpgrade(true)}
                variant="outline"
                className="hover-elevate w-full sm:w-auto"
              >
                Upgrade
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Usage Stats */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Bliss Conversations</span>
                <span>
                  {subscription.usageStats.blissInteractions.limit > 0
                    ? `${subscription.usageStats.blissInteractions.used}/${subscription.usageStats.blissInteractions.limit}`
                    : `${subscription.usageStats.blissInteractions.used} (Unlimited)`
                  }
                </span>
              </div>
              {subscription.usageStats.blissInteractions.limit > 0 && (
                <Progress value={usagePercentage} className="h-2" />
              )}
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Community Circles</span>
                <span>
                  {subscription.usageStats.communityCircles.access}/{subscription.usageStats.communityCircles.total}
                </span>
              </div>
              <Progress
                value={(subscription.usageStats.communityCircles.access / subscription.usageStats.communityCircles.total) * 100}
                className="h-2"
              />
            </div>

            {subscription.tier === 'transformation' && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Coaching Sessions</span>
                  <span>
                    {subscription.usageStats.coachingSessions.used}/{subscription.usageStats.coachingSessions.included}
                  </span>
                </div>
                <Progress
                  value={(subscription.usageStats.coachingSessions.used / subscription.usageStats.coachingSessions.included) * 100}
                  className="h-2"
                />
              </div>
            )}
          </div>

          {/* Cancel Option */}
          {subscription.tier !== 'free' && subscription.status === 'active' && (
            <div className="mt-6 pt-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Cancel Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Options Modal */}
      {showUpgrade && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUpgrade(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background border rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-medium mb-4">Upgrade Your Plan</h3>

            <div className="space-y-3">
              {subscriptionTiers
                .filter((tier) => tier.id !== subscription.tier && tier.id !== 'free')
                .map((tier) => (
                  <div
                    key={tier.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleUpgrade(tier.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          `bg-${tier.color}-100 text-${tier.color}-600`
                        )}>
                          {tier.icon}
                        </div>
                        <div>
                          <div className="font-medium">{tier.name}</div>
                          <div className="text-sm text-muted-foreground">${tier.price}/month</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
            </div>

            <Button
              onClick={() => setShowUpgrade(false)}
              variant="outline"
              className="w-full mt-4"
            >
              Cancel
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}