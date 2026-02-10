import { AgentDetailHeader } from "@/components/agents/agent-detail-header";
import { AgentDetailStats } from "@/components/agents/agent-detail-stats";
import { AgentTraceTimeline } from "@/components/agents/agent-trace-timeline";
import { RecentTracesTable } from "@/components/agents/recent-traces-table";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Sidebar } from "@/components/layout/sidebar";

export default function AgentDetailsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="space-y-6 p-8">
            <AgentDetailHeader />
            <AgentDetailStats />
            <AgentTraceTimeline />
            <RecentTracesTable />
          </div>
        </main>
      </div>
    </div>
  );
}
