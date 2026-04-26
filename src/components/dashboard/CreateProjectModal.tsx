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
import { projectAPI, userAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Rocket, Code, Palette, Megaphone } from "lucide-react";
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
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      // Update onboarding step (swallow error if it fails)
      userAPI.completeOnboardingStep("create_project").catch(() => {});
      
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

  const applyTemplate = (category: string) => {
    switch(category) {
      case 'web':
        setNewProject({ ...newProject, category: 'web', tags: 'frontend, backend, api' });
        break;
      case 'design':
        setNewProject({ ...newProject, category: 'design', tags: 'figma, landing-page, prototype' });
        break;
      case 'marketing':
        setNewProject({ ...newProject, category: 'marketing', tags: 'social-media, campaign, seo' });
        break;
    }
  };

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
      <DialogContent className="sm:max-w-[550px] border-0 shadow-2xl bg-card p-0 overflow-hidden rounded-[2.5rem]">
        <div className="bg-gradient-primary h-2 w-full" />
        <div className="p-8 space-y-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <Rocket className="h-8 w-8 text-primary" />
              Launch Project
            </DialogTitle>
            <DialogDescription className="text-sm font-medium opacity-60">
              Set up your new workspace and invite your team to collaborate.
            </DialogDescription>
          </DialogHeader>

          {/* Quick Templates */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Quick Templates</Label>
            <div className="grid grid-cols-3 gap-3">
              <button 
                type="button"
                onClick={() => applyTemplate('web')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-primary/5 bg-primary/5 hover:bg-primary/10 transition-all group"
              >
                <Code className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Web Dev</span>
              </button>
              <button 
                type="button"
                onClick={() => applyTemplate('design')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-primary/5 bg-primary/5 hover:bg-primary/10 transition-all group"
              >
                <Palette className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Design</span>
              </button>
              <button 
                type="button"
                onClick={() => applyTemplate('marketing')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-primary/5 bg-primary/5 hover:bg-primary/10 transition-all group"
              >
                <Megaphone className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Marketing</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Workspace Name</Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="e.g., App Development Hub"
                className="h-12 bg-muted/20 border-primary/5 rounded-xl font-bold focus-visible:ring-primary/20"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Industry</Label>
                <Select
                  value={newProject.category}
                  onValueChange={(value) =>
                    setNewProject((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="h-12 bg-muted/20 border-primary/5 rounded-xl font-bold">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-primary/10">
                    <SelectItem value="web" className="rounded-lg">Engineering</SelectItem>
                    <SelectItem value="design" className="rounded-lg">Product Design</SelectItem>
                    <SelectItem value="marketing" className="rounded-lg">Brand Growth</SelectItem>
                    <SelectItem value="other" className="rounded-lg">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Tags (Comma split)</Label>
                <Input
                  id="tags"
                  value={newProject.tags}
                  onChange={(e) =>
                    setNewProject((prev) => ({
                      ...prev,
                      tags: e.target.value,
                    }))
                  }
                  placeholder="v1, priority"
                  className="h-12 bg-muted/20 border-primary/5 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Strategy & Context</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Define the mission objectives..."
                className="bg-muted/20 border-primary/5 rounded-xl min-h-[100px] font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleCreateProject}
              variant="hero"
              className="w-full h-14 text-base font-black rounded-2xl transition-all active:scale-[0.98]"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  PREPARING WORKSPACE...
                </>
              ) : (
                "ACTIVATE PROJECT"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
