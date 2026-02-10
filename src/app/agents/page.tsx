import { AgentsTable } from "@/components/agents/agents-table";
import { StatCard } from "@/components/agents/stat-card";
import { SuccessRateChart } from "@/components/agents/success-rate-chart";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { getDashboardChartData, getDashboardStats, MOCK_DATA } from "@/constants/mock-data";
import { Activity, Clock, Plus, Settings, TrendingUp, Users } from "lucide-react";

export default function AgentsPage() {
  const stats = getDashboardStats();
  const chartData = getDashboardChartData();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="space-y-6 p-8">
            {/* Page Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Active State Dashboard
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Real-time monitoring for deployed autonomous agents
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="md" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Configure View
                </Button>
                <Button variant="primary" size="md" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Deploy Agent
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Agents"
                value={stats.totalAgents}
                icon={<Users className="h-6 w-6 text-primary" />}
              />
              <StatCard
                title="Active Traces"
                value={stats.activeTraces.toLocaleString()}
                icon={<Activity className="h-6 w-6 text-primary" />}
              />
              <StatCard
                title="Success Rate"
                value={`${stats.successRate.value}%`}
                trend={{
                  value: stats.successRate.trend,
                  isPositive: stats.successRate.isPositive,
                }}
                subtitle={stats.successRate.subtitle}
                icon={<TrendingUp className="h-6 w-6 text-primary" />}
              />
              <StatCard
                title="Avg Latency"
                value={stats.avgLatency.value}
                trend={{
                  value: stats.avgLatency.trend,
                  isPositive: stats.avgLatency.isPositive,
                }}
                subtitle={stats.avgLatency.subtitle}
                icon={<Clock className="h-6 w-6 text-primary" />}
              />
            </div>

            {/* Chart */}
            <SuccessRateChart data={chartData} />

            {/* Agents Table */}
            <AgentsTable initialAgents={MOCK_DATA.agents} />
          </div>
        </main>
      </div>
    </div>
  );
}
