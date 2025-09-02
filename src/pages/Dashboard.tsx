import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Folder, 
  Users, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { projectAPI, userAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState([
    { title: "Total Projects", value: "0", icon: Folder, change: "Loading..." },
    { title: "Team Members", value: "0", icon: Users, change: "Loading..." },
    { title: "Active Issues", value: "0", icon: AlertCircle, change: "Loading..." },
    { title: "Completed Tasks", value: "0", icon: CheckCircle, change: "Loading..." },
  ]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsResponse, usersResponse] = await Promise.all([
        projectAPI.getProjects(),
        userAPI.getUsers()
      ]);
      
      const projectsData = projectsResponse.data.data || [];
      const usersData = usersResponse.data || [];
      
      setProjects(projectsData);
      
      // Calculate stats from real data
      const totalIssues = projectsData.reduce((acc: number, project: any) => 
        acc + (project.issues?.length || 0), 0
      );
      
      setStats([
        { title: "Total Projects", value: projectsData.length.toString(), icon: Folder, change: "+2 this month" },
        { title: "Team Members", value: usersData.length.toString(), icon: Users, change: "+1 this week" },
        { title: "Active Issues", value: totalIssues.toString(), icon: AlertCircle, change: "5 resolved today" },
        { title: "Completed Tasks", value: "156", icon: CheckCircle, change: "+12 this week" },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Use real projects data, fallback to mock if empty
  const recentProjects = projects.length > 0 ? projects.slice(0, 3) : [
    {
      id: 1,
      name: "Website Redesign",
      description: "Complete redesign of company website",
      progress: 75,
      team: { length: 5 },
      dueDate: "2024-01-15",
      status: "In Progress",
      priority: "High",
      issues: []
    },
    {
      id: 2,
      name: "Mobile App Development", 
      description: "iOS and Android app development",
      progress: 45,
      team: { length: 3 },
      dueDate: "2024-02-28",
      status: "In Progress",
      priority: "Medium",
      issues: []
    },
    {
      id: 3,
      name: "Marketing Campaign",
      description: "Q1 marketing campaign planning", 
      progress: 90,
      team: { length: 4 },
      dueDate: "2024-01-08",
      status: "Review",
      priority: "High",
      issues: []
    }
  ];

  const recentActivity = [
    { action: "John completed task 'UI Design'", time: "2 hours ago", type: "completed" },
    { action: "Sarah created new issue in Website Redesign", time: "4 hours ago", type: "created" },
    { action: "Mike joined Mobile App Development team", time: "1 day ago", type: "joined" },
    { action: "Lisa updated project deadline", time: "2 days ago", type: "updated" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-destructive text-destructive-foreground";
      case "Medium": return "bg-yellow-500 text-yellow-50";
      case "Low": return "bg-green-500 text-green-50";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-blue-500 text-blue-50";
      case "Review": return "bg-purple-500 text-purple-50";
      case "Completed": return "bg-green-500 text-green-50";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background lg:ml-64">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your projects.</p>
          </div>
          <Button className="mt-4 lg:mt-0 bg-gradient-primary hover:opacity-90 shadow-glow">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-gradient-card shadow-elegant border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-primary" />
                  Recent Projects
                </CardTitle>
                <CardDescription>
                  Your most active projects and their current status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                      <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {project.team?.length || 0} members
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due {project.dueDate}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm">View Project</Button>
                      </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div>
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest updates from your team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className={`
                      w-2 h-2 rounded-full mt-2 flex-shrink-0
                      ${activity.type === 'completed' ? 'bg-green-500' : 
                        activity.type === 'created' ? 'bg-blue-500' :
                        activity.type === 'joined' ? 'bg-purple-500' : 'bg-yellow-500'
                      }
                    `} />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;