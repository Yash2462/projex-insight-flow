import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Hash,
  Paperclip,
  Smile 
} from 'lucide-react';
import { messageAPI, userAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  content: string;
  timestamp: string;
  sender: {
    id: number;
    fullName: string;
    email: string;
  };
}

interface ProjectChatProps {
  projectId: number;
  projectName: string;
  teamMembers?: any[];
}

const ProjectChat = ({ projectId, projectName, teamMembers = [] }: ProjectChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    fetchCurrentUser();
  }, [projectId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchCurrentUser = async () => {
    try {
      const response = await userAPI.getProfile();
      setCurrentUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch current user');
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getMessagesByProjectId(projectId);
      setMessages(response.data.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      await messageAPI.sendMessage({
        senderId: currentUser.id,
        projectId,
        content: newMessage
      });
      
      setNewMessage('');
      fetchMessages(); // Refresh messages
      
      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isCurrentUser = (senderId: number) => {
    return currentUser?.id === senderId;
  };

  return (
    <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-card/50 to-background">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-primary" />
            {projectName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary">{teamMembers.length}</Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Team discussion for this project
        </p>
      </CardHeader>
      
      <CardContent className="flex flex-col h-[500px] p-0">
        {/* Messages */}
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 p-4"
        >
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No messages yet</h3>
              <p className="text-muted-foreground text-sm">
                Start the conversation with your team!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    isCurrentUser(message.sender.id) ? 'justify-end' : ''
                  }`}
                >
                  {!isCurrentUser(message.sender.id) && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.email}`} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(message.sender.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div 
                    className={`max-w-[70%] ${
                      isCurrentUser(message.sender.id) 
                        ? 'order-first' 
                        : ''
                    }`}
                  >
                    <div className="flex items-baseline gap-2 mb-1">
                      <span 
                        className={`text-sm font-medium ${
                          isCurrentUser(message.sender.id) 
                            ? 'text-primary' 
                            : 'text-foreground'
                        }`}
                      >
                        {isCurrentUser(message.sender.id) 
                          ? 'You' 
                          : message.sender.fullName
                        }
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div 
                      className={`p-3 rounded-lg ${
                        isCurrentUser(message.sender.id)
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-background/80 border'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>

                  {isCurrentUser(message.sender.id) && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.email}`} 
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                        {getInitials(message.sender.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-background/50">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message the team...`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="pr-20 focus:ring-2 focus:ring-primary/20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Paperclip className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Smile className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={loading || !newMessage.trim()}
              variant="hero"
              size="sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectChat;