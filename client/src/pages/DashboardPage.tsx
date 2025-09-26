
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Compass, Brain, Heart, Zap, Users, Target, BarChart3, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import HaloProgressRing from "../components/HaloProgressRing";
import PhaseIndicator from "../components/PhaseIndicator";
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

export default function DashboardPage() {
  const [dashboardData] = useState<DashboardData>({
    currentPhase: "contraction",
    phaseConfidence: 73,
    energyLevels: {
      mental: 6,
      physical: 7,
      emotional: 5,
      spiritual: 8
    },
    weeklyInsights: [
      "Your reflection time has increased 40% this week - embracing the contraction phase beautifully.",
      "Energy patterns show deep spiritual connection emerging through this inward turn.",
      "Decision alignment with core values improved by 25% since last check-in."
    ],
    recentJournalEntries: 5,
    intentionsProgress: {
      "Deep Self-Reflection": 85,
      "Mindful Presence": 70,
      "Authentic Expression": 60,
      "Holistic Wellness": 75
    }
  });

  const energyIcons = {
    mental: Brain,
    physical: Zap,
    emotional: Heart,
    spiritual: Users
  };

  const getEnergyColor = (level: number) => {
    if (level >= 7) return "text-renewal";
    if (level >= 5) return "text-expansion";
    return "text-contraction";
  };

  const phaseColors = {
    expansion: "from-expansion/20 to-expansion/5",
    contraction: "from-contraction/20 to-contraction/5",
    renewal: "from-renewal/20 to-renewal/5"
  };

  return (
    <motion.div 
      className="container mx-auto py-6 px-4 space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h1 
          className="text-3xl font-light"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Your Growth Halo
        </motion.h1>
        <motion.p 
          className="text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Welcome to your personal command center for authentic growth and transformation.
        </motion.p>
      </div>

      {/* Growth Phase Central Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className={cn("border-2 bg-gradient-to-br", phaseColors[dashboardData.currentPhase])}>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-light mb-2">Current Growth Phase</h2>
                <PhaseIndicator 
                  currentPhase={dashboardData.currentPhase}
                  confidence={dashboardData.phaseConfidence}
                  size="lg"
                />
                <p className="text-muted-foreground mt-4 max-w-md">
                  You're in a beautiful contraction phase - a time for integration, 
                  reflection, and deepening wisdom. Honor this inward turn.
                </p>
              </div>
              <HaloProgressRing 
                phase={dashboardData.currentPhase}
                progress={dashboardData.phaseConfidence}
                size="lg"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Energy Mapping */}
      <motion.div
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(dashboardData.energyLevels).map(([type, level]) => {
                const Icon = energyIcons[type as keyof EnergyLevel];
                return (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium capitalize">{type}</span>
                      </div>
                      <Badge 
                        variant="outline"
                        className={getEnergyColor(level)}
                      >
                        {level}/10
                      </Badge>
                    </div>
                    <Progress value={level * 10} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Insights & Intentions Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Insights */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
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
              {dashboardData.weeklyInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  className="p-3 rounded-lg bg-muted/50 border-l-4 border-primary"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <p className="text-sm">{insight}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Intentions Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
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
              {Object.entries(dashboardData.intentionsProgress).map(([intention, progress], index) => (
                <motion.div
                  key={intention}
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{intention}</span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Today's Growth Actions</CardTitle>
            <CardDescription>
              Phase-appropriate activities for your current journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              <Link href="/intentions">
                <Button 
                  variant="outline" 
                  className="w-full h-auto p-4 flex flex-col gap-2 hover-elevate"
                >
                  <Target className="w-5 h-5" />
                  <span className="font-medium">Set Intentions</span>
                  <span className="text-xs text-muted-foreground">
                    Align with authentic growth
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
        transition={{ delay: 1.0 }}
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
                    className="absolute w-3 h-3 bg-white border-2 border-contraction rounded-full -top-1"
                    style={{ left: "45%" }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                <span>Expansion</span>
                <span>Contraction</span>
                <span>Renewal</span>
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
    </motion.div>
  );
}
