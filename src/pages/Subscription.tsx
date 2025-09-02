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
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
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
      <div className="min-h-screen bg-background lg:ml-64 p-8">
        <div className="text-center">Loading subscription details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:ml-64">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Subscription Plans</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your team. Upgrade or downgrade at any time.
          </p>
          
          {currentSubscription && (
            <div className="mt-6">
              <Card className="max-w-md mx-auto bg-gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Crown className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Current Plan:</span>
                    <Badge variant="secondary" className="font-medium">
                      {currentSubscription.planType || 'Free'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Usage Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-card shadow-elegant border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Projects Used</p>
                  <p className="text-2xl font-bold text-foreground">8 / 25</p>
                </div>
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card shadow-elegant border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold text-foreground">12 / 25</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card shadow-elegant border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold text-foreground">15.2 GB</p>
                </div>
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card shadow-elegant border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">API Calls</p>
                  <p className="text-2xl font-bold text-foreground">2.4K</p>
                </div>
                <Zap className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative shadow-elegant ${plan.color} ${plan.popular ? 'scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl font-bold text-foreground">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">/{plan.billing}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleUpgrade(plan.type)}
                  className="w-full" 
                  variant={plan.popular ? "hero" : "outline"}
                  disabled={currentSubscription?.planType === plan.type}
                >
                  {currentSubscription?.planType === plan.type ? (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Current Plan
                    </>
                  ) : plan.type === 'FREE' ? (
                    'Downgrade to Free'
                  ) : (
                    `Upgrade to ${plan.name}`
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