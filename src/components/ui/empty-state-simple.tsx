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
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2/50">
        <Icon className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-xs text-muted-foreground">
        {description}
      </p>
      {action}
    </div>
  );
}
