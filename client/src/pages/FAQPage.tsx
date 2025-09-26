import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, MessageCircle, Sparkles, Users, Target, Heart, Shield, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'pricing' | 'features' | 'support' | 'privacy';
}

const faqData: FAQItem[] = [
  // General Questions
  {
    question: "What is Growth Halo and how does it work?",
    answer: "Growth Halo is an AI-powered personal development platform based on the philosophy that growth happens in cycles - expansion, contraction, and renewal. Our AI companion, Bliss, learns your patterns and provides personalized guidance through each phase of your journey.",
    category: "general"
  },
  {
    question: "What makes Growth Halo different from other personal development apps?",
    answer: "Unlike linear growth models, Growth Halo recognizes that authentic development is cyclical. We don't see setbacks as failures - they're natural contraction phases that lead to deeper integration and eventual renewal. Our AI adapts to your unique patterns rather than forcing you into a one-size-fits-all approach.",
    category: "general"
  },
  {
    question: "Do I need any prior experience with personal development to use this platform?",
    answer: "Not at all! Growth Halo is designed for everyone, from complete beginners to experienced practitioners. Bliss adapts to your current level and guides you at a pace that feels right for you.",
    category: "general"
  },

  // Features
  {
    question: "How does the AI companion Bliss understand my growth patterns?",
    answer: "Bliss analyzes your interactions, mood patterns, goals progress, and journal entries to understand your unique growth cycles. The more you engage with the platform, the better Bliss becomes at providing personalized insights and guidance.",
    category: "features"
  },
  {
    question: "What is the Values Compass and how does it work?",
    answer: "The Values Compass is an interactive tool that helps you identify, prioritize, and align with your core values. It evolves as you do, showing how your values shift through different life phases and helping you make decisions that honor your authentic self.",
    category: "features"
  },
  {
    question: "Can I use Growth Halo offline?",
    answer: "Some features like journaling and viewing your growth history work offline. However, AI conversations with Bliss, community features, and real-time insights require an internet connection.",
    category: "features"
  },
  {
    question: "How do Community Circles work?",
    answer: "Community Circles are small, curated groups (8-12 people) focused on specific themes or growth phases. They provide a supportive space for sharing experiences, insights, and encouragement. All circles are moderated by trained facilitators.",
    category: "features"
  },

  // Pricing
  {
    question: "Is there really a free tier forever?",
    answer: "Yes! Our First Steps tier includes basic growth tracking, limited daily conversations with Bliss, and access to one community circle. It's completely free with no hidden costs or time limits.",
    category: "pricing"
  },
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer: "Absolutely. You can change your subscription tier at any time. Upgrades take effect immediately, while downgrades take effect at the start of your next billing cycle. No cancellation fees or penalties.",
    category: "pricing"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay. All transactions are processed securely through Stripe.",
    category: "pricing"
  },
  {
    question: "Is there a student discount available?",
    answer: "Yes! Students can get 50% off any paid plan. Just verify your student status through our partner service. The discount applies as long as you maintain your student status.",
    category: "pricing"
  },

  // Support
  {
    question: "How do I get help if I'm struggling with the platform?",
    answer: "We offer multiple support channels: in-app help chat, email support, and video tutorials. Paid tier users also get priority support and can book one-on-one guidance sessions.",
    category: "support"
  },
  {
    question: "What if I'm going through a mental health crisis?",
    answer: "Growth Halo is designed for personal development, not crisis intervention. If you're experiencing a mental health emergency, please contact emergency services or a crisis hotline. We provide resources and can help connect you with professional mental health support when appropriate.",
    category: "support"
  },
  {
    question: "Can I export my data if I want to leave?",
    answer: "Yes, you can export all your personal data including journal entries, growth tracking data, and conversation history. We believe your growth journey belongs to you, regardless of which platform you use.",
    category: "support"
  },

  // Privacy & Security
  {
    question: "How is my personal data protected?",
    answer: "We use enterprise-grade encryption, never sell personal data, and follow GDPR and CCPA guidelines. Your conversations with Bliss are private and used only to improve your personal experience, never for advertising or shared with third parties.",
    category: "privacy"
  },
  {
    question: "Can other users see my journal entries or AI conversations?",
    answer: "Never. Your private journals and conversations with Bliss are completely confidential. Only you can see this content. Community features only show what you choose to share explicitly.",
    category: "privacy"
  },
  {
    question: "Do you use my data to train AI models for other companies?",
    answer: "No. Your personal data stays within Growth Halo's ecosystem. While we use aggregated, anonymized patterns to improve Bliss's general capabilities, your individual data is never shared or used to train external AI systems.",
    category: "privacy"
  }
];

const categories = {
  general: { icon: HelpCircle, label: 'General', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' },
  features: { icon: Sparkles, label: 'Features', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200' },
  pricing: { icon: CreditCard, label: 'Pricing', color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' },
  support: { icon: Heart, label: 'Support', color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-200' },
  privacy: { icon: Shield, label: 'Privacy', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200' },
};

export default function FAQPage() {
  const [openItems, setOpenItems] = React.useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string | 'all'>('all');

  const toggleItem = (question: string) => {
    setOpenItems(prev => 
      prev.includes(question) 
        ? prev.filter(item => item !== question)
        : [...prev, question]
    );
  };

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const categoryCount = (category: string) => 
    faqData.filter(faq => faq.category === category).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-light mb-6 text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Growth Halo, your AI-powered companion for cyclical personal development.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-3 justify-center mb-12"
        >
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="text-sm"
            data-testid="filter-all"
          >
            All Questions ({faqData.length})
          </Button>
          {Object.entries(categories).map(([key, category]) => {
            const Icon = category.icon;
            const count = categoryCount(key);
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(key)}
                className="text-sm"
                data-testid={`filter-${key}`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.label} ({count})
              </Button>
            );
          })}
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4"
        >
          {filteredFAQs.map((faq, index) => {
            const category = categories[faq.category];
            const Icon = category.icon;
            const isOpen = openItems.includes(faq.question);

            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <Collapsible>
                    <CollapsibleTrigger
                      onClick={() => toggleItem(faq.question)}
                      className="w-full"
                      data-testid={`faq-${index}`}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start gap-4 flex-1 text-left">
                          <Badge className={cn("text-xs", category.color)}>
                            <Icon className="w-3 h-3 mr-1" />
                            {category.label}
                          </Badge>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-medium leading-relaxed pr-4">
                              {faq.question}
                            </CardTitle>
                          </div>
                          <motion.div
                            animate={{ rotate: isOpen ? 45 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-muted-foreground mt-1"
                          >
                            <HelpCircle className="w-5 h-5" />
                          </motion.div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-muted-foreground leading-relaxed"
                        >
                          {faq.answer}
                        </motion.div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Card className="bg-muted/30">
            <CardContent className="p-8">
              <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-medium mb-4 text-foreground">
                Still have questions?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                We're here to help! Reach out to our support team, and we'll get back to you within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" data-testid="contact-support">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" size="lg" data-testid="join-community">
                  <Users className="w-4 h-4 mr-2" />
                  Join Community
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}