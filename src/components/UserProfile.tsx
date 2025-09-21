import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  MessageCircle, 
  Calendar,
  Activity,
  MapPin,
  Phone,
  Globe,
  Github,
  Linkedin
} from 'lucide-react';
import { userAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface UserProfileProps {
  userId: number;
  onMessageClick?: (user: any) => void;
  onClose?: () => void;
}

const UserProfile = ({ userId, onMessageClick, onClose }: UserProfileProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // For now, using mock data since we don't have a specific user profile API endpoint
      const mockUser = {
        id: userId,
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        bio: 'Senior Full-stack Developer with 5+ years of experience in React, Node.js, and cloud technologies.',
        role: 'Senior Developer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        phone: '+1 (555) 123-4567',
        website: 'https://johndoe.dev',
        github: 'johndoe',
        linkedin: 'john-doe-dev',
        joinedDate: '2023-01-15',
        projectsCount: 12,
        issuesResolved: 47,
        lastActive: '2024-01-20T10:30:00Z'
      };
      
      setUser(mockUser);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch user profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLastActiveText = (dateString: string) => {
    const now = new Date();
    const lastActive = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `Active ${diffInHours}h ago`;
    if (diffInHours < 168) return `Active ${Math.floor(diffInHours / 24)}d ago`;
    return `Active ${Math.floor(diffInHours / 168)}w ago`;
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card/50 to-background">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-card/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarImage 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
              />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">{user.fullName}</h1>
                  <p className="text-lg text-primary font-medium mb-2">{user.role}</p>
                  <p className="text-muted-foreground mb-3">{user.department}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-4 w-4 text-success" />
                    <span className="text-sm text-success font-medium">
                      {getLastActiveText(user.lastActive)}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMessageClick?.(user)}
                    className="border-primary/20 text-primary hover:bg-primary/10"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
              
              {user.bio && (
                <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card/50 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Contact Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{user.email}</span>
            </div>
            
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{user.phone}</span>
              </div>
            )}
            
            {user.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{user.location}</span>
              </div>
            )}
            
            {user.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={user.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {user.website}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card/50 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Social Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.github && (
              <div className="flex items-center gap-3">
                <Github className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`https://github.com/${user.github}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  @{user.github}
                </a>
              </div>
            )}
            
            {user.linkedin && (
              <div className="flex items-center gap-3">
                <Linkedin className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`https://linkedin.com/in/${user.linkedin}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {user.linkedin}
                </a>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                Joined {formatDate(user.joinedDate)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Activity Stats */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card/50 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Activity Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-2xl font-bold text-primary">{user.projectsCount}</p>
              <p className="text-sm text-muted-foreground">Projects</p>
            </div>
            
            <div className="p-4 bg-success/5 rounded-lg border border-success/10">
              <p className="text-2xl font-bold text-success">{user.issuesResolved}</p>
              <p className="text-sm text-muted-foreground">Issues Resolved</p>
            </div>
            
            <Badge variant="outline" className="w-full justify-center py-2">
              Active Team Member
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;