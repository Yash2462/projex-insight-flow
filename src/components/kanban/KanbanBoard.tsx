import { useMemo } from "react";
import KanbanCard from "./KanbanCard";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, AlertCircle, CheckCircle2, CircleDashed, PlayCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";

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
  subtasks?: string[];
  completedSubtasks?: string[];
}

interface KanbanColumn {
  id: string;
  title: string;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  issues: Issue[];
  onDeleteIssue: (id: number) => void;
  onUpdateIssueStatus: (id: number, status: string) => void;
  onViewComments: (issue: Issue) => void;
  onCreateIssue: (status: string) => void;
}

const getColumnIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case "TODO": return CircleDashed;
    case "IN_PROGRESS": return PlayCircle;
    case "REVIEW": return AlertCircle;
    case "DONE":
    case "COMPLETED": return CheckCircle2;
    default: return HelpCircle;
  }
};

const getColumnColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "TODO": return "text-slate-500 bg-slate-500/10";
    case "IN_PROGRESS": return "text-blue-500 bg-blue-500/10";
    case "REVIEW": return "text-amber-500 bg-amber-500/10";
    case "DONE":
    case "COMPLETED": return "text-green-500 bg-green-500/10";
    default: return "text-primary bg-primary/10";
  }
};

const KanbanBoard = ({ 
  columns,
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

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    if (destination.droppableId !== source.droppableId) {
      onUpdateIssueStatus(parseInt(draggableId), destination.droppableId);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 min-h-[600px] overflow-x-auto pb-6 -mx-6 px-6 scrollbar-hide">
        {columns.map((column) => {
          const columnIssues = groupedIssues[column.id] || [];
          const Icon = getColumnIcon(column.id);
          const colorClasses = getColumnColor(column.id);

          return (
            <div key={column.id} className="flex flex-col min-w-[320px] max-w-[320px]">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${colorClasses}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-foreground/80 tracking-tight text-xs uppercase">
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

              {/* Droppable Column Area */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 rounded-2xl p-3 min-h-[150px] transition-all duration-300 border-2 border-transparent ${
                      snapshot.isDraggingOver 
                        ? "bg-primary/5 border-dashed border-primary/20 ring-4 ring-primary/5" 
                        : "bg-muted/30 hover:bg-muted/40"
                    }`}
                  >
                    {columnIssues.map((issue, index) => (
                      <KanbanCard
                        key={issue.id}
                        issue={issue}
                        index={index}
                        onDelete={onDeleteIssue}
                        onViewComments={onViewComments}
                      />
                    ))}
                    {provided.placeholder}
                    
                    {columnIssues.length === 0 && !snapshot.isDraggingOver && (
                      <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/10 rounded-xl mb-4">
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                          No tasks
                        </p>
                      </div>
                    )}

                    <Button 
                      variant="ghost" 
                      className="w-full h-10 border border-dashed border-muted-foreground/10 hover:border-primary/20 hover:bg-primary/5 text-muted-foreground hover:text-primary text-xs font-semibold justify-start gap-2 group transition-all rounded-xl"
                      onClick={() => onCreateIssue(column.id)}
                    >
                      <Plus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                      Add card
                    </Button>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
