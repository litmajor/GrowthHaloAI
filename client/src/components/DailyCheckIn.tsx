import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Heart, Brain, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type GrowthPhase = "expansion" | "contraction" | "renewal";

interface EnergyLevel {
  mental: number;
  physical: number;
  emotional: number;
  spiritual: number;
}

interface DailyCheckInProps {
  currentPhase?: GrowthPhase;
  onComplete?: (data: any) => void;
}

const phaseQuestions = {
  expansion: [
    "What new territory feels most calling to you today?",
    "Where do you sense the most growth energy right now?", 
    "What opportunity are you ready to embrace?",
    "How can you channel this expansive energy constructively?"
  ],
  contraction: [
    "What recent experiences are asking to be integrated?",
    "Where do you need to create more space for reflection?",
    "What wisdom is emerging from your current pause?",
    "How can you honor this time of inward focus?"
  ],
  renewal: [
    "What insights from recent growth are crystallizing?",
    "How are you different than when this cycle began?",
    "What new commitments are emerging from your transformation?",
    "How might you share your evolving wisdom?"
  ]
};

const phaseColors = {
  expansion: {
    primary: "text-expansion",
    bg: "bg-expansion/10",
    border: "border-expansion/30"
  },
  contraction: {
    primary: "text-contraction", 
    bg: "bg-contraction/10",
    border: "border-contraction/30"
  },
  renewal: {
    primary: "text-renewal",
    bg: "bg-renewal/10", 
    border: "border-renewal/30"
  }
};

export default function DailyCheckIn({ 
  currentPhase = "expansion",
  onComplete 
}: DailyCheckInProps) {
  const [reflection, setReflection] = useState("");
  const [energyLevels, setEnergyLevels] = useState<EnergyLevel>({
    mental: 7,
    physical: 6,
    emotional: 7,
    spiritual: 5
  });
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [gratitude, setGratitude] = useState("");

  const questions = phaseQuestions[currentPhase];
  const colors = phaseColors[currentPhase];

  const energyIcons = {
    mental: Brain,
    physical: Zap,
    emotional: Heart,
    spiritual: Users
  };

  const handleEnergyChange = (type: keyof EnergyLevel, value: number[]) => {
    setEnergyLevels(prev => ({
      ...prev,
      [type]: value[0]
    }));
  };

  const handleSubmit = () => {
    const checkInData = {
      phase: currentPhase,
      reflection,
      energyLevels,
      question: questions[selectedQuestion],
      gratitude,
      timestamp: new Date()
    };
    
    console.log('Daily check-in completed:', checkInData);
    onComplete?.(checkInData);
  };

  const getEnergyColor = (level: number) => {
    if (level >= 8) return "text-renewal bg-renewal/20";
    if (level >= 6) return "text-expansion bg-expansion/20";
    if (level >= 4) return "text-amber-600 bg-amber-100";
    return "text-contraction bg-contraction/20";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div 
        className="text-center space-y-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
        <h1 className="text-2xl font-light">Daily Growth Check-in</h1>
        <div className="flex items-center justify-center">
          <Badge 
            variant="outline"
            className={cn("capitalize", colors.bg, colors.border, colors.primary)}
          >
            {currentPhase} Phase
          </Badge>
        </div>
      </motion.div>

      {/* Phase-specific Reflection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={cn("border", colors.border, colors.bg)}>
          <CardHeader>
            <CardTitle className="text-lg">Reflection</CardTitle>
            <CardDescription>
              Choose a question that resonates with your current energy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {questions.map((question, index) => (
                <Button
                  key={index}
                  variant={selectedQuestion === index ? "default" : "ghost"}
                  className={cn(
                    "justify-start text-left h-auto p-3 hover-elevate",
                    selectedQuestion === index && "text-primary-foreground"
                  )}
                  onClick={() => setSelectedQuestion(index)}
                  data-testid={`button-question-${index}`}
                >
                  {question}
                </Button>
              ))}
            </div>
            
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Let your thoughts flow..."
              className="min-h-24"
              data-testid="textarea-reflection"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Energy Mapping */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Energy Mapping</CardTitle>
            <CardDescription>
              How are you feeling across different dimensions?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(energyLevels).map(([type, level]) => {
              const Icon = energyIcons[type as keyof EnergyLevel];
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium capitalize">{type}</span>
                    </div>
                    <Badge 
                      variant="outline"
                      className={getEnergyColor(level)}
                    >
                      {level}/10
                    </Badge>
                  </div>
                  <Slider
                    value={[level]}
                    onValueChange={(value) => handleEnergyChange(type as keyof EnergyLevel, value)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                    data-testid={`slider-${type}`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Gratitude */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gratitude</CardTitle>
            <CardDescription>
              What are you appreciating in this moment?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="I'm grateful for..."
              className="min-h-20"
              data-testid="textarea-gratitude"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Submit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button 
          onClick={handleSubmit}
          className="w-full hover-elevate active-elevate-2"
          size="lg"
          data-testid="button-complete-checkin"
        >
          Complete Check-in
        </Button>
      </motion.div>
    </div>
  );
}