"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTrace } from "@/constants/mock-data";
import { cn } from "@/lib/utils";
import {
  Brain,
  ChevronDown,
  ChevronRight,
  Database,
  PanelLeftClose,
  PanelLeftOpen,
  Terminal,
} from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";

interface TraceSidebarLeftProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function TraceSidebarLeft({ isCollapsed, onToggle }: TraceSidebarLeftProps) {
  const [openSections, setOpenSections] = React.useState<string[]>([
    "context",
    "memory",
    "tools",
  ]);
  const params = useParams();
  const agentId = (params.agentId as string) || "1";
  const traceId = (params.traceId as string) || "tr_abc123";
  const trace = getTrace(agentId, traceId);

  if (!trace) return null;

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  if (isCollapsed) {
    return (
      <div className="flex w-12 flex-col items-center border-r border-border/30 bg-background py-4 transition-all duration-300">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0 mb-4 hover:bg-surface-2"
        >
          <PanelLeftOpen className="h-4 w-4 text-muted-foreground" />
        </Button>
        <div className="flex flex-col gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2/50" title="Context Window">
            <Terminal className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2/50" title="Memory State">
            <Database className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2/50" title="Available Tools">
            <Brain className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-80 flex-col border-r border-border/30 bg-background transition-all duration-300">
      <div className="flex h-10 items-center justify-between border-b border-border/30 px-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          State Inspector
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-6 w-6 p-0 hover:bg-surface-2"
        >
          <PanelLeftClose className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Context Window */}
        <div className="border-b border-border/30">
          <button
            onClick={() => toggleSection("context")}
            className="flex w-full items-center justify-between px-4 py-3 hover:bg-surface-2/30"
          >
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Context Window</span>
            </div>
            {openSections.includes("context") ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
          
          {openSections.includes("context") && (
            <div className="px-4 pb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Usage</span>
                <span className="text-xs font-mono text-muted-foreground">
                  <span className="text-primary">8,192</span> / 8,192 tokens
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-surface-2 overflow-hidden mb-3">
                <div className="h-full w-full bg-gradient-to-r from-primary/50 to-primary rounded-full" />
              </div>
              <div className="rounded-md border border-border/50 bg-surface-2/30 p-3 font-mono text-xs text-muted-foreground/80 leading-relaxed overflow-hidden">
                <pre className="whitespace-pre-wrap break-words">{trace.contextWindow}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Memory State */}
        <div className="border-b border-border/30">
          <button
            onClick={() => toggleSection("memory")}
            className="flex w-full items-center justify-between px-4 py-3 hover:bg-surface-2/30"
          >
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Memory State</span>
            </div>
            {openSections.includes("memory") ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
          
          {openSections.includes("memory") && (
            <div className="px-4 pb-4 space-y-2">
              {trace.memoryState.shortTerm.map((item, i) => (
                <div key={i} className="flex items-start justify-between rounded bg-surface-2/30 px-2 py-1.5 text-xs">
                  <span className="font-medium text-muted-foreground">{item.key}</span>
                  <span className="font-mono text-foreground truncate max-w-[120px]">{item.value}</span>
                </div>
              ))}
              {trace.memoryState.shortTerm.length === 0 && (
                <div className="text-xs text-muted-foreground italic px-2">No memory items stored.</div>
              )}
            </div>
          )}
        </div>

        {/* Available Tools */}
        <div className="border-b border-border/30">
          <button
            onClick={() => toggleSection("tools")}
            className="flex w-full items-center justify-between px-4 py-3 hover:bg-surface-2/30"
          >
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Available Tools</span>
            </div>
            {openSections.includes("tools") ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
          
          {openSections.includes("tools") && (
            <div className="px-4 pb-4 space-y-2">
              {trace.availableTools.map((tool, i) => (
                <div key={i} className="group rounded border border-border/30 bg-surface-2/10 p-2 hover:bg-surface-2/30 hover:border-border/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold text-primary/90">{tool.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug">{tool.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
