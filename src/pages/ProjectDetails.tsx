import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { issueAPI, projectAPI, userAPI } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  AlertCircle,
  ArrowLeft,
  Tag,
  User,
  Plus,
  UserPlus,
  MoreVertical,
  Calendar,
  Clock,
  Trash2,
  UserCheck,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  XCircle,
  MessageCircle,
  Settings,
  Eye,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import IssueComments from "@/components/IssueComments";
import ProjectChat from "@/components/ProjectChat";
import InvitationLinkGenerator from "@/components/InvitationLinkGenerator";
import UserProfile from "@/components/UserProfile";
import DirectMessage from "@/components/DirectMessage";

interface User {
  id: number;
  fullName: string;
  email: string;
}

interface Issue {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee?: User;
}

interface Project {
  id: number;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  owner: User;
  team?: User[];
  issues?: Issue[];
}

interface ApiResponse<T = any> {
  data?: T;
  success?: boolean;
  message?: string;
}

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Form states
  const [inviteEmail, setInviteEmail] = useState("");
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
  });

  // Modal states
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [selectedIssueForComments, setSelectedIssueForComments] = useState<Issue | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Helper function to safely extract data from API responses
  const extractApiData = <T,>(response: any): T | null => {
    // Handle different possible response structures
    if (response?.data?.data) return response.data.data;
    if (response?.data) return response.data;
    return response || null;
  };

  // Helper function to safely generate initials from name or email
  const getInitials = (user: User): string => {
    if (!user) return "?";
    
    const name = user.fullName || user.email || "Unknown";
    return name
      .split(" ")
      .filter(Boolean) // Remove empty strings
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2); // Limit to 2 characters max
  };

  // Fetch project data with proper error handling
  const fetchProject = useCallback(async () => {
    if (!id) return;
    
    try {
      const projectId = parseInt(id, 10);
      if (isNaN(projectId)) {
        throw new Error('Invalid project ID');
      }

      const response = await projectAPI.getProjectById(projectId);
      const projectData = extractApiData<Project>(response);
      
      if (!projectData) {
        throw new Error('No project data received');
      }
      
      setProject(projectData);
      setError(null);
    } catch (error: any) {
      console.error('Failed to fetch project:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch project details';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [id, toast]);

  // Fetch users with fallback
  const fetchUsers = useCallback(async () => {
    try {
      const response = await userAPI.getUsers();
      const usersData = extractApiData<User[]>(response);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Fallback to mock users if API fails
      setUsers([
        { id: 1, fullName: "John Doe", email: "john@example.com" },
        { id: 2, fullName: "Jane Smith", email: "jane@example.com" },
        { id: 3, fullName: "Bob Wilson", email: "bob@example.com" },
      ]);
    }
  }, []);

  // Fetch current user with fallback
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = extractApiData<User>(response);
      setCurrentUser(userData || { id: 1, fullName: "Current User", email: "current@example.com" });
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      // Fallback current user
      setCurrentUser({ id: 1, fullName: "Current User", email: "current@example.com" });
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      if (id) {
        await Promise.all([
          fetchProject(),
          fetchUsers(),
          fetchCurrentUser(),
        ]);
      }
      
      setLoading(false);
    };

    loadData();
  }, [id, fetchProject, fetchUsers, fetchCurrentUser]);

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInviteUser = async () => {
    const trimmedEmail = inviteEmail.trim();
    
    if (!trimmedEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    setActionLoading(true);
    try {
      const projectId = parseInt(id, 10);
      await projectAPI.inviteToProject({
        email: trimmedEmail,
        projectId: projectId,
      });

      toast({
        title: "Success",
        description: "User invited successfully",
      });

      setInviteEmail("");
      setInviteModalOpen(false);
      
      // Refresh project data
      await fetchProject();
    } catch (error: any) {
      console.error('Failed to invite user:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to invite user';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateIssue = async () => {
    if (!newIssue.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter an issue title",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    setActionLoading(true);
    try {
      const projectId = parseInt(id, 10);
      await issueAPI.createIssue({
        ...newIssue,
        title: newIssue.title.trim(),
        description: newIssue.description.trim(),
        projectId: projectId,
      });

      toast({
        title: "Success",
        description: "Issue created successfully",
      });

      setNewIssue({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
      });
      setIssueModalOpen(false);
      
      // Refresh project data
      await fetchProject();
    } catch (error: any) {
      console.error('Failed to create issue:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to create issue';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignUser = async (issueId: number, userId: number) => {
    setActionLoading(true);
    try {
      await issueAPI.assignUserToIssue(issueId, userId);

      toast({
        title: "Success",
        description: "User assigned to issue successfully",
      });
      
      setAssignModalOpen(false);
      setSelectedIssueId(null);
      
      // Refresh project data
      await fetchProject();
    } catch (error: any) {
      console.error('Failed to assign user:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to assign user';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteIssue = async (issueId: number) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    setActionLoading(true);
    try {
      await issueAPI.deleteIssue(issueId);
      
      toast({
        title: "Success",
        description: "Issue deleted successfully",
      });
      
      // Refresh project data
      await fetchProject();
    } catch (error: any) {
      console.error('Failed to delete issue:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to delete issue';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateIssueStatus = async (issueId: number, status: string) => {
    setActionLoading(true);
    try {
      await issueAPI.updateIssueStatus(issueId, status);

      toast({
        title: "Success",
        description: "Issue status updated successfully",
      });
      
      // Refresh project data
      await fetchProject();
    } catch (error: any) {
      console.error('Failed to update issue status:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to update issue status';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setProfileModalOpen(true);
  };

  const handleMessageUser = (user: User) => {
    setSelectedUser(user);
    setMessageModalOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
      case "low":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "done":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
      case "in_progress":
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case "pending":
      case "todo":
        return <PauseCircle className="h-4 w-4 text-yellow-600" />;
      case "cancelled":
      case "blocked":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 lg:ml-64 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Error Loading Project</h3>
            <p className="text-muted-foreground mb-6 text-center">{error}</p>
            <div className="flex gap-2">
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Project not found
  if (!project) {
    return (
      <div className="min-h-screen bg-background p-6 lg:ml-64 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-muted-foreground/60 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Project Not Found</h3>
            <p className="text-muted-foreground mb-6 text-center">
              The project you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 lg:ml-64">
      <div className="p-6 space-y-8">
        {/* Header with Back */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {project.name}
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Project ID: {project.id}
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {project.category && (
              <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                {project.category}
              </Badge>
            )}
            {project.tags?.map((tag: string, idx: number) => (
              <Badge
                key={idx}
                variant="secondary"
                className="flex items-center gap-1 bg-secondary/50"
              >
                <Tag className="h-3 w-3" /> {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="shadow-lg">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite User to Project</DialogTitle>
                <DialogDescription>
                  Enter the email address of the user you want to invite to this project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setInviteModalOpen(false);
                    setInviteEmail("");
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleInviteUser} 
                  disabled={actionLoading}
                  variant="hero"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Inviting...
                    </>
                  ) : (
                    "Send Invite"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Issue</DialogTitle>
                <DialogDescription>
                  Add a new issue to track work for this project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Issue title"
                    value={newIssue.title}
                    onChange={(e) =>
                      setNewIssue({ ...newIssue, title: e.target.value })
                    }
                    className="focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Issue description"
                    value={newIssue.description}
                    onChange={(e) =>
                      setNewIssue({ ...newIssue, description: e.target.value })
                    }
                    className="focus:ring-2 focus:ring-primary/20"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newIssue.priority}
                      onValueChange={(value) =>
                        setNewIssue({ ...newIssue, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newIssue.dueDate}
                      onChange={(e) =>
                        setNewIssue({ ...newIssue, dueDate: e.target.value })
                      }
                      className="focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIssueModalOpen(false);
                    setNewIssue({
                      title: "",
                      description: "",
                      status: "TODO",
                      priority: "MEDIUM",
                      dueDate: "",
                    });
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateIssue}
                  disabled={actionLoading}
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary/10"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Issue"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="issues" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Issues ({project.issues?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Team Chat
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team ({project.team?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="invites" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invitations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Info */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-card/50 to-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      Project Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {project.description || "No description provided"}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <h4 className="font-semibold text-primary mb-2">Issues</h4>
                        <p className="text-2xl font-bold">{project.issues?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Total issues</p>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <h4 className="font-semibold text-primary mb-2">Team Size</h4>
                        <p className="text-2xl font-bold">{project.team?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Active members</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Project Owner */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-card/50 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Project Owner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${project.owner.email}`} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                        {project.owner.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{project.owner.fullName || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">{project.owner.email || "No email"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            {project.issues && project.issues.length > 0 ? (
              <div className="grid gap-6">
                {project.issues.map((issue: Issue) => (
                  <Card key={issue.id} className="border-0 shadow-lg bg-gradient-to-br from-card/50 to-background hover:shadow-xl transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-foreground mb-2">{issue.title}</h3>
                          {issue.description && (
                            <p className="text-muted-foreground leading-relaxed">{issue.description}</p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-primary/10" disabled={actionLoading}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedIssueForComments(issue)}>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              View Comments
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedIssueId(issue.id);
                                setAssignModalOpen(true);
                              }}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Assign User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateIssueStatus(issue.id, "DONE")}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteIssue(issue.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Issue
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getStatusIcon(issue.status)}
                          {issue.status}
                        </Badge>
                        <Badge className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                        {issue.dueDate && (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Due: {formatDate(issue.dueDate)}
                          </span>
                        )}
                      </div>

                      {issue.assignee && (
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                          <Avatar className="w-8 h-8">
                            <AvatarImage 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${issue.assignee.email}`} 
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                              {issue.assignee ? getInitials(issue.assignee) : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            Assigned to {issue.assignee?.fullName || "Unknown User"}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <AlertCircle className="h-16 w-16 text-muted-foreground/60 mb-6" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No issues found</h3>
                  <p className="text-muted-foreground mb-6">Create your first issue to get started</p>
                  <Button onClick={() => setIssueModalOpen(true)} variant="hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Issue
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="chat">
            <ProjectChat 
              projectId={project.id} 
              projectName={project.name}
              teamMembers={project.team || []}
            />
          </TabsContent>

          <TabsContent value="team">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card/50 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Team Members
                  <Badge variant="secondary">{project.team?.length || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.team && project.team.length > 0 ? (
                  <div className="grid gap-4">
                    {project.team.map((member: User) => (
                      <div
                        key={member.id}
                        className="group flex items-center gap-4 p-4 rounded-lg border bg-background/60 hover:shadow-md transition-all duration-200"
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}`} 
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                            {getInitials(member)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">{member.fullName || "Unknown User"}</p>
                          <p className="text-sm text-muted-foreground truncate">{member.email || "No email"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/5 border-primary/20">
                            Member
                          </Badge>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewProfile(member)}
                              className="hover:bg-primary/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMessageUser(member)}
                              className="hover:bg-primary/10"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No team members yet</p>
                    <Button onClick={() => setInviteModalOpen(true)} variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Members
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invites">
            <InvitationLinkGenerator 
              projectId={project.id}
              projectName={project.name}
              onSendInvitation={async (email: string, inviteLink: string) => {
                // Here you could integrate with an email service
                console.log(`Sending invitation to ${email}: ${inviteLink}`);
                // For now, just show success message
                toast({
                  title: "Invitation Ready",
                  description: `Invitation link generated for ${email}. Copy the link to share it.`,
                });
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Issue Comments Dialog */}
      {selectedIssueForComments && (
        <Dialog 
          open={!!selectedIssueForComments} 
          onOpenChange={(open) => !open && setSelectedIssueForComments(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Issue Discussion
              </DialogTitle>
              <DialogDescription>
                {selectedIssueForComments.title}
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-hidden">
              <IssueComments 
                issueId={selectedIssueForComments.id} 
                issueName={selectedIssueForComments.title}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Assign User Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign User to Issue</DialogTitle>
            <DialogDescription>
              Select a user to assign to this issue.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {users.length > 0 ? (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors ${
                      actionLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => {
                      if (!actionLoading && selectedIssueId) {
                        handleAssignUser(selectedIssueId, user.id);
                      }
                    }}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.fullName || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">{user.email || "No email"}</p>
                    </div>
                    {actionLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No users available</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAssignModalOpen(false);
                setSelectedIssueId(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Profile Modal */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Profile
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            {selectedUser && (
              <UserProfile 
                userId={selectedUser.id} 
                onMessageClick={(user) => {
                  setProfileModalOpen(false);
                  handleMessageUser(user);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Direct Message Modal */}
      <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <div className="overflow-hidden">
            {selectedUser && currentUser && (
              <DirectMessage 
                recipientUser={selectedUser}
                currentUserId={currentUser.id}
                onClose={() => setMessageModalOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetails;