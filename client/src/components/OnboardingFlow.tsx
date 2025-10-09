
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Circle, Sparkles, Heart, Brain, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HaloProgressRing from './HaloProgressRing';
import { cn } from '@/lib/utils';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const steps = [
    {
      title: "Welcome to Your Growth Journey",
      description: "Growth Halo works differently—we believe growth is cyclical, not linear.",
      content: (
        <div className="text-center space-y-6">
          <HaloProgressRing phase="expansion" progress={75} size="lg" showLabel={true} />
          <p className="text-muted-foreground max-w-md mx-auto">
            Like breathing, growth moves through <strong>expansion</strong>, <strong>contraction</strong>, and <strong>renewal</strong>. 
            We'll help you navigate all three phases with wisdom and compassion.
          </p>
        </div>
      )
    },
    {
      title: "Meet Bliss, Your AI Companion",
      description: "Bliss asks questions that help you see patterns you might miss on your own.",
      content: (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">How Bliss Helps You Grow</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm">Remembers your entire journey and connects insights over time</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm">Spots patterns and contradictions you might not see alone</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm">Asks questions that invite reflection, not judgment</p>
              </div>
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground italic text-center">
            "I remember three weeks ago you mentioned wanting to be more creative..." - Bliss
          </p>
        </div>
      )
    },
    {
      title: "Discover Your Core Values",
      description: "What matters most to you? Choose 3 values to guide your journey.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['Authenticity', 'Creative Expression', 'Meaningful Impact', 'Personal Growth', 'Connection', 'Freedom', 'Health', 'Learning', 'Service'].map((value) => (
              <Button
                key={value}
                variant={selectedValues.includes(value) ? "default" : "outline"}
                className={cn(
                  "h-auto py-3 text-sm",
                  selectedValues.includes(value) && "ring-2 ring-primary"
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
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {selectedValues.length}/3 values selected
          </p>
        </div>
      )
    },
    {
      title: "Your Personal Dashboard",
      description: "Track your growth phases, energy, and insights all in one place.",
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
              <div className="flex items-center gap-2">
                <Circle className="w-3 h-3 text-expansion" />
                <span><strong>Growth Halo:</strong> See which phase you're in right now</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-3 h-3 text-renewal" />
                <span><strong>Energy Mapping:</strong> Track mental, physical, emotional & spiritual energy</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-3 h-3 text-contraction" />
                <span><strong>Pattern Insights:</strong> AI-detected themes and breakthroughs</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "You're Ready to Begin",
      description: "Start with what feels right for you today.",
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start"
              onClick={() => {
                onComplete();
                window.location.href = '/checkin';
              }}
            >
              <Heart className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Daily Check-in</div>
                <div className="text-xs text-muted-foreground">Track your energy and mood</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start"
              onClick={() => {
                onComplete();
                window.location.href = '/chat';
              }}
            >
              <Sparkles className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Chat with Bliss</div>
                <div className="text-xs text-muted-foreground">Start a conversation about what's on your mind</div>
              </div>
            </Button>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = currentStep !== 2 || selectedValues.length === 3;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary">Step {currentStep + 1} of {steps.length}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onComplete}
              className="text-muted-foreground"
            >
              Skip for now
            </Button>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
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
            <Button
              onClick={() => {
                if (isLastStep) {
                  onComplete();
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
