import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  History,
  Info,
  Paperclip,
  Download,
  FileText,
  FileIcon,
  Loader2,
  ChevronDown,
  Layout,
  Flag
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
import { getAvatarUrl } from '@/lib/utils';

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
  };
}

interface IssueDetailProps {
  issueId: number;
  issueName: string;
  onClose?: () => void;
  initialTab?: string;
}

const IssueDetail = ({ issueId, issueName, onClose, initialTab = "details" }: IssueDetailProps) => {
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isUploading, setIsUploading] = useState(false);
  
  // Time tracking states
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [loggedHours, setLoggedHours] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (activeTab === "discussion" && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [activeTab]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, issueId]);

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

  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ["comments", issueId],
    queryFn: async () => {
      const response = await commentAPI.getCommentsByIssueId(issueId);
      return response.data.data || [];
    },
    refetchInterval: 5000, // Poll for updates every 5 seconds
  });

  const { data: attachments = [], isLoading: isAttachmentsLoading } = useQuery({
    queryKey: ["attachments", issueId],
    queryFn: async () => {
      const response = await attachmentAPI.getIssueAttachments(issueId);
      return response.data.data || [];
    },
  });

  // Mutations
  const updateIssueMutation = useMutation({
    mutationFn: (data: any) => issueAPI.updateIssue(issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      toast({ title: "Updated", description: "Issue successfully updated" });
    },
  });

  const assignIssueMutation = useMutation({
    mutationFn: (userId: number) => issueAPI.assignUserToIssue(issueId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
      toast({ title: "Assigned", description: "Team member assigned to task" });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => commentAPI.createComment({ issueId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", issueId] });
      setNewComment('');
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: (file: File) => attachmentAPI.upload(file, issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", issueId] });
      toast({ title: "Success", description: "File uploaded" });
    },
    onSettled: () => setIsUploading(false),
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: (id: number) => attachmentAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", issueId] });
      toast({ title: "Deleted", description: "File removed" });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadAttachmentMutation.mutate(file);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <FileIcon className="h-4 w-4 text-blue-500" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    return <Paperclip className="h-4 w-4 text-slate-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = (attachment: Attachment) => {
    window.open(`http://localhost:8080${attachment.fileUrl}`, '_blank');
  };

  if (isIssueLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background/50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-8">
           <TabsList className="bg-muted/30 p-1 rounded-xl h-12">
            <TabsTrigger value="details" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-[10px] uppercase tracking-widest">
              Overview
            </TabsTrigger>
            <TabsTrigger value="discussion" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-[10px] uppercase tracking-widest flex gap-2">
              Discussion
              {comments.length > 0 && <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[8px]">{comments.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="attachments" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-[10px] uppercase tracking-widest flex gap-2">
              Resources
              {attachments.length > 0 && <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[8px]">{attachments.length}</span>}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
               <Label className="text-[9px] font-black uppercase text-muted-foreground opacity-40 mb-1">Priority</Label>
               <Badge className={`${
                 issue?.priority === 'HIGH' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'
               } border uppercase font-black text-[9px] tracking-widest px-3 py-1`}>
                 {issue?.priority}
               </Badge>
             </div>
             <div className="flex flex-col items-end border-l pl-4 border-primary/5">
               <Label className="text-[9px] font-black uppercase text-muted-foreground opacity-40 mb-1">Status</Label>
               <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isViewer}>
                  <Button variant="ghost" size="sm" className="h-7 px-3 bg-primary/5 text-primary font-black text-[9px] uppercase rounded-lg">
                    {issue?.status?.replace('_', ' ')}
                    <ChevronDown className="h-3 w-3 ml-2 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-primary/10 w-40 p-1">
                  {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map(status => (
                    <DropdownMenuItem 
                      key={status} 
                      onClick={() => updateIssueMutation.mutate({ status })}
                      className="font-bold text-[10px] uppercase py-2.5 rounded-lg"
                    >
                      {status.replace('_', ' ')}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
             </div>

             <div className="flex flex-col items-end border-l pl-4 border-primary/5">
               <Label className="text-[9px] font-black uppercase text-muted-foreground opacity-40 mb-1">Assignee</Label>
               <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isViewer}>
                  <Button variant="ghost" size="sm" className="h-7 px-2 bg-primary/5 text-primary font-black text-[9px] uppercase rounded-lg flex gap-2">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={getAvatarUrl(issue?.assignee?.avatarUrl, issue?.assignee?.email)} />
                      <AvatarFallback className="text-[6px]">{issue?.assignee?.fullName?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <span className="max-w-[80px] truncate">{issue?.assignee?.fullName || 'Unassigned'}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-primary/10 w-56 p-1">
                  <DropdownMenuItem 
                    onClick={() => assignIssueMutation.mutate(0)}
                    className="font-bold text-[10px] uppercase py-2.5 rounded-lg flex gap-2"
                  >
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                      <X className="h-3 w-3" />
                    </div>
                    Unassigned
                  </DropdownMenuItem>
                  {project?.team?.map((member: any) => (
                    <DropdownMenuItem 
                      key={member.id} 
                      onClick={() => assignIssueMutation.mutate(member.id)}
                      className="font-bold text-[10px] uppercase py-2.5 rounded-lg flex gap-2"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={getAvatarUrl(member.avatarUrl, member.email)} />
                        <AvatarFallback className="text-[8px]">{member.fullName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="truncate">{member.fullName}</span>
                        <span className="text-[8px] opacity-40 lowercase font-medium">{member.email}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <TabsContent value="details" className="h-full m-0 data-[state=active]:flex flex-col gap-8 overflow-y-auto pr-4 custom-scrollbar">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-foreground/80">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="font-black text-xs uppercase tracking-widest">Context & Strategy</h3>
              </div>
              <Card className="border border-primary/5 bg-muted/5 shadow-none rounded-[1.5rem]">
                <CardContent className="p-8">
                  <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap font-medium">
                    {issue?.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4 pb-8">
              <div className="flex items-center gap-2 text-foreground/80">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-black text-xs uppercase tracking-widest">Velocity Metrics</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-primary/5 bg-card shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60 ml-1">Estimate</Label>
                        <div className="relative">
                          <Input 
                            type="number" 
                            value={estimatedHours} 
                            onChange={e => setEstimatedHours(parseFloat(e.target.value) || 0)}
                            className="h-11 bg-muted/20 border-primary/5 font-black text-sm rounded-xl"
                            disabled={isViewer}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30">HRS</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60 ml-1">Logged</Label>
                        <div className="relative">
                          <Input 
                            type="number" 
                            value={loggedHours} 
                            onChange={e => setLoggedHours(parseFloat(e.target.value) || 0)}
                            className="h-11 bg-muted/20 border-primary/5 font-black text-sm rounded-xl"
                            disabled={isViewer}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30">HRS</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="text-muted-foreground opacity-40">Progress Arc</span>
                        <span className="text-primary">{Math.min(100, Math.round((loggedHours / (estimatedHours || 1)) * 100))}%</span>
                      </div>
                      <Progress value={Math.min(100, (loggedHours / (estimatedHours || 1)) * 100)} className="h-2 bg-primary/5" />
                    </div>

                    {!isViewer && (
                      <Button 
                        size="sm" 
                        className="w-full bg-primary text-primary-foreground hover:opacity-90 font-black text-[10px] uppercase tracking-[0.2em] h-11 rounded-xl shadow-glow transition-all"
                        onClick={() => updateIssueMutation.mutate({ estimatedHours, loggedHours })}
                        disabled={updateIssueMutation.isPending}
                      >
                        {updateIssueMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy Metrics"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="discussion" className="h-full m-0 data-[state=active]:flex flex-col">
            <ScrollArea className="flex-1 pr-4 mb-6">
              <div className="space-y-8 py-4">
                {comments.length === 0 ? (
                  <div className="text-center py-32 opacity-30">
                    <div className="p-6 bg-primary/5 rounded-full inline-flex mb-6">
                      <MessageCircle className="h-12 w-12 text-primary" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No transmission history</p>
                    <p className="text-[11px] font-medium mt-2 text-muted-foreground">Be the first to share insights on this task.</p>
                  </div>
                ) : (
                  comments.map((comment: any) => {
                    const userData = comment.user || comment.author;
                    return (
                      <div key={comment.id} className="group flex gap-4">
                         <Avatar className="h-10 w-10 ring-4 ring-background shadow-md shrink-0">
                          <AvatarImage src={getAvatarUrl(userData?.avatarUrl, userData?.email)} />
                          <AvatarFallback className="text-xs font-bold bg-primary/5 text-primary">{userData?.fullName?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-foreground">{userData?.fullName || 'Unknown User'}</span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase opacity-40">
                               {new Date(comment.createdDateTime || comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(comment.createdDateTime || comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="p-5 bg-card border border-primary/5 rounded-[1.5rem] rounded-tl-none shadow-sm text-sm font-medium leading-relaxed text-foreground/80">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <div className="bg-background/80 backdrop-blur-md p-4 rounded-[2rem] border border-primary/5 shadow-elegant mt-auto">
              <Textarea 
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={isViewer ? "View-only mode active" : "Transmitting insights..."}
                className="min-h-[100px] border-0 focus-visible:ring-0 resize-none text-sm font-medium p-4 leading-relaxed bg-transparent"
                disabled={isViewer}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && newComment.trim()) {
                    e.preventDefault();
                    addCommentMutation.mutate(newComment);
                  }
                }}
              />
              <div className="flex items-center justify-between border-t border-primary/5 pt-3">
                <span className="text-[9px] font-black uppercase text-muted-foreground opacity-40 ml-4">
                  Press Enter to send
                </span>
                <Button 
                  size="sm"
                  className="bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-xl px-6 h-10 shadow-glow transition-all active:scale-[0.98]"
                  disabled={!newComment.trim() || addCommentMutation.isPending || isViewer}
                  onClick={() => addCommentMutation.mutate(newComment)}
                >
                  {addCommentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Deploy <Send className="h-3.5 w-3.5 ml-2" /></>}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attachments" className="h-full m-0 data-[state=active]:flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground/80">
                <Paperclip className="h-5 w-5 text-primary" />
                <h3 className="font-black text-xs uppercase tracking-widest">Resource Archive</h3>
              </div>
              {!isViewer && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 rounded-xl bg-primary/5 border-primary/10 text-primary hover:bg-primary/10 font-black text-[10px] uppercase tracking-widest px-5"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Upload Resource
                </Button>
              )}
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                {attachments.length === 0 ? (
                  <div className="col-span-full py-32 text-center opacity-30 border-2 border-dashed border-primary/5 rounded-[2.5rem]">
                    <div className="p-6 bg-primary/5 rounded-full inline-flex mb-6">
                      <Paperclip className="h-12 w-12 text-primary" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No resources attached</p>
                  </div>
                ) : (
                  attachments.map((file: Attachment) => {
                    const isImage = file.fileType.startsWith('image/');
                    const imageUrl = `http://localhost:8080${file.fileUrl}`;
                    
                    return (
                      <div key={file.id} className="group flex flex-col glass-panel rounded-3xl hover:border-primary/20 hover:shadow-glow transition-all duration-500 overflow-hidden">
                        {/* Preview Area */}
                        <div className="h-40 w-full bg-primary/5 relative overflow-hidden flex items-center justify-center">
                          {isImage ? (
                            <img 
                              src={imageUrl} 
                              alt={file.fileName} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-3 opacity-40 group-hover:opacity-70 transition-opacity">
                              <div className="p-4 bg-background rounded-2xl shadow-sm">
                                {getFileIcon(file.fileType)}
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest">{file.fileType.split('/')[1] || 'FILE'}</span>
                            </div>
                          )}
                          
                          {/* Hover Actions Overlay */}
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow" 
                              onClick={() => handleDownload(file)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {!isViewer && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-glow" 
                                onClick={() => deleteAttachmentMutation.mutate(file.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Info Area */}
                        <div className="p-4 flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate text-foreground/90">{file.fileName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] text-muted-foreground font-bold uppercase opacity-40">{formatSize(file.fileSize)}</span>
                              <span className="w-1 h-1 rounded-full bg-primary/20" />
                              <span className="text-[9px] text-muted-foreground font-bold uppercase opacity-40">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default IssueDetail;
