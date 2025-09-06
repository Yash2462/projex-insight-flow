import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { issueAPI, projectAPI, userAPI } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import IssueComments from "@/components/IssueComments";
import ProjectChat from "@/components/ProjectChat";

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

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form states
  const [inviteEmail, setInviteEmail] = useState("");
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
  });

  // Modal states
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [selectedIssueForComments, setSelectedIssueForComments] = useState<Issue | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await projectAPI.getProjectById(Number(id));
        setProject(res.data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch project details",
          variant: "destructive",
        });
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await userAPI.getUsers();
        setUsers(res.data.data || []);
      } catch (error) {
        // Fallback to mock users if API fails
        setUsers([
          { id: 1, fullName: "John Doe", email: "john@example.com" },
          { id: 2, fullName: "Jane Smith", email: "jane@example.com" },
          { id: 3, fullName: "Bob Wilson", email: "bob@example.com" },
        ]);
      }
    };

    if (id) {
      fetchProject();
      fetchUsers();
    }
  }, [id]);

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await projectAPI.inviteToProject({
        email: inviteEmail,
        projectId: Number(id), // make sure `id` is a number here
      });

      toast({
        title: "Success",
        description: "User invited successfully",
      });

      setInviteEmail("");
      setInviteModalOpen(false);
      // Refresh project data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to invite user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

    setLoading(true);
    try {
      await issueAPI.createIssue({
        ...newIssue,
        projectId: Number(id), // ensure projectId is numeric
      });

      toast({
        title: "Success",
        description: "Issue created successfully",
      });

      setNewIssue({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        dueDate: "",
      });
      setIssueModalOpen(false);
      // Refresh project data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create issue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async (issueId: number, userId: number) => {
    setLoading(true);
    try {
      await issueAPI.assignUserToIssue(issueId, userId);

      toast({
        title: "Success",
        description: "User assigned to issue successfully",
      });
      setAssignModalOpen(false);
      // Refresh project data
      const res = await projectAPI.getProjectById(Number(id));
      setProject(res.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIssue = async (issueId: number) => {
    if (!confirm("Are you sure you want to delete this issue?")) return;

    setLoading(true);
    try {
        await issueAPI.deleteIssue(issueId);
      toast({
        title: "Success",
        description: "Issue deleted successfully",
      });
      // Refresh project data
      const res = await projectAPI.getProjectById(Number(id));
      setProject(res.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete issue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIssueStatus = async (issueId: number, status: string) => {
    setLoading(true);
    try {
      await issueAPI.updateIssueStatus(issueId, status);

      toast({
        title: "Success",
        description: "Issue status updated successfully",
      });
      // Refresh project data
      const res = await projectAPI.getProjectById(Number(id));
      setProject(res.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update issue status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20";
      case "low":
        return "bg-success/10 text-success border-success/20 hover:bg-success/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "in-progress":
        return <PlayCircle className="h-4 w-4 text-primary" />;
      case "pending":
        return <PauseCircle className="h-4 w-4 text-warning" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!project)
    return (
      <div className="min-h-screen bg-background p-6 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );

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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
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
                <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteUser} disabled={loading} variant="hero">
                  {loading ? "Inviting..." : "Send Invite"}
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
                  <Label htmlFor="title">Title</Label>
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
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
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
                <Button variant="outline" onClick={() => setIssueModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateIssue}
                  disabled={loading}
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary/10"
                >
                  {loading ? "Creating..." : "Create Issue"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
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
                      {project.description}
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
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {project.owner.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{project.owner.fullName}</p>
                      <p className="text-sm text-muted-foreground">{project.owner.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            {project.issues?.length > 0 ? (
              <div className="grid gap-6">
                {project.issues.map((issue: Issue) => (
                  <Card key={issue.id} className="border-0 shadow-lg bg-gradient-to-br from-card/50 to-background hover:shadow-xl transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-foreground mb-2">{issue.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{issue.description}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
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
                              onClick={() => handleUpdateIssueStatus(issue.id, "completed")}
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
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(issue.dueDate).toLocaleDateString()}
                        </span>
                      </div>

                      {issue.assignee && (
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {issue.assignee.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Assigned to {issue.assignee.fullName}
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
                {project.team?.length > 0 ? (
                  <div className="grid gap-4">
                    {project.team.map((member: User) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-background/60 hover:shadow-md transition-all duration-200"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-lg font-medium text-primary">
                            {member.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{member.fullName}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                        <Badge variant="outline">Member</Badge>
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
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() =>
                    selectedIssueId && handleAssignUser(selectedIssueId, user.id)
                  }
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetails;
