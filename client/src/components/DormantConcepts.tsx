
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Clock, Lightbulb, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface DormantConcept {
  id: number;
  concept: string;
  category: string;
  lastMentioned: string;
  mentionCount: number;
  emotionalValence: number;
  context: string[];
}

export function DormantConcepts({ userId }: { userId: number }) {
  const { data: concepts, isLoading } = useQuery<DormantConcept[]>({
    queryKey: ['dormant-concepts', userId],
    queryFn: async () => {
      const response = await fetch(`/api/dormant-concepts/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch dormant concepts');
      return response.json();
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading forgotten wisdoms...</div>;
  }

  if (!concepts || concepts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No dormant concepts yet. Keep chatting and I'll remember what matters to you!
        </CardContent>
      </Card>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      value: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      interest: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      skill: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      dream: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      insight: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      approach: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    return colors[category] || colors.interest;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Forgotten Wisdoms</h2>
        <p className="text-muted-foreground">
          Ideas and interests that once mattered to you
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {concepts.map((concept, idx) => (
          <motion.div
            key={concept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      <CardTitle className="text-lg">{concept.concept}</CardTitle>
                    </div>
                    <CardDescription>
                      <Badge className={getCategoryColor(concept.category)}>
                        {concept.category}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      Last mentioned {formatDistanceToNow(new Date(concept.lastMentioned))} ago
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-muted-foreground">You talked about this </span>
                    <span className="font-medium">{concept.mentionCount} times</span>
                    <span className="text-muted-foreground"> when you were:</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {concept.context.map((ctx, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {ctx}
                      </Badge>
                    ))}
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Explore this again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
