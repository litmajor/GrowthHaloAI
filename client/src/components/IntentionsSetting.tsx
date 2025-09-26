
import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, Edit, Check, X, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type GrowthPhase = "expansion" | "contraction" | "renewal";

interface Intention {
  id: string;
  title: string;
  description: string;
  phase: GrowthPhase;
  progress: number;
  createdAt: Date;
  targetCompletion?: Date;
  category: "spiritual" | "mental" | "physical" | "emotional" | "relational";
  isActive: boolean;
}

interface IntentionsSettingProps {
  currentPhase: GrowthPhase;
}

const phaseGuidance = {
  expansion: {
    title: "Expansion Phase Intentions",
    description: "Set intentions that stretch you into new territory while honoring your authentic self.",
    prompts: [
      "What new skills or experiences want to emerge through you?",
      "How can you expand your impact while staying true to your values?",
      "What boundaries are you ready to transcend?"
    ]
  },
  contraction: {
    title: "Contraction Phase Intentions", 
    description: "Focus on integration, deepening, and refining what you've already begun.",
    prompts: [
      "What recent growth needs deeper integration?",
      "How can you go deeper rather than wider?",
      "What practices will help you absorb recent experiences?"
    ]
  },
  renewal: {
    title: "Renewal Phase Intentions",
    description: "Set intentions that synthesize your growth into new ways of being.",
    prompts: [
      "How do you want to embody your recent insights?",
      "What new commitments are emerging from your transformation?",
      "How might you share your evolving wisdom?"
    ]
  }
};

const categoryColors = {
  spiritual: "bg-purple-100 text-purple-800 border-purple-300",
  mental: "bg-blue-100 text-blue-800 border-blue-300", 
  physical: "bg-green-100 text-green-800 border-green-300",
  emotional: "bg-rose-100 text-rose-800 border-rose-300",
  relational: "bg-amber-100 text-amber-800 border-amber-300"
};

export default function IntentionsSetting({ currentPhase }: IntentionsSettingProps) {
  const [intentions, setIntentions] = useState<Intention[]>([
    {
      id: "1",
      title: "Deepen Meditation Practice",
      description: "Commit to 20 minutes of daily meditation to integrate recent insights",
      phase: "contraction",
      progress: 65,
      createdAt: new Date(Date.now() - 7 * 86400000),
      category: "spiritual",
      isActive: true
    },
    {
      id: "2", 
      title: "Authentic Self-Expression",
      description: "Practice speaking my truth in challenging conversations",
      phase: "expansion",
      progress: 40,
      createdAt: new Date(Date.now() - 14 * 86400000), 
      category: "relational",
      isActive: true
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newIntention, setNewIntention] = useState({
    title: "",
    description: "",
    category: "spiritual" as Intention["category"]
  });

  const guidance = phaseGuidance[currentPhase];
  const activeIntentions = intentions.filter(i => i.isActive);

  const handleCreateIntention = () => {
    if (!newIntention.title.trim()) return;

    const intention: Intention = {
      id: Date.now().toString(),
      title: newIntention.title,
      description: newIntention.description,
      phase: currentPhase,
      progress: 0,
      createdAt: new Date(),
      category: newIntention.category,
      isActive: true
    };

    setIntentions([intention, ...intentions]);
    setNewIntention({ title: "", description: "", category: "spiritual" });
    setIsCreating(false);
  };

  const updateProgress = (id: string, newProgress: number) => {
    setIntentions(intentions.map(i => 
      i.id === id ? { ...i, progress: newProgress } : i
    ));
  };

  const phaseColors = {
    expansion: "border-expansion/30 bg-expansion/5",
    contraction: "border-contraction/30 bg-contraction/5", 
    renewal: "border-renewal/30 bg-renewal/5"
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Phase Guidance */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-2xl font-light flex items-center justify-center gap-2">
          <Target className="w-6 h-6" />
          Growth Intentions
        </h1>
        
        <Card className={cn("border-2", phaseColors[currentPhase])}>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-2">{guidance.title}</h2>
            <p className="text-muted-foreground mb-4">{guidance.description}</p>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Reflective Prompts:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                {guidance.prompts.map((prompt, index) => (
                  <li key={index}>• {prompt}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create New Intention */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {!isCreating ? (
          <Button 
            onClick={() => setIsCreating(true)}
            className="w-full h-16 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50 transition-all"
            variant="ghost"
          >
            <Plus className="w-5 h-5 mr-2" />
            Set New Intention for {currentPhase} Phase
          </Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>New Intention</CardTitle>
              <CardDescription>
                What authentic intention wants to emerge during this {currentPhase} phase?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Intention title..."
                value={newIntention.title}
                onChange={(e) => setNewIntention({...newIntention, title: e.target.value})}
              />
              
              <Textarea
                placeholder="Describe your intention and why it matters to you..."
                value={newIntention.description}
                onChange={(e) => setNewIntention({...newIntention, description: e.target.value})}
                className="min-h-20"
              />
              
              <Select 
                value={newIntention.category} 
                onValueChange={(value) => setNewIntention({...newIntention, category: value as Intention["category"]})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spiritual">Spiritual</SelectItem>
                  <SelectItem value="mental">Mental</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                  <SelectItem value="emotional">Emotional</SelectItem>
                  <SelectItem value="relational">Relational</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button onClick={handleCreateIntention} disabled={!newIntention.title.trim()}>
                  <Check className="w-4 h-4 mr-2" />
                  Create Intention
                </Button>
                <Button variant="ghost" onClick={() => setIsCreating(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Active Intentions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-medium">Active Intentions ({activeIntentions.length})</h2>
        
        {activeIntentions.map((intention, index) => (
          <motion.div
            key={intention.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">{intention.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{intention.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge 
                        variant="outline" 
                        className={categoryColors[intention.category]}
                      >
                        {intention.category}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={cn(
                          "capitalize",
                          phaseColors[intention.phase]
                        )}
                      >
                        {intention.phase}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {intention.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{intention.progress}%</span>
                  </div>
                  <Progress value={intention.progress} className="h-2" />
                  
                  <div className="flex gap-1 mt-2">
                    {[25, 50, 75, 100].map(value => (
                      <Button
                        key={value}
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => updateProgress(intention.id, value)}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {activeIntentions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted-foreground"
        >
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No active intentions yet. Set your first intention above to begin.</p>
        </motion.div>
      )}
    </div>
  );
}
