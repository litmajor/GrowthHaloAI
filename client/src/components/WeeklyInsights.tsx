
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Lightbulb, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WeeklyInsightsProps {
  userId: string;
}

export default function WeeklyInsights({ userId }: WeeklyInsightsProps) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`/api/user/${userId}/insights/weekly`);
        if (response.ok) {
          const data = await response.json();
          setInsights(data);
        }
      } catch (error) {
        console.error('Failed to fetch weekly insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Weekly Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Weekly Insights
          </CardTitle>
          <CardDescription>
            AI-generated patterns and recommendations from your journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Growth Patterns */}
          {insights?.patterns && insights.patterns.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="w-3 h-3" />
                Patterns Detected
              </h4>
              <div className="space-y-2">
                {insights.patterns.slice(0, 3).map((pattern: string, index: number) => (
                  <div key={index} className="text-sm text-muted-foreground border-l-2 border-primary/20 pl-3">
                    {pattern}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {insights?.recommendations && insights.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Growth Recommendations
              </h4>
              <div className="space-y-2">
                {insights.recommendations.slice(0, 3).map((rec: string, index: number) => (
                  <div key={index} className="text-sm">
                    <Badge variant="outline" className="mr-2 mb-1">
                      Week {index + 1}
                    </Badge>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase Progression */}
          {insights?.phaseProgression && (
            <div>
              <h4 className="font-medium mb-2">Phase Journey</h4>
              <p className="text-sm text-muted-foreground">
                {insights.phaseProgression}
              </p>
            </div>
          )}

          {!insights || (!insights.patterns && !insights.recommendations && !insights.phaseProgression) && (
            <div className="text-center py-6 text-muted-foreground">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Start journaling to unlock weekly insights!</p>
              <p className="text-xs mt-1">AI will analyze your growth patterns automatically</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
