
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowDown, Sprout } from 'lucide-react';

interface BeliefRevision {
  id: number;
  originalBelief: string;
  revisedBelief: string;
  revisedAt: string;
  revisionType: 'expansion' | 'softening' | 'transformation' | 'integration';
  significance: 'minor' | 'moderate' | 'major';
  explanation: string;
}

export function BeliefJourney() {
  const { data: revisions, isLoading } = useQuery<BeliefRevision[]>({
    queryKey: ['belief-revisions'],
    queryFn: async () => {
      const response = await fetch('/api/belief-revisions');
      if (!response.ok) throw new Error('Failed to fetch belief revisions');
      return response.json();
    }
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths >= 1) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    } else if (diffDays >= 1) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return 'recently';
    }
  };

  const getRevisionColor = (type: string) => {
    const colors = {
      expansion: 'bg-blue-500',
      softening: 'bg-green-500',
      transformation: 'bg-purple-500',
      integration: 'bg-orange-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        Your Transformation Journey
      </h3>
      
      <div className="space-y-6">
        {revisions?.map(revision => (
          <div key={revision.id} className="relative pl-8 border-l-2 border-purple-200">
            <div className={`absolute -left-2 top-0 w-4 h-4 rounded-full ${getRevisionColor(revision.revisionType)}`} />
            
            <div className="text-sm text-gray-500 mb-1">
              {formatTimeAgo(revision.revisedAt)}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-2">
              <div className="text-xs text-gray-500 mb-1">You used to believe:</div>
              <div className="text-gray-700 italic">"{revision.originalBelief}"</div>
            </div>
            
            <div className="flex justify-center my-2">
              <ArrowDown className="w-4 h-4 text-purple-400" />
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-xs text-purple-600 mb-1">Now you're discovering:</div>
              <div className="text-purple-900 italic font-medium">"{revision.revisedBelief}"</div>
            </div>
            
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="capitalize">
                {revision.revisionType}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {revision.significance} shift
              </Badge>
            </div>

            {revision.explanation && (
              <p className="text-sm text-gray-600 mt-2 italic">
                {revision.explanation}
              </p>
            )}
          </div>
        ))}
      </div>
      
      {revisions?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Sprout className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Your transformation journey is just beginning...</p>
          <p className="text-sm mt-2">As you grow and evolve, we'll track your belief shifts here.</p>
        </div>
      )}
    </Card>
  );
}
