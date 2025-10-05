
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { BookOpen, Star, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { useState } from 'react';

interface WisdomEntry {
  id: number;
  insight: string;
  category: string;
  dateRealized: Date;
  contextWhenLearned: string;
  timesReferenced: number;
  applicability: string[];
  confidence: number;
}

interface WisdomCollection {
  theme: string;
  entries: WisdomEntry[];
  evolution: string;
}

interface WisdomBook {
  collections: WisdomCollection[];
  mostReferenced: WisdomEntry[];
  recentBreakthroughs: WisdomEntry[];
  totalWisdom: number;
}

export function WisdomLibrary({ userId }: { userId: number }) {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const { data: wisdomBook, isLoading } = useQuery<WisdomBook>({
    queryKey: ['wisdom-library', userId],
    queryFn: async () => {
      const response = await fetch(`/api/wisdom/library/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch wisdom library');
      return response.json();
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading your wisdom...</div>;
  }

  if (!wisdomBook || wisdomBook.totalWisdom === 0) {
    return (
      <Card className="p-8 text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Your Wisdom Library is Growing</h3>
        <p className="text-muted-foreground">
          As you have breakthrough moments in conversations, your insights will be collected here.
        </p>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 text-purple-500" />
          Your Wisdom Library
        </h1>
        <p className="text-muted-foreground">
          A collection of your hard-won insights and realizations
        </p>
        <Badge variant="secondary" className="text-sm">
          {wisdomBook.totalWisdom} insights collected
        </Badge>
      </div>

      {/* Quick Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-yellow-500" />
              Most Referenced
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wisdomBook.mostReferenced.map(wisdom => (
              <div key={wisdom.id} className="space-y-1">
                <p className="text-sm italic">"{wisdom.insight}"</p>
                <p className="text-xs text-muted-foreground">
                  Referenced {wisdom.timesReferenced} times
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Recent Breakthroughs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wisdomBook.recentBreakthroughs.map(wisdom => (
              <div key={wisdom.id} className="space-y-1">
                <p className="text-sm italic">"{wisdom.insight}"</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(wisdom.dateRealized))} ago
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Collections */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Wisdom Collections</h2>
        
        {wisdomBook.collections.map(collection => (
          <Card key={collection.theme} className="overflow-hidden">
            <button
              onClick={() => setSelectedCollection(
                selectedCollection === collection.theme ? null : collection.theme
              )}
              className="w-full p-4 flex items-center justify-between hover:bg-accent transition-colors"
            >
              <div className="text-left space-y-2">
                <h3 className="font-medium text-lg">{collection.theme}</h3>
                <p className="text-sm text-muted-foreground">{collection.evolution}</p>
                <Badge variant="secondary">
                  {collection.entries.length} insights
                </Badge>
              </div>
              <ChevronRight 
                className={`w-5 h-5 text-muted-foreground transition-transform ${
                  selectedCollection === collection.theme ? 'rotate-90' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {selectedCollection === collection.theme && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t bg-accent/30"
                >
                  <div className="p-4 space-y-4">
                    {collection.entries.map(entry => (
                      <div key={entry.id} className="bg-background p-4 rounded-lg shadow-sm space-y-3">
                        <p className="font-medium">"{entry.insight}"</p>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{entry.category}</Badge>
                          {entry.timesReferenced > 0 && (
                            <Badge variant="secondary">
                              Referenced {entry.timesReferenced}x
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            <strong>Realized:</strong>{' '}
                            {format(new Date(entry.dateRealized), 'MMM d, yyyy')}
                          </p>
                          {entry.contextWhenLearned && (
                            <p>
                              <strong>Context:</strong> {entry.contextWhenLearned}
                            </p>
                          )}
                          {entry.applicability.length > 0 && (
                            <p>
                              <strong>Applies to:</strong>{' '}
                              {entry.applicability.join(', ')}
                            </p>
                          )}
                        </div>

                        {/* Confidence meter */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Confidence:</span>
                          <div className="flex-1 bg-secondary h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                              style={{ width: `${entry.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>
    </div>
  );
}
