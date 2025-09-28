
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MessageCircle, Search, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ChatSession {
  id: string;
  title: string;
  date: Date;
  messageCount: number;
  phase: 'expansion' | 'contraction' | 'renewal';
  preview: string;
  tags: string[];
}

interface ChatHistoryProps {
  userId: string;
  onSelectSession?: (sessionId: string) => void;
  className?: string;
}

export default function ChatHistory({ userId, onSelectSession, className }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');

  useEffect(() => {
    fetchChatHistory();
  }, [userId]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/chat-history`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        // Mock data for demo
        setSessions([
          {
            id: '1',
            title: 'Exploring Career Transition',
            date: new Date('2024-01-15'),
            messageCount: 12,
            phase: 'contraction',
            preview: 'Discussed feeling stuck in current role and exploring new possibilities...',
            tags: ['career', 'transition', 'purpose']
          },
          {
            id: '2',
            title: 'Values Alignment Session',
            date: new Date('2024-01-12'),
            messageCount: 8,
            phase: 'expansion',
            preview: 'Deep dive into core values and how they relate to daily decisions...',
            tags: ['values', 'alignment', 'authenticity']
          },
          {
            id: '3',
            title: 'Morning Reflection',
            date: new Date('2024-01-10'),
            messageCount: 5,
            phase: 'renewal',
            preview: 'Gentle check-in about energy levels and intention setting...',
            tags: ['morning', 'reflection', 'intentions']
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPhase = selectedPhase === 'all' || session.phase === selectedPhase;
    
    return matchesSearch && matchesPhase;
  });

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'expansion': return 'bg-expansion/10 text-expansion border-expansion/20';
      case 'contraction': return 'bg-contraction/10 text-contraction border-contraction/20';
      case 'renewal': return 'bg-renewal/10 text-renewal border-renewal/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const dateObj = new Date(date); // Ensure it's a Date object
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Unknown date';
    }
    
    const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return dateObj.toLocaleDateString(); // Use dateObj instead of date
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
        <div className="h-24 bg-muted rounded-lg animate-pulse" />
        <div className="h-24 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Chat History
          </CardTitle>
          <CardDescription>
            Browse your previous conversations with Bliss
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Phase Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Button
              variant={selectedPhase === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPhase('all')}
            >
              All Phases
            </Button>
            <Button
              variant={selectedPhase === 'expansion' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPhase('expansion')}
              className={selectedPhase === 'expansion' ? 'bg-expansion hover:bg-expansion/90' : ''}
            >
              Expansion
            </Button>
            <Button
              variant={selectedPhase === 'contraction' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPhase('contraction')}
              className={selectedPhase === 'contraction' ? 'bg-contraction hover:bg-contraction/90' : ''}
            >
              Contraction
            </Button>
            <Button
              variant={selectedPhase === 'renewal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPhase('renewal')}
              className={selectedPhase === 'renewal' ? 'bg-renewal hover:bg-renewal/90' : ''}
            >
              Renewal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Sessions */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || selectedPhase !== 'all' 
                    ? 'No conversations match your search criteria.' 
                    : 'No chat history found. Start a conversation with Bliss to see your history here.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onSelectSession?.(session.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium truncate">{session.title}</h3>
                          <Badge className={cn("text-xs capitalize", getPhaseColor(session.phase))}>
                            {session.phase}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {session.preview}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(session.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {session.messageCount} messages
                          </div>
                        </div>
                        
                        {session.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            {session.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
