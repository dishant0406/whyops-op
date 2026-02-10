"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTrace } from "@/constants/mock-data";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Lightbulb,
  PanelRightClose,
  PanelRightOpen,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";

interface TraceSidebarRightProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function TraceSidebarRight({ isCollapsed, onToggle }: TraceSidebarRightProps) {
  const [openSections, setOpenSections] = React.useState<string[]>([
    "score",
    "action",
    "reasoning",
    "rejected",
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
            <span className="text-xs font-bold text-primary">{trace.decisionLogic.confidenceScore}</span>
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
          Decision Logic
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
        {/* Confidence Score */}
        <div className="rounded-lg bg-surface-2/30 p-6 text-center border border-border/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          <h4 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            Confidence Score
          </h4>
          <div className="flex items-center justify-center">
            <span className="text-5xl font-bold text-foreground tracking-tighter">
              {trace.decisionLogic.confidenceScore}
            </span>
            <span className="text-xl font-medium text-muted-foreground ml-1">%</span>
          </div>
          <Badge className="mt-3 bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">
            HIGH CERTAINTY
          </Badge>
        </div>

        {/* Selected Action */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Selected Action</h4>
          </div>
          <Card className="border-primary/30 bg-primary/5 p-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2">
                <Badge className="bg-primary/20 text-primary border-primary/20 text-[10px] px-1.5 py-0 h-5">
                    TOOL
                </Badge>
             </div>
            <div className="font-mono text-sm font-bold text-primary mb-2">
              {trace.decisionLogic.selectedAction.name}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {trace.decisionLogic.selectedAction.description}
            </p>
          </Card>
        </div>

        {/* Reasoning */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-foreground">Reasoning</h4>
          </div>
          <div className="rounded-md bg-surface-2/30 p-3 text-xs text-muted-foreground font-mono leading-relaxed border border-border/30">
            {trace.decisionLogic.reasoning.split('\n').map((line, i) => (
                <div key={i} className="mb-1">{line}</div>
            ))}
          </div>
        </div>

        {/* Rejected Alternatives */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-muted-foreground">Rejected Alternatives</h4>
          </div>
          <div className="space-y-2">
            {trace.decisionLogic.rejectedAlternatives.map((alt, i) => (
              <div key={i} className="group rounded border border-border/30 bg-surface-2/10 overflow-hidden">
                <button
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-surface-2/30"
                >
                    <span className="font-mono text-xs text-muted-foreground">{alt.name}</span>
                </button>
                <div className="px-3 pb-2 pt-0">
                    <div className="text-[10px] text-destructive/80 bg-destructive/10 px-2 py-1 rounded border border-destructive/20">
                        <span className="font-semibold">Reason:</span> {alt.reason}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
