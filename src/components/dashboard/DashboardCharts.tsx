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

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#10b981", "#f59e0b"];

const DashboardCharts = ({ counts, isLoading }: DashboardChartsProps) => {
  if (isLoading || !counts) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse h-[400px] rounded-3xl bg-card/50">
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Project Status Distribution */}
      <Card className="border border-primary/5 shadow-elegant bg-card/50 backdrop-blur-xl overflow-hidden relative group rounded-3xl">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
          <TrendingUp className="h-32 w-32" />
        </div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">Status Metrics</CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">Volume by status</CardDescription>
            </div>
            <div className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
              <span className="text-[10px] font-black text-primary">{counts.total} ACTIVE</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={95}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  borderColor: "hsl(var(--primary) / 0.1)",
                  borderRadius: "16px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                  borderWidth: "1px"
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle" 
                formatter={(value) => <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Project Velocity / Health */}
      <Card className="border border-primary/5 shadow-elegant bg-card/50 backdrop-blur-xl overflow-hidden relative group rounded-3xl">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                Performance
              </CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">Completion Velocity</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-primary tracking-tighter">{completionRate}%</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Progress</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--primary))" opacity={0.05} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  borderColor: "hsl(var(--primary) / 0.1)",
                  borderRadius: "16px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                  borderWidth: "1px"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="hsl(var(--primary))" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorPoints)" 
                name="Points Completed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
        {counts.overdue > 0 && (
          <div className="absolute bottom-6 right-8 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{counts.overdue} Overdue</span>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardCharts;
