import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Users, 
  Hash,
  Send,
  Loader2
} from 'lucide-react';
import { useWebSocket } from '@/hooks/use-websocket';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  fullName: string;
  email: string;
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  sender: User;
}

interface ProjectChatProps {
  projectId: number;
  projectName: string;
  teamMembers?: User[];
}

const ProjectChat = ({ projectId, projectName, teamMembers = [] }: ProjectChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { subscribe, isConnected } = useWebSocket(projectId);

  // Fetch current user for styling own messages
  const { data: currentUser } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data as User;
    },
  });

  const { data: userRole } = useQuery({
    queryKey: ["projectRole", projectId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/projects/${projectId}/role`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    },
    enabled: !!projectId,
  });

  const isViewer = userRole === 'VIEWER';

  // Fetch message history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/messages/chat/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.data) {
          setMessages(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (projectId) {
      fetchMessages();
    }
  }, [projectId]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (isConnected && projectId) {
      const subscription = subscribe(`/topic/project/${projectId}/chat`, (message: Message) => {
        setMessages(prev => {
          // Avoid duplicates if message was already added via optimistic update
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      });

      return () => {
        // Unsubscribe if needed, though hook handles major cleanup
      };
    }
  }, [isConnected, projectId, subscribe]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !currentUser) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/messages/send', {
        projectId,
        senderId: currentUser.id,
        content: newMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full border-0 shadow-lg bg-card/40 backdrop-blur-sm flex flex-col overflow-hidden">
      <CardHeader className="pb-4 border-b bg-background/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg">
            <Hash className="h-5 w-5 text-primary" />
            {projectName}
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                {teamMembers.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-primary/40" />
                </div>
                <h4 className="text-sm font-semibold text-foreground/70">No messages yet</h4>
                <p className="text-xs text-muted-foreground mt-1">Start the conversation with your team!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isOwn = msg.sender.id === currentUser?.id;
                const showAvatar = index === 0 || messages[index - 1].sender.id !== msg.sender.id;
                
                return (
                  <div key={msg.id || index} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 ${!showAvatar && 'invisible'}`}>
                      <Avatar className="h-8 w-8 border border-primary/10 shadow-sm">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.email}`} />
                        <AvatarFallback className="text-[10px]">{getInitials(msg.sender.fullName)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      {showAvatar && (
                        <span className="text-[10px] font-bold text-muted-foreground mb-1 px-1">
                          {isOwn ? 'You' : msg.sender.fullName}
                        </span>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        isOwn 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-muted/80 text-foreground rounded-tl-none border border-border/50'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-muted-foreground/60 mt-1 px-1 font-medium">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-background/50 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isViewer ? "Viewers cannot send messages" : "Type a message..."}
              className="flex-1 bg-background border-primary/10 focus-visible:ring-primary/20 rounded-xl h-11"
              disabled={!isConnected || isSending || isViewer}
            />
            <Button 
              type="submit" 
              size="icon" 
              className={`rounded-xl h-11 w-11 shrink-0 bg-gradient-primary shadow-glow transition-all active:scale-95 ${(!newMessage.trim() || !isConnected || isSending || isViewer) && 'opacity-50'}`}
              disabled={!newMessage.trim() || !isConnected || isSending || isViewer}
            >
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
          {!isConnected && (
            <p className="text-[10px] text-destructive font-medium mt-2 text-center animate-pulse">
              Connection lost. Trying to reconnect...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectChat;
