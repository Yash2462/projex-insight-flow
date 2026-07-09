import { Link } from "react-router-dom";
import { CheckCircle2, Clock, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "@/components/ui/empty-state";
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'MEDIUM': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'LOW': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityBarColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-destructive';
      case 'MEDIUM': return 'bg-orange-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-primary';
    }
  };

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
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))
        ) : issues.length > 0 ? (
          issues.map((issue: Issue) => (
            <GlassCard 
              key={issue.id} 
              className="p-4 rounded-2xl flex items-center justify-between group hover:border-primary/20"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className={`h-12 w-1 rounded-full shrink-0 ${getPriorityBarColor(issue.priority)}`} />
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{issue.title}</p>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 rounded-md font-black tracking-widest uppercase ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <FolderOpen className="h-3 w-3" />
                      Proj ID: {issue.projectId}
                    </span>
                    {issue.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(issue.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <span className="uppercase font-black tracking-widest text-[9px] opacity-70 border-l border-border pl-3">
                      {issue.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className="rounded-xl font-bold text-[10px] uppercase tracking-widest opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity whitespace-nowrap shrink-0 border-primary/10 hover:bg-primary/5"
              >
                <Link to={`/projects/${issue.projectId}`}>View Task</Link>
              </Button>
            </GlassCard>
          ))
        ) : (
          <EmptyState 
            icon={CheckCircle2} 
            title="No urgent assignments" 
            description="You're all caught up on your high-priority tasks." 
            className="py-12" 
          />
        )}
      </div>
    </div>
  );
}
