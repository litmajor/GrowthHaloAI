
import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, Palette, Database, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    dailyReminders: false,
    communityActivity: true,
    growthInsights: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    growthDataVisible: false,
    allowMatching: true
  });

  return (
    <motion.div
      className="container mx-auto py-8 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-light mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Growth Halo experience
          </p>
        </div>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Choose how Growth Halo looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-light">Light</Label>
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                Light
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-dark">Dark</Label>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                Dark
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-system">System</Label>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
              >
                System
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Control what updates you receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-updates">Email Updates</Label>
                <p className="text-sm text-muted-foreground">Weekly growth insights and updates</p>
              </div>
              <Switch
                id="email-updates"
                checked={notifications.emailUpdates}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, emailUpdates: checked})
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="daily-reminders">Daily Check-in Reminders</Label>
                <p className="text-sm text-muted-foreground">Gentle nudges for daily reflection</p>
              </div>
              <Switch
                id="daily-reminders"
                checked={notifications.dailyReminders}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, dailyReminders: checked})
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="community-activity">Community Activity</Label>
                <p className="text-sm text-muted-foreground">Updates from your circles and connections</p>
              </div>
              <Switch
                id="community-activity"
                checked={notifications.communityActivity}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, communityActivity: checked})
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="growth-insights">Growth Insights</Label>
                <p className="text-sm text-muted-foreground">AI-powered personalized recommendations</p>
              </div>
              <Switch
                id="growth-insights"
                checked={notifications.growthInsights}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, growthInsights: checked})
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy
            </CardTitle>
            <CardDescription>
              Control your data sharing and visibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profile-visible">Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
              </div>
              <Switch
                id="profile-visible"
                checked={privacy.profileVisible}
                onCheckedChange={(checked) => 
                  setPrivacy({...privacy, profileVisible: checked})
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="growth-data-visible">Growth Data Sharing</Label>
                <p className="text-sm text-muted-foreground">Share anonymized insights for research</p>
              </div>
              <Switch
                id="growth-data-visible"
                checked={privacy.growthDataVisible}
                onCheckedChange={(checked) => 
                  setPrivacy({...privacy, growthDataVisible: checked})
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow-matching">Smart Matching</Label>
                <p className="text-sm text-muted-foreground">Allow AI to suggest compatible connections</p>
              </div>
              <Switch
                id="allow-matching"
                checked={privacy.allowMatching}
                onCheckedChange={(checked) => 
                  setPrivacy({...privacy, allowMatching: checked})
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export or delete your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Export My Data
            </Button>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-destructive">Danger Zone</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
              <Button variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
