import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { projectAPI, userAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Rocket, Code, Palette, Megaphone } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters."),
  description: z.string().optional(),
  category: z.string().min(1, "Please select an industry."),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateProjectModal = ({ open, onOpenChange }: CreateProjectModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      tags: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (projectData: any) => projectAPI.createProject(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["project-counts"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      userAPI.completeOnboardingStep("create_project").catch(() => {});
      
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      onOpenChange(false);
      form.reset();
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
        form.setValue('category', 'web');
        form.setValue('tags', 'frontend, backend, api');
        break;
      case 'design':
        form.setValue('category', 'design');
        form.setValue('tags', 'figma, landing-page, prototype');
        break;
      case 'marketing':
        form.setValue('category', 'marketing');
        form.setValue('tags', 'social-media, campaign, seo');
        break;
    }
  };

  const onSubmit = (values: FormValues) => {
    const projectData = {
      ...values,
      tags: values.tags
        ? values.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
    };
    
    mutation.mutate(projectData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[550px] max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-card/95 backdrop-blur-2xl p-0 rounded-[2.5rem] animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-primary h-1.5 md:h-2 w-full sticky top-0 z-10" />
        <div className="p-5 md:p-8 space-y-6 md:space-y-8">
          <DialogHeader>
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-primary/5">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl md:text-3xl font-black tracking-tight text-foreground uppercase">
              Create Workspace
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm font-bold uppercase tracking-widest opacity-60">
              Define the parameters for your new operational workspace.
            </DialogDescription>
          </DialogHeader>

          {/* Quick Templates */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Pre-configured Blueprints</p>
            <div className="grid grid-cols-3 gap-4">
              <button 
                type="button"
                onClick={() => applyTemplate('web')}
                className="flex flex-col items-center gap-2 p-5 rounded-[1.5rem] border border-primary/5 bg-primary/5 hover:bg-primary/10 transition-all group"
              >
                <Code className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-500" />
                <span className="text-[10px] font-black uppercase tracking-wider">Web Dev</span>
              </button>
              <button 
                type="button"
                onClick={() => applyTemplate('design')}
                className="flex flex-col items-center gap-2 p-5 rounded-[1.5rem] border border-primary/5 bg-primary/5 hover:bg-primary/10 transition-all group"
              >
                <Palette className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-500" />
                <span className="text-[10px] font-black uppercase tracking-wider">Design</span>
              </button>
              <button 
                type="button"
                onClick={() => applyTemplate('marketing')}
                className="flex flex-col items-center gap-2 p-5 rounded-[1.5rem] border border-primary/5 bg-primary/5 hover:bg-primary/10 transition-all group"
              >
                <Megaphone className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-500" />
                <span className="text-[10px] font-black uppercase tracking-wider">Growth</span>
              </button>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Workspace Identity</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Website Redesign"
                        className="h-12 glass-input rounded-xl font-bold"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 glass-input rounded-xl font-bold">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-primary/10 p-2">
                          <SelectItem value="web" className="rounded-xl py-3 font-bold text-xs uppercase tracking-wider">Engineering</SelectItem>
                          <SelectItem value="design" className="rounded-xl py-3 font-bold text-xs uppercase tracking-wider">Product Design</SelectItem>
                          <SelectItem value="marketing" className="rounded-xl py-3 font-bold text-xs uppercase tracking-wider">Brand Growth</SelectItem>
                          <SelectItem value="other" className="rounded-xl py-3 font-bold text-xs uppercase tracking-wider">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Strategic Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="alpha, critical"
                          className="h-12 glass-input rounded-xl font-bold"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Define the primary objectives and operational context..."
                        className="glass-input rounded-xl min-h-[120px] font-medium"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 pt-6">
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full h-14 text-sm font-black rounded-2xl transition-all active:scale-[0.98] shadow-glow"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      CREATING WORKSPACE...
                    </>
                  ) : (
                    "CREATE WORKSPACE"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
