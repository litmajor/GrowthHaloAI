
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, HelpCircle, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface DiscussionGuidance {
  guidance: string;
  reflectionQuestions: string[];
  needsProfessionalInput: boolean;
  moderationLevel: 'none' | 'gentle' | 'active';
}

interface BlissGuidanceProps {
  circleId: string;
  discussionContent: string;
  recentMessages: Array<{
    content: string;
    authorPhase: string;
    timestamp: Date;
  }>;
  participantPhases: string[];
  onGuidanceReceived?: (guidance: DiscussionGuidance) => void;
  className?: string;
}

export default function BlissGuidance({
  circleId,
  discussionContent,
  recentMessages,
  participantPhases,
  onGuidanceReceived,
  className
}: BlissGuidanceProps) {
  const [guidance, setGuidance] = useState<DiscussionGuidance | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState(false);

  useEffect(() => {
    // Auto-generate guidance for new discussions or when moderation is needed
    if (recentMessages.length > 0) {
      generateGuidance();
    }
  }, [discussionContent, recentMessages.length]);

  const generateGuidance = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/community/discussion-guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          circleId,
          discussionContent,
          recentMessages,
          participantPhases
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate guidance');
      }

      const guidanceData = await response.json();
      setGuidance(guidanceData);
      setShowGuidance(true);
      onGuidanceReceived?.(guidanceData);
    } catch (error) {
      console.error('Error generating guidance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModerationBadge = (level: string) => {
    switch (level) {
      case 'active':
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Active Guidance
          </Badge>
        );
      case 'gentle':
        return (
          <Badge variant="secondary" className="text-xs">
            <Lightbulb className="w-3 h-3 mr-1" />
            Gentle Support
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            Flowing Well
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 p-3 rounded-lg bg-primary/5", className)}>
        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-sm text-muted-foreground">Bliss is reflecting on the conversation...</span>
      </div>
    );
  }

  if (!guidance || !showGuidance) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={generateGuidance}
        className={cn("text-primary hover:bg-primary/10", className)}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Ask Bliss for Guidance
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              Bliss Guidance
            </CardTitle>
            {getModerationBadge(guidance.moderationLevel)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Professional Input Alert */}
          {guidance.needsProfessionalInput && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Bliss suggests this conversation might benefit from professional support. 
                Consider reaching out to a qualified therapist or counselor.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Main Guidance */}
          <div className="p-3 rounded-lg bg-background/50 border border-border/50">
            <p className="text-sm leading-relaxed text-foreground">
              {guidance.guidance}
            </p>
          </div>
          
          {/* Reflection Questions */}
          {guidance.reflectionQuestions.length > 0 && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedQuestions(!expandedQuestions)}
                className="h-auto p-0 font-medium text-sm text-primary hover:bg-transparent"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Reflection Questions ({guidance.reflectionQuestions.length})
              </Button>
              
              <AnimatePresence>
                {expandedQuestions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    {guidance.reflectionQuestions.map((question, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 p-2 rounded-lg bg-muted/30"
                      >
                        <MessageCircle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {question}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGuidance(false)}
              className="text-xs"
            >
              Dismiss
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateGuidance}
              className="text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Refresh Guidance
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
