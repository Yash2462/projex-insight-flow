import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "@/services/dashboardService";
import { projectAPI } from "@/services/projectService";
import { useProfile } from "./use-profile";
import { Project, Issue } from "@/services/types";

export const useDashboardData = () => {
  const { data: currentUser } = useProfile();

  const statsQuery = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await dashboardAPI.getStatistics();
      return response.data.data;
    },
  });

  const projectCountsQuery = useQuery({
    queryKey: ["project-counts"],
    queryFn: async () => {
      const response = await dashboardAPI.getProjectCounts();
      return response.data.data;
    },
  });

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await projectAPI.getProjects();
      return response.data.data || [];
    },
  });

  const activityQuery = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const response = await dashboardAPI.getRecentActivity(10);
      return response.data.data || [];
    },
  });

  const myIssuesQuery = useQuery({
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

  return {
    currentUser,
    stats: statsQuery.data,
    isStatsLoading: statsQuery.isLoading,
    projectCounts: projectCountsQuery.data,
    isCountsLoading: projectCountsQuery.isLoading,
    projects: projectsQuery.data || [],
    isProjectsLoading: projectsQuery.isLoading,
    isProjectsError: projectsQuery.isError,
    refetchProjects: projectsQuery.refetch,
    recentActivity: activityQuery.data || [],
    isActivityLoading: activityQuery.isLoading,
    isActivityError: activityQuery.isError,
    refetchActivity: activityQuery.refetch,
    myIssues: myIssuesQuery.data || [],
    isMyIssuesLoading: myIssuesQuery.isLoading,
    isMyIssuesError: myIssuesQuery.isError,
    refetchMyIssues: myIssuesQuery.refetch,
  };
};
