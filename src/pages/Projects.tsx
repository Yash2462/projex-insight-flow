import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Folder,
  Users,
  Calendar,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Tag,
  LayoutGrid,
  ArrowRight
} from "lucide-react";
import { projectAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CreateProjectModal from "@/components/dashboard/CreateProjectModal";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await projectAPI.getProjects();
      return response.data.data || [];
    },
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectAPI.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Deleted", description: "Project has been removed." });
    },
  });

  const filteredProjects = projects?.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const calculateProgress = (project: any) => {
    if (!project.issues || project.issues.length === 0) return 0;
    const completed = project.issues.filter((i: any) => i.status?.toLowerCase() === "done").length;
    return Math.round((completed / project.issues.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 lg:ml-64">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutGrid className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
            </div>
            <p className="text-muted-foreground">Manage and track your active workspaces.</p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-primary hover:opacity-90 shadow-glow rounded-xl px-6"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Project
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-primary/10 focus:ring-primary/20 rounded-xl py-6"
            />
          </div>
          <Button variant="outline" className="rounded-xl border-primary/10 bg-background/50">
            <Filter className="h-4 w-4 mr-2" />
            All Categories
          </Button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse h-[300px] border-0 bg-muted/30" />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: any) => (
              <Card
                key={project.id}
                className="group relative border-0 shadow-elegant bg-gradient-to-br from-card to-card/50 hover:shadow-glow transition-all duration-500 overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 capitalize rounded-md">
                          {project.category || "General"}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-2 h-10">
                        {project.description || "No description provided."}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress */}
                  <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Project Completion</span>
                        <span className="text-foreground">{calculateProgress(project)}%</span>
                      </div>
                      <Progress value={calculateProgress(project)} className="h-1.5 bg-primary/10" />
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {project.team?.length || 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Folder className="h-3.5 w-3.5" />
                        {project.issues?.length || 0}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 text-primary transition-all">
                        <Link to={`/projects/${project.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => {
                          if(window.confirm("Delete project?")) deleteMutation.mutate(project.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button asChild className="w-full mt-4 bg-primary/5 text-primary border border-primary/10 hover:bg-primary hover:text-white transition-all duration-300 rounded-xl">
                    <Link to={`/projects/${project.id}`}>
                      Open Workspace <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card/40 rounded-3xl border-2 border-dashed border-primary/10">
            <Folder className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-8">Try adjusting your search or create a new workspace.</p>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              variant="outline" 
              className="rounded-xl border-primary/20 text-primary"
            >
              Create First Project
            </Button>
          </div>
        )}
      </div>

      <CreateProjectModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </div>
  );
};

export default Projects;
