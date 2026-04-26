import { useState, useEffect } from "react";
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
import { projectAPI, Project } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

const EditProjectModal = ({ open, onOpenChange, project }: EditProjectModalProps) => {
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (project) {
      setProjectData({
        name: project.name || "",
        description: project.description || "",
        category: project.category || "other",
        tags: project.tags?.join(", ") || "",
      });
    }
  }, [project, open]);

  const mutation = useMutation({
    mutationFn: (data: any) => projectAPI.updateProject(project.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
      
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const handleUpdateProject = () => {
    if (!projectData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    const data = {
      ...projectData,
      tags: projectData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    };
    
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] border-0 shadow-2xl bg-card p-0 overflow-hidden rounded-[2.5rem]">
        <div className="bg-primary h-2 w-full opacity-20" />
        <div className="p-8 space-y-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <Settings2 className="h-8 w-8 text-primary" />
              Update Workspace
            </DialogTitle>
            <DialogDescription className="text-sm font-medium opacity-60">
              Refine your project parameters and core documentation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Workspace Name</Label>
              <Input
                id="edit-name"
                value={projectData.name}
                onChange={(e) =>
                  setProjectData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="h-12 bg-muted/20 border-primary/5 rounded-xl font-bold focus-visible:ring-primary/20"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Industry</Label>
                <Select
                  value={projectData.category}
                  onValueChange={(value) =>
                    setProjectData((prev) => ({ ...prev, category: value }))
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
                <Label htmlFor="edit-tags" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Tags</Label>
                <Input
                  id="edit-tags"
                  value={projectData.tags}
                  onChange={(e) =>
                    setProjectData((prev) => ({
                      ...prev,
                      tags: e.target.value,
                    }))
                  }
                  className="h-12 bg-muted/20 border-primary/5 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Strategy & Context</Label>
              <Textarea
                id="edit-description"
                value={projectData.description}
                onChange={(e) =>
                  setProjectData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="bg-muted/20 border-primary/5 rounded-xl min-h-[120px] font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleUpdateProject}
              variant="hero"
              className="w-full h-14 text-base font-black rounded-2xl transition-all active:scale-[0.98]"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  SAVING CHANGES...
                </>
              ) : (
                "SAVE PARAMETERS"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;
