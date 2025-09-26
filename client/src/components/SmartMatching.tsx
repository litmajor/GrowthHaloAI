
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, MessageCircle, Star, ArrowRight, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import PhaseIndicator from './PhaseIndicator';

type GrowthPhase = "expansion" | "contraction" | "renewal";

interface CompatibleMember {
  userId: string;
  name: string;
  avatar?: string;
  phase: GrowthPhase;
  compatibilityScore: number;
  reasons: string[];
  complementaryAreas: string[];
  recentActivity: {
    circles: string[];
    contributionScore: number;
  };
}

interface SmartMatchingProps {
  currentUserId: string;
  circleType?: string;
  onConnect?: (userId: string) => void;
  className?: string;
}

export default function SmartMatching({ 
  currentUserId, 
  circleType, 
  onConnect,
  className 
}: SmartMatchingProps) {
  const [compatibleMembers, setCompatibleMembers] = useState<CompatibleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompatibleMembers();
  }, [currentUserId, circleType]);

  const fetchCompatibleMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (circleType) params.append('circleType', circleType);
      params.append('limit', '5');

      const response = await fetch(
        `/api/user/${currentUserId}/community/compatible-members?${params}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch compatible members');
      }
      
      const data = await response.json();
      
      // Mock additional user data (in real app, this would come from the API)
      const enrichedData = data.map((member: any) => ({
        ...member,
        name: `User ${member.userId.slice(-4)}`, // Mock name
        avatar: `/api/placeholder/40/40`,
        phase: ['expansion', 'contraction', 'renewal'][Math.floor(Math.random() * 3)] as GrowthPhase,
        recentActivity: {
          circles: ['Authentic Success', 'Daily Journaling'],
          contributionScore: Math.floor(Math.random() * 100) + 50
        }
      }));
      
      setCompatibleMembers(enrichedData);
    } catch (error) {
      console.error('Error fetching compatible members:', error);
      setError('Failed to find compatible members');
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-blue-500';
    return 'text-yellow-500';
  };

  const getCompatibilityLevel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    return 'Moderate';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Finding Compatible Members...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Smart Connections
        </CardTitle>
        <CardDescription>
          AI-matched community members based on complementary growth needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {compatibleMembers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No compatible members found at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {compatibleMembers.map((member, index) => (
              <motion.div
                key={member.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.name}</span>
                            <PhaseIndicator 
                              currentPhase={member.phase} 
                              confidence={80} 
                              size="sm" 
                              showDescription={false}
                            />
                          </div>
                          <div className="text-right">
                            <div className={cn(
                              "text-sm font-medium",
                              getCompatibilityColor(member.compatibilityScore)
                            )}>
                              {getCompatibilityLevel(member.compatibilityScore)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.round(member.compatibilityScore * 100)}% match
                            </div>
                          </div>
                        </div>
                        
                        <Progress 
                          value={member.compatibilityScore * 100} 
                          className="h-2"
                        />
                        
                        {/* Compatibility Reasons */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {member.reasons.slice(0, 2).map((reason, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                          
                          {member.complementaryAreas.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <TrendingUp className="w-3 h-3" />
                              <span>Complementary: {member.complementaryAreas[0]}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Recent Activity */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {member.recentActivity.contributionScore}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {member.recentActivity.circles.length} circles
                            </span>
                          </div>
                          
                          <Button 
                            size="sm"
                            onClick={() => onConnect?.(member.userId)}
                            className="h-7"
                          >
                            Connect
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            <div className="text-center pt-4">
              <Button variant="outline" onClick={fetchCompatibleMembers}>
                <Sparkles className="w-4 h-4 mr-2" />
                Find More Connections
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
