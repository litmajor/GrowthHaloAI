
import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Calendar, Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type GrowthPhase = "expansion" | "contraction" | "renewal";

interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  phase: GrowthPhase;
  aiInsights?: string[];
  mood: number; // 1-10
  tags: string[];
}

interface GrowthJournalProps {
  currentPhase: GrowthPhase;
}

const phasePrompts = {
  expansion: [
    "What new territory is calling to your soul today?",
    "Where do you feel most alive and energized right now?",
    "What possibilities are you ready to explore?",
    "How has your world expanded this week?",
    "What boundaries are you ready to transcend?"
  ],
  contraction: [
    "What recent experiences are asking to be integrated?",
    "Where are you being called to go deeper rather than wider?",
    "What wisdom is emerging from this pause?",
    "How is this inward turn serving your growth?",
    "What needs to be released to make space for what's coming?"
  ],
  renewal: [
    "How are you different than when this cycle began?",
    "What new patterns are crystallizing in your life?",
    "What insights from recent growth feel most significant?",
    "How might you share your evolving wisdom?",
    "What commitments are emerging from your transformation?"
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

export default function GrowthJournal({ currentPhase }: GrowthJournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: "1",
      date: new Date(Date.now() - 86400000),
      content: "Today I felt resistance to my normal routine. Instead of pushing through, I honored the pause. There's something profound happening beneath the surface - a restructuring of priorities that I can't quite name yet.",
      phase: "contraction",
      aiInsights: [
        "Your awareness of internal shifts shows deep self-attunement.",
        "Honoring resistance instead of fighting it demonstrates growth wisdom."
      ],
      mood: 7,
      tags: ["resistance", "pause", "priorities"]
    }
  ]);
  
  const [currentEntry, setCurrentEntry] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const prompts = phasePrompts[currentPhase];
  const colors = phaseColors[currentPhase];

  const handleSaveEntry = () => {
    if (!currentEntry.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date(),
      content: currentEntry,
      phase: currentPhase,
      mood: 7, // Could be set via UI
      tags: extractTags(currentEntry)
    };

    setEntries([newEntry, ...entries]);
    setCurrentEntry("");
    setSelectedPrompt("");
  };

  const extractTags = (content: string): string[] => {
    // Simple tag extraction - could be enhanced with AI
    const words = content.toLowerCase().split(/\s+/);
    const emotionWords = words.filter(word => 
      ['growth', 'fear', 'joy', 'anger', 'love', 'peace', 'anxiety', 'hope', 'gratitude', 'confusion'].includes(word)
    );
    return [...new Set(emotionWords)];
  };

  const filteredEntries = entries.filter(entry =>
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div 
        className="text-center space-y-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-light flex items-center justify-center gap-2">
          <BookOpen className="w-6 h-6" />
          Growth Journal
        </h1>
        <p className="text-muted-foreground">
          Your space for reflection, integration, and authentic self-discovery
        </p>
        <Badge 
          variant="outline"
          className={cn("capitalize", colors.bg, colors.border, colors.primary)}
        >
          {currentPhase} Phase
        </Badge>
      </motion.div>

      {/* New Entry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={cn("border", colors.border, colors.bg)}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Today's Reflection
            </CardTitle>
            <CardDescription>
              Let your thoughts flow, guided by your current growth phase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI-Generated Prompts */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Phase-Appropriate Prompts</h4>
              <div className="grid grid-cols-1 gap-2">
                {prompts.slice(0, 3).map((prompt, index) => (
                  <Button
                    key={index}
                    variant={selectedPrompt === prompt ? "default" : "ghost"}
                    className="justify-start text-left h-auto p-3 hover-elevate"
                    onClick={() => {
                      setSelectedPrompt(prompt);
                      setCurrentEntry(currentEntry + (currentEntry ? "\n\n" : "") + prompt + "\n\n");
                    }}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Writing Area */}
            <Textarea
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              placeholder="Let your thoughts flow..."
              className="min-h-32 resize-none"
            />

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setCurrentEntry("")}>
                Clear
              </Button>
              <Button onClick={handleSaveEntry} disabled={!currentEntry.trim()}>
                Save Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2"
      >
        <div className="flex-1">
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Previous Entries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-medium">Previous Reflections</h3>
        
        {filteredEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {entry.date.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "capitalize text-xs",
                        phaseColors[entry.phase].bg,
                        phaseColors[entry.phase].border,
                        phaseColors[entry.phase].primary
                      )}
                    >
                      {entry.phase}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed mb-3">{entry.content}</p>
                
                {entry.aiInsights && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <h5 className="text-xs font-medium mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Insights
                    </h5>
                    <ul className="text-xs space-y-1">
                      {entry.aiInsights.map((insight, i) => (
                        <li key={i} className="text-muted-foreground">• {insight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
