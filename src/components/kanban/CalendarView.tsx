import React from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Issue } from "@/services/api";

interface CalendarViewProps {
  issues: Issue[];
  onViewIssue: (issue: Issue) => void;
}

const CalendarView = ({ issues, onViewIssue }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getIssuesForDay = (day: Date) => {
    return issues.filter(issue => 
      issue.dueDate && isSameDay(new Date(issue.dueDate), day)
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-500";
      case "medium": return "bg-amber-500";
      case "low": return "bg-green-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8 glass-panel p-4 rounded-[2rem]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl shadow-sm ring-1 ring-primary/5">
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">{format(currentMonth, "MMMM yyyy")}</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">Timeline Overview</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-xl border-primary/5 hover:bg-primary/5">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())} className="rounded-xl border-primary/5 font-bold text-[10px] uppercase tracking-widest px-4">
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-xl border-primary/5 hover:bg-primary/5">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-2">
            {day}
          </div>
        ))}

        {days.map((day, idx) => {
          const dayIssues = getIssuesForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <Card 
              key={idx} 
              className={`min-h-[140px] rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
                !isCurrentMonth ? "opacity-20 bg-muted/5 border-transparent" : 
                isToday(day) ? "border-primary/40 bg-primary/[0.02] shadow-glow" : "border-primary/5 bg-card hover:border-primary/20"
              }`}
            >
              <div className="p-3 flex justify-between items-start">
                <span className={`text-xs font-black ${isToday(day) ? "text-primary" : "text-muted-foreground"}`}>
                  {format(day, "d")}
                </span>
                {dayIssues.length > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[9px] font-black">
                    {dayIssues.length}
                  </span>
                )}
              </div>
              <div className="flex-1 p-2 space-y-1 overflow-y-auto max-h-[100px] scrollbar-hide">
                {dayIssues.map(issue => (
                  <div 
                    key={issue.id}
                    onClick={() => onViewIssue(issue)}
                    className="p-2 rounded-lg bg-background border border-primary/5 hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className={`absolute left-0 top-0 w-1 h-full ${getPriorityColor(issue.priority)}`} />
                    <p className="text-[9px] font-bold truncate pl-1 group-hover:text-primary transition-colors">
                      {issue.title}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
