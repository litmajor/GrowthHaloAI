
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
  Zap
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
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="twins">Digital Twins</TabsTrigger>
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

            <TabsContent value="twins" className="space-y-4">
              {selectedUser && digitalTwin ? (
                <div className="space-y-4">
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
