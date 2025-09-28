import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, ArrowRight, Target, Heart, Lightbulb, Compass, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ChatMessage from "./ChatMessage";
import HaloProgressRing from "./HaloProgressRing";
import PhaseIndicator from "./PhaseIndicator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatHistory from './ChatHistory';
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isBliss: boolean;
  timestamp: Date;
  phase?: "expansion" | "contraction" | "renewal";
  adaptationNotes?: string;
  memoryInsights?: {
    associativeRecall?: any;
    contextAdaptation?: any;
    memoryAnchors?: string[];
  };
  contextAdaptation?: any;
  contradictionAnalysis?: {
    contradictions: any[];
    beliefRevisions: any[];
    cognitiveDistortions: any[];
    selfPerceptionPatterns: any;
  };
}

interface ChatInterfaceProps {
  currentPhase?: "expansion" | "contraction" | "renewal";
  phaseConfidence?: number;
  onPhaseUpdate?: (phase: string, confidence: number) => void;
}

// Chat templates organized by growth phase
const chatTemplates = {
  expansion: [
    {
      icon: Target,
      title: "Explore New Possibilities",
      prompt: "I'm feeling ready to expand and try something new, but I'm not sure where to start. Can you help me explore what opportunities might be calling to me right now?",
      description: "Perfect for when you're feeling energized and ready to grow"
    },
    {
      icon: Lightbulb,
      title: "Creative Breakthrough",
      prompt: "I have an idea or dream that keeps coming up, but I feel stuck on how to make it real. Can you help me think through the next steps?",
      description: "When inspiration strikes but you need guidance"
    },
    {
      icon: ArrowRight,
      title: "Take Action",
      prompt: "I know what I want to do, but I keep hesitating. What's holding me back from taking action on my goals?",
      description: "Ready to move forward but need that extra push"
    }
  ],
  contraction: [
    {
      icon: Heart,
      title: "Process & Reflect",
      prompt: "I've been through a lot lately and need to make sense of it all. Can you help me process what I've learned and what it means for me?",
      description: "When you need space to integrate recent experiences"
    },
    {
      icon: Compass,
      title: "Find Direction",
      prompt: "I feel a bit lost or unclear about my path right now. Can you help me reconnect with what truly matters to me?",
      description: "For times when you need to rediscover your compass"
    },
    {
      icon: Sparkles,
      title: "Inner Wisdom",
      prompt: "I have a decision to make, but my mind is noisy. Can you help me quiet the external voices and listen to my inner wisdom?",
      description: "Access your authentic knowing"
    }
  ],
  renewal: [
    {
      icon: RefreshCw,
      title: "Fresh Start",
      prompt: "I feel like I'm ready for a new chapter in my life. Can you help me envision what this transformation might look like?",
      description: "When you're ready to begin anew"
    },
    {
      icon: Target,
      title: "Aligned Action",
      prompt: "I've gained new clarity about who I am and what I want. How can I translate these insights into meaningful action?",
      description: "Transform insights into purposeful steps"
    },
    {
      icon: Heart,
      title: "Integrate & Evolve",
      prompt: "I feel like I've grown and changed recently. Can you help me understand how to honor both who I was and who I'm becoming?",
      description: "Bridge your past and future self"
    }
  ]
};

export default function ChatInterface({ 
  currentPhase = "expansion",
  phaseConfidence = 75,
  onPhaseUpdate
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isBliss: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Use the enhanced adaptive response endpoint
      const response = await fetch('/api/bliss/adaptive-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.slice(-10), // Keep a reasonable history
          userId: 'demo-user', // Replace with actual user ID
          userProfile: {
            communicationStyle: 'empathetic', // Example: could be dynamically determined
            emotionalState: 'neutral',       // Example: could be dynamically detected
            triggerTopics: [],                // Example: could be populated from past interactions
            preferredActivities: ['reflection', 'journaling'] // Example: user preferences
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      const blissMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        isBliss: true,
        timestamp: new Date(),
        phase: data.phase,
        adaptationNotes: data.adaptationNotes,
        memoryInsights: {
          associativeRecall: data.associativeRecall,
          contextAdaptation: data.contextAdaptation,
          memoryAnchors: data.memoryAnchors
        },
        contextAdaptation: data.contextAdaptation,
        contradictionAnalysis: data.contradictionAnalysis
      };

      setMessages(prev => [...prev, blissMessage]);

      // Call the onPhaseUpdate callback if provided
      if (onPhaseUpdate) {
        onPhaseUpdate(data.phase, data.confidence);
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Fallback message in case of error
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        isBliss: true,
        timestamp: new Date(),
        phase: currentPhase,
        // No confidence provided for fallback, or a default low value
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(); // Use the new sendMessage function name
    }
  };

  const handleTemplateSelect = (prompt: string) => {
    setInputValue(prompt);
    // Optionally auto-send the message
    // sendMessage();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      {/* Chat Interface with Tabs */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <div className="shrink-0 border-b bg-card/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <HaloProgressRing 
                  phase={currentPhase} 
                  progress={phaseConfidence} 
                  size="sm" 
                  showLabel={false} 
                />
                <div>
                  <h1 className="text-lg font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Bliss
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Your Growth Halo companion
                  </p>
                </div>
              </div>

              <PhaseIndicator 
                currentPhase={currentPhase}
                confidence={phaseConfidence}
                size="sm"
                showDescription={false}
              />
            </div>

            <TabsList className="w-full">
              <TabsTrigger value="chat" className="flex-1">
                Current Chat
                <Badge variant="outline" className="ml-2 text-xs">
                  {messages.length > 1 ? `${messages.length - 1}` : '0'}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                Chat History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.length === 0 && (
                <motion.div 
                  className="flex flex-col h-full space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Welcome Header */}
                  <div className="flex flex-col items-center text-center space-y-4 pt-8">
                    <HaloProgressRing 
                      phase={currentPhase} 
                      progress={phaseConfidence} 
                      size="lg" 
                    />
                    <div className="space-y-2">
                      <h2 className="text-xl font-light text-foreground">
                        Welcome to your growth journey
                      </h2>
                      <p className="text-muted-foreground max-w-md">
                        Choose a conversation starter below, or share what's on your mind.
                      </p>
                    </div>
                  </div>

                  {/* Chat Templates */}
                  <div className="flex-1 max-w-4xl mx-auto w-full px-4">
                    <div className="space-y-6">
                      {/* Current Phase Templates */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {currentPhase} phase
                          </Badge>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Suggested for your current phase
                          </h3>
                        </div>
                        <div className="grid gap-3">
                          {chatTemplates[currentPhase].map((template, index) => {
                            const Icon = template.icon;
                            return (
                              <motion.button
                                key={index}
                                onClick={() => handleTemplateSelect(template.prompt)}
                                className="text-left p-4 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 hover:border-border transition-colors group"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                data-testid={`template-${currentPhase}-${index}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Icon className="w-4 h-4 text-primary" />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-medium text-foreground">
                                        {template.title}
                                      </h4>
                                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {template.description}
                                    </p>
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Other Phases */}
                      <div className="space-y-4">
                        {Object.entries(chatTemplates).map(([phase, templates]) => {
                          if (phase === currentPhase) return null;

                          return (
                            <div key={phase} className="space-y-2">
                              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {phase} phase
                              </h4>
                              <div className="grid gap-2">
                                {templates.map((template, index) => {
                                  const Icon = template.icon;
                                  return (
                                    <motion.button
                                      key={`${phase}-${index}`}
                                      onClick={() => handleTemplateSelect(template.prompt)}
                                      className="text-left p-3 rounded-md border border-border/30 bg-card/20 hover:bg-card/40 hover:border-border/50 transition-colors group"
                                      whileHover={{ scale: 1.005 }}
                                      whileTap={{ scale: 0.995 }}
                                      data-testid={`template-${phase}-${index}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Icon className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                          {template.title}
                                        </span>
                                        <ArrowRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors ml-auto" />
                                      </div>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <ChatMessage
                    message={message.content}
                    isBliss={message.isBliss}
                    timestamp={message.timestamp}
                    phase={message.phase || currentPhase}
                  />

                  {/* Memory Insights Display */}
                  {!message.isBliss && message.memoryInsights?.associativeRecall && message.memoryInsights.associativeRecall.memories && message.memoryInsights.associativeRecall.memories.length > 0 && (
                    <div className="ml-12 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="font-medium text-purple-700">Memory Connections</span>
                        <span className="text-purple-500 text-xs">
                          ({message.memoryInsights.associativeRecall.memories.length} memories, {message.memoryInsights.associativeRecall.relevanceScore}% relevance)
                        </span>
                      </div>

                      {message.memoryInsights.associativeRecall.bridgeInsights?.length > 0 && (
                        <div className="space-y-1">
                          {message.memoryInsights.associativeRecall.bridgeInsights.slice(0, 2).map((insight: string, index: number) => (
                            <div key={index} className="text-purple-600 text-xs italic">
                              "⟫ {insight}"
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-2 text-xs text-purple-500">
                        Reasoning: {message.memoryInsights.associativeRecall.reasoning}
                      </div>
                    </div>
                  )}

                  {/* Contradiction Analysis Display */}
                  {message.isBliss && message.contextAdaptation?.contradictionsDetected > 0 && (
                    <div className="ml-12 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="font-medium text-amber-700">Pattern Recognition</span>
                        <span className="text-amber-500 text-xs">
                          ({message.contextAdaptation.contradictionsDetected} patterns noticed)
                        </span>
                      </div>
                      <div className="text-amber-600 text-xs italic">
                        "I notice some interesting patterns in what you've shared that might offer new perspectives..."
                      </div>
                    </div>
                  )}

                  {/* Memory Anchors */}
                  {!message.isBliss && message.memoryInsights?.memoryAnchors && message.memoryInsights.memoryAnchors.length > 0 && (
                    <div className="ml-12 flex flex-wrap gap-1">
                      {message.memoryInsights.memoryAnchors.map((anchor: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {anchor}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <motion.div 
                  className="flex gap-3 max-w-4xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">B</span>
                  </div>
                  <div className="flex-1 max-w-2xl">
                    <div className="rounded-lg p-4 border bg-card/50 border-card-border">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-primary/40 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="shrink-0 border-t border-border bg-card/30 p-4">
              <div className="flex gap-3 max-w-4xl mx-auto">
                <div className="flex-1">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Share what's on your mind..."
                    className={cn(
                      "min-h-[44px] max-h-32 resize-none border-input/50",
                      "focus-visible:ring-1 focus-visible:ring-primary/30",
                      "placeholder:text-muted-foreground/60"
                    )}
                    data-testid="input-message"
                  />
                </div>
                <Button 
                  onClick={sendMessage} 
                  disabled={!inputValue.trim() || isLoading}
                  size="default"
                  className="px-4 hover-elevate active-elevate-2"
                  data-testid="button-send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 mt-0">
            <div className="p-4 max-w-4xl mx-auto">
              <ChatHistory 
                userId="demo-user" 
                onSelectSession={(sessionId) => {
                  console.log('Selected session:', sessionId);
                  // Logic to load and display the selected chat session would go here
                  // For now, we just log it.
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}