import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Clock,
} from "lucide-react";
import { projectAPI, userAPI, dashboardAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [recentActivity, setRecentActivity] = useState([]);
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
      const [projectsResponse, statsResponse, activityResponse] = await Promise.all([
        projectAPI.getProjects(),
        dashboardAPI.getStatistics().catch(() => null), // Fallback if API not implemented yet
        dashboardAPI.getRecentActivity(10).catch(() => null), // Fallback if API not implemented yet
      ]);

      const projectsData = projectsResponse.data.data || [];
      setProjects(projectsData);

      // Use API data if available, otherwise calculate from existing data
      if (statsResponse?.data?.data) {
        const statsData = statsResponse.data.data;
        setStats([
          { title: "Total Projects", value: statsData.totalProjects.toString(), icon: Folder, change: statsData.totalProjectsChange },
          { title: "Team Members", value: statsData.teamMembers.toString(), icon: Users, change: statsData.teamMembersChange },
          { title: "Active Issues", value: statsData.activeIssues.toString(), icon: AlertCircle, change: statsData.activeIssuesChange },
          { title: "Completed Tasks", value: statsData.completedTasks.toString(), icon: CheckCircle, change: statsData.completedTasksChange },
        ]);
      } else {
        // Fallback calculation
        const totalIssues = projectsData.reduce(
          (acc: number, project: any) => acc + (project.issues?.length || 0),
          0
        );

        setStats([
          { title: "Total Projects", value: projectsData.length.toString(), icon: Folder, change: "+2 this month" },
          { title: "Team Members", value: "8", icon: Users, change: "+1 this week" },
          { title: "Active Issues", value: totalIssues.toString(), icon: AlertCircle, change: "5 resolved today" },
          { title: "Completed Tasks", value: "156", icon: CheckCircle, change: "+12 this week" },
        ]);
      }

      // Set recent activity data
      if (activityResponse?.data?.data) {
        setRecentActivity(activityResponse.data.data);
      } else {
        // Fallback activity data
        setRecentActivity([
          { id: 1, action: "John completed task 'UI Design'", timeAgo: "2 hours ago", type: "task_completed", userName: "John Doe" },
          { id: 2, action: "Sarah created new issue in Website Redesign", timeAgo: "4 hours ago", type: "issue_created", userName: "Sarah Smith" },
          { id: 3, action: "Mike joined Mobile App Development team", timeAgo: "1 day ago", type: "member_joined", userName: "Mike Johnson" },
          { id: 4, action: "Lisa updated project deadline", timeAgo: "2 days ago", type: "project_updated", userName: "Lisa Chen" },
        ]);
      }
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

  const recentProjects =
    projects.length > 0
      ? projects.slice(0, 3)
      : [
          {
            id: 1,
            name: "Website Redesign",
            description: "Complete redesign of company website",
            category: "web development",
            tags: ["react", "tailwind", "api"],
            progress: 75,
            team: { length: 5 },
            dueDate: "2024-01-15",
            status: "In Progress",
            priority: "High",
            issues: [],
          },
          {
            id: 2,
            name: "Mobile App Development",
            description: "iOS and Android app development",
            category: "mobile",
            tags: ["flutter", "firebase"],
            progress: 45,
            team: { length: 3 },
            dueDate: "2024-02-28",
            status: "In Progress",
            priority: "Medium",
            issues: [],
          },
          {
            id: 3,
            name: "Marketing Campaign",
            description: "Q1 marketing campaign planning",
            category: "marketing",
            tags: ["seo", "ads", "analytics"],
            progress: 90,
            team: { length: 4 },
            dueDate: "2024-01-08",
            status: "Review",
            priority: "High",
            issues: [],
          },
        ];

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
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
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
                <CardDescription>Your most active projects and their current status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`
                      p-4 rounded-lg border bg-card/50 transition-all duration-200
                      hover:bg-accent hover:shadow-md cursor-pointer
                      ${selectedProjectId === project.id ? "bg-accent/60 border-primary" : ""}
                    `}
                  >
                    <h3 className="font-semibold text-foreground">{project.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{project.description}</p>

                    {project.category && (
                      <Badge
                        variant="outline"
                        className="mb-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:text-indigo-800 transition-colors"
                      >
                        {project.category}
                      </Badge>
                    )}

                    {project.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.tags.map((tag: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project.team?.length || 0} members
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {project.issues?.length || 0} issues
                      </span>
                    </div>

                    <div className="flex justify-end gap-2 mt-3">
                      <Button asChild variant="ghost" size="sm" className="hover:bg-accent hover:text-primary transition-colors">
                        <Link to={`/projects/${project.id}`}>View Project</Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white transition-colors"
                        onClick={async () => {
                          try {
                            await projectAPI.deleteProject(project.id);
                            setProjects((prev) => prev.filter((p: any) => p.id !== project.id));
                            toast({
                              title: "Deleted",
                              description: `${project.name} has been deleted.`,
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to delete project",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Delete
                      </Button>
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
                <CardDescription>Latest updates from your team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentActivity.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-md transition-colors hover:bg-accent/40"
                  >
                    <div
                      className={`
                        w-2 h-2 rounded-full mt-2 flex-shrink-0
                        ${
                          activity.type === "task_completed" || activity.type === "completed"
                            ? "bg-green-500"
                            : activity.type === "issue_created" || activity.type === "created"
                            ? "bg-blue-500"
                            : activity.type === "member_joined" || activity.type === "joined"
                            ? "bg-purple-500"
                            : "bg-yellow-500"
                        }
                      `}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.timeAgo || activity.time}</p>
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
