"use client";

import { useEffect, useState } from "react";

import { TraceCanvas } from "@/components/traces/trace-canvas";
import { TraceHeader } from "@/components/traces/trace-header";
import { TraceSidebarLeft } from "@/components/traces/trace-sidebar-left";
import { TraceSidebarRight } from "@/components/traces/trace-sidebar-right";
import { TraceTimeline } from "@/components/traces/trace-timeline";
import { useTraceDetailStore } from "@/stores/traceDetailStore";
import { useConfigStore } from "@/stores/configStore";
import { ReactFlowProvider } from "reactflow";

export default function TraceDetailsPage({ params }: { params: { agentId: string; traceId: string } }) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [view, setView] = useState<"graph" | "timeline">("graph");

  const { trace, isLoading, fetchTrace } = useTraceDetailStore();
  const config = useConfigStore((state) => state.config);
  const fetchConfig = useConfigStore((state) => state.fetchConfig);

  useEffect(() => {
    if (!config) {
      fetchConfig();
    }
  }, [config, fetchConfig]);

  useEffect(() => {
    if (config?.analyseBaseUrl && params.traceId) {
      fetchTrace(params.traceId);
    }
  }, [config?.analyseBaseUrl, params.traceId, fetchTrace]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Trace not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TraceHeader trace={trace} view={view} onViewChange={setView} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <TraceSidebarLeft
          trace={trace}
          isCollapsed={leftCollapsed}
          onToggle={() => setLeftCollapsed(!leftCollapsed)}
        />

        {/* Center Canvas */}
        <div className="flex-1 relative border-x border-border/30 overflow-hidden">
          {view === "graph" ? (
            <ReactFlowProvider>
              <TraceCanvas trace={trace} />
            </ReactFlowProvider>
          ) : (
            <TraceTimeline trace={trace} />
          )}
        </div>

        {/* Right Sidebar */}
        <TraceSidebarRight
          trace={trace}
          isCollapsed={rightCollapsed}
          onToggle={() => setRightCollapsed(!rightCollapsed)}
        />
      </div>
    </div>
  );
}
