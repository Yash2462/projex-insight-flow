import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { ErrorState } from "./ErrorState";
import { RecentActivity } from "@/services/types";
import QuickActions from "./QuickActions";

interface LiveActivityProps {
  activities: RecentActivity[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function LiveActivity({ activities, isLoading, isError, onRetry }: LiveActivityProps) {
  return (
    <aside className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <GlassCard className="rounded-[2.5rem] p-6 flex flex-col gap-6 min-h-[400px]">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-xs uppercase tracking-widest text-primary">Live Activity</h3>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        
        <div className="space-y-4 flex-1">
          {isError ? (
            <ErrorState 
              message="Failed to load activity stream." 
              onRetry={onRetry} 
              className="border-none bg-transparent p-0"
            />
          ) : isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-1 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-1/2" />
                </div>
              </div>
            ))
          ) : activities.length > 0 ? (
            activities.slice(0, 8).map((activity: RecentActivity) => (
              <div key={activity.id} className="flex gap-3 group">
                <div className="shrink-0 w-1 bg-primary/10 rounded-full group-hover:bg-primary/30 transition-colors" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">
                    {activity.action}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-black uppercase mt-1 opacity-50">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-30">
              <p className="text-xs font-bold uppercase tracking-widest">Pulse empty</p>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-primary/5">
          <QuickActions />
        </div>
      </GlassCard>
    </aside>
  );
}
