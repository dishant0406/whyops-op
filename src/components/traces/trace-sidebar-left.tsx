"use client";

import type { TraceDetail } from "@/stores/traceDetailStore";

interface TraceSidebarLeftProps {
  trace: TraceDetail;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function TraceSidebarLeft({ trace, isCollapsed }: TraceSidebarLeftProps) {
  if (isCollapsed) {
    return null;
  }

  return (
    <div className="w-64 border-r border-border/30 bg-card overflow-y-auto">
      <div className="p-4 border-b border-border/30">
        <h3 className="font-semibold text-foreground">Agent Info</h3>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Agent Name</label>
          <p className="text-sm text-foreground">{trace.entityName || "Unknown"}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Model</label>
          <p className="text-sm text-foreground">{trace.model || "N/A"}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Total Events</label>
          <p className="text-sm text-foreground">{trace.eventCount}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Total Tokens</label>
          <p className="text-sm text-foreground">{trace.totalTokens.toLocaleString()}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Errors</label>
          <p className="text-sm text-foreground">{trace.errorCount}</p>
        </div>
      </div>
      {trace.systemPrompt && (
        <div className="p-4 border-t border-border/30">
          <label className="text-xs font-medium text-muted-foreground">System Prompt</label>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-4">
            {trace.systemPrompt}
          </p>
        </div>
      )}
    </div>
  );
}
