import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  FolderOpen,
  Settings,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  BarChart3,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Bell,
  Check,
  Trash2,
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI, notificationAPI } from "@/services/api";
import { useWebSocket } from "@/hooks/use-websocket";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data;
    },
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await notificationAPI.getUnreadNotifications();
      return response.data.data || [];
    },
    enabled: !!profile,
  });

  // WebSocket for real-time notifications
  const { subscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (isConnected && profile?.email) {
      subscribe(`/user/${profile.email}/queue/notifications`, (notification) => {
        // Update notification cache
        queryClient.setQueryData(["notifications"], (prev: any) => [notification, ...(prev || [])]);
      });
    }
  }, [isConnected, profile?.email, subscribe, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const navigationItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FolderOpen, label: "Projects", path: "/projects" },
    { icon: BarChart3, label: "Analytics", path: "/analytics", disabled: true },
    { icon: CreditCard, label: "Subscription", path: "/subscription" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-card/80 backdrop-blur-md shadow-elegant rounded-xl border border-primary/10"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-primary" />
          ) : (
            <Menu className="h-5 w-5 text-primary" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <nav
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-card/60 backdrop-blur-xl border-r border-primary/5 transform transition-all duration-500 ease-in-out
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-500">
                <Zap className="text-white h-6 w-6 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-foreground">PROJEX</span>
                <span className="text-[10px] font-bold text-primary tracking-[0.2em] -mt-1 uppercase">Insight Flow</span>
              </div>
            </Link>

            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-primary/10 group">
                  <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-glow">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="right" className="w-80 p-0 bg-card/90 backdrop-blur-xl border-primary/10 shadow-2xl rounded-2xl overflow-hidden ml-2">
                <div className="p-4 bg-background/50 flex items-center justify-between">
                  <DropdownMenuLabel className="font-bold text-sm">Notifications</DropdownMenuLabel>
                  {notifications.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-lg"
                      onClick={() => markAllAsReadMutation.mutate()}
                    >
                      MARK ALL AS READ
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator className="m-0 bg-primary/5" />
                <ScrollArea className="h-[350px]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Bell className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">No new notifications</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {notifications.map((notif: Notification) => (
                        <div 
                          key={notif.id} 
                          className="group p-3 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/5 transition-all relative"
                        >
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <AlertCircle className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-foreground leading-relaxed">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 rounded-lg hover:bg-primary/10"
                              onClick={() => markAsReadMutation.mutate(notif.id)}
                            >
                              <Check className="h-3 w-3 text-primary" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <DropdownMenuSeparator className="m-0 bg-primary/5" />
                <div className="p-2 bg-background/50">
                  <Button variant="ghost" className="w-full h-8 text-[10px] font-bold text-muted-foreground hover:text-primary rounded-lg">
                    VIEW ALL NOTIFICATIONS
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 py-4 space-y-2">
            <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 opacity-50">Main Menu</p>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(item.path);
              const isDisabled = item.disabled;
              
              if (isDisabled) {
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground/40 cursor-not-allowed grayscale"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                    <Badge variant="outline" className="ml-auto text-[9px] px-1 h-4 border-muted-foreground/20">
                      Soon
                    </Badge>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                      group flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-300 relative overflow-hidden
                      ${
                        active
                          ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }
                    `}
                >
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full" />
                  )}
                  <Icon
                    className={`h-5 w-5 transition-all duration-500
                    ${
                      active
                        ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                        : "group-hover:scale-110 group-hover:text-primary"
                    }
                  `}
                  />
                  <span className={`text-sm font-semibold tracking-tight transition-colors duration-300`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Upgrade Card */}
          <div className="px-6 mb-6">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-4 border border-primary/10 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all duration-500" />
              <ShieldCheck className="h-6 w-6 text-primary mb-2" />
              <p className="text-xs font-bold text-foreground mb-1">Pro Plan</p>
              <p className="text-[10px] text-muted-foreground mb-3 leading-tight">Unlock unlimited projects and advanced analytics.</p>
              <Button size="sm" variant="outline" className="w-full h-8 text-[10px] font-bold rounded-lg border-primary/20 hover:bg-primary hover:text-white transition-all duration-300">
                UPGRADE NOW
              </Button>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 mx-4 mb-8 bg-muted/40 rounded-2xl border border-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg p-0.5">
                <div className="w-full h-full bg-card rounded-[10px] flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{profile?.fullName || "User"}</p>
                <p className="text-[10px] text-muted-foreground truncate opacity-70">
                  {profile?.email || "user@example.com"}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-[11px] font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-9"
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              SIGN OUT
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30 transition-opacity duration-500"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;
