import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Users, 
  Hash 
} from 'lucide-react';

interface ProjectChatProps {
  projectId: number;
  projectName: string;
  teamMembers?: any[];
}

const ProjectChat = ({ projectId, projectName, teamMembers = [] }: ProjectChatProps) => {
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-foreground mb-3">Chat Feature Coming Soon</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
              Team chat functionality will be available in a future update. 
              Stay tuned for real-time collaboration features!
            </p>
            <Badge variant="outline" className="text-primary border-primary">
              Under Development
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectChat;