import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { projectAPI, issueAPI } from "@/services/api";
import { Database, Loader2, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const DemoSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const demoProjects = [
    {
      name: "Neo-Bank Mobile App",
      description: "Building a next-generation fintech experience with real-time transaction tracking and crypto integration. High priority mission to reach v1.0 by end of quarter.",
      category: "web",
      tags: ["Mobile", "Fintech", "React Native"],
      statuses: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"]
    },
    {
      name: "Global Brand Refresh",
      description: "Overhauling our visual identity across all digital touchpoints. Focus on accessibility, speed, and premium aesthetics.",
      category: "design",
      tags: ["Branding", "UI/UX", "Identity"],
      statuses: ["TODO", "DESIGN", "FEEDBACK", "FINAL_ASSETS"]
    }
  ];

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      for (const pData of demoProjects) {
        // Create Project
        const pResponse = await projectAPI.createProject(pData);
        const projectId = pResponse.data.data.id;

        // Create diverse issues for this project
        const issues = [
          {
            title: "Architect Core API Layer",
            description: "Implementing the foundational data fetchers and interceptors for the transaction engine.",
            status: pData.statuses[1], // IN_PROGRESS
            priority: "HIGH",
            estimatedHours: 40,
            loggedHours: 12,
            dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
            projectId
          },
          {
            title: "Design System Implementation",
            description: "Converting Figma tokens to Tailwind CSS variables and base components.",
            status: pData.statuses[3], // DONE
            priority: "MEDIUM",
            estimatedHours: 20,
            loggedHours: 24,
            dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
            projectId
          },
          {
            title: "Security Audit Patching",
            description: "Addressing high-risk vulnerabilities found in the latest dependency scan.",
            status: pData.statuses[0], // TODO
            priority: "HIGH",
            estimatedHours: 15,
            loggedHours: 0,
            dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
            projectId
          },
          {
            title: "Performance Optimisation",
            description: "Reducing main bundle size by 30% through code splitting and asset compression.",
            status: pData.statuses[2], // REVIEW
            priority: "LOW",
            estimatedHours: 10,
            loggedHours: 8,
            dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
            projectId
          }
        ];

        for (const iData of issues) {
          await issueAPI.createIssue(iData);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["project-counts"] });

      toast({
        title: "Ecosystem Synchronised",
        description: "Demo data has been successfully deployed to your workspace.",
      });
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: "Unable to seed data. Please check connection.",
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
      className="rounded-xl border-primary/10 bg-primary/5 text-primary hover:bg-primary/10 font-bold text-[10px] uppercase tracking-widest h-12 px-6"
    >
      {isSeeding ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4 mr-2" />
      )}
      Deploy Demo Ecosystem
    </Button>
  );
};

export default DemoSeeder;
