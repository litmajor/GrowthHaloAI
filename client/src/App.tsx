import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navigation from "@/components/Navigation";
import Home from "@/pages/Home";
import ValuesPage from "./pages/ValuesPage";
import CheckInPage from "./pages/CheckInPage";
import CommunityPage from "./pages/CommunityPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import JournalPage from "@/pages/JournalPage";
import IntentionsPage from "./pages/IntentionsPage";
import PricingPage from "./pages/PricingPage";
import NotFound from "@/pages/not-found";
import { queryClient } from "./lib/queryClient";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import EventsPage from './pages/EventsPage';
import ContentPage from './pages/ContentPage';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/compass" component={ValuesPage} />
      <Route path="/values" component={ValuesPage} />
      <Route path="/community" component={CommunityPage} />
      <Route path="/checkin" component={CheckInPage} />
      <Route path="/journal" component={JournalPage} />
      <Route path="/intentions" component={IntentionsPage} />
      <Route path="/home" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/content" component={ContentPage} />
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