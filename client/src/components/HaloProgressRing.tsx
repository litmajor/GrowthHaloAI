import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type GrowthPhase = "expansion" | "contraction" | "renewal";

interface HaloProgressRingProps {
  phase: GrowthPhase;
  progress: number; // 0-100
  size?: number; // pixel size
  showLabel?: boolean;
}

const phaseColors = {
  expansion: "stroke-expansion",
  contraction: "stroke-contraction", 
  renewal: "stroke-renewal"
};

const phaseLabels = {
  expansion: "Expansion",
  contraction: "Contraction",
  renewal: "Renewal"
};

export default function HaloProgressRing({ 
  phase,
  progress,
  size = 96, // default to 96px
  showLabel = true
}: HaloProgressRingProps) {
  // Calculate radius based on size (leave some padding)
  const radius = (size / 2) - 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background rings */}
        <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Outer breathing ring */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius + 8}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground/20"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Base circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground/30"
          />
          
          {/* Progress arc */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            className={cn("transition-colors duration-500", phaseColors[phase])}
            style={{
              strokeDasharray,
              strokeDashoffset
            }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className={cn(
              "text-xs font-medium transition-colors duration-500",
              phase === "expansion" && "text-expansion",
              phase === "contraction" && "text-contraction", 
              phase === "renewal" && "text-renewal"
            )}
            animate={{
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {Math.round(progress)}%
          </motion.div>
        </div>
      </div>

      {showLabel && (
        <motion.div 
          className={cn(
            "text-sm font-medium transition-colors duration-500",
            phase === "expansion" && "text-expansion",
            phase === "contraction" && "text-contraction",
            phase === "renewal" && "text-renewal"
          )}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {phaseLabels[phase]}
        </motion.div>
      )}
    </div>
  );
}