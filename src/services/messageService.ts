import apiClient from './client';
import { ApiResponse, Message } from './types';

export const messageAPI = {
  sendDirectMessage: (data: { senderId: number; receiverId: number; content: string }) =>
    apiClient.post<ApiResponse<Message>>('/api/messages/direct/send', data),
  
  getDirectMessages: (userId: number) =>
    apiClient.get<ApiResponse<Message[]>>(`/api/messages/direct/${userId}`),
};
