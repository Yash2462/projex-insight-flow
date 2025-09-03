import axios from 'axios';

const API_URL = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API Services
export const authAPI = {
  login: (data: { email: string; password: string; otp?: string }) =>
    axios.post(`${API_URL}/auth/login`, data),
  
  signup: (data: { fullName: string; email: string; password: string }) =>
    axios.post(`${API_URL}/auth/signup`, data),
  
  sendOtp: (email: string) =>
    axios.post(`${API_URL}/auth/send-otp?email=${email}`),
};

export const projectAPI = {
  getProjects: (params?: { category?: string; tag?: string }) =>
    apiClient.get('/api/projects', { params }),
  
  getProjectById: (id: number) =>
    apiClient.get(`/api/projects/${id}`),
  
  createProject: (data: any) =>
    apiClient.post('/api/projects', data),
  
  updateProject: (id: number, data: any) =>
    apiClient.put(`/api/projects/${id}`, data),
  
  deleteProject: (id: number) =>
    apiClient.delete(`/api/projects/${id}`),
  
  searchProjects: (keyword?: string) =>
    apiClient.get('/api/projects/search', { params: { keyword } }),
  
  inviteToProject: (data: { email: string; projectId: number }) =>
    apiClient.post('/api/projects/invite', {data}),
  
  acceptInvitation: (token: string, project: any) =>
    apiClient.get('/api/projects/accept_invitation', { params: { token, project } }),
  
  getProjectChat: (projectId: number) =>
    apiClient.get(`/api/projects/${projectId}/chat`),
};

export const issueAPI = {
  createIssue: (data: {
    title: string;
    description: string;
    status: string;
    projectId: number;
    priority: string;
    dueDate: string;
  }) => apiClient.post('/api/issues', data),
  
  getIssueById: (id: number) =>
    apiClient.get(`/api/issues/${id}`),
  
  getIssuesByProjectId: (projectId: number) =>
    apiClient.get(`/api/issues/project/${projectId}`),
  
  updateIssueStatus: (issueId: number, status: string) =>
    apiClient.put(`/api/issues/${issueId}/status/${status}`),
  
  assignUserToIssue: (issueId: number, userId: number) =>
    apiClient.put(`/api/issues/${issueId}/assignee/${userId}`),
  
  deleteIssue: (id: number) =>
    apiClient.delete(`/api/issues/${id}`),
};

export const userAPI = {
  getProfile: () =>
    apiClient.get('/api/users/profile'),
  
  getUsers: () =>
    apiClient.get('/api/users/profiles'),
};

export const messageAPI = {
  sendMessage: (data: { senderId: number; projectId: number; content: string }) =>
    apiClient.post('/api/messages/send', data),
  
  getMessagesByProjectId: (projectId: number) =>
    apiClient.get(`/api/messages/chat/${projectId}`),
};

export const commentAPI = {
  createComment: (data: { issueId: number; content: string }) =>
    apiClient.post('/api/comments', data),
  
  getCommentsByIssueId: (issueId: number) =>
    apiClient.get(`/api/comments/${issueId}`),
  
  deleteComment: (commentId: number) =>
    apiClient.delete(`/api/comments/${commentId}`),
};

export const subscriptionAPI = {
  getUserSubscription: () =>
    apiClient.get('/api/subscription/user'),
  
  upgradeSubscription: (planType: 'FREE' | 'MONTHLY' | 'ANNUALLY') =>
    apiClient.put('/api/subscription/upgrade', null, { params: { planType } }),
};

export const paymentAPI = {
  createPaymentLink: (planType: 'FREE' | 'MONTHLY' | 'ANNUALLY') =>
    apiClient.post(`/api/payment/${planType}`),
};

export default apiClient;