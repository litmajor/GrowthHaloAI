
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  X, 
  Search, 
  BookOpen, 
  Video, 
  MessageSquare, 
  Users,
  Lightbulb,
  ChevronRight,
  Play,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface QuickTip {
  id: string;
  title: string;
  description: string;
  page: string;
  category: 'getting-started' | 'feature' | 'best-practice';
}

interface VideoTutorial {
  id: string;
  title: string;
  duration: string;
  thumbnail?: string;
  url: string;
  related: string[];
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  relatedPages: string[];
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  steps: number;
  readTime: string;
  url: string;
}

const quickTips: Record<string, QuickTip[]> = {
  dashboard: [
    {
      id: 'dashboard-halo',
      title: 'Understanding Your Halo Ring',
      description: 'The halo ring shows your current growth phase. Each color represents expansion, contraction, or renewal.',
      page: 'dashboard',
      category: 'getting-started'
    },
    {
      id: 'dashboard-insights',
      title: 'Weekly Insights',
      description: 'Bliss analyzes your patterns and surfaces key insights. Check them weekly for personalized guidance.',
      page: 'dashboard',
      category: 'best-practice'
    }
  ],
  chat: [
    {
      id: 'chat-templates',
      title: 'Use Chat Templates',
      description: 'Start with conversation templates to get the most from Bliss. They guide deeper reflection.',
      page: 'chat',
      category: 'getting-started'
    },
    {
      id: 'chat-memory',
      title: 'Bliss Remembers',
      description: 'Bliss recalls past conversations to provide context-aware guidance. The more you chat, the better it gets.',
      page: 'chat',
      category: 'feature'
    }
  ],
  goals: [
    {
      id: 'goals-auto-detect',
      title: 'Automatic Goal Detection',
      description: 'Mention goals in conversation and Bliss automatically tracks them for you.',
      page: 'goals',
      category: 'feature'
    }
  ],
  journal: [
    {
      id: 'journal-prompts',
      title: 'Daily Prompts',
      description: 'Use Bliss-generated prompts to deepen your reflection practice.',
      page: 'journal',
      category: 'best-practice'
    }
  ]
};

const videoTutorials: VideoTutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Growth Halo',
    duration: '3:00',
    url: '#',
    related: ['dashboard', 'chat', 'values']
  },
  {
    id: 'chat-basics',
    title: 'Chatting with Bliss',
    duration: '2:30',
    url: '#',
    related: ['chat']
  },
  {
    id: 'values-compass',
    title: 'Using the Values Compass',
    duration: '4:00',
    url: '#',
    related: ['values', 'compass']
  },
  {
    id: 'goal-tracking',
    title: 'Goal Intelligence System',
    duration: '3:30',
    url: '#',
    related: ['goals', 'dashboard']
  }
];

const guides: GuideItem[] = [
  {
    id: 'first-week',
    title: 'Your First Week with Growth Halo',
    description: 'A step-by-step guide to getting the most from your first seven days.',
    steps: 7,
    readTime: '10 min',
    url: '#'
  },
  {
    id: 'phase-understanding',
    title: 'Understanding Growth Phases',
    description: 'Learn about expansion, contraction, and renewal phases and how to work with them.',
    steps: 5,
    readTime: '8 min',
    url: '#'
  },
  {
    id: 'bliss-advanced',
    title: 'Advanced Bliss Features',
    description: 'Unlock the full potential of your AI companion with these advanced techniques.',
    steps: 10,
    readTime: '15 min',
    url: '#'
  }
];

const faqItems: FAQItem[] = [
  {
    id: 'what-is-growth-halo',
    question: 'What is Growth Halo?',
    answer: 'Growth Halo is an AI-powered personal development platform based on the philosophy that growth happens in cycles - expansion, contraction, and renewal.',
    category: 'general',
    relatedPages: ['dashboard', 'landing']
  },
  {
    id: 'how-bliss-works',
    question: 'How does Bliss understand me?',
    answer: 'Bliss analyzes your conversations, mood patterns, and goals to build a personalized understanding. The more you interact, the better it becomes at providing tailored guidance.',
    category: 'features',
    relatedPages: ['chat', 'analytics']
  },
  {
    id: 'privacy-concerns',
    question: 'Is my data private?',
    answer: 'Yes! Your conversations and personal data are encrypted and never shared. We follow GDPR and CCPA guidelines.',
    category: 'privacy',
    relatedPages: ['settings']
  }
];

export function ContextualHelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSearchResults, setAiSearchResults] = useState<string[]>([]);

  useEffect(() => {
    // Detect current page from URL or context
    const path = window.location.pathname.split('/')[1] || 'dashboard';
    setCurrentPage(path);
  }, []);

  const handleAiSearch = async (query: string) => {
    if (!query.trim()) {
      setAiSearchResults([]);
      return;
    }

    // Simulate AI-powered search (in production, this would call an API)
    const results = [
      `Bliss says: "${query}" relates to your growth journey...`,
      'Here are some personalized suggestions based on your patterns...',
      'Similar questions other users have asked...'
    ];
    setAiSearchResults(results);
  };

  const relevantTips = quickTips[currentPage] || [];
  const relevantVideos = videoTutorials.filter(v => 
    v.related.includes(currentPage)
  );
  const relevantFaqs = faqItems.filter(f => 
    f.relatedPages.includes(currentPage)
  );

  return (
    <>
      {/* Floating Help Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => setIsOpen(true)}
          aria-label="Open help"
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Help Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Help Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-background border-l shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Help Center</h2>
                      <p className="text-sm text-muted-foreground">
                        Get help and learn about Growth Halo
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* AI-Powered Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Ask anything about Growth Halo..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleAiSearch(e.target.value);
                    }}
                  />
                </div>

                {/* AI Search Results */}
                {aiSearchResults.length > 0 && (
                  <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">AI Suggestions</span>
                    </div>
                    {aiSearchResults.map((result, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground mt-1">
                        {result}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Tabs */}
              <ScrollArea className="flex-1">
                <Tabs defaultValue="quick-tips" className="p-6">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="quick-tips" className="text-xs">
                      <Lightbulb className="w-4 h-4 mr-1" />
                      Tips
                    </TabsTrigger>
                    <TabsTrigger value="videos" className="text-xs">
                      <Video className="w-4 h-4 mr-1" />
                      Videos
                    </TabsTrigger>
                    <TabsTrigger value="guides" className="text-xs">
                      <BookOpen className="w-4 h-4 mr-1" />
                      Guides
                    </TabsTrigger>
                    <TabsTrigger value="faq" className="text-xs">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      FAQ
                    </TabsTrigger>
                  </TabsList>

                  {/* Quick Tips */}
                  <TabsContent value="quick-tips" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Tips for this page</h3>
                      <Badge variant="secondary" className="text-xs">
                        {currentPage}
                      </Badge>
                    </div>

                    {relevantTips.length > 0 ? (
                      relevantTips.map((tip) => (
                        <Card key={tip.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Lightbulb className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{tip.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {tip.description}
                                </p>
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {tip.category.replace('-', ' ')}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No tips available for this page yet.
                      </p>
                    )}
                  </TabsContent>

                  {/* Video Tutorials */}
                  <TabsContent value="videos" className="space-y-4">
                    <h3 className="font-medium mb-4">Video Tutorials</h3>

                    {relevantVideos.map((video) => (
                      <Card key={video.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                              <Play className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{video.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Video className="w-3 h-3" />
                                {video.duration}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">All Tutorials</h4>
                      {videoTutorials.map((video) => (
                        <Button
                          key={video.id}
                          variant="ghost"
                          className="w-full justify-start text-sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {video.title}
                          <span className="ml-auto text-xs text-muted-foreground">
                            {video.duration}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Written Guides */}
                  <TabsContent value="guides" className="space-y-4">
                    <h3 className="font-medium mb-4">Step-by-Step Guides</h3>

                    {guides.map((guide) => (
                      <Card key={guide.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{guide.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {guide.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{guide.steps} steps</span>
                                <span>•</span>
                                <span>{guide.readTime}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  {/* FAQ */}
                  <TabsContent value="faq" className="space-y-4">
                    <h3 className="font-medium mb-4">Frequently Asked Questions</h3>

                    {relevantFaqs.length > 0 && (
                      <>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                          Related to this page
                        </h4>
                        {relevantFaqs.map((faq) => (
                          <Card key={faq.id}>
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2">{faq.question}</h4>
                              <p className="text-sm text-muted-foreground">
                                {faq.answer}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                        <Separator className="my-4" />
                      </>
                    )}

                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      All Questions
                    </h4>
                    {faqItems.map((faq) => (
                      <Card key={faq.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{faq.question}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {faq.answer}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </ScrollArea>

              {/* Footer Actions */}
              <div className="p-4 border-t bg-muted/30">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="flex-1">
                    <Users className="w-4 h-4 mr-2" />
                    Community Q&A
                  </Button>
                  <Button className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Live Chat Support
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
