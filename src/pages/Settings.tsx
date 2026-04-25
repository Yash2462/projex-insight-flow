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
      <div className="min-h-screen bg-background lg:ml-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const effectiveAvatarUrl = avatarUrl 
    ? (avatarUrl.startsWith('http') ? avatarUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${avatarUrl}`)
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.email}`;

  return (
    <div className="min-h-screen bg-background lg:ml-64">
      <div className="p-6 lg:p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile Identity
                </CardTitle>
                <CardDescription>
                  Customise how you appear to your team members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-10">
                {/* Avatar Section */}
                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-50">Profile Picture</Label>
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                      <Avatar className="w-32 h-32 border-4 border-background relative ring-1 ring-primary/10">
                        <AvatarImage src={effectiveAvatarUrl} />
                        <AvatarFallback className="text-2xl font-black">
                          {profile?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95"
                      >
                        <Upload className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="flex flex-wrap gap-3">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleFileUpload} 
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-10 px-6 border-primary/10 hover:bg-primary/5"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Save className="h-3 w-3 mr-2" />}
                          Custom Upload
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-10 px-6 text-destructive hover:bg-destructive/5"
                          onClick={() => setAvatarUrl("")}
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Reset to Default
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Quick Select Styles</p>
                        <div className="flex flex-wrap gap-3">
                          {avatarStyles.map((style) => (
                            <button
                              key={style}
                              onClick={() => selectPredefinedAvatar(style)}
                              className={`w-12 h-12 rounded-xl border-2 transition-all overflow-hidden ${
                                avatarUrl.includes(style) ? "border-primary scale-110 shadow-glow" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
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
                    </div>
                  </div>
                </div>

                <Separator className="bg-primary/5" />

                <div className="grid grid-cols-1 gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest opacity-60">Full Identity</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="h-12 bg-muted/20 border-primary/5 font-bold rounded-xl focus-visible:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest opacity-60">Authentication Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        className="h-12 bg-muted/50 border-primary/5 font-bold rounded-xl opacity-60 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-xs font-black uppercase tracking-widest opacity-60">Mission Brief (Bio)</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share your expertise or current mission objective..."
                      className="min-h-[120px] bg-muted/20 border-primary/5 font-medium rounded-2xl focus-visible:ring-primary/20 resize-none p-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar" className="text-xs font-black uppercase tracking-widest opacity-60">Direct Avatar Source (URL)</Label>
                    <Input
                      id="avatar"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="h-12 bg-muted/20 border-primary/5 font-medium rounded-xl focus-visible:ring-primary/20"
                    />
                    <p className="text-[9px] text-muted-foreground font-medium opacity-60 ml-1 italic">
                      Used for integrating external profile imagery.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleSaveProfile} 
                    variant="hero"
                    className="w-full md:w-auto h-12 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95" 
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Synchronize Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch 
                      checked={emailNotifs} 
                      onCheckedChange={setEmailNotifs} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Project Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when projects are updated
                      </p>
                    </div>
                    <Switch 
                      checked={projectNotifs} 
                      onCheckedChange={setProjectNotifs} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>New Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for new messages
                      </p>
                    </div>
                    <Switch 
                      checked={messageNotifs} 
                      onCheckedChange={setMessageNotifs} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Task Assignments</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you're assigned to tasks
                      </p>
                    </div>
                    <Switch 
                      checked={taskNotifs} 
                      onCheckedChange={setTaskNotifs} 
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleSavePreferences} 
                    variant="hero"
                    className="w-full md:w-auto h-12 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95" 
                    disabled={updatePreferencesMutation.isPending}
                  >
                    {updatePreferencesMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Change Password</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Update your password to keep your account secure
                    </p>
                    <div className="space-y-3 max-w-md">
                      <Input type="password" placeholder="Current password" />
                      <Input type="password" placeholder="New password" />
                      <Input type="password" placeholder="Confirm new password" />
                      <Button variant="outline">
                        <Key className="h-4 w-4 mr-2" />
                        Update Password
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-base font-medium text-destructive">Danger Zone</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      These actions cannot be undone
                    </p>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  App Preferences
                </CardTitle>
                <CardDescription>
                  Customize your ProjeX experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle between light and dark themes
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                        <option>English (US)</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto-save</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save your work
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;