import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ValuesCompass from "../components/ValuesCompass";
import ValuesAssessment from "../components/ValuesAssessment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer } from "@/components/ui/responsive-container";

interface AssessmentResults {
  valueUpdates: Array<{ id: string; newAlignment: number; newImportance: number }>;
  insights: string;
  conflictAreas: string[];
}

export default function ValuesPage() {
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentType, setAssessmentType] = useState<'quick' | 'deep'>('quick');
  const [lastAssessment, setLastAssessment] = useState<Date | null>(null);
  const [recentInsights, setRecentInsights] = useState<string[]>([
    "Your authenticity value has grown stronger over the past month",
    "There may be tension between freedom and security in your current decisions"
  ]);

  const handleAssessmentComplete = (results: AssessmentResults) => {
    console.log('Assessment completed:', results);
    setShowAssessment(false);
    setLastAssessment(new Date());
    // Here you would typically update the values data
  };

  const handleValuesAssessment = () => {
    setShowAssessment(true);
  };

  const handleDecisionSupport = (valueId: string) => {
    console.log('Decision support for value:', valueId);
    // This would open a decision support dialog
  };

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveContainer size="xl" className="py-4 sm:py-6 lg:py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 sm:space-y-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-light mb-4">Values Compass™</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Navigate your decisions through authentic values. Track how your values evolve 
              and receive AI-powered guidance for living in greater alignment.
            </p>
          </div>

          {/* Assessment Status Card */}
          <Card className="bg-gradient-to-r from-primary/5 to-renewal/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                Values Evolution Tracking
                <Badge variant="outline" className="text-xs">
                  {lastAssessment 
                    ? `Last check-in: ${lastAssessment.toLocaleDateString()}` 
                    : 'No recent assessment'
                  }
                </Badge>
              </CardTitle>
              <CardDescription>
                Regular check-ins help you stay aware of how your values are shifting and evolving
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentInsights.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium">Recent AI Insights</h4>
                  {recentInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-muted-foreground">{insight}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="default" 
                  onClick={() => {
                    setAssessmentType('quick');
                    handleValuesAssessment();
                  }}
                  className="hover-elevate"
                >
                  Quick Check-in (2 min)
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAssessmentType('deep');
                    handleValuesAssessment();
                  }}
                  className="hover-elevate"
                >
                  Deep Assessment (10 min)
                </Button>
              </div>
            </CardContent>
          </Card>

          <AnimatePresence mode="wait">
            {showAssessment ? (
              <motion.div
                key="assessment"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ValuesAssessment
                  type={assessmentType}
                  onComplete={handleAssessmentComplete}
                  onCancel={() => setShowAssessment(false)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="compass"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ValuesCompass 
                  onValuesAssessment={handleValuesAssessment}
                  onDecisionSupport={handleDecisionSupport}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </ResponsiveContainer>
    </div>
  );
}