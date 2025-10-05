
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Brain, Target, MessageSquare, Zap, TrendingUp } from 'lucide-react';

interface PersonalityInsight {
  dimension: string;
  profile: string;
  confidence: number;
  implications: string[];
}

export function PersonalityInsights({ userId }: { userId: number }) {
  const { data: insights, isLoading } = useQuery<PersonalityInsight[]>({
    queryKey: ['personality-insights', userId],
    queryFn: async () => {
      const response = await fetch(`/api/personality-insights/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch personality insights');
      return response.json();
    }
  });

  const getDimensionIcon = (dimension: string) => {
    if (dimension.includes('decision')) return Target;
    if (dimension.includes('stress')) return Zap;
    if (dimension.includes('communication')) return MessageSquare;
    if (dimension.includes('growth')) return TrendingUp;
    return Brain;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading personality insights...</div>;
  }

  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Not enough data yet to generate personality insights.
          Keep chatting to help me understand you better!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Based on our conversations, here's what I've learned about how you work best:
      </div>
      
      {insights.map((insight, index) => {
        const Icon = getDimensionIcon(insight.dimension);
        return (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg capitalize">
                    {insight.dimension}
                  </CardTitle>
                </div>
                <Badge variant="outline">
                  {Math.round(insight.confidence * 100)}% confident
                </Badge>
              </div>
              <CardDescription>{insight.profile}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">What this means for you:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {insight.implications.map((implication, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{implication}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
