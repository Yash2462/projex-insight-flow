import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  ArrowLeft, 
  AlertTriangle,
  Search,
  Home
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[40%] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <Link to="/" className="flex items-center gap-3 group mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-all duration-500 group-hover:rotate-6">
          <Zap className="text-white h-6 w-6 fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-black tracking-tighter text-foreground leading-none">PROJEX</span>
        </div>
      </Link>

      <Card className="w-full max-w-lg border-primary/5 shadow-2xl rounded-[2.5rem] bg-card/60 backdrop-blur-xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-purple-600 to-primary/50" />
        
        <CardContent className="p-8 md:p-12 text-center space-y-8">
          <div className="relative">
            <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-3 ring-1 ring-primary/20">
               <Search className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-destructive rounded-full flex items-center justify-center text-white border-4 border-card shadow-lg animate-bounce">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-none opacity-20">404</h1>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase">Signal Lost</h2>
            <p className="text-sm md:text-base text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
              We've scanned the entire workspace but the route <code className="px-1.5 py-0.5 bg-primary/5 rounded font-bold text-primary">{location.pathname}</code> remains offline.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild variant="hero" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-glow">
              <Link to="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Return to Command Center
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 h-14 rounded-2xl border-primary/10 bg-primary/5 hover:bg-primary/10 font-black uppercase tracking-widest text-[10px] transition-all">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <p className="mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-30">
        &copy; 2026 PROJEX SYSTEMS. ERROR LOGGED IN THE VAULT.
      </p>
    </div>
  );
};

export default NotFound;
