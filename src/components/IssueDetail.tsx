import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  Trash2, 
  Clock, 
  CheckSquare, 
  Plus, 
  X,
  History,
  Info,
  Paperclip,
  Smile,
  FileImage,
  Download,
  FileText,
  FileIcon,
  Loader2,
  ChevronDown,
  Layout,
  Flag,
  Calendar,
  User as UserIcon,
  Target
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { commentAPI, userAPI, issueAPI, attachmentAPI, projectAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAvatarUrl } from '@/lib/utils';
import CommentRenderer from './CommentRenderer';
import GifPicker from './GifPicker';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { useTheme } from "./theme-provider";

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
}

const IssueDetail = ({ issueId, issueName, onClose }: IssueDetailProps) => {
  const [newComment, setNewComment] = useState('');
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme } = useTheme();

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
    refetchInterval: 5000,
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ["attachments", issueId],
    queryFn: async () => {
      const response = await attachmentAPI.getIssueAttachments(issueId);
      return response.data.data || [];
    },
  });

  // Auto-scroll to bottom of discussion
  useEffect(() => {
    if (discussionScrollRef.current) {
      discussionScrollRef.current.scrollTop = discussionScrollRef.current.scrollHeight;
    }
  }, [comments]);

  // Mutations
  const addCommentMutation = useMutation({
    mutationFn: (content: string) => commentAPI.createComment({ content, issueId, userId: currentUser?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", issueId] });
      setNewComment('');
      toast({ title: "Sent", description: "Your insight has been posted." });
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: (file: File) => attachmentAPI.upload(file, issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", issueId] });
      setIsUploading(false);
      toast({ title: "Uploaded", description: "Resource added to archive." });
    },
    onError: () => setIsUploading(false),
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

  const updateIssueMutation = useMutation({
    mutationFn: (data: any) => issueAPI.updateIssue(issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
      toast({ title: "Updated", description: "Metrics deployed." });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadAttachmentMutation.mutate(file);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'MEDIUM': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'LOW': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  if (isIssueLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Synchronising Data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Header */}
      <div className="p-8 border-b border-primary/5 flex items-center justify-between bg-card/30 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-2.5 rounded-xl ${getPriorityColor(issue?.priority)} shadow-sm`}>
            <Target className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black tracking-tight text-foreground line-clamp-1">{issue?.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/10 bg-primary/5 text-primary h-5">
                {issue?.status?.replace(/_/g, ' ')}
              </Badge>
              <span className="text-[10px] text-muted-foreground font-bold opacity-40 uppercase tracking-tighter">ID: #{issue?.id}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-destructive/5 hover:text-destructive transition-colors ml-4">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content (Left) */}
        <div className="flex-1 overflow-y-auto scrollbar-hide border-r border-primary/5 bg-background/50">
          <div className="p-8 space-y-12">
            {/* Description Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-foreground/80">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="font-black text-[11px] uppercase tracking-widest">Core Documentation</h3>
              </div>
              <div className="p-6 bg-card border border-primary/5 rounded-[2rem] shadow-sm">
                <div className="whitespace-pre-wrap font-medium text-sm leading-relaxed text-foreground/70">
                  {issue?.description || "No description provided."}
                </div>
              </div>
            </section>

            {/* Checklist Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground/80">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <h3 className="font-black text-[11px] uppercase tracking-widest">Mission Progress</h3>
                </div>
                <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                  {Math.round(((issue?.completedSubtasks?.length || 0) / (issue?.subtasks?.length || 1)) * 100)}% COMPLETE
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="New objective..."
                    className="h-11 bg-muted/20 border-primary/5 rounded-xl text-sm px-4 focus-visible:ring-primary/20"
                    onKeyDown={(e) => e.key === 'Enter' && newSubtask.trim() && addSubtaskMutation.mutate(newSubtask)}
                    disabled={isViewer}
                  />
                  <Button 
                    onClick={() => addSubtaskMutation.mutate(newSubtask)} 
                    disabled={!newSubtask.trim() || isViewer}
                    className="h-11 w-11 rounded-xl bg-primary shadow-glow"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="space-y-2.5">
                  {issue?.subtasks?.map((task: string, idx: number) => {
                    const done = issue.completedSubtasks?.includes(task);
                    return (
                      <div key={idx} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                        done ? "bg-primary/[0.02] border-primary/10 opacity-50" : "bg-card border-primary/5 hover:border-primary/20 shadow-sm"
                      }`}>
                        <Checkbox 
                          checked={done} 
                          onCheckedChange={() => toggleSubtaskMutation.mutate(task)}
                          className="h-5 w-5 rounded-md border-primary/20 data-[state=checked]:bg-primary"
                        />
                        <span className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground/80"}`}>{task}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Discussion Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-foreground/80">
                <MessageCircle className="h-4 w-4 text-primary" />
                <h3 className="font-black text-[11px] uppercase tracking-widest">Intelligence Hub</h3>
              </div>

              <div 
                ref={discussionScrollRef}
                className="space-y-6 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide"
              >
                {comments.length === 0 ? (
                  <div className="text-center py-16 opacity-30 bg-muted/5 rounded-[2rem] border-2 border-dashed border-primary/5">
                    <p className="text-[10px] font-black uppercase tracking-widest">No transmissions recorded</p>
                  </div>
                ) : (
                  comments.map((comment: Comment) => {
                    const isOwn = comment.user?.id === currentUser?.id;
                    return (
                      <div key={comment.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Avatar className="h-8 w-8 ring-2 ring-background shrink-0 shadow-sm">
                          <AvatarImage src={getAvatarUrl(comment.user?.avatarUrl, comment.user?.email)} />
                          <AvatarFallback className="text-[10px] font-bold bg-primary/5 text-primary">{comment.user?.fullName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className={`space-y-1.5 max-w-[85%] ${isOwn ? 'items-end' : 'items-start'}`}>
                          <div className={`flex items-center gap-2 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="text-[10px] font-black text-foreground/60">{isOwn ? 'You' : comment.user?.fullName}</span>
                            <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-40">{new Date(comment.createdDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className={`p-4 shadow-sm text-sm font-medium leading-relaxed ${
                            isOwn 
                              ? 'bg-primary text-primary-foreground rounded-[1.25rem] rounded-tr-none' 
                              : 'bg-card border border-primary/5 rounded-[1.25rem] rounded-tl-none text-foreground/80'
                          }`}>
                            <CommentRenderer content={comment.content} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <div className="bg-card border border-primary/10 p-3 rounded-[1.5rem] shadow-elegant flex flex-col gap-2">
                <Textarea 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Share data..."
                  className="min-h-[80px] border-0 focus-visible:ring-0 resize-none bg-transparent p-2 text-sm"
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && newComment.trim() && addCommentMutation.mutate(newComment)}
                />
                <div className="flex items-center justify-between pt-2 border-t border-primary/5">
                  <div className="flex items-center gap-1">
                    <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 text-muted-foreground">
                          <Smile className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="top" align="start" className="p-0 border-0">
                        <EmojiPicker 
                          onEmojiClick={e => {setNewComment(p => p + e.emoji); setEmojiPickerOpen(false)}}
                          theme={theme === 'dark' ? EmojiTheme.DARK : EmojiTheme.LIGHT}
                          width={280} height={350}
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover open={gifPickerOpen} onOpenChange={setGifPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 text-muted-foreground">
                          <FileImage className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="top" align="start" className="p-0 border-0">
                        <GifPicker onSelect={url => {setGifPickerOpen(false); addCommentMutation.mutate(url)}} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button 
                    onClick={() => addCommentMutation.mutate(newComment)} 
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    size="sm" className="rounded-xl h-9 px-5 bg-primary font-bold text-[10px] uppercase tracking-widest shadow-glow"
                  >
                    Post <Send className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <aside className="w-[320px] bg-card/20 p-8 space-y-10 overflow-y-auto scrollbar-hide">
          {/* Metadata Grid */}
          <div className="space-y-6">
             <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 ml-1">Assigned Unit</Label>
                <div className="flex items-center gap-3 p-3 bg-background/50 border border-primary/5 rounded-2xl">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={getAvatarUrl(issue?.assignee?.avatarUrl, issue?.assignee?.email)} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{issue?.assignee?.fullName?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate">{issue?.assignee?.fullName || 'Unassigned'}</p>
                    <p className="text-[9px] font-medium text-muted-foreground truncate">{issue?.assignee?.email || 'Awaiting resource'}</p>
                  </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 ml-1">Priority</Label>
                  <div className={`p-3 rounded-2xl border text-xs font-black uppercase text-center ${getPriorityColor(issue?.priority)}`}>
                    {issue?.priority}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 ml-1">Timeline</Label>
                  <div className="p-3 bg-background/50 border border-primary/5 rounded-2xl flex items-center justify-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary opacity-40" />
                    <span className="text-[10px] font-bold">{issue?.dueDate ? new Date(issue.dueDate).toLocaleDateString([], {month: 'short', day: 'numeric'}) : 'TBD'}</span>
                  </div>
                </div>
             </div>
          </div>

          <Separator className="bg-primary/5" />

          {/* Time Tracking */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="font-black text-[10px] uppercase tracking-widest">Velocity Metrics</h3>
              </div>
            </div>
            
            <div className="bg-background/50 border border-primary/5 rounded-[1.5rem] p-5 space-y-6 shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>Burn Rate</span>
                  <span className="text-primary">{Math.min(100, Math.round((loggedHours / (estimatedHours || 1)) * 100))}%</span>
                </div>
                <Progress value={Math.min(100, (loggedHours / (estimatedHours || 1)) * 100)} className="h-1.5 bg-primary/5" />
              </div>

              {!isViewer && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      type="number"
                      value={logTimeAmount}
                      onChange={e => setLogTimeAmount(e.target.value)}
                      placeholder="Add hours..."
                      className="h-10 bg-muted/10 border-primary/5 text-xs font-bold rounded-xl"
                    />
                    <Button 
                      onClick={() => updateIssueMutation.mutate({ estimatedHours, loggedHours: (issue?.loggedHours || 0) + parseFloat(logTimeAmount) })}
                      disabled={!logTimeAmount || updateIssueMutation.isPending}
                      className="h-10 px-4 rounded-xl bg-primary font-bold text-[9px] uppercase tracking-widest"
                    >
                      Log
                    </Button>
                  </div>
                  <div className="flex flex-col gap-1 px-1">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="opacity-40 uppercase">Target</span>
                      <span className="text-foreground">{estimatedHours}h</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="opacity-40 uppercase">Achieved</span>
                      <span className="text-primary">{loggedHours}h</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attachments (Archive) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                <h3 className="font-black text-[10px] uppercase tracking-widest">Resource Archive</h3>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            </div>

            <div className="space-y-2">
              {attachments.map((file: Attachment) => (
                <div key={file.id} className="group flex items-center gap-3 p-3 bg-background/50 border border-primary/5 rounded-xl hover:border-primary/20 transition-all cursor-pointer">
                  <div className="p-2 bg-muted/20 rounded-lg group-hover:bg-primary/5 transition-colors text-muted-foreground group-hover:text-primary">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold truncate">{file.fileName}</p>
                    <p className="text-[8px] text-muted-foreground uppercase opacity-40">{(file.fileSize / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${file.fileUrl}`, '_blank')} className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-primary">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default IssueDetail;
