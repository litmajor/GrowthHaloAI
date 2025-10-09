
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Sparkles, Zap, Star, Crown, ArrowRight, Circle, Heart, Brain, Users, MessageCircle, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LandingPage() {
  const [activeExample, setActiveExample] = useState('stuck');

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Bliss 2.0 AI Companion",
      description: "Advanced AI with 5 behavioral modes, dynamic personality adaptation, and deep memory consciousness that evolves with your growth journey."
    },
    {
      icon: <Circle className="w-6 h-6" />,
      title: "Growth Halo Tracking",
      description: "Visual representation of your growth phases - expansion, contraction, and renewal - with adaptive guidance."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Values Compass",
      description: "Discover and align with your core values through interactive assessments and dynamic visualization."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Circles",
      description: "Connect with like-minded individuals in curated communities for support and shared growth."
    }
  ];

  const exampleConversations = [
    {
      id: 'stuck',
      scenario: "Feeling Stuck",
      icon: <Target className="w-5 h-5" />,
      prompt: "I feel like I'm going in circles with my career. I keep saying I want change but nothing happens.",
      response: "I remember three weeks ago you mentioned wanting to transition into design work, and last month you talked about how you light up when you're creating. I'm noticing a pattern - you're clear about what excites you, but maybe there's something underneath holding you back. What do you think might be making the 'change' feel unsafe right now?"
    },
    {
      id: 'clarity',
      scenario: "Seeking Clarity",
      icon: <Lightbulb className="w-5 h-5" />,
      prompt: "I don't know what I really want anymore. Everything feels confusing.",
      response: "That feeling of confusion can actually be a sign you're in a contraction phase - a natural part of growth where old patterns break down before new clarity emerges. Looking at your journey, you've been pushing hard for the last few months. What if this confusion is your system asking for some space to process? What would feel nourishing right now?"
    },
    {
      id: 'contradiction',
      scenario: "Noticing Patterns",
      icon: <TrendingUp className="w-5 h-5" />,
      prompt: "I value authenticity above everything, so I always speak my mind.",
      response: "I've noticed something interesting - you mentioned authenticity is your core value, and I also remember you sharing how you stayed quiet in that team meeting last week to 'keep the peace.' I'm not saying there's anything wrong with that, but I'm curious... do you see a tension there? Sometimes we have competing values we haven't fully examined."
    },
    {
      id: 'growth',
      scenario: "Tracking Progress",
      icon: <Sparkles className="w-5 h-5" />,
      prompt: "Tell me about my growth this month.",
      response: "Looking at your journey this month, I'm seeing a shift from expansion into what feels like early contraction. You started setting those boundaries you talked about - remember declining that project that didn't align with your values? That's significant growth. Your emotional trajectory shows more groundedness lately, even as things feel harder. You're not avoiding the discomfort anymore, you're moving through it. That's real transformation."
    }
  ];

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Circle className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold">Growth Halo</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-4" variant="secondary">
            Powered by Bliss AI
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Discover Your Growth Halo
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The AI companion that remembers your entire journey and helps you become who you're meant to be.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#pricing">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Pricing
              </Button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for Growth
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with proven growth methodologies 
            to create a personalized experience that evolves with you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>



      {/* Bliss 2.0 Operating Modes Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-4 h-4 mr-2" />
            Bliss 2.0 Intelligence
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Five Intelligent Behavioral Modes
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Bliss dynamically adapts her approach based on what you need in the moment, 
            shifting between reflection, grounding, pattern awareness, integration, and creative flow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow" data-testid="mode-reflection">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Reflection Mode</CardTitle>
              <Badge variant="outline" className="w-fit">Default</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mirrors patterns back to you, asks deep questions, and helps you understand yourself through gentle exploration.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow" data-testid="mode-grounding">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Grounding Mode</CardTitle>
              <Badge variant="outline" className="w-fit">Support</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Activated during overwhelm. Present-focused, somatic awareness, and stabilizing language to help you feel safe.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow" data-testid="mode-pattern">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle>Pattern Awareness</CardTitle>
              <Badge variant="outline" className="w-fit">Insight</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gently surfaces recurring patterns and contradictions, connecting dots across time without judgment.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow" data-testid="mode-integration">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Integration Mode</CardTitle>
              <Badge variant="outline" className="w-fit">Breakthrough</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Celebrates insights, synthesizes understanding, and anchors breakthroughs for lasting transformation.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow" data-testid="mode-creative">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <CardTitle>Creative Flow</CardTitle>
              <Badge variant="outline" className="w-fit">Generative</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Builds on your ideas with associative thinking, playful exploration, and expansive possibility.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-primary/30" data-testid="mode-adaptive">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Dynamic Personality</CardTitle>
              <Badge variant="outline" className="w-fit bg-primary/10">Adaptive</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Bliss adjusts her warmth, directness, depth, and playfulness based on your growth phase and emotional state.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bliss in Action Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            <MessageCircle className="w-4 h-4 mr-2" />
            See Bliss in Action
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Experience Conversations That Transform
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Bliss doesn't just respond to your questions - it remembers your journey, spots patterns you might miss, 
            and gently guides you toward deeper self-awareness. Here's how real conversations with Bliss unfold:
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Tabs value={activeExample} onValueChange={setActiveExample} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
              {exampleConversations.map((example) => (
                <TabsTrigger 
                  key={example.id} 
                  value={example.id}
                  className="flex items-center gap-2"
                  data-testid={`tab-example-${example.id}`}
                >
                  {example.icon}
                  <span className="hidden sm:inline">{example.scenario}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {exampleConversations.map((example) => (
              <TabsContent key={example.id} value={example.id} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* User Message */}
                  <div className="flex justify-end mb-4" data-testid={`message-user-${example.id}`}>
                    <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-6 py-4 shadow-md">
                      <p className="text-sm md:text-base">{example.prompt}</p>
                    </div>
                  </div>

                  {/* Bliss Response */}
                  <div className="flex justify-start" data-testid={`message-bliss-${example.id}`}>
                    <div className="max-w-[85%]">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-card border rounded-2xl rounded-tl-sm px-6 py-4 shadow-md">
                          <p className="text-sm md:text-base text-foreground leading-relaxed">
                            {example.response}
                          </p>
                          <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
                            <Brain className="w-4 h-4" />
                            <span>Bliss uses memory, pattern recognition, and emotional intelligence</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Key Capabilities */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <Card className="border-primary/20" data-testid="card-capability-memory">
              <CardHeader>
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                  <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">Remembers Your Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bliss recalls past conversations, values, and goals - creating a continuous thread through your growth story.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20" data-testid="card-capability-patterns">
              <CardHeader>
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg">Spots Hidden Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gently surfaces contradictions and recurring themes that you might not see on your own.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20" data-testid="card-capability-guidance">
              <CardHeader>
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                  <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Guides With Compassion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Asks questions that invite reflection without judgment, helping you discover your own answers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Growth Path
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every journey is unique. Find the perfect tier to support your transformation 
            through expansion, contraction, and renewal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Free Tier */}
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-8">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl mb-2">Free</CardTitle>
              <div className="mb-4">
                <span className="text-3xl font-light">$0</span>
              </div>
              <CardDescription>Begin your growth journey with essential tools</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  15 messages per day
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Basic Bliss AI (Reflection mode)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Simple emotional tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  30-day memory retention
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Community access
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full" data-testid="button-signup-free">Start Free</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Growth Tier */}
          <Card className="h-full hover:shadow-lg transition-shadow ring-2 ring-primary/20 relative">
            <CardHeader className="text-center pb-8">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">Most Popular</Badge>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl mb-2">Growth</CardTitle>
              <div className="mb-4">
                <span className="text-3xl font-light">$15</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <CardDescription>Unlock your full potential with comprehensive tools</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Unlimited chat
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  <strong>Full Bliss 2.0</strong> (all 5 modes)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Dynamic personality adaptation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Full emotional trajectory tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Advanced memory (1 year retention)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Associative recall
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Goal tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  No ads
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full bg-primary hover:bg-primary/90" data-testid="button-signup-growth">Choose Growth</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Transformation Tier */}
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-8">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl mb-2">Transformation</CardTitle>
              <div className="mb-4">
                <span className="text-3xl font-light">$35</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <CardDescription>Accelerate your journey with advanced insights</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Everything in Growth
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Contradiction detection
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Causal reasoning insights
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Hypothesis formation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Unlimited memory retention
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Early access to new features
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full" variant="outline" data-testid="button-signup-transformation">Transform Now</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Facilitator Tier */}
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-8">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-xl mb-2">Facilitator</CardTitle>
              <div className="mb-4">
                <span className="text-3xl font-light">$99</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <CardDescription>Professional B2B tools for coaches & therapists</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Everything in Transformation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Multi-client dashboard
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Facilitate growth circles
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  White-label options
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  </div>
                  API access
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full" variant="outline" data-testid="button-signup-facilitator">Go Professional</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Growth Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of people who are already experiencing deeper self-awareness, 
            stronger connections, and more intentional growth.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Start Your Free Journey Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
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
              <Link href="/analytics">Analytics</Link>
              <Link href="/content">Content</Link>
              <Link href="/events">Events</Link>
              <Link href="/community">Community</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
