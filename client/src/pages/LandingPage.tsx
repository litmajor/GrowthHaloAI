
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Sparkles, Zap, Star, Crown, ArrowRight, Circle, Heart, Brain, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Bliss AI Companion",
      description: "Your personal growth companion that learns, adapts, and provides insights tailored to your unique journey."
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
            AI-Powered Personal Growth Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Discover Your Growth Halo
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Navigate life's cycles of expansion, contraction, and renewal with AI-powered insights, 
            community support, and personalized guidance tailored to your unique journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Pricing
              </Button>
            </Link>
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

      

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
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
              <CardTitle className="text-xl mb-2">First Steps</CardTitle>
              <div className="mb-4">
                <span className="text-3xl font-light">Free</span>
              </div>
              <CardDescription>Begin your growth journey with essential tools</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  Basic halo tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  Limited Bliss interactions (5 per day)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  Access to one community circle
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full">Start Free</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Growth Tier */}
          <Card className="h-full hover:shadow-lg transition-shadow ring-2 ring-primary/20">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
            <CardHeader className="text-center pb-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl mb-2">Growth</CardTitle>
              <div className="mb-4">
                <span className="text-3xl font-light">$19</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <CardDescription>Unlock your full potential with comprehensive tools</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  Full halo tracking and insights
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  Unlimited Bliss conversations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  All community circles
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  Advanced journaling with AI insights
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full bg-primary hover:bg-primary/90">Choose Growth</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Transformation Tier */}
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-8">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl mb-2">Transformation</CardTitle>
              <div className="mb-4">
                <span className="text-3xl font-light">$39</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <CardDescription>Accelerate your journey with personalized guidance</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  Everything in Growth tier
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  1-on-1 monthly coaching sessions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  Early access to new features
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  Priority community support
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full" variant="outline">Transform Now</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Facilitator Tier */}
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-8">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl mb-2">Facilitator</CardTitle>
              <div className="mb-4">
                <span className="text-3xl font-light">$99</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <CardDescription>Professional tools for coaches and therapists</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  Platform tools for client work
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  Community moderation capabilities
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  Access to facilitator training
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  White-label options
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full" variant="outline">Go Professional</Button>
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
