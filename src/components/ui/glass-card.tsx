import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  gradient = false,
  ...props 
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-[2rem] transition-all duration-500 overflow-hidden relative",
        gradient && "bg-gradient-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
