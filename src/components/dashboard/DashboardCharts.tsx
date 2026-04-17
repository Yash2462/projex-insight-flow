import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { ProjectCounts } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, AlertTriangle } from "lucide-react";

interface DashboardChartsProps {
  counts: ProjectCounts | undefined;
  isLoading: boolean;
}

const COLORS = ["#8B5CF6", "#3B82F6", "#F59E0B", "#EF4444", "#10B981", "#6B7280"];

const DashboardCharts = ({ counts, isLoading }: DashboardChartsProps) => {
  if (isLoading || !counts) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse h-[400px]">
            <CardHeader>
              <div className="h-6 w-48 bg-muted rounded mb-2"></div>
              <div className="h-4 w-64 bg-muted rounded"></div>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="h-48 w-48 rounded-full bg-muted"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Transform Status Data
  const statusData = Object.entries(counts.byStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " "),
    value
  }));

  // Velocity Data (Simulated historical data combined with real current data)
  const velocityData = [
    { name: "Week 1", completed: Math.round(counts.completedStoryPoints * 0.4), total: Math.round(counts.totalStoryPoints * 0.8) },
    { name: "Week 2", completed: Math.round(counts.completedStoryPoints * 0.6), total: Math.round(counts.totalStoryPoints * 0.9) },
    { name: "Week 3", completed: Math.round(counts.completedStoryPoints * 0.8), total: counts.totalStoryPoints },
    { name: "Current", completed: counts.completedStoryPoints, total: counts.totalStoryPoints },
  ];

  const completionRate = counts.totalStoryPoints > 0 
    ? Math.round((counts.completedStoryPoints / counts.totalStoryPoints) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Project Status Distribution */}
      <Card className="border-0 shadow-elegant bg-gradient-to-br from-card to-card/50 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp className="h-24 w-24" />
        </div>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Work Distribution</CardTitle>
              <CardDescription>Project status and volume</CardDescription>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              {counts.total} Total Projects
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Project Velocity / Health */}
      <Card className="border-0 shadow-elegant bg-gradient-to-br from-card to-card/50 overflow-hidden relative group">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Workspace Velocity
              </CardTitle>
              <CardDescription>Story points completion trend</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-primary">{completionRate}%</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Overall Progress</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={velocityData}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.05} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 600 }}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPoints)" 
                name="Points Completed"
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={1}
                strokeDasharray="5 5"
                fill="none" 
                name="Total Scope"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
        {counts.overdue > 0 && (
          <div className="absolute bottom-4 right-6 flex items-center gap-1.5 text-destructive animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase">{counts.overdue} Tasks Overdue</span>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardCharts;
