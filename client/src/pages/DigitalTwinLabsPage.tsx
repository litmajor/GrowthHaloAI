
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Brain, 
  Activity, 
  TrendingUp, 
  Shield,
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap,
  DollarSign,
  CreditCard,
  TrendingDown,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer } from '@/components/ui/responsive-container';

interface UserWithAnalytics {
  id: string;
  username: string;
  analytics?: {
    totalSessions: number;
    totalMessages: number;
    avgSessionDuration: number;
    lastActive: string;
    growthScore: number;
    engagementLevel: string;
  };
}

interface DigitalTwin {
  id: string;
  userId: string;
  personalityVector: number[];
  valueSystem: Record<string, any>;
  growthPatterns: Record<string, any>;
  emotionalSignature: Record<string, any>;
  conversationStyle: Record<string, any>;
  stats: {
    totalMemories: number;
    totalBeliefs: number;
    totalContradictions: number;
  };
}

export default function DigitalTwinLabsPage() {
  const [users, setUsers] = useState<UserWithAnalytics[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwin | null>(null);
  const [perceptionProfile, setPerceptionProfile] = useState<any>(null);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [showCreateExperiment, setShowCreateExperiment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [subscriptionStats, setSubscriptionStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<string>('month');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchExperiments();
    fetchRevenueData();
    fetchSubscriptionStats();
  }, []);

  const fetchRevenueData = async (range: string = timeRange) => {
    try {
      const res = await fetch(`/api/admin/revenue/overview?timeRange=${range}`);
      if (!res.ok) throw new Error('Failed to fetch revenue data');
      const data = await res.json();
      setRevenueData(data);
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    }
  };

  const fetchSubscriptionStats = async () => {
    try {
      const res = await fetch('/api/admin/revenue/subscriptions');
      if (!res.ok) throw new Error('Failed to fetch subscription stats');
      const data = await res.json();
      setSubscriptionStats(data);
    } catch (error) {
      console.error('Failed to fetch subscription stats:', error);
    }
  };

  const fetchExperiments = async () => {
    try {
      const res = await fetch('/api/admin/experiments');
      if (!res.ok) throw new Error('Failed to fetch experiments');
      const data = await res.json();
      setExperiments(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch experiments',
        variant: 'destructive',
      });
    }
  };

  const generatePerceptionProfile = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/perception/${userId}/generate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to generate perception profile');
      
      toast({
        title: 'Success',
        description: 'Perception profile generated successfully',
      });
      
      await fetchPerceptionProfile(userId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate perception profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPerceptionProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/perception/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch perception profile');
      const data = await res.json();
      setPerceptionProfile(data);
    } catch (error) {
      console.error('Failed to fetch perception profile:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    }
  };

  const fetchDigitalTwin = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/digital-twin/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch digital twin');
      const data = await res.json();
      setDigitalTwin(data);
      setSelectedUser(userId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch digital twin',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDigitalTwin = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/digital-twin/${userId}/generate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to generate digital twin');
      
      toast({
        title: 'Success',
        description: 'Digital twin generated successfully',
      });
      
      await fetchDigitalTwin(userId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate digital twin',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPersonalityLabel = (index: number) => {
    const labels = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'];
    return labels[index];
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveContainer size="xl" className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                Digital Twin Labs
              </h1>
              <p className="text-muted-foreground mt-2">
                Advanced user analytics and digital twin generation
              </p>
            </div>
            <Badge variant="outline" className="gap-2">
              <Shield className="w-4 h-4" />
              Admin Access
            </Badge>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              <TabsTrigger value="revenue" data-testid="tab-revenue">Revenue</TabsTrigger>
              <TabsTrigger value="twins" data-testid="tab-twins">Digital Twins</TabsTrigger>
              <TabsTrigger value="perception" data-testid="tab-perception">Perception</TabsTrigger>
              <TabsTrigger value="experiments" data-testid="tab-experiments">Experiments</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              {/* Search */}
              <Card>
                <CardHeader>
                  <CardTitle>User Directory</CardTitle>
                  <CardDescription>Search and analyze user profiles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline" onClick={fetchUsers}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Users List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{user.username}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {user.analytics?.engagementLevel && (
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getEngagementColor(user.analytics.engagementLevel)}`} />
                            <span className="capitalize text-xs">{user.analytics.engagementLevel}</span>
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {user.analytics && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Sessions</p>
                            <p className="font-medium">{user.analytics.totalSessions}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Messages</p>
                            <p className="font-medium">{user.analytics.totalMessages}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Growth Score</p>
                            <p className="font-medium">{user.analytics.growthScore}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Duration</p>
                            <p className="font-medium">{Math.round(user.analytics.avgSessionDuration / 60)}m</p>
                          </div>
                        </div>
                      )}
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => fetchDigitalTwin(user.id)}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        View Digital Twin
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Analytics</CardTitle>
                  <CardDescription>Platform-wide metrics and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-primary/5">
                      <Users className="w-8 h-8 text-primary mb-2" />
                      <p className="text-2xl font-bold">{users.length}</p>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-500/5">
                      <Activity className="w-8 h-8 text-green-500 mb-2" />
                      <p className="text-2xl font-bold">
                        {users.filter(u => u.analytics?.engagementLevel === 'high').length}
                      </p>
                      <p className="text-sm text-muted-foreground">High Engagement</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/5">
                      <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
                      <p className="text-2xl font-bold">
                        {Math.round(users.reduce((sum, u) => sum + (u.analytics?.growthScore || 0), 0) / users.length)}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Growth Score</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-500/5">
                      <Brain className="w-8 h-8 text-purple-500 mb-2" />
                      <p className="text-2xl font-bold">
                        {users.reduce((sum, u) => sum + (u.analytics?.totalMessages || 0), 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Revenue Analytics</h3>
                  <p className="text-sm text-muted-foreground">Subscription revenue and financial metrics</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={timeRange === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setTimeRange('week'); fetchRevenueData('week'); }}
                    data-testid="button-timerange-week"
                  >
                    Week
                  </Button>
                  <Button
                    variant={timeRange === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setTimeRange('month'); fetchRevenueData('month'); }}
                    data-testid="button-timerange-month"
                  >
                    Month
                  </Button>
                  <Button
                    variant={timeRange === 'year' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setTimeRange('year'); fetchRevenueData('year'); }}
                    data-testid="button-timerange-year"
                  >
                    Year
                  </Button>
                </div>
              </div>

              {revenueData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card data-testid="card-total-revenue">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Revenue</p>
                          <p className="text-2xl font-bold">${revenueData.totalRevenue?.toFixed(2) || '0.00'}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-mrr">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">MRR</p>
                          <p className="text-2xl font-bold">${revenueData.mrr?.toFixed(2) || '0.00'}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-arr">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">ARR</p>
                          <p className="text-2xl font-bold">${revenueData.arr?.toFixed(2) || '0.00'}</p>
                        </div>
                        <CreditCard className="w-8 h-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-active-subs">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                          <p className="text-2xl font-bold">{revenueData.activeSubscriptions || 0}</p>
                        </div>
                        <Users className="w-8 h-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card data-testid="card-subscription-growth">
                  <CardHeader>
                    <CardTitle>Subscription Growth</CardTitle>
                    <CardDescription>New and cancelled subscriptions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {revenueData && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            <span className="font-medium">New Subscriptions</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-new-subs">
                            {revenueData.newSubscriptions || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-red-500" />
                            <span className="font-medium">Cancelled Subscriptions</span>
                          </div>
                          <span className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-cancelled-subs">
                            {revenueData.cancelledSubscriptions || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="font-medium">Average Revenue Per User</span>
                          <span className="text-xl font-bold" data-testid="text-arpu">
                            ${revenueData.avgRevenuePerUser?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-plan-breakdown">
                  <CardHeader>
                    <CardTitle>Plan Breakdown</CardTitle>
                    <CardDescription>Revenue by subscription plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {revenueData?.planBreakdown && revenueData.planBreakdown.length > 0 ? (
                      <div className="space-y-3">
                        {revenueData.planBreakdown.map((plan: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg" data-testid={`plan-${plan.plan}`}>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              <span className="font-medium capitalize">{plan.plan}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="secondary">{plan.count} users</Badge>
                              <span className="font-bold">${plan.revenue?.toFixed(2) || '0.00'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No plan data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {subscriptionStats && (
                <Card data-testid="card-subscription-stats">
                  <CardHeader>
                    <CardTitle>Subscription Overview</CardTitle>
                    <CardDescription>All-time subscription statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <p className="text-3xl font-bold text-primary" data-testid="text-total-subs">{subscriptionStats.total || 0}</p>
                        <p className="text-sm text-muted-foreground mt-1">Total</p>
                      </div>
                      <div className="text-center p-4 bg-green-500/5 rounded-lg">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="text-active-subs-total">{subscriptionStats.active || 0}</p>
                        <p className="text-sm text-muted-foreground mt-1">Active</p>
                      </div>
                      <div className="text-center p-4 bg-red-500/5 rounded-lg">
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400" data-testid="text-cancelled-subs-total">{subscriptionStats.cancelled || 0}</p>
                        <p className="text-sm text-muted-foreground mt-1">Cancelled</p>
                      </div>
                      <div className="text-center p-4 bg-gray-500/5 rounded-lg">
                        <p className="text-3xl font-bold text-gray-600 dark:text-gray-400" data-testid="text-expired-subs">{subscriptionStats.expired || 0}</p>
                        <p className="text-sm text-muted-foreground mt-1">Expired</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="twins" className="space-y-4">
              {selectedUser && digitalTwin ? (
                <div className="space-y-4">


            <TabsContent value="perception" className="space-y-4">
              {selectedUser ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Perception Profile</CardTitle>
                        <CardDescription>AI-generated psychological and cognitive analysis</CardDescription>
                      </div>
                      <Button onClick={() => generatePerceptionProfile(selectedUser)} disabled={loading}>
                        <Brain className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Generate Profile
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-6">
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        ⚠️ Perception profiles are probabilistic estimates for research purposes only. 
                        Not for clinical or diagnostic use. Always ensure user consent.
                      </p>
                    </div>
                    
                    {perceptionProfile ? (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold mb-2">Summary</h3>
                          <p className="text-muted-foreground">{perceptionProfile.summary}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant={perceptionProfile.consentGiven ? "default" : "destructive"}>
                              {perceptionProfile.consentGiven ? "Consent Given" : "No Consent"}
                            </Badge>
                            <Badge variant="outline">
                              Confidence: {Math.round((perceptionProfile.confidenceOverall || 0) * 100)}%
                            </Badge>
                          </div>
                        </div>

                        {perceptionProfile.cognitiveProxy && (
                          <div>
                            <h3 className="font-semibold mb-3">Cognitive Proxy Estimate</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 rounded-lg border">
                                <p className="text-3xl font-bold">{perceptionProfile.cognitiveProxy.estimate}</p>
                                <p className="text-sm text-muted-foreground">
                                  95% CI: [{perceptionProfile.cognitiveProxy.ci[0]}, {perceptionProfile.cognitiveProxy.ci[1]}]
                                </p>
                              </div>
                              <div className="p-4 rounded-lg border">
                                <p className="text-sm text-muted-foreground mb-2">Based on:</p>
                                <div className="flex flex-wrap gap-1">
                                  {perceptionProfile.cognitiveProxy.basis.map((b: string) => (
                                    <Badge key={b} variant="secondary" className="text-xs">
                                      {b.replace(/_/g, ' ')}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {perceptionProfile.keyPhrases && perceptionProfile.keyPhrases.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-3">Key Phrases</h3>
                            <div className="space-y-2">
                              {perceptionProfile.keyPhrases.map((phrase: string, idx: number) => (
                                <div key={idx} className="p-2 rounded bg-muted text-sm italic">
                                  "{phrase}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {perceptionProfile.engagementPatterns && (
                          <div>
                            <h3 className="font-semibold mb-3">Engagement Patterns</h3>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="p-3 rounded-lg bg-muted">
                                <p className="text-sm text-muted-foreground">Peak Hours</p>
                                <p className="font-medium">{perceptionProfile.engagementPatterns.peak_hours?.join(', ')}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-muted">
                                <p className="text-sm text-muted-foreground">Interactions</p>
                                <p className="font-medium">{perceptionProfile.engagementPatterns.total_interactions}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-muted">
                                <p className="text-sm text-muted-foreground">Consistency</p>
                                <p className="font-medium">{Math.round((perceptionProfile.engagementPatterns.consistency_score || 0) * 100)}%</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Generate a perception profile to view detailed analysis
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Select a user to view perception profile</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="experiments" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Research Experiments</CardTitle>
                      <CardDescription>Manage research studies and participant data</CardDescription>
                    </div>
                    <Button onClick={() => setShowCreateExperiment(true)}>
                      <Zap className="w-4 h-4 mr-2" />
                      New Experiment
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {experiments.map((exp) => (
                      <div key={exp.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{exp.name}</h3>
                              <Badge variant={
                                exp.status === 'active' ? 'default' :
                                exp.status === 'completed' ? 'secondary' : 'outline'
                              }>
                                {exp.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{exp.hypothesis}</p>
                            {exp.description && (
                              <p className="text-sm text-muted-foreground/80">{exp.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {exp.participantCount} participants
                              </span>
                              <span className="text-muted-foreground">
                                Created {new Date(exp.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                    {experiments.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No experiments created yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Digital Twin Profile</CardTitle>
                          <CardDescription>User: {selectedUser}</CardDescription>
                        </div>
                        <Button onClick={() => generateDigitalTwin(selectedUser)} disabled={loading}>
                          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                          Regenerate
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Personality Vector */}
                      <div>
                        <h3 className="font-semibold mb-3">Personality Profile (Big Five)</h3>
                        <div className="space-y-2">
                          {digitalTwin.personalityVector?.map((value, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{getPersonalityLabel(index)}</span>
                                <span className="font-medium">{Math.round(value)}%</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${value}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div>
                        <h3 className="font-semibold mb-3">User Statistics</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-2xl font-bold">{digitalTwin.stats.totalMemories}</p>
                            <p className="text-xs text-muted-foreground">Memories</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-2xl font-bold">{digitalTwin.stats.totalBeliefs}</p>
                            <p className="text-xs text-muted-foreground">Beliefs</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-2xl font-bold">{digitalTwin.stats.totalContradictions}</p>
                            <p className="text-xs text-muted-foreground">Contradictions</p>
                          </div>
                        </div>
                      </div>

                      {/* Emotional Signature */}
                      {digitalTwin.emotionalSignature && (
                        <div>
                          <h3 className="font-semibold mb-3">Emotional Signature</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg border">
                              <p className="text-sm text-muted-foreground">Dominant Emotion</p>
                              <p className="text-lg font-medium capitalize">{digitalTwin.emotionalSignature.dominantEmotion}</p>
                            </div>
                            <div className="p-3 rounded-lg border">
                              <p className="text-sm text-muted-foreground">Emotional Range</p>
                              <p className="text-lg font-medium">{Math.round(digitalTwin.emotionalSignature.emotionalRange * 100)}%</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Conversation Style */}
                      {digitalTwin.conversationStyle && (
                        <div>
                          <h3 className="font-semibold mb-3">Conversation Style</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Verbosity</span>
                              <Badge variant="outline" className="capitalize">
                                {digitalTwin.conversationStyle.verbosity}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Avg Message Length</span>
                              <span className="text-sm font-medium">
                                {Math.round(digitalTwin.conversationStyle.avgMessageLength)} chars
                              </span>
                            </div>
                            {digitalTwin.conversationStyle.preferredTopics && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Preferred Topics</p>
                                <div className="flex flex-wrap gap-2">
                                  {digitalTwin.conversationStyle.preferredTopics.map((topic: string) => (
                                    <Badge key={topic} variant="secondary" className="capitalize">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Select a user to view their digital twin profile</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </ResponsiveContainer>
    </div>
  );
}
