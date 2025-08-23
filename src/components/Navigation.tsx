import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  FolderOpen, 
  Users, 
  MessageSquare, 
  Settings, 
  CreditCard,
  User,
  LogOut,
  Menu,
  X
} from "lucide-react";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: FolderOpen, label: "Projects", path: "/projects" },
    { icon: Users, label: "Team", path: "/team" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: CreditCard, label: "Subscription", path: "/subscription" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-card shadow-elegant"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <nav className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-foreground">ProjeX</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
                    ${isActivePath(item.path) 
                      ? 'bg-primary text-primary-foreground shadow-glow' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">John Doe</p>
                <p className="text-xs text-muted-foreground">john@example.com</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;