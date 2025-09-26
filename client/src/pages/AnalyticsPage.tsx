
import { motion } from "framer-motion";
import AnalyticsDashboard from "../components/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <motion.div 
      className="container mx-auto py-6 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <AnalyticsDashboard userId="demo-user" />
    </motion.div>
  );
}
