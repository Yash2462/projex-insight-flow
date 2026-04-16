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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="group overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
              <div className={`p-2 rounded-lg ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{item.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-primary" />
                {item.change}
              </p>
            </CardContent>
            {/* Background decoration */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${item.bg} blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;
