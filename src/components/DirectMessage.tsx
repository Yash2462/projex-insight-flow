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
  User,
  Clock,
  Paperclip,
  Smile,
  Phone,
  Video
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DirectMessage {
  id: number;
  content: string;
  timestamp: string;
  senderId: number;
  receiverId: number;
  isRead: boolean;
}

interface DirectMessageProps {
  recipientUser: {
    id: number;
    fullName: string;
    email: string;
  };
  currentUserId: number;
  onClose?: () => void;
}

const DirectMessage = ({ recipientUser, currentUserId, onClose }: DirectMessageProps) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    // Auto-scroll to bottom when component loads
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, 100);
  }, [recipientUser.id]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // Mock messages for demonstration - in real app, this would fetch from API
      const mockMessages: DirectMessage[] = [
        {
          id: 1,
          content: "Hey! How's the project going?",
          timestamp: '2024-01-20T09:00:00Z',
          senderId: recipientUser.id,
          receiverId: currentUserId,
          isRead: true
        },
        {
          id: 2,
          content: "Going well! Just finished the authentication module. Working on the dashboard now.",
          timestamp: '2024-01-20T09:15:00Z',
          senderId: currentUserId,
          receiverId: recipientUser.id,
          isRead: true
        },
        {
          id: 3,
          content: "That's great! Let me know if you need any help with the UI components.",
          timestamp: '2024-01-20T09:30:00Z',
          senderId: recipientUser.id,
          receiverId: currentUserId,
          isRead: true
        },
        {
          id: 4,
          content: "Thanks! Actually, I have a question about the design system. Could we hop on a quick call?",
          timestamp: '2024-01-20T10:00:00Z',
          senderId: currentUserId,
          receiverId: recipientUser.id,
          isRead: false
        }
      ];
      
      setMessages(mockMessages);
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
    if (!newMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create new message
      const message: DirectMessage = {
        id: messages.length + 1,
        content: newMessage,
        timestamp: new Date().toISOString(),
        senderId: currentUserId,
        receiverId: recipientUser.id,
        isRead: false
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
      
      // In real app, this would call the API to send the message
      // await messageAPI.sendDirectMessage({ ... });
      
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
    return currentUserId === senderId;
  };

  return (
    <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-card/50 to-background">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${recipientUser.email}`} 
              />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(recipientUser.fullName)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
                {recipientUser.fullName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{recipientUser.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              <Video className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
              Online
            </Badge>
          </div>
        </div>
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
                Start the conversation with {recipientUser.fullName}!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    isCurrentUser(message.senderId) ? 'justify-end' : ''
                  }`}
                >
                  {!isCurrentUser(message.senderId) && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${recipientUser.email}`} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(recipientUser.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div 
                    className={`max-w-[70%] ${
                      isCurrentUser(message.senderId) 
                        ? 'order-first' 
                        : ''
                    }`}
                  >
                    <div className="flex items-baseline gap-2 mb-1">
                      <span 
                        className={`text-sm font-medium ${
                          isCurrentUser(message.senderId) 
                            ? 'text-primary' 
                            : 'text-foreground'
                        }`}
                      >
                        {isCurrentUser(message.senderId) 
                          ? 'You' 
                          : recipientUser.fullName
                        }
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div 
                      className={`p-3 rounded-lg ${
                        isCurrentUser(message.senderId)
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-background/80 border'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    {isCurrentUser(message.senderId) && !message.isRead && (
                      <p className="text-xs text-muted-foreground text-right mt-1">Delivered</p>
                    )}
                  </div>

                  {isCurrentUser(message.senderId) && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                        {getInitials('Current User')}
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
                placeholder={`Message ${recipientUser.fullName}...`}
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

export default DirectMessage;