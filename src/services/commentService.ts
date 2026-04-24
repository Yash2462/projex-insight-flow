import apiClient from './client';
import { ApiResponse, Comment } from './types';

export const commentAPI = {
  createComment: (data: { issueId: number; content: string }) =>
    apiClient.post<ApiResponse<Comment>>('/api/comments', data),
  
  getCommentsByIssueId: (issueId: number) =>
    apiClient.get<ApiResponse<Comment[]>>(`/api/comments/${issueId}`),
  
  deleteComment: (commentId: number) =>
    apiClient.delete<ApiResponse<any>>(`/api/comments/${commentId}`),
};
