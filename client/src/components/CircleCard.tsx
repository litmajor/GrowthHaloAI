
import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Lock, Shield, ArrowRight, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import HaloProgressRing from './HaloProgressRing';

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

interface CircleCardProps {
  circle: Circle;
  onJoin?: (circleId: string) => void;
  className?: string;
}

const getCircleIcon = (type: CircleType) => {
  switch (type) {
    case "phase": return Users;
    case "theme": return Star;
    case "practice": return MessageCircle;
    case "transition": return ArrowRight;
    default: return Users;
  }
};

const getPhaseColor = (phase?: GrowthPhase) => {
  if (!phase) return "bg-muted/20";
  switch (phase) {
    case "expansion": return "bg-expansion/10 border-expansion/20";
    case "contraction": return "bg-contraction/10 border-contraction/20";
    case "renewal": return "bg-renewal/10 border-renewal/20";
  }
};

export default function CircleCard({ circle, onJoin, className }: CircleCardProps) {
  const Icon = getCircleIcon(circle.type);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn("group", className)}
    >
      <Card className={cn(
        "h-full hover:shadow-lg transition-all duration-300 cursor-pointer",
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
          <Button 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            onClick={() => onJoin?.(circle.id)}
          >
            {circle.isPrivate ? "Request to Join" : "Join Circle"}
            <ArrowRight className="w-3 h-3 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
