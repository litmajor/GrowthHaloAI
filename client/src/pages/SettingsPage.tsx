import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Globe,
  Database,
  Moon,
  Sun,
  Monitor
} from "lucide-react";

export default function SettingsPage() {
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

            {/* Notification Settings */}
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