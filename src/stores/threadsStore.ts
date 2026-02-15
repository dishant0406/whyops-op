import { create } from "zustand";
import { persist } from "zustand/middleware";

import { apiClient } from "@/lib/api-client";
import { useConfigStore } from "./configStore";

export interface Thread {
  threadId: string;
  userId: string;
  providerId?: string;
  entityId?: string;
  entityName?: string;
  lastActivity: string;
  eventCount: number;
  duration?: number;
}

interface ThreadsState {
  threads: Thread[];
  isLoading: boolean;
  error: string | null;
  apiKey: string | null;

  setApiKey: (key: string) => void;
  fetchThreads: () => Promise<void>;
}

export const useThreadsStore = create<ThreadsState>()(
  persist(
    (set, get) => ({
      threads: [],
      isLoading: false,
      error: null,
      apiKey: null,

      setApiKey: (key: string) => set({ apiKey: key }),

      fetchThreads: async () => {
        const config = useConfigStore.getState().config;
        const { apiKey } = get();

        if (!config?.analyseBaseUrl) {
          set({ error: "Analyse base URL not configured" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.get<{ threads: Thread[] }>(
            `${config.analyseBaseUrl}/api/threads`,
            {
              headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
            }
          );

          const threads: Thread[] = (response.data.threads || []).map((t) => ({
            threadId: t.threadId,
            userId: t.userId,
            providerId: t.providerId,
            entityId: t.entityId,
            entityName: t.entityName,
            lastActivity: new Date(t.lastActivity).toISOString(),
            eventCount: t.eventCount,
            duration: t.duration,
          }));

          set({ threads, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to fetch threads";
          set({ error: message, isLoading: false });
        }
      },
    }),
    {
      name: "whyops-threads-store",
      partialize: (state) => ({ apiKey: state.apiKey }),
    }
  )
);
