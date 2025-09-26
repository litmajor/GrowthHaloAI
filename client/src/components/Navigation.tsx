import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { MessageSquare, Compass, Calendar, Sparkles, BarChart3, BookOpen, Target, Users, CreditCard, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import HaloProgressRing from "./HaloProgressRing";
import { Button } from "@/components/ui/button";

// Placeholder for ListItem and NavigationMenuContent if they are not defined elsewhere
// In a real scenario, these would likely be imported from a UI library like shadcn/ui
const ListItem = ({ className, title, children, href }) => (
  <li>
    <Link href={href}>
      <a
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </a>
    </Link>
  </li>
);

const NavigationMenuContent = ({ children }) => <div>{children}</div>;
const NavigationMenuLink = ({ asChild, children }) => <div>{children}</div>;


interface NavigationProps {
  currentPhase?: "expansion" | "contraction" | "renewal";
  phaseConfidence?: number;
}

const navItems = [
  { path: "/", icon: MessageSquare, label: "Chat with Bliss" },
  { path: "/home", icon: Sparkles, label: "Landing" },
  { path: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/compass", icon: Compass, label: "Values Compass" },
  { path: "/checkin", icon: Calendar, label: "Daily Check-in" },
  { path: "/journal", icon: BookOpen, label: "Growth Journal" },
  { path: "/intentions", icon: Target, label: "Intentions" },
  { path: "/community", icon: Users, label: "Community" },
  { path: "/events", icon: Calendar, label: "Events" },
  { path: "/content", icon: BookOpen, label: "Content" },
  { path: "/pricing", icon: CreditCard, label: "Pricing" },
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

  return (
    <motion.header
      className="border-b border-border bg-background/80 dark:bg-background/90 backdrop-blur-md sticky top-0 z-50 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between min-h-[60px]">
          {/* Logo and Growth Ring */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 hover-elevate p-2 rounded-md">
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
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;

              return (
                <Link key={item.path} href={item.path}>
                  <motion.div
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      "hover-elevate cursor-pointer",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`nav-${item.path === '/' ? 'chat' : item.path.slice(1)}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;

              return (
                <Link key={item.path} href={item.path}>
                  <motion.div
                    className={cn(
                      "p-2 rounded-md hover-elevate cursor-pointer",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;

              return (
                <Link key={item.path} href={item.path}>
                  <motion.div
                    className={cn(
                      "p-2 rounded-md hover-elevate cursor-pointer",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    data-testid={`nav-${item.path.slice(1)}`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                </Link>
              );
            })}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
}