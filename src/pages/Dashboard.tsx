import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  LayoutDashboard,
  Folder,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Briefcase
} from "lucide-react";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import QuickActions from "@/components/dashboard/QuickActions";
import CreateProjectModal from "@/components/dashboard/CreateProjectModal";
import OnboardingWidget from "@/components/dashboard/OnboardingWidget";
import DemoSeeder from "@/components/dashboard/DemoSeeder";
import { projectAPI } from "@/services/projectService";
import { dashboardAPI } from "@/services/dashboardService";
import { issueAPI } from "@/services/issueService";
import { userAPI } from "@/services/userService";
import { Project, Issue, RecentActivity } from "@/services/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Queries
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await dashboardAPI.getStatistics();
      return response.data.data;
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data;
    },
  });

  const { data: projectCounts, isLoading: isCountsLoading } = useQuery({
    queryKey: ["project-counts"],
    queryFn: async () => {
      const response = await dashboardAPI.getProjectCounts();
      return response.data.data;
    },
  });

  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await projectAPI.getProjects();
      return response.data.data || [];
    },
  });

  const { data: recentActivity = [], isLoading: isActivityLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const response = await dashboardAPI.getRecentActivity(10);
      return response.data.data || [];
    },
  });

  const { data: myIssues = [], isLoading: isMyIssuesLoading } = useQuery({
    queryKey: ["my-issues", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      // Find issues assigned to current user across all projects
      const response = await projectAPI.getProjects();
      const allProjects = response.data.data || [];
      const assigned = allProjects.flatMap((p: Project) => 
        (p.issues || []).filter((i: Issue) => 
          i.assignee?.id === currentUser.id && i.status !== 'DONE'
        )
      );
      return assigned.slice(0, 5);
    },
    enabled: !!currentUser?.id,
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => projectAPI.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Deleted", description: "Project has been removed." });
    },
  });

  const recentProjects = projects?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background lg:ml-64 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                Command Center
              </h1>
            </div>
            <p className="text-muted-foreground font-medium pl-11">
              Real-time intelligence for your active workspaces.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <DemoSeeder />
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              variant="hero"
              className="rounded-2xl px-6 h-12 font-bold transition-all active:scale-95"
            >
              <Plus className="h-5 w-5 mr-2 stroke-[3px]" />
              New Project
            </Button>
          </div>
        </header>

        {/* Onboarding */}
        {/* <OnboardingWidget /> */}

        {/* Stats Grid */}
        <DashboardStats stats={stats} isLoading={isStatsLoading} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <DashboardCharts counts={projectCounts} isLoading={isCountsLoading} />
            
            {/* Project Progress Overview */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Project Performance Insights
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {isProjectsLoading ? (
                  [1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-3xl" />)
                ) : projects.length > 0 ? (
                  projects.slice(0, 4).map((project: Project) => {
                    const totalIssues = project.issues?.length || 0;
                    const doneIssues = project.issues?.filter((i: Issue) => i.status === 'DONE').length || 0;
                    const progress = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0;
                    const pendingIssues = totalIssues - doneIssues;

                    return (
                      <Card key={project.id} className="p-5 glass-panel rounded-3xl hover:border-primary/20 transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                           <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-3">
                                 <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">{project.name}</h3>
                                 <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase">
                                    {project.category}
                                 </Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                 {doneIssues}/{totalIssues} TASKS COMPLETE • {pendingIssues} PENDING
                              </p>
                           </div>

                           <div className="flex-1 max-w-xs w-full space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                                 <span className="opacity-70">Velocity</span>
                                 <span className="text-primary">{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-1.5 bg-primary/5" />
                           </div>

                           <Button variant="ghost" size="sm" asChild className="rounded-xl font-bold text-[10px] uppercase">
                              <Link to={`/projects/${project.id}`}>Inspect <ArrowRight className="ml-2 h-3 w-3" /></Link>
                           </Button>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <div className="p-12 text-center glass-panel rounded-[2rem] border-dashed">
                    <p className="text-muted-foreground font-medium">Create a project to start tracking.</p>
                  </div>
                )}
              </div>
            </div>

            {/* My Focus Section */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  My Immediate Focus
                </h2>
              </div>
              <div className="space-y-3">
                {isMyIssuesLoading ? (
                  [1, 2].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-2xl" />)
                ) : myIssues.length > 0 ? (
                  myIssues.map((issue: Issue) => (
                    <div key={issue.id} className="p-4 glass-panel rounded-2xl flex items-center justify-between group hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`h-10 w-1 rounded-full ${
                          issue.priority === 'HIGH' ? 'bg-destructive' : 'bg-primary'
                        }`} />
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{issue.title}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{issue.status}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="rounded-xl font-bold text-[10px] uppercase opacity-0 group-hover:opacity-100">
                         <Link to={`/projects/${issue.projectId}`}>View Task</Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center glass-panel rounded-3xl border-dashed">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">No urgent assignments</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Workspaces */}
            <div className="space-y-6">
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
                {isProjectsLoading ? (
                  [1, 2].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-3xl" />)
                ) : recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="group p-6 rounded-[2rem] glass-panel hover:border-primary/20 hover:shadow-glow transition-all duration-500 block relative overflow-hidden"
                    >
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                            {project.name}
                          </h3>
                          <Badge variant="outline" className="mt-2 bg-primary/5 text-primary border-primary/10 text-[9px] font-black uppercase tracking-tighter">
                            {project.category || "General"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-primary/5">
                           <span className="text-[10px] font-bold text-muted-foreground uppercase">
                              {project.team?.length || 0} Members
                            </span>
                           <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full p-12 text-center glass-panel rounded-[2rem] border-dashed">
                    <p className="text-muted-foreground font-medium">Create a project to start tracking.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-8">
             <div className="glass-panel rounded-[2.5rem] p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm uppercase tracking-widest text-primary">Live Activity</h3>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                
                <div className="space-y-4">
                  {isActivityLoading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="h-10 w-full bg-muted animate-pulse rounded-xl" />)
                  ) : recentActivity.length > 0 ? (
                    recentActivity.slice(0, 8).map((activity: RecentActivity) => (
                      <div key={activity.id} className="flex gap-3 group">
                        <div className="shrink-0 w-1 bg-primary/10 rounded-full group-hover:bg-primary/30 transition-colors" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-foreground leading-tight line-clamp-2">
                            {activity.action}
                          </p>
                          <p className="text-[9px] text-muted-foreground font-black uppercase mt-1 opacity-50">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-10 text-[10px] font-bold uppercase opacity-30">Pulse empty</p>
                  )}
                </div>

                <div className="mt-auto">
                   <QuickActions />
                </div>
             </div>
          </aside>
        </div>
      </div>

      <CreateProjectModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </div>
  );
};

export default Dashboard;
