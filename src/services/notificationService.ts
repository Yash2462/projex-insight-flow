import apiClient from './client';
import { ApiResponse, Notification } from './types';

export const notificationAPI = {
  getNotifications: () =>
    apiClient.get<ApiResponse<Notification[]>>('/api/notifications'),
  
  getUnreadNotifications: () =>
    apiClient.get<ApiResponse<Notification[]>>('/api/notifications/unread'),
  
  markAsRead: (id: number) =>
    apiClient.put<ApiResponse<any>>(`/api/notifications/${id}/read`),
  
  markAllAsRead: () =>
    apiClient.put<ApiResponse<any>>('/api/notifications/read-all'),
  
  delete: (id: number) =>
    apiClient.delete<ApiResponse<any>>(`/api/notifications/${id}`),
};
