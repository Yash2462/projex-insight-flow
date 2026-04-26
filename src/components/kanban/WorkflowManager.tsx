import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  GripVertical, 
  X, 
  Settings2, 
  Save, 
  RefreshCcw,
  Layout
} from "lucide-react";
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from "@hello-pangea/dnd";

interface WorkflowManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatuses: string[];
  onSave: (newStatuses: string[]) => void;
  isSaving?: boolean;
}

const WorkflowManager = ({ 
  open, 
  onOpenChange, 
  currentStatuses, 
  onSave,
  isSaving 
}: WorkflowManagerProps) => {
  const [statuses, setStatuses] = useState<string[]>(currentStatuses);
  const [newStatus, setNewStatus] = useState("");

  const handleAddStatus = () => {
    if (newStatus && !statuses.includes(newStatus.toUpperCase())) {
      setStatuses([...statuses, newStatus.toUpperCase().replace(/\s+/g, '_')]);
      setNewStatus("");
    }
  };

  const handleRemoveStatus = (statusToRemove: string) => {
    setStatuses(statuses.filter(s => s !== statusToRemove));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(statuses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setStatuses(items);
  };

  const handleReset = () => {
    setStatuses(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]);
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[2rem] border-primary/10 shadow-2xl p-0 overflow-hidden">
        <div className="p-8 space-y-6">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">Board Workflow</DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                  Customise your project stages
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                placeholder="New stage name..."
                className="h-12 bg-muted/20 border-primary/5 rounded-xl font-bold uppercase text-[11px] tracking-widest px-4"
                onKeyDown={(e) => e.key === 'Enter' && handleAddStatus()}
              />
              <Button 
                onClick={handleAddStatus} 
                className="h-12 w-12 p-0 rounded-xl bg-primary shadow-glow hover:opacity-90"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            <div className="bg-muted/5 rounded-2xl border border-primary/5 p-2">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="statuses">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {statuses.map((status, index) => (
                        <Draggable key={status} draggableId={status} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                                snapshot.isDragging 
                                  ? "bg-primary/10 border-primary/30 shadow-lg scale-[1.02]" 
                                  : "bg-background border-primary/5"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div {...provided.dragHandleProps} className="p-1 hover:bg-muted rounded-md cursor-grab active:cursor-grabbing">
                                  <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest">{formatStatus(status)}</span>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5"
                                onClick={() => handleRemoveStatus(status)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={() => onSave(statuses)} 
              variant="hero"
              className="w-full h-14 font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl"
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              Deploy Workflow
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleReset}
              className="w-full h-12 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:bg-muted/50 rounded-xl"
            >
              <RefreshCcw className="h-3 w-3 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowManager;
