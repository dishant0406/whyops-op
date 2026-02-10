"use client";

import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { getTrace } from "@/constants/mock-data";
import { cn } from "@/lib/utils";
import {
  Brain,
  ChevronDown,
  Clock,
  DollarSign,
  GitBranch,
  MessageSquare,
  User,
  Wrench,
} from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";

const ICON_MAP: Record<string, React.ElementType> = {
  user: User,
  brain: Brain,
  "git-branch": GitBranch,
  wrench: Wrench,
  "message-square": MessageSquare,
};

const TAG_STYLES: Record<string, string> = {
  INPUT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  LLM: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  LOGIC: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  TOOL: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  OUTPUT: "bg-green-500/10 text-green-500 border-green-500/20",
};

const ICON_CONTAINER_STYLES: Record<string, string> = {
  input: "bg-surface-2 text-blue-500 border-blue-500/30",
  llm: "bg-surface-2 text-purple-500 border-purple-500/30",
  logic: "bg-surface-2 text-orange-500 border-orange-500/30",
  tool: "bg-surface-2 text-teal-500 border-teal-500/30",
  output: "bg-surface-2 text-green-500 border-green-500/30",
};

export function TraceTimeline() {
  const params = useParams();
  const agentId = (params.agentId as string) || "1";
  const traceId = (params.traceId as string) || "tr_abc123";
  const trace = getTrace(agentId, traceId);

  const [expandedSteps, setExpandedSteps] = React.useState<string[]>(
    trace?.spans.slice(0, 2).map((s) => s.id) || []
  );

  if (!trace) return null;

  const toggleStep = (id: string) => {
    setExpandedSteps((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-8 scrollbar-thin">
      <div className="mx-auto max-w-4xl relative">
        {/* Continuous Vertical Line */}
        <div className="absolute left-[3.5rem] top-4 bottom-4 w-px bg-border/20 -z-10" />

        <div className="space-y-6">
          {trace.spans.map((step) => {
            const Icon = ICON_MAP[step.icon || "user"] || User;
            const isExpanded = expandedSteps.includes(step.id);
            const typeKey = step.type || "input";

            return (
              <div key={step.id} className="relative flex items-start gap-6 group">
                {/* Timestamp */}
                <div className="w-14 pt-3.5 text-right text-xs font-mono text-muted-foreground/60 tabular-nums">
                  {step.timestamp}
                </div>

                {/* Icon Circle */}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm z-10 transition-transform duration-200 group-hover:scale-105",
                    ICON_CONTAINER_STYLES[typeKey]
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Card */}
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "rounded-lg border bg-card transition-all duration-200 overflow-hidden",
                      isExpanded ? "border-border/60 shadow-md" : "border-border/30 hover:border-border/50"
                    )}
                  >
                    {/* Header */}
                    <div
                      className={cn(
                        "flex items-center justify-between px-4 py-3 cursor-pointer select-none",
                        isExpanded && "border-b border-border/30 bg-surface-2/30"
                      )}
                      onClick={() => toggleStep(step.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate">
                          {step.title}
                        </h3>
                        {step.tag && (
                          <Badge
                            className={cn(
                              "rounded-[4px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border shadow-none",
                              TAG_STYLES[step.tag]
                            )}
                          >
                            {step.tag}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {step.duration && step.duration !== "--" && (
                          <Badge
                            className="gap-1.5 bg-surface-2 text-muted-foreground border border-border/30 h-6 px-2 shadow-none font-mono text-[10px] hover:bg-surface-3"
                          >
                            <Clock className="h-3 w-3 opacity-60" />
                            {step.duration}
                          </Badge>
                        )}
                        {step.cost && (
                          <Badge
                            className="gap-1.5 bg-surface-2 text-muted-foreground border border-border/30 h-6 px-2 shadow-none font-mono text-[10px] hover:bg-surface-3"
                          >
                            <DollarSign className="h-3 w-3 opacity-60" />
                            {step.cost}
                          </Badge>
                        )}
                        <div
                          className={cn(
                            "text-muted-foreground/40 transition-transform duration-200",
                            isExpanded && "rotate-180 text-muted-foreground/70"
                          )}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    {isExpanded && step.content && (
                      <div className="p-4 animate-in fade-in zoom-in-95 duration-200">
                        {/* JSON Content */}
                        {step.content.type === "json" && step.content.data && (
                          <CodeBlock
                            content={step.content.data}
                            label={step.content.label || "PAYLOAD"}
                            className="w-full"
                          />
                        )}

                        {/* Text Content */}
                        {step.content.type === "text" && step.content.text && (
                          <div className="font-mono text-xs text-foreground/80 bg-surface-2/30 p-4 rounded-md border border-border/30 leading-relaxed whitespace-pre-wrap">
                            {step.content.text}
                          </div>
                        )}

                        {/* Tool Execution */}
                        {step.content.type === "tool-execution" && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <CodeBlock
                                content={step.content.arguments || {}}
                                label="ARGUMENTS"
                                maxHeight="h-40"
                              />
                              <CodeBlock
                                content={step.content.result || {}}
                                label="RESULT"
                                maxHeight="h-40"
                              />
                            </div>

                            {/* Latency Bar */}
                            {step.content.latencyContribution && (
                              <div className="pt-2 border-t border-border/30 mt-4">
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider font-semibold">
                                  <span>Latency Contribution</span>
                                  <span className="text-foreground">
                                    {step.content.latencyContribution}% of total
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden border border-border/30">
                                  <div
                                    className="h-full bg-primary/70 rounded-full"
                                    style={{
                                      width: `${step.content.latencyContribution}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
