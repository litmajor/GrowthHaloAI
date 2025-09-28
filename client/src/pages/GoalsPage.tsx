import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Target, TrendingUp, Clock, Lightbulb, MoreHorizontal, CheckCircle2, Circle, Calendar, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  progress: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  emotionalInvestment: number;
  urgency: number;
  targetDate?: string;
  lastMentioned: string;
  momentum?: 'accelerating' | 'steady' | 'slowing' | 'stalled';
}

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Mock data for development - will be replaced with real API call
  const mockGoals: Goal[] = [
    {
      id: '1',
      title: 'Improve Physical Fitness',
      description: 'Build consistent exercise habits and improve overall health',
      category: 'health',
      priority: 8,
      progress: 65,
      status: 'active',
      emotionalInvestment: 9,
      urgency: 7,
      targetDate: '2025-12-31',
      lastMentioned: '2025-09-25T10:30:00Z',
      momentum: 'accelerating'
    },
    {
      id: '2',
      title: 'Advance Career Development',
      description: 'Focus on skill development and career progression opportunities',
      category: 'career',
      priority: 9,
      progress: 40,
      status: 'active',
      emotionalInvestment: 8,
      urgency: 8,
      lastMentioned: '2025-09-27T14:20:00Z',
      momentum: 'steady'
    },
    {
      id: '3',
      title: 'Deepen Personal Relationships',
      description: 'Strengthen connections with family and friends',
      category: 'relationships',
      priority: 7,
      progress: 30,
      status: 'active',
      emotionalInvestment: 10,
      urgency: 5,
      lastMentioned: '2025-09-26T16:45:00Z',
      momentum: 'slowing'
    },
    {
      id: '4',
      title: 'Learn New Language',
      description: 'Become conversational in Spanish for travel and personal growth',
      category: 'learning',
      priority: 6,
      progress: 85,
      status: 'active',
      emotionalInvestment: 7,
      urgency: 4,
      targetDate: '2025-11-15',
      lastMentioned: '2025-09-28T09:15:00Z',
      momentum: 'accelerating'
    }
  ];

  const { data: goals = mockGoals, isLoading } = useQuery({
    queryKey: ['/api/goals'],
    // In real implementation, this would fetch from API
    queryFn: () => Promise.resolve(mockGoals),
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      health: 'from-emerald-500 to-teal-600',
      career: 'from-blue-500 to-indigo-600',
      relationships: 'from-pink-500 to-rose-600',
      learning: 'from-purple-500 to-violet-600',
      financial: 'from-yellow-500 to-orange-600',
      personal: 'from-cyan-500 to-blue-600',
      spiritual: 'from-violet-500 to-purple-600',
      creative: 'from-orange-500 to-red-600',
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getMomentumIcon = (momentum?: string) => {
    switch (momentum) {
      case 'accelerating': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'steady': return <Target className="w-4 h-4 text-blue-500" />;
      case 'slowing': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'stalled': return <Circle className="w-4 h-4 text-red-500" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const mentioned = new Date(date);
    const diffInDays = Math.floor((now.getTime() - mentioned.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return formatDate(date);
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-light text-gray-800">Your Growth Journey</h1>
              <p className="text-gray-600">Tracking your aspirations through the halo of growth</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <p className="text-2xl font-semibold text-gray-800">{activeGoals.length}</p>
                    <p className="text-sm text-gray-600">Active Goals</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-semibold text-gray-800">{completedGoals.length}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-2xl font-semibold text-gray-800">
                      {Math.round(activeGoals.reduce((acc, g) => acc + g.progress, 0) / activeGoals.length || 0)}%
                    </p>
                    <p className="text-sm text-gray-600">Avg Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-semibold text-gray-800">
                      {activeGoals.filter(g => g.momentum === 'accelerating').length}
                    </p>
                    <p className="text-sm text-gray-600">Accelerating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Goals Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="active" className="data-[state=active]:bg-white">
              Active Goals ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white">
              Completed ({completedGoals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {activeGoals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedGoal(goal)}
                  data-testid={`goal-card-${goal.id}`}
                >
                  <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 shadow-sm hover:shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getCategoryColor(goal.category)}`} />
                            <Badge variant="secondary" className="text-xs capitalize">
                              {goal.category}
                            </Badge>
                            {getMomentumIcon(goal.momentum)}
                          </div>
                          <CardTitle className="text-lg font-medium text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {goal.title}
                          </CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {goal.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-600">{goal.progress}%</span>
                        </div>
                        <Progress 
                          value={goal.progress} 
                          className="h-2"
                          data-testid={`progress-${goal.id}`}
                        />
                      </div>

                      {/* Meta Information */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Last mentioned {getTimeAgo(goal.lastMentioned)}</span>
                        </div>
                        {goal.targetDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(goal.targetDate)}</span>
                          </div>
                        )}
                      </div>

                      {/* Priority & Investment Indicators */}
                      <div className="flex gap-2 mt-3">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  i < Math.ceil(goal.priority / 2) ? 'bg-blue-400' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">Priority</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  i < Math.ceil(goal.emotionalInvestment / 2) ? 'bg-pink-400' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">Investment</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {activeGoals.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No active goals yet</h3>
                <p className="text-gray-500 mb-6">
                  Start a conversation with Bliss about your aspirations and watch your goals naturally emerge.
                </p>
                <Button 
                  onClick={() => window.location.href = '/chat'}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  data-testid="chat-with-bliss-button"
                >
                  Chat with Bliss
                </Button>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {completedGoals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="opacity-75"
                >
                  <Card className="border-0 bg-white/60 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <Badge variant="secondary" className="text-xs capitalize bg-green-100 text-green-800">
                          {goal.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-medium text-gray-700">
                        {goal.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        {goal.description}
                      </p>
                      <div className="text-xs text-gray-500">
                        Completed on {goal.targetDate ? formatDate(goal.targetDate) : 'Unknown date'}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {completedGoals.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No completed goals yet</h3>
                <p className="text-gray-500">
                  Your journey of achievement awaits. Keep working on your active goals!
                </p>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Goal Detail Modal (placeholder for future enhancement) */}
      <AnimatePresence>
        {selectedGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedGoal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">{selectedGoal.title}</h3>
              <p className="text-gray-600 mb-4">{selectedGoal.description}</p>
              <div className="flex justify-end">
                <Button onClick={() => setSelectedGoal(null)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}