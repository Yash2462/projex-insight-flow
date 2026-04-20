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
          <Card key={i} className="animate-pulse bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2"></div>
              <div className="h-3 w-32 bg-muted rounded"></div>
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
          <Card key={index} className="group overflow-hidden border border-primary/5 shadow-sm bg-card hover:border-primary/20 hover:shadow-glow transition-all duration-500 rounded-3xl relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">{item.title}</CardTitle>
              <div className={`p-2 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-500`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-black text-foreground tracking-tighter">{item.value}</div>
              <div className="flex items-center mt-2 group-hover:translate-x-1 transition-transform duration-500">
                 <div className="px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10">
                    <span className="text-[10px] font-bold text-primary">{item.change}</span>
                 </div>
              </div>
            </CardContent>
            
            {/* Soft Glow Background */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${item.bg} blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-700`}></div>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;
