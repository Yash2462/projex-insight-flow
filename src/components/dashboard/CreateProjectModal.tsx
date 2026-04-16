import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateProjectModal = ({ open, onOpenChange }: CreateProjectModalProps) => {
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (projectData: any) => projectAPI.createProject(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["project-counts"] });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      onOpenChange(false);
      setNewProject({ name: "", description: "", category: "", tags: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const handleCreateProject = () => {
    if (!newProject.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    const projectData = {
      ...newProject,
      tags: newProject.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    };
    
    mutation.mutate(projectData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl bg-gradient-to-br from-background to-muted/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Launch a new workspace and start collaborating with your team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">Project Name</Label>
            <Input
              id="name"
              value={newProject.name}
              onChange={(e) =>
                setNewProject((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="e.g., Marketing Revamp 2024"
              className="bg-background/50 border-primary/20 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
            <Textarea
              id="description"
              value={newProject.description}
              onChange={(e) =>
                setNewProject((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="What is this project about?"
              className="bg-background/50 border-primary/20 focus:ring-primary/30 min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
              <Select
                value={newProject.category}
                onValueChange={(value) =>
                  setNewProject((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="bg-background/50 border-primary/20">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web Development</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-sm font-semibold">Tags</Label>
              <Input
                id="tags"
                value={newProject.tags}
                onChange={(e) =>
                  setNewProject((prev) => ({
                    ...prev,
                    tags: e.target.value,
                  }))
                }
                placeholder="react, ui/ux"
                className="bg-background/50 border-primary/20 focus:ring-primary/30"
              />
            </div>
          </div>
          <Button
            onClick={handleCreateProject}
            className="w-full bg-gradient-primary hover:opacity-90 shadow-glow py-6 text-lg font-bold"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
