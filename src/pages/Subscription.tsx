import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Check, 
  Star, 
  Users, 
  FolderOpen, 
  MessageCircle, 
  Shield,
  Zap,
  Calendar
} from "lucide-react";
import { subscriptionAPI, paymentAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Subscription = () => {
  const [currentSubscription, setCurrentSubscription] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await subscriptionAPI.getUserSubscription();
      setCurrentSubscription(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subscription details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType: 'FREE' | 'MONTHLY' | 'ANNUALLY') => {
    try {
      if (planType === 'FREE') {
        await subscriptionAPI.upgradeSubscription(planType);
        toast({
          title: "Success",
          description: "Subscription updated successfully",
        });
        fetchSubscription();
      } else {
        const response = await paymentAPI.createPaymentLink(planType);
        if (response.data?.payment_link_url) {
          window.open(response.data.payment_link_url, '_blank');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process subscription change",
        variant: "destructive",
      });
    }
  };

  const plans = [
    {
      name: "Free",
      type: "FREE" as const,
      price: "$0",
      billing: "Forever",
      description: "Perfect for getting started",
      features: [
        "Up to 3 projects",
        "5 team members",
        "Basic support",
        "1GB storage",
        "Standard templates"
      ],
      popular: false,
      color: "border-muted"
    },
    {
      name: "Pro",
      type: "MONTHLY" as const,
      price: "$12",
      billing: "per month",
      description: "Best for growing teams",
      features: [
        "Unlimited projects",
        "25 team members",
        "Priority support",
        "50GB storage",
        "Advanced analytics",
        "Custom templates",
        "API access"
      ],
      popular: true,
      color: "border-primary shadow-glow"
    },
    {
      name: "Enterprise",
      type: "ANNUALLY" as const,
      price: "$99",
      billing: "per year",
      description: "For large organizations",
      features: [
        "Unlimited everything",
        "Unlimited team members",
        "24/7 premium support",
        "500GB storage",
        "Advanced security",
        "Custom integrations",
        "Dedicated manager",
        "SLA guarantee"
      ],
      popular: false,
      color: "border-purple-500"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background md:ml-64 p-8">
        <div className="text-center">Loading subscription details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background md:ml-64">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-3">Subscription Plans</h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto font-medium">
            Choose the perfect plan for your team. Upgrade or downgrade at any time.
          </p>
          
          {currentSubscription && (
            <div className="mt-6">
              <Card className="max-w-md mx-auto bg-muted/10 border-primary/5 rounded-2xl">
                <CardContent className="p-3">
                  <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                    <Crown className="h-3.5 w-3.5 text-primary" />
                    <span className="text-muted-foreground opacity-60">Active Protocol:</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0 font-black">
                      {currentSubscription.planType || 'Free'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Usage Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
          {[
            { label: "Projects", value: "8 / 25", icon: FolderOpen },
            { label: "Team", value: "12 / 25", icon: Users },
            { label: "Vault", value: "15.2 GB", icon: Shield },
            { label: "Signals", value: "2.4K", icon: Zap }
          ].map((stat, i) => (
            <Card key={i} className="bg-card shadow-sm border-primary/5 rounded-2xl md:rounded-[1.5rem] overflow-hidden group hover:border-primary/20 transition-all">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <stat.icon className="h-5 w-5 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{stat.label}</p>
                  </div>
                  <p className="text-lg md:text-2xl font-black text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative shadow-elegant rounded-[2rem] border-primary/5 ${plan.color} ${plan.popular ? 'md:scale-105 z-10 ring-2 ring-primary/20' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-glow">
                    <Star className="h-3 w-3 mr-2 fill-current" />
                    Elite Tier
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2 pt-8">
                <CardTitle className="text-xl md:text-2xl font-black tracking-tight text-foreground uppercase">{plan.name}</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">{plan.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">{plan.price}</span>
                  <span className="text-xs font-bold text-muted-foreground ml-1 uppercase opacity-40">/{plan.billing}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8 p-6 md:p-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-emerald-500 stroke-[3px]" />
                      </div>
                      <span className="text-xs md:text-sm font-medium text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleUpgrade(plan.type)}
                  className="w-full h-12 md:h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95" 
                  variant={plan.popular ? "hero" : "outline"}
                  disabled={currentSubscription?.planType === plan.type}
                >
                  {currentSubscription?.planType === plan.type ? (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Protocol Active
                    </>
                  ) : plan.type === 'FREE' ? (
                    'Revert to Basic'
                  ) : (
                    `Authorise ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid gap-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan at any time?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                  and we'll prorate any billing adjustments.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg">What happens if I exceed my limits?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We'll notify you when you're approaching your limits. You can upgrade your plan to continue 
                  using all features without interruption.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All paid plans come with a 14-day free trial. No credit card required to start your trial.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;