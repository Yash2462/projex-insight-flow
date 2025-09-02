import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Search, 
  MessageCircle, 
  Users, 
  Hash,
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Smile
} from "lucide-react";
import { messageAPI, projectAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Messages = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchMessages(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getProjects();
      setProjects(response.data.data || []);
      if (response.data?.length > 0) {
        setSelectedProjectId(response.data[0].id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (projectId: number) => {
    try {
      const response = await messageAPI.getMessagesByProjectId(projectId);
      setMessages(response.data.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedProjectId) return;

    try {
      // Get current user ID from token or profile
      const senderId = 1; // This should come from auth context
      
      await messageAPI.sendMessage({
        senderId,
        projectId: selectedProjectId,
        content: newMessage
      });
      
      setNewMessage("");
      fetchMessages(selectedProjectId);
      
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const selectedProject = projects.find((p: any) => p.id === selectedProjectId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background lg:ml-64 p-8">
        <div className="text-center">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:ml-64">
      <div className="flex h-screen">
        {/* Sidebar - Project/Channel List */}
        <div className="w-80 border-r bg-card">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-foreground mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Project Channels
                </h3>
                <div className="space-y-1">
                  {projects.map((project: any) => (
                    <Button
                      key={project.id}
                      variant={selectedProjectId === project.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <Hash className="h-4 w-4 mr-2" />
                      {project.name}
                      {project.unreadCount && (
                        <Badge variant="destructive" className="ml-auto">
                          {project.unreadCount}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Direct Messages
                </h3>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=john" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    John Doe
                    <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah" />
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    Sarah Miller
                    <div className="w-2 h-2 bg-yellow-500 rounded-full ml-auto"></div>
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedProject ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Hash className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="font-semibold text-foreground">{selectedProject.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedProject.team?.length || 0} members
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No messages yet</h3>
                      <p className="text-muted-foreground">Start the conversation with your team!</p>
                    </div>
                  ) : (
                    messages.map((message: any, index) => (
                      <div key={index} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender?.email}`} />
                          <AvatarFallback>{getInitials(message.sender?.fullName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-medium text-foreground">{message.sender?.fullName}</span>
                            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                          </div>
                          <p className="text-foreground">{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {/* Mock messages for demo */}
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=demo" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-foreground">John Doe</span>
                        <span className="text-xs text-muted-foreground">2:30 PM</span>
                      </div>
                      <p className="text-foreground">Hey team! How's the project coming along?</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah" />
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-foreground">Sarah Miller</span>
                        <span className="text-xs text-muted-foreground">2:32 PM</span>
                      </div>
                      <p className="text-foreground">Great progress! Just finished the UI components.</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-card">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Message #${selectedProject.name}`}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleSendMessage} variant="hero">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a project or direct message to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;