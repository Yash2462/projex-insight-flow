import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Trash2, Clock } from 'lucide-react';
import { commentAPI, userAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

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

interface IssueCommentsProps {
  issueId: number;
  issueName: string;
}

const IssueComments = ({ issueId, issueName }: IssueCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    fetchCurrentUser();
  }, [issueId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await userAPI.getProfile();
      setCurrentUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch current user');
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentAPI.getCommentsByIssueId(issueId);
      setComments(response.data.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch comments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a comment',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await commentAPI.createComment({
        issueId,
        content: newComment
      });
      
      setNewComment('');
      fetchComments(); // Refresh comments
      
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentAPI.deleteComment(commentId);
      fetchComments(); // Refresh comments
      
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card/50 to-background">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-primary" />
          Discussion
          <Badge variant="secondary" className="ml-auto">
            {comments.length}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Discuss "{issueName}" with your team
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Comments List */}
        <ScrollArea className="h-80 pr-4">
          {loading && comments.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No comments yet</p>
              <p className="text-sm text-muted-foreground/70">
                Be the first to start the discussion
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="group p-4 rounded-lg bg-background/60 border border-border/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.email}`} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(comment.author.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {comment.author.fullName}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        
                        {currentUser?.id === comment.author.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Comment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Add Comment */}
        <div className="border-t pt-4 space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment to discuss this issue..."
            className="min-h-[80px] resize-none focus:ring-2 focus:ring-primary/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Press Ctrl+Enter to send
            </p>
            <Button 
              onClick={handleAddComment}
              disabled={loading || !newComment.trim()}
              variant="hero"
              size="sm"
              className="min-w-[80px]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueComments;