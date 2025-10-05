
import { useQuery } from '@tanstack/react-query';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Zap, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface IdeaJourney {
  summary: string;
  timeline: Array<{
    phase: string;
    date: string;
    description: string;
    catalyst: string;
    emotion: string;
    confidence?: number;
  }>;
  currentStatus: {
    form: string;
    maturity: string;
    readiness: string;
  };
  insights: string[];
}

export function IdeaJourneyTimeline({ ideaId }: { ideaId: number }) {
  const { data: journey, isLoading } = useQuery<IdeaJourney>({
    queryKey: ['idea-journey', ideaId],
    queryFn: async () => {
      const response = await fetch(`/api/idea-journey/${ideaId}`);
      if (!response.ok) throw new Error('Failed to fetch idea journey');
      return response.json();
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading journey...</div>;
  }

  if (!journey) return null;

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-2">{journey.summary}</h3>
      <p className="text-sm text-muted-foreground mb-6">
        The evolution of your thinking
      </p>

      {/* Timeline */}
      <div className="space-y-6">
        {journey.timeline.map((event, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative pl-8 border-l-2 border-purple-200"
          >
            {/* Timeline dot */}
            <div 
              className={`absolute -left-2 top-0 w-4 h-4 rounded-full ${
                idx === 0 ? 'bg-green-500' : 
                idx === journey.timeline.length - 1 ? 'bg-purple-500' : 
                'bg-blue-400'
              }`}
            />

            {/* Date and phase */}
            <div className="text-xs text-muted-foreground mb-1">
              {formatDistanceToNow(new Date(event.date))} ago
              <Badge variant="outline" className="ml-2">{event.phase}</Badge>
            </div>

            {/* The idea at this point */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg mb-2 dark:from-purple-950 dark:to-blue-950">
              <p className="text-foreground italic">"{event.description}"</p>
            </div>

            {/* Catalyst */}
            <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
              <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <span><strong>What sparked this:</strong> {event.catalyst}</span>
            </div>

            {/* Emotional state */}
            <div className="flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-muted-foreground">You felt: {event.emotion}</span>
            </div>

            {/* Confidence meter */}
            {event.confidence !== undefined && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Confidence:</span>
                  <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${event.confidence * 100}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-green-500"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(event.confidence * 100)}%
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Current status */}
      <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
        <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Current Status</h4>
        <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">{journey.currentStatus.form}</p>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="default">{journey.currentStatus.maturity}</Badge>
        </div>
        <p className="text-sm text-purple-700 dark:text-purple-300">{journey.currentStatus.readiness}</p>
      </div>

      {/* Insights */}
      <div className="mt-6">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          Insights About Your Process
        </h4>
        <ul className="space-y-2">
          {journey.insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ChevronRight className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
