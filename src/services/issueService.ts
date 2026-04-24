import apiClient from './client';
import { ApiResponse, Issue } from './types';

export const issueAPI = {
  createIssue: (data: Partial<Issue>) => 
    apiClient.post<ApiResponse<Issue>>('/api/issues', data),
  
  getIssueById: (id: number) =>
    apiClient.get<ApiResponse<Issue>>(`/api/issues/${id}`),
  
  getIssuesByProjectId: (projectId: number) =>
    apiClient.get<ApiResponse<Issue[]>>(`/api/issues/project/${projectId}`),
  
  updateIssueStatus: (issueId: number, status: string) =>
    apiClient.put<ApiResponse<Issue>>(`/api/issues/${issueId}/status/${status}`),
  
  assignUserToIssue: (issueId: number, userId: number) =>
    apiClient.put<ApiResponse<Issue>>(`/api/issues/${issueId}/assignee/${userId}`),
  
  deleteIssue: (id: number) =>
    apiClient.delete<ApiResponse<any>>(`/api/issues/${id}`),

  updateIssue: (id: number, data: Partial<Issue>) =>
    apiClient.put<ApiResponse<Issue>>(`/api/issues/${id}`, data),
};
