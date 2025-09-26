import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type GrowthPhase = "expansion" | "contraction" | "renewal";

interface PhaseIndicatorProps {
  currentPhase: GrowthPhase;
  confidence: number; // 0-100
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
}

const phaseData = {
  expansion: {
    label: "Expansion",
    description: "Exploring new possibilities and growth",
    color: "text-expansion",
    bg: "bg-expansion/10",
    border: "border-expansion/30"
  },
  contraction: {
    label: "Contraction", 
    description: "Integration and reflection time",
    color: "text-contraction",
    bg: "bg-contraction/10",
    border: "border-contraction/30"
  },
  renewal: {
    label: "Renewal",
    description: "Synthesizing wisdom into new being",
    color: "text-renewal", 
    bg: "bg-renewal/10",
    border: "border-renewal/30"
  }
};

export default function PhaseIndicator({ 
  currentPhase, 
  confidence, 
  size = "md",
  showDescription = true 
}: PhaseIndicatorProps) {
  const phase = phaseData[currentPhase];
  
  const sizeClasses = {
    sm: "text-xs p-2",
    md: "text-sm p-3",
    lg: "text-base p-4"
  };

  return (
    <motion.div 
      className={cn(
        "rounded-lg border transition-all duration-500",
        phase.bg,
        phase.border,
        sizeClasses[size]
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        boxShadow: `0 0 20px ${currentPhase === 'expansion' ? 'rgba(14, 165, 233, 0.15)' : 
                                currentPhase === 'contraction' ? 'rgba(139, 92, 246, 0.15)' : 
                                'rgba(251, 191, 36, 0.15)'}`
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            className={cn("w-3 h-3 rounded-full", phase.bg)}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              backgroundColor: currentPhase === 'expansion' ? 'hsl(200 70% 55%)' : 
                              currentPhase === 'contraction' ? 'hsl(260 45% 60%)' : 
                              'hsl(45 85% 65%)'
            }}
          />
          <div>
            <h3 className={cn("font-medium", phase.color)}>
              {phase.label}
            </h3>
            {showDescription && (
              <p className="text-muted-foreground text-xs mt-1">
                {phase.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className={cn("text-sm font-medium", phase.color)}>
            {confidence}%
          </div>
          <div className="text-xs text-muted-foreground">
            confidence
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
        <motion.div 
          className="h-full rounded-full"
          style={{
            backgroundColor: currentPhase === 'expansion' ? 'hsl(200 70% 55%)' : 
                            currentPhase === 'contraction' ? 'hsl(260 45% 60%)' : 
                            'hsl(45 85% 65%)'
          }}
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}