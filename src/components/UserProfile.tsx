import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userAPI, projectAPI } from "@/services/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  User as UserIcon, 
  Briefcase, 
  Calendar, 
  MessageCircle,
  Loader2,
  Folder
} from "lucide-react";
import { getAvatarUrl } from "@/lib/utils";

interface UserProfileProps {
  userId: number;
  onMessageClick?: (user: any) => void;
}

const UserProfile = ({ userId, onMessageClick }: UserProfileProps) => {
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await userAPI.getUserById(userId);
      return response.data.data;
    },
    enabled: !!userId,
  });

  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["user-projects", userId],
    queryFn: async () => {
      const response = await projectAPI.getProjects();
      // Filter projects where this user is a member or owner
      return (response.data.data || []).filter((p: any) => 
        p.owner?.id === userId || p.team?.some((m: any) => m.id === userId)
      );
    },
    enabled: !!userId,
  });

  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  const initials = user.fullName?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "?";

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-4">
      {/* Profile Header */}
      <div className="relative mb-12 md:mb-8">
        <div className="h-24 md:h-32 w-full bg-gradient-primary rounded-2xl md:rounded-t-3xl shadow-lg" />
        <div className="absolute -bottom-10 md:-bottom-12 left-4 md:left-8 flex items-end gap-4 md:gap-6">
          <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-background shadow-xl rounded-2xl">
            <AvatarImage src={getAvatarUrl(user.avatarUrl, user.email)} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="pb-1 md:pb-2 min-w-0">
            <h2 className="text-xl md:text-3xl font-black text-foreground tracking-tight truncate">{user.fullName}</h2>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Mail className="h-3 md:h-3.5 w-3 md:w-3.5" />
              <span className="text-xs md:text-sm font-medium truncate">{user.email}</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-2 right-4 flex gap-2">
          {onMessageClick && (
            <Button 
              onClick={() => onMessageClick(user)}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-0 rounded-xl h-8 px-3"
              size="sm"
            >
              <MessageCircle className="h-3.5 w-3.5 mr-2" /> 
              <span className="hidden sm:inline">Message</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 md:pt-8">
        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 shadow-elegant bg-card/60 backdrop-blur-md rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <UserIcon className="h-3 w-3" /> About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/5 text-primary">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Role</p>
                  <p className="text-sm font-semibold">Team Member</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/5 text-green-500">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Joined</p>
                  <p className="text-sm font-semibold">Dec 2023</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Folder className="h-5 w-5 text-primary" /> Active Projects
            </h3>
            <Badge variant="secondary" className="rounded-md">
              {projects?.length || 0}
            </Badge>
          </div>
          
          <div className="grid gap-4">
            {isProjectsLoading ? (
              [...Array(2)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-muted/30 animate-pulse" />
              ))
            ) : projects && projects.length > 0 ? (
              projects.map((project: any) => (
                <div 
                  key={project.id}
                  className="group flex items-center justify-between p-4 rounded-2xl border bg-background/40 hover:bg-background hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary/10 flex items-center justify-center text-primary font-bold">
                      {project.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm group-hover:text-primary transition-colors">{project.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{project.category || "General"}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary">
                    {project.status || "In Progress"}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-muted/20 rounded-2xl border border-dashed">
                <p className="text-sm text-muted-foreground">No active projects found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
