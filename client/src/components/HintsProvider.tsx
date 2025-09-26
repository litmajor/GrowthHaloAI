import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Hint {
  id: string;
  title: string;
  content: string;
  page: string;
  position: 'top-right' | 'bottom-right' | 'center' | 'bottom-center';
  priority: 'low' | 'medium' | 'high';
  category: 'navigation' | 'feature' | 'tip' | 'tutorial';
  triggerElement?: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  category: 'getting-started' | 'advanced' | 'ai-interaction' | 'growth-tracking';
}

interface TutorialStep {
  title: string;
  content: string;
  element?: string;
  action?: string;
}

interface HintsContextType {
  showHint: (hintId: string) => void;
  hideHint: () => void;
  dismissHint: (hintId: string) => void;
  startTutorial: (tutorialId: string) => void;
  completeTutorial: (tutorialId: string) => void;
  currentHint: Hint | null;
  currentTutorial: Tutorial | null;
  currentStep: number;
  dismissedHints: string[];
  completedTutorials: string[];
}

const HintsContext = createContext<HintsContextType | undefined>(undefined);

const hints: Hint[] = [
  {
    id: 'welcome-chat',
    title: 'Start Your Growth Journey',
    content: 'Click on any chat template to begin a meaningful conversation with Bliss, your AI companion.',
    page: '/chat',
    position: 'center',
    priority: 'high',
    category: 'tutorial',
  },
  {
    id: 'sidebar-navigation',
    title: 'Easy Navigation',
    content: 'Use the sidebar to quickly navigate between different sections of your growth journey. Click the arrow to collapse it.',
    page: '/dashboard',
    position: 'top-right',
    priority: 'medium',
    category: 'navigation',
  },
  {
    id: 'growth-halo',
    title: 'Your Growth Phase',
    content: 'The halo ring shows your current growth phase. Expansion (outward growth), Contraction (integration), or Renewal (transformation).',
    page: '/dashboard',
    position: 'top-right',
    priority: 'high',
    category: 'feature',
  },
  {
    id: 'values-compass',
    title: 'Discover Your Values',
    content: 'The Values Compass helps you identify and align with your core values. This is fundamental to authentic growth.',
    page: '/compass',
    position: 'center',
    priority: 'high',
    category: 'feature',
  },
  {
    id: 'daily-checkin',
    title: 'Daily Reflection',
    content: 'Regular check-ins help track your emotional and spiritual state, creating patterns for deeper insights.',
    page: '/checkin',
    position: 'bottom-center',
    priority: 'medium',
    category: 'feature',
  },
];

const tutorials: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Growth Halo',
    description: 'Learn the basics of navigating your personal development journey',
    category: 'getting-started',
    steps: [
      {
        title: 'Welcome to Growth Halo',
        content: 'Growth Halo is based on the philosophy that growth happens in cycles - not straight lines. You\'ll experience expansion, contraction, and renewal phases.',
      },
      {
        title: 'Meet Bliss, Your AI Companion',
        content: 'Bliss learns your patterns and provides personalized guidance. Start with the chat templates to begin meaningful conversations.',
        element: 'chat-templates',
      },
      {
        title: 'Track Your Growth Phase',
        content: 'The halo ring shows your current phase. Each phase has different needs and opportunities for growth.',
        element: 'halo-ring',
      },
      {
        title: 'Explore Your Values',
        content: 'Use the Values Compass to understand what matters most to you. This becomes your north star for decision-making.',
        element: 'values-compass',
      },
    ],
  },
  {
    id: 'ai-interaction',
    title: 'Maximizing AI Conversations',
    description: 'Learn how to have more meaningful and productive conversations with Bliss',
    category: 'ai-interaction',
    steps: [
      {
        title: 'Be Authentic and Specific',
        content: 'Bliss responds best to honest, specific sharing. Instead of "I feel bad," try "I feel stuck in my career and unsure about my next move."',
      },
      {
        title: 'Use the Growth Phases',
        content: 'Mention what phase you think you\'re in. "I feel like I\'m in a contraction phase, needing to process recent changes."',
      },
      {
        title: 'Ask for Different Types of Help',
        content: 'You can ask for reflection questions, practical next steps, values clarification, or pattern recognition in your journey.',
      },
      {
        title: 'Build on Previous Conversations',
        content: 'Bliss remembers your conversation history. Reference previous insights or continue developing themes from past chats.',
      },
    ],
  },
];

export function HintsProvider({ children }: { children: React.ReactNode }) {
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissedHints, setDismissedHints] = useState<string[]>([]);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);

  useEffect(() => {
    // Load dismissed hints and completed tutorials from localStorage
    const dismissed = localStorage.getItem('growth-halo-dismissed-hints');
    const completed = localStorage.getItem('growth-halo-completed-tutorials');
    
    if (dismissed) {
      setDismissedHints(JSON.parse(dismissed));
    }
    if (completed) {
      setCompletedTutorials(JSON.parse(completed));
    }
  }, []);

  const showHint = (hintId: string) => {
    if (dismissedHints.includes(hintId)) return;
    
    const hint = hints.find(h => h.id === hintId);
    if (hint) {
      setCurrentHint(hint);
    }
  };

  const hideHint = () => {
    setCurrentHint(null);
  };

  const dismissHint = (hintId: string) => {
    const newDismissed = [...dismissedHints, hintId];
    setDismissedHints(newDismissed);
    localStorage.setItem('growth-halo-dismissed-hints', JSON.stringify(newDismissed));
    setCurrentHint(null);
  };

  const startTutorial = (tutorialId: string) => {
    const tutorial = tutorials.find(t => t.id === tutorialId);
    if (tutorial) {
      setCurrentTutorial(tutorial);
      setCurrentStep(0);
    }
  };

  const completeTutorial = (tutorialId: string) => {
    const newCompleted = [...completedTutorials, tutorialId];
    setCompletedTutorials(newCompleted);
    localStorage.setItem('growth-halo-completed-tutorials', JSON.stringify(newCompleted));
    setCurrentTutorial(null);
    setCurrentStep(0);
  };

  const contextValue: HintsContextType = {
    showHint,
    hideHint,
    dismissHint,
    startTutorial,
    completeTutorial,
    currentHint,
    currentTutorial,
    currentStep,
    dismissedHints,
    completedTutorials,
  };

  return (
    <HintsContext.Provider value={contextValue}>
      {children}
      
      {/* Hint Overlay */}
      <AnimatePresence>
        {currentHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(2px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "relative max-w-md w-full",
                currentHint.position === 'center' && "mx-auto",
                currentHint.position === 'top-right' && "ml-auto mr-4 mt-4",
                currentHint.position === 'bottom-right' && "ml-auto mr-4 mb-4 mt-auto",
                currentHint.position === 'bottom-center' && "mx-auto mb-4 mt-auto"
              )}
            >
              <Card className="border-primary/20 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      <Badge variant="outline" className="text-xs">
                        {currentHint.category}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissHint(currentHint.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <h3 className="font-medium mb-2 text-foreground">
                    {currentHint.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {currentHint.content}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => dismissHint(currentHint.id)}
                      className="flex-1"
                    >
                      Got it!
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={hideHint}
                    >
                      Later
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {currentTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <Card>
                <CardContent className="p-0">
                  {/* Progress Header */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-medium">{currentTutorial.title}</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentTutorial(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">
                        Step {currentStep + 1} of {currentTutorial.steps.length}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {currentTutorial.category}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / currentTutorial.steps.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="p-6 min-h-[200px]">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-lg font-medium mb-4">
                        {currentTutorial.steps[currentStep].title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {currentTutorial.steps[currentStep].content}
                      </p>
                    </motion.div>
                  </div>

                  {/* Navigation Footer */}
                  <div className="p-6 border-t border-border flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>

                    {currentStep === currentTutorial.steps.length - 1 ? (
                      <Button
                        onClick={() => completeTutorial(currentTutorial.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Tutorial
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setCurrentStep(currentStep + 1)}
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </HintsContext.Provider>
  );
}

export function useHints() {
  const context = useContext(HintsContext);
  if (context === undefined) {
    throw new Error('useHints must be used within a HintsProvider');
  }
  return context;
}

// Hook for page-specific hints
export function usePageHints(pagePath: string) {
  const { showHint, dismissedHints } = useHints();
  
  useEffect(() => {
    // Show hints for this page after a short delay
    const timer = setTimeout(() => {
      const pageHints = hints.filter(h => h.page === pagePath && !dismissedHints.includes(h.id));
      const highPriorityHint = pageHints.find(h => h.priority === 'high');
      
      if (highPriorityHint) {
        showHint(highPriorityHint.id);
      } else if (pageHints.length > 0) {
        showHint(pageHints[0].id);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [pagePath, showHint, dismissedHints]);
}