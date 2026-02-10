"use client";

import { TraceCanvas } from "@/components/traces/trace-canvas";
import { TraceHeader } from "@/components/traces/trace-header";
import { TraceSidebarLeft } from "@/components/traces/trace-sidebar-left";
import { TraceSidebarRight } from "@/components/traces/trace-sidebar-right";
import { TraceTimeline } from "@/components/traces/trace-timeline";
import { useState } from "react";
import { ReactFlowProvider } from "reactflow";

export default function TraceDetailsPage() {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [view, setView] = useState<"graph" | "timeline">("graph");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Global Nav would be here if layout wasn't separate, but we assume this page is fullscreen or part of main layout */}
      
      <TraceHeader view={view} onViewChange={setView} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <TraceSidebarLeft 
          isCollapsed={leftCollapsed} 
          onToggle={() => setLeftCollapsed(!leftCollapsed)} 
        />

        {/* Center Canvas */}
        <div className="flex-1 relative border-x border-border/30 overflow-hidden">
          {view === "graph" ? (
            <ReactFlowProvider>
              <TraceCanvas />
            </ReactFlowProvider>
          ) : (
            <TraceTimeline />
          )}
        </div>

        {/* Right Sidebar */}
        <TraceSidebarRight 
          isCollapsed={rightCollapsed} 
          onToggle={() => setRightCollapsed(!rightCollapsed)} 
        />
      </div>
    </div>
  );
}
