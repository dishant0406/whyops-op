"use client";

import { Card } from "@/components/ui/card";
import type { Agent } from "@/stores/agentsStore";
import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface AgentDetailStatsProps {
  agent: Agent;
}

export function AgentDetailStats({ agent }: AgentDetailStatsProps) {
  // Calculate stats from agent data
  const totalTraces = agent.tracesCount;
  const successRate = agent.successRate;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Traces */}
      <Card className="bg-card border-border/30 p-6 relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Total Traces</span>
          <Activity className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">{totalTraces.toLocaleString()}</span>
        </div>
      </Card>

      {/* Success Rate */}
      <Card className="bg-card border-border/30 p-6 relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Success Rate</span>
          <CheckCircle className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-primary">{successRate}%</span>
        </div>
        <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${successRate}%` }}
          />
        </div>
      </Card>

      {/* Last Active */}
      <Card className="bg-card border-border/30 p-6 relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Last Active</span>
          <Clock className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">
            {agent.lastActive ? formatTimeAgo(agent.lastActive) : "Never"}
          </span>
        </div>
      </Card>

      {/* Status */}
      <Card className="bg-card border-border/30 p-6 relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Status</span>
          <AlertTriangle className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground capitalize">
            {agent.status}
          </span>
        </div>
      </Card>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
