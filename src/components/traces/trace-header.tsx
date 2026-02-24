"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TraceDetail } from "@/stores/traceDetailStore";
import { calculateTraceCost, formatCostUsd, getPrimaryCostRate } from "@/lib/trace-cost";
import { formatDuration } from "@/lib/trace-format";
import { cn } from "@/lib/utils";
import {
  Bug,
  Clock,
  Cpu,
  GitGraph,
  List,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface TraceHeaderProps {
  trace: TraceDetail;
  view: "graph" | "timeline";
  onViewChange: (view: "graph" | "timeline") => void;
  agentId?: string;
}

export function TraceHeader({ trace, view, onViewChange, agentId }: TraceHeaderProps) {
  // Calculate status from error count
  const hasErrors = trace.errorCount > 0;
  const status = hasErrors ? "error" : "success";

  const duration = formatDuration(trace.duration);

  const pricing = getPrimaryCostRate(trace.cost ?? null);
  const { total } = calculateTraceCost(trace.events ?? [], pricing);
  const cost = formatCostUsd(total);
  const agentHref = agentId
    ? `/agents/${agentId}`
    : trace.entityId
      ? `/agents/${trace.entityId}`
      : "/agents";

  return (
    <div className="flex h-14 items-center justify-between border-b border-border/30 bg-background px-4">
      <div className="flex items-center gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm font-medium text-muted-foreground">
          <Link
            href="/agents"
            className="hover:text-foreground transition-colors"
          >
            Agents
          </Link>
          <span className="mx-2 text-border">/</span>
          <Link
            href={agentHref}
            className="hover:text-foreground transition-colors"
          >
            {trace.entityName || "Agent"}
          </Link>
          <span className="mx-2 text-border">/</span>
          <span className="text-foreground">{trace.threadId.substring(0, 16)}...</span>
        </div>

        {/* Status */}
        <Badge className={cn(
          "rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase",
          status === "success" && "bg-primary/20 text-primary border-primary/20",
          status === "error" && "bg-destructive/20 text-destructive border-destructive/20"
        )}>
          {status}
        </Badge>

        {/* Metrics */}
        <div className="flex items-center gap-6 border-l border-border/30 pl-6 h-6">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-foreground">{duration}</span> Duration
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground border-l border-border/30 pl-6">
            <span className="text-foreground">{cost}</span> Cost
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground border-l border-border/30 pl-6">
            <RefreshCw className="h-3.5 w-3.5 rotate-90" />
            <span className="text-foreground">{trace.totalTokens.toLocaleString()}</span> Tokens
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground border-l border-border/30 pl-6">
            <Cpu className="h-3.5 w-3.5" />
            <span className="text-foreground">{trace.model || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* View Toggle */}
        <div className="flex items-center rounded-md bg-surface-2 p-1">
          <button
            onClick={() => onViewChange("graph")}
            className={cn(
              "flex items-center gap-2 rounded px-3 py-1 text-xs font-medium transition-all",
              view === "graph"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <GitGraph className="h-3.5 w-3.5" />
            Graph
          </button>
          <button
            onClick={() => onViewChange("timeline")}
            className={cn(
              "flex items-center gap-2 rounded px-3 py-1 text-xs font-medium transition-all",
              view === "timeline"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-3.5 w-3.5" />
            Timeline
          </button>
        </div>

        <div className="h-6 w-px bg-border/30" />

        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Replay
        </Button>
        <Button
          size="sm"
          className="h-8 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Bug className="h-3.5 w-3.5 fill-current" />
          Debug
        </Button>
      </div>
    </div>
  );
}
