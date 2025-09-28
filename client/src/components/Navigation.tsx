import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { MessageSquare, Compass, Calendar, Sparkles, BarChart3, BookOpen, Target, Users, CreditCard, Settings, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import HaloProgressRing from "./HaloProgressRing";
import { Button } from "@/components/ui/button";
import { useState } from "react";


interface NavigationProps {
  currentPhase?: "expansion" | "contraction" | "renewal";
  phaseConfidence?: number;
}

const navItems = [
  { path: "/chat", icon: MessageSquare, label: "Chat with Bliss" },
  { path: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/compass", icon: Compass, label: "Values Compass" },
  { path: "/checkin", icon: Calendar, label: "Daily Check-in" },
  { path: "/journal", icon: BookOpen, label: "Growth Journal" },
  { path: "/intentions", icon: Target, label: "Intentions" },
  { path: "/community", icon: Users, label: "Community" },
  { path: "/events", icon: Calendar, label: "Events" },
  { path: "/content", icon: BookOpen, label: "Content" },
  { path: "/subscription", icon: CreditCard, label: "Subscription" }, // Added Subscription page link
];

const secondaryNavItems = [
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function Navigation({
  currentPhase = "expansion",
  phaseConfidence = 75
}: NavigationProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-background/95 backdrop-blur-md border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col h-full">
        {/* Logo and Toggle */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <Link href="/chat" className="flex items-center gap-3 hover-elevate p-2 rounded-md">
                <HaloProgressRing
                  phase={currentPhase}
                  progress={phaseConfidence}
                  size="sm"
                  showLabel={false}
                />
                <div>
                  <h1 className="text-lg font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Bliss AI
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Growth Halo Companion
                  </p>
                </div>
              </Link>
            )}
            {isCollapsed && (
              <Link href="/chat" className="flex items-center justify-center hover-elevate p-2 rounded-md">
                <HaloProgressRing
                  phase={currentPhase}
                  progress={phaseConfidence}
                  size="sm"
                  showLabel={false}
                />
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto"
              data-testid="nav-toggle"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    "hover-elevate cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    isCollapsed ? "justify-center" : ""
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`nav-${item.path === '/' ? 'chat' : item.path.slice(1)}`}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Secondary Navigation */}
        <div className="p-4 border-t border-border space-y-2">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    "hover-elevate cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    isCollapsed ? "justify-center" : ""
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`nav-${item.path.slice(1)}`}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </motion.div>
              </Link>
            );
          })}

          {/* Theme Toggle */}
          <div className={cn("flex", isCollapsed ? "justify-center" : "justify-start")}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.aside>
  );
}