import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "success" | "warning" | "error" | "active" | "inactive" | string;
  className?: string;
  children?: React.ReactNode;
}

const STATUS_STYLES: Record<string, string> = {
  success: "bg-primary/20 text-primary border-primary/20 hover:bg-primary/30",
  active: "bg-primary/20 text-primary border-primary/20 hover:bg-primary/30",
  warning: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/30",
  error: "bg-destructive/20 text-destructive border-destructive/20 hover:bg-destructive/30",
  inactive: "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50",
};

export function StatusBadge({ status, className, children }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const style = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.inactive;

  return (
    <Badge
      className={cn(
        "rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border",
        style,
        className
      )}
    >
      {children || status}
    </Badge>
  );
}
