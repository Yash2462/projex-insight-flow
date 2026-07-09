import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, className = "", animate = true }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center border-2 border-dashed border-muted-foreground/10 rounded-[2rem] bg-muted/[0.02] ${className}`}>
      <motion.div 
        initial={animate ? { scale: 0.8, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="p-4 bg-primary/5 rounded-full mb-4 ring-1 ring-primary/10 shadow-glow"
      >
        <Icon className="h-8 w-8 text-primary/60" />
      </motion.div>
      <motion.h3 
        initial={animate ? { y: 10, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-sm font-black uppercase tracking-widest text-foreground/70 mb-2"
      >
        {title}
      </motion.h3>
      {description && (
        <motion.p 
          initial={animate ? { y: 10, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs text-muted-foreground font-medium max-w-[250px]"
        >
          {description}
        </motion.p>
      )}
      {action && (
        <motion.div
          initial={animate ? { y: 10, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          {action}
        </motion.div>
      )}
    </div>
  );
}
