"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TraceDetail } from "@/stores/traceDetailStore";
import { formatCostUsd, getPrimaryCostRate, getTraceTotalCost } from "@/lib/trace-cost";
import { formatDuration } from "@/lib/trace-format";
import { cn } from "@/lib/utils";
import {
  Clock,
  Cpu,
  GitGraph,
  Layers,
  List,
  RefreshCw,
  Scale,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface TraceHeaderProps {
  trace: TraceDetail;
  view: "graph" | "timeline" | "judge";
  onViewChange: (view: "graph" | "timeline" | "judge") => void;
  agentId?: string;
}

export function TraceHeader({ trace, view, onViewChange, agentId }: TraceHeaderProps) {
  const hasErrors = trace.errorCount > 0;
  const statusLabel = hasErrors ? "Error" : "Healthy";
  const duration = formatDuration(trace.duration);

  const pricing = getPrimaryCostRate(trace.cost ?? null);
  const totalCostValue = getTraceTotalCost(trace.totalCost, trace.events ?? [], pricing);
  const cost = formatCostUsd(totalCostValue);

  // Model display: use last-used model name; show count badge if multiple models
  const modelBreakdowns = trace.models ?? [];
  const lastBreakdown = modelBreakdowns.find((m) => m.isLastModel);
  const primaryModel = lastBreakdown?.model ?? trace.model;
  const modelCount = modelBreakdowns.length;
  const modelLabel = primaryModel
    ? modelCount > 1
      ? `${primaryModel} +${modelCount - 1}`
      : primaryModel
    : "N/A";

  // Context window: total input+output across all models / last model's context window
  const totalUsedTokens = modelBreakdowns.reduce((sum, m) => sum + m.inputTokens + m.outputTokens, 0) || trace.totalTokens;
  const lastContextWindow = lastBreakdown?.cost?.contextWindow ? Number(lastBreakdown.cost.contextWindow) : null;
  const ctxFillPct = lastContextWindow && lastContextWindow > 0 ? Math.min(totalUsedTokens / lastContextWindow, 1) : null;
  const contextLabel = lastContextWindow
    ? `${totalUsedTokens.toLocaleString()} / ${(lastContextWindow / 1000).toFixed(0)}k (${((ctxFillPct ?? 0) * 100).toFixed(1)}%)`
    : null;
  const agentHref = agentId
    ? `/agents/${agentId}`
      : trace.agentId
      ? `/agents/${trace.agentId}`
      : trace.entityId
      ? `/agents/${trace.entityId}`
      : "/agents";

  return (
    <div className="flex h-16 items-center justify-between border-b border-border/50 bg-background px-4 lg:px-5">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex min-w-0 items-center text-sm font-medium text-muted-foreground">
          <Link
            href="/agents"
            className="truncate transition-colors hover:text-foreground"
          >
            Agents
          </Link>
          <span className="mx-2 text-border">/</span>
          <Link
            href={agentHref}
            className="truncate transition-colors hover:text-foreground"
          >
            {trace.entityName || "Agent"}
          </Link>
          <span className="mx-2 text-border">/</span>
          <span className="truncate text-foreground">{trace.threadId.substring(0, 16)}...</span>
        </div>

        <Badge
          className={cn(
            "h-6 px-2 text-[11px]",
            hasErrors
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-border/70 bg-surface-2/50 text-foreground"
          )}
        >
          {statusLabel}
        </Badge>

        <div className="hidden items-center gap-2 lg:flex">
          <MetricPill icon={<Clock className="h-3.5 w-3.5" />} label="Duration" value={duration} />
          <MetricPill label="Cost" value={cost} />
          <MetricPill icon={<RefreshCw className="h-3.5 w-3.5 rotate-90" />} label="Tokens" value={trace.totalTokens.toLocaleString()} />
          <MetricPill icon={<Cpu className="h-3.5 w-3.5" />} label="Model" value={modelLabel} />
          {contextLabel && (
            <MetricPill icon={<Layers className="h-3.5 w-3.5" />} label="Context" value={contextLabel} />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-sm border border-border/60 bg-card p-0.5">
          <ViewToggleButton
            active={view === "graph"}
            onClick={() => onViewChange("graph")}
            label="Graph"
            icon={<GitGraph className="h-3.5 w-3.5" />}
          />
          <ViewToggleButton
            active={view === "timeline"}
            onClick={() => onViewChange("timeline")}
            label="Timeline"
            icon={<List className="h-3.5 w-3.5" />}
          />
          <ViewToggleButton
            active={view === "judge"}
            onClick={() => onViewChange("judge")}
            label="Judge"
            icon={<Scale className="h-3.5 w-3.5" />}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Replay
        </Button>
      </div>
    </div>
  );
}

interface MetricPillProps {
  label: string;
  value: string;
  icon?: ReactNode;
}

function MetricPill({ label, value, icon }: MetricPillProps) {
  return (
    <div className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border/60 bg-surface-2/30 px-3 text-sm">
      {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[9rem] truncate font-medium text-foreground">{value}</span>
    </div>
  );
}

interface ViewToggleButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: ReactNode;
}

function ViewToggleButton({ active, onClick, label, icon }: ViewToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
