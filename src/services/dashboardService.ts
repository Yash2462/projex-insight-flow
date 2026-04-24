import apiClient from './client';
import { ApiResponse, DashboardStatistics, RecentActivity, ProjectCounts } from './types';

export const dashboardAPI = {
  getStatistics: () =>
    apiClient.get<ApiResponse<DashboardStatistics>>('/api/dashboard/statistics'),
  
  getRecentActivity: (limit?: number) =>
    apiClient.get<ApiResponse<RecentActivity[]>>('/api/dashboard/recent-activity', { params: { limit } }),
  
  getProjectCounts: () =>
    apiClient.get<ApiResponse<ProjectCounts>>('/api/dashboard/project-counts'),
};
