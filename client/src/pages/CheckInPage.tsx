import { motion } from "framer-motion";
import DailyCheckIn from "../components/DailyCheckIn";
// Assuming StreakTracker component is in the same directory or can be imported
// import StreakTracker from "../components/StreakTracker"; 

// Mock StreakTracker component for now if not defined elsewhere
const StreakTracker = ({ currentStreak, longestStreak, totalCheckIns, achievements }) => (
  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <div className="flex justify-between items-center mb-4">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Streak</p>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentStreak}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">days</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Longest Streak</p>
        <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200">{longestStreak}</p>
      </div>
    </div>
    <div className="border-t pt-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Achievements</h3>
      <div className="space-y-3">
        {achievements.map((ach) => (
          <div key={ach.id} className={`flex items-center p-3 rounded-md ${ach.earned ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
            <span className="text-xl mr-3">{ach.icon}</span>
            <div>
              <p className={`text-sm font-semibold ${ach.earned ? 'text-green-800 dark:text-green-300' : 'text-gray-800 dark:text-gray-200'}`}>
                {ach.name}
              </p>
              <p className={`text-xs ${ach.earned ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
                {ach.description}
              </p>
              {ach.earned && <p className="text-xs text-green-600 dark:text-green-400">Earned on: {ach.earnedDate.toLocaleDateString()}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);


//todo: remove mock functionality - replace with real user phase data
export default function CheckInPage() {
  const handleCheckInComplete = (data: any) => {
    console.log('Check-in completed:', data);
    // todo: save to backend
  };

  // Mock gamification data - would come from API
  const gamificationData = {
    currentStreak: 12,
    longestStreak: 45,
    totalCheckIns: 89,
    weeklyGoal: 7,
    thisWeekCheckIns: 5,
    achievements: [
      {
        id: "first-week",
        name: "First Week",
        description: "Complete 7 consecutive check-ins",
        icon: "🗓️",
        earned: true,
        earnedDate: new Date("2024-01-15")
      },
      {
        id: "mindful-month",
        name: "Mindful Month",
        description: "Check in for 30 days straight",
        icon: "🧘",
        earned: false
      },
      {
        id: "growth-guru",
        name: "Growth Guru",
        description: "Complete 100 total check-ins",
        icon: "🌱",
        earned: false
      }
    ]
  };

  return (
    <motion.div 
      className="container mx-auto py-8 px-4 min-h-[calc(100vh-73px)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Check-in */}
        <div className="lg:col-span-2">
          <DailyCheckIn 
            currentPhase="contraction"
            onComplete={handleCheckInComplete}
          />
        </div>

        {/* Gamification Sidebar */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Your Growth Journey
            </h2>
            <StreakTracker {...gamificationData} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}