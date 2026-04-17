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
  Folder, 
  Users, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  LayoutDashboard
} from "lucide-react";
import { projectAPI, dashboardAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import QuickActions from "@/components/dashboard/QuickActions";
import CreateProjectModal from "@/components/dashboard/CreateProjectModal";
import OnboardingWidget from "@/components/dashboard/OnboardingWidget";

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await dashboardAPI.getStatistics();
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

  const { data: recentActivity, isLoading: isActivityLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const response = await dashboardAPI.getRecentActivity(10);
      return response.data.data || [];
    },
  });

  // Mutations
  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => projectAPI.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({
        title: "Project Deleted",
        description: "The project has been successfully removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const recentProjects = projects?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 lg:ml-64">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Workspace Overview</h1>
            </div>
            <p className="text-muted-foreground">Welcome back! Here's a summary of your workspace performance.</p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-primary hover:opacity-90 shadow-glow rounded-xl px-6"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Project
          </Button>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Onboarding */}
        <OnboardingWidget />

        {/* Stats Grid */}
        <DashboardStats stats={stats} isLoading={isStatsLoading} />

        {/* Charts Section */}
        <DashboardCharts counts={projectCounts} isLoading={isCountsLoading} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-elegant bg-gradient-to-br from-card to-card/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    Recent Projects
                  </CardTitle>
                  <CardDescription>Your most recently updated work</CardDescription>
                </div>
                <Button variant="ghost" asChild className="text-primary hover:text-primary/80">
                  <Link to="/projects" className="flex items-center gap-1">
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {isProjectsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
                  ))
                ) : recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="group p-5 rounded-xl border bg-background/40 hover:bg-background/80 hover:shadow-md transition-all duration-300 cursor-default"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                        </div>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 capitalize">
                          {project.category || "General"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {project.team?.length || 0} Members
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {project.issues?.length || 0} Issues
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg text-xs">
                            <Link to={`/projects/${project.id}`}>Details</Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this project?")) {
                                deleteProjectMutation.mutate(project.id);
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                    <Folder className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No projects found. Create your first one!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div>
            <Card className="border-0 shadow-elegant bg-gradient-to-br from-card to-card/50 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates from your team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isActivityLoading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-muted mt-2" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-2 bg-muted rounded w-24" />
                      </div>
                    </div>
                  ))
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity: any) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-2 rounded-lg hover:bg-accent/30 transition-colors"
                    >
                      <div
                        className={`
                          w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0
                          ${
                            activity.type?.includes("completed") || activity.type === "DONE"
                              ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                              : activity.type?.includes("created") || activity.type === "TODO"
                              ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                              : activity.type?.includes("joined") || activity.type === "MEMBER"
                              ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                              : "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                          }
                        `}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time || "Just now"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </div>
  );
};

export default Dashboard;
