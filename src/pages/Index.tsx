import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Users, 
  MessageSquare, 
  BarChart3,
  Zap,
  Shield,
  Play,
  Layers,
  Sparkles,
  ChevronRight,
  Globe,
  Rocket
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Pulse Collaboration",
      description: "Sync with your squad instantly. Real-time updates keep everyone on the same beat.",
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      icon: Layers,
      title: "Stratosphere View",
      description: "Zoom from high-level roadmaps down to the smallest task detail in a click.",
      color: "bg-purple-500/10 text-purple-500"
    },
    {
      icon: MessageSquare,
      title: "Contextual Chat",
      description: "Discussion lives where work happens. No more digging through threads.",
      color: "bg-emerald-500/10 text-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Velocity Engine",
      description: "Data-driven insights that predict bottlenecks before they slow you down.",
      color: "bg-amber-500/10 text-amber-500"
    },
    {
      icon: Zap,
      title: "Flow Automations",
      description: "Let ProjeX handle the busywork while you focus on the breakthroughs.",
      color: "bg-rose-500/10 text-rose-500"
    },
    {
      icon: Shield,
      title: "Vault Security",
      description: "Enterprise-grade encryption for your most sensitive project data.",
      color: "bg-cyan-500/10 text-cyan-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-primary/5 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-all duration-500 group-hover:rotate-6">
                <Zap className="text-white h-5 w-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-foreground leading-none">PROJEX</span>
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase mt-0.5">Insight Flow</span>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-10">
              <a href="#features" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Strategy</a>
              <a href="#pricing" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Investment</a>
              <Link to="/login" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Sign In</Link>
              <ThemeToggle />
              <Link to="/signup">
                <Button variant="hero" className="font-black text-[11px] uppercase tracking-widest rounded-xl h-11 px-8 transition-all active:scale-95">
                  Launch App
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-12">
            <div className={`space-y-6 max-w-4xl transform transition-all duration-1000 translate-y-0 opacity-100`}>
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest animate-bounce">
                <Sparkles className="h-3 w-3 mr-2 fill-current" /> Next-Gen Workflow Orchestration
              </Badge>
              <h1 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-foreground">
                Design Your <span className="text-gradient">Success</span><br />
                Accelerate Your <span className="italic">Impact</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                Elevate your team with a project management experience that feels like magic. ProjeX Insight Flow transforms chaos into clarity.
              </p>
            </div>
            
            <div className={`flex flex-col sm:flex-row gap-6 transform transition-all duration-1000 delay-200 translate-y-0 opacity-100`}>
              <Link to="/signup">
                <Button size="lg" className="h-16 px-10 rounded-[2rem] bg-primary text-primary-foreground font-black uppercase tracking-[0.15em] text-xs shadow-glow hover:scale-105 transition-all">
                  Start Building Free
                  <ArrowRight className="h-4 w-4 ml-3 stroke-[3]" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-16 px-10 rounded-[2rem] border-primary/10 font-black uppercase tracking-[0.15em] text-xs hover:bg-primary/5 transition-all">
                <Play className="h-4 w-4 mr-3 fill-current" />
                Live Transmission
              </Button>
            </div>

            <div className={`w-full max-w-6xl mt-16 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
               <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-50" />
                  <div className="relative bg-card rounded-[2.5rem] border border-primary/5 shadow-2xl overflow-hidden">
                    <img 
                      src={heroImage} 
                      alt="ProjeX Interface" 
                      className="w-full opacity-90 group-hover:scale-[1.02] transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section className="py-20 border-y border-primary/5 bg-muted/5">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-center text-muted-foreground/40 mb-12">Orchestrating growth at global scale</p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-30 grayscale invert dark:invert-0">
             <div className="text-2xl font-black italic tracking-tighter">VOLT</div>
             <div className="text-2xl font-black italic tracking-tighter">NEXUS</div>
             <div className="text-2xl font-black italic tracking-tighter">ORBIT</div>
             <div className="text-2xl font-black italic tracking-tighter">PULSE</div>
             <div className="text-2xl font-black italic tracking-tighter">CORE</div>
          </div>
        </div>
      </section>

      {/* Strategy Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl space-y-6">
              <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-foreground leading-none">
                Built for the <br />
                <span className="text-primary italic">High-Performance</span> Squad
              </h2>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                Everything you need to orchestrate complex projects without the friction of traditional tools.
              </p>
            </div>
            <div className="pb-4">
               <Button variant="ghost" className="font-black text-xs uppercase tracking-widest group">
                 Explore Ecosystem <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
               </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group p-8 rounded-[2.5rem] bg-card border border-primary/5 hover:border-primary/20 hover:shadow-glow transition-all duration-500">
                  <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight mb-4 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-4xl mx-auto relative group">
           <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-[3.5rem] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
           <div className="relative bg-gradient-to-br from-primary to-purple-700 rounded-[3.5rem] p-12 lg:p-24 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative space-y-10">
                 <h2 className="text-4xl lg:text-7xl font-black tracking-tighter text-white leading-[0.9]">
                   Ready to <span className="italic opacity-80">Synchronize</span> Your Vision?
                 </h2>
                 <p className="text-xl text-white/70 font-medium leading-relaxed">
                   Join 15,000+ teams who have upgraded their project velocity with ProjeX. Your next breakthrough starts here.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-6 pt-4 justify-center">
                    <Link to="/signup">
                      <Button size="lg" className="h-16 px-10 rounded-2xl bg-white text-primary font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">
                        Initiate Launch
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-white/20 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
                      Consult Strategist
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-primary/5 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-16 lg:gap-32 mb-20">
            <div className="space-y-8 col-span-1 md:col-span-1 text-left">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                  <Zap className="text-white h-5 w-5 fill-current" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter text-foreground leading-none">PROJEX</span>
                </div>
              </Link>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xs">
                The high-performance orchestration engine for modern development teams.
              </p>
              <div className="flex items-center gap-4 text-muted-foreground">
                <Globe className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
                <Rocket className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
                <Shield className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
              </div>
            </div>
            
            <div className="space-y-6 text-left">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground opacity-40">System</h3>
              <ul className="space-y-4 text-sm font-bold">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Core Engine</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Ecosystem</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Roadmap</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div className="space-y-6 text-left">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground opacity-40">Resources</h3>
              <ul className="space-y-4 text-sm font-bold">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">API Intel</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div className="space-y-6 text-left">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground opacity-40">Entity</h3>
              <ul className="space-y-4 text-sm font-bold">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Vision</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Network</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Legal</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
              &copy; 2026 PROJEX SYSTEMS. ALL TRANSMISSIONS SECURED.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
