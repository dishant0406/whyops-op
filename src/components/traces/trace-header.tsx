"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTrace } from "@/constants/mock-data";
import { cn } from "@/lib/utils";
import {
  Bug,
  ChevronRight,
  Clock,
  Cpu,
  GitGraph,
  List,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface TraceHeaderProps {
  view: "graph" | "timeline";
  onViewChange: (view: "graph" | "timeline") => void;
}

export function TraceHeader({ view, onViewChange }: TraceHeaderProps) {
  const params = useParams();
  const agentId = (params.agentId as string) || "1";
  const traceId = (params.traceId as string) || "tr_abc123";
  const trace = getTrace(agentId, traceId);

  if (!trace) return null;

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
            href={`/agents/${agentId}`}
            className="hover:text-foreground transition-colors"
          >
            Agent {agentId}
          </Link>
          <span className="mx-2 text-border">/</span>
          <span className="text-foreground">{trace.id}</span>
        </div>

        {/* Status */}
        <Badge className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/30 rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
          {trace.status}
        </Badge>

        {/* Metrics */}
        <div className="flex items-center gap-6 border-l border-border/30 pl-6 h-6">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-foreground">{trace.duration}</span> Duration
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground border-l border-border/30 pl-6">
            <span className="text-foreground">{trace.cost}</span> Cost
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground border-l border-border/30 pl-6">
            <RefreshCw className="h-3.5 w-3.5 rotate-90" />
            <span className="text-foreground">{trace.tokens.toLocaleString()}</span> Tokens
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground border-l border-border/30 pl-6">
            <Cpu className="h-3.5 w-3.5" />
            <span className="text-foreground">{trace.model}</span>
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
