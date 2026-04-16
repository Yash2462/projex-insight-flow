import { useState } from "react";
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
  Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "@/services/api";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data;
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
          <div className="p-8">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-500">
                <Zap className="text-white h-6 w-6 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-foreground">PROJEX</span>
                <span className="text-[10px] font-bold text-primary tracking-[0.2em] -mt-1 uppercase">Insight Flow</span>
              </div>
            </Link>
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
