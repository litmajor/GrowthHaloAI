
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Network, Lightbulb, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MemoryPattern {
  pattern: string;
  frequency: number;
  insights: string[];
}

interface MemoryCluster {
  id: string;
  concepts: string[];
  emotionalContext: number;
  phaseContext: string;
  strengthScore: number;
}

interface MemoryInsightsProps {
  userId: string;
  className?: string;
}

export default function MemoryInsights({ userId, className }: MemoryInsightsProps) {
  const [patterns, setPatterns] = useState<{
    memories: any[];
    patterns: MemoryPattern[];
    predictions: Array<{ prediction: string; confidence: number }>;
  }>({ memories: [], patterns: [], predictions: [] });
  
  const [clusters, setClusters] = useState<{
    clusters: MemoryCluster[];
    emergentThemes: string[];
  }>({ clusters: [], emergentThemes: [] });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'patterns' | 'clusters'>('patterns');

  const fetchMemoryPatterns = async (patternType: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/memory/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          pattern: patternType,
          timeframe: 'month'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPatterns(data);
      }
    } catch (error) {
      console.error('Error fetching memory patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemoryClusters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/memory/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setClusters(data);
      }
    } catch (error) {
      console.error('Error fetching memory clusters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'patterns') {
      fetchMemoryPatterns('emotional_cycles');
    } else {
      fetchMemoryClusters();
    }
  }, [activeTab, userId]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          Memory & Recall System
        </h2>
        
        <div className="flex rounded-lg bg-muted p-1">
          <Button
            variant={activeTab === 'patterns' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('patterns')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Patterns
          </Button>
          <Button
            variant={activeTab === 'clusters' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('clusters')}
          >
            <Network className="w-4 h-4 mr-2" />
            Clusters
          </Button>
        </div>
      </div>

      {activeTab === 'patterns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {['emotional_cycles', 'breakthrough_moments', 'recurring_challenges', 'growth_accelerators'].map((patternType) => (
              <Button
                key={patternType}
                variant="outline"
                size="sm"
                onClick={() => fetchMemoryPatterns(patternType)}
                className="capitalize"
              >
                {patternType.replace('_', ' ')}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Sparkles className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2">Analyzing memory patterns...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Detected Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patterns.patterns.map((pattern, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{pattern.pattern}</h4>
                        <Badge variant="outline" className="text-xs">
                          {pattern.frequency}x
                        </Badge>
                      </div>
                      {pattern.insights.map((insight, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          {insight}
                        </p>
                      ))}
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Predictions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Predictive Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patterns.predictions.map((prediction, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium">{prediction.prediction}</p>
                        <Badge 
                          variant={prediction.confidence > 70 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {prediction.confidence}%
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'clusters' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Network className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2">Clustering semantic memories...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Emergent Themes */}
              {clusters.emergentThemes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Emergent Themes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {clusters.emergentThemes.map((theme, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Memory Clusters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clusters.clusters.map((cluster, index) => (
                  <motion.div
                    key={cluster.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>Cluster {index + 1}</span>
                          <Badge 
                            variant={cluster.strengthScore > 0.7 ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {Math.round(cluster.strengthScore * 100)}% strength
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {cluster.phaseContext} phase
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Concepts</p>
                          <div className="flex flex-wrap gap-1">
                            {cluster.concepts.map((concept, i) => (
                              <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: cluster.emotionalContext > 0 ? '#10b981' : 
                                               cluster.emotionalContext < 0 ? '#ef4444' : '#6b7280'
                              }}
                            />
                            <span className="text-muted-foreground">
                              {cluster.emotionalContext > 0 ? 'Positive' : 
                               cluster.emotionalContext < 0 ? 'Challenging' : 'Neutral'} context
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
