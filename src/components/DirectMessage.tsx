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
  Clock,
  Paperclip,
  Smile,
  Phone,
  Video,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAvatarUrl } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, messageAPI, Message, User } from '@/services/api';
import { useWebSocket } from '@/hooks/use-websocket';

interface DirectMessageProps {
  recipientUser: User;
  currentUserId: number;
  onClose?: () => void;
}

const DirectMessage = ({ recipientUser, currentUserId, onClose }: DirectMessageProps) => {
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { subscribe, isConnected } = useWebSocket();

  const { data: currentUser } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data;
    },
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["direct-messages", recipientUser.id],
    queryFn: async () => {
      const response = await messageAPI.getDirectMessages(recipientUser.id);
      return response.data.data || [];
    },
    enabled: !!recipientUser.id,
  });

  // Subscribe to real-time direct messages
  useEffect(() => {
    if (isConnected && currentUser?.email) {
      const subscription = subscribe(`/user/${currentUser.email}/queue/direct-messages`, (msg: Message) => {
        // Only care if it's from the person we're chatting with
        if (msg.sender?.id === recipientUser.id || msg.receiver?.id === recipientUser.id) {
          queryClient.setQueryData(["direct-messages", recipientUser.id], (prev: Message[] | undefined) => {
             if (prev?.some(m => m.id === msg.id)) return prev;
             return [...(prev || []), msg];
          });
        }
      });
      return () => {};
    }
  }, [isConnected, currentUser?.email, recipientUser.id, subscribe, queryClient]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => messageAPI.sendDirectMessage({
      senderId: currentUserId,
      receiverId: recipientUser.id,
      content
    }),
    onSuccess: (response) => {
      const sentMsg = response.data.data;
      queryClient.setQueryData(["direct-messages", recipientUser.id], (prev: Message[] | undefined) => [
        ...(prev || []),
        sentMsg
      ]);
      setNewMessage('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || sendMutation.isPending) return;
    sendMutation.mutate(newMessage.trim());
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

  return (
    <Card className="h-full border-0 shadow-2xl bg-card md:rounded-[2.5rem] overflow-hidden flex flex-col">
      <CardHeader className="p-3 md:p-6 pb-3 md:pb-4 border-b bg-muted/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-white shadow-sm ring-1 ring-primary/5">
              <AvatarImage 
                src={getAvatarUrl(recipientUser.avatarUrl, recipientUser.email)} 
              />
              <AvatarFallback className="bg-primary/5 text-primary font-black text-xs md:text-base">
                {getInitials(recipientUser.fullName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="min-w-0">
              <CardTitle className="text-sm md:text-lg font-black tracking-tight flex items-center gap-2 truncate">
                {recipientUser.fullName}
                <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              </CardTitle>
              <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 truncate">{recipientUser.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-xl hover:bg-primary/5">
              <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary/60" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-xl hover:bg-primary/5">
              <Video className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary/60" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 p-4 md:p-6"
        >
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 opacity-20">
              <MessageCircle className="h-16 w-16 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">No transmission history</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => {
                const isMe = message.sender?.id === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <Avatar className="h-8 w-8 shrink-0 self-end mb-1">
                        <AvatarImage src={getAvatarUrl(recipientUser.avatarUrl, recipientUser.email)} />
                        <AvatarFallback className="text-[10px] font-bold">{recipientUser.fullName[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                        isMe 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-muted/30 border border-primary/5 rounded-tl-none'
                      }`}>
                        {message.content}
                      </div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 mt-1.5 px-1">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 bg-background/50 border-t border-primary/5">
          <div className="flex gap-3">
            <div className="flex-1 relative group">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Deploy message to ${recipientUser.fullName.split(' ')[0]}...`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="h-12 bg-muted/20 border-primary/5 rounded-xl px-4 font-medium focus-visible:ring-primary/10 transition-all"
                disabled={sendMutation.isPending}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-focus-within:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/5"><Paperclip className="h-4 w-4 opacity-40" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/5"><Smile className="h-4 w-4 opacity-40" /></Button>
              </div>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMutation.isPending}
              className="h-12 w-12 rounded-xl bg-primary text-primary-foreground shadow-glow transition-all active:scale-95 shrink-0"
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectMessage;
