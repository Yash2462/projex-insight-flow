import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { issueAPI } from "@/services/api";
import { Database, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ProjectDataSeederProps {
  projectId: number;
  statuses: string[];
}

const ProjectDataSeeder = ({ projectId, statuses }: ProjectDataSeederProps) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const demoIssues = [
        {
          title: "Implement Auth Flow",
          description: "Develop the core JWT authentication logic and login/signup interfaces.",
          status: statuses[0] || "TODO",
          priority: "HIGH",
          estimatedHours: 24,
          loggedHours: 0,
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          projectId
        },
        {
          title: "Database Schema Migration",
          description: "Update JPA entities and run Flyway scripts for the new archiving system.",
          status: statuses[1] || "IN_PROGRESS",
          priority: "MEDIUM",
          estimatedHours: 16,
          loggedHours: 12,
          dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
          projectId
        },
        {
          title: "Refactor Dashboard UI",
          description: "Apply the new glass-morphism styles and improve dark mode contrast.",
          status: statuses[statuses.length - 1] || "DONE",
          priority: "MEDIUM",
          estimatedHours: 12,
          loggedHours: 12,
          dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
          projectId
        },
        {
          title: "Unit Testing Core Services",
          description: "Increase test coverage for Project and Issue services to 90%.",
          status: statuses[statuses.length - 2] || "REVIEW",
          priority: "LOW",
          estimatedHours: 20,
          loggedHours: 8,
          dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
          projectId
        },
        {
          title: "API Performance Tuning",
          description: "Optimise slow database queries and implement Redis caching where appropriate.",
          status: statuses[1] || "IN_PROGRESS",
          priority: "HIGH",
          estimatedHours: 30,
          loggedHours: 35,
          dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
          projectId
        }
      ];

      for (const iData of demoIssues) {
        await issueAPI.createIssue(iData);
      }

      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      
      toast({
        title: "Intelligence Synchronised",
        description: "Project data has been enriched with tracking metrics.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to generate task data.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleSeed}
      disabled={isSeeding}
      className="rounded-xl border-primary/10 bg-primary/5 text-primary hover:bg-primary/10 font-bold text-[10px] uppercase tracking-widest h-11 px-4"
    >
      {isSeeding ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <TrendingUp className="h-4 w-4 mr-2" />
      )}
      Generate Tracking Data
    </Button>
  );
};

export default ProjectDataSeeder;
