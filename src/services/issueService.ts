import apiClient from './client';
import { ApiResponse, Issue } from './types';

export const issueAPI = {
  createIssue: (data: Partial<Issue>) => 
    apiClient.post<ApiResponse<Issue>>('/api/issues', data),
  
  getIssueById: (id: number) =>
    apiClient.get<ApiResponse<Issue>>(`/api/issues/${id}`),

  searchIssues: (keyword: string) =>
    apiClient.get<ApiResponse<Issue[]>>('/api/issues/search', { params: { keyword } }),

  getIssueByProjectId: (projectId: number) =>
    apiClient.get<ApiResponse<Issue[]>>(`/api/issues/project/${projectId}`),

  updateIssueStatus: (id: number, status: string) =>
    apiClient.put<ApiResponse<Issue>>(`/api/issues/${id}/status/${status}`),

  assignUserToIssue: (issueId: number, userId: number) =>
    apiClient.put<ApiResponse<Issue>>(`/api/issues/${issueId}/assignee/${userId}`),

  getIssuesByAssignee: (userId: number) =>
    apiClient.get<ApiResponse<Issue[]>>(`/api/issues/assignee/${userId}`),
  
  deleteIssue: (id: number) =>
    apiClient.delete<ApiResponse<any>>(`/api/issues/${id}`),

  updateIssue: (id: number, data: Partial<Issue>) =>
    apiClient.put<ApiResponse<Issue>>(`/api/issues/${id}`, data),

  addSubtask: (id: number, subtask: string) =>
    apiClient.post<ApiResponse<Issue>>(`/api/issues/${id}/subtasks`, { subtask }),

  removeSubtask: (id: number, subtask: string) =>
    apiClient.delete<ApiResponse<Issue>>(`/api/issues/${id}/subtasks`, { data: { subtask } }),

  toggleSubtask: (id: number, subtask: string) =>
    apiClient.put<ApiResponse<Issue>>(`/api/issues/${id}/subtasks/toggle`, { subtask }),

  reorderIssues: (issueOrders: { id: number; index: number; status: string }[]) =>
    apiClient.put<ApiResponse<any>>('/api/issues/reorder', issueOrders),
};
