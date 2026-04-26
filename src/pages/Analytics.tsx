import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
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
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Analytics = () => {
  const chartColors = [
    "hsl(var(--primary))",
    "hsl(var(--primary-glow))",
    "#ec4899",
    "#f43f5e",
    "#10b981",
    "#f59e0b"
  ];
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = parseInt(id || "0", 10);

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await projectAPI.getProjectById(projectId);
      return response.data.data;
    },
    enabled: !!projectId,
  });

  const { data: counts, isLoading: isCountsLoading } = useQuery({
    queryKey: ["project-counts"],
    queryFn: async () => {
      const response = await dashboardAPI.getProjectCounts();
      return response.data.data;
    },
  });

  if (isProjectLoading || isCountsLoading) {
    return (
      <div className="min-h-screen bg-background p-6 lg:ml-64 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background p-6 lg:ml-64 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center rounded-[2rem] shadow-elegant border-primary/5">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Data Unavailable</h2>
          <Button onClick={() => navigate("/dashboard")} variant="outline" className="rounded-xl">Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  // Process data for charts
  const statusData = project.statuses?.map((status: string) => ({
    name: status.replace(/_/g, ' '),
    value: project.issues?.filter((i: any) => i.status === status).length || 0
  })) || [];

  const priorityData = [
    { name: 'High', value: project.issues?.filter((i: any) => i.priority === 'HIGH').length || 0 },
    { name: 'Medium', value: project.issues?.filter((i: any) => i.priority === 'MEDIUM').length || 0 },
    { name: 'Low', value: project.issues?.filter((i: any) => i.priority === 'LOW').length || 0 },
  ];

  const teamData = project.team?.map((member: any) => ({
    name: member.fullName.split(' ')[0],
    assigned: project.issues?.filter((i: any) => i.assignee?.id === member.id).length || 0,
    completed: project.issues?.filter((i: any) => i.assignee?.id === member.id && i.status === 'DONE').length || 0,
  })) || [];

  const timeData = project.issues?.filter((i: any) => i.estimatedHours > 0 || i.loggedHours > 0).map((issue: any) => ({
    name: issue.title.substring(0, 15) + (issue.title.length > 15 ? '...' : ''),
    estimated: issue.estimatedHours,
    actual: issue.loggedHours,
  })).slice(0, 8) || [];

  const totalEstimated = project.issues?.reduce((acc: number, i: any) => acc + (i.estimatedHours || 0), 0) || 0;
  const totalLogged = project.issues?.reduce((acc: number, i: any) => acc + (i.loggedHours || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background lg:ml-64 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/projects/${projectId}`)}
              className="text-muted-foreground hover:text-primary -ml-2 h-8 px-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-2" /> Back to Project
            </Button>
            <div className="flex items-center gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl shadow-sm ring-1 ring-primary/5">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground">Analytics</h1>
                <p className="text-muted-foreground font-medium mt-1 uppercase tracking-widest text-[10px]">
                  {project.name} • Performance Intelligence
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total Scope", value: project.issues?.length || 0, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
            { title: "Resolved", value: project.issues?.filter((i: any) => i.status === 'DONE').length || 0, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
            { title: "Project Time", value: `${totalLogged}h / ${totalEstimated}h`, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
            { title: "Team Load", value: project.team?.length || 0, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
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
          {/* Workload Distribution */}
          <Card className="border border-primary/5 shadow-elegant bg-card rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight">Team Workload</CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">Tasks assigned vs completed</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--primary))" opacity={0.05} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--primary) / 0.02)'}}
                    contentStyle={{ borderRadius: '16px', border: '1px solid hsl(var(--primary) / 0.1)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                  <Bar dataKey="assigned" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Assigned" />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card className="border border-primary/5 shadow-elegant bg-card rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight">Status Lifecycle</CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">Inventory across columns</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid hsl(var(--primary) / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-widest">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Time Tracking Section */}
        <Card className="border border-primary/5 shadow-elegant bg-card rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">Time Efficiency Report</CardTitle>
            <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">Estimated vs Actual Hours per task</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            {timeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--primary))" opacity={0.05} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={100}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontWeight: 700 }}
                  />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--primary) / 0.02)'}}
                    contentStyle={{ borderRadius: '16px', border: '1px solid hsl(var(--primary) / 0.1)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                  <Bar dataKey="estimated" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} name="Estimated Hours" />
                  <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Actual Hours" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <Clock className="h-10 w-10 mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">No time data tracked for this project</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
