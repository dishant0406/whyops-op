import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

interface TimelineIconProps {
  iconName: string;
  type: string;
  className?: string;
}

const ICON_BG_MAP: Record<string, string> = {
  input: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  llm: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  logic: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  tool: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  output: "bg-green-500/10 text-green-500 border-green-500/20",
};

export function TimelineIcon({ iconName, type, className }: TimelineIconProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Circle;
  const style = ICON_BG_MAP[type] || "bg-muted/10 text-muted-foreground border-border/20";

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm z-10 bg-background",
        style,
        className
      )}
    >
      <IconComponent className="h-5 w-5" />
    </div>
  );
}
