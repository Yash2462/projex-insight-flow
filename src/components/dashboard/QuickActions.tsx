import { Button } from "@/components/ui/button";
import { Plus, UserPlus, FileText, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "New Project",
      icon: Plus,
      onClick: () => {}, // Handled by Dashboard's existing modal logic
      variant: "hero" as const,
      className: ""
    },
    {
      label: "Invite Member",
      icon: UserPlus,
      onClick: () => navigate("/projects"),
      variant: "outline" as const,
      className: "border-primary/20"
    },
    {
      label: "View All Projects",
      icon: FileText,
      onClick: () => navigate("/projects"),
      variant: "ghost" as const,
      className: "text-muted-foreground hover:text-foreground"
    }
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            variant={action.variant}
            className={`flex items-center gap-2 rounded-xl transition-all duration-300 ${action.className}`}
            onClick={action.onClick}
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};

export default QuickActions;
