import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navigation from "@/components/Navigation";
import Home from "@/pages/Home";
import ValuesPage from "@/pages/ValuesPage";
import CheckInPage from "@/pages/CheckInPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/compass" component={ValuesPage} />
      <Route path="/checkin" component={CheckInPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  //todo: remove mock functionality - get real user phase data from backend
  const currentPhase = "expansion" as const;
  const phaseConfidence = 75;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="bliss-theme">
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Navigation 
              currentPhase={currentPhase}
              phaseConfidence={phaseConfidence}
            />
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
