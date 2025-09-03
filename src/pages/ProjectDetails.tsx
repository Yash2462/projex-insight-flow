import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient, { issueAPI, projectAPI } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";

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
        // Assuming there's an API to get users
        // const res = await projectAPI.getUsers();
        // setUsers(res.data.data);

        // Mock users for demonstration
        setUsers([
          { id: 1, fullName: "John Doe", email: "john@example.com" },
          { id: 2, fullName: "Jane Smith", email: "jane@example.com" },
          { id: 3, fullName: "Bob Wilson", email: "bob@example.com" },
        ]);
      } catch (error) {
        console.error("Failed to fetch users");
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
      await fetch(`/api/issues/${issueId}/assignee/${userId}`, {
        method: "POST",
      });

      toast({
        title: "Success",
        description: "User assigned to issue successfully",
      });
      setAssignModalOpen(false);
      // Refresh project data
      window.location.reload();
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
        debugger
      toast({
        title: "Success",
        description: "Issue deleted successfully",
      });
      // Refresh project data
      window.location.reload();
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
        return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 hover:text-red-800 hover:border-red-300";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 hover:text-amber-800 hover:border-amber-300";
      case "low":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 hover:text-emerald-800 hover:border-emerald-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <PauseCircle className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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
    <div className="min-h-screen bg-background p-6 lg:ml-64 space-y-6">
      {/* Header with Back */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {project.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Project ID: {project.id}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {project.category && (
            <Badge
              className="bg-indigo-100 text-indigo-700 border border-indigo-200 
             hover:bg-indigo-200 hover:text-indigo-800 hover:border-indigo-300 
             transition-colors duration-200 ease-in-out"
            >
              {project.category}
            </Badge>
          )}
          {project.tags?.map((tag: string, idx: number) => (
            <Badge
              key={idx}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <Tag className="h-3 w-3" /> {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-400 hover:bg-blue-600">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite User to Project</DialogTitle>
              <DialogDescription>
                Enter the email address of the user you want to invite to this
                project.
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInviteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteUser}
                disabled={loading}
                className="bg-blue-400 hover:bg-blue-600"
              >
                {loading ? "Inviting..." : "Send Invite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
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
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIssueModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateIssue}
                disabled={loading}
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                {loading ? "Creating..." : "Create Issue"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side: Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {project.description}
              </p>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Project Owner
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {project.owner.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{project.owner.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.owner.email}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Team Members
                </span>
                <Badge variant="secondary">{project.team?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.team?.length > 0 ? (
                <div className="space-y-3">
                  {project.team.map((member: User) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
                    >
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {member.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {member.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No team members yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    Invite users to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side: Issues */}
        <div className="lg:col-span-2">
          <Card className="h-full border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Issues
                </span>
                <Badge variant="secondary">{project.issues?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.issues?.length > 0 ? (
                <div className="space-y-4">
                  {project.issues.map((issue: Issue) => (
                    <div
                      key={issue.id}
                      className="group p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                            {issue.title}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {issue.description}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                              onClick={() =>
                                handleUpdateIssueStatus(issue.id, "completed")
                              }
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

                      <div className="flex items-center gap-3 text-sm flex-wrap">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(issue.status)}
                          {issue.status}
                        </Badge>
                        <Badge className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(issue.dueDate).toLocaleDateString()}
                        </span>
                      </div>

                      {issue.assignee && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-muted">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
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
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-16 px-4 
                  rounded-2xl border border-dashed border-gray-200 
                  bg-gray-50/50 dark:bg-gray-900/20 transition-all"
                >
                  <AlertCircle className="h-16 w-16 text-muted-foreground/60 mb-6 animate-pulse" />

                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    No issues found
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Create your first issue to get started
                  </p>

                  <Button
                    onClick={() => setIssueModalOpen(true)}
                    className="bg-green-100 text-green-700 border border-green-200 
                 hover:bg-green-200 hover:text-green-800 
                 transition-colors duration-200 ease-in-out"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Issue
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
                    selectedIssueId &&
                    handleAssignUser(selectedIssueId, user.id)
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
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
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
