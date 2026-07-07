import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Users, MessageSquare, BarChart3,
  Zap, Shield, Play, Layers, Sparkles, ChevronRight, Globe, Rocket, CheckCircle2
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import heroImage from "@/assets/hero-image.jpg";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const Index = () => {
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroRotateX = useTransform(scrollYProgress, [0, 1], [0, 15]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Real-time sync",
      description: "Collaborate seamlessly with your entire team. Changes push instantly to everyone via WebSockets.",
    },
    {
      icon: Layers,
      title: "Infinite nesting",
      description: "Break down complex projects into manageable tasks, subtasks, and sub-subtasks with our ultra-fast tree architecture.",
    },
    {
      icon: MessageSquare,
      title: "Inline discussions",
      description: "Keep context where it belongs. Discuss tasks directly within their dedicated threads and never lose context.",
    },
    {
      icon: BarChart3,
      title: "Advanced analytics",
      description: "Track velocity, identify bottlenecks, and forecast project completion with our AI-powered insights engine.",
    },
    {
      icon: Zap,
      title: "Automated workflows",
      description: "Set up complex triggers and actions to automate repetitive tasks and save your engineering team hundreds of hours.",
    },
    {
      icon: Shield,
      title: "Enterprise security",
      description: "Bank-grade AES-256 encryption and granular role-based access control out of the box. SOC2 compliant infrastructure.",
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      
      {/* Premium Floating Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled ? 'py-3 bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/50 text-white flex items-center justify-center shadow-lg group-hover:shadow-primary/25 group-hover:scale-105 transition-all duration-300">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight">ProjeX</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              <a href="#features" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-all">Features</a>
              <a href="#pricing" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-all">Pricing</a>
              <a href="#customers" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-all">Customers</a>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <Link to="/login" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2">
                Log in
              </Link>
              <Link to="/signup">
                <Button className="h-10 px-5 rounded-full font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      <main ref={containerRef} className="flex flex-col items-center">
        {/* Animated Hero Section - 2 Column Layout */}
        <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none overflow-hidden">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px]" 
            />
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8 z-10 w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[70vh]">
              
              {/* Left Column: Text & CTA */}
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-8 flex flex-col items-start text-left pt-10 lg:pt-0"
              >
                <motion.div variants={fadeIn} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium backdrop-blur-md hover:bg-primary/10 transition-colors cursor-pointer">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
                  <span className="text-primary mr-2 font-semibold">ProjeX OS 2.0 is now live</span>
                  <ChevronRight className="h-4 w-4 text-primary/50" />
                </motion.div>

                <motion.h1 variants={fadeIn} className="text-[2.5rem] leading-[1.1] sm:text-5xl lg:text-[5rem] xl:text-[5.5rem] font-bold tracking-tighter text-balance">
                  Orchestrate work with <br className="hidden sm:block"/>
                  <span className="relative whitespace-nowrap">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                      absolute precision.
                    </span>
                  </span>
                </motion.h1>
                
                <motion.p variants={fadeIn} className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-lg font-medium leading-relaxed text-balance">
                  The most powerful project management ecosystem ever built. Designed for teams who demand extreme velocity.
                </motion.p>
                
                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                  <Link to="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto h-12 md:h-14 px-8 rounded-full font-bold text-sm md:text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300">
                      Start Building Free <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 md:h-14 px-8 rounded-full font-bold text-sm md:text-base border-border/50 bg-background/50 backdrop-blur-xl hover:bg-muted transition-all duration-300">
                    <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Watch Demo
                  </Button>
                </motion.div>
                
                <motion.p variants={fadeIn} className="text-xs md:text-sm text-muted-foreground/60 font-medium text-center sm:text-left w-full">
                  No credit card required. Free forever for small teams.
                </motion.p>
              </motion.div>

              {/* Right Column: Floating Interactive Mockups */}
              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] perspective-[1000px] mt-12 lg:mt-0 flex items-center justify-center"
              >
                {/* Abstract glowing backdrop for the floating elements */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-purple-500/10 to-transparent rounded-[3rem] blur-2xl lg:blur-3xl opacity-50" />
                
                {/* Mobile Wrapper to scale down the complex 3D assembly */}
                <div className="relative w-full h-full scale-[0.65] sm:scale-75 md:scale-90 lg:scale-100 origin-center">
                  {/* Main Dashboard Card */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] sm:w-[110%] max-w-[600px] rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-10"
                  >
                  <div className="h-12 border-b border-white/10 bg-white/5 flex items-center px-4 justify-between">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    </div>
                    <div className="text-xs font-medium text-white/50">Sprint Planning</div>
                    <div className="w-16" />
                  </div>
                  <div className="p-6 space-y-4">
                    {/* Mock Kanban Header */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex gap-3">
                        <div className="px-3 py-1 rounded-md bg-white/10 text-xs font-semibold">All Issues</div>
                        <div className="px-3 py-1 rounded-md text-white/50 text-xs font-semibold">Active</div>
                      </div>
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 border border-black" />
                        <div className="w-6 h-6 rounded-full bg-purple-500 border border-black" />
                        <div className="w-6 h-6 rounded-full bg-orange-500 border border-black" />
                      </div>
                    </div>
                    {/* Mock Kanban Tasks */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col gap-3">
                          <div className="w-10 h-2 bg-purple-500/50 rounded-full" />
                          <div className="w-3/4 h-3 bg-white/20 rounded-full" />
                          <div className="w-1/2 h-3 bg-white/10 rounded-full" />
                        </div>
                        <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col gap-3">
                          <div className="w-10 h-2 bg-blue-500/50 rounded-full" />
                          <div className="w-full h-3 bg-white/20 rounded-full" />
                          <div className="w-2/3 h-3 bg-white/10 rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col gap-3">
                          <div className="w-10 h-2 bg-orange-500/50 rounded-full" />
                          <div className="w-5/6 h-3 bg-white/20 rounded-full" />
                          <div className="w-1/3 h-3 bg-white/10 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Notification Card (Top Right) */}
                <motion.div 
                  animate={{ y: [0, 15, 0], rotate: [5, 7, 5] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-10 -right-4 lg:-right-10 w-64 p-4 rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl z-20"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Issue #423 Resolved</h4>
                      <p className="text-xs text-white/60">PR merged by @alex in 2m</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Analytics Card (Bottom Left) */}
                <motion.div 
                  animate={{ y: [0, -15, 0], rotate: [-4, -2, -4] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute bottom-10 -left-4 lg:-left-12 w-72 p-5 rounded-2xl border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl shadow-2xl z-20"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-white">Sprint Velocity</h4>
                    <BarChart3 className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="flex items-end gap-2 h-16">
                    <div className="w-full bg-white/10 rounded-t-sm h-[40%]" />
                    <div className="w-full bg-white/10 rounded-t-sm h-[60%]" />
                    <div className="w-full bg-white/10 rounded-t-sm h-[45%]" />
                    <div className="w-full bg-white/10 rounded-t-sm h-[80%]" />
                    <div className="w-full bg-primary/50 rounded-t-sm h-[100%]" />
                  </div>
                </motion.div>
                
                </div> {/* End Mobile Scale Wrapper */}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Logo Marquee */}
        <section className="w-full py-10 border-y border-border/20 bg-background relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1/4 sm:w-1/3 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-1/4 sm:w-1/3 bg-gradient-to-l from-background to-transparent z-10" />
          
          <div className="max-w-7xl mx-auto px-6 mb-6 md:mb-8 text-center">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">
              Trusted by revolutionary teams worldwide
            </p>
          </div>
          
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="flex gap-12 md:gap-24 whitespace-nowrap opacity-40 grayscale hover:grayscale-0 transition-all duration-700 w-max items-center"
          >
             {/* Duplicate for seamless loop */}
             {[1, 2].map((i) => (
               <div key={i} className="flex gap-12 md:gap-24 items-center">
                 <span className="text-2xl md:text-3xl font-black italic tracking-tighter">Acme Corp</span>
                 <span className="text-2xl md:text-3xl font-black italic tracking-tighter">GlobalTech</span>
                 <span className="text-2xl md:text-3xl font-black italic tracking-tighter">Quantum</span>
                 <span className="text-2xl md:text-3xl font-black italic tracking-tighter">Nexus</span>
                 <span className="text-2xl md:text-3xl font-black italic tracking-tighter">Orbit</span>
                 <span className="text-2xl md:text-3xl font-black italic tracking-tighter">Velocity</span>
               </div>
             ))}
          </motion.div>
        </section>

        {/* Ultra-Modern Bento Box Features */}
        <section id="features" className="w-full py-20 md:py-32 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
            >
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
                Engineered for <span className="text-primary">velocity.</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground px-4">
                Everything you need to manage complex projects, crafted with obsessive attention to detail and performance.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isLarge = index === 0 || index === 3;
                
                return (
                  <motion.div 
                    key={index} 
                    variants={fadeIn}
                    className={`group relative p-6 md:p-8 rounded-3xl border border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:bg-card/80 hover:shadow-2xl hover:-translate-y-1 ${isLarge ? 'md:col-span-2' : 'col-span-1'}`}
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-background border border-white/5 shadow-lg group-hover:scale-110 group-hover:border-primary/20 transition-all duration-500">
                        <Icon className="h-7 w-7 text-foreground group-hover:text-primary transition-colors duration-500" />
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight mb-4">{feature.title}</h3>
                      <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* High-Impact CTA Section */}
        <section className="w-full py-20 md:py-32 px-4 md:px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          
          <div className="max-w-5xl mx-auto relative z-10">
             <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true }}
               variants={fadeIn}
               className="bg-gradient-to-b from-primary to-primary/80 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 lg:p-24 shadow-2xl text-center relative overflow-hidden"
             >
                {/* Decorative background elements inside CTA */}
                <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-black/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-20 space-y-6 md:space-y-8">
                   <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter text-white leading-[1.1]">
                     Ready to upgrade <br className="hidden sm:block" /> your workflow?
                   </h2>
                   <p className="text-lg md:text-xl text-white/80 font-medium max-w-2xl mx-auto px-2">
                     Join thousands of industry-leading teams shipping better products, faster, with ProjeX.
                   </p>
                   
                   <div className="flex justify-center pt-6 md:pt-8">
                     <Link to="/signup" className="w-full sm:w-auto">
                       <Button size="lg" className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-12 rounded-full font-bold text-base md:text-lg bg-white text-primary hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300">
                         Get started for free
                       </Button>
                     </Link>
                   </div>
                   
                   <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 pt-8 md:pt-10 text-white/60 text-sm font-medium">
                     <span className="flex items-center justify-center"><CheckCircle2 className="mr-2 h-4 w-4 text-white/80" /> 14-day free trial</span>
                     <span className="flex items-center justify-center"><CheckCircle2 className="mr-2 h-4 w-4 text-white/80" /> No credit card required</span>
                     <span className="flex items-center justify-center"><CheckCircle2 className="mr-2 h-4 w-4 text-white/80" /> Cancel anytime</span>
                   </div>
                </div>
             </motion.div>
          </div>
        </section>
      </main>

      {/* Sleek Footer */}
      <footer className="w-full border-t border-white/5 bg-background pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2 space-y-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                  <Zap className="h-4 w-4 fill-current" />
                </div>
                <span className="text-2xl font-bold tracking-tight">ProjeX</span>
              </Link>
              <p className="text-muted-foreground max-w-xs leading-relaxed">
                The high-performance orchestration engine for modern product and engineering teams.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer transition-colors"><Globe className="h-4 w-4 text-muted-foreground" /></div>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer transition-colors"><Rocket className="h-4 w-4 text-muted-foreground" /></div>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer transition-colors"><Shield className="h-4 w-4 text-muted-foreground" /></div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-semibold text-foreground">Product</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-semibold text-foreground">Legal</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ProjeX Systems Inc. All rights reserved.</p>
            <p className="flex items-center gap-2">Designed in California <span className="w-1.5 h-1.5 rounded-full bg-primary" /></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
