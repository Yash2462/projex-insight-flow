import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  message = "Something went wrong while fetching data.", 
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn(
      "glass-panel rounded-3xl p-8 flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in duration-500",
      className
    )}>
      <div className="relative">
        <div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full animate-pulse" />
        <div className="relative w-16 h-16 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center justify-center animate-bounce shadow-glow">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
      </div>
      
      <div className="space-y-2 max-w-xs">
        <h3 className="text-lg font-black tracking-tight text-foreground">Data Synchronization Error</h3>
        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          className="h-10 px-6 rounded-xl border-destructive/20 text-destructive font-bold text-xs uppercase tracking-widest hover:bg-destructive/10 transition-all active:scale-95 group"
        >
          <RefreshCcw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
          Attempt Reconnect
        </Button>
      )}
    </div>
  );
}
