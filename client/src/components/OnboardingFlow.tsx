
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Circle, Sparkles, Heart, Brain, CheckCircle, X, Calendar, MessageSquare, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import HaloProgressRing from './HaloProgressRing';
import { cn } from '@/lib/utils';

interface OnboardingFlowProps {
  onComplete: () => void;
  canRevisit?: boolean;
}

export default function OnboardingFlow({ onComplete, canRevisit = false }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(() => {
    // Load saved progress if interrupted
    const savedStep = localStorage.getItem('onboardingProgress');
    return savedStep ? parseInt(savedStep, 10) : 0;
  });
  const [selectedValues, setSelectedValues] = useState<string[]>(() => {
    const savedValues = localStorage.getItem('onboardingValues');
    return savedValues ? JSON.parse(savedValues) : [];
  });

  // Save progress whenever step changes
  useEffect(() => {
    localStorage.setItem('onboardingProgress', currentStep.toString());
  }, [currentStep]);

  // Save selected values whenever they change
  useEffect(() => {
    localStorage.setItem('onboardingValues', JSON.stringify(selectedValues));
  }, [selectedValues]);

  const steps = [
    {
      title: "Welcome to Your Growth Journey",
      description: "Growth Halo works differently—we believe growth is cyclical, not linear.",
      duration: "30 seconds",
      content: (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <HaloProgressRing phase="expansion" progress={75} size="lg" showLabel={true} />
          </motion.div>
          <div className="space-y-3">
            <p className="text-muted-foreground max-w-md mx-auto">
              Like breathing, growth moves through <strong className="text-expansion">expansion</strong>, <strong className="text-contraction">contraction</strong>, and <strong className="text-renewal">renewal</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              We'll help you navigate all three phases with wisdom and compassion.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Meet Bliss, Your AI Companion",
      description: "Bliss asks questions that help you see patterns you might miss on your own.",
      duration: "2 minutes",
      content: (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <div className="flex items-start gap-3">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div className="flex-1">
                  <CardTitle className="text-base">How Bliss Helps You Grow</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <motion.div 
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm">Remembers your entire journey and connects insights over time</p>
              </motion.div>
              <motion.div 
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm">Spots patterns and contradictions you might not see alone</p>
              </motion.div>
              <motion.div 
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm">Asks questions that invite reflection, not judgment</p>
              </motion.div>
            </CardContent>
          </Card>
          <div className="bg-muted/50 rounded-lg p-4 border">
            <p className="text-sm text-muted-foreground italic">
              <span className="font-semibold text-foreground">"I remember three weeks ago you mentioned wanting to be more creative..."</span> - Bliss
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Discover Your Core Values",
      description: "What matters most to you? Choose 3 values to guide your journey.",
      duration: "2 minutes",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['Authenticity', 'Creative Expression', 'Meaningful Impact', 'Personal Growth', 'Connection', 'Freedom', 'Health', 'Learning', 'Service'].map((value, index) => (
              <motion.div
                key={value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant={selectedValues.includes(value) ? "default" : "outline"}
                  className={cn(
                    "h-auto py-3 text-sm w-full transition-all",
                    selectedValues.includes(value) && "ring-2 ring-primary shadow-lg scale-105"
                  )}
                  onClick={() => {
                    if (selectedValues.includes(value)) {
                      setSelectedValues(selectedValues.filter(v => v !== value));
                    } else if (selectedValues.length < 3) {
                      setSelectedValues([...selectedValues, value]);
                    }
                  }}
                >
                  {value}
                </Button>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Progress value={(selectedValues.length / 3) * 100} className="w-32" />
            <p className="text-sm text-muted-foreground">
              {selectedValues.length}/3 values selected
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Your Personal Dashboard",
      description: "Track your growth phases, energy, and insights all in one place.",
      duration: "1 minute",
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4" />
                What You'll Find Here
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Circle className="w-3 h-3 text-expansion fill-expansion" />
                <span><strong>Growth Halo:</strong> See which phase you're in right now</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Circle className="w-3 h-3 text-renewal fill-renewal" />
                <span><strong>Energy Mapping:</strong> Track mental, physical, emotional & spiritual energy</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Circle className="w-3 h-3 text-contraction fill-contraction" />
                <span><strong>Pattern Insights:</strong> AI-detected themes and breakthroughs</span>
              </motion.div>
            </CardContent>
          </Card>
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>You can access this tour anytime from the Help menu in settings.</span>
            </p>
          </div>
        </div>
      )
    },
    {
      title: "You're Ready to Begin",
      description: "Start with what feels right for you today.",
      duration: "30 seconds",
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button 
                variant="outline" 
                className="w-full h-auto p-4 justify-start hover:bg-primary/5 hover:border-primary/30 transition-all"
                onClick={() => {
                  onComplete();
                  window.location.href = '/checkin';
                }}
              >
                <Calendar className="w-5 h-5 mr-3 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Daily Check-in</div>
                  <div className="text-xs text-muted-foreground">Track your energy and mood</div>
                </div>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant="outline" 
                className="w-full h-auto p-4 justify-start hover:bg-primary/5 hover:border-primary/30 transition-all"
                onClick={() => {
                  onComplete();
                  window.location.href = '/chat';
                }}
              >
                <MessageSquare className="w-5 h-5 mr-3 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Chat with Bliss</div>
                  <div className="text-xs text-muted-foreground">Start a conversation about what's on your mind</div>
                </div>
              </Button>
            </motion.div>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              You can also explore the dashboard to see all available features
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = currentStep !== 2 || selectedValues.length === 3;
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const handleComplete = () => {
    localStorage.removeItem('onboardingProgress');
    localStorage.removeItem('onboardingValues');
    onComplete();
  };

  const handleSkip = () => {
    if (window.confirm('Are you sure you want to skip the onboarding? You can revisit it anytime from the Help menu.')) {
      handleComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                Step {currentStep + 1} of {steps.length}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {currentStepData.duration}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">{currentStepData.title}</h2>
                <p className="text-muted-foreground">{currentStepData.description}</p>
              </div>
              <div className="py-6">
                {currentStepData.content}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentStep ? "bg-primary w-6" : "bg-muted"
                  )}
                />
              ))}
            </div>
            <Button
              onClick={() => {
                if (isLastStep) {
                  handleComplete();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              disabled={!canProceed}
            >
              {isLastStep ? 'Get Started' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
