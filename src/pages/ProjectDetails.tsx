import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { issueAPI } from "@/services/issueService";
import { projectAPI } from "@/services/projectService";
import { userAPI } from "@/services/userService";
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
  Layout,
  BarChart3,
  ShieldCheck
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import IssueDetail from "@/components/IssueDetail";
import ProjectChat from "@/components/ProjectChat";
import InvitationLinkGenerator from "@/components/InvitationLinkGenerator";
import UserProfile from "@/components/UserProfile";
import DirectMessage from "@/components/DirectMessage";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { getAvatarUrl } from "@/lib/utils";
import { Project, User, Issue } from "@/services/types";

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const projectId = parseInt(id || "0", 10);

  // Queries
  const { data: project, isLoading: isProjectLoading, error: projectError } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await projectAPI.getProjectById(projectId);
      return response.data.data as Project;
    },
    enabled: !!projectId,
  });

  // Dynamic columns from project statuses
  const dynamicColumns = useMemo(() => {
    if (!project?.statuses || project.statuses.length === 0) {
      return [
        { id: "TODO", title: "To Do" },
        { id: "IN_PROGRESS", title: "In Progress" },
        { id: "REVIEW", title: "Review" },
        { id: "DONE", title: "Done" },
      ];
    }
    return project.statuses.map(status => ({
      id: status,
      title: status.replace(/_/g, ' ').toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')
    }));
  }, [project?.statuses]);

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
  const [dmModalOpen, setDmModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedIssueForComments, setSelectedIssueForComments] = useState<Issue | null>(null);
  const [selectedIssueTab, setSelectedIssueTab] = useState<string>("details");

  // Form states
  const [inviteEmail, setInviteEmail] = useState("");
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
  });
  const [activeTab, setActiveTab] = useState("kanban");

  const { data: userRole } = useQuery({
    queryKey: ["projectRole", projectId],
    queryFn: async () => {
      const response = await projectAPI.getProjectRole(projectId);
      return response.data.data;
    },
    enabled: !!projectId,
  });

  const isOwner = userRole === 'OWNER';
  const canManage = isOwner || userRole === 'ADMIN';
  const isViewer = userRole === 'VIEWER';

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
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["project", projectId] });

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(["project", projectId]);

      // Optimistically update to the new value
      queryClient.setQueryData(["project", projectId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          issues: old.issues.map((issue: any) => 
            issue.id === id ? { ...issue, status } : issue
          )
        };
      });

      // Return a context object with the snapshotted value
      return { previousProject };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["project", projectId], context?.previousProject);
      toast({ title: "Update Failed", description: "Failed to move task. Reverting...", variant: "destructive" });
    },
    // Always refetch after error or success:
    onSettled: () => {
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
        <Card className="max-w-md w-full p-8 text-center rounded-[2rem] shadow-elegant border-primary/5">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
          <Button onClick={() => navigate("/dashboard")} variant="outline" className="rounded-xl">Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const getInitials = (user: User) => {
    return user.fullName?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  };

  return (
    <div className="min-h-screen bg-background lg:ml-64 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
      
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/projects")}
              className="text-muted-foreground hover:text-primary -ml-2 h-8 px-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-2" /> Back to Workspace
            </Button>
            <div className="flex items-center gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl shadow-sm ring-1 ring-primary/5">
                <Layout className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground">{project.name}</h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[10px] font-bold uppercase tracking-wider px-2">
                    {project.category || "Development"}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-muted-foreground opacity-40" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {project.team?.length || 0} Members
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-3 mr-3">
              {project.team?.slice(0, 4).map((m, i) => (
                <Avatar key={i} className="h-10 w-10 border-4 border-background ring-1 ring-primary/5 transition-transform hover:-translate-y-1 cursor-pointer">
                   <AvatarImage src={getAvatarUrl(m?.avatarUrl, m?.email)} />
                   <AvatarFallback className="text-[10px] bg-primary/5 text-primary font-bold">{m?.fullName?.[0] || '?'}</AvatarFallback>
                </Avatar>
              ))}
              {(project.team?.length || 0) > 4 && (
                <div className="h-10 w-10 rounded-full bg-muted border-4 border-background flex items-center justify-center text-[10px] font-black text-muted-foreground ring-1 ring-primary/5">
                  +{(project.team?.length || 0) - 4}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => navigate(`/projects/${projectId}/analytics`)}
                variant="outline" 
                className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold h-11 px-5 transition-all"
              >
                <BarChart3 className="h-4 w-4 mr-2" /> Analytics
              </Button>
              {isOwner && (
                <Button onClick={() => setInviteModalOpen(true)} variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold h-11 px-5 transition-all">
                  <UserPlus className="h-4 w-4 mr-2" /> Invite
                </Button>
              )}
              {!isViewer && (
                <Button onClick={() => setIssueModalOpen(true)} variant="hero" className="rounded-xl font-bold h-11 px-6 transition-all active:scale-95">
                  <Plus className="h-5 w-5 mr-2 stroke-[3px]" /> New Task
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
           <div className="glass-panel p-1 rounded-2xl inline-flex shadow-sm">
            <TabsList className="bg-transparent border-0 gap-1 h-10">
              <TabsTrigger value="kanban" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all font-bold text-[10px] uppercase tracking-[0.15em]">
                Board
              </TabsTrigger>
              <TabsTrigger value="overview" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all font-bold text-[10px] uppercase tracking-[0.15em]">
                Details
              </TabsTrigger>
              <TabsTrigger value="chat" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all font-bold text-[10px] uppercase tracking-[0.15em]">
                Discussion
              </TabsTrigger>
              <TabsTrigger value="team" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all font-bold text-[10px] uppercase tracking-[0.15em]">
                Members
              </TabsTrigger>
              <TabsTrigger value="invites" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all font-bold text-[10px] uppercase tracking-[0.15em]">
                Access
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="kanban" className="mt-0 outline-none">
            <KanbanBoard 
              columns={dynamicColumns}
              issues={project.issues || []}
              onDeleteIssue={(id) => {
                if (!canManage) {
                  toast({ title: "Denied", description: "You don't have permission to delete issues", variant: "destructive" });
                  return;
                }
                if(window.confirm("Delete this issue?")) deleteIssueMutation.mutate(id);
              }}
              onUpdateIssueStatus={(id, status) => {
                if (isViewer) {
                  toast({ title: "Denied", description: "Viewers cannot update status", variant: "destructive" });
                  return;
                }
                updateIssueStatusMutation.mutate({ id, status });
              }}
              onViewComments={(issue, initialTab = "details") => {
                setSelectedIssueForComments(issue);
                setSelectedIssueTab(initialTab);
              }}
              onCreateIssue={openCreateIssueModal}
            />
          </TabsContent>

          <TabsContent value="overview" className="outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <section className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Project Description
                  </h3>
                  <Card className="border border-primary/5 shadow-sm bg-card rounded-[2rem] overflow-hidden relative group">
                    <CardContent className="p-8">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                        {project.description || "No description provided."}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-primary/5">
                        {project.tags?.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="rounded-xl px-3 py-1 bg-primary/5 text-primary border-primary/10 font-bold text-[10px] uppercase">
                            <Tag className="h-3 w-3 mr-1.5 opacity-60" /> {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </div>

              <div className="space-y-8">
                <section className="space-y-4">
                   <h3 className="text-lg font-bold flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    Project Lead
                  </h3>
                  <Card className="border border-primary/5 shadow-sm bg-card rounded-[2rem] overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 border-4 border-white shadow-md ring-1 ring-primary/5">
                          <AvatarImage src={getAvatarUrl(project.owner.avatarUrl, project.owner.email)} />
                          <AvatarFallback className="bg-primary text-primary-foreground font-black">{project.owner.fullName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-bold text-base truncate">{project.owner.fullName}</p>
                          <p className="text-xs text-muted-foreground font-medium truncate opacity-60 uppercase tracking-tighter">{project.owner.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="outline-none">
            <Card className="border border-primary/5 shadow-elegant h-[650px] overflow-hidden rounded-[2.5rem] bg-card/30 backdrop-blur-xl relative">
              <ProjectChat projectId={project.id} projectName={project.name} teamMembers={project.team || []} />
            </Card>
          </TabsContent>

          <TabsContent value="team" className="outline-none">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {project.team?.map((member) => (
                  <Card key={member.id} className="group border border-primary/5 shadow-sm bg-card rounded-[2rem] hover:border-primary/20 hover:shadow-glow transition-all duration-500 overflow-hidden relative">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-primary/5 transition-transform group-hover:scale-105 duration-500">
                          <AvatarImage src={getAvatarUrl(member.avatarUrl, member.email)} />
                          <AvatarFallback className="bg-primary/5 text-primary font-bold">{member.fullName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{member.fullName}</p>
                          <p className="text-[10px] text-muted-foreground font-medium truncate opacity-60 uppercase">{member.email}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setSelectedUser(member); setProfileModalOpen(true); }}>
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
          </TabsContent>

          <TabsContent value="invites" className="outline-none">
            {isOwner ? (
              <InvitationLinkGenerator projectId={project.id} projectName={project.name} onSendInvitation={() => {}} />
            ) : (
              <div className="p-20 text-center glass-panel rounded-[3rem] border-dashed">
                <ShieldCheck className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold text-sm uppercase tracking-[0.2em]">Restricted Access</p>
                <p className="text-xs text-muted-foreground mt-2 font-medium opacity-60">Only the project owner can manage access & invitations.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals - Simplified for premium feel */}
      <Dialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-2xl border-primary/10 shadow-2xl rounded-[2rem] p-0 overflow-hidden">
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight text-foreground">Create Task</DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">Plan your next move</DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Title</Label>
                <Input 
                  value={newIssue.title} 
                  onChange={e => setNewIssue({...newIssue, title: e.target.value})} 
                  placeholder="Task name"
                  className="bg-background/50 border-primary/5 h-12 rounded-xl focus-visible:ring-primary/20 transition-all font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Context</Label>
                <Textarea 
                  value={newIssue.description} 
                  onChange={e => setNewIssue({...newIssue, description: e.target.value})} 
                  placeholder="Details & requirements..."
                  className="bg-background/50 border-primary/5 min-h-[120px] rounded-xl focus-visible:ring-primary/20 transition-all font-medium leading-relaxed"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Priority</Label>
                  <Select value={newIssue.priority} onValueChange={v => setNewIssue({...newIssue, priority: v})}>
                    <SelectTrigger className="bg-background/50 border-primary/5 h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-primary/10 p-1">
                      <SelectItem value="LOW" className="rounded-lg">Low</SelectItem>
                      <SelectItem value="MEDIUM" className="rounded-lg">Medium</SelectItem>
                      <SelectItem value="HIGH" className="rounded-lg text-destructive font-bold">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Deadline</Label>
                  <Input 
                   type="date" 
                   value={newIssue.dueDate} 
                   onChange={e => setNewIssue({...newIssue, dueDate: e.target.value})} 
                   className="bg-background/50 border-primary/10 h-12 rounded-xl dark:color-scheme-dark" 
                  />
                </div>              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button onClick={handleCreateIssue} disabled={createIssueMutation.isPending} variant="hero" className="w-full h-12 rounded-xl font-bold active:scale-95 transition-all">
                {createIssueMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Deploy Task"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-primary/10 shadow-2xl p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black">Invite Member</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Expand your team</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</Label>
               <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="name@company.com" className="h-12 rounded-xl border-primary/5 bg-muted/20" />
            </div>
            <Button onClick={() => inviteUserMutation.mutate({ email: inviteEmail, projectId })} disabled={inviteUserMutation.isPending} className="w-full h-12 bg-primary font-bold rounded-xl shadow-glow">
              {inviteUserMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Invitation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue Discussion Dialog */}
      {selectedIssueForComments && (
        <Dialog open={!!selectedIssueForComments} onOpenChange={o => !o && setSelectedIssueForComments(null)}>
          <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden border-0 shadow-[0_0_100px_rgba(0,0,0,0.4)] rounded-[2.5rem]">
            <div className="p-8 border-b bg-card/50 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black tracking-tight leading-none">{selectedIssueForComments.title}</DialogTitle>
                    <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-50">Task Discussion & File Space</DialogDescription>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                  selectedIssueForComments.priority === 'HIGH' ? 'text-destructive bg-destructive/5 border-destructive/10' : 'text-primary bg-primary/5 border-primary/10'
                }`}>
                  {selectedIssueForComments.priority} Priority
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-8 bg-background/50">
              <IssueDetail 
                issueId={selectedIssueForComments.id} 
                issueName={selectedIssueForComments.title} 
                onClose={() => setSelectedIssueForComments(null)}
                initialTab={selectedIssueTab}
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
