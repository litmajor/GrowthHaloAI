import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function EmotionalTrajectory() {
  const { data: trajectory, isLoading } = useQuery({
    queryKey: ['emotional-trajectory'],
    queryFn: async () => {
      const res = await fetch('/api/emotional-trajectory?days=30');
      if (!res.ok) throw new Error('Failed to fetch emotional trajectory');
      return res.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const chartData = trajectory?.dataPoints?.map((point: any) => ({
    date: format(new Date(point.timestamp), 'MMM d'),
    valence: point.valence,
    emotion: point.dominantEmotion,
  })) || [];

  const getTrendIcon = () => {
    if (!trajectory?.trend) return <Minus className="w-4 h-4" />;
    if (trajectory.trend > 0.1) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trajectory.trend < -0.1) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold mb-1">Your Emotional Journey</CardTitle>
            <CardDescription>Past 30 days of emotional patterns</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                />
                <YAxis
                  domain={[-1, 1]}
                  ticks={[-1, -0.5, 0, 0.5, 1]}
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      return (
                        <div className="bg-white p-2 border rounded shadow-lg">
                          <p className="text-sm font-medium">{payload[0].payload.date}</p>
                          <p className="text-sm text-gray-600">
                            Feeling: {payload[0].payload.emotion}
                          </p>
                          <p className="text-sm">
                            Mood: {(payload[0].value as number).toFixed(2)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="valence"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Patterns */}
            {trajectory?.patterns?.length > 0 && (
              <div className="mt-4 space-y-2">
                {trajectory.patterns.map((pattern: any, idx: number) => (
                  <Alert key={idx} className="border-purple-200 bg-purple-50">
                    <AlertDescription className="text-sm">
                      {pattern.description}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Start chatting with Bliss to track your emotional journey</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}