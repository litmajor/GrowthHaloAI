
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ValuesAssessmentProps {
  type: 'quick' | 'deep';
  onComplete: (results: AssessmentResults) => void;
  onCancel: () => void;
}

interface AssessmentResults {
  valueUpdates: Array<{ id: string; newAlignment: number; newImportance: number }>;
  insights: string;
  conflictAreas: string[];
}

const quickQuestions = [
  "Which value felt most present in your decisions this week?",
  "Which value felt most absent or neglected?",
  "What's one way you could better honor your top value tomorrow?"
];

const deepQuestions = [
  "Looking at your recent major decisions, which values guided them most strongly?",
  "Are there any values that feel different in importance than they did six months ago?",
  "Where do you notice tension between different values in your life?",
  "What would living in perfect alignment with your values look like?",
  "Which relationships or situations challenge your values most?"
];

export default function ValuesAssessment({ type, onComplete, onCancel }: ValuesAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const questions = type === 'quick' ? quickQuestions : deepQuestions;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleNext = () => {
    const newResponses = [...responses, currentResponse];
    setResponses(newResponses);
    setCurrentResponse("");

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleComplete(newResponses);
    }
  };

  const handleComplete = async (allResponses: string[]) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results: AssessmentResults = {
      valueUpdates: [
        { id: '1', newAlignment: 8, newImportance: 9 },
        { id: '2', newAlignment: 6, newImportance: 7 }
      ],
      insights: "Your responses suggest a growing alignment with authenticity and creativity, with some tension around balancing freedom with responsibility.",
      conflictAreas: ["Work-life balance", "Financial security vs. creative expression"]
    };

    onComplete(results);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Values {type === 'quick' ? 'Check-in' : 'Deep Assessment'}</span>
          <Button variant="ghost" size="sm" onClick={onCancel}>×</Button>
        </CardTitle>
        <CardDescription>
          {type === 'quick' 
            ? "A quick reflection on your values alignment this week"
            : "A deeper exploration of how your values are evolving"
          }
        </CardDescription>
        <Progress value={progress} className="mt-4" />
        <p className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {!isAnalyzing ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-lg border-l-4 border-primary bg-primary/5">
                <p className="font-medium mb-2">
                  {questions[currentQuestion]}
                </p>
              </div>

              <Textarea
                value={currentResponse}
                onChange={(e) => setCurrentResponse(e.target.value)}
                placeholder="Take a moment to reflect and share your thoughts..."
                className="min-h-32 resize-none"
              />

              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (currentQuestion > 0) {
                      setCurrentQuestion(currentQuestion - 1);
                      setCurrentResponse(responses[currentQuestion - 1] || "");
                      setResponses(responses.slice(0, -1));
                    }
                  }}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!currentResponse.trim()}
                  className="hover-elevate"
                >
                  {currentQuestion === questions.length - 1 ? 'Complete Assessment' : 'Next Question'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-medium mb-2">Analyzing your responses...</p>
              <p className="text-sm text-muted-foreground">
                Bliss is identifying patterns and insights in your values alignment
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
