"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TraceDetail } from "@/stores/traceDetailStore";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Lightbulb,
  PanelRightClose,
  PanelRightOpen,
  XCircle,
} from "lucide-react";
import * as React from "react";

interface TraceSidebarRightProps {
  trace: TraceDetail;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function TraceSidebarRight({ trace, isCollapsed, onToggle }: TraceSidebarRightProps) {
  const [openSections, setOpenSections] = React.useState<string[]>([
    "score",
    "action",
    "reasoning",
  ]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  // Calculate confidence from event metadata (placeholder)
  const confidenceScore = 95;

  if (isCollapsed) {
    return (
      <div className="flex w-12 flex-col items-center border-l border-border/30 bg-background py-4 transition-all duration-300">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0 mb-4 hover:bg-surface-2"
        >
          <PanelRightOpen className="h-4 w-4 text-muted-foreground" />
        </Button>
        <div className="flex flex-col gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2/50" title="Confidence Score">
            <span className="text-xs font-bold text-primary">{confidenceScore}</span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2/50" title="Selected Action">
            <CheckCircle className="h-4 w-4 text-primary" />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2/50" title="Reasoning">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-80 flex-col border-l border-border/30 bg-background transition-all duration-300">
      <div className="flex h-10 items-center justify-between border-b border-border/30 px-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Trace Details
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-6 w-6 p-0 hover:bg-surface-2"
        >
          <PanelRightClose className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Summary Stats */}
        <div className="rounded-lg bg-surface-2/30 p-4 border border-border/30">
          <h4 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Summary
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Total Events</label>
              <p className="text-lg font-semibold text-foreground">{trace.eventCount}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Total Tokens</label>
              <p className="text-lg font-semibold text-foreground">{trace.totalTokens.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Avg Latency</label>
              <p className="text-lg font-semibold text-foreground">{trace.avgLatency.toFixed(0)}ms</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Errors</label>
              <p className={cn("text-lg font-semibold", trace.errorCount > 0 ? "text-destructive" : "text-foreground")}>
                {trace.errorCount}
              </p>
            </div>
          </div>
        </div>

        {/* Model Info */}
        <div>
          <h4 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Model
          </h4>
          <div className="rounded-md bg-surface-2/30 p-3 border border-border/30">
            <p className="font-mono text-sm text-foreground">{trace.model || "N/A"}</p>
          </div>
        </div>

        {/* System Prompt */}
        {trace.systemPrompt && (
          <div>
            <h4 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
              System Prompt
            </h4>
            <div className="rounded-md bg-surface-2/30 p-3 border border-border/30 max-h-40 overflow-y-auto">
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                {trace.systemPrompt}
              </p>
            </div>
          </div>
        )}

        {/* Tools */}
        {trace.tools && trace.tools.length > 0 && (
          <div>
            <h4 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
              Available Tools ({trace.tools.length})
            </h4>
            <div className="space-y-2">
              {trace.tools.map((tool: any, index: number) => (
                <div key={index} className="rounded-md bg-surface-2/30 p-3 border border-border/30">
                  <p className="font-mono text-sm text-foreground">{tool.name || tool}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
