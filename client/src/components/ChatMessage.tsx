import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatMessageProps {
  message: string;
  isBliss: boolean;
  timestamp?: Date;
  phase?: "expansion" | "contraction" | "renewal";
}

export default function ChatMessage({ message, isBliss, timestamp, phase = "expansion" }: ChatMessageProps) {
  const phaseColors = {
    expansion: "bg-expansion/10 border-expansion/20",
    contraction: "bg-contraction/10 border-contraction/20", 
    renewal: "bg-renewal/10 border-renewal/20"
  };

  return (
    <motion.div 
      className={cn(
        "flex gap-3 max-w-4xl",
        isBliss ? "mx-auto" : "ml-auto flex-row-reverse"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Avatar className={cn(
        "w-8 h-8 flex-shrink-0",
        !isBliss && "bg-muted"
      )}>
        <AvatarFallback className={cn(
          "text-xs font-medium",
          isBliss ? "bg-gradient-to-br from-primary/20 to-accent/20 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {isBliss ? "B" : "You"}
        </AvatarFallback>
      </Avatar>

      <motion.div 
        className={cn(
          "flex-1 space-y-1 group",
          isBliss && "max-w-2xl"
        )}
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.2 }}
      >
        <div className={cn(
          "rounded-lg p-4 border transition-all duration-300",
          isBliss ? phaseColors[phase] : "bg-card border-card-border",
          "hover:shadow-sm group-hover:shadow-md"
        )}>
          <motion.p 
            className={cn(
              "text-sm leading-relaxed",
              isBliss ? "text-foreground" : "text-card-foreground"
            )}
            animate={{
              scale: [1, 1.001, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {message}
          </motion.p>
        </div>
        
        {timestamp && (
          <p className="text-xs text-muted-foreground px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}