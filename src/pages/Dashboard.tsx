import { useState } from "react";
import {
  LayoutDashboard,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import CreateProjectModal from "@/components/dashboard/CreateProjectModal";
import { ProjectPerformance } from "@/components/dashboard/ProjectPerformance";
import { ImmediateFocus } from "@/components/dashboard/ImmediateFocus";
import { ActiveWorkspaces } from "@/components/dashboard/ActiveWorkspaces";
import { LiveActivity } from "@/components/dashboard/LiveActivity";
import { useDashboardData } from "@/hooks/use-dashboard-data";

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const {
    stats,
    isStatsLoading,
    projectCounts,
    isCountsLoading,
    projects,
    isProjectsLoading,
    isProjectsError,
    refetchProjects,
    recentActivity,
    isActivityLoading,
    isActivityError,
    refetchActivity,
    myIssues,
    isMyIssuesLoading,
    isMyIssuesError,
    refetchMyIssues,
  } = useDashboardData();

  const recentProjects = projects?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-background md:ml-64 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 md:space-y-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-foreground truncate">
                Command Center
              </h1>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground font-medium pl-11 md:pl-11">
              Real-time intelligence for your active workspaces.
            </p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 relative z-20">
            <Button 
              onClick={() => {
                console.log("New Project button clicked!");
                setIsCreateModalOpen(true);
              }}
              variant="hero"
              className="flex-1 md:flex-none rounded-2xl px-4 md:px-6 h-11 md:h-12 text-xs md:text-sm font-bold transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2 stroke-[3px]" />
              New Project
            </Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-backwards">
          <DashboardStats stats={stats} isLoading={isStatsLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            {/* Charts Section */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-backwards">
              <DashboardCharts counts={projectCounts} isLoading={isCountsLoading} />
            </div>
            
            {/* Project Progress Overview */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-backwards">
              <ProjectPerformance 
                projects={projects} 
                isLoading={isProjectsLoading} 
                isError={isProjectsError}
                onRetry={() => refetchProjects()}
              />
            </div>

            {/* My Focus Section */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400 fill-mode-backwards">
              <ImmediateFocus 
                issues={myIssues} 
                isLoading={isMyIssuesLoading} 
                isError={isMyIssuesError}
                onRetry={() => refetchMyIssues()}
              />
            </div>

            {/* Recent Workspaces */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-backwards">
              <ActiveWorkspaces 
                projects={recentProjects} 
                isLoading={isProjectsLoading} 
                isError={isProjectsError}
                onRetry={() => refetchProjects()}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-backwards">
            <LiveActivity 
              activities={recentActivity} 
              isLoading={isActivityLoading} 
              isError={isActivityError}
              onRetry={() => refetchActivity()}
              onCreateProject={() => setIsCreateModalOpen(true)}
            />
          </div>
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

