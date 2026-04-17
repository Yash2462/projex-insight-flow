import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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
  Loader2
} from 'lucide-react';
import { commentAPI, userAPI, issueAPI, attachmentAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  createdAt: string;
  author: {
    id: number;
    fullName: string;
    email: string;
  };
}

interface IssueDetailProps {
  issueId: number;
  issueName: string;
  onClose?: () => void;
}

const IssueDetail = ({ issueId, issueName, onClose }: IssueDetailProps) => {
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Time tracking states
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [loggedHours, setLoggedHours] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: userRole } = useQuery({
    queryKey: ["projectRole", issue?.projectId],
    queryFn: async () => {
      const response = await projectAPI.getProjectRole(issue?.projectId);
      return response.data.data;
    },
    enabled: !!issue?.projectId,
  });

  const canEdit = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'MEMBER';
  const isViewer = userRole === 'VIEWER';

  const { data: comments, isLoading: isCommentsLoading } = useQuery({
    queryKey: ["comments", issueId],
    queryFn: async () => {
      const response = await commentAPI.getCommentsByIssueId(issueId);
      return response.data.data || [];
    },
  });

  const { data: attachments, isLoading: isAttachmentsLoading } = useQuery({
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
      toast({ title: "Updated", description: "Issue tracking updated" });
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

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const calculateProgress = () => {
    if (!issue?.subtasks?.length) return 0;
    return Math.round(((issue.completedSubtasks?.length || 0) / issue.subtasks.length) * 100);
  };

  const handleDownload = (attachment: Attachment) => {
    // In a real app, you'd trigger a proper download from the backend URL
    window.open(`http://localhost:8080${attachment.fileUrl}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
      {/* Left Column: Details & Subtasks */}
      <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Info className="h-5 w-5" />
            <h3 className="font-bold text-lg">Description</h3>
          </div>
          <Card className="border-0 bg-muted/30 shadow-none rounded-2xl">
            <CardContent className="p-4">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {issue?.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Attachments Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Paperclip className="h-5 w-5" />
              <h3 className="font-bold text-lg">Attachments</h3>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isViewer}
            >
              {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Plus className="h-3.5 w-3.5 mr-2" />}
              Upload
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isAttachmentsLoading ? (
              [1, 2].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)
            ) : (attachments.length === 0 && !isUploading) ? (
              <p className="text-xs text-muted-foreground italic col-span-2">No files attached</p>
            ) : (
              <>
                {attachments.map((file: Attachment) => (
                  <div key={file.id} className="group p-3 flex items-center gap-3 bg-muted/30 rounded-xl border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all">
                    <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate pr-2">{file.fileName}</p>
                      <p className="text-[10px] text-muted-foreground">{formatSize(file.fileSize)}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-primary hover:bg-primary/10"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      {!isViewer && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => deleteAttachmentMutation.mutate(file.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {isUploading && (
                  <div className="p-3 flex items-center gap-3 bg-primary/5 rounded-xl border border-dashed border-primary/20 animate-pulse">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-xs font-medium text-primary">Uploading...</span>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Checklist Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <CheckSquare className="h-5 w-5" />
              <h3 className="font-bold text-lg">Checklist</h3>
            </div>
          </div>
          <div className="space-y-2">
            {issue?.subtasks?.map((subtask: string, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
                <Checkbox 
                  id={`subtask-${i}`} 
                  checked={issue.completedSubtasks?.includes(subtask)}
                  disabled={isViewer}
                />
                <label className={`flex-1 text-sm font-medium leading-none cursor-pointer ${
                  issue.completedSubtasks?.includes(subtask) ? "line-through text-muted-foreground" : ""
                }`}>
                  {subtask}
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Time Tracking Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5" />
            <h3 className="font-bold text-lg">Time Tracking</h3>
          </div>
          <Card className="border-0 bg-muted/30 shadow-none rounded-2xl">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Estimated (hrs)</label>
                  <Input 
                    type="number" 
                    value={estimatedHours} 
                    onChange={e => setEstimatedHours(parseFloat(e.target.value) || 0)}
                    className="h-9 bg-background/50"
                    disabled={isViewer}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Logged (hrs)</label>
                  <Input 
                    type="number" 
                    value={loggedHours} 
                    onChange={e => setLoggedHours(parseFloat(e.target.value) || 0)}
                    className="h-9 bg-background/50"
                    disabled={isViewer}
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-primary">{Math.min(100, Math.round((loggedHours / (estimatedHours || 1)) * 100))}%</span>
                </div>
                <Progress value={Math.min(100, (loggedHours / (estimatedHours || 1)) * 100)} className="h-2" />
              </div>

              <Button 
                size="sm" 
                className="w-full bg-primary/10 text-primary hover:bg-primary/20 border-0"
                onClick={() => updateIssueMutation.mutate({ estimatedHours, loggedHours })}
                disabled={updateIssueMutation.isPending || isViewer}
              >
                {updateIssueMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Tracking"}
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Right Column: Discussion */}
      <div className="lg:col-span-1 flex flex-col h-full border-l border-muted pl-6">
        <div className="flex items-center gap-2 mb-4 text-primary">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-bold text-lg">Discussion</h3>
        </div>

        <ScrollArea className="flex-1 pr-4 mb-4">
          <div className="space-y-4">
            {isCommentsLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)
            ) : comments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground italic text-sm">No discussion yet.</div>
            ) : (
              comments.map((comment: Comment) => (
                <div key={comment.id} className="group space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">{getInitials(comment.author.fullName)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold">{comment.author.fullName}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-2xl rounded-tl-none text-sm">{comment.content}</div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="space-y-3">
          <Textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isViewer ? "Discussion is read-only for viewers" : "Write a comment..."}
            className="min-h-[100px] rounded-2xl bg-muted/30 border-primary/5 focus:ring-primary/20 resize-none text-sm"
            disabled={isViewer}
          />
          <Button 
            className="w-full bg-gradient-primary rounded-xl"
            disabled={!newComment.trim() || addCommentMutation.isPending || isViewer}
            onClick={() => addCommentMutation.mutate(newComment)}
          >
            <Send className="h-4 w-4 mr-2" /> Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
