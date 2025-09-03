import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import Messages from "./pages/Messages";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import Navigation from "./components/Navigation";
import NotFound from "./pages/NotFound";
import ProjectDetails from "./pages/ProjectDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
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
            path="/team" 
            element={
              <>
                <Navigation />
                <Team />
              </>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <>
                <Navigation />
                <Messages />
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
            path="/settings" 
            element={
              <>
                <Navigation />
                <Settings />
              </>
            } 
          />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
