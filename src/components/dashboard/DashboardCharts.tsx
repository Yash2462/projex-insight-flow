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

const DashboardCharts = ({ counts, isLoading }: DashboardChartsProps) => {
  const chartColors = [
    "hsl(var(--primary))",
    "hsl(var(--primary-glow))",
    "#ec4899",
    "#f43f5e",
    "#10b981",
    "#f59e0b"
  ];

  if (isLoading || !counts) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="glass-panel h-[400px] rounded-[2rem] border-primary/5">
            <CardHeader className="space-y-3">
              <div className="h-7 w-40 bg-muted/40 rounded-xl animate-pulse"></div>
              <div className="h-4 w-60 bg-muted/20 rounded-lg animate-pulse"></div>
            </CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center relative">
              <div className="h-40 w-40 rounded-full border-[12px] border-muted/20 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 bg-muted/30 rounded-full animate-ping"></div>
              </div>
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
      <Card className="glass-panel hover-lift rounded-[2rem] border-primary/5 overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity duration-700 pointer-events-none">
          <TrendingUp className="h-32 w-32" />
        </div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-black tracking-tight text-foreground">Status Distribution</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Real-time volume metrics</CardDescription>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/10">
              <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{counts.total} Active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[250px] md:h-[300px]">
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
                stroke="none"
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} className="hover:opacity-80 transition-all duration-300 cursor-pointer" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "20px",
                  boxShadow: "var(--shadow-elegant)",
                  padding: "12px"
                }}
                itemStyle={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle" 
                iconSize={8}
                formatter={(value) => <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Project Velocity / Health */}
      <Card className="glass-panel hover-lift rounded-[2rem] border-primary/5 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                Velocity Insight
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Completion performance</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <div className="text-3xl font-black text-primary tracking-tighter drop-shadow-sm">{completionRate}%</div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Health Score</div>
              </div>
              {counts.overdue > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive animate-pulse shadow-sm">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{counts.overdue} Critical</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[250px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--primary))" opacity={0.03} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "20px",
                  boxShadow: "var(--shadow-elegant)",
                  padding: "12px"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="hsl(var(--primary))" 
                strokeWidth={5}
                fillOpacity={1} 
                fill="url(#colorPoints)" 
                name="Points Cleared"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
