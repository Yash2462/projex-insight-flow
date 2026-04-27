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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Info,
  Settings,
  Eye,
  Loader2,
  AlertTriangle,
  Layout,
  BarChart3,
  ShieldCheck,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProjectChat from "@/components/ProjectChat";
import InvitationLinkGenerator from "@/components/InvitationLinkGenerator";
import UserProfile from "@/components/UserProfile";
import DirectMessage from "@/components/DirectMessage";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import WorkflowManager from "@/components/kanban/WorkflowManager";
import CalendarView from "@/components/kanban/CalendarView";
import ProjectDataSeeder from "@/components/dashboard/ProjectDataSeeder";
import IssueDetail from "@/components/IssueDetail";
import { getAvatarUrl } from "@/lib/utils";
import { Project, User, Issue } from "@/services/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = parseInt(id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [activeTab, setActiveTab] = useState("kanban");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [dmModalOpen, setDmModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [newIssue, setNewIssue] = useState<Partial<Issue>>({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    status: "TODO"
  });

  const [selectedIssueForComments, setSelectedIssueForComments] = useState<Issue | null>(null);
  const [selectedIssueTab, setSelectedIssueTab] = useState("overview");

  // Queries
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data;
    },
  });

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await projectAPI.getProjectById(projectId);
      return response.data.data;
    },
  });

  const { data: userRole } = useQuery({
    queryKey: ["projectRole", projectId],
    queryFn: async () => {
      const response = await projectAPI.getProjectRole(projectId);
      return response.data.data;
    },
  });

  const isOwner = userRole === 'OWNER';
  const isViewer = userRole === 'VIEWER';
  const canManage = isOwner || userRole === 'ADMIN';

  // Mutations
  const deleteIssueMutation = useMutation({
    mutationFn: (id: number) => issueAPI.deleteIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast({ title: "Success", description: "Issue archived" });
    },
  });

  const reorderIssuesMutation = useMutation({
    mutationFn: (issueOrders: { id: number; index: number; status: string }[]) => issueAPI.reorderIssues(issueOrders),
    onMutate: async (newOrders) => {
      await queryClient.cancelQueries({ queryKey: ["project", projectId] });
      const previousProject = queryClient.getQueryData(["project", projectId]);
      
      queryClient.setQueryData(["project", projectId], (old: any) => {
        if (!old) return old;
        const updatedIssues = old.issues.map((issue: any) => {
          const newOrder = newOrders.find(o => o.id === issue.id);
          if (newOrder) {
            return { ...issue, orderIndex: newOrder.index, status: newOrder.status };
          }
          return issue;
        });
        return { ...old, issues: updatedIssues };
      });
      
      return { previousProject };
    },
    onError: (err, newOrders, context) => {
      queryClient.setQueryData(["project", projectId], context?.previousProject);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: Partial<Project>) => projectAPI.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast({ title: "Success", description: "Project workflow updated" });
      setWorkflowModalOpen(false);
    },
  });

  const updateIssueStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => issueAPI.updateIssue(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast({ title: "Task Moved" });
    },
  });

  const createIssueMutation = useMutation({
    mutationFn: (data: any) => issueAPI.createIssue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast({ title: "Task Deployed" });
      setIssueModalOpen(false);
      setNewIssue({ title: "", description: "", priority: "MEDIUM", dueDate: "", status: "TODO" });
    },
    onError: (error: any) => {
       toast({ title: "Creation Failed", description: error.response?.data?.message || "Check your input", variant: "destructive" });
    }
  });

  const inviteUserMutation = useMutation({
    mutationFn: (data: { email: string; projectId: number }) => projectAPI.inviteToProject(data),
    onSuccess: () => {
      toast({ title: "Invitation Sent", description: "User has been notified." });
      setInviteModalOpen(false);
      setInviteEmail("");
    },
  });

  const handleCreateIssue = () => {
    if (!newIssue.title?.trim()) return;
    createIssueMutation.mutate({ ...newIssue, projectId });
  };

  const openCreateIssueModal = (status: string) => {
    if (status === "NEW_LIST") {
      setWorkflowModalOpen(true);
      return;
    }
    setNewIssue(prev => ({ ...prev, status }));
    setIssueModalOpen(true);
  };

  const dynamicColumns = useMemo(() => {
    if (!project?.statuses || project.statuses.length === 0) {
      return [
        { id: "TODO", title: "Todo" },
        { id: "IN_PROGRESS", title: "In Progress" },
        { id: "REVIEW", title: "Review" },
        { id: "DONE", title: "Done" },
      ];
    }
    return project.statuses.map(status => ({
      id: status,
      title: (status || "").replace(/_/g, ' ').toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')
    }));
  }, [project?.statuses]);

  const { subscribe, isConnected } = useWebSocket(projectId);

  if (isProjectLoading || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Decrypting Workspace</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:ml-64 pb-20 md:pb-0">
      {/* High-End Responsive Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-primary/5 px-4 md:px-10 py-4 md:py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-3 md:p-4 bg-primary/10 rounded-2xl shadow-sm ring-1 ring-primary/5 shrink-0">
              <Layout className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-3xl font-black tracking-tight text-foreground truncate uppercase">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1 md:mt-1.5 overflow-x-auto no-scrollbar">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[8px] md:text-[10px] font-bold uppercase tracking-widest px-2 shrink-0">
                  {project.category || "General"}
                </Badge>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Users className="h-3 w-3 text-muted-foreground opacity-40" />
                  <span className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {project.team?.length || 0} Members
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3">
            {/* Team Stack - Premium Look */}
            <div className="flex -space-x-2.5 mr-1 md:mr-3 shrink-0">
              {project.team?.slice(0, 3).map((m, i) => (
                <Avatar key={i} className="h-8 w-8 md:h-10 md:w-10 border-2 border-background ring-1 ring-primary/5 transition-transform hover:-translate-y-1">
                   <AvatarImage src={getAvatarUrl(m?.avatarUrl, m?.email)} />
                   <AvatarFallback className="text-[10px] bg-primary/5 text-primary font-bold">{m?.fullName?.[0] || '?'}</AvatarFallback>
                </Avatar>
              ))}
              {(project.team?.length || 0) > 3 && (
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] md:text-[10px] font-black text-muted-foreground ring-1 ring-primary/5">
                  +{(project.team?.length || 0) - 3}
                </div>
              )}
            </div>
            
            {/* Desktop Actions Row */}
            <div className="hidden md:flex items-center gap-2">
              <Button onClick={() => navigate(`/projects/${projectId}/analytics`)} variant="outline" size="sm" className="rounded-xl border-primary/20 text-primary font-bold h-10 px-4">
                <BarChart3 className="h-4 w-4 mr-2" /> Analytics
              </Button>
              {isOwner && <ProjectDataSeeder projectId={projectId} statuses={project.statuses || []} />}
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-xl border-primary/20 text-primary font-bold h-10 px-4">
                      <Settings className="h-4 w-4 mr-2" /> Manage
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl shadow-elegant border-primary/10">
                    <DropdownMenuItem onClick={() => setWorkflowModalOpen(true)} className="rounded-xl font-bold text-[10px] uppercase py-3 cursor-pointer">
                       <Settings className="h-4 w-4 mr-3 text-primary" /> Workflow Design
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setInviteModalOpen(true)} className="rounded-xl font-bold text-[10px] uppercase py-3 cursor-pointer">
                       <UserPlus className="h-4 w-4 mr-3 text-primary" /> Add Operator
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {!isViewer && (
                <Button onClick={() => setIssueModalOpen(true)} variant="hero" size="sm" className="rounded-xl font-bold h-10 px-5 transition-all">
                  <Plus className="h-4 w-4 mr-2" /> New Task
                </Button>
              )}
            </div>

            {/* Mobile "More" Menu */}
            <div className="md:hidden">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-muted/10">
                       <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-primary/10">
                    <DropdownMenuItem onClick={() => navigate(`/projects/${projectId}/analytics`)} className="rounded-xl font-black text-[10px] uppercase py-4">
                       <BarChart3 className="h-4 w-4 mr-4 text-primary" /> Project Analytics
                    </DropdownMenuItem>
                    {isOwner && (
                      <>
                        <DropdownMenuItem onClick={() => setWorkflowModalOpen(true)} className="rounded-xl font-black text-[10px] uppercase py-4">
                          <Settings className="h-4 w-4 mr-4 text-primary" /> Manage Workflow
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setInviteModalOpen(true)} className="rounded-xl font-black text-[10px] uppercase py-4">
                          <UserPlus className="h-4 w-4 mr-4 text-primary" /> Invite Team
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Premium Navigation Hub - Mobile Optimized */}
        <div className="max-w-7xl mx-auto mt-6 md:mt-10 relative">
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none md:hidden" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none md:hidden" />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto no-scrollbar scroll-smooth flex">
              <TabsList className="bg-muted/10 p-1 rounded-[1.25rem] inline-flex w-max md:w-auto shadow-inner border border-primary/5 mb-1">
                {[
                  { id: "kanban", label: "Board", icon: Layout },
                  { id: "timeline", label: "Timeline", icon: Calendar },
                  { id: "overview", label: "Strategy", icon: Info },
                  { id: "chat", label: "Intel", icon: MessageCircle },
                  { id: "team", label: "Roster", icon: Users }
                ].map(tab => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="flex-1 md:flex-none rounded-xl px-5 h-9 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all duration-300 font-black text-[9px] md:text-[10px] uppercase tracking-widest gap-2"
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </div>
      </header>

      {/* Main Responsive Content Hub */}
      <main className="flex-1 p-4 md:px-10 md:py-8 max-w-7xl mx-auto w-full">
        <Tabs value={activeTab} className="h-full">
          {/* Board - Smooth Horizontal Scroll */}
          <TabsContent value="kanban" className="mt-0 outline-none h-full">
            <KanbanBoard 
              columns={dynamicColumns}
              issues={project.issues || []}
              onDeleteIssue={(id) => {
                if (!canManage) return;
                if(confirm("Terminate this task?")) deleteIssueMutation.mutate(id);
              }}
              onUpdateIssueStatus={(id, status) => {
                if (isViewer) return;
                updateIssueStatusMutation.mutate({ id, status });
              }}
              onReorderIssues={(orders) => {
                if (isViewer) return;
                reorderIssuesMutation.mutate(orders);
              }}
              onDeleteColumn={(columnId) => {
                if (!canManage) return;
                const newStatuses = (project.statuses || []).filter(s => s !== columnId);
                updateProjectMutation.mutate({ statuses: newStatuses });
              }}
              onViewComments={(issue, initialTab = "overview") => {
                setSelectedIssueForComments(issue);
                setSelectedIssueTab(initialTab);
              }}
              onCreateIssue={openCreateIssueModal}
            />
          </TabsContent>

          {/* Timeline - Full Width */}
          <TabsContent value="timeline" className="mt-0 outline-none animate-in fade-in duration-500">
            <CalendarView 
              issues={project.issues || []}
              onViewIssue={(issue) => {
                setSelectedIssueForComments(issue);
                setSelectedIssueTab("overview");
              }}
            />
          </TabsContent>

          {/* Overview - High Density */}
          <TabsContent value="overview" className="mt-0 outline-none animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2 text-primary">
                   <Info className="h-4 w-4" />
                   <h3 className="font-black text-[11px] uppercase tracking-widest">Project Strategy</h3>
                </div>
                <Card className="border border-primary/5 shadow-sm bg-card/40 backdrop-blur-sm rounded-[2rem] overflow-hidden group">
                  <CardContent className="p-8">
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium text-sm md:text-base">
                      {project.description || "No mission brief provided for this project."}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-primary/5">
                      {project.tags?.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="rounded-xl px-4 py-1.5 bg-primary/5 text-primary border-primary/10 font-black text-[9px] uppercase">
                          <Tag className="h-3 w-3 mr-2" /> {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                  <div className="flex items-center gap-2 text-primary">
                    <UserIcon className="h-4 w-4" />
                    <h3 className="font-black text-[11px] uppercase tracking-widest">Lead Agent</h3>
                  </div>
                  <Card className="border border-primary/5 shadow-sm bg-card/40 backdrop-blur-sm rounded-[2rem] overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 md:h-14 md:w-14 border-2 border-background shadow-md ring-2 ring-primary/5">
                          <AvatarImage src={getAvatarUrl(project.owner.avatarUrl, project.owner.email)} />
                          <AvatarFallback className="bg-primary text-primary-foreground font-black">{project.owner.fullName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-black text-sm md:text-base truncate">{project.owner.fullName}</p>
                          <p className="text-[10px] text-muted-foreground font-bold truncate opacity-40 uppercase tracking-tighter">{project.owner.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              </div>
            </div>
          </TabsContent>

          {/* Intel (Chat) - Viewport Filling */}
          <TabsContent value="chat" className="mt-0 outline-none h-full min-h-[60vh] md:min-h-[700px]">
            <Card className="border border-primary/5 shadow-elegant h-full overflow-hidden rounded-[2.5rem] bg-card/30 backdrop-blur-xl">
              <ProjectChat projectId={project.id} projectName={project.name} teamMembers={project.team || []} />
            </Card>
          </TabsContent>

          {/* Roster (Team) - Responsive Grid */}
          <TabsContent value="team" className="mt-0 outline-none animate-in fade-in duration-500">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {project.team?.map((member) => (
                  <Card key={member.id} className="group border border-primary/5 shadow-sm bg-card/40 rounded-[2rem] hover:border-primary/20 hover:shadow-glow transition-all duration-500 overflow-hidden relative">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-11 w-11 md:h-12 md:w-12 border-2 border-background shadow-sm ring-1 ring-primary/5">
                          <AvatarImage src={getAvatarUrl(member.avatarUrl, member.email)} />
                          <AvatarFallback className="bg-primary/5 text-primary font-black text-xs">{member.fullName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-xs md:text-sm truncate group-hover:text-primary transition-colors">{member.fullName}</p>
                          <p className="text-[9px] text-muted-foreground font-bold truncate opacity-40 uppercase tracking-widest">{member.email}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Sticky Bottom Actions Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-2xl border-t border-primary/5 flex gap-3 z-50">
        {!isViewer && (
           <Button onClick={() => setIssueModalOpen(true)} variant="hero" className="flex-1 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest h-14 shadow-glow active:scale-95 transition-all">
             <Plus className="h-4 w-4 mr-3 stroke-[3]" /> New Mission
           </Button>
        )}
        {isOwner && (
           <Button onClick={() => setInviteModalOpen(true)} variant="outline" className="h-14 w-14 p-0 rounded-[1.25rem] border-primary/10 bg-primary/5 text-primary active:scale-95 transition-all">
             <UserPlus className="h-5 w-5" />
           </Button>
        )}
      </div>

      {/* Modals are handled via the same Dialog system as before, ensuring consistency */}
      <Dialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-2xl border-primary/10 shadow-2xl rounded-[2rem] p-0 overflow-hidden">
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight uppercase">New Task</DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-40">Operational Planning</DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary ml-1 tracking-widest">Mission Name</Label>
                <Input value={newIssue.title} onChange={e => setNewIssue({...newIssue, title: e.target.value})} className="bg-background/50 border-primary/5 h-12 rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary ml-1 tracking-widest">Tactical Brief</Label>
                <Textarea value={newIssue.description} onChange={e => setNewIssue({...newIssue, description: e.target.value})} className="bg-background/50 border-primary/5 min-h-[100px] rounded-xl font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary ml-1 tracking-widest">Priority</Label>
                  <Select value={newIssue.priority} onValueChange={v => setNewIssue({...newIssue, priority: v})}>
                    <SelectTrigger className="h-12 rounded-xl bg-background/50 border-primary/5"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-primary/10"><SelectItem value="LOW">Low</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="HIGH">High</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary ml-1 tracking-widest">Deadline</Label>
                  <Input type="date" value={newIssue.dueDate} onChange={e => setNewIssue({...newIssue, dueDate: e.target.value})} className="h-12 rounded-xl bg-background/50 border-primary/5" />
                </div>
              </div>
            </div>
            <Button onClick={handleCreateIssue} variant="hero" className="w-full h-14 rounded-2xl font-black uppercase text-xs">Deploy Mission</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-0 shadow-2xl p-8 bg-card/95 backdrop-blur-xl">
          <DialogHeader className="mb-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
               <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Expand Team</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Authorise new unit access</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="agent@mission.control" className="h-14 rounded-[1.25rem] bg-muted/20 border-primary/5 text-center font-bold" />
            <Button onClick={() => inviteUserMutation.mutate({ email: inviteEmail, projectId })} disabled={inviteUserMutation.isPending} className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl shadow-glow">
              {inviteUserMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Dispatch Invite"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unified Issue View: Modal on Desktop, Full-Page Sheet on Mobile */}
      {selectedIssueForComments && (
        <Dialog open={!!selectedIssueForComments} onOpenChange={o => !o && setSelectedIssueForComments(null)}>
          <DialogContent className="max-w-5xl h-full md:h-[90vh] w-full flex flex-col p-0 overflow-hidden border-0 shadow-2xl rounded-none md:rounded-[2.5rem] bg-background">
             <VisuallyHidden.Root>
                <DialogTitle>{selectedIssueForComments.title}</DialogTitle>
                <DialogDescription>Issue Details and Discussion</DialogDescription>
             </VisuallyHidden.Root>
             <IssueDetail 
                issueId={selectedIssueForComments.id} 
                issueName={selectedIssueForComments.title} 
                onClose={() => setSelectedIssueForComments(null)}
                initialTab={selectedIssueTab}
              />
          </DialogContent>
        </Dialog>
      )}

      <WorkflowManager 
        open={workflowModalOpen}
        onOpenChange={setWorkflowModalOpen}
        currentStatuses={project.statuses || ["TODO", "IN_PROGRESS", "REVIEW", "DONE"]}
        onSave={(newStatuses) => updateProjectMutation.mutate({ statuses: newStatuses })}
        isSaving={updateProjectMutation.isPending}
      />
    </div>
  );
};

export default ProjectDetails;
