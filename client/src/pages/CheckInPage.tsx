import { motion } from "framer-motion";
import DailyCheckIn from "../components/DailyCheckIn";

//todo: remove mock functionality - replace with real user phase data
export default function CheckInPage() {
  const handleCheckInComplete = (data: any) => {
    console.log('Check-in completed:', data);
    // todo: save to backend
  };

  return (
    <motion.div 
      className="container mx-auto py-8 px-4 min-h-[calc(100vh-73px)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <DailyCheckIn 
        currentPhase="contraction"
        onComplete={handleCheckInComplete}
      />
    </motion.div>
  );
}