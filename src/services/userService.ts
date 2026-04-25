import apiClient from './client';
import { ApiResponse, User } from './types';

export const userAPI = {
  getProfile: () =>
    apiClient.get<ApiResponse<User>>('/api/users/profile'),

  updateProfile: (data: Partial<User>) =>
    apiClient.put<ApiResponse<User>>('/api/users/profile', data),
  
  getUsers: () =>
    apiClient.get<ApiResponse<User[]>>('/api/users/profiles'),

  getUserById: (id: number) =>
    apiClient.get<ApiResponse<User>>(`/api/users/${id}`),

  completeOnboardingStep: (stepId: string) =>
    apiClient.post<ApiResponse<User>>(`/api/users/onboarding/step/${stepId}`),

  updatePreferences: (preferences: Partial<User>) =>
    apiClient.put<ApiResponse<User>>('/api/users/preferences', preferences),
};
