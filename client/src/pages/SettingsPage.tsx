import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Bell,
  Shield,
  User,
  Palette,
  Database,
  Sparkles,
  HelpCircle,
  BookOpen,
  MessageSquare,
  CheckCircle
} from "lucide-react";
import { useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useLocation, Link } from 'wouter';
import OnboardingFlow from '@/components/OnboardingFlow';
import { Badge } from "@/components/ui/badge";
import { useHints } from "@/hooks/use-hints"; // Assuming useHints provides tutorial data

export default function SettingsPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const hints = useHints(); // Get tutorial data from context or hook

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveContainer size="lg" className="py-4 sm:py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-light text-foreground">
              Settings
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Customize your Growth Halo experience
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8">
            {/* Profile Settings */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about your growth journey..."
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Theme</Label>
                    <p className="text-xs text-muted-foreground">
                      Choose how Growth Halo looks for you
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Growth Phase Colors</Label>
                    <p className="text-xs text-muted-foreground">
                      Customize colors for expansion, contraction, and renewal
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Customize
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
                <CardDescription>Get help and learn how to use Growth Halo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowOnboarding(true)}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Restart Onboarding Tour
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Interactive Tutorials */}
            <Card>
              <CardHeader>
                <CardTitle>Interactive Tutorials</CardTitle>
                <CardDescription>Learn at your own pace with guided tutorials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {hints.availableTutorials.map((tutorial) => {
                  const isCompleted = hints.completedTutorials.includes(tutorial.id);
                  const canStart = !tutorial.prerequisites ||
                    tutorial.prerequisites.every(prereq => hints.completedTutorials.includes(prereq));

                  return (
                    <div key={tutorial.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {tutorial.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{tutorial.title}</h4>
                            {isCompleted && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{tutorial.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {tutorial.estimatedTime} min
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {tutorial.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isCompleted ? "outline" : "default"}
                        onClick={() => hints.startTutorial(tutorial.id)}
                        disabled={!canStart}
                      >
                        {isCompleted ? 'Replay' : 'Start'}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {[
                  {
                    title: "Daily Check-in Reminders",
                    description: "Get gentle nudges to reflect on your day"
                  },
                  {
                    title: "Community Updates",
                    description: "Stay connected with your circles"
                  },
                  {
                    title: "Growth Insights",
                    description: "Receive AI-powered insights about your journey"
                  },
                  {
                    title: "Weekly Reflections",
                    description: "Summary of your week's growth patterns"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">{item.title}</Label>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Profile Visibility</Label>
                    <p className="text-xs text-muted-foreground">
                      Control who can see your profile
                    </p>
                  </div>
                  <Select>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Public" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="circles">Circles Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Data Export</Label>
                    <p className="text-xs text-muted-foreground">
                      Download your growth data
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Database className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data & Privacy */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="w-5 h-5" />
                  Data & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Analytics & Insights</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow Bliss to analyze your conversations for insights
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Share Anonymous Usage Data</Label>
                    <p className="text-xs text-muted-foreground">
                      Help improve Growth Halo by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* AI Preferences */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5" />
                  AI Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Response Style</Label>
                    <p className="text-xs text-muted-foreground">
                      How Bliss communicates with you
                    </p>
                  </div>
                  <Select defaultValue="balanced">
                    <SelectTrigger className="w-full sm:w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Proactive Insights</Label>
                    <p className="text-xs text-muted-foreground">
                      Let Bliss surface insights without prompting
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Account Management */}
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-red-600 dark:text-red-400">
                  <Shield className="w-5 h-5" />
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Deactivate Account</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Temporarily disable your account. You can reactivate it anytime.
                    </p>
                    <Button variant="outline" className="text-amber-600 border-amber-300 hover:bg-amber-50">
                      Deactivate Account
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-1 text-red-600 dark:text-red-400">Delete Account</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Permanently delete your account and all data. This action cannot be undone.
                    </p>
                    <Button variant="destructive">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button className="w-full sm:w-auto">
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      </ResponsiveContainer>
    </div>
  );
}