import { create } from "zustand";
import { persist } from "zustand/middleware";

import { apiClient } from "@/lib/api-client";
import { useConfigStore } from "./configStore";

export interface Agent {
  id: string;
  name: string;
  versionHash: string | null;
  status: "active" | "inactive";
  tracesCount: number;
  successRate: number;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

interface AgentsState {
  agents: Agent[];
  currentAgent: Agent | null;
  isLoading: boolean;
  error: string | null;
  pollingInterval: NodeJS.Timeout | null;
  apiKey: string | null;

  setApiKey: (key: string) => void;
  fetchAgents: () => Promise<void>;
  fetchAgentById: (agentId: string) => Promise<Agent | null>;
  startPolling: (intervalMs: number) => void;
  stopPolling: () => void;
}

export const useAgentsStore = create<AgentsState>()(
  persist(
    (set, get) => ({
      agents: [],
      currentAgent: null,
      isLoading: false,
      error: null,
      pollingInterval: null,
      apiKey: null,

      setApiKey: (key: string) => set({ apiKey: key }),

      fetchAgents: async () => {
        const config = useConfigStore.getState().config;
        const { apiKey } = get();

        if (!config?.analyseBaseUrl) {
          set({ error: "Analyse base URL not configured" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.get<{ agents: Agent[] }>(
            `${config.analyseBaseUrl}/entities`,
            {
              headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
            }
          );
          set({ agents: response.data.agents || [], isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to fetch agents";
          set({ error: message, isLoading: false });
        }
      },

      fetchAgentById: async (agentId: string) => {
        const config = useConfigStore.getState().config;
        const { apiKey } = get();

        if (!config?.analyseBaseUrl) {
          set({ error: "Analyse base URL not configured" });
          return null;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.get<Agent>(
            `${config.analyseBaseUrl}/entities/${agentId}`,
            {
              headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
            }
          );
          set({ currentAgent: response.data, isLoading: false });
          return response.data;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to fetch agent";
          set({ error: message, isLoading: false });
          return null;
        }
      },

      startPolling: (intervalMs: number) => {
        const { pollingInterval, fetchAgents } = get();

        if (pollingInterval) {
          clearInterval(pollingInterval);
        }

        fetchAgents();

        const interval = setInterval(() => {
          fetchAgents();
        }, intervalMs);

        set({ pollingInterval: interval });
      },

      stopPolling: () => {
        const { pollingInterval } = get();
        if (pollingInterval) {
          clearInterval(pollingInterval);
          set({ pollingInterval: null });
        }
      },
    }),
    {
      name: "whyops-agents-store",
      partialize: (state) => ({ apiKey: state.apiKey }),
    }
  )
);
