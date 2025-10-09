import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navigation from "@/components/Navigation";
import { HintsProvider } from "@/components/HintsProvider";
import Home from "@/pages/Home";
import ValuesPage from "./pages/ValuesPage";
import CheckInPage from "./pages/CheckInPage";
import CommunityPage from "./pages/CommunityPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from './pages/DashboardPage';
import JournalPage from "@/pages/JournalPage";
import IntentionsPage from "./pages/IntentionsPage";
import PricingPage from "@/pages/PricingPage";
import NotFound from "@/pages/not-found";
import { queryClient } from "./lib/queryClient";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import EventsPage from './pages/EventsPage';
import ContentPage from './pages/ContentPage';
import AnalyticsPage from "./pages/AnalyticsPage";
import LandingPage from "./pages/LandingPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import FAQPage from "./pages/FAQPage";
import GoalsPage from "./pages/GoalsPage";
import PersonalityTestPage from "./pages/PersonalityTestPage";
import PatternsPage from './pages/PatternsPage';
import IdeasPage from './pages/IdeasPage';
import WisdomPage from "./pages/WisdomPage";
import APIPage from "./pages/APIPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/api" component={APIPage} />
      <Route path="/chat" component={Home} />
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
      <Route path="/events" component={EventsPage} />
      <Route path="/content" component={ContentPage} />
      <Route path="/goals" component={GoalsPage} />
      <Route path="/patterns" component={PatternsPage} />
      <Route path="/ideas" component={IdeasPage} />
      <Route path="/wisdom" component={WisdomPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/personality" component={PersonalityTestPage} />
      <Route path="/subscription" component={SubscriptionPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/faq" component={FAQPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  //todo: remove mock functionality - get real user phase data from backend
  const currentPhase = "expansion" as const;
  const phaseConfidence = 75;

  // Get current location to determine if sidebar should be shown
  const [location] = useLocation();
  const showSidebar = !["/", "/login", "/register", "/faq"].includes(location);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="bliss-theme">
        <TooltipProvider>
          <HintsProvider>
            <div className="min-h-screen bg-background text-foreground">
              {showSidebar && (
                <Navigation
                  currentPhase={currentPhase}
                  phaseConfidence={phaseConfidence}
                />
              )}
              {/* Main content area with conditional left margin for sidebar */}
              <main className={showSidebar ? "pl-64 transition-all duration-300" : ""}>
                <Router />
              </main>
            </div>
            <Toaster />
          </HintsProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;