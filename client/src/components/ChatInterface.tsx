import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ChatMessage from "./ChatMessage";
import HaloProgressRing from "./HaloProgressRing";
import PhaseIndicator from "./PhaseIndicator";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isBliss: boolean;
  timestamp: Date;
  phase?: "expansion" | "contraction" | "renewal";
}

interface ChatInterfaceProps {
  currentPhase?: "expansion" | "contraction" | "renewal";
  phaseConfidence?: number;
}

export default function ChatInterface({ 
  currentPhase = "expansion",
  phaseConfidence = 75 
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

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

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
      // Prepare conversation history for API
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.isBliss ? 'assistant' as const : 'user' as const,
        content: msg.content
      }));

      // Call the real API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          history: conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Bliss');
      }

      const { message: responseMessage, phase: detectedPhase, confidence } = await response.json();
      
      const blissMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseMessage,
        isBliss: true,
        timestamp: new Date(),
        phase: detectedPhase
      };

      setMessages(prev => [...prev, blissMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback message in case of error
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing some technical difficulties right now. Please try again in a moment. Remember, even pauses in our conversation can be moments of reflection.",
        isBliss: true,
        timestamp: new Date(),
        phase: currentPhase
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
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
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <motion.div 
            className="flex flex-col items-center justify-center h-full text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
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
                I'm here to support you through all phases of your transformation. 
                How is your halo expanding today?
              </p>
            </div>
          </motion.div>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.content}
            isBliss={message.isBliss}
            timestamp={message.timestamp}
            phase={message.phase || currentPhase}
          />
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

      {/* Input */}
      <motion.div 
        className="p-4 border-t border-border bg-card/30 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
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
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            size="default"
            className="px-4 hover-elevate active-elevate-2"
            data-testid="button-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}