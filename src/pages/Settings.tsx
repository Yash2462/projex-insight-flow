import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Key,
  Save,
  Upload,
  Trash2,
  Loader2
} from "lucide-react";
import { userAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Settings = () => {
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Notification States
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [projectNotifs, setProjectNotifs] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);
  const [taskNotifs, setTaskNotifs] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data;
    },
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatarUrl || "");
      setEmailNotifs(profile.emailNotificationsEnabled ?? true);
      setProjectNotifs(profile.projectUpdateNotificationsEnabled ?? true);
      setMessageNotifs(profile.messageNotificationsEnabled ?? true);
      setTaskNotifs(profile.taskAssignmentNotificationsEnabled ?? true);
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { fullName: string; bio: string; avatarUrl: string }) => 
      userAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: any) => userAPI.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Preferences Saved",
        description: "Your notification settings have been updated.",
      });
    },
  });

  const handleSavePreferences = () => {
    updatePreferencesMutation.mutate({
      emailNotificationsEnabled: emailNotifs,
      projectUpdateNotificationsEnabled: projectNotifs,
      messageNotificationsEnabled: messageNotifs,
      taskAssignmentNotificationsEnabled: taskNotifs
    });
  };

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => userAPI.uploadAvatar(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setAvatarUrl(response.data.data.avatarUrl);
      toast({ title: "Success", description: "Avatar updated" });
    },
    onSettled: () => setIsUploading(false)
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadAvatarMutation.mutate(file);
    }
  };

  const avatarStyles = [
    "avataaars",
    "bottts",
    "pixel-art",
    "adventurer",
    "big-smile",
    "croodles",
    "lorelei"
  ];

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({ fullName, bio, avatarUrl });
  };

  const selectPredefinedAvatar = (style: string) => {
    const newUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${profile?.email || 'user'}`;
    setAvatarUrl(newUrl);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background md:ml-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const effectiveAvatarUrl = avatarUrl 
    ? (avatarUrl.startsWith('http') ? avatarUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${avatarUrl}`)
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.email}`;

  return (
    <div className="min-h-screen bg-background md:ml-64 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-2 uppercase">Settings Console</h1>
          <p className="text-sm font-medium text-muted-foreground opacity-60">Architect your personal workspace experience and operational parameters.</p>
        </header>

        <Tabs defaultValue="profile" className="space-y-10">
          <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-100 fill-mode-backwards">
            <TabsList className="inline-flex w-auto p-1.5 glass-panel rounded-2xl border-primary/5 shadow-inner">
              <TabsTrigger value="profile" className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all duration-300">
                <User className="h-3.5 w-3.5" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all duration-300">
                <Bell className="h-3.5 w-3.5" />
                Alerts
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab - Bento Layout */}
          <TabsContent value="profile" className="outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Identity Card */}
              <Card className="glass-panel hover-lift lg:col-span-1 rounded-[2.5rem] border-primary/5 p-8 flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-backwards">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-700"></div>
                  <Avatar className="w-40 h-40 border-8 border-background relative shadow-2xl ring-1 ring-primary/10">
                    <AvatarImage src={effectiveAvatarUrl} />
                    <AvatarFallback className="text-4xl font-black">
                      {profile?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-2xl shadow-glow hover:scale-110 transition-transform active:scale-95 border-4 border-background"
                  >
                    <Upload className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black tracking-tight uppercase">{fullName || "User"}</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">{profile?.email}</p>
                </div>

                <div className="w-full space-y-4 pt-4 border-t border-primary/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Quick Styles</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {avatarStyles.map((style) => (
                      <button
                        key={style}
                        onClick={() => selectPredefinedAvatar(style)}
                        className={`w-12 h-12 rounded-2xl border-2 transition-all overflow-hidden ${
                          avatarUrl.includes(style) ? "border-primary scale-110 shadow-glow" : "border-transparent opacity-40 hover:opacity-100"
                        }`}
                      >
                        <img 
                          src={`https://api.dicebear.com/7.x/${style}/svg?seed=${profile?.email || 'user'}`} 
                          alt={style}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Bio & Details Card */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass-panel hover-lift rounded-[2.5rem] border-primary/5 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-backwards">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Identity</Label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-12 glass-input rounded-xl font-bold"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">User Bio</Label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="min-h-[120px] glass-input rounded-2xl font-medium p-4 resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">External Avatar Matrix (URL)</Label>
                    <Input
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://source.unsplash.com/user/profile"
                      className="h-12 glass-input rounded-xl font-medium"
                    />
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={handleSaveProfile} 
                      variant="hero"
                      className="h-14 px-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow" 
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-3" />
                          Synchronize Matrix
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab - Polished */}
          <TabsContent value="notifications" className="outline-none max-w-2xl">
            <Card className="glass-panel rounded-[2.5rem] border-primary/5 p-10 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-1">
                <h3 className="text-xl font-black tracking-tight uppercase">Neural Alerts</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Manage your sensory input and notification bandwidth</p>
              </div>

              <div className="space-y-8">
                {[
                  { label: "Email Notifications", desc: "Receive updates directly to your inbox", state: emailNotifs, setter: setEmailNotifs },
                  { label: "Project Alerts", desc: "Real-time alerts for project structure and status changes", state: projectNotifs, setter: setProjectNotifs },
                  { label: "Direct Messages", desc: "Immediate notification for direct encrypted messages", state: messageNotifs, setter: setMessageNotifs },
                  { label: "Task Assignment", desc: "Sensory feedback when assigned to new project tasks", state: taskNotifs, setter: setTaskNotifs }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="space-y-1">
                      <Label className="font-black text-xs uppercase tracking-tight group-hover:text-primary transition-colors">{item.label}</Label>
                      <p className="text-[10px] font-bold text-muted-foreground opacity-60 leading-relaxed uppercase tracking-tighter">{item.desc}</p>
                    </div>
                    <Switch 
                      checked={item.state} 
                      onCheckedChange={item.setter} 
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSavePreferences} 
                  variant="hero"
                  className="h-14 px-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow" 
                  disabled={updatePreferencesMutation.isPending}
                >
                  {updatePreferencesMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-3" />
                      Commit Preferences
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;