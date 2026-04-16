import { useState, useMemo } from "react";
import KanbanCard from "./KanbanCard";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, AlertCircle, CheckCircle2, CircleDashed, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  fullName: string;
  email: string;
}

interface Issue {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee?: User;
}

interface KanbanBoardProps {
  issues: Issue[];
  onDeleteIssue: (id: number) => void;
  onUpdateIssueStatus: (id: number, status: string) => void;
  onViewComments: (issue: Issue) => void;
  onCreateIssue: (status: string) => void;
}

const COLUMNS = [
  { id: "TODO", title: "To Do", icon: CircleDashed, color: "text-slate-500", bg: "bg-slate-500/10" },
  { id: "IN_PROGRESS", title: "In Progress", icon: PlayCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "REVIEW", title: "In Review", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "DONE", title: "Completed", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
];

const KanbanBoard = ({ 
  issues, 
  onDeleteIssue, 
  onUpdateIssueStatus, 
  onViewComments,
  onCreateIssue
}: KanbanBoardProps) => {
  // Group issues by status
  const groupedIssues = useMemo(() => {
    return issues.reduce((acc, issue) => {
      const status = issue.status || "TODO";
      if (!acc[status]) acc[status] = [];
      acc[status].push(issue);
      return acc;
    }, {} as Record<string, Issue[]>);
  }, [issues]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px] overflow-x-auto pb-6">
      {COLUMNS.map((column) => {
        const columnIssues = groupedIssues[column.id] || [];
        const Icon = column.icon;

        return (
          <div key={column.id} className="flex flex-col min-w-[280px]">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${column.bg} ${column.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-foreground/80 tracking-tight">
                  {column.title}
                </h3>
                <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center text-[10px] font-bold bg-muted/50 text-muted-foreground">
                  {columnIssues.length}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => onCreateIssue(column.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Issues Container */}
            <div className="flex-1 rounded-2xl bg-muted/30 border border-muted-foreground/5 p-3 min-h-[200px] transition-colors hover:bg-muted/40 duration-300">
              {columnIssues.length > 0 ? (
                columnIssues.map((issue) => (
                  <KanbanCard
                    key={issue.id}
                    issue={issue}
                    onDelete={onDeleteIssue}
                    onUpdateStatus={onUpdateIssueStatus}
                    onViewComments={onViewComments}
                  />
                ))
              ) : (
                <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/10 rounded-xl">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    No tasks
                  </p>
                </div>
              )}
              
              <Button 
                variant="ghost" 
                className="w-full mt-2 h-9 border border-dashed border-muted-foreground/10 hover:border-primary/20 hover:bg-primary/5 text-muted-foreground hover:text-primary text-xs font-medium justify-start gap-2 group transition-all"
                onClick={() => onCreateIssue(column.id)}
              >
                <Plus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                Add Task
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
