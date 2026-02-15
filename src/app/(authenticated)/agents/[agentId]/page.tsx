"use client";

import { useEffect, useState } from "react";

import { AgentDetailHeader } from "@/components/agents/agent-detail-header";
import { AgentDetailStats } from "@/components/agents/agent-detail-stats";
import { AgentTraceTimeline } from "@/components/agents/agent-trace-timeline";
import { RecentTracesTable } from "@/components/agents/recent-traces-table";
import { useAgentsStore, type Agent } from "@/stores/agentsStore";
import { useConfigStore } from "@/stores/configStore";

export default function AgentDetailsPage({ params }: { params: { agentId: string } }) {
  const { fetchAgentById, currentAgent, isLoading } = useAgentsStore();
  const config = useConfigStore((state) => state.config);
  const fetchConfig = useConfigStore((state) => state.fetchConfig);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config) {
      fetchConfig();
    }
  }, [config, fetchConfig]);

  useEffect(() => {
    if (config?.analyseBaseUrl && params.agentId) {
      fetchAgentById(params.agentId).catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load agent");
      });
    }
  }, [config?.analyseBaseUrl, params.agentId, fetchAgentById]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !currentAgent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">
          {error || "Agent not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <AgentDetailHeader agent={currentAgent} />
      <AgentDetailStats agent={currentAgent} />
      <AgentTraceTimeline agentId={params.agentId} />
      <RecentTracesTable agentId={params.agentId} />
    </div>
  );
}
