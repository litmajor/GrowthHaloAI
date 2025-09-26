
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, Share, MoreVertical, Reply, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import PhaseIndicator from './PhaseIndicator';

type GrowthPhase = "expansion" | "contraction" | "renewal";

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    phase: GrowthPhase;
    isBliss?: boolean;
  };
  timestamp: Date;
  likes: number;
  replies: number;
  tags?: string[];
  isLiked?: boolean;
  hasBlissGuidance?: boolean;
}

interface CircleDiscussionProps {
  discussion: Discussion;
  onLike?: (discussionId: string) => void;
  onReply?: (discussionId: string, content: string) => void;
  onShare?: (discussionId: string) => void;
}

export default function CircleDiscussion({ 
  discussion, 
  onLike, 
  onReply, 
  onShare 
}: CircleDiscussionProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleReply = () => {
    if (replyContent.trim() && onReply) {
      onReply(discussion.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className={cn(
        "hover:shadow-md transition-all duration-300",
        discussion.hasBlissGuidance && "ring-1 ring-primary/20 bg-primary/5"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={discussion.author.avatar} />
              <AvatarFallback>
                {discussion.author.isBliss ? "B" : discussion.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{discussion.author.name}</span>
                {discussion.author.isBliss && (
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Bliss
                  </Badge>
                )}
                <PhaseIndicator 
                  currentPhase={discussion.author.phase} 
                  confidence={80} 
                  size="sm" 
                  showDescription={false}
                />
                <span className="text-xs text-muted-foreground">
                  {discussion.timestamp.toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="font-medium text-foreground">{discussion.title}</h3>
            </div>
            
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground">
            {discussion.content}
          </p>
          
          {discussion.tags && discussion.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {discussion.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike?.(discussion.id)}
              className={cn(
                "text-muted-foreground hover:text-primary",
                discussion.isLiked && "text-red-500 hover:text-red-600"
              )}
            >
              <Heart className={cn(
                "w-4 h-4 mr-1",
                discussion.isLiked && "fill-current"
              )} />
              {discussion.likes}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-muted-foreground hover:text-primary"
            >
              <Reply className="w-4 h-4 mr-1" />
              {discussion.replies}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare?.(discussion.id)}
              className="text-muted-foreground hover:text-primary"
            >
              <Share className="w-4 h-4" />
            </Button>
            
            {discussion.hasBlissGuidance && (
              <Badge variant="outline" className="text-xs ml-auto">
                <Sparkles className="w-3 h-3 mr-1" />
                Bliss Insights Available
              </Badge>
            )}
          </div>
          
          {/* Reply Form */}
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-3 border-t border-border"
            >
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts or insights..."
                className="min-h-[80px]"
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleReply} disabled={!replyContent.trim()}>
                  Reply
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowReplyForm(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
