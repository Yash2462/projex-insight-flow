import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderOpen, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
    { icon: FolderOpen, label: "Projects", path: "/projects" },
    { icon: BarChart3, label: "Stats", path: "/analytics" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  // Don't show on splash page, login/signup, or project detail pages
  const hideOnPaths = ["/", "/login", "/signup", "/forgot-password", "/accept_invitation"];
  const isProjectDetail = location.pathname.startsWith("/projects/") && location.pathname !== "/projects";
  
  if (hideOnPaths.includes(location.pathname) || isProjectDetail) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-t border-primary/5 px-4 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-primary/10 scale-110" : "hover:bg-primary/5"
              )}>
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isActive ? "opacity-100" : "opacity-40"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
