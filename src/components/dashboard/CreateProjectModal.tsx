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
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Quick Templates</p>
            <div className="grid grid-cols-3 gap-3">
              <button 
                type="button"
                onClick={() => applyTemplate('web')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-primary/5 bg-primary/5 hover:bg-primary/10 transition-all group"
              >
                <Code className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Web Dev</span>
              </button>
              <button 
                type="button"
                onClick={() => applyTemplate('design')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-primary/5 bg-primary/5 hover:bg-primary/10 transition-all group"
              >
                <Palette className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Design</span>
              </button>
              <button 
                type="button"
                onClick={() => applyTemplate('marketing')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-primary/5 bg-primary/5 hover:bg-primary/10 transition-all group"
              >
                <Megaphone className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Marketing</span>
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
                    <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Workspace Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., App Development Hub"
                        className="h-12 bg-muted/20 border-primary/5 rounded-xl font-bold focus-visible:ring-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-muted/20 border-primary/5 rounded-xl font-bold">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-primary/10">
                          <SelectItem value="web" className="rounded-lg">Engineering</SelectItem>
                          <SelectItem value="design" className="rounded-lg">Product Design</SelectItem>
                          <SelectItem value="marketing" className="rounded-lg">Brand Growth</SelectItem>
                          <SelectItem value="other" className="rounded-lg">Operations</SelectItem>
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
                      <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Tags (Comma split)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="v1, priority"
                          className="h-12 bg-muted/20 border-primary/5 rounded-xl font-bold"
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
                    <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Strategy & Context</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Define the mission objectives..."
                        className="bg-muted/20 border-primary/5 rounded-xl min-h-[100px] font-medium"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  type="submit"
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
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
