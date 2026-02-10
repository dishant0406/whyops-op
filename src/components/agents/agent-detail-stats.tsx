"use client";

import { Card } from "@/components/ui/card";
import { getAgent } from "@/constants/mock-data";
import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useParams } from "next/navigation";

export function AgentDetailStats() {
  const params = useParams();
  const agentId = (params.agentId as string) || "1";
  const agent = getAgent(agentId);

  if (!agent) return null;

  const { totalTraces, successRate, avgDuration, errorsToday } = agent.stats;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Traces */}
      <Card className="bg-card border-border/30 p-6 relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Total Traces</span>
          <Activity className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">{totalTraces.value}</span>
          <span className="inline-flex items-center rounded-sm bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
            ↗ {totalTraces.trend}%
          </span>
        </div>
      </Card>

      {/* Success Rate */}
      <Card className="bg-card border-border/30 p-6 relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Success Rate</span>
          <CheckCircle className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-primary">{successRate.value}%</span>
          <span className="text-xs text-muted-foreground">{successRate.suffix}</span>
        </div>
        <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${successRate.value}%` }} 
          />
        </div>
      </Card>

      {/* Avg Duration */}
      <Card className="bg-card border-border/30 p-6 relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Avg Duration</span>
          <Clock className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">{avgDuration.value}</span>
          <span className="text-xs text-muted-foreground">{avgDuration.comparison}</span>
        </div>
      </Card>

      {/* Errors Today */}
      <Card className="bg-card border-border/30 p-6 relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Errors Today</span>
          <AlertTriangle className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">{errorsToday.value}</span>
          <span className="text-xs font-medium text-destructive">{errorsToday.status}</span>
        </div>
      </Card>
    </div>
  );
}
