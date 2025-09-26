import { motion } from "framer-motion";
import ValuesCompass from "../components/ValuesCompass";

export default function ValuesPage() {
  return (
    <motion.div 
      className="container mx-auto py-8 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light mb-4">Values Compass</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Navigate your decisions through authentic values. Explore what matters most 
            and discover how aligned your current life is with your deepest priorities.
          </p>
        </div>
        
        <ValuesCompass />
      </div>
    </motion.div>
  );
}