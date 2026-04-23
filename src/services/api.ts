import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// API Interfaces
export interface User {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  projectSize: number;
  onboardingCompleted: boolean;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  owner: User;
  team?: User[];
  issues?: Issue[];
  statuses?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  projectId: number;
  assignee?: User;
  storyPoints: number;
  estimatedHours: number;
  loggedHours: number;
  milestone?: string;
  subtasks?: string[];
  completedSubtasks?: string[];
  attachments?: Attachment[];
  comments?: Comment[];
}

export interface Attachment {
  id: number;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: User;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: User;
}

export interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  projectId?: number;
  issueId?: number;
  sender?: User;
}

export interface DashboardStatistics {
  totalProjects: number;
  totalProjectsChange: string;
  teamMembers: number;
  teamMembersChange: string;
  activeIssues: number;
  activeIssuesChange: string;
  completedTasks: number;
  completedTasksChange: string;
}

export interface ProjectCounts {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  recentlyCreated: number;
  overdue: number;
  dueSoon: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
}

export interface RecentActivity {
  id: number;
  action: string;
  time: string;
  type: string;
  userName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  status?: number;
}

// Axios Config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
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

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    axios.post(`${API_URL}/auth/reset-password`, data),
};

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
};

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

export const dashboardAPI = {
  getStatistics: () =>
    apiClient.get<ApiResponse<DashboardStatistics>>('/api/dashboard/statistics'),
  
  getRecentActivity: (limit?: number) =>
    apiClient.get<ApiResponse<RecentActivity[]>>('/api/dashboard/recent-activity', { params: { limit } }),
  
  getProjectCounts: () =>
    apiClient.get<ApiResponse<ProjectCounts>>('/api/dashboard/project-counts'),
};

export const commentAPI = {
  createComment: (data: { issueId: number; content: string }) =>
    apiClient.post<ApiResponse<Comment>>('/api/comments', data),
  
  getCommentsByIssueId: (issueId: number) =>
    apiClient.get<ApiResponse<Comment[]>>(`/api/comments/${issueId}`),
  
  deleteComment: (commentId: number) =>
    apiClient.delete<ApiResponse<any>>(`/api/comments/${commentId}`),
};

export const messageAPI = {
  sendDirectMessage: (data: { senderId: number; receiverId: number; content: string }) =>
    apiClient.post<ApiResponse<Message>>('/api/messages/direct/send', data),
  
  getDirectMessages: (userId: number) =>
    apiClient.get<ApiResponse<Message[]>>(`/api/messages/direct/${userId}`),
};

export const subscriptionAPI = {
  getUserSubscription: () =>
    apiClient.get<ApiResponse<any>>('/api/subscription/user'),
  
  upgradeSubscription: (planType: 'FREE' | 'MONTHLY' | 'ANNUALLY') =>
    apiClient.put<ApiResponse<any>>('/api/subscription/upgrade', null, { params: { planType } }),
};

export const paymentAPI = {
  createPaymentLink: (planType: 'FREE' | 'MONTHLY' | 'ANNUALLY') =>
    apiClient.post<ApiResponse<any>>(`/api/payment/${planType}`),
};

export default apiClient;
