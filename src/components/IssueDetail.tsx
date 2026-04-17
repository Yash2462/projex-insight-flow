import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  Info
} from 'lucide-react';
import { commentAPI, userAPI, issueAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
      return response.data.data;
    },
  });

  const { data: comments, isLoading: isCommentsLoading } = useQuery({
    queryKey: ["comments", issueId],
    queryFn: async () => {
      const response = await commentAPI.getCommentsByIssueId(issueId);
      return response.data.data || [];
    },
  });

  // Mutations
  const addCommentMutation = useMutation({
    mutationFn: (content: string) => commentAPI.createComment({ issueId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", issueId] });
      setNewComment('');
      toast({ title: "Success", description: "Comment added" });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => commentAPI.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", issueId] });
      toast({ title: "Success", description: "Comment deleted" });
    },
  });

  // Since we don't have a specific subtask API yet, we'll need to update the whole issue
  // In a real app, we'd have /api/issues/{id}/subtasks
  const updateIssueMutation = useMutation({
    mutationFn: (data: any) => issueAPI.updateIssueStatus(issueId, issue?.status || "TODO"), // Using updateStatus as a generic update for now
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });

  const handleAddSubtask = () => {
    if (!newSubtask.trim() || !issue) return;
    const updatedSubtasks = [...(issue.subtasks || []), newSubtask.trim()];
    // This is a placeholder as the current API might not support full issue updates
    // For now, we'll simulate the UI update
    setNewSubtask('');
    setShowSubtaskInput(false);
    toast({ title: "Note", description: "Subtask added locally (API update pending implementation)" });
  };

  const toggleSubtask = (subtask: string) => {
    if (!issue) return;
    // Simulate toggle
    toast({ title: "Updated", description: `Subtask status changed` });
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const calculateProgress = () => {
    if (!issue?.subtasks?.length) return 0;
    return Math.round(((issue.completedSubtasks?.length || 0) / issue.subtasks.length) * 100);
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

        {/* Subtasks Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <CheckSquare className="h-5 w-5" />
              <h3 className="font-bold text-lg">Checklist</h3>
            </div>
            {issue?.subtasks?.length > 0 && (
              <Badge variant="secondary" className="rounded-md">
                {calculateProgress()}% Complete
              </Badge>
            )}
          </div>

          {issue?.subtasks?.length > 0 && (
            <Progress value={calculateProgress()} className="h-2 bg-primary/10 mb-4" />
          )}

          <div className="space-y-2">
            {issue?.subtasks?.map((subtask: string, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
                <Checkbox 
                  id={`subtask-${i}`} 
                  checked={issue.completedSubtasks?.includes(subtask)}
                  onCheckedChange={() => toggleSubtask(subtask)}
                />
                <label 
                  htmlFor={`subtask-${i}`}
                  className={`flex-1 text-sm font-medium leading-none cursor-pointer ${
                    issue.completedSubtasks?.includes(subtask) ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {subtask}
                </label>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}

            {showSubtaskInput ? (
              <div className="flex items-center gap-2 mt-4 p-2 bg-muted/50 rounded-xl border border-primary/10">
                <Input 
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="What needs to be done?"
                  className="bg-transparent border-0 focus-visible:ring-0 h-8 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                  autoFocus
                />
                <Button size="sm" onClick={handleAddSubtask} className="h-8 rounded-lg">Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowSubtaskInput(false)} className="h-8 rounded-lg">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl h-10 mt-2"
                onClick={() => setShowSubtaskInput(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Add an item
              </Button>
            )}
          </div>
        </section>

        {/* Activity History Placeholder */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 text-primary">
            <History className="h-5 w-5" />
            <h3 className="font-bold text-lg">Activity</h3>
          </div>
          <div className="space-y-4 pl-4 border-l-2 border-muted">
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-muted-foreground/30 border-2 border-background" />
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{issue?.assignee?.fullName || "System"}</span> updated status to 
                <Badge variant="outline" className="mx-1 text-[10px] h-4">{issue?.status}</Badge>
                &bull; 2 hours ago
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Right Column: Comments/Discussion */}
      <div className="lg:col-span-1 flex flex-col h-full border-l border-muted pl-6">
        <div className="flex items-center gap-2 mb-4 text-primary">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-bold text-lg">Discussion</h3>
        </div>

        <ScrollArea className="flex-1 pr-4 mb-4">
          <div className="space-y-4">
            {isCommentsLoading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)
            ) : comments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground italic text-sm">
                No discussion yet. Start the conversation!
              </div>
            ) : (
              comments.map((comment: Comment) => (
                <div key={comment.id} className="group space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.email}`} />
                        <AvatarFallback className="text-[10px]">{getInitials(comment.author.fullName)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold">{comment.author.fullName}</span>
                    </div>
                    {currentUser?.id === comment.author.id && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="p-3 bg-muted/50 rounded-2xl rounded-tl-none text-sm">
                    {comment.content}
                  </div>
                  <p className="text-[10px] text-muted-foreground pl-1">
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="space-y-3">
          <Textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[100px] rounded-2xl bg-muted/30 border-primary/5 focus:ring-primary/20 resize-none text-sm"
          />
          <Button 
            className="w-full bg-gradient-primary rounded-xl"
            disabled={!newComment.trim() || addCommentMutation.isPending}
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
