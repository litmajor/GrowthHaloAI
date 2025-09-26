import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageCircle, Heart, Star, Search, Filter, Plus, UserCheck, TrendingUp, BookOpen, Zap, ArrowRight, Globe, Lock, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import HaloProgressRing from '../components/HaloProgressRing';
import PhaseIndicator from '../components/PhaseIndicator';
import SmartMatching from '../components/SmartMatching';
import { ResponsiveContainer } from "@/components/ui/responsive-container";

type GrowthPhase = "expansion" | "contraction" | "renewal";
type CircleType = "phase" | "theme" | "practice" | "transition";

interface Circle {
  id: string;
  name: string;
  description: string;
  type: CircleType;
  phase?: GrowthPhase;
  memberCount: number;
  activeDiscussions: number;
  isPrivate: boolean;
  tags: string[];
  recentActivity: string;
  facilitator?: {
    name: string;
    avatar?: string;
    isBliss?: boolean;
  };
}

interface CommunityMember {
  id: string;
  name: string;
  avatar?: string;
  phase: GrowthPhase;
  joinedDate: string;
  contributionScore: number;
  isOnline: boolean;
}

const phaseCircles: Circle[] = [
  {
    id: "exp-1",
    name: "Expansion Explorers",
    description: "For those in active growth phases, exploring new possibilities and pushing boundaries.",
    type: "phase",
    phase: "expansion",
    memberCount: 234,
    activeDiscussions: 12,
    isPrivate: false,
    tags: ["growth", "exploration", "new experiences"],
    recentActivity: "2 hours ago",
    facilitator: { name: "Bliss", isBliss: true }
  },
  {
    id: "con-1",
    name: "Contraction Sanctuary",
    description: "A safe space for reflection, integration, and processing life experiences.",
    type: "phase",
    phase: "contraction",
    memberCount: 189,
    activeDiscussions: 8,
    isPrivate: true,
    tags: ["reflection", "integration", "self-care"],
    recentActivity: "1 hour ago",
    facilitator: { name: "Sarah Chen", avatar: "/api/placeholder/32/32" }
  },
  {
    id: "ren-1",
    name: "Renewal Circle",
    description: "For those synthesizing insights and emerging with fresh perspectives.",
    type: "phase",
    phase: "renewal",
    memberCount: 156,
    activeDiscussions: 15,
    isPrivate: false,
    tags: ["synthesis", "transformation", "new beginnings"],
    recentActivity: "30 minutes ago",
    facilitator: { name: "Marcus Rivera", avatar: "/api/placeholder/32/32" }
  }
];

const themeCircles: Circle[] = [
  {
    id: "theme-1",
    name: "Authentic Success",
    description: "Redefining success on your own terms, beyond material achievements.",
    type: "theme",
    memberCount: 445,
    activeDiscussions: 23,
    isPrivate: false,
    tags: ["authentic living", "personal values", "meaningful work"],
    recentActivity: "15 minutes ago"
  },
  {
    id: "theme-2",
    name: "Mindful Influence",
    description: "Building authentic influence through presence and genuine connection.",
    type: "theme",
    memberCount: 312,
    activeDiscussions: 18,
    isPrivate: false,
    tags: ["leadership", "authenticity", "influence"],
    recentActivity: "1 hour ago"
  },
  {
    id: "theme-3",
    name: "Purpose Discovery",
    description: "Exploring and evolving your deeper life purpose and calling.",
    type: "theme",
    memberCount: 567,
    activeDiscussions: 31,
    isPrivate: false,
    tags: ["purpose", "calling", "life direction"],
    recentActivity: "45 minutes ago"
  }
];

const practiceCircles: Circle[] = [
  {
    id: "prac-1",
    name: "Daily Journaling",
    description: "Share insights, prompts, and support for consistent journaling practice.",
    type: "practice",
    memberCount: 678,
    activeDiscussions: 28,
    isPrivate: false,
    tags: ["journaling", "self-reflection", "daily practice"],
    recentActivity: "10 minutes ago"
  },
  {
    id: "prac-2",
    name: "Meditation & Mindfulness",
    description: "Deepen your meditation practice with community support and guidance.",
    type: "practice",
    memberCount: 823,
    activeDiscussions: 45,
    isPrivate: false,
    tags: ["meditation", "mindfulness", "inner peace"],
    recentActivity: "25 minutes ago"
  },
  {
    id: "prac-3",
    name: "Creative Expression",
    description: "Explore creativity as a path to self-discovery and authentic expression.",
    type: "practice",
    memberCount: 394,
    activeDiscussions: 19,
    isPrivate: false,
    tags: ["creativity", "art", "self-expression"],
    recentActivity: "2 hours ago"
  }
];

const transitionCircles: Circle[] = [
  {
    id: "trans-1",
    name: "Career Transitions",
    description: "Support for navigating career changes with authenticity and courage.",
    type: "transition",
    memberCount: 289,
    activeDiscussions: 16,
    isPrivate: true,
    tags: ["career change", "professional growth", "courage"],
    recentActivity: "3 hours ago"
  },
  {
    id: "trans-2",
    name: "Relationship Evolution",
    description: "Navigate changing relationships and connection patterns with wisdom.",
    type: "transition",
    memberCount: 234,
    activeDiscussions: 21,
    isPrivate: true,
    tags: ["relationships", "boundaries", "connection"],
    recentActivity: "1 hour ago"
  },
  {
    id: "trans-3",
    name: "Life Milestone Support",
    description: "Community support through major life transitions and milestones.",
    type: "transition",
    memberCount: 445,
    activeDiscussions: 34,
    isPrivate: false,
    tags: ["life transitions", "support", "milestones"],
    recentActivity: "20 minutes ago"
  }
];

const allCircles = [...phaseCircles, ...themeCircles, ...practiceCircles, ...transitionCircles];

const communityMembers: CommunityMember[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "/api/placeholder/40/40",
    phase: "contraction",
    joinedDate: "2023-08-15",
    contributionScore: 89,
    isOnline: true
  },
  {
    id: "2",
    name: "Marcus Rivera",
    avatar: "/api/placeholder/40/40",
    phase: "renewal",
    joinedDate: "2023-09-02",
    contributionScore: 76,
    isOnline: false
  },
  {
    id: "3",
    name: "Elena Vasquez",
    avatar: "/api/placeholder/40/40",
    phase: "expansion",
    joinedDate: "2023-07-20",
    contributionScore: 92,
    isOnline: true
  }
];

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<CircleType | "all">("all");
  const [currentUserPhase] = useState<GrowthPhase>("expansion");

  const filteredCircles = allCircles.filter(circle => {
    const matchesSearch = circle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         circle.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         circle.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "all" || circle.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getCircleIcon = (type: CircleType) => {
    switch (type) {
      case "phase": return Users;
      case "theme": return TrendingUp;
      case "practice": return BookOpen;
      case "transition": return Zap;
      default: return Users;
    }
  };

  const getPhaseColor = (phase?: GrowthPhase) => {
    if (!phase) return "bg-muted";
    switch (phase) {
      case "expansion": return "bg-expansion/10 border-expansion/20";
      case "contraction": return "bg-contraction/10 border-contraction/20";
      case "renewal": return "bg-renewal/10 border-renewal/20";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveContainer size="xl" className="py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-light flex items-center justify-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Growth Circles
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join communities that honor your growth phase and support your authentic journey.
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circles by name, theme, or tag..."
              className="pl-10"
            />
          </div>
          <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as CircleType | "all")}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="phase">Phase</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="practice">Practice</TabsTrigger>
              <TabsTrigger value="transition">Transition</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Smart Matching */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SmartMatching
            currentUserId="current-user-id" // Replace with actual user ID
            onConnect={(userId) => console.log('Connect with:', userId)}
          />
        </motion.div>

        {/* Current Phase Recommendation */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhaseIndicator currentPhase={currentUserPhase} confidence={85} size="sm" showDescription={false} />
                Recommended for Your Current Phase
              </CardTitle>
              <CardDescription>
                Based on your expansion phase, these circles might resonate with your current journey.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {phaseCircles
                  .filter(circle => circle.phase === currentUserPhase)
                  .slice(0, 1)
                  .concat(themeCircles.slice(0, 2))
                  .map((circle) => {
                    const Icon = getCircleIcon(circle.type);
                    return (
                      <motion.div
                        key={circle.id}
                        whileHover={{ scale: 1.02 }}
                        className="group"
                      >
                        <Card className="h-full hover:shadow-md transition-all duration-300 cursor-pointer">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <Icon className="w-5 h-5 text-primary" />
                              <div className="flex items-center gap-1">
                                {circle.isPrivate && <Lock className="w-3 h-3 text-muted-foreground" />}
                                <Badge variant="secondary" className="text-xs">
                                  {circle.type}
                                </Badge>
                              </div>
                            </div>
                            <CardTitle className="text-base">{circle.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {circle.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{circle.memberCount} members</span>
                              <span>{circle.activeDiscussions} discussions</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* All Circles */}
        <motion.div
          className="space-y-6 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCircles.map((circle, index) => {
              const Icon = getCircleIcon(circle.type);
              return (
                <motion.div
                  key={circle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className={cn(
                    "h-full hover:shadow-md transition-all duration-300 cursor-pointer",
                    circle.phase && getPhaseColor(circle.phase)
                  )}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-primary" />
                          {circle.phase && (
                            <HaloProgressRing
                              phase={circle.phase}
                              progress={75}
                              size="sm"
                              showLabel={false}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {circle.isPrivate && (
                            <Shield className="w-3 h-3 text-amber-500" />
                          )}
                          <Badge variant="secondary" className="text-xs capitalize">
                            {circle.type}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {circle.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {circle.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {circle.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {circle.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{circle.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {circle.memberCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {circle.activeDiscussions}
                          </span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {circle.recentActivity}
                        </span>
                      </div>

                      {/* Facilitator */}
                      {circle.facilitator && (
                        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                          <Avatar className="w-6 h-6">
                            {circle.facilitator.avatar ? (
                              <AvatarImage src={circle.facilitator.avatar} />
                            ) : (
                              <AvatarFallback className="text-xs">
                                {circle.facilitator.isBliss ? "B" : circle.facilitator.name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            Facilitated by {circle.facilitator.name}
                          </span>
                          {circle.facilitator.isBliss && (
                            <Badge variant="secondary" className="text-xs">
                              AI
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Join Button */}
                      <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {circle.isPrivate ? "Request to Join" : "Join Circle"}
                        <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Community Guidelines */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Community Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Vulnerable Sharing</h4>
                  <p className="text-sm text-muted-foreground">
                    Our circles are safe spaces for authentic expression. Share from your heart,
                    knowing that vulnerability creates deeper connections and mutual growth.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Wisdom Exchange</h4>
                  <p className="text-sm text-muted-foreground">
                    Every member brings unique insights. Listen deeply, share generously,
                    and approach each interaction as an opportunity for mutual learning.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Growth Partnerships</h4>
                  <p className="text-sm text-muted-foreground">
                    Form meaningful connections through our pairing system. Support each other's
                    journey with accountability, encouragement, and authentic care.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Bliss Guidance</h4>
                  <p className="text-sm text-muted-foreground">
                    Bliss provides gentle facilitation and insights to discussions, helping
                    maintain the supportive atmosphere and philosophical alignment of each circle.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Community Members */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-500" />
                Active Community Members
              </CardTitle>
              <CardDescription>
                Connect with fellow travelers on the growth journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {communityMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <PhaseIndicator
                          currentPhase={member.phase}
                          confidence={80}
                          size="sm"
                          showDescription={false}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-current text-amber-500" />
                        <span>{member.contributionScore}</span>
                        <span>•</span>
                        <span>Joined {new Date(member.joinedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </ResponsiveContainer>
    </div>
  );
}