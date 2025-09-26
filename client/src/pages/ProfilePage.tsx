
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Edit, 
  Star,
  TrendingUp,
  Heart,
  MessageCircle,
  Users
} from "lucide-react";

export default function ProfilePage() {
  // Mock user data
  const user = {
    name: "Alex Chen",
    email: "alex@example.com",
    bio: "Exploring the cyclical nature of growth through mindful reflection and authentic connection. Currently in an expansion phase, embracing new challenges.",
    location: "San Francisco, CA",
    joinDate: "March 2024",
    avatar: null,
    currentPhase: "expansion",
    totalReflections: 127,
    circlesMember: 3,
    growthScore: 8.4
  };

  const achievements = [
    { title: "30-Day Streak", description: "Daily reflections", icon: "🔥" },
    { title: "Deep Thinker", description: "50+ journal entries", icon: "💭" },
    { title: "Community Builder", description: "Started 2 circles", icon: "🌱" },
    { title: "Growth Champion", description: "Helped 10 members", icon: "⭐" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveContainer size="lg" className="py-4 sm:py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto sm:mx-0">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-lg sm:text-xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold">{user.name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {user.joinDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {user.location}
                    </div>
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className={`w-fit mx-auto sm:mx-0 ${
                      user.currentPhase === 'expansion' 
                        ? 'bg-expansion/10 text-expansion border-expansion/20' 
                        : ''
                    }`}
                  >
                    Current Phase: {user.currentPhase}
                  </Badge>
                </div>
                
                <Button size="sm" className="w-full sm:w-auto">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm sm:text-base text-muted-foreground">
                  {user.bio}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-semibold">{user.growthScore}</div>
                <p className="text-sm text-muted-foreground">Growth Score</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-semibold">{user.totalReflections}</div>
                <p className="text-sm text-muted-foreground">Reflections</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-semibold">{user.circlesMember}</div>
                <p className="text-sm text-muted-foreground">Circles</p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{achievement.title}</div>
                      <div className="text-xs text-muted-foreground">{achievement.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Completed daily check-in", time: "2 hours ago" },
                  { action: "Joined 'Mindful Leaders' circle", time: "1 day ago" },
                  { action: "Wrote a reflection on growth phases", time: "3 days ago" },
                  { action: "Helped a community member", time: "1 week ago" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm">{item.action}</span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </ResponsiveContainer>
    </div>
  );
}
