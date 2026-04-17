import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Rocket, 
  ArrowRight,
  PlusCircle,
  Users,
  Zap,
  X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "@/services/api";

const ONBOARDING_STEPS = [
  { id: "create_project", title: "Create your first project", description: "Set up a workspace for your team.", icon: PlusCircle },
  { id: "invite_member", title: "Invite a team member", description: "Collaboration is better with others.", icon: Users },
  { id: "create_issue", title: "Create an issue", description: "Break down your work into tasks.", icon: Zap },
];

const OnboardingWidget = () => {
  const [isVisible, setIsVisible] = useState(true);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data;
    },
  });

  const completedSteps = profile?.completedOnboardingSteps || [];
  const progress = Math.round((completedSteps.length / ONBOARDING_STEPS.length) * 100);

  if (!isVisible || profile?.onboardingCompleted || isLoading) return null;

  return (
    <Card className="mb-8 border-0 shadow-glow bg-gradient-to-r from-primary/10 via-primary/5 to-background relative overflow-hidden group">
      <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </Button>

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-primary animate-bounce" />
          <CardTitle className="text-xl font-bold">Welcome to ProjeX, {profile?.fullName?.split(" ")[0]}!</CardTitle>
        </div>
        <CardDescription className="text-sm font-medium">
          Let's get you up to speed. Complete these quick steps to master your workspace.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 w-full space-y-4">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Setup Progress</span>
              <span className="text-xs font-bold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {ONBOARDING_STEPS.map((step) => {
                const isCompleted = completedSteps.includes(step.id);
                const Icon = step.icon;
                
                return (
                  <div 
                    key={step.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 ${
                      isCompleted 
                        ? "bg-primary/5 border-primary/20 opacity-60" 
                        : "bg-background border-primary/10 hover:border-primary/30 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${isCompleted ? "bg-primary/10" : "bg-muted"}`}>
                        <Icon className={`h-4 w-4 ${isCompleted ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/30" />
                      )}
                    </div>
                    <h4 className="text-sm font-bold mb-1">{step.title}</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center p-6 bg-primary/5 rounded-3xl border border-primary/10 min-w-[200px]">
            <Rocket className="h-12 w-12 text-primary mb-4" />
            <p className="text-center text-xs font-bold mb-4 px-2">Ready to launch your first big idea?</p>
            <Button size="sm" className="bg-gradient-primary shadow-glow rounded-xl w-full">
              Quick Start <ArrowRight className="h-3 w-3 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingWidget;
