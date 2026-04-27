import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import Navigation from "./components/Navigation";
import NotFound from "./pages/NotFound";
import ProjectDetails from "./pages/ProjectDetails";
import AcceptInvitation from "./pages/AcceptInvitation";
import ForgotPassword from "./pages/ForgotPassword";
import Analytics from "./pages/Analytics";
import AnalyticsPage from "./pages/AnalyticsPage";
import { ThemeProvider } from "./components/theme-provider";
import { useParams } from "react-router-dom";
import IssueDetail from "./components/IssueDetail";
import "./index.css";

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
            <Route path="/accept_invitation" element={<AcceptInvitation />} />            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
