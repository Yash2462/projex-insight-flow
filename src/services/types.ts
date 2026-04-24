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

export interface Message {
  id: number;
  content: string;
  createdAt: string;
  sender: User;
  receiver: User;
  projectId?: number;
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
