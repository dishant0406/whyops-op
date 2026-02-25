"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { TraceCanvas } from "@/components/traces/trace-canvas";
import { TraceHeader } from "@/components/traces/trace-header";
import { TraceSidebarLeft } from "@/components/traces/trace-sidebar-left";
import { TraceSidebarRight } from "@/components/traces/trace-sidebar-right";
import { TraceTimeline } from "@/components/traces/trace-timeline";
import { useConfigStore } from "@/stores/configStore";
import { useTraceDetailStore } from "@/stores/traceDetailStore";
import { ReactFlowProvider } from "reactflow";

export function TraceDetailsPageContent() {
  const params = useParams();
  const traceId = params.traceId as string;
  const agentId = params.agentId as string;

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [view, setView] = useState<"graph" | "timeline">("graph");

  const config = useConfigStore((state) => state.config);
  const { trace, isLoading, fetchTrace } = useTraceDetailStore();

  useEffect(() => {
    if (traceId && config?.analyseBaseUrl) {
      fetchTrace(traceId);
    }
  }, [traceId, config?.analyseBaseUrl, fetchTrace]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-background">
        <p className="text-muted-foreground">Trace not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col overflow-hidden bg-background text-foreground">
      <TraceHeader
        trace={trace}
        view={view}
        onViewChange={setView}
        agentId={agentId}
      />

      <div className="flex flex-1 overflow-hidden">
        <TraceSidebarLeft
          trace={trace}
          isCollapsed={leftCollapsed}
          onToggle={() => setLeftCollapsed(!leftCollapsed)}
        />

        <div className="relative flex-1 overflow-hidden border-x border-border/50">
          {view === "graph" ? (
            <ReactFlowProvider>
              <TraceCanvas trace={trace} />
            </ReactFlowProvider>
          ) : (
            <TraceTimeline trace={trace} />
          )}
        </div>

        <TraceSidebarRight
          trace={trace}
          isCollapsed={rightCollapsed}
          onToggle={() => setRightCollapsed(!rightCollapsed)}
        />
      </div>
    </div>
  );
}
