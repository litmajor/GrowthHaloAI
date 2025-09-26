import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Value {
  id: string;
  name: string;
  importance: number; // 1-10
  alignment: number; // 1-10
  angle: number; // position on compass
}

interface ValuesCompassProps {
  values?: Value[];
  onValueUpdate?: (valueId: string, field: 'importance' | 'alignment', value: number) => void;
}

const defaultValues: Value[] = [
  { id: '1', name: 'Authenticity', importance: 9, alignment: 7, angle: 0 },
  { id: '2', name: 'Growth', importance: 8, alignment: 8, angle: 45 },
  { id: '3', name: 'Connection', importance: 7, alignment: 6, angle: 90 },
  { id: '4', name: 'Purpose', importance: 9, alignment: 5, angle: 135 },
  { id: '5', name: 'Balance', importance: 6, alignment: 7, angle: 180 },
  { id: '6', name: 'Creativity', importance: 7, alignment: 8, angle: 225 },
  { id: '7', name: 'Service', importance: 8, alignment: 6, angle: 270 },
  { id: '8', name: 'Freedom', importance: 8, alignment: 9, angle: 315 }
];

export default function ValuesCompass({ 
  values = defaultValues,
  onValueUpdate 
}: ValuesCompassProps) {
  const [selectedValue, setSelectedValue] = useState<Value | null>(null);
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);

  const handleValueClick = (value: Value) => {
    setSelectedValue(value);
    console.log('Value selected:', value.name);
  };

  const getValuePosition = (angle: number, radius: number) => {
    const radians = (angle - 90) * (Math.PI / 180);
    const x = Math.cos(radians) * radius;
    const y = Math.sin(radians) * radius;
    return { x, y };
  };

  const getAlignmentColor = (alignment: number) => {
    if (alignment >= 8) return "text-renewal bg-renewal/20";
    if (alignment >= 6) return "text-expansion bg-expansion/20";  
    return "text-contraction bg-contraction/20";
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          Values Compass
        </CardTitle>
        <CardDescription>
          Navigate life decisions through your authentic values. 
          Larger circles represent higher importance.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Compass Visualization */}
          <div className="relative">
            <div className="relative w-80 h-80 mx-auto">
              {/* Compass background circles */}
              {[1, 2, 3, 4].map(ring => (
                <div
                  key={ring}
                  className={cn(
                    "absolute border border-muted-foreground/20 rounded-full",
                    "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  )}
                  style={{
                    width: `${ring * 60}px`,
                    height: `${ring * 60}px`
                  }}
                />
              ))}

              {/* Cardinal directions */}
              <div className="absolute inset-0 text-xs text-muted-foreground">
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">Purpose</div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">Freedom</div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">Growth</div>
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">Security</div>
              </div>

              {/* Values as positioned circles */}
              {values.map(value => {
                const radius = (value.alignment / 10) * 140; // Max radius 140px
                const size = (value.importance / 10) * 40 + 20; // Size 20-60px
                const position = getValuePosition(value.angle, radius);
                
                return (
                  <motion.div
                    key={value.id}
                    className={cn(
                      "absolute rounded-full border-2 cursor-pointer",
                      "flex items-center justify-center text-xs font-medium",
                      "transition-all duration-300 hover:shadow-lg",
                      getAlignmentColor(value.alignment),
                      selectedValue?.id === value.id && "ring-2 ring-primary ring-offset-2",
                      hoveredValue === value.id && "scale-110"
                    )}
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      left: `calc(50% + ${position.x}px)`,
                      top: `calc(50% + ${position.y}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => handleValueClick(value)}
                    onMouseEnter={() => setHoveredValue(value.id)}
                    onMouseLeave={() => setHoveredValue(null)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    data-testid={`value-${value.name.toLowerCase()}`}
                  >
                    <span className="text-center leading-tight px-1">
                      {value.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Value Details Panel */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Your Values</h3>
              <p className="text-sm text-muted-foreground">
                Click a value to explore how it guides your decisions
              </p>
            </div>

            {selectedValue ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-lg border bg-card/50">
                  <h4 className="font-medium text-lg mb-2">{selectedValue.name}</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Importance</span>
                        <Badge variant="outline">{selectedValue.importance}/10</Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div 
                          className="h-2 bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedValue.importance * 10}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Current Alignment</span>
                        <Badge 
                          variant="outline" 
                          className={getAlignmentColor(selectedValue.alignment)}
                        >
                          {selectedValue.alignment}/10
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div 
                          className={cn(
                            "h-2 rounded-full",
                            selectedValue.alignment >= 8 ? "bg-renewal" :
                            selectedValue.alignment >= 6 ? "bg-expansion" : "bg-contraction"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedValue.alignment * 10}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    {selectedValue.alignment < 6 && 
                      "This value may need more attention in your daily choices."
                    }
                    {selectedValue.alignment >= 6 && selectedValue.alignment < 8 && 
                      "You're living this value fairly well, with room for deeper alignment."
                    }
                    {selectedValue.alignment >= 8 && 
                      "You're living in strong alignment with this value."
                    }
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => console.log('Explore value decisions:', selectedValue.name)}
                  className="w-full hover-elevate"
                  data-testid="button-explore-value"
                >
                  Explore Decision-Making with {selectedValue.name}
                </Button>
              </motion.div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p className="mb-4">Click a value on the compass to explore it</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {values.slice(0, 4).map(value => (
                    <Badge 
                      key={value.id}
                      variant="outline" 
                      className="cursor-pointer hover-elevate"
                      onClick={() => handleValueClick(value)}
                    >
                      {value.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}