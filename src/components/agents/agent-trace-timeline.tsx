"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyStateSimple } from "@/components/ui/empty-state-simple";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getAgent } from "@/constants/mock-data";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useParams } from "next/navigation";
import { Activity } from "lucide-react";

const chartConfig = {
  success: {
    label: "Success",
    color: "var(--primary)",
  },
  warning: {
    label: "Warning",
    color: "var(--warning)",
  },
  error: {
    label: "Error",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

export function AgentTraceTimeline() {
  const params = useParams();
  const agentId = (params.agentId as string) || "1";
  const agent = getAgent(agentId);

  if (!agent) return null;

  const hasData = agent.traceTimelineData && agent.traceTimelineData.length > 0;

  return (
    <Card className="border-border/30 bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Trace Timeline</h2>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm bg-primary" /> Success</span>
                <span className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm bg-warning" /> Warning</span>
                <span className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm bg-destructive" /> Error</span>
            </div>
            <Button variant="outline" size="sm" disabled={!hasData}>
            Last 12 Hours
            </Button>
        </div>
      </div>

      {!hasData ? (
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
            data={agent.traceTimelineData}
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis
              dataKey="time"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar
              dataKey="success"
              stackId="a"
              fill="var(--color-success)"
              radius={[0, 0, 4, 4]}
              maxBarSize={50}
            />
            <Bar
              dataKey="warning"
              stackId="a"
              fill="var(--color-warning)"
              radius={[0, 0, 0, 0]}
              maxBarSize={50}
            />
            <Bar
              dataKey="error"
              stackId="a"
              fill="var(--color-error)"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ChartContainer>
      )}
    </Card>
  );
}
