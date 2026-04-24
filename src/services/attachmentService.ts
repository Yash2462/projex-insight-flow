import apiClient from './client';
import { ApiResponse, Attachment } from './types';

export const attachmentAPI = {
  upload: (file: File, issueId: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('issueId', issueId.toString());
    return apiClient.post<ApiResponse<Attachment>>('/api/attachments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getIssueAttachments: (issueId: number) =>
    apiClient.get<ApiResponse<Attachment[]>>(`/api/attachments/issue/${issueId}`),
  
  delete: (id: number) =>
    apiClient.delete<ApiResponse<any>>(`/api/attachments/${id}`),
};
