import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MessageSquare, MoreVertical, CheckSquare, Trash2, Paperclip, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Draggable } from "@hello-pangea/dnd";
import { getAvatarUrl } from "@/lib/utils";
import { Issue } from "@/services/api";

interface KanbanCardProps {
  issue: Issue;
  index: number;
  onDelete: (id: number) => void;
  onViewComments: (issue: Issue, initialTab?: string) => void;
}

const KanbanCard = ({ issue, index, onDelete, onViewComments }: KanbanCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "medium":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "low":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      default:
        return "text-slate-500 bg-slate-500/10 border-slate-500/20";
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
          className={`mb-3 outline-none transition-all duration-300 ${snapshot.isDragging ? "rotate-2 scale-[1.02]" : ""}`}
          onClick={() => onViewComments(issue, "overview")}
        >
          <Card className={`group relative border border-primary/5 shadow-sm hover:shadow-elegant hover:border-primary/20 transition-all duration-500 bg-card rounded-2xl overflow-hidden cursor-pointer ${snapshot.isDragging ? "shadow-2xl ring-4 ring-primary/5 border-primary/30" : ""}`}>
            {/* Soft Glow based on priority */}
            <div className={`absolute top-0 left-0 w-full h-1 opacity-80 ${
              issue.priority === "HIGH" ? "bg-red-500" : issue.priority === "MEDIUM" ? "bg-amber-500" : "bg-green-500"
            }`} />
            
            <CardContent className="p-4 pt-5">
              <div className="flex justify-between items-start mb-2.5 gap-3">
                <h4 className="text-[13px] font-bold text-foreground leading-snug flex-1 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {issue.title}
                </h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl shadow-elegant border-primary/10">
                    <DropdownMenuItem asChild className="rounded-xl font-bold text-xs py-3 cursor-pointer">
                      <Link to={`/projects/${issue.projectId}/issues/${issue.id}`} className="flex items-center w-full">
                        <Maximize2 className="h-4 w-4 mr-3 text-primary" /> 
                        Full Mission View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewComments(issue, "discussion")} className="rounded-xl font-bold text-xs py-3 cursor-pointer">
                      <MessageSquare className="h-4 w-4 mr-3 text-primary opacity-60" /> Discussion History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(issue.id)} className="rounded-xl font-bold text-xs py-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5">
                      <Trash2 className="h-4 w-4 mr-3" /> Terminate Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {issue.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed font-medium opacity-70">
                  {issue.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-primary/[0.03]">
                <div className="flex items-center gap-2">
                   <div className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-widest ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </div>
                  {issue.dueDate && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter opacity-60">
                      <Calendar className="h-3 w-3" />
                      {formatDate(issue.dueDate)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="flex items-center gap-1 text-xs font-bold text-muted-foreground/60 hover:text-primary transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewComments(issue, "attachments");
                      }}
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      {issue.attachments && issue.attachments.length > 0 && <span>{issue.attachments.length}</span>}
                    </div>
                    <div 
                      className="flex items-center gap-1 text-xs font-bold text-muted-foreground/60 hover:text-primary transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewComments(issue, "discussion");
                      }}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {issue.comments && issue.comments.length > 0 && <span>{issue.comments.length}</span>}
                    </div>
                  </div>
                  <Avatar className="h-7 w-7 border-2 border-white shadow-sm ring-1 ring-primary/5">
                    <AvatarImage src={getAvatarUrl(issue.assignee?.avatarUrl, issue.assignee?.email)} />
                    <AvatarFallback className="text-[10px] bg-primary/5 text-primary font-black uppercase">
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
