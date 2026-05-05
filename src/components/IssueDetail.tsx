import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Send, 
  Trash2, 
  Clock, 
  CheckSquare, 
  Plus, 
  X,
  Info,
  Paperclip,
  Smile,
  FileImage,
  Download,
  FileText,
  Loader2,
  Calendar,
  Target,
  ChevronLeft,
  Layout,
  TrendingUp,
  Activity,
  Maximize2,
  Layers,
  UserPlus
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { commentAPI, userAPI, issueAPI, attachmentAPI, projectAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getAvatarUrl } from '@/lib/utils';
import CommentRenderer from './CommentRenderer';
import GifPicker from './GifPicker';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { useTheme } from "./theme-provider";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Attachment {
  id: number;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

interface Comment {
  id: number;
  content: string;
  createdDateTime: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
}

interface IssueDetailProps {
  issueId: number;
  issueName: string;
  onClose?: () => void;
  isFullPage?: boolean;
  initialTab?: string;
}

const IssueDetail = ({ issueId, issueName, onClose, isFullPage = false, initialTab = "overview" }: IssueDetailProps) => {
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isUploading, setIsUploading] = useState(false);
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [loggedHours, setLoggedHours] = useState(0);
  const [logTimeAmount, setLogTimeAmount] = useState<string>("");
  const [newSubtask, setNewSubtask] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const discussionScrollRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Reset scroll position on tab change
  useEffect(() => {
    if (activeTab !== "discussion" && mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Sync activeTab with initialTab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Queries
  const { data: currentUser } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data;
    },
  });

  const { data: issue, isLoading: isIssueLoading } = useQuery({
    queryKey: ["issue", issueId],
    queryFn: async () => {
      const response = await issueAPI.getIssueById(issueId);
      const data = response.data.data;
      setEstimatedHours(data.estimatedHours || 0);
      setLoggedHours(data.loggedHours || 0);
      return data;
    },
  });

  const { data: project } = useQuery({
    queryKey: ["project", issue?.projectId],
    queryFn: async () => {
      const response = await projectAPI.getProjectById(issue?.projectId);
      return response.data.data;
    },
    enabled: !!issue?.projectId,
  });

  const { data: userRole } = useQuery({
    queryKey: ["projectRole", issue?.projectId],
    queryFn: async () => {
      const response = await projectAPI.getProjectRole(issue?.projectId);
      return response.data.data;
    },
    enabled: !!issue?.projectId,
  });

  const isViewer = userRole === 'VIEWER';

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", issueId],
    queryFn: async () => {
      const response = await commentAPI.getCommentsByIssueId(issueId);
      return response.data.data || [];
    },
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ["attachments", issueId],
    queryFn: async () => {
      const response = await attachmentAPI.getIssueAttachments(issueId);
      return response.data.data || [];
    },
  });

  // Auto-scroll logic
  useEffect(() => {
    if (activeTab === "discussion" && discussionScrollRef.current) {
      const scrollContainer = discussionScrollRef.current;
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'instant'
        });
      });
    }
  }, [comments, activeTab]);

  // Mutations
  const addCommentMutation = useMutation({
    mutationFn: (content: string) => commentAPI.createComment({ content, issueId, userId: currentUser?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", issueId] });
      setNewComment('');
    },
  });

  const addSubtaskMutation = useMutation({
    mutationFn: (subtask: string) => issueAPI.addSubtask(issueId, subtask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
      setNewSubtask("");
    },
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: (subtask: string) => issueAPI.toggleSubtask(issueId, subtask),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["issue", issueId] }),
  });

  const assignUserMutation = useMutation({
    mutationFn: (userId: number) => issueAPI.assignUserToIssue(issueId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
      toast({ title: "Agent Assigned" });
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: (id: number) => attachmentAPI.deleteAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", issueId] });
      toast({ title: "Asset Purged" });
    },
  });

  const updateIssueMutation = useMutation({
    mutationFn: (data: any) => issueAPI.updateIssue(issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      attachmentAPI.upload(file, issueId)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["attachments", issueId] });
          toast({ title: "Asset Deployed" });
        })
        .catch(() => toast({ title: "Upload Failed", variant: "destructive" }))
        .finally(() => setIsUploading(false));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'text-destructive bg-destructive/10 border-destructive/10';
      case 'MEDIUM': return 'text-amber-500 bg-amber-500/10 border-amber-500/10';
      case 'LOW': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/10';
      default: return 'text-primary bg-primary/10 border-primary/10';
    }
  };

  if (isIssueLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Decrypting Data</p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className={`flex flex-col h-full w-full bg-background min-h-[400px] ${isFullPage ? 'min-h-screen' : ''}`}>
      
      {/* Mobile-Optimised Sticky Header */}
      <div className="shrink-0 bg-background/95 backdrop-blur-xl border-b border-primary/5 px-4 md:px-8 pt-4 md:pt-6 pb-2 md:pb-4 z-50">
        {!isFullPage && <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-4 md:hidden" />}
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {isFullPage ? (
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl h-8 w-8 -ml-1">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : (
               <div className={`p-1.5 rounded-lg ${getPriorityColor(issue?.priority)} shrink-0`}>
                  <Target className="h-3.5 w-3.5 md:h-4 md:w-4" />
               </div>
            )}
            <div className="min-w-0">
              <h2 className="text-sm md:text-lg font-black tracking-tight truncate leading-tight uppercase">{issue?.title}</h2>
              <div className="flex items-center gap-1.5 opacity-40">
                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-tighter">#{issue?.id}</span>
                <span className="w-0.5 h-0.5 rounded-full bg-foreground" />
                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-tighter truncate">{project?.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {!isFullPage && (
              <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg hidden md:flex">
                <a href={`/projects/${issue?.projectId}/issues/${issue?.id}`}><Maximize2 className="h-4 w-4" /></a>
              </Button>
            )}
            {!isFullPage && (
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-destructive/5 hover:text-destructive">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable Tab Navigation */}
        <div className="mt-4">
          <TabsList className="w-full h-auto bg-transparent p-0 flex justify-start gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: "overview", label: "Brief", icon: Info },
              { id: "checklist", label: "Tasks", icon: CheckSquare, count: issue?.subtasks?.length },
              { id: "discussion", label: "Intel", icon: MessageCircle, count: comments.length },
              { id: "attachments", label: "Vault", icon: Paperclip, count: attachments.length }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="shrink-0 flex items-center gap-2 h-9 px-4 rounded-xl border border-transparent data-[state=active]:bg-primary/5 data-[state=active]:border-primary/10 data-[state=active]:text-primary text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 opacity-50 text-[8px]">{tab.count}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      {/* Main Content Scroll Area */}
      <div ref={mainScrollRef} className="flex-1 overflow-y-auto no-scrollbar bg-background">
        <div className="max-w-4xl mx-auto h-full">
            {/* Overview */}
            <TabsContent value="overview" className="m-0 p-5 md:p-8 pt-0 md:pt-0 space-y-8 outline-none animate-in fade-in duration-300">
              {attachments.filter((a: any) => a.fileType.startsWith('image/')).length > 0 && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 text-primary px-1">
                    <FileImage className="h-3.5 w-3.5" />
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Strategic Assets</h3>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {attachments.filter((a: any) => a.fileType.startsWith('image/')).slice(0, 5).map((file: Attachment) => (
                      <div 
                        key={file.id} 
                        className="h-24 md:h-40 min-w-[140px] md:min-w-[200px] rounded-[2rem] border border-primary/5 bg-card overflow-hidden cursor-pointer hover:border-primary/20 transition-all shadow-sm"
                        onClick={() => setActiveTab("attachments")}
                      >
                        <img 
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${file.fileUrl}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {attachments.filter((a: any) => a.fileType.startsWith('image/')).length > 5 && (
                      <button 
                        onClick={() => setActiveTab("attachments")}
                        className="h-24 md:h-40 min-w-[100px] rounded-[2rem] bg-muted/20 border border-dashed border-primary/10 flex flex-col items-center justify-center gap-1 group"
                      >
                        <Plus className="h-4 w-4 text-primary opacity-40 group-hover:scale-110 transition-transform" />
                        <span className="text-[7px] font-black uppercase opacity-40">+{attachments.filter((a: any) => a.fileType.startsWith('image/')).length - 5} More</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary px-1">
                      <Layers className="h-3.5 w-3.5" />
                      <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Strategy Overview</h3>
                    </div>
                    <Card className="border border-primary/5 bg-card border-primary/5 rounded-[2rem] shadow-sm relative overflow-hidden group">
                      <p className="text-sm md:text-base font-medium leading-relaxed text-foreground/80 relative z-10 p-6">
                        {issue?.description || "Awaiting tactical mission parameters."}
                      </p>
                    </Card>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary px-1">
                      <Activity className="h-3.5 w-3.5" />
                      <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Live Parameters</h3>
                    </div>
                    <div className="p-5 bg-card border border-primary/5 rounded-[2rem] space-y-5 shadow-sm">
                      <div className="space-y-2">
                        <Label className="text-[8px] font-black uppercase opacity-30 ml-1">Assigned Agent</Label>
                        {!isViewer ? (
                          <Select 
                            value={issue?.assignee?.id?.toString() || "0"} 
                            onValueChange={(val) => assignUserMutation.mutate(parseInt(val))}
                          >
                            <SelectTrigger className="h-11 bg-muted/20 border-primary/5 rounded-xl font-bold text-[11px] px-3">
                              <SelectValue placeholder="Select Agent" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-primary/10">
                              <SelectItem value="0">Unassigned</SelectItem>
                              {project?.team?.map((member: any) => (
                                <SelectItem key={member.id} value={member.id.toString()}>{member.fullName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center gap-2 p-2 bg-muted/10 rounded-xl border border-primary/5">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={getAvatarUrl(issue?.assignee?.avatarUrl, issue?.assignee?.email)} />
                              <AvatarFallback className="text-[8px] font-black">{issue?.assignee?.fullName?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] font-bold">{issue?.assignee?.fullName || 'Unassigned'}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center bg-muted/20 p-3 rounded-xl border border-primary/5">
                        <span className="text-[9px] font-black uppercase opacity-30">Urgency</span>
                        <Badge variant="outline" className={`text-[9px] font-black uppercase border-0 px-3 h-6 rounded-lg ${getPriorityColor(issue?.priority)}`}>
                          {issue?.priority}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center bg-muted/20 p-3 rounded-xl border border-primary/5">
                        <span className="text-[9px] font-black uppercase opacity-30">Deadline</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">
                          {issue?.dueDate ? new Date(issue.dueDate).toLocaleDateString([], {month: 'short', day: 'numeric'}) : 'OPEN'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary px-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Efficiency</h3>
                    </div>
                    <div className="p-5 bg-card border border-primary/5 rounded-[2rem] space-y-5 shadow-sm">
                       <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-black uppercase">
                             <span className="opacity-30">Intensity</span>
                             <span className="text-primary">{Math.min(100, Math.round((loggedHours / (estimatedHours || 1)) * 100))}%</span>
                          </div>
                          <Progress value={Math.min(100, (loggedHours / (estimatedHours || 1)) * 100)} className="h-1.5 bg-primary/5" />
                       </div>
                       {!isViewer && (
                        <div className="flex gap-2">
                          <Input 
                            type="number" 
                            placeholder="Add hours..." 
                            value={logTimeAmount}
                            onChange={e => setLogTimeAmount(e.target.value)}
                            className="h-10 bg-muted/20 border-primary/5 rounded-xl text-xs font-black px-4"
                          />
                          <Button 
                            onClick={() => updateIssueMutation.mutate({ estimatedHours, loggedHours: (issue?.loggedHours || 0) + parseFloat(logTimeAmount) })}
                            disabled={!logTimeAmount || updateIssueMutation.isPending}
                            className="h-10 px-5 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase shadow-glow"
                          >
                            Log
                          </Button>
                        </div>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Checklist */}
            <TabsContent value="checklist" className="m-0 p-5 md:p-8 space-y-8 outline-none animate-in slide-in-from-bottom-4 duration-300">
               {!isViewer && (
                 <div className="relative">
                    <Input 
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="Next objective..."
                      className="h-14 bg-card border-primary/10 rounded-[1.25rem] pl-6 pr-14 text-sm font-bold shadow-sm focus:ring-primary/20"
                      onKeyDown={(e) => e.key === 'Enter' && newSubtask.trim() && addSubtaskMutation.mutate(newSubtask)}
                    />
                    <Button onClick={() => addSubtaskMutation.mutate(newSubtask)} disabled={!newSubtask.trim()} className="absolute right-2 top-2 h-10 w-10 rounded-2xl bg-primary shadow-glow">
                      <Plus className="h-5 w-5" />
                    </Button>
                 </div>
               )}

               <div className="space-y-3">
                  {issue?.subtasks?.map((task: string, idx: number) => {
                    const done = issue.completedSubtasks?.includes(task);
                    return (
                      <div key={idx} className={`flex items-center gap-3 md:gap-5 p-4 md:p-5 rounded-xl md:rounded-[1.5rem] border transition-all duration-300 ${
                        done ? "bg-primary/[0.02] border-primary/5 opacity-40" : "bg-card border-primary/5 hover:border-primary/10 shadow-sm"
                      }`} onClick={() => !isViewer && toggleSubtaskMutation.mutate(task)}>
                        <Checkbox checked={done} className="h-5 w-5 md:h-6 md:w-6 rounded-lg border-primary/20 data-[state=checked]:bg-primary" />
                        <span className={`text-[12px] md:text-[14px] font-bold leading-snug transition-all ${done ? "line-through text-muted-foreground" : ""}`}>{task}</span>
                      </div>
                    );
                  })}
               </div>
            </TabsContent>

            {/* Vault */}
            <TabsContent value="attachments" className="m-0 p-5 md:p-8 pt-0 md:pt-0 space-y-6 outline-none animate-in fade-in duration-300">
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Sort: Images First */}
                  {[...attachments].sort((a, b) => {
                    const aIsImg = a.fileType.startsWith('image/');
                    const bIsImg = b.fileType.startsWith('image/');
                    if (aIsImg && !bIsImg) return -1;
                    if (!aIsImg && bIsImg) return 1;
                    return 0;
                  }).map((file: Attachment) => {
                    const isImg = file.fileType.startsWith('image/');
                    const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${file.fileUrl}`;
                    return (
                      <div key={file.id} className="group relative bg-card border border-primary/5 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-glow transition-all duration-500">
                        <div className="aspect-square relative overflow-hidden bg-muted/10">
                          {isImg ? (
                            <img src={fullUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="h-10 w-10 text-primary opacity-20" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                             <Button size="icon" variant="ghost" onClick={() => window.open(fullUrl, '_blank')} className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-primary text-primary-foreground shadow-glow hover:scale-110 transition-all">
                              <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                             </Button>
                             {!isViewer && (
                               <Button 
                                 size="icon" 
                                 variant="ghost" 
                                 onClick={() => {
                                   if(confirm("Purge this asset from vault?")) deleteAttachmentMutation.mutate(file.id);
                                 }} 
                                 className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-destructive text-destructive-foreground shadow-glow hover:scale-110 transition-all"
                               >
                                 <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                               </Button>
                             )}
                          </div>
                        </div>
                        <div className="p-4 bg-background/50 border-t border-primary/5">
                          <p className="text-[10px] font-black uppercase truncate tracking-tighter opacity-80">{file.fileName}</p>
                          <p className="text-[8px] font-bold uppercase opacity-30 mt-0.5">{(file.fileSize / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    );
                  })}

                  {!isViewer && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-[2rem] border-2 border-dashed border-primary/10 hover:border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1.5 transition-all group"
                    >
                      <div className="p-3 rounded-2xl bg-primary/10 group-hover:scale-110 transition-transform">
                        <Plus className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-[9px] font-black uppercase text-primary tracking-widest mt-2">Deploy Data</span>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                    </button>
                  )}
               </div>
               {attachments.length === 0 && isViewer && (
                 <div className="text-center py-20 opacity-20">
                    <Paperclip className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Vault is Empty</p>
                 </div>
               )}
            </TabsContent>

            {/* Discussion */}
            <TabsContent value="discussion" className="m-0 data-[state=inactive]:hidden flex flex-col h-[calc(100vh-160px)] md:h-[calc(90vh-140px)] outline-none overflow-hidden">
              <div 
                className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 no-scrollbar scroll-smooth" 
                ref={discussionScrollRef}
              >
                <div className="space-y-6 md:space-y-8 pb-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-20 opacity-20">
                      <MessageCircle className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Communication</p>
                    </div>
                  ) : (
                    comments.map((comment: Comment) => {
                      const isOwn = comment.user?.id === currentUser?.id;
                      return (
                        <div key={comment.id} className={`flex gap-2.5 md:gap-3.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end animate-in slide-in-from-bottom-2 duration-500`}>
                          <Avatar className="h-7 w-7 md:h-8 md:w-8 shrink-0 border border-background shadow-md">
                            <AvatarImage src={getAvatarUrl(comment.user?.avatarUrl, comment.user?.email)} />
                            <AvatarFallback className="text-[8px] md:text-[9px] font-black bg-primary/10 text-primary">{comment.user?.fullName?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className={`space-y-1 max-w-[85%] md:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                            <div className={`p-3 md:p-4 shadow-sm text-xs md:text-sm leading-relaxed font-medium ${
                              isOwn 
                                ? 'bg-primary text-primary-foreground rounded-[1.25rem] md:rounded-[1.5rem] rounded-br-none shadow-glow' 
                                : 'bg-card border border-primary/5 rounded-[1.25rem] md:rounded-[1.5rem] rounded-bl-none text-foreground/90'
                            }`}>
                              <CommentRenderer content={comment.content} />
                            </div>
                            <span className="text-[7px] font-black text-muted-foreground uppercase opacity-20 px-1">{new Date(comment.createdDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Message Input - Fixed Bottom */}
              <div className="p-3 md:p-6 bg-background/95 backdrop-blur-xl border-t border-primary/5 sticky bottom-0 z-10">
                <div className="bg-muted/30 rounded-[1.5rem] md:rounded-[2rem] border border-primary/5 p-1 flex items-end gap-0.5 md:gap-1 shadow-inner">
                  <div className="flex items-center">
                    <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-full text-muted-foreground hover:bg-primary/10 transition-all">
                          <Smile className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="top" align="start" className="p-0 border-0 bg-transparent w-auto">
                        <EmojiPicker 
                          onEmojiClick={e => {setNewComment(p => p + e.emoji); setEmojiPickerOpen(false)}}
                          theme={theme === 'dark' ? EmojiTheme.DARK : EmojiTheme.LIGHT}
                          width={260} height={300}
                          previewConfig={{showPreview: false}}
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover open={gifPickerOpen} onOpenChange={setGifPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-full text-muted-foreground hover:bg-primary/10 transition-all">
                          <FileImage className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="top" align="start" className="p-0 border-0 bg-transparent w-auto">
                        <GifPicker onSelect={(url) => {setGifPickerOpen(false); addCommentMutation.mutate(url)}} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <Textarea 
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Intelligence update..."
                    className="flex-1 min-h-[36px] max-h-[100px] border-0 focus-visible:ring-0 resize-none bg-transparent py-2 text-xs md:text-sm leading-tight font-medium px-2"
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && newComment.trim() && addCommentMutation.mutate(newComment)}
                  />
                  
                  <Button 
                    onClick={() => addCommentMutation.mutate(newComment)} 
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    size="icon"
                    className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-primary shadow-glow shrink-0 transition-all active:scale-90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};

export default IssueDetail;
