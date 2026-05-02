import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { ErrorState } from "./ErrorState";
import { Project, Issue } from "@/services/types";

interface ProjectPerformanceProps {
  projects: Project[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function ProjectPerformance({ projects, isLoading, isError, onRetry }: ProjectPerformanceProps) {
  if (isError) {
    return (
      <GlassCard className="p-12 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2">
        <div className="p-4 bg-muted rounded-full">
          <Layout className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-xl">No projects found</h3>
          <p className="text-muted-foreground max-w-[280px]">
            You haven't created any projects yet. Start by creating your first workspace.
          </p>
        </div>
        <Button variant="outline" onClick={onRetry} className="rounded-xl font-bold">
          Refresh Dashboard
        </Button>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Project Performance Insights
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-3xl" />
          ))
        ) : projects && projects.length > 0 ? (
          projects.slice(0, 4).map((project: Project) => {
            const totalIssues = project.issues?.length || 0;
            const doneIssues = project.issues?.filter((i: Issue) => i.status === 'DONE').length || 0;
            const progress = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0;
            const pendingIssues = totalIssues - doneIssues;

            return (
              <GlassCard 
                key={project.id} 
                className="p-5 hover:border-primary/20 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-black uppercase">
                        {project.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                      {doneIssues}/{totalIssues} TASKS COMPLETE • {pendingIssues} PENDING
                    </p>
                  </div>

                  <div className="flex-1 max-w-xs w-full space-y-2">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-tighter">
                      <span className="opacity-70">Velocity</span>
                      <span className="text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-primary/5" />
                  </div>

                  <Button variant="ghost" size="sm" asChild className="rounded-xl font-bold text-xs uppercase">
                    <Link to={`/projects/${project.id}`}>
                      Inspect <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </GlassCard>
            );
          })
        ) : (
          <GlassCard className="p-12 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2 border-primary/10">
            <div className="p-4 bg-primary/5 rounded-full">
              <Layout className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-xl">Your dashboard is empty</h3>
              <p className="text-muted-foreground max-w-[300px] mx-auto">
                Once you create a project, its performance and task velocity will appear here.
              </p>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
