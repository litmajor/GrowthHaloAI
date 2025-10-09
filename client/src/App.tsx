import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { HintsProvider } from "@/components/HintsProvider";
import { ContextualHelpWidget } from "@/components/ContextualHelpWidget";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import '@/lib/i18n';
import Navigation from "@/components/Navigation";
import { queryClient } from "./lib/queryClient";
import { useState, useEffect, lazy, Suspense } from "react";
import { CardSkeleton } from "@/components/ui/skeleton";

// Lazy load all page components for better code splitting
const Home = lazy(() => import("@/pages/Home"));
const ValuesPage = lazy(() => import("./pages/ValuesPage"));
const CheckInPage = lazy(() => import("./pages/CheckInPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const JournalPage = lazy(() => import("@/pages/JournalPage"));
const IntentionsPage = lazy(() => import("./pages/IntentionsPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const NotFound = lazy(() => import("@/pages/not-found"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const ContentPage = lazy(() => import('./pages/ContentPage'));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const GoalsPage = lazy(() => import("./pages/GoalsPage"));
const PersonalityTestPage = lazy(() => import("./pages/PersonalityTestPage"));
const PatternsPage = lazy(() => import('./pages/PatternsPage'));
const IdeasPage = lazy(() => import('./pages/IdeasPage'));
const WisdomPage = lazy(() => import("./pages/WisdomPage"));
const APIPage = lazy(() => import("./pages/APIPage"));
const OnboardingFlow = lazy(() => import("@/components/OnboardingFlow"));
// Assuming CheckoutSuccess and CheckoutCancel are defined elsewhere or will be added
// import CheckoutSuccess from "@/pages/CheckoutSuccess";
// import CheckoutCancel from "@/pages/CheckoutCancel";

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center p-8">
    <div className="w-full max-w-4xl space-y-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn && !hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  //todo: remove mock functionality - get real user phase data from backend
  const currentPhase = "expansion" as const;
  const phaseConfidence = 75;

  // Get current location to determine if sidebar should be shown
  const [location] = useLocation();
  const showSidebar = !["/", "/login", "/register", "/faq"].includes(location);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="growth-halo-theme">
        <AccessibilityProvider>
          {showOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} />}
          <HintsProvider>
            <TooltipProvider>
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
            <ContextualHelpWidget />
            <Toaster />
          </TooltipProvider>
        </HintsProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;