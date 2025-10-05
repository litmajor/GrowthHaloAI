
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Sparkles, Lightbulb, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConceptBridge {
  concept1: string;
  concept2: string;
  distance: number;
  potentialSynergy: string;
  novelInsight: string;
  applicability: string;
}

export function CreativeInsights({ userId }: { userId: number }) {
  const [challenge, setChallenge] = useState('');

  const { mutate: generateInsights, data: bridges, isPending } = useMutation({
    mutationFn: async (challenge: string) => {
      const response = await fetch(`/api/creative-insights/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge })
      });
      if (!response.ok) throw new Error('Failed to generate insights');
      return response.json();
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Creative Breakthroughs</h2>
        <p className="text-muted-foreground">
          Connect distant ideas to find novel solutions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            What challenge are you facing?
          </CardTitle>
          <CardDescription>
            I'll bridge your seemingly unrelated interests to spark new ideas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="e.g., I'm trying to make our team meetings more engaging..."
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={() => generateInsights(challenge)}
              disabled={!challenge || isPending}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {isPending ? 'Generating insights...' : 'Generate Creative Insights'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {bridges && bridges.length > 0 && (
        <div className="space-y-4">
          {bridges.map((bridge: ConceptBridge, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
            >
              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm font-medium">
                      {bridge.concept1}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900 rounded-full text-sm font-medium">
                      {bridge.concept2}
                    </div>
                  </div>
                  <CardTitle className="text-lg">
                    {bridge.novelInsight}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm text-muted-foreground">
                      The Connection
                    </h4>
                    <p className="text-sm">{bridge.potentialSynergy}</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg">
                    <h4 className="font-medium mb-2 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      How to Apply This
                    </h4>
                    <p className="text-sm">{bridge.applicability}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
