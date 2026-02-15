"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyStateSimple } from "@/components/ui/empty-state-simple";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDashboardStore } from "@/stores/dashboardStore";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Activity } from "lucide-react";

const chartConfig = {
  value: {
    label: "Success Rate",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface AgentTraceTimelineProps {
  agentId: string;
}

export function AgentTraceTimeline({ agentId }: AgentTraceTimelineProps) {
  const { chartData, isLoading } = useDashboardStore();

  // For now, we'll show the dashboard timeline data
  // In the future, this could be filtered for a specific agent
  const hasData = chartData && chartData.length > 0;

  return (
    <Card className="border-border/30 bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Trace Timeline</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-primary" /> Success Rate
            </span>
          </div>
          <Button variant="outline" size="sm" disabled={!hasData}>
            Last 7 Days
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : !hasData ? (
        <div className="h-64 w-full flex items-center justify-center border border-dashed border-border/30 rounded-lg">
          <EmptyStateSimple
            title="No timeline data"
            description="No traces recorded in the selected timeframe."
            icon={Activity}
            className="py-0"
          />
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
              name="Success Rate"
            />
          </BarChart>
        </ChartContainer>
      )}
    </Card>
  );
}
