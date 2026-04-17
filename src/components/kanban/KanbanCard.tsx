import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MessageSquare, MoreVertical, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Draggable } from "@hello-pangea/dnd";

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

interface KanbanCardProps {
  issue: Issue;
  index: number;
  onDelete: (id: number) => void;
  onViewComments: (issue: Issue) => void;
}

const KanbanCard = ({ issue, index, onDelete, onViewComments }: KanbanCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
      case "critical":
        return "bg-red-500/10 text-red-600 border-red-200";
      case "medium":
        return "bg-amber-500/10 text-amber-600 border-amber-200";
      case "low":
        return "bg-green-500/10 text-green-600 border-green-200";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  const initials = issue.assignee?.fullName
    ? issue.assignee.fullName.split(" ").map(n => n[0]).join("").toUpperCase()
    : "?";

  return (
    <Draggable draggableId={issue.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 transition-transform ${snapshot.isDragging ? "rotate-3 scale-105" : ""}`}
        >
          <Card className={`group relative border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card/60 backdrop-blur-sm overflow-hidden ${snapshot.isDragging ? "shadow-2xl ring-2 ring-primary/20" : ""}`}>
            {/* Priority Indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${issue.priority === "HIGH" ? "bg-red-500" : issue.priority === "MEDIUM" ? "bg-amber-500" : "bg-green-500"}`} />
            
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight flex-1 group-hover:text-primary transition-colors">
                  {issue.title}
                </h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl">
                    <DropdownMenuItem onClick={() => onViewComments(issue)}>
                      <MessageSquare className="h-3.5 w-3.5 mr-2" /> Comments
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(issue.id)} className="text-red-600">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                {issue.description || "No description provided."}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-bold uppercase tracking-wider ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </Badge>
                  {issue.dueDate && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <Calendar className="h-3 w-3" />
                      {formatDate(issue.dueDate)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 mr-1">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                      <MessageSquare className="h-3 w-3" /> 0
                    </span>
                    {issue.subtasks && issue.subtasks.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                        <CheckSquare className="h-3 w-3" /> {issue.completedSubtasks?.length || 0}/{issue.subtasks.length}
                      </span>
                    )}
                  </div>
                  <Avatar className="h-6 w-6 border-2 border-background shadow-sm ring-1 ring-primary/5">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${issue.assignee?.email}`} />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
