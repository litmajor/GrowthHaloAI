
import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, ArrowRight, ArrowLeft, CheckCircle, Trophy, Play, Calendar, Users, Brain, Compass } from 'lucide-react';
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

interface TutorialStep {
  title: string;
  content: string;
  element?: string; // CSS selector to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    type: 'click' | 'input' | 'navigate';
    target: string;
    validation?: () => boolean;
  };
  video?: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'feature' | 'advanced';
  steps: TutorialStep[];
  estimatedTime: number; // minutes
  prerequisites?: string[];
  icon?: React.ReactNode;
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
  availableTutorials: Tutorial[];
  spotlightElement: string | null;
}

const HintsContext = createContext<HintsContextType | undefined>(undefined);

const hints: Hint[] = [
  {
    id: 'welcome-hint',
    title: 'Welcome to Growth Halo',
    content: 'Start your journey by chatting with Bliss or taking a daily check-in.',
    page: 'dashboard',
    position: 'center',
    priority: 'high',
    category: 'tutorial',
  },
];

const tutorials: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Growth Halo',
    description: 'Learn the basics of navigating your personal development journey',
    category: 'getting-started',
    estimatedTime: 5,
    icon: <Play className="w-5 h-5" />,
    steps: [
      {
        title: 'Welcome to Growth Halo',
        content: 'Growth Halo is based on the philosophy that growth happens in cycles - not straight lines. You\'ll experience expansion, contraction, and renewal phases.',
      },
      {
        title: 'Meet Bliss, Your AI Companion',
        content: 'Bliss learns your patterns and provides personalized guidance. Start with the chat templates to begin meaningful conversations.',
        element: '[data-tutorial="chat-templates"]',
        position: 'bottom',
      },
      {
        title: 'Track Your Growth Phase',
        content: 'The halo ring shows your current phase. Each phase has different needs and opportunities for growth.',
        element: '[data-tutorial="halo-ring"]',
        position: 'left',
      },
      {
        title: 'Navigation Basics',
        content: 'Use the sidebar to access your dashboard, journal, analytics, and more. Everything is designed to support your growth journey.',
        element: 'nav',
        position: 'right',
      },
    ],
  },
  {
    id: 'values-discovery',
    title: 'Values Discovery',
    description: 'Understand what matters most to you and use it as your north star',
    category: 'getting-started',
    estimatedTime: 8,
    icon: <Compass className="w-5 h-5" />,
    steps: [
      {
        title: 'Why Values Matter',
        content: 'Your core values act as a compass for decisions. When you\'re aligned with your values, you experience more fulfillment and less internal conflict.',
      },
      {
        title: 'Compass Assessment',
        content: 'Take the Values Compass assessment to identify your top values. This helps Bliss provide more personalized guidance.',
        element: '[data-tutorial="values-compass"]',
        position: 'top',
        action: {
          type: 'navigate',
          target: '/values',
        },
      },
      {
        title: 'Using Values for Decisions',
        content: 'When facing a choice, ask: "Which option aligns better with my values?" Bliss can help you explore this question.',
      },
      {
        title: 'Values Evolution Over Time',
        content: 'Your values may shift as you grow. Revisit your compass quarterly to see how you\'ve evolved.',
      },
    ],
  },
  {
    id: 'daily-practice',
    title: 'Daily Practice',
    description: 'Build consistent habits for sustainable growth',
    category: 'getting-started',
    estimatedTime: 6,
    icon: <Calendar className="w-5 h-5" />,
    steps: [
      {
        title: 'Daily Check-ins',
        content: 'Start each day with a quick check-in. Track your energy levels across mental, physical, emotional, and spiritual dimensions.',
        element: '[data-tutorial="daily-checkin"]',
        position: 'top',
      },
      {
        title: 'Energy Tracking',
        content: 'Understanding your energy patterns helps you optimize your day. Notice when you have the most creative energy or need rest.',
      },
      {
        title: 'Journaling Effectively',
        content: 'Write freely without judgment. Bliss can help you reflect on your entries and spot patterns over time.',
        element: '[data-tutorial="journal"]',
        position: 'bottom',
      },
      {
        title: 'Building Consistency',
        content: 'Small daily actions compound over time. Your streak tracker celebrates your commitment to growth.',
        element: '[data-tutorial="streak"]',
        position: 'left',
      },
    ],
  },
  {
    id: 'advanced-features',
    title: 'Advanced Features',
    description: 'Unlock deeper insights with AI-powered pattern recognition',
    category: 'advanced',
    estimatedTime: 12,
    prerequisites: ['getting-started'],
    icon: <Brain className="w-5 h-5" />,
    steps: [
      {
        title: 'Pattern Recognition',
        content: 'Bliss analyzes your conversations to identify recurring themes and behavioral patterns you might not notice on your own.',
        element: '[data-tutorial="patterns"]',
        position: 'top',
      },
      {
        title: 'Contradiction Detection',
        content: 'When your stated goals conflict with your actions, Bliss gently points this out - helping you grow through awareness.',
      },
      {
        title: 'Hypothesis Formation',
        content: 'Based on your patterns, Bliss forms hypotheses about what helps you thrive and tests them over time.',
      },
      {
        title: 'Wisdom Library',
        content: 'Your most valuable insights are saved here. Bliss resurfaces them at the perfect moment when you need them most.',
        element: '[data-tutorial="wisdom"]',
        position: 'bottom',
      },
    ],
  },
  {
    id: 'community-connection',
    title: 'Community Connection',
    description: 'Find your circle and grow together',
    category: 'feature',
    estimatedTime: 7,
    icon: <Users className="w-5 h-5" />,
    steps: [
      {
        title: 'Finding Your Circle',
        content: 'Connect with others who share your values and growth journey. Small circles foster deeper connections than large groups.',
        element: '[data-tutorial="circles"]',
        position: 'top',
      },
      {
        title: 'Meaningful Contribution',
        content: 'Share insights and support others. Teaching reinforces your own learning and creates positive impact.',
      },
      {
        title: 'Privacy & Boundaries',
        content: 'You control what you share. Everything is private by default. Choose your level of vulnerability mindfully.',
      },
      {
        title: 'Getting Support',
        content: 'When you\'re struggling, your circle is here. Asking for help is a sign of strength, not weakness.',
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
  const [spotlightElement, setSpotlightElement] = useState<string | null>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem('growth-halo-dismissed-hints');
    const completed = localStorage.getItem('growth-halo-completed-tutorials');
    
    if (dismissed) {
      setDismissedHints(JSON.parse(dismissed));
    }
    if (completed) {
      setCompletedTutorials(JSON.parse(completed));
    }
  }, []);

  useEffect(() => {
    if (currentTutorial && currentTutorial.steps[currentStep]?.element) {
      setSpotlightElement(currentTutorial.steps[currentStep].element!);
    } else {
      setSpotlightElement(null);
    }
  }, [currentTutorial, currentStep]);

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
      const canStart = !tutorial.prerequisites || 
        tutorial.prerequisites.every(prereq => completedTutorials.includes(prereq));
      
      if (canStart) {
        setCurrentTutorial(tutorial);
        setCurrentStep(0);
      } else {
        alert('Please complete prerequisite tutorials first.');
      }
    }
  };

  const completeTutorial = (tutorialId: string) => {
    const newCompleted = [...completedTutorials, tutorialId];
    setCompletedTutorials(newCompleted);
    localStorage.setItem('growth-halo-completed-tutorials', JSON.stringify(newCompleted));
    setCurrentTutorial(null);
    setCurrentStep(0);
    setSpotlightElement(null);
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
    availableTutorials: tutorials,
    spotlightElement,
  };

  return (
    <HintsContext.Provider value={contextValue}>
      {children}

      {/* Spotlight Overlay */}
      <AnimatePresence>
        {spotlightElement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 pointer-events-none"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(2px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {currentTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-2xl w-full"
            >
              <Card className="shadow-2xl">
                <CardContent className="p-0">
                  {/* Progress Header */}
                  <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {currentTutorial.icon}
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold">{currentTutorial.title}</h2>
                          <p className="text-sm text-muted-foreground">
                            {currentTutorial.estimatedTime} minute tutorial
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentTutorial(null);
                          setSpotlightElement(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        Step {currentStep + 1} of {currentTutorial.steps.length}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {currentTutorial.category}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-3">
                      <motion.div
                        className="bg-primary h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${((currentStep + 1) / currentTutorial.steps.length) * 100}%` 
                        }}
                        transition={{ duration: 0.3 }}
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
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-medium">
                        {currentTutorial.steps[currentStep].title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {currentTutorial.steps[currentStep].content}
                      </p>
                      {currentTutorial.steps[currentStep].video && (
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            Video tutorial available
                          </p>
                        </div>
                      )}
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
                        className="bg-gradient-to-r from-primary to-primary/80"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
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

      {/* Contextual Hints */}
      <AnimatePresence>
        {currentHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              'fixed z-50 max-w-sm',
              currentHint.position === 'top-right' && 'top-4 right-4',
              currentHint.position === 'bottom-right' && 'bottom-4 right-4',
              currentHint.position === 'center' && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              currentHint.position === 'bottom-center' && 'bottom-4 left-1/2 -translate-x-1/2'
            )}
          >
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{currentHint.title}</h4>
                    <p className="text-sm text-muted-foreground">{currentHint.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissHint(currentHint.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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
