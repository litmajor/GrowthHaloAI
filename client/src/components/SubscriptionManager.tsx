
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Star, Crown, Zap, Sparkles, ArrowRight, Check } from 'lucide-react';
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
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Mock data for demo
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

  if (!subscription) return null;

  const currentTier = tierInfo[subscription.tier];
  const usagePercentage = subscription.usageStats.blissInteractions.limit > 0 
    ? (subscription.usageStats.blissInteractions.used / subscription.usageStats.blissInteractions.limit) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                `bg-${currentTier.color}-100 text-${currentTier.color}-600`
              )}>
                {currentTier.icon}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentTier.name}
                  <Badge 
                    variant={subscription.status === 'active' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {subscription.status}
                  </Badge>
                </CardTitle>
                <CardDescription>
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
                className="hover-elevate"
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
            className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-medium mb-4">Upgrade Your Plan</h3>
            
            <div className="space-y-3">
              {Object.entries(tierInfo)
                .filter(([key]) => key !== subscription.tier && key !== 'free')
                .map(([tierKey, info]) => (
                  <div
                    key={tierKey}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleUpgrade(tierKey)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          `bg-${info.color}-100 text-${info.color}-600`
                        )}>
                          {info.icon}
                        </div>
                        <div>
                          <div className="font-medium">{info.name}</div>
                          <div className="text-sm text-gray-600">${info.price}/month</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
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
