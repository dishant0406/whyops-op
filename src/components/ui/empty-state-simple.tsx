import { cn } from "@/lib/utils";
import { LucideIcon, Search } from "lucide-react";

interface EmptyStateSimpleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyStateSimple({
  title,
  description,
  icon: Icon = Search,
  action,
  className,
  ...props
}: EmptyStateSimpleProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
      {...props}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm border border-border/40 bg-surface-2/40">
        <Icon className="h-5 w-5 text-muted-foreground/60" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-xs text-muted-foreground">
        {description}
      </p>
      {action}
    </div>
  );
}
