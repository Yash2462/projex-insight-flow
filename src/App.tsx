import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { useParams } from "react-router-dom";
import Navigation from "./components/Navigation";
import { 
  AppLayoutSkeleton, 
  DashboardSkeleton, 
  ProjectsPageSkeleton, 
  ProjectDetailsSkeleton, 
  AnalyticsSkeleton 
} from "./components/PageSkeletons";
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
          <Routes>
            <Route path="/" element={<Suspense fallback={<AppLayoutSkeleton />}><Index /></Suspense>} />
            <Route path="/login" element={<Suspense fallback={<AppLayoutSkeleton />}><Login /></Suspense>} />
            <Route path="/signup" element={<Suspense fallback={<AppLayoutSkeleton />}><Signup /></Suspense>} />
            <Route path="/forgot-password" element={<Suspense fallback={<AppLayoutSkeleton />}><ForgotPassword /></Suspense>} />
            
            <Route 
              path="/dashboard" 
              element={
                <>
                  <Navigation />
                  <Suspense fallback={<DashboardSkeleton />}>
                    <Dashboard />
                  </Suspense>
                </>
              } 
            />
            <Route 
              path="/projects" 
              element={
                <>
                  <Navigation />
                  <Suspense fallback={<ProjectsPageSkeleton />}>
                    <Projects />
                  </Suspense>
                </>
              } 
            />
            <Route 
              path="/subscription" 
              element={
                <>
                  <Navigation />
                  <Suspense fallback={<AppLayoutSkeleton />}>
                    <Subscription />
                  </Suspense>
                </>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <>
                  <Navigation />
                  <Suspense fallback={<AnalyticsSkeleton />}>
                    <AnalyticsPage />
                  </Suspense>
                </>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <>
                  <Navigation />
                  <Suspense fallback={<AppLayoutSkeleton />}>
                    <Settings />
                  </Suspense>
                </>
              } 
            />
            <Route 
              path="/projects/:id" 
              element={
                <>
                  <Navigation />
                  <Suspense fallback={<ProjectDetailsSkeleton />}>
                    <ProjectDetails />
                  </Suspense>
                </>
              } 
            />
            <Route 
              path="/projects/:id/analytics" 
              element={
                <>
                  <Navigation />
                  <Suspense fallback={<AnalyticsSkeleton />}>
                    <Analytics />
                  </Suspense>
                </>
              } 
            />
            <Route 
              path="/projects/:projectId/issues/:issueId" 
              element={
                <>
                  <Navigation />
                  <div className="md:ml-64 p-4 lg:p-8 min-h-screen bg-background">
                    <Suspense fallback={<AppLayoutSkeleton />}>
                      <IssueDetailWrapper />
                    </Suspense>
                  </div>
                </>
              } 
            />
            <Route path="/accept_invitation" element={<Suspense fallback={<AppLayoutSkeleton />}><AcceptInvitation /></Suspense>} />
            <Route path="*" element={<Suspense fallback={<AppLayoutSkeleton />}><NotFound /></Suspense>} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
