import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, Users, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { DashboardStatistics } from "@/services/api";

interface DashboardStatsProps {
  stats: DashboardStatistics | undefined;
  isLoading: boolean;
}

const DashboardStats = ({ stats, isLoading }: DashboardStatsProps) => {
  const statItems = [
    { 
      title: "Total Projects", 
      value: stats?.totalProjects ?? 0, 
      icon: Folder, 
      change: stats?.totalProjectsChange ?? "0 this month",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    { 
      title: "Team Members", 
      value: stats?.teamMembers ?? 0, 
      icon: Users, 
      change: stats?.teamMembersChange ?? "0 this week",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    { 
      title: "Active Issues", 
      value: stats?.activeIssues ?? 0, 
      icon: AlertCircle, 
      change: stats?.activeIssuesChange ?? "0 resolved today",
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    { 
      title: "Completed Tasks", 
      value: stats?.completedTasks ?? 0, 
      icon: CheckCircle, 
      change: stats?.completedTasksChange ?? "0 this week",
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-panel h-32 rounded-[2rem] border-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted/40 rounded-lg animate-pulse"></div>
              <div className="h-8 w-8 bg-muted/20 rounded-xl animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-muted/30 rounded-lg mb-2 animate-pulse"></div>
              <div className="h-3 w-24 bg-muted/10 rounded-full animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="glass-panel hover-lift border-primary/5 rounded-[2rem] overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{item.title}</CardTitle>
              <div className={`p-2.5 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors duration-500">{item.value}</div>
              <div className="flex items-center mt-3">
                 <div className="px-2.5 py-1 rounded-xl bg-primary/5 border border-primary/5 group-hover:border-primary/10 group-hover:bg-primary/10 transition-all duration-500">
                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{item.change}</span>
                 </div>
              </div>
            </CardContent>
            
            {/* Dynamic Background Orb */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${item.bg} blur-[40px] opacity-20 group-hover:opacity-40 transition-all duration-700 pointer-events-none`}></div>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;
