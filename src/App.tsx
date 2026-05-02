import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { useParams } from "react-router-dom";
import Navigation from "./components/Navigation";
import { Loader2 } from "lucide-react";
import "./index.css";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects = lazy(() => import("./pages/Projects"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const IssueDetail = lazy(() => import("./components/IssueDetail"));

const queryClient = new QueryClient();

// Page Loader
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const IssueDetailWrapper = () => {
  const { issueId } = useParams();
  if (!issueId) return null;
  return <IssueDetail issueId={parseInt(issueId)} issueName="" isFullPage={true} />;
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="projex-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route 
                path="/dashboard" 
                element={
                  <>
                    <Navigation />
                    <Dashboard />
                  </>
                } 
              />
              <Route 
                path="/projects" 
                element={
                  <>
                    <Navigation />
                    <Projects />
                  </>
                } 
              />
              <Route 
                path="/subscription" 
                element={
                  <>
                    <Navigation />
                    <Subscription />
                  </>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <>
                    <Navigation />
                    <AnalyticsPage />
                  </>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <>
                    <Navigation />
                    <Settings />
                  </>
                } 
              />
              <Route 
                path="/projects/:id" 
                element={
                  <>
                    <Navigation />
                    <ProjectDetails />
                  </>
                } 
              />
              <Route 
                path="/projects/:id/analytics" 
                element={
                  <>
                    <Navigation />
                    <Analytics />
                  </>
                } 
              />
              <Route 
                path="/projects/:projectId/issues/:issueId" 
                element={
                  <>
                    <Navigation />
                    <div className="lg:ml-64 p-4 lg:p-8 min-h-screen bg-background">
                      <IssueDetailWrapper />
                    </div>
                  </>
                } 
              />
              <Route path="/accept_invitation" element={<AcceptInvitation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
