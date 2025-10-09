
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity, 
  Zap, 
  Target, 
  Users, 
  Calendar,
  Brain,
  Heart,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import PhaseIndicator from './PhaseIndicator';

type GrowthPhase = "expansion" | "contraction" | "renewal";

interface GrowthTimelineData {
  date: Date;
  phase: GrowthPhase;
  confidence: number;
  energyLevels: {
    mental: number;
    physical: number;
    emotional: number;
    spiritual: number;
  };
  journalSentiment?: number;
  keyEvents: string[];
  phaseTransition?: {
    from: string;
    to: string;
    trigger: string;
  };
}

interface PatternVisualization {
  cyclicPatterns: Array<{
    pattern: string;
    frequency: number;
    predictability: number;
    visualization: {
      type: 'line' | 'circular' | 'heatmap';
      data: any[];
    };
  }>;
  energyFlowMaps: Array<{
    dimension: string;
    correlations: Array<{ with: string; strength: number; trend: 'positive' | 'negative' | 'neutral' }>;
    peaks: Array<{ date: Date; value: number; context: string }>;
    valleys: Array<{ date: Date; value: number; context: string }>;
  }>;
  phaseTransitionMap: {
    nodes: Array<{ phase: string; duration: number; frequency: number }>;
    edges: Array<{ from: string; to: string; frequency: number; avgDuration: number; triggers: string[] }>;
  };
}

interface PredictiveModel {
  phaseTransitionPredictions: Array<{
    fromPhase: string;
    toPhase: string;
    probability: number;
    timeframe: string;
    confidenceInterval: { min: number; max: number };
    triggerIndicators: string[];
  }>;
  energyLevelForecasts: Array<{
    dimension: string;
    predictions: Array<{ date: Date; predictedValue: number; confidence: number }>;
    seasonalPatterns: Array<{ period: string; effect: number }>;
  }>;
  growthOpportunityWindows: Array<{
    phase: string;
    optimalActivities: string[];
    timeframe: string;
    probability: number;
  }>;
  riskFactors: Array<{
    factor: string;
    riskLevel: 'low' | 'medium' | 'high';
    indicators: string[];
    preventiveMeasures: string[];
  }>;
}

interface AnalyticsDashboardProps {
  userId: string;
}

export default function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [timeline, setTimeline] = useState<GrowthTimelineData[]>([]);
  const [patterns, setPatterns] = useState<PatternVisualization | null>(null);
  const [predictions, setPredictions] = useState<PredictiveModel | null>(null);
  const [timeframe, setTimeframe] = useState<'3months' | '6months' | '1year' | '2years'>('6months');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    fetchAnalyticsData();
  }, [userId, timeframe]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [timelineRes, patternsRes, predictionsRes] = await Promise.all([
        fetch(`/api/user/${userId}/analytics/timeline?timeframe=${timeframe}`, { credentials: 'include' }),
        fetch(`/api/user/${userId}/analytics/patterns?timeframe=${timeframe}`, { credentials: 'include' }),
        fetch(`/api/user/${userId}/analytics/predictions`, { credentials: 'include' })
      ]);

      if (timelineRes.ok) {
        const timelineData = await timelineRes.json();
        setTimeline(timelineData.map((item: any) => ({
          ...item,
          date: new Date(item.date)
        })));
      }

      if (patternsRes.ok) {
        const patternsData = await patternsRes.json();
        setPatterns(patternsData);
      }

      if (predictionsRes.ok) {
        const predictionsData = await predictionsRes.json();
        setPredictions(predictionsData);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseColor = (phase: GrowthPhase) => {
    switch (phase) {
      case 'expansion': return 'bg-expansion/10 border-expansion text-expansion';
      case 'contraction': return 'bg-contraction/10 border-contraction text-contraction';
      case 'renewal': return 'bg-renewal/10 border-renewal text-renewal';
    }
  };

  const getTrendIcon = (trend: 'positive' | 'negative' | 'neutral') => {
    switch (trend) {
      case 'positive': return <ArrowUpRight className="w-3 h-3 text-green-500" />;
      case 'negative': return <ArrowDownRight className="w-3 h-3 text-red-500" />;
      case 'neutral': return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="mb-4">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-light flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Growth Analytics
          </h1>
          <p className="text-muted-foreground">
            Deep insights into your growth patterns and future predictions
          </p>
        </div>
        
        <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">3 Months</SelectItem>
            <SelectItem value="6months">6 Months</SelectItem>
            <SelectItem value="1year">1 Year</SelectItem>
            <SelectItem value="2years">2 Years</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Growth Timeline</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Growth Timeline */}
        <TabsContent value="timeline" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Timeline Visualization */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Growth Timeline
                </CardTitle>
                <CardDescription>
                  Your journey through growth phases over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.slice(0, 10).map((point, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-lg border"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex-shrink-0">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          point.phase === 'expansion' && "bg-expansion",
                          point.phase === 'contraction' && "bg-contraction",
                          point.phase === 'renewal' && "bg-renewal"
                        )} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {point.date.toLocaleDateString()}
                          </span>
                          <Badge className={getPhaseColor(point.phase)}>
                            {point.phase} ({point.confidence}%)
                          </Badge>
                        </div>
                        
                        {point.keyEvents.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {point.keyEvents[0]}
                          </p>
                        )}
                        
                        {point.phaseTransition && (
                          <div className="text-xs text-primary mt-1">
                            ← {point.phaseTransition.from} to {point.phaseTransition.to}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        {Object.entries(point.energyLevels).map(([dim, level]) => (
                          <div key={dim} className="text-xs text-center">
                            <div className={cn(
                              "w-2 h-6 rounded-sm",
                              level >= 7 && "bg-green-500",
                              level >= 4 && level < 7 && "bg-yellow-500",
                              level < 4 && "bg-red-500"
                            )} />
                            <span className="text-[10px] text-muted-foreground">
                              {dim.charAt(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current State Summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current State</CardTitle>
                </CardHeader>
                <CardContent>
                  {timeline.length > 0 && (
                    <PhaseIndicator 
                      currentPhase={timeline[timeline.length - 1].phase}
                      confidence={timeline[timeline.length - 1].confidence}
                      size="md"
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Energy Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {timeline.length > 0 && Object.entries(timeline[timeline.length - 1].energyLevels).map(([dim, level]) => (
                    <div key={dim} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{dim}</span>
                        <span>{level}/10</span>
                      </div>
                      <Progress value={level * 10} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        {/* Pattern Analysis */}
        <TabsContent value="patterns" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Cyclic Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Cyclic Patterns
                </CardTitle>
                <CardDescription>
                  Recurring patterns in your growth journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patterns?.cyclicPatterns.map((pattern, index) => (
                  <div key={index} className="p-3 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{pattern.pattern}</h4>
                      <Badge variant="secondary">
                        {Math.round(pattern.predictability)}% predictable
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Frequency: {pattern.frequency} occurrences
                    </p>
                    <Progress value={pattern.predictability} className="h-1 mt-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Energy Flow Maps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Energy Correlations
                </CardTitle>
                <CardDescription>
                  How your energy dimensions influence each other
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patterns?.energyFlowMaps.map((flow, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-sm capitalize">{flow.dimension} Energy</h4>
                    {flow.correlations.map((corr, corrIndex) => (
                      <div key={corrIndex} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1">
                          {getTrendIcon(corr.trend)}
                          {corr.with}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(corr.strength * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Phase Transition Map */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Phase Transition Patterns
                </CardTitle>
                <CardDescription>
                  How you typically move between growth phases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {patterns?.phaseTransitionMap.nodes.map((node, index) => (
                    <div key={index} className={cn(
                      "p-3 rounded-lg border text-center",
                      getPhaseColor(node.phase as GrowthPhase)
                    )}>
                      <h4 className="font-medium capitalize">{node.phase}</h4>
                      <p className="text-xs mt-1">
                        {Math.round(node.frequency * 100)}% of time
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Common Transitions</h5>
                  {patterns?.phaseTransitionMap.edges.map((edge, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border-l-2 border-primary/20">
                      <span className="text-sm">
                        {edge.from} → {edge.to}
                      </span>
                      <Badge variant="outline">
                        {edge.frequency} times
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Predictions */}
        <TabsContent value="predictions" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Phase Transition Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Phase Predictions
                </CardTitle>
                <CardDescription>
                  Predicted upcoming phase transitions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {predictions?.phaseTransitionPredictions.map((prediction, index) => (
                  <div key={index} className="p-3 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-sm">
                          {prediction.fromPhase} → {prediction.toPhase}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {prediction.timeframe}
                        </p>
                      </div>
                      <Badge className={prediction.probability > 0.7 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {Math.round(prediction.probability * 100)}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <h5 className="text-xs font-medium">Trigger Indicators:</h5>
                      {prediction.triggerIndicators.slice(0, 2).map((indicator, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground">
                          • {indicator}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Growth Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Growth Opportunities
                </CardTitle>
                <CardDescription>
                  Optimal activities for upcoming phases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {predictions?.growthOpportunityWindows.map((window, index) => (
                  <div key={index} className="p-3 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm capitalize">{window.phase} Phase</h4>
                      <Badge variant="outline">
                        {Math.round(window.probability * 100)}% likely
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">{window.timeframe}</p>
                    
                    <div className="space-y-1">
                      <h5 className="text-xs font-medium">Optimal Activities:</h5>
                      {window.optimalActivities.map((activity, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground">
                          • {activity}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>
                  Potential challenges and preventive measures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predictions?.riskFactors.map((risk, index) => (
                    <div key={index} className={cn(
                      "p-3 rounded-lg border",
                      getRiskColor(risk.riskLevel)
                    )}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{risk.factor}</h4>
                        <Badge className={getRiskColor(risk.riskLevel)}>
                          {risk.riskLevel}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <h5 className="text-xs font-medium">Indicators:</h5>
                          {risk.indicators.slice(0, 2).map((indicator, idx) => (
                            <p key={idx} className="text-xs opacity-75">• {indicator}</p>
                          ))}
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium">Prevention:</h5>
                          {risk.preventiveMeasures.slice(0, 2).map((measure, idx) => (
                            <p key={idx} className="text-xs opacity-75">• {measure}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="insights" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI-Generated Insights
                </CardTitle>
                <CardDescription>
                  Advanced pattern recognition and personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Advanced AI insights will be available once you have more data points.</p>
                  <p className="text-sm mt-2">Continue journaling and checking in to unlock deeper analysis.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab('timeline')}>
                    View Current Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
