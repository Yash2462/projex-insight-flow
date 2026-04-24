import apiClient from './client';
import { ApiResponse, Project } from './types';
import axios from 'axios';
import { API_URL } from './client';

export const projectAPI = {
  getProjects: (params?: { category?: string; tag?: string }) =>
    apiClient.get<ApiResponse<Project[]>>('/api/projects', { params }),
  
  getProjectById: (id: number) =>
    apiClient.get<ApiResponse<Project>>(`/api/projects/${id}`),
  
  createProject: (data: Partial<Project>) =>
    apiClient.post<ApiResponse<Project>>('/api/projects', data),
  
  updateProject: (id: number, data: Partial<Project>) =>
    apiClient.put<ApiResponse<Project>>(`/api/projects/${id}`, data),
  
  deleteProject: (id: number) =>
    apiClient.delete<ApiResponse<any>>(`/api/projects/${id}`),
  
  searchProjects: (keyword?: string) =>
    apiClient.get<ApiResponse<Project[]>>('/api/projects/search', { params: { keyword } }),
  
  inviteToProject: (data: { email: string; projectId: number }) =>
    apiClient.post<ApiResponse<any>>('/api/projects/invite', data),
  
  acceptInvitation: (token: string) =>
    axios.get<ApiResponse<any>>(`${API_URL}/api/projects/accept_invitation`, { params: { token } }),

  getProjectRole: (projectId: number) =>
    apiClient.get<ApiResponse<string>>(`/api/projects/${projectId}/role`),

  addMemberToProject: (projectId: number, userId: number) =>
    apiClient.put<ApiResponse<any>>(`/api/projects/${projectId}/addMember/${userId}`),
};
