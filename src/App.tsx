import { useEffect, lazy, Suspense } from "react";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import { PageLoader } from "./components/ui/loading";

// Global handler to catch unhandled promise rejections
const useGlobalErrorHandlers = () => {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("[Unhandled Rejection]", event.reason);
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error("[Uncaught Error]", event.error || event.message);
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);
};

// Eagerly loaded pages (critical path)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

// Lazy loaded pages (code splitting)
const WidgetPreview = lazy(() => import("./pages/WidgetPreview"));
const Analytics = lazy(() => import("./pages/Analytics"));
const TeamMembers = lazy(() => import("./pages/TeamMembers"));
const AISupport = lazy(() => import("./pages/AISupport"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Support = lazy(() => import("./pages/Support"));
const Salesforce = lazy(() => import("./pages/Salesforce"));
const Notifications = lazy(() => import("./pages/Notifications"));
const NotificationLogs = lazy(() => import("./pages/NotificationLogs"));
const SlackApp = lazy(() => import("./pages/SlackApp"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Documentation = lazy(() => import("./pages/Documentation"));
const DocPage = lazy(() => import("./pages/docs/DocPage"));
const WidgetEmbed = lazy(() => import("./pages/WidgetEmbed"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Demo = lazy(() => import("./pages/Demo"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Properties = lazy(() => import("./pages/Properties"));

// Lazy load DocsLayout
const DocsLayout = lazy(() => import("./components/docs/DocsLayout").then(m => ({ default: m.DocsLayout })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Route guard for clients only
const RequireClient = ({ children }: { children: React.ReactNode }) => {
  const { user, isClient, isAdmin, loading } = useAuth();
  useSessionTimeout();
  
  if (loading) return <PageLoader />;
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!isClient && !isAdmin) {
    return <Navigate to="/conversations" replace />;
  }
  
  return <>{children}</>;
};

// Route guard for agents only
const RequireAgent = ({ children }: { children: React.ReactNode }) => {
  const { user, isAgent, loading } = useAuth();
  
  if (loading) return <PageLoader />;
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!isAgent) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/conversations" element={<RequireAgent><AgentDashboard /></RequireAgent>} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Legacy redirects */}
        <Route
          path="/team-members"
          element={
            <RequireClient>
              <Navigate to="/dashboard/team" replace />
            </RequireClient>
          }
        />
        
        {/* Client routes */}
        <Route path="/dashboard" element={<RequireClient><Dashboard /></RequireClient>} />
        <Route path="/dashboard/active" element={<RequireClient><Dashboard /></RequireClient>} />
        <Route path="/dashboard/closed" element={<RequireClient><Dashboard /></RequireClient>} />
        <Route path="/dashboard/team" element={<RequireClient><TeamMembers /></RequireClient>} />
        <Route path="/dashboard/ai-support" element={<RequireClient><AISupport /></RequireClient>} />
        <Route path="/dashboard/properties" element={<RequireClient><Properties /></RequireClient>} />
        <Route path="/dashboard/analytics" element={<RequireClient><Analytics /></RequireClient>} />
        <Route path="/dashboard/widget" element={<RequireClient><WidgetPreview /></RequireClient>} />
        <Route path="/dashboard/salesforce" element={<RequireClient><Salesforce /></RequireClient>} />
        <Route path="/dashboard/notifications" element={<RequireClient><Notifications /></RequireClient>} />
        <Route path="/dashboard/notification-logs" element={<RequireClient><NotificationLogs /></RequireClient>} />
        <Route path="/dashboard/subscription" element={<RequireClient><Subscription /></RequireClient>} />
        <Route path="/dashboard/support" element={<RequireClient><Support /></RequireClient>} />
        
        <Route path="/widget-preview" element={<WidgetPreview />} />
        <Route path="/widget-embed/:propertyId" element={<WidgetEmbed />} />
        <Route path="/slack-app" element={<SlackApp />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        
        {/* Documentation routes */}
        <Route path="/documentation" element={<DocsLayout />}>
          <Route index element={<Documentation />} />
          <Route path=":section/:topic" element={<DocPage />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  useGlobalErrorHandlers();
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
