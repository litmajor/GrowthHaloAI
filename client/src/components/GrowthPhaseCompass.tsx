
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Compass, TrendingUp, CheckCircle, Lightbulb, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface GrowthPhaseAnalysis {
  currentPhase: 'expansion' | 'contraction' | 'renewal';
  phaseProgress: number;
  confidence: number;
  evidence: string[];
  predictedTransition: {
    nextPhase: string;
    estimatedTiming: string;
    earlySignals: string[];
    preparationSuggestions: string[];
  };
  phaseHistory: Array<{
    phase: string;
    duration: number;
    transitionCatalyst: string;
  }>;
  personalPatterns: string[];
  guidance: string;
}

export function GrowthPhaseCompass({ userId }: { userId: number }) {
  const { data: analysis, isLoading } = useQuery<GrowthPhaseAnalysis>({
    queryKey: ['growth-phase-analysis', userId],
    queryFn: async () => {
      const response = await fetch(`/api/growth-phase/analysis/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch growth phase analysis');
      return response.json();
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Analyzing your growth phase...</div>;
  }

  if (!analysis) {
    return null;
  }

  const getPhaseColor = (phase: string) => {
    const colors = {
      expansion: '#10b981',
      contraction: '#8b5cf6',
      renewal: '#3b82f6'
    };
    return colors[phase as keyof typeof colors] || '#6b7280';
  };

  const getPhaseGradient = (phase: string) => {
    const gradients = {
      expansion: 'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
      contraction: 'from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950',
      renewal: 'from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950'
    };
    return gradients[phase as keyof typeof gradients] || 'from-gray-50 to-slate-50';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-500" />
            Your Growth Compass
          </CardTitle>
          <CardDescription>
            Understanding your current phase and what's ahead
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Visual phase indicator */}
          <div className="mb-6">
            <div className="relative w-48 h-48 mx-auto">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                
                {/* Progress arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={getPhaseColor(analysis.currentPhase)}
                  strokeWidth="8"
                  strokeDasharray={`${analysis.phaseProgress * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              </svg>

              {/* Phase label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold capitalize">{analysis.currentPhase}</div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(analysis.phaseProgress * 100)}% through
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase guidance */}
          <Alert className={`mb-4 bg-gradient-to-r ${getPhaseGradient(analysis.currentPhase)}`}>
            <AlertDescription className="text-sm">
              {analysis.guidance}
            </AlertDescription>
          </Alert>

          {/* Evidence */}
          {analysis.evidence.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="text-sm font-medium mb-2">What I'm noticing:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {analysis.evidence.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prediction */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-blue-500" />
            What's Next
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Based on your patterns, you'll likely transition to{' '}
            <strong className="capitalize">{analysis.predictedTransition.nextPhase}</strong> in approximately{' '}
            <strong>{analysis.predictedTransition.estimatedTiming}</strong>.
          </p>

          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Early signals to watch for:
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {analysis.predictedTransition.earlySignals.map((signal, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">→</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>

          {analysis.predictedTransition.preparationSuggestions.length > 0 && (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg">
              <h4 className="text-sm font-medium mb-2">How to Prepare</h4>
              <ul className="space-y-1 text-sm">
                {analysis.predictedTransition.preparationSuggestions.map((suggestion, idx) => (
                  <li key={idx}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Your Unique Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.personalPatterns.map((pattern, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{pattern}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Phase history */}
      {analysis.phaseHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Phase History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.phaseHistory.slice(0, 5).map((entry, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <Badge className="capitalize">{entry.phase}</Badge>
                  <span className="text-muted-foreground">{entry.duration} days</span>
                  <span className="text-xs text-muted-foreground flex-1">
                    {entry.transitionCatalyst}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
