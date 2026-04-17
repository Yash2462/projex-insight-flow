import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { issueAPI, projectAPI, userAPI } from "@/services/api";
import { useWebSocket } from "@/hooks/use-websocket";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  AlertCircle,
  ArrowLeft,
  Tag,
  User as UserIcon,
  Plus,
  UserPlus,
  Calendar,
  MessageCircle,
  Settings,
  Eye,
  Loader2,
  AlertTriangle,
  Layout
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import IssueDetail from "@/components/IssueDetail";
import ProjectChat from "@/components/ProjectChat";
import InvitationLinkGenerator from "@/components/InvitationLinkGenerator";
import UserProfile from "@/components/UserProfile";
import DirectMessage from "@/components/DirectMessage";
import KanbanBoard from "@/components/kanban/KanbanBoard";

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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const projectId = parseInt(id || "0", 10);

  // WebSocket for real-time updates
  const { subscribe, isConnected } = useWebSocket(projectId);

  useEffect(() => {
    if (isConnected && projectId) {
      // Subscribe to board updates
      subscribe(`/topic/project/${projectId}/board`, (event) => {
        // Refresh project data when board changes
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        
        // Optional: show toast for certain events
        if (event.type === "ISSUE_CREATED") {
          toast({ title: "New Issue", description: `${event.issue.title} was created.` });
        } else if (event.type === "ISSUE_DELETED") {
          toast({ title: "Issue Deleted", description: `An issue was removed from the board.` });
        }
      });
    }
  }, [isConnected, projectId, subscribe, queryClient, toast]);

  // Modal states
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [selectedIssueForComments, setSelectedIssueForComments] = useState<Issue | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("kanban");

  // Get dynamic columns from project or fallback to defaults
  const projectColumns = (project as any)?.statuses?.map((s: string) => ({
    id: s,
    title: s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " "),
  })) || [
    { id: "TODO", title: "To Do" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "REVIEW", title: "In Review" },
    { id: "DONE", title: "Completed" },
  ];

  // Form states
  const [inviteEmail, setInviteEmail] = useState("");
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
  });

  // Queries
  const { data: project, isLoading: isProjectLoading, error: projectError } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await projectAPI.getProjectById(projectId);
      return response.data.data as Project;
    },
    enabled: !!projectId,
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await userAPI.getUsers();
      return response.data.data as User[];
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data as User;
    },
  });

  // Mutations
  const createIssueMutation = useMutation({
    mutationFn: (data: any) => issueAPI.createIssue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      userAPI.completeOnboardingStep("create_issue");
      toast({ title: "Success", description: "Issue created successfully" });
      setIssueModalOpen(false);
      setNewIssue({ title: "", description: "", status: "TODO", priority: "MEDIUM", dueDate: "" });
    },
  });

  const updateIssueStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => issueAPI.updateIssueStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });

  const assignUserMutation = useMutation({
    mutationFn: ({ issueId, userId }: { issueId: number; userId: number }) => issueAPI.assignUserToIssue(issueId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast({ title: "Success", description: "User assigned successfully" });
      setAssignModalOpen(false);
    },
  });

  const deleteIssueMutation = useMutation({
    mutationFn: (id: number) => issueAPI.deleteIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast({ title: "Success", description: "Issue deleted" });
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: (data: { email: string; projectId: number }) => projectAPI.inviteToProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      userAPI.completeOnboardingStep("invite_member");
      toast({ title: "Success", description: "Invitation sent" });
      setInviteModalOpen(false);
      setInviteEmail("");
    },
  });

  // Handlers
  const handleCreateIssue = () => {
    if (!newIssue.title.trim()) return;
    createIssueMutation.mutate({ ...newIssue, projectId });
  };

  const openCreateIssueModal = (status: string) => {
    setNewIssue(prev => ({ ...prev, status }));
    setIssueModalOpen(true);
  };

  if (isProjectLoading) {
    return (
      <div className="min-h-screen bg-background p-6 lg:ml-64 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="min-h-screen bg-background p-6 lg:ml-64 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
          <Button onClick={() => navigate("/dashboard")} variant="outline">Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const getInitials = (user: User) => {
    return user.fullName?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 lg:ml-64">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Breadcrumbs & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.name}</h1>
              </div>
              <p className="text-muted-foreground text-sm mt-1">{project.category} &bull; {project.team?.length} members</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setInviteModalOpen(true)} variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5">
              <UserPlus className="h-4 w-4 mr-2" /> Invite
            </Button>
            <Button onClick={() => setIssueModalOpen(true)} className="bg-gradient-primary hover:opacity-90 shadow-glow rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> New Issue
            </Button>
          </div>
        </div>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl w-full lg:w-auto overflow-x-auto inline-flex whitespace-nowrap">
            <TabsTrigger value="kanban" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">Board</TabsTrigger>
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">Details</TabsTrigger>
            <TabsTrigger value="chat" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">Chat</TabsTrigger>
            <TabsTrigger value="team" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">Team</TabsTrigger>
            <TabsTrigger value="invites" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">Invites</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-0">
            <KanbanBoard 
              columns={projectColumns}
              issues={project.issues || []}
              onDeleteIssue={(id) => {
                if(window.confirm("Delete this issue?")) deleteIssueMutation.mutate(id);
              }}
              onUpdateIssueStatus={(id, status) => updateIssueStatusMutation.mutate({ id, status })}
              onViewComments={(issue) => setSelectedIssueForComments(issue)}
              onCreateIssue={openCreateIssueModal}
            />
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-0 shadow-elegant bg-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" /> Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {project.description || "No description provided."}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-6">
                    {project.tags?.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="rounded-md bg-primary/5 text-primary border-primary/10">
                        <Tag className="h-3 w-3 mr-1" /> {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant bg-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <UserIcon className="h-4 w-4 text-primary" /> Project Lead
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-background">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${project.owner.email}`} />
                      <AvatarFallback>{getInitials(project.owner)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{project.owner.fullName}</p>
                      <p className="text-xs text-muted-foreground">{project.owner.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="border-0 shadow-elegant h-[600px] overflow-hidden">
              <ProjectChat projectId={project.id} projectName={project.name} teamMembers={project.team || []} />
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card className="border-0 shadow-elegant bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.team?.map((member) => (
                    <div key={member.id} className="group p-4 rounded-xl border bg-background/50 hover:bg-background hover:shadow-md transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}`} />
                          <AvatarFallback>{getInitials(member)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{member.fullName}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedUser(member); setProfileModalOpen(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invites">
            <InvitationLinkGenerator projectId={project.id} projectName={project.name} onSendInvitation={() => {}} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <Dialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-muted/20 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">New Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</Label>
              <Input 
                value={newIssue.title} 
                onChange={e => setNewIssue({...newIssue, title: e.target.value})} 
                placeholder="Briefly describe the task"
                className="bg-background/50 border-primary/10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
              <Textarea 
                value={newIssue.description} 
                onChange={e => setNewIssue({...newIssue, description: e.target.value})} 
                placeholder="Add more details..."
                className="bg-background/50 border-primary/10 min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority</Label>
                <Select value={newIssue.priority} onValueChange={v => setNewIssue({...newIssue, priority: v})}>
                  <SelectTrigger className="bg-background/50 border-primary/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Due Date</Label>
                <Input type="date" value={newIssue.dueDate} onChange={e => setNewIssue({...newIssue, dueDate: e.target.value})} className="bg-background/50 border-primary/10" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateIssue} disabled={createIssueMutation.isPending} className="w-full bg-gradient-primary">
              {createIssueMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Issue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Invite Member</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email address" />
          </div>
          <DialogFooter>
            <Button onClick={() => inviteUserMutation.mutate({ email: inviteEmail, projectId })} disabled={inviteUserMutation.isPending} className="w-full">
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Discussion Dialog */}
      {selectedIssueForComments && (
        <Dialog open={!!selectedIssueForComments} onOpenChange={o => !o && setSelectedIssueForComments(null)}>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden border-0 shadow-2xl">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" /> {selectedIssueForComments.title}
              </DialogTitle>
              <DialogDescription>Discussion & History</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden p-6">
              <IssueDetail 
                issueId={selectedIssueForComments.id} 
                issueName={selectedIssueForComments.title} 
                onClose={() => setSelectedIssueForComments(null)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* User Profile & DM Modals would follow same pattern */}
    </div>
  );
};

export default ProjectDetails;
