import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Navigation from "./components/Navigation";
import NotFound from "./pages/NotFound";

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
                <div className="min-h-screen bg-background lg:ml-64 p-8">
                  <h1 className="text-3xl font-bold text-foreground">Projects</h1>
                  <p className="text-muted-foreground mt-2">Coming soon - Project management interface</p>
                </div>
              </>
            } 
          />
          <Route 
            path="/team" 
            element={
              <>
                <Navigation />
                <div className="min-h-screen bg-background lg:ml-64 p-8">
                  <h1 className="text-3xl font-bold text-foreground">Team</h1>
                  <p className="text-muted-foreground mt-2">Coming soon - Team management interface</p>
                </div>
              </>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <>
                <Navigation />
                <div className="min-h-screen bg-background lg:ml-64 p-8">
                  <h1 className="text-3xl font-bold text-foreground">Messages</h1>
                  <p className="text-muted-foreground mt-2">Coming soon - Team chat interface</p>
                </div>
              </>
            } 
          />
          <Route 
            path="/subscription" 
            element={
              <>
                <Navigation />
                <div className="min-h-screen bg-background lg:ml-64 p-8">
                  <h1 className="text-3xl font-bold text-foreground">Subscription</h1>
                  <p className="text-muted-foreground mt-2">Coming soon - Subscription management</p>
                </div>
              </>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <>
                <Navigation />
                <div className="min-h-screen bg-background lg:ml-64 p-8">
                  <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                  <p className="text-muted-foreground mt-2">Coming soon - User settings</p>
                </div>
              </>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
