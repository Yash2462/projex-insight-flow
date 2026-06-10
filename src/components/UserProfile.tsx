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
  onMessageClick?: (user: User) => void;
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
      const response = await projectAPI.getProjects({ size: 100 });
      const projectList = response.data.data.content || [];
      // Filter projects where this user is a member or owner
      return projectList.filter((p: Project) => 
        p.owner?.id === userId || p.team?.some((m: User) => m.id === userId)
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
    <div className="space-y-8 max-w-5xl mx-auto p-2">
      {/* Profile Header */}
      <div className="relative mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
        <div className="h-32 md:h-48 w-full bg-gradient-hero rounded-[2.5rem] shadow-2xl relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
           <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
        </div>
        <div className="absolute -bottom-12 left-6 md:left-12 flex items-end gap-6 md:gap-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <Avatar className="h-24 w-24 md:h-36 md:w-36 border-8 border-background shadow-2xl rounded-[2rem] relative">
              <AvatarImage src={getAvatarUrl(user.avatarUrl, user.email)} />
              <AvatarFallback className="text-3xl font-black bg-primary/5 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="pb-4 min-w-0">
            <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight truncate uppercase italic">{user.fullName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/10 flex items-center gap-2">
                <Mail className="h-3 w-3 text-primary" />
                <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-widest truncate">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 right-6 flex gap-3">
          {onMessageClick && (
            <Button 
              onClick={() => onMessageClick(user)}
              variant="hero"
              className="rounded-2xl h-12 px-6 shadow-glow"
              size="sm"
            >
              <MessageCircle className="h-4 w-4 mr-2" /> 
              <span className="font-black text-xs uppercase tracking-widest">Send Message</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        {/* Info Sidebar */}
        <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-700 delay-200 fill-mode-backwards">
          <Card className="glass-panel hover-lift border-primary/5 rounded-[2.5rem] p-8 space-y-8">
            <div className="space-y-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">User Profile</h3>
              <p className="text-lg font-black tracking-tight uppercase">Strategic Profile</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-5 group">
                <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:scale-110 transition-transform duration-500 shadow-sm border border-primary/5">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Designation</p>
                  <p className="text-sm font-black uppercase tracking-tight">Active Team Unit</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group">
                <div className="p-3 rounded-2xl bg-green-500/5 text-green-500 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-green-500/5">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Enlistment Date</p>
                  <p className="text-sm font-black uppercase tracking-tight">Q4 2023</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-primary/5">
               <p className="text-[10px] font-medium text-muted-foreground leading-relaxed italic opacity-70">
                 "Commitment to operational excellence and architectural integrity in every project."
               </p>
            </div>
          </Card>
        </div>

        {/* Projects List */}
        <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-right-8 duration-700 delay-300 fill-mode-backwards">
          <div className="flex items-center justify-between px-4">
            <div className="space-y-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Project Portfolio</h3>
              <p className="text-xl font-black tracking-tight uppercase">Assigned Projects</p>
            </div>
            <div className="h-10 w-10 rounded-2xl glass-panel flex items-center justify-center border-primary/10">
              <span className="font-black text-primary text-sm">{projects?.length || 0}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isProjectsLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-28 rounded-[2rem] bg-muted/10 animate-pulse border border-primary/5" />
              ))
            ) : projects && projects.length > 0 ? (
              projects.map((project: Project) => (
                <Card 
                  key={project.id}
                  className="glass-panel hover-lift border-primary/5 rounded-[2rem] p-6 group cursor-pointer"
                >
                  <div className="flex flex-col h-full justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-primary/10 flex items-center justify-center text-primary font-black text-lg border border-primary/5 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                        {project.name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors truncate">{project.name}</p>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-black uppercase tracking-tighter mt-1 px-2">
                          {project.category || "General"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Status Matrix</span>
                       <span className="text-[10px] font-black text-primary uppercase tracking-tighter bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                         {project.status || "Active"}
                       </span>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-16 text-center glass-panel rounded-[2.5rem] border-dashed border-2 border-primary/5">
                <div className="p-4 bg-muted/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-primary/5">
                   <Folder className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">No active projects found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
