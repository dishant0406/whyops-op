import { create } from "zustand";
import { persist } from "zustand/middleware";

import { apiClient } from "@/lib/api-client";
import { useConfigStore } from "./configStore";

export interface DashboardStats {
  totalAgents: number;
  activeTraces: number;
  successRate: number;
  avgLatency: string;
}

export interface ChartDataPoint {
  day: string;
  value: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  chartData: ChartDataPoint[];
  isLoading: boolean;
  error: string | null;
  apiKey: string | null;

  setApiKey: (key: string) => void;
  fetchDashboardStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      stats: null,
      chartData: [],
      isLoading: false,
      error: null,
      apiKey: null,

      setApiKey: (key: string) => set({ apiKey: key }),

      fetchDashboardStats: async () => {
        const config = useConfigStore.getState().config;
        const { apiKey } = get();

        if (!config?.analyseBaseUrl) {
          set({ error: "Analyse base URL not configured" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.get<{
            totalAgents: number;
            activeTraces: number;
            successRate: number;
            avgLatency: string;
            timeline: ChartDataPoint[];
          }>(`${config.analyseBaseUrl}/analytics/dashboard`, {
            headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
          });

          const data = response.data;
          set({
            stats: {
              totalAgents: data.totalAgents,
              activeTraces: data.activeTraces,
              successRate: data.successRate,
              avgLatency: data.avgLatency,
            },
            chartData: data.timeline || [],
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to fetch dashboard stats";
          set({ error: message, isLoading: false });
        }
      },
    }),
    {
      name: "whyops-dashboard-store",
      partialize: (state) => ({ apiKey: state.apiKey }),
    }
  )
);
