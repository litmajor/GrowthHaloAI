
import { motion } from "framer-motion";
import GrowthJournal from "../components/GrowthJournal";

//todo: remove mock functionality - replace with real user phase data
export default function JournalPage() {
  return (
    <motion.div 
      className="container mx-auto py-8 px-4 min-h-[calc(100vh-73px)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <GrowthJournal currentPhase="contraction" />
    </motion.div>
  );
}
