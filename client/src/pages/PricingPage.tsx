
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Users, Zap, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  ctaText: string;
  gradient: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'First Steps',
    price: 0,
    description: 'Begin your growth journey with essential tools',
    features: [
      'Basic halo tracking',
      'Limited Bliss interactions (5 per day)',
      'Access to one community circle',
      'Core article library',
      'Simple journaling tool'
    ],
    icon: <Sparkles className="w-6 h-6" />,
    ctaText: 'Start Free',
    gradient: 'from-gray-50 to-gray-100'
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 19,
    description: 'Unlock your full potential with comprehensive tools',
    features: [
      'Full halo tracking and insights',
      'Unlimited Bliss conversations',
      'All community circles',
      'Complete practice library',
      'Advanced journaling with AI insights',
      'Values compass tool'
    ],
    icon: <Zap className="w-6 h-6" />,
    popular: true,
    ctaText: 'Choose Growth',
    gradient: 'from-indigo-50 to-purple-50'
  },
  {
    id: 'transformation',
    name: 'Transformation',
    price: 39,
    description: 'Accelerate your journey with personalized guidance',
    features: [
      'Everything in Growth tier',
      '1-on-1 monthly sessions with certified coaches',
      'Early access to new features and content',
      'Priority community support',
      'Custom growth plan creation',
      'Advanced analytics and reporting'
    ],
    icon: <Star className="w-6 h-6" />,
    ctaText: 'Transform Now',
    gradient: 'from-purple-50 to-amber-50'
  },
  {
    id: 'facilitator',
    name: 'Facilitator',
    price: 99,
    description: 'Professional tools for coaches and therapists',
    features: [
      'Platform tools for client work',
      'Community moderation capabilities',
      'Access to facilitator training programs',
      'White-label options for practices',
      'Group management tools',
      'Professional development resources'
    ],
    icon: <Crown className="w-6 h-6" />,
    ctaText: 'Go Professional',
    gradient: 'from-amber-50 to-orange-50'
  }
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const getPrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return 0;
    return isAnnual ? Math.floor(monthlyPrice * 12 * 0.83) : monthlyPrice;
  };

  const getPriceLabel = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return 'Free';
    const price = getPrice(monthlyPrice);
    return isAnnual ? `$${price}/year` : `$${price}/month`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-light mb-6 text-gray-800">
            Choose Your Growth Path
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto mb-8">
            Every journey is unique. Find the perfect tier to support your transformation 
            through expansion, contraction, and renewal.
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={cn("text-sm", !isAnnual ? "text-gray-900 font-medium" : "text-gray-500")}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={cn(
                "relative w-14 h-8 rounded-full transition-colors duration-300",
                isAnnual ? "bg-indigo-600" : "bg-gray-300"
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300",
                  isAnnual ? "translate-x-7" : "translate-x-1"
                )}
              />
            </button>
            <span className={cn("text-sm", isAnnual ? "text-gray-900 font-medium" : "text-gray-500")}>
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Save 17%
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="relative"
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-indigo-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={cn(
                "relative h-full transition-all duration-300 hover:shadow-2xl",
                tier.popular ? "ring-2 ring-indigo-200 shadow-xl" : "hover:shadow-lg"
              )}>
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 rounded-lg", tier.gradient)} />
                
                <CardHeader className="relative z-10 text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      tier.popular ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-600"
                    )}>
                      {tier.icon}
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-medium mb-2">
                    {tier.name}
                  </CardTitle>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-light">
                      {tier.price === 0 ? 'Free' : `$${getPrice(tier.price)}`}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-gray-500 text-sm ml-1">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  
                  <CardDescription className="text-gray-600">
                    {tier.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10">
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={cn(
                      "w-full py-3 transition-all duration-300",
                      tier.popular
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {tier.ctaText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-24"
        >
          <h2 className="text-3xl font-light text-center mb-12 text-gray-800">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Can I change tiers anytime?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">What makes the coaching sessions special?</h3>
                <p className="text-gray-600 text-sm">
                  Our coaches are certified in Growth Halo methodology, understanding the cyclical nature of growth.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Is there a free trial?</h3>
                <p className="text-gray-600 text-sm">
                  Our First Steps tier is completely free forever. You can also try paid tiers for 7 days.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Who is the Facilitator tier for?</h3>
                <p className="text-gray-600 text-sm">
                  Coaches, therapists, and wellness professionals who want to use our platform with their clients.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-24 text-center"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-light mb-4">
              Ready to Begin Your Growth Journey?
            </h2>
            <p className="text-xl font-light mb-8 text-indigo-100">
              Join thousands who are transforming through the power of cyclical growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button className="px-8 py-4 bg-white text-indigo-600 hover:bg-gray-100 font-medium">
                  Start Your Free Journey
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="px-8 py-4 border-white text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
