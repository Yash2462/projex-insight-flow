import { Link } from "react-router-dom";
import { Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { ErrorState } from "./ErrorState";
import { Project } from "@/services/types";

interface ActiveWorkspacesProps {
  projects: Project[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function ActiveWorkspaces({ projects, isLoading, isError, onRetry }: ActiveWorkspacesProps) {
  if (isError) {
    return <ErrorState message="Failed to load workspaces." onRetry={onRetry} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Active Workspace
        </h2>
        <Button variant="ghost" asChild className="text-primary font-bold hover:bg-primary/5 rounded-xl group">
          <Link to="/projects" className="flex items-center gap-1">
            All Projects <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
          ))
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block group"
            >
              <GlassCard className="p-6 hover:border-primary/20 hover:shadow-glow h-full">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <Badge variant="outline" className="mt-2 bg-primary/5 text-primary border-primary/10 text-xs font-black uppercase tracking-tighter">
                      {project.category || "General"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-primary/5">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      {project.team?.length || 0} Members
                    </span>
                    <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))
        ) : (
          <div className="col-span-full p-12 text-center glass-panel rounded-[2rem] border-dashed border-2 border-primary/10">
            <p className="text-muted-foreground font-medium">Create a project to start tracking.</p>
          </div>
        )}
      </div>
    </div>
  );
}
