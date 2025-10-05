
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, Lightbulb, ArrowRight } from 'lucide-react';

interface CausalPattern {
  id: string;
  cause: string;
  effect: string;
  confidence: number;
  domain: string;
  observationCount: number;
}

export function CausalPatterns({ userId }: { userId: number }) {
  const { data: patterns, isLoading } = useQuery<CausalPattern[]>({
    queryKey: ['causal-patterns', userId],
    queryFn: async () => {
      const response = await fetch(`/api/causal-patterns/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch patterns');
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading patterns...</div>;
  }

  if (!patterns || patterns.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Keep conversing with Bliss to discover patterns in your life.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      work: 'bg-blue-500',
      relationships: 'bg-pink-500',
      health: 'bg-green-500',
      creativity: 'bg-purple-500',
      wellbeing: 'bg-amber-500',
    };
    return colors[domain] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Your Cause & Effect Patterns</h3>
      </div>

      {patterns.map((pattern) => (
        <Card key={pattern.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <Badge className={getDomainColor(pattern.domain)}>
                {pattern.domain}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Observed {pattern.observationCount}x • {Math.round(pattern.confidence * 100)}% confidence
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium">When you {pattern.cause}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">You tend to {pattern.effect}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
