import { useState } from "react";
import {
  LayoutDashboard,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import CreateProjectModal from "@/components/dashboard/CreateProjectModal";
import DemoSeeder from "@/components/dashboard/DemoSeeder";
import { ProjectPerformance } from "@/components/dashboard/ProjectPerformance";
import { ImmediateFocus } from "@/components/dashboard/ImmediateFocus";
import { ActiveWorkspaces } from "@/components/dashboard/ActiveWorkspaces";
import { LiveActivity } from "@/components/dashboard/LiveActivity";
import { projectAPI } from "@/services/projectService";
import { dashboardAPI } from "@/services/dashboardService";
import { userAPI } from "@/services/userService";
import { Project, Issue } from "@/services/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Queries
  const { 
    data: stats, 
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats
  } = useQuery({
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

  const { 
    data: projectCounts, 
    isLoading: isCountsLoading,
    isError: isCountsError,
    refetch: refetchCounts
  } = useQuery({
    queryKey: ["project-counts"],
    queryFn: async () => {
      const response = await dashboardAPI.getProjectCounts();
      return response.data.data;
    },
  });

  const { 
    data: projects = [], 
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    refetch: refetchProjects
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await projectAPI.getProjects();
      return response.data.data || [];
    },
  });

  const { 
    data: recentActivity = [], 
    isLoading: isActivityLoading,
    isError: isActivityError,
    refetch: refetchActivity
  } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const response = await dashboardAPI.getRecentActivity(10);
      return response.data.data || [];
    },
  });

  const { 
    data: myIssues = [], 
    isLoading: isMyIssuesLoading,
    isError: isMyIssuesError,
    refetch: refetchMyIssues
  } = useQuery({
    queryKey: ["my-issues", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
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

  const recentProjects = projects?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-background lg:ml-64 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
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

        {/* Stats Grid */}
        <DashboardStats stats={stats} isLoading={isStatsLoading} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-12">
            {/* Charts Section */}
            <DashboardCharts counts={projectCounts} isLoading={isCountsLoading} />
            
            {/* Project Progress Overview */}
            <ProjectPerformance 
              projects={projects} 
              isLoading={isProjectsLoading} 
              isError={isProjectsError}
              onRetry={() => refetchProjects()}
            />

            {/* My Focus Section */}
            <ImmediateFocus 
              issues={myIssues} 
              isLoading={isMyIssuesLoading} 
              isError={isMyIssuesError}
              onRetry={() => refetchMyIssues()}
            />

            {/* Recent Workspaces */}
            <ActiveWorkspaces 
              projects={recentProjects} 
              isLoading={isProjectsLoading} 
              isError={isProjectsError}
              onRetry={() => refetchProjects()}
            />
          </div>

          {/* Right Sidebar */}
          <LiveActivity 
            activities={recentActivity} 
            isLoading={isActivityLoading} 
            isError={isActivityError}
            onRetry={() => refetchActivity()}
          />
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

