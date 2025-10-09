
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Lightbulb, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { IdeaJourneyTimeline } from './IdeaJourneyTimeline';
import { useState } from 'react';

interface Idea {
  id: number;
  ideaSummary: string;
  category: string;
  maturityLevel: string;
  currentForm: string;
  updatedAt: string;
}

export function IdeasDashboard({ userId }: { userId: string | number }) {
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);

  const { data: ideas, isLoading } = useQuery<Idea[]>({
    queryKey: ['user-ideas', userId],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch ideas');
      return response.json();
    }
  });

  const getMaturityIcon = (maturity: string) => {
    switch (maturity) {
      case 'seed': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'germinating': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'growing': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'mature': return <CheckCircle className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading your ideas...</div>;
  }

  if (!ideas || ideas.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No ideas tracked yet. Keep chatting and I'll start tracking your evolving thoughts!
        </CardContent>
      </Card>
    );
  }

  const activeIdeas = ideas.filter(i => i.maturityLevel !== 'dormant');
  const matureIdeas = ideas.filter(i => i.maturityLevel === 'mature');
  const developingIdeas = ideas.filter(i => ['seed', 'germinating', 'growing'].includes(i.maturityLevel));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 dark:text-white">Your Idea Garden</h2>
        <p className="text-muted-foreground">
          Watch how your thoughts grow and mature over time
        </p>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({activeIdeas.length})</TabsTrigger>
          <TabsTrigger value="mature">Mature ({matureIdeas.length})</TabsTrigger>
          <TabsTrigger value="developing">Developing ({developingIdeas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          {activeIdeas.map((idea) => (
            <Card 
              key={idea.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedIdeaId(idea.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMaturityIcon(idea.maturityLevel)}
                    <CardTitle className="text-lg">{idea.ideaSummary}</CardTitle>
                  </div>
                  <Badge variant="outline" className="capitalize">{idea.category}</Badge>
                </div>
                <CardDescription>{idea.currentForm}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mature" className="space-y-4 mt-4">
          {matureIdeas.map((idea) => (
            <Card 
              key={idea.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedIdeaId(idea.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMaturityIcon(idea.maturityLevel)}
                    <CardTitle className="text-lg">{idea.ideaSummary}</CardTitle>
                  </div>
                  <Badge variant="outline" className="capitalize">{idea.category}</Badge>
                </div>
                <CardDescription>{idea.currentForm}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="developing" className="space-y-4 mt-4">
          {developingIdeas.map((idea) => (
            <Card 
              key={idea.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedIdeaId(idea.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMaturityIcon(idea.maturityLevel)}
                    <CardTitle className="text-lg">{idea.ideaSummary}</CardTitle>
                  </div>
                  <Badge variant="outline" className="capitalize">{idea.category}</Badge>
                </div>
                <CardDescription>{idea.currentForm}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {selectedIdeaId && (
        <div className="mt-6">
          <IdeaJourneyTimeline ideaId={selectedIdeaId} />
        </div>
      )}
    </div>
  );
}
