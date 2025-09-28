
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, BarChart3, Lightbulb, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Question {
  id: string;
  text: string;
  trait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
  reversed?: boolean;
}

interface TraitScore {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

const questions: Question[] = [
  // Openness to Experience
  { id: '1', text: 'I enjoy exploring new ideas and concepts', trait: 'openness' },
  { id: '2', text: 'I am curious about many different things', trait: 'openness' },
  { id: '3', text: 'I enjoy abstract or theoretical discussions', trait: 'openness' },
  { id: '4', text: 'I have a vivid imagination', trait: 'openness' },
  { id: '5', text: 'I prefer routine to novelty', trait: 'openness', reversed: true },
  { id: '6', text: 'I am quick to understand things', trait: 'openness' },
  { id: '7', text: 'I enjoy the beauty of art and nature', trait: 'openness' },
  { id: '8', text: 'I avoid philosophical discussions', trait: 'openness', reversed: true },

  // Conscientiousness
  { id: '9', text: 'I am always prepared', trait: 'conscientiousness' },
  { id: '10', text: 'I pay attention to details', trait: 'conscientiousness' },
  { id: '11', text: 'I get tasks done right away', trait: 'conscientiousness' },
  { id: '12', text: 'I carry out my plans', trait: 'conscientiousness' },
  { id: '13', text: 'I often forget to put things back in their proper place', trait: 'conscientiousness', reversed: true },
  { id: '14', text: 'I make a mess of things', trait: 'conscientiousness', reversed: true },
  { id: '15', text: 'I shirk my duties', trait: 'conscientiousness', reversed: true },
  { id: '16', text: 'I follow a schedule', trait: 'conscientiousness' },

  // Extraversion
  { id: '17', text: 'I am the life of the party', trait: 'extraversion' },
  { id: '18', text: 'I talk to a lot of different people at parties', trait: 'extraversion' },
  { id: '19', text: 'I feel comfortable around people', trait: 'extraversion' },
  { id: '20', text: 'I start conversations', trait: 'extraversion' },
  { id: '21', text: 'I keep in the background', trait: 'extraversion', reversed: true },
  { id: '22', text: 'I have little to say', trait: 'extraversion', reversed: true },
  { id: '23', text: "I don't like to draw attention to myself", trait: 'extraversion', reversed: true },
  { id: '24', text: 'I am quiet around strangers', trait: 'extraversion', reversed: true },

  // Agreeableness
  { id: '25', text: 'I feel empathy for others', trait: 'agreeableness' },
  { id: '26', text: 'I have a soft heart', trait: 'agreeableness' },
  { id: '27', text: 'I take time out for others', trait: 'agreeableness' },
  { id: '28', text: 'I feel concern for others', trait: 'agreeableness' },
  { id: '29', text: 'I insult people', trait: 'agreeableness', reversed: true },
  { id: '30', text: 'I am not interested in other people\'s problems', trait: 'agreeableness', reversed: true },
  { id: '31', text: 'I have a sharp tongue', trait: 'agreeableness', reversed: true },
  { id: '32', text: 'I cut others to pieces', trait: 'agreeableness', reversed: true },

  // Neuroticism
  { id: '33', text: 'I get stressed out easily', trait: 'neuroticism' },
  { id: '34', text: 'I worry about things', trait: 'neuroticism' },
  { id: '35', text: 'I am easily disturbed', trait: 'neuroticism' },
  { id: '36', text: 'I get upset easily', trait: 'neuroticism' },
  { id: '37', text: 'I am relaxed most of the time', trait: 'neuroticism', reversed: true },
  { id: '38', text: 'I seldom feel blue', trait: 'neuroticism', reversed: true },
  { id: '39', text: 'I am not easily bothered by things', trait: 'neuroticism', reversed: true },
  { id: '40', text: 'I remain calm under pressure', trait: 'neuroticism', reversed: true },
];

const traitDescriptions = {
  openness: {
    name: 'Openness to Experience',
    description: 'Reflects imagination, artistic interests, emotionality, adventurousness, intellect, and liberalism.',
    high: 'You enjoy variety, embrace new experiences, and are intellectually curious.',
    low: 'You prefer familiarity, traditional approaches, and practical over abstract thinking.'
  },
  conscientiousness: {
    name: 'Conscientiousness',
    description: 'Involves self-discipline, dutifulness, competence, thoughtfulness, and achievement-striving.',
    high: 'You are organized, responsible, and goal-oriented with strong self-discipline.',
    low: 'You prefer flexibility and spontaneity, though may struggle with organization and follow-through.'
  },
  extraversion: {
    name: 'Extraversion',
    description: 'Characterized by positive emotions, assertiveness, sociability, and energy from social interaction.',
    high: 'You are outgoing, energetic, and gain energy from social interactions.',
    low: 'You prefer quieter environments, deeper conversations, and gain energy from solitude.'
  },
  agreeableness: {
    name: 'Agreeableness',
    description: 'Reflects trust, altruism, kindness, affection, and prosocial behaviors.',
    high: 'You are cooperative, empathetic, and prioritize harmony in relationships.',
    low: 'You are more competitive and direct, preferring honesty over maintaining harmony.'
  },
  neuroticism: {
    name: 'Emotional Stability',
    description: 'Involves emotional stability versus tendency to experience negative emotions.',
    high: 'You may experience stress and emotional reactivity more intensely.',
    low: 'You tend to be emotionally stable, calm, and resilient under pressure.'
  }
};

export default function PersonalityTestPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [traitScores, setTraitScores] = useState<TraitScore | null>(null);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateScores = async () => {
    const scores: TraitScore = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    };

    const traitCounts = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    };

    questions.forEach(question => {
      const answer = answers[question.id];
      if (answer !== undefined) {
        const score = question.reversed ? 6 - answer : answer;
        scores[question.trait] += score;
        traitCounts[question.trait]++;
      }
    });

    // Convert to percentages (1-5 scale to 0-100)
    Object.keys(scores).forEach(trait => {
      const key = trait as keyof TraitScore;
      if (traitCounts[key] > 0) {
        scores[key] = Math.round(((scores[key] / traitCounts[key]) - 1) * 25);
      }
    });

    // Send results to server for AI integration
    try {
      await fetch('/api/personality-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          results: scores,
          userId: 'anonymous', // Replace with actual user ID when auth is implemented
        }),
      });
    } catch (error) {
      console.error('Failed to save personality results:', error);
    }

    setTraitScores(scores);
    setShowResults(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateScores();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const allAnswered = Object.keys(answers).length === questions.length;

  if (showResults && traitScores) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-light text-gray-800 dark:text-gray-200 mb-4">
              Your Personality Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Based on the Big Five personality model
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(traitScores).map(([trait, score], index) => {
              const traitInfo = traitDescriptions[trait as keyof typeof traitDescriptions];
              const traitColors = {
                openness: { icon: 'text-purple-600 dark:text-purple-400', progress: 'bg-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                conscientiousness: { icon: 'text-blue-600 dark:text-blue-400', progress: 'bg-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                extraversion: { icon: 'text-orange-600 dark:text-orange-400', progress: 'bg-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                agreeableness: { icon: 'text-green-600 dark:text-green-400', progress: 'bg-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                neuroticism: { icon: 'text-red-600 dark:text-red-400', progress: 'bg-red-600', bg: 'bg-red-50 dark:bg-red-900/20' }
              };
              const colors = traitColors[trait as keyof typeof traitColors];
              
              return (
                <motion.div
                  key={trait}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-l-4 ${colors.bg}`} 
                        style={{ borderLeftColor: colors.progress.replace('bg-', '').replace('-600', '') }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className={`w-5 h-5 ${colors.icon}`} />
                        <span className="text-gray-800 dark:text-gray-200">{traitInfo.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Score</span>
                          <span className="text-sm font-semibold" style={{ color: colors.icon.includes('purple') ? '#9333ea' : colors.icon.includes('blue') ? '#2563eb' : colors.icon.includes('orange') ? '#ea580c' : colors.icon.includes('green') ? '#16a34a' : '#dc2626' }}>{score}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${colors.progress}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {traitInfo.description}
                      </p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {score >= 50 ? traitInfo.high : traitInfo.low}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            >
              Continue to Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-light text-gray-800 dark:text-gray-200">
              Personality Assessment
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Discover your unique personality traits through the scientifically-validated Big Five model
          </p>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </motion.div>

        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-200">
                {currentQ.text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[currentQ.id]?.toString() || ''}
                onValueChange={(value) => handleAnswer(currentQ.id, parseInt(value))}
                className="space-y-3"
              >
                {[
                  { value: '1', label: 'Strongly Disagree' },
                  { value: '2', label: 'Disagree' },
                  { value: '3', label: 'Neutral' },
                  { value: '4', label: 'Agree' },
                  { value: '5', label: 'Strongly Agree' }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <RadioGroupItem 
                      value={option.value} 
                      id={option.value}
                      className="border-2 border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400"
                    />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1 text-gray-700 dark:text-gray-300">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between mt-8">
                <Button
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={nextQuestion}
                  disabled={!answers[currentQ.id]}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                >
                  {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
