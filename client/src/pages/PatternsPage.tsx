
import { useUser } from '../hooks/use-user';
import { CausalPatterns } from '../components/CausalPatterns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Brain, TrendingUp, Sparkles } from 'lucide-react';

export default function PatternsPage() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please log in to view your patterns.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Growth Patterns</h1>
        <p className="text-muted-foreground">
          Discover cause-and-effect relationships in your life based on your conversations with Bliss.
        </p>
      </div>

      <Tabs defaultValue="patterns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Causal Patterns
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="analogies" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Cross-Domain Wisdom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-6">
          <CausalPatterns userId={user.id} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                AI-powered insights about what's working and what's not in different areas of your life.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="analogies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                Discover how solutions from one area of your life can apply to challenges in another.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
