import axios from 'axios';

const API_URL = 'http://localhost:8080';

// Add a global response interceptor to the default axios instance
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const responseData = error.response.data;
      
      // Check if the response indicates we should redirect to login
      if (responseData?.redirectToLogin === true) {
        // Clear any existing auth token
        localStorage.removeItem('token');
        
        // If we're not already on the login page, redirect to it
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for session management
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

// Add response interceptor to handle 401 responses with redirectToLogin
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const responseData = error.response.data;
      
      // Check if the response indicates we should redirect to login
      if (responseData?.redirectToLogin === true) {
        // Clear any existing auth token
        localStorage.removeItem('token');
        
        // If we're not already on the login page, redirect to it
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// API Response Types
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
  error?: {
    code: string;
    message: string;
    redirectToLogin?: boolean;
  };
}

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
    apiClient.get<ApiResponse<any[]>>('/api/projects', { params }),
  
  getProjectById: (id: number) =>
    apiClient.get<ApiResponse<any>>(`/api/projects/${id}`),
  
  createProject: (data: any) =>
    apiClient.post<ApiResponse<any>>('/api/projects', data),
  
  updateProject: (id: number, data: any) =>
    apiClient.put<ApiResponse<any>>(`/api/projects/${id}`, data),
  
  deleteProject: (id: number) =>
    apiClient.delete<ApiResponse<any>>(`/api/projects/${id}`),
  
  searchProjects: (keyword?: string) =>
    apiClient.get<ApiResponse<any[]>>('/api/projects/search', { params: { keyword } }),
  
  inviteToProject: (data: { email: string; projectId: number }) =>
    apiClient.post<ApiResponse<any>>('/api/projects/invite', data),
  
  acceptInvitation: (token: string) =>
    axios.get<ApiResponse<any>>(`${API_URL}/api/projects/accept_invitation`, { params: { token } }),
};

export const issueAPI = {
  createIssue: (data: {
    title: string;
    description: string;
    status: string;
    projectId: number;
    priority: string;
    dueDate: string;
  }) => apiClient.post<ApiResponse<any>>('/api/issues', data),
  
  getIssueById: (id: number) =>
    apiClient.get<ApiResponse<any>>(`/api/issues/${id}`),
  
  getIssuesByProjectId: (projectId: number) =>
    apiClient.get<ApiResponse<any[]>>(`/api/issues/project/${projectId}`),
  
  updateIssueStatus: (issueId: number, status: string) =>
    apiClient.put<ApiResponse<any>>(`/api/issues/${issueId}/status/${status}`),
  
  assignUserToIssue: (issueId: number, userId: number) =>
    apiClient.put<ApiResponse<any>>(`/api/issues/${issueId}/assignee/${userId}`),
  
  deleteIssue: (id: number) =>
    apiClient.delete<ApiResponse<any>>(`/api/issues/${id}`),
};

export const userAPI = {
  getProfile: () =>
    apiClient.get<ApiResponse<any>>('/api/users/profile'),
  
  getUsers: () =>
    apiClient.get<ApiResponse<any[]>>('/api/users/profiles'),

  getUserById: (id: number) =>
    apiClient.get<ApiResponse<any>>(`/api/users/${id}`),

  completeOnboardingStep: (stepId: string) =>
    apiClient.post<ApiResponse<any>>(`/api/users/onboarding/step/${stepId}`),
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