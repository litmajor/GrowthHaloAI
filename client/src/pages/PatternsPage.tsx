import { useUser } from '../hooks/use-user';
import { CausalPatterns } from '../components/CausalPatterns';
import { PersonalityInsights } from '../components/PersonalityInsights';
import { PredictiveOutcome } from '../components/PredictiveOutcome';
import { GrowthPhaseCompass } from '../components/GrowthPhaseCompass';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Brain, TrendingUp, Sparkles } from 'lucide-react';

export default function PatternsPage() {
  const { user } = useUser();

  // Use a default user ID for demo purposes
  const userId = user?.id || 'demo-user';

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Your Patterns & Insights</h1>
      <p className="text-muted-foreground mb-8">
        Discover what actions lead to what outcomes in your life
      </p>

      <Tabs defaultValue="phase" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="phase">Growth Phase</TabsTrigger>
          <TabsTrigger value="causal">Causal Patterns</TabsTrigger>
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="predictive">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="phase" className="mt-6">
          <GrowthPhaseCompass userId={user.id} />
        </TabsContent>

        <TabsContent value="causal" className="mt-6">
          <CausalPatterns userId={user.id} />
        </TabsContent>

        <TabsContent value="personality">
          <PersonalityInsights userId={userId} />
        </TabsContent>

        <TabsContent value="predictions">
          <PredictiveOutcome userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}