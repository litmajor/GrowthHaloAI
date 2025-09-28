
import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Trophy, Target, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  weeklyGoal: number;
  thisWeekCheckIns: number;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedDate?: Date;
  }>;
}

export default function StreakTracker({
  currentStreak,
  longestStreak,
  totalCheckIns,
  weeklyGoal,
  thisWeekCheckIns,
  achievements
}: StreakTrackerProps) {
  const weeklyProgress = (thisWeekCheckIns / weeklyGoal) * 100;
  const earnedAchievements = achievements.filter(a => a.earned);
  const nextMilestone = [7, 14, 30, 60, 100, 365].find(milestone => milestone > currentStreak);

  return (
    <div className="space-y-4">
      {/* Current Streak */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className={`w-8 h-8 ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
          <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            {currentStreak}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Day streak • Best: {longestStreak} days
        </p>
        {nextMilestone && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {nextMilestone - currentStreak} days to next milestone
          </p>
        )}
      </motion.div>

      {/* Weekly Progress */}
      <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            This Week's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{thisWeekCheckIns} of {weeklyGoal} check-ins</span>
              <span>{Math.round(weeklyProgress)}%</span>
            </div>
            <Progress value={weeklyProgress} className="h-2" />
            {thisWeekCheckIns >= weeklyGoal && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <Trophy className="w-4 h-4" />
                <span>Weekly goal achieved! 🎉</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {totalCheckIns}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Total Check-ins
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {earnedAchievements.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Achievements
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {earnedAchievements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {earnedAchievements.slice(-3).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{achievement.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {achievement.description}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    New!
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
