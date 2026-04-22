import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { projectAPI, dashboardAPI } from "@/services/api";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock,
  Loader2,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#10b981", "#f59e0b"];

const AnalyticsDashboard = () => {
  const navigate = useNavigate();

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await projectAPI.getProjects();
      return response.data.data || [];
    },
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await dashboardAPI.getStatistics();
      return response.data.data;
    },
  });

  if (isProjectsLoading || isStatsLoading) {
    return (
      <div className="min-h-screen bg-background p-6 lg:ml-64 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Process aggregate data
  const projectStatusData = projects.reduce((acc: any[], project: any) => {
    const status = project.category || "General";
    const existing = acc.find(d => d.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, []);

  const totalIssues = projects.reduce((sum: number, p: any) => sum + (p.issues?.length || 0), 0);
  const completedIssues = projects.reduce((sum: number, p: any) => 
    sum + (p.issues?.filter((i: any) => i.status === 'DONE').length || 0), 0
  );

  return (
    <div className="min-h-screen bg-background lg:ml-64 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl shadow-sm ring-1 ring-primary/5">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground">Workspace Intelligence</h1>
                <p className="text-muted-foreground font-medium mt-1 uppercase tracking-widest text-[10px]">
                  Aggregate Performance • All Workspaces
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Active Projects", value: projects.length, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
            { title: "Total Scope", value: totalIssues, icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-500/10" },
            { title: "Resolved Tasks", value: completedIssues, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
            { title: "Global Team", value: stats?.teamMembers || 0, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map((stat, i) => (
            <Card key={i} className="border border-primary/5 shadow-sm bg-card rounded-3xl relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-black tracking-tighter">{stat.value}</div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 mt-1">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border border-primary/5 shadow-elegant bg-card rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight">Project Distribution</CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">Volume by category</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {projectStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid hsl(var(--primary) / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-widest">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-primary/5 shadow-elegant bg-card rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight">Efficiency Quota</CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">Resolved vs Total Scope</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Workspace', resolved: completedIssues, remaining: totalIssues - completedIssues }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--primary))" opacity={0.05} />
                  <XAxis dataKey="name" hide />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '16px', border: '1px solid hsl(var(--primary) / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                  <Bar dataKey="resolved" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Resolved" />
                  <Bar dataKey="remaining" stackId="a" fill="hsl(var(--primary) / 0.1)" radius={[4, 4, 0, 0]} name="In Progress" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
