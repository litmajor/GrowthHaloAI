
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Code, Copy, Check, MessageCircle, Brain, TrendingUp, Users, Zap, Circle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function APIPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      category: 'Bliss AI',
      icon: <Brain className="w-5 h-5" />,
      color: 'purple',
      endpoints: [
        {
          method: 'POST',
          path: '/api/bliss/adaptive-chat',
          description: 'Engage with Bliss AI using adaptive personality and all 5 behavioral modes',
          request: {
            message: 'string',
            conversationId: 'string (optional)',
            conversationHistory: 'array (optional)',
            userId: 'string'
          },
          response: 'Streaming text response with memory integration'
        },
        {
          method: 'POST',
          path: '/api/chat',
          description: 'Basic chat endpoint with enhanced memory features',
          request: {
            message: 'string',
            conversationHistory: 'array',
            userId: 'string'
          },
          response: {
            message: 'string',
            phase: 'expansion | contraction | renewal',
            confidence: 'number',
            mode: 'string',
            memoryAnchors: 'array'
          }
        },
        {
          method: 'POST',
          path: '/api/detect-phase',
          description: 'Detect current growth phase from message',
          request: {
            message: 'string',
            userId: 'string',
            context: 'object (optional)'
          },
          response: {
            phase: 'expansion | contraction | renewal',
            confidence: 'number',
            indicators: 'array'
          }
        }
      ]
    },
    {
      category: 'Memory & Intelligence',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'blue',
      endpoints: [
        {
          method: 'GET',
          path: '/api/emotional-trajectory',
          description: 'Get emotional trajectory data for visualization',
          request: {
            days: 'number (default: 30)'
          },
          response: {
            dataPoints: 'array',
            trend: 'number',
            patterns: 'array'
          }
        },
        {
          method: 'GET',
          path: '/api/conversation-themes',
          description: 'Retrieve conversation themes for the user',
          response: 'Array of theme objects with frequency data'
        },
        {
          method: 'GET',
          path: '/api/beliefs',
          description: 'Get user beliefs tracked by the system',
          response: 'Array of belief objects with confidence scores'
        },
        {
          method: 'GET',
          path: '/api/contradictions',
          description: 'Get detected contradictions in beliefs',
          response: 'Array of contradiction objects with timestamps'
        }
      ]
    },
    {
      category: 'Advanced Features',
      icon: <Zap className="w-5 h-5" />,
      color: 'amber',
      endpoints: [
        {
          method: 'GET',
          path: '/api/ideas/:userId',
          description: 'Get user ideas tracked through meta-memory',
          request: {
            all: 'boolean (query param, optional)'
          },
          response: 'Array of idea objects with evolution stages'
        },
        {
          method: 'GET',
          path: '/api/wisdom/library/:userId',
          description: 'Access wisdom library for the user',
          response: {
            wisdomBook: 'object',
            insights: 'array',
            applicableWisdom: 'array'
          }
        },
        {
          method: 'POST',
          path: '/api/hypotheses/generate/:userId',
          description: 'Generate hypotheses about user patterns',
          response: 'Array of hypothesis objects'
        },
        {
          method: 'GET',
          path: '/api/causal-patterns/:userId',
          description: 'Get causal reasoning patterns',
          request: {
            domain: 'string (query param, optional)'
          },
          response: 'Array of causal pattern objects'
        }
      ]
    },
    {
      category: 'Growth & Analytics',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'green',
      endpoints: [
        {
          method: 'GET',
          path: '/api/user/:userId/growth',
          description: 'Get comprehensive growth data',
          response: {
            currentPhase: 'string',
            phaseHistory: 'array',
            energyPatterns: 'object',
            insights: 'array'
          }
        },
        {
          method: 'GET',
          path: '/api/user/:userId/analytics/timeline',
          description: 'Generate growth timeline visualization',
          request: {
            timeframe: '3months | 6months | 1year | 2years'
          },
          response: 'Timeline data with milestones and transitions'
        },
        {
          method: 'POST',
          path: '/api/user/:userId/journal',
          description: 'Save journal entry',
          request: {
            content: 'string'
          },
          response: {
            success: 'boolean',
            insights: 'object'
          }
        }
      ]
    },
    {
      category: 'Community',
      icon: <Users className="w-5 h-5" />,
      color: 'pink',
      endpoints: [
        {
          method: 'GET',
          path: '/api/user/:userId/community/compatible-members',
          description: 'Find compatible community members',
          request: {
            circleType: 'string',
            limit: 'number (default: 5)'
          },
          response: 'Array of compatible member profiles'
        },
        {
          method: 'POST',
          path: '/api/user/:userId/follow',
          description: 'Follow another user',
          request: {
            followingId: 'string'
          },
          response: {
            success: 'boolean'
          }
        }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
      blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
      amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
      green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
      pink: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800' },
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Circle className="w-6 h-6 text-primary" />
                <span className="text-lg font-semibold">Growth Halo API</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              v2.0 - Bliss AI Enhanced
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge className="mb-4" variant="secondary">
            <Code className="w-4 h-4 mr-2" />
            Developer API
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Growth Halo API Documentation
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Integrate Bliss AI and advanced growth intelligence into your applications. 
            Access all 5 behavioral modes, memory systems, and analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Get API Key
            </Button>
            <Button size="lg" variant="outline">
              View Examples
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Quick Start */}
      <section className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Start
            </CardTitle>
            <CardDescription>Get started with the Growth Halo API in minutes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Authentication</h4>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                <code>Authorization: Bearer YOUR_API_KEY</code>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Base URL</h4>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                <code>https://api.growthhalo.com/v2</code>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Example Request</h4>
              <div className="bg-muted rounded-lg p-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`curl -X POST https://api.growthhalo.com/v2/api/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "I'm feeling stuck in my career",
    "userId": "user_123"
  }'`, 'example')}
                >
                  {copiedEndpoint === 'example' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <pre className="font-mono text-sm overflow-x-auto">
{`curl -X POST https://api.growthhalo.com/v2/api/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "I'm feeling stuck in my career",
    "userId": "user_123"
  }'`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* API Endpoints */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">API Endpoints</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive endpoints for all Growth Halo features
          </p>
        </div>

        <div className="space-y-8 max-w-6xl mx-auto">
          {endpoints.map((category, categoryIndex) => {
            const colorClasses = getColorClasses(category.color);
            
            return (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <Card className={`border-2 ${colorClasses.border}`}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${colorClasses.bg} flex items-center justify-center ${colorClasses.text}`}>
                        {category.icon}
                      </div>
                      <CardTitle className="text-2xl">{category.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {category.endpoints.map((endpoint, endpointIndex) => (
                        <Card key={endpointIndex} className="bg-muted/30">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                                    {endpoint.method}
                                  </Badge>
                                  <code className="text-sm font-mono">{endpoint.path}</code>
                                </div>
                                <CardDescription className="text-base">
                                  {endpoint.description}
                                </CardDescription>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(endpoint.path, `${categoryIndex}-${endpointIndex}`)}
                              >
                                {copiedEndpoint === `${categoryIndex}-${endpointIndex}` ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Tabs defaultValue="request" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="request">Request</TabsTrigger>
                                <TabsTrigger value="response">Response</TabsTrigger>
                              </TabsList>
                              <TabsContent value="request" className="mt-4">
                                <div className="bg-background rounded-lg p-4">
                                  <pre className="font-mono text-sm">
                                    {JSON.stringify(endpoint.request, null, 2)}
                                  </pre>
                                </div>
                              </TabsContent>
                              <TabsContent value="response" className="mt-4">
                                <div className="bg-background rounded-lg p-4">
                                  <pre className="font-mono text-sm">
                                    {typeof endpoint.response === 'string' 
                                      ? endpoint.response 
                                      : JSON.stringify(endpoint.response, null, 2)}
                                  </pre>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-12 text-center">
            <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Ready to Build with Bliss AI?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get your API key and start integrating Growth Halo's advanced AI 
              intelligence into your applications today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline">
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Circle className="w-6 h-6 text-primary" />
              <span className="font-semibold">Growth Halo</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/faq">FAQ</Link>
              <Link href="/pricing">Pricing</Link>
              <a href="https://docs.growthhalo.com" target="_blank" rel="noopener noreferrer">Docs</a>
              <a href="https://github.com/growthhalo" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
