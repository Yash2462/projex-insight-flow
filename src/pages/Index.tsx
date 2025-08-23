import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart3,
  Zap,
  Shield,
  Star,
  Play
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work seamlessly with your team members on projects in real-time."
    },
    {
      icon: Calendar,
      title: "Project Timeline",
      description: "Track deadlines and milestones with advanced project scheduling."
    },
    {
      icon: MessageSquare,
      title: "Real-time Chat",
      description: "Communicate instantly with project-specific chat rooms."
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Get insights into project progress and team productivity."
    },
    {
      icon: Zap,
      title: "Automation",
      description: "Automate repetitive tasks and streamline your workflow."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with role-based access controls."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Project Manager at TechCorp",
      content: "ProjeX has revolutionized how we manage our development projects. The real-time collaboration features are outstanding!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Team Lead at StartupXYZ",
      content: "The best project management tool we've used. Clean interface, powerful features, and excellent team support.",
      rating: 5
    },
    {
      name: "Emily Rodriguez", 
      role: "Product Owner at InnovateLabs",
      content: "ProjeX helped us increase our project delivery speed by 40%. The analytics dashboard provides incredible insights.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 3 projects",
        "5 team members",
        "Basic chat support",
        "Community support"
      ],
      popular: false
    },
    {
      name: "Monthly",
      price: "$29",
      period: "per month",
      description: "Great for growing teams and businesses",
      features: [
        "Unlimited projects",
        "Unlimited team members",
        "Priority chat support",
        "Advanced analytics",
        "Custom integrations"
      ],
      popular: true
    },
    {
      name: "Annual",
      price: "$299",
      period: "per year",
      description: "Best value for established organizations",
      features: [
        "Everything in Monthly",
        "2 months free",
        "Dedicated account manager",
        "Custom onboarding",
        "SLA guarantee"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-lg border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-foreground">ProjeX</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
              <Link to="/signup">
                <Button variant="hero">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="space-y-4">
                <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  ✨ New: AI-powered project insights
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                  Manage Projects
                  <span className="block bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                    Like Never Before
                  </span>
                </h1>
                <p className="text-xl text-blue-100 max-w-lg">
                  ProjeX combines powerful project management with seamless team collaboration. 
                  Track, manage, and deliver projects with unprecedented efficiency.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" variant="premium" className="shadow-glow">
                    Start Free Trial
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-sm text-blue-200">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm text-blue-200">Companies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-sm text-blue-200">Uptime</div>
                </div>
              </div>
            </div>

            <div className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="ProjeX Dashboard Preview" 
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to streamline your project management workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="shadow-elegant hover:shadow-glow transition-all duration-300 border-0 bg-gradient-card">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Loved by teams worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our customers say about ProjeX
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-elegant bg-card">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the perfect plan for your team
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative shadow-elegant ${plan.popular ? 'border-primary shadow-glow' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-primary text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-foreground">
                      {plan.price}
                      <span className="text-lg text-muted-foreground font-normal">
                        /{plan.period}
                      </span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "hero" : "outline"}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to transform your project management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams who have already made the switch to ProjeX
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="premium" className="shadow-glow">
                Start Your Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-xl font-bold text-foreground">ProjeX</span>
              </Link>
              <p className="text-muted-foreground">
                The most intuitive project management platform for modern teams.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 ProjeX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
