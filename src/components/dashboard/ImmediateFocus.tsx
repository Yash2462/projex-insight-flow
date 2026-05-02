import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { ErrorState } from "./ErrorState";
import { Issue } from "@/services/types";

interface ImmediateFocusProps {
  issues: Issue[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function ImmediateFocus({ issues, isLoading, isError, onRetry }: ImmediateFocusProps) {
  if (isError) {
    return <ErrorState message="Failed to load your focus tasks." onRetry={onRetry} />;
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          My Immediate Focus
        </h2>
      </div>
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))
        ) : issues.length > 0 ? (
          issues.map((issue: Issue) => (
            <GlassCard 
              key={issue.id} 
              className="p-4 rounded-2xl flex items-center justify-between group hover:border-primary/20"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`h-10 w-1 rounded-full ${
                  issue.priority === 'HIGH' ? 'bg-destructive' : 'bg-primary'
                }`} />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{issue.title}</p>
                  <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">{issue.status}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="rounded-xl font-bold text-xs uppercase opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Link to={`/projects/${issue.projectId}`}>View Task</Link>
              </Button>
            </GlassCard>
          ))
        ) : (
          <div className="p-8 text-center glass-panel rounded-3xl border-dashed border-2 border-primary/10">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">No urgent assignments</p>
          </div>
        )}
      </div>
    </div>
  );
}
