import { useMemo } from "react";
import KanbanCard from "./KanbanCard";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, AlertCircle, CheckCircle2, CircleDashed, PlayCircle, HelpCircle, Trash2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { Issue } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanColumn {
  id: string;
  title: string;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  issues: Issue[];
  onDeleteIssue: (id: number) => void;
  onUpdateIssueStatus: (id: number, status: string) => void;
  onReorderIssues?: (issueOrders: { id: number; index: number; status: string }[]) => void;
  onDeleteColumn?: (columnId: string) => void;
  onViewComments: (issue: Issue, initialTab?: string) => void;
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
  onReorderIssues,
  onDeleteColumn,
  onViewComments,
  onCreateIssue
}: KanbanBoardProps) => {
  
  // Group and sort issues by status and orderIndex
  const groupedIssues = useMemo(() => {
    const map: Record<string, Issue[]> = {};
    columns.forEach(col => {
      map[col.id] = issues.filter(issue => issue.status === col.id)
                          .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    });
    return map;
  }, [columns, issues]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;
    
    const sourceIssues = Array.from(groupedIssues[sourceColId] || []);
    const [movedIssue] = sourceIssues.splice(source.index, 1);
    
    let reorderPayload: { id: number; index: number; status: string }[] = [];
    
    if (sourceColId === destColId) {
      // Reordering within the same column
      sourceIssues.splice(destination.index, 0, movedIssue);
      reorderPayload = sourceIssues.map((issue, idx) => ({
        id: issue.id,
        index: idx,
        status: sourceColId
      }));
    } else {
      // Moving to a different column
      const destIssues = Array.from(groupedIssues[destColId] || []);
      const updatedMovedIssue = { ...movedIssue, status: destColId };
      destIssues.splice(destination.index, 0, updatedMovedIssue as any);
      
      // Update indices for both columns
      const sourcePayload = sourceIssues.map((issue, idx) => ({
        id: issue.id,
        index: idx,
        status: sourceColId
      }));
      
      const destPayload = destIssues.map((issue, idx) => ({
        id: issue.id,
        index: idx,
        status: destColId
      }));
      
      reorderPayload = [...sourcePayload, ...destPayload];
    }
    
    if (onReorderIssues) {
      onReorderIssues(reorderPayload);
    } else if (sourceColId !== destColId) {
      onUpdateIssueStatus(parseInt(draggableId), destColId);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 min-h-[calc(100vh-250px)] overflow-x-auto pb-6 -mx-6 px-6 scrollbar-hide">
        {columns.map((column) => {
          const columnIssues = groupedIssues[column.id] || [];
          const Icon = getColumnIcon(column.id);
          const colorClasses = getColumnColor(column.id);

          return (
            <div key={column.id} className="flex flex-col min-w-[320px] max-w-[320px]">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-3 py-1">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${colorClasses} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-foreground text-[13px] tracking-tight uppercase letter-spacing-[0.05em]">
                    {column.title}
                  </h3>
                  <div className="px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                    <span className="text-[10px] font-black text-muted-foreground">{columnIssues.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                    onClick={() => onCreateIssue(column.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl border-primary/10 p-1">
                      <DropdownMenuItem 
                        onClick={() => onCreateIssue("NEW_LIST")}
                        className="flex items-center gap-2 font-bold text-[10px] uppercase py-2.5 rounded-lg"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        Manage Workflow
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-2 font-bold text-[10px] uppercase py-2.5 rounded-lg text-destructive focus:text-destructive focus:bg-destructive/5"
                        onClick={() => {
                          if (columnIssues.length > 0) {
                            alert("Cannot delete column with active tasks. Please move or delete tasks first.");
                            return;
                          }
                          if (confirm(`Are you sure you want to delete the "${column.title}" column?`)) {
                            onDeleteColumn?.(column.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Column
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Droppable Column Area */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 rounded-[1.5rem] p-3 min-h-[150px] transition-all duration-500 border border-transparent ${
                      snapshot.isDraggingOver 
                        ? "bg-primary/[0.03] border-primary/20 ring-4 ring-primary/[0.02]" 
                        : "bg-muted/10 hover:bg-muted/20"
                    }`}
                  >
                    <div className="space-y-3">
                      {columnIssues.map((issue, index) => (
                        <KanbanCard
                          key={issue.id}
                          issue={issue}
                          index={index}
                          onDelete={onDeleteIssue}
                          onViewComments={onViewComments}
                        />
                      ))}
                    </div>
                    {provided.placeholder}
                    
                    {columnIssues.length === 0 && !snapshot.isDraggingOver && (
                      <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/5 rounded-2xl mb-4 bg-muted/[0.02]">
                        <div className="p-3 bg-muted/5 rounded-full mb-3">
                          <CircleDashed className="h-6 w-6 text-muted-foreground/20 animate-spin-slow" />
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                          No tasks here
                        </p>
                      </div>
                    )}

                    <Button 
                      variant="ghost" 
                      className="w-full h-11 border border-dashed border-primary/10 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary text-xs font-bold justify-center gap-2 group transition-all duration-500 rounded-2xl mt-2"
                      onClick={() => onCreateIssue(column.id)}
                    >
                      <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                      ADD TASK
                    </Button>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}

        <div className="flex flex-col min-w-[320px] max-w-[320px]">
          <Button 
            variant="ghost" 
            className="w-full h-[60px] border-2 border-dashed border-primary/10 hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary text-[11px] font-black uppercase tracking-widest justify-center gap-2 group transition-all duration-500 rounded-[1.5rem]"
            onClick={() => onCreateIssue("NEW_LIST")}
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
            Add Another List
          </Button>
        </div>
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
