import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Compass, Brain, Heart, Zap, Users, Target, BarChart3, BookOpen, CreditCard, TrendingUp, Sparkles, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components
import HaloProgressRing from "../components/HaloProgressRing";
import PhaseIndicator from "../components/PhaseIndicator";
import WeeklyInsights from "../components/WeeklyInsights";
import MemoryInsights from '@/components/MemoryInsights'; // Import MemoryInsights component
import EmotionalTrajectory from '@/components/EmotionalTrajectory'; // Import EmotionalTrajectory component
import ThemeCloud from '@/components/ThemeCloud'; // Import ThemeCloud component
import { BeliefJourney } from '@/components/BeliefJourney'; // Import BeliefJourney component


import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { cn } from "@/lib/utils";

type GrowthPhase = "expansion" | "contraction" | "renewal";

interface EnergyLevel {
  mental: number;
  physical: number;
  emotional: number;
  spiritual: number;
}

interface DashboardData {
  currentPhase: GrowthPhase;
  phaseConfidence: number;
  energyLevels: EnergyLevel;
  weeklyInsights: string[];
  recentJournalEntries: number;
  intentionsProgress: { [key: string]: number };
}

// Mock data for demonstration purposes
const mockProgress = 75;
const mockPhase: GrowthPhase = "contraction";
const mockConfidence = 82;

// Mock user object for onboarding status
const user = {
  hasCompletedOnboarding: false, // Set to true to hide the "Start Here" section
};

export default function DashboardPage() {
  const userId = "user123"; // This would come from authentication
  const [growthData, setGrowthData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // State for active tab

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        // In a real application, replace this with your actual API endpoint
        // For demonstration, we'll use mock data if fetch fails or is not available
        const response = await fetch(`/api/user/${userId}/growth`);
        if (response.ok) {
          const data: DashboardData = await response.json();
          setGrowthData(data);
        } else {
          // Fallback to mock data if API is not available or returns an error
          setGrowthData({
            currentPhase: mockPhase,
            phaseConfidence: mockConfidence,
            energyLevels: { mental: 7, physical: 5, emotional: 8, spiritual: 6 },
            weeklyInsights: [
              "You've shown remarkable resilience this week, navigating challenges with grace.",
              "Notice the subtle shifts in your emotional landscape; they hold valuable wisdom.",
              "Continue to nurture your physical energy – it's your foundation for everything else."
            ],
            recentJournalEntries: 5,
            intentionsProgress: { "Cultivate Inner Peace": 80, "Enhance Creativity": 65, "Build Stronger Relationships": 90 }
          });
        }
      } catch (error) {
        console.error('Failed to fetch growth data:', error);
        // Fallback to mock data on network error
        setGrowthData({
          currentPhase: mockPhase,
          phaseConfidence: mockConfidence,
          energyLevels: { mental: 7, physical: 5, emotional: 8, spiritual: 6 },
          weeklyInsights: [
            "You've shown remarkable resilience this week, navigating challenges with grace.",
            "Notice the subtle shifts in your emotional landscape; they hold valuable wisdom.",
            "Continue to nurture your physical energy – it's your foundation for everything else."
          ],
          recentJournalEntries: 5,
          intentionsProgress: { "Cultivate Inner Peace": 80, "Enhance Creativity": 65, "Build Stronger Relationships": 90 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, [userId]);

  const currentPhase = growthData?.currentPhase || mockPhase;
  const phaseConfidence = growthData?.phaseConfidence || mockConfidence;

  const energyIcons = {
    mental: Brain,
    physical: Zap,
    emotional: Heart,
    spiritual: Users
  };

  const getEnergyColor = (level: number) => {
    if (level >= 7) return "text-renewal"; // Changed from text-renewal to match phase colors
    if (level >= 5) return "text-expansion";
    return "text-contraction";
  };

  const phaseColors = {
    expansion: "from-expansion/20 to-expansion/5",
    contraction: "from-contraction/20 to-contraction/5",
    renewal: "from-renewal/20 to-renewal/5"
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Navigation Placeholder - Assuming Navigation component exists and is imported */}
      {/* <Navigation currentPhase={currentPhase} phaseConfidence={phaseConfidence} /> */}

      <main className="max-w-7xl mx-auto ml-64 space-y-8">
        {/* Start Here Section for New Users */}
        {(!user?.hasCompletedOnboarding) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Start Here: Your First Steps</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Welcome! Growth Halo helps you understand yourself through reflection and pattern recognition.
                  Here's how to begin:
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <Link href="/checkin">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium text-sm">1. Daily Check-in</div>
                            <div className="text-xs text-muted-foreground">Track your energy (2 min)</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/compass">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Compass className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium text-sm">2. Find Your Values</div>
                            <div className="text-xs text-muted-foreground">What matters most? (5 min)</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/chat">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium text-sm">3. Chat with Bliss</div>
                            <div className="text-xs text-muted-foreground">Share what's on your mind</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-foreground">
            Your Growth Halo Journey
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Track your cyclical growth phases and discover your authentic path forward
          </p>
        </div>

        {/* Progress Ring and Phase Indicator */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-8 sm:space-y-0 sm:space-x-8 lg:space-x-12">
          <HaloProgressRing
            progress={loading ? 0 : phaseConfidence}
            phase={currentPhase}
            size={window.innerWidth < 640 ? 150 : 200}
          />
          <PhaseIndicator
            currentPhase={currentPhase}
            confidence={loading ? 0 : phaseConfidence}
            size="lg"
          />
        </div>

        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6"> {/* Changed to 6 columns */}
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="values">Values</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger> {/* New Memory tab */}
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

              {/* Energy Mapping Card */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Energy Mapping
                    </CardTitle>
                    <CardDescription>
                      Your current energy levels across all dimensions of being
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="animate-pulse space-y-4">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-4 bg-muted rounded" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-6">
                        {Object.entries(growthData?.energyLevels || { mental: 5, physical: 5, emotional: 5, spiritual: 5 }).map(([type, level]) => (
                          <div key={type} className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm capitalize">{type}</span>
                              <span className="text-sm font-medium">{level}/10</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={`bg-primary h-2 rounded-full transition-all duration-500 ${getEnergyColor(level as number)}`}
                                style={{ width: `${(level as number) * 10}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Journal Entries Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="h-full flex flex-col justify-center items-center">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Recent Journal Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <motion.div
                        className="text-5xl font-light text-primary mb-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        {growthData?.recentJournalEntries || 0}
                      </motion.div>
                      <p className="text-sm text-muted-foreground">Entries this week</p>
                      <Button variant="ghost" className="mt-4">
                        View Journal →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Weekly Insights & Intentions Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

              {/* Weekly Insights */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Weekly Insights from Bliss
                    </CardTitle>
                    <CardDescription>
                      AI-powered observations about your growth patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="animate-pulse space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-4 bg-muted rounded" />
                        ))}
                      </div>
                    ) : (
                      (growthData?.weeklyInsights || []).map((insight: string, index: number) => (
                        <motion.div
                          key={index}
                          className="p-3 rounded-lg bg-muted/50 border-l-4 border-primary"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                        >
                          <p className="text-sm">{insight}</p>
                        </motion.div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Intentions Progress */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Current Intentions
                    </CardTitle>
                    <CardDescription>
                      Progress on your authentic growth intentions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="animate-pulse space-y-4">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-4 bg-muted rounded" />
                        ))}
                      </div>
                    ) : (
                      Object.entries(growthData?.intentionsProgress || {}).map(([intention, progress], index) => (
                        <motion.div
                          key={intention}
                          className="space-y-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.0 + index * 0.1 }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{intention}</span>
                            <span className="text-sm text-muted-foreground">{progress}%</span>
                          </div>
                          <Progress value={progress as number} className="h-2" />
                        </motion.div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Today's Growth Actions</CardTitle>
                  <CardDescription>
                    Phase-appropriate activities for your current journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/checkin">
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 flex flex-col gap-2 hover-elevate"
                      >
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">Daily Check-in</span>
                        <span className="text-xs text-muted-foreground">
                          Reflect on today's energy
                        </span>
                      </Button>
                    </Link>

                    <Link href="/compass">
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 flex flex-col gap-2 hover-elevate"
                      >
                        <Compass className="w-5 h-5" />
                        <span className="font-medium">Values Compass</span>
                        <span className="text-xs text-muted-foreground">
                          Navigate decisions authentically
                        </span>
                      </Button>
                    </Link>

                    <Link href="/journal">
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 flex flex-col gap-2 hover-elevate"
                      >
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">Growth Journal</span>
                        <span className="text-xs text-muted-foreground">
                          Deep reflection time
                        </span>
                      </Button>
                    </Link>

                    <Link href="/goals">
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 flex flex-col gap-2 hover-elevate"
                      >
                        <Target className="w-5 h-5" />
                        <span className="font-medium">Manage Goals</span>
                        <span className="text-xs text-muted-foreground">
                          Track your growth objectives
                        </span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Growth Timeline Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Growth Halo Timeline</CardTitle>
                  <CardDescription>
                    Your cyclical journey over the past 90 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-24 overflow-hidden">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-1 bg-muted rounded-full relative">
                        {/* Timeline phases visualization */}
                        <div className="absolute left-0 w-1/3 h-full bg-expansion rounded-full"></div>
                        <div className="absolute left-1/3 w-1/3 h-full bg-contraction rounded-full"></div>
                        <div className="absolute left-2/3 w-1/3 h-full bg-renewal rounded-full"></div>

                        {/* Current position marker */}
                        <motion.div
                          className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full -top-1"
                          style={{ left: `${mockProgress}%` }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
                      <span>Start</span>
                      <span>Mid-Phase</span>
                      <span>End</span>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="ghost" size="sm">
                      View Full Timeline →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Insights Tab Content (assuming it exists and is unchanged) */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Deeper dives into your growth patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Insights content loading...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab Content */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Growth Trajectory
                  </CardTitle>
                  <CardDescription>Your progress over the past 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Journal Entries</span>
                      <Badge>{growthData?.recentJournalEntries || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Check-ins Completed</span>
                      <Badge>12</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Insights Captured</span>
                      <Badge>8</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Phase Distribution
                  </CardTitle>
                  <CardDescription>Time spent in each phase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Expansion</span>
                        <span>40%</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Contraction</span>
                        <span>35%</span>
                      </div>
                      <Progress value={35} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Renewal</span>
                        <span>25%</span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Values Tab Content (assuming it exists and is unchanged) */}
          <TabsContent value="values" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Core Values</CardTitle>
                <CardDescription>Navigate life aligned with what matters most</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Values Compass content loading...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Memory Tab Content */}
          <TabsContent value="memory" className="space-y-6">
            <MemoryInsights userId="current-user" />
            <EmotionalTrajectory userId="current-user" />
            <ThemeCloud userId="current-user" />
            <div className="mt-6">
              <BeliefJourney />
            </div>
          </TabsContent>

          {/* Community Tab Content */}
          <TabsContent value="community" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth Circles</CardTitle>
                <CardDescription>Connect with others on similar journeys</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Community features coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </main>
    </div>
  );
}