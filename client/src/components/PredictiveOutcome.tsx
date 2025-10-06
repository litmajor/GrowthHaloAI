
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';

interface PredictiveInsight {
  likelyOutcome: string;
  confidence: number;
  basedOn: string[];
  preventativeActions?: string[];
  alternativeApproaches?: string[];
}

export function PredictiveOutcome({ userId }: { userId: string | number }) {
  const [plannedAction, setPlannedAction] = useState('');
  const [context, setContext] = useState('');

  const predictMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/predict-outcome/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plannedAction, context })
      });
      if (!response.ok) throw new Error('Failed to predict outcome');
      return response.json();
    }
  });

  const handlePredict = () => {
    if (plannedAction.trim() && context.trim()) {
      predictMutation.mutate();
    }
  };

  const prediction = predictMutation.data as PredictiveInsight | undefined;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Your Plan</CardTitle>
          <CardDescription>
            Based on your past experiences, let me predict how this might play out
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              What are you planning to do?
            </label>
            <Textarea
              placeholder="e.g., Work through the weekend to finish this project"
              value={plannedAction}
              onChange={(e) => setPlannedAction(e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              What's the context?
            </label>
            <Textarea
              placeholder="e.g., I'm behind on a deadline and feeling stressed"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handlePredict}
            disabled={!plannedAction.trim() || !context.trim() || predictMutation.isPending}
            className="w-full"
          >
            {predictMutation.isPending ? 'Analyzing...' : 'Predict Outcome'}
          </Button>
        </CardContent>
      </Card>

      {prediction && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Prediction Based on Your History</CardTitle>
              <Badge variant={prediction.confidence > 0.7 ? 'default' : 'secondary'}>
                {Math.round(prediction.confidence * 100)}% confident
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Likely Outcome:</p>
                <p className="text-muted-foreground">{prediction.likelyOutcome}</p>
              </div>
            </div>

            {prediction.basedOn && prediction.basedOn.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Based on:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {prediction.basedOn.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {prediction.preventativeActions && prediction.preventativeActions.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-sm font-medium">Ways to Avoid Pitfalls:</p>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  {prediction.preventativeActions.map((action, i) => (
                    <li key={i}>• {action}</li>
                  ))}
                </ul>
              </div>
            )}

            {prediction.alternativeApproaches && prediction.alternativeApproaches.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-start gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <p className="text-sm font-medium">What Worked Better Before:</p>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  {prediction.alternativeApproaches.map((approach, i) => (
                    <li key={i}>• {approach}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
