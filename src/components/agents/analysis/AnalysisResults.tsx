"use client";

import {
  AlertTriangle,
  Beaker,
  CheckCircle2,
  Clock3,
  Gauge,
  ListChecks,
  MessageSquareText,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  AGENT_ANALYSIS_DIMENSION_LABELS,
  type AgentAnalysisDimension,
} from "@/constants/agent-analysis";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  AgentAnalysisActionPlanSection,
  AgentAnalysisDimensionScoresSection,
  AgentAnalysisExperimentsSection,
  AgentAnalysisFailureTaxonomySection,
  AgentAnalysisFollowupIntelligenceSection,
  AgentAnalysisIntentIntelligenceSection,
  AgentAnalysisOverviewSection,
  AgentAnalysisQualityIntelligenceSection,
  AgentAnalysisQueryIntelligenceSection,
  AgentAnalysisRecommendationsSection,
  AgentAnalysisRun,
  AgentAnalysisToolDiagnosticsSection,
  AgentAnalysisToolIntelligenceSection,
} from "@/stores/agentAnalysisStore";
import { cn } from "@/lib/utils";
import { formatDateTime, formatMetricNumber, formatPercent } from "./utils";
import { AgentFindingsWorkbench } from "./AgentFindingsWorkbench";

interface AnalysisResultsProps {
  run: AgentAnalysisRun;
  isStreaming?: boolean;
}

interface BarItem {
  label: string;
  value: number;
  hint?: string;
}

function getStatusClass(status: AgentAnalysisRun["status"]): string {
  if (status === "completed") return "border-primary/30 bg-primary/10 text-primary";
  if (status === "failed") return "border-destructive/30 bg-destructive/10 text-destructive";
  return "border-warning/30 bg-warning/10 text-warning";
}

function severityClass(severity: "low" | "medium" | "high" | "critical"): string {
  if (severity === "critical") return "text-destructive";
  if (severity === "high") return "text-warning";
  if (severity === "medium") return "text-primary";
  return "text-muted-foreground";
}

function toPercent(value: number | null | undefined): number {
  if (value === null || value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value * 100));
}

function formatDimensionLabel(dimension: string): string {
  const label = AGENT_ANALYSIS_DIMENSION_LABELS[dimension as AgentAnalysisDimension];
  return label || dimension.replace(/_/g, " ");
}

function dimensionScoreBadgeClass(score: number): string {
  if (score < 0.25) return "border-destructive/30 bg-destructive/10 text-destructive";
  if (score < 0.45) return "border-warning/30 bg-warning/10 text-warning";
  if (score < 0.7) return "border-primary/30 bg-primary/10 text-primary";
  return "border-border/60 bg-surface-2/40 text-foreground";
}

function sanitizeText(value: string): string {
  return value
    .replace(/\[(?:image|img)\s*#?\d+\]/gi, " ")
    .replace(/<image[^>]*>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value: string, max = 140): string {
  const normalized = sanitizeText(value);
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}...`;
}

function firstPoint(value: string): string {
  const normalized = sanitizeText(value);
  if (!normalized) return "No summary generated for this dimension.";
  const [firstSentence] = normalized.split(/(?<=[.!?])\s+/);
  return truncateText(firstSentence || normalized, 140);
}

function normalizeBars(items: BarItem[], limit = 8): BarItem[] {
  return items
    .filter((item) => item.label.trim().length > 0 && Number.isFinite(item.value) && item.value >= 0)
    .slice(0, limit);
}

function severitySortKey(severity: string): number {
  if (severity === "critical") return 0;
  if (severity === "high") return 1;
  if (severity === "medium") return 2;
  return 3;
}

function trendLabel(delta: number | null | undefined): string {
  if (delta === null || delta === undefined || !Number.isFinite(delta)) return "-";
  if (delta > 0) return `+${delta.toFixed(2)}`;
  return delta.toFixed(2);
}

function trendClass(delta: number | null | undefined): string {
  if (delta === null || delta === undefined || !Number.isFinite(delta)) {
    return "border-border/60 bg-surface-2/40 text-muted-foreground";
  }
  if (delta > 0) return "border-primary/30 bg-primary/10 text-primary";
  if (delta < 0) return "border-destructive/30 bg-destructive/10 text-destructive";
  return "border-border/60 bg-surface-2/40 text-muted-foreground";
}

export function AnalysisResults({ run, isStreaming = false }: AnalysisResultsProps) {
  const overview = run.sections?.overview as AgentAnalysisOverviewSection | undefined;
  const query = run.sections?.query_intelligence as AgentAnalysisQueryIntelligenceSection | undefined;
  const followup = run.sections?.followup_intelligence as AgentAnalysisFollowupIntelligenceSection | undefined;
  const intent = run.sections?.intent_intelligence as AgentAnalysisIntentIntelligenceSection | undefined;
  const tools = run.sections?.tool_intelligence as AgentAnalysisToolIntelligenceSection | undefined;
  const quality = run.sections?.quality_intelligence as AgentAnalysisQualityIntelligenceSection | undefined;
  const dimensionScores =
    run.sections?.dimension_scores as AgentAnalysisDimensionScoresSection | undefined;
  const failureTaxonomy =
    run.sections?.failure_taxonomy as AgentAnalysisFailureTaxonomySection | undefined;
  const toolDiagnostics =
    run.sections?.tool_diagnostics as AgentAnalysisToolDiagnosticsSection | undefined;
  const actionPlan = run.sections?.action_plan as AgentAnalysisActionPlanSection | undefined;
  const experiments = run.sections?.experiments as AgentAnalysisExperimentsSection | undefined;
  const recommendations = run.sections?.recommendations as AgentAnalysisRecommendationsSection | undefined;
  const checkpoint = run.summary?.checkpoint;

  const findings = run.findings || [];

  const topInitialQueryBars = normalizeBars(
    (query?.topInitialQueries || []).map((item) => ({
      label: sanitizeText(item.query),
      value: Number(item.count || 0),
      hint: `${item.count} traces`,
    }))
  );

  const highErrorQueryBars = normalizeBars(
    (query?.topHighErrorQueries || []).map((item) => ({
      label: sanitizeText(item.query),
      value: Number(item.errorRate || 0),
      hint: `${item.traceCount} traces`,
    }))
  );

  const topFollowupBars = normalizeBars(
    (followup?.topFollowups || []).map((item) => ({
      label: sanitizeText(item.query),
      value: Number(item.count || 0),
      hint: `${item.count} times`,
    }))
  );

  const followupIntentBars = normalizeBars(
    Object.entries(followup?.intentCategories || {}).map(([key, count]) => ({
      label: key.replace(/_/g, " "),
      value: Number(count || 0),
    }))
  );

  const severityBars = normalizeBars(
    Object.entries(quality?.severityDistribution || {})
      .sort((a, b) => severitySortKey(a[0]) - severitySortKey(b[0]))
      .map(([severity, count]) => ({
        label: severity,
        value: Number(count || 0),
      }))
  );

  const firstQueryIntentBars = normalizeBars(
    (query?.topFirstQueryIntents || []).map((item) => ({
      label: item.intent.replace(/_/g, " "),
      value: Number(item.count || 0),
      hint: `${item.share.toFixed(1)}% share`,
    }))
  );

  const firstQueryIntentOutcomes = (query?.firstQueryIntentOutcomes || []).slice(0, 8);
  const topIntentsNeedingDevelopment = (query?.topIntentsNeedingDevelopment || []).slice(0, 6);

  const topResolvedToolBars = normalizeBars(
    (tools?.effectiveness?.topResolvedTools || []).map((item) => ({
      label: item.toolName,
      value: Number(item.likelyResolvedRate || 0),
      hint: `${item.traces} traces`,
    }))
  );

  const underperformingToolBars = normalizeBars(
    (tools?.effectiveness?.underperformingTools || []).map((item) => ({
      label: item.toolName,
      value: Number(item.errorRate + item.followupRate + item.arbitraryCallRate || 0),
      hint: `Err ${item.errorRate.toFixed(1)}% | Fup ${item.followupRate.toFixed(1)}%`,
    }))
  );

  return (
    <div className="space-y-5">
      <Card className="border-border/60 bg-card px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-xl font-semibold text-foreground">
                {run.status === "completed"
                  ? "Deep Agent Analysis Complete"
                  : run.status === "failed"
                    ? "Agent Analysis Failed"
                    : "Deep Agent Analysis Running"}
              </p>
              <Badge className={cn("h-5 px-1.5 text-[10px] uppercase", getStatusClass(run.status))}>
                {run.status}
              </Badge>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-5">
              <MetaField label="Mode" value={String(run.summary?.mode || "standard")} />
              <MetaField label="Window" value={`${run.summary?.lookbackDays || 14} days`} />
              <MetaField label="Dimensions" value={String(run.summary?.dimensionCount || 0)} />
              <MetaField label="Traces" value={String(run.traceCount)} />
              <MetaField label="Findings" value={String(run.summary?.findingCount || findings.length)} />
            </div>
            <p className="text-xs text-muted-foreground">
              Window: {formatDateTime(run.windowStart)} - {formatDateTime(run.windowEnd)}
            </p>
          </div>
          <div className="space-y-2 text-right text-xs text-muted-foreground">
            <p>Started: {formatDateTime(run.startedAt)}</p>
            <p>Finished: {formatDateTime(run.finishedAt)}</p>
            <p>
              Overall Score:{" "}
              <span className="font-semibold text-foreground">
                {typeof dimensionScores?.overallScore === "number"
                  ? `${Math.round(dimensionScores.overallScore * 100)}%`
                  : "N/A"}
              </span>
            </p>
          </div>
        </div>

        {checkpoint && (isStreaming || run.status === "running") ? (
          <div className="mt-4 rounded-sm border border-border/60 bg-surface-2/30 px-3 py-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Checkpoint:</span> {checkpoint.key} (#{checkpoint.sequence})
          </div>
        ) : null}
      </Card>

      <Tabs defaultValue="dimensions" className="space-y-4">
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-1 overflow-x-auto border-b border-border/50 bg-transparent p-0 pb-2"
        >
          <TabsTrigger value="overview" className="h-9 flex-none rounded-sm px-3 text-sm font-medium">Overview</TabsTrigger>
          <TabsTrigger value="query" className="h-9 flex-none rounded-sm px-3 text-sm font-medium">Query & Intent</TabsTrigger>
          <TabsTrigger value="dimensions" className="h-9 flex-none rounded-sm px-3 text-sm font-medium">Dimension Scores</TabsTrigger>
          <TabsTrigger value="findings" className="h-9 flex-none rounded-sm px-3 text-sm font-medium">Findings</TabsTrigger>
          <TabsTrigger value="diagnostics" className="h-9 flex-none rounded-sm px-3 text-sm font-medium">Tool & Quality</TabsTrigger>
          <TabsTrigger value="actions" className="h-9 flex-none rounded-sm px-3 text-sm font-medium">Action Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5">
          {overview ? (
            <Card className="border-border/60 bg-card px-5 py-5">
              <SectionTitle icon={<Gauge className="h-4 w-4" />} title="Overview" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Active Days" value={formatMetricNumber(overview.activeDays)} />
                <MetricCard label="Multi-turn Rate" value={formatPercent(overview.multiTurnRate)} />
                <MetricCard label="Error Rate" value={formatPercent(overview.errorRate)} />
                <MetricCard label="Tool Call Rate" value={formatPercent(overview.toolCallRate)} />
                <MetricCard label="Avg Latency" value={formatMetricNumber(overview.avgLatencyMs, " ms")} />
                <MetricCard label="P50 Latency" value={formatMetricNumber(overview.p50LatencyMs, " ms")} />
                <MetricCard label="P90 Latency" value={formatMetricNumber(overview.p90LatencyMs, " ms")} />
                <MetricCard label="Total Tokens" value={formatMetricNumber(overview.totalTokens)} />
              </div>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="query" className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="border-border/60 bg-card px-5 py-5">
              <SectionTitle icon={<MessageSquareText className="h-4 w-4" />} title="Query Intelligence" />

              <div className="mt-4 space-y-4">
                <InsightHeader
                  title="LLM Read"
                  headline={query?.llmInsights?.headline}
                  fallback="No LLM query insight available yet."
                />

                <BarList
                  title="Top Initial Queries"
                  items={topInitialQueryBars}
                  formatter={(value) => `${value.toFixed(0)}`}
                />

                <BarList
                  title="High Error Query Classes"
                  items={highErrorQueryBars}
                  formatter={(value) => `${value.toFixed(1)}%`}
                />

                <BarList
                  title="First-Query Intent Demand"
                  items={firstQueryIntentBars}
                  formatter={(value) => `${value.toFixed(0)}`}
                />

                {firstQueryIntentOutcomes.length > 0 ? (
                  <div className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      First-Query Intent Outcomes
                    </p>
                    <div className="mt-2 space-y-2">
                      {firstQueryIntentOutcomes.map((item) => (
                        <div key={item.intent} className="rounded-sm border border-border/50 bg-background/60 px-2.5 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">{item.intent.replace(/_/g, " ")}</p>
                            <span className="text-xs text-muted-foreground">{item.traceCount} traces</span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <Badge className="border-border/60 bg-surface-2/40 text-[10px] text-foreground">
                              Resolve {item.likelyResolvedRate.toFixed(1)}%
                            </Badge>
                            <Badge className="border-border/60 bg-surface-2/40 text-[10px] text-foreground">
                              Error {item.errorRate.toFixed(1)}%
                            </Badge>
                            <Badge className="border-border/60 bg-surface-2/40 text-[10px] text-foreground">
                              Follow-up {item.followupRate.toFixed(1)}%
                            </Badge>
                            <Badge className="border-border/60 bg-surface-2/40 text-[10px] text-foreground">
                              Tool Miss {item.expectedToolMissRate.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {topIntentsNeedingDevelopment.length > 0 ? (
                  <div className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Intents Needing Development
                    </p>
                    <div className="mt-2 space-y-2">
                      {topIntentsNeedingDevelopment.map((item) => (
                        <div key={`${item.intent}-${item.traceCount}`} className="rounded-sm border border-border/50 bg-background/60 px-2.5 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">{item.intent.replace(/_/g, " ")}</p>
                            <span className="text-xs text-warning">Need {item.developmentNeedScore.toFixed(1)}</span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.reasons.length > 0 ? item.reasons.join(", ") : "Performance below target in this intent."}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <InsightList
                  title="Key Themes"
                  items={query?.llmInsights?.keyThemes || []}
                />
                <InsightList
                  title="Friction Points"
                  items={query?.llmInsights?.frictionPoints || []}
                />
                <InsightList
                  title="Opportunities"
                  items={query?.llmInsights?.opportunities || []}
                />
                <InsightList
                  title="Action Hints"
                  items={query?.llmInsights?.actionHints || []}
                />
              </div>
            </Card>

            <Card className="border-border/60 bg-card px-5 py-5">
              <SectionTitle icon={<MessageSquareText className="h-4 w-4" />} title="Follow-up & Intent" />

              <div className="mt-4 space-y-4">
                <InsightHeader
                  title="LLM Read"
                  headline={followup?.llmInsights?.headline}
                  fallback="No LLM follow-up insight available yet."
                />

                <div className="grid gap-2 sm:grid-cols-3">
                  <MetricChip label="Follow-up Rate" value={formatPercent(followup?.followupRate)} />
                  <MetricChip label="Avg Turns / Trace" value={formatMetricNumber(followup?.avgTurnsPerTrace)} />
                  <MetricChip label="Looping Traces" value={formatMetricNumber(followup?.loopingTraces)} />
                </div>

                <BarList
                  title="Top Follow-up Queries"
                  items={topFollowupBars}
                  formatter={(value) => `${value.toFixed(0)}`}
                />

                <BarList
                  title="Follow-up Intent Categories"
                  items={followupIntentBars}
                  formatter={(value) => `${value.toFixed(0)}`}
                />

                <InsightList
                  title="Why Users Follow Up"
                  items={followup?.llmInsights?.whyUsersFollowUp || []}
                />
                <InsightList
                  title="Unresolved Patterns"
                  items={followup?.llmInsights?.unresolvedPatterns || []}
                />
                <InsightList
                  title="Repair Opportunities"
                  items={followup?.llmInsights?.repairOpportunities || []}
                />
                <InsightList
                  title="Action Hints"
                  items={followup?.llmInsights?.actionHints || []}
                />

                {Object.keys(intent?.intentDistribution || {}).length > 0 ? (
                  <div className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Top Intent Clusters (Distribution)
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(intent?.intentDistribution || {})
                        .slice(0, 8)
                        .map(([key, value]) => (
                          <Badge key={key} className="border-border/60 bg-surface-2/35 text-[10px] text-foreground">
                            {key.replace(/_/g, " ")}: {value.toFixed(1)}%
                          </Badge>
                        ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dimensions" className="space-y-5">
          {dimensionScores ? (
            <Card className="border-border/60 bg-card px-5 py-5">
              <SectionTitle icon={<ShieldAlert className="h-4 w-4" />} title="Dimension Scores" />

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <MetricCard
                  label="Overall Score"
                  value={`${Math.round((dimensionScores.overallScore || 0) * 100)}%`}
                />
                <MetricCard label="Total Issues" value={formatMetricNumber(dimensionScores.totalIssues)} />
                <MetricCard
                  label="Critical + High"
                  value={formatMetricNumber(
                    Number(dimensionScores.bySeverity?.critical || 0) + Number(dimensionScores.bySeverity?.high || 0)
                  )}
                />
                <MetricCard
                  label="Failed Dimensions"
                  value={formatMetricNumber(Object.keys(dimensionScores.failures || {}).length)}
                />
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-4">
                {(["critical", "high", "medium", "low"] as const).map((severity) => (
                  <div key={severity} className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{severity}</p>
                    <p className={cn("mt-1 text-base font-semibold", severityClass(severity))}>
                      {dimensionScores.bySeverity?.[severity] || 0}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {dimensionScores.dimensions.map((dimension) => (
                  <div
                    key={dimension.dimension}
                    className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{formatDimensionLabel(dimension.dimension)}</p>
                      <Badge className={cn("text-[10px]", dimensionScoreBadgeClass(dimension.score))}>
                        {Math.round(dimension.score * 100)}%
                      </Badge>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">{firstPoint(dimension.summary)}</p>

                    <div className="mt-3 space-y-1.5">
                      <Progress value={Math.max(0, Math.min(100, dimension.score * 100))} />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Issues: {dimension.issueCount}</span>
                        <span className={severityClass(dimension.severity)}>{dimension.severity}</span>
                      </div>
                    </div>

                    <CompactPoints title="Strengths" items={dimension.strengths} emptyLabel="No stable strengths yet." />
                    <CompactPoints title="Needs Work" items={dimension.weaknesses} emptyLabel="No weaknesses reported." />
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          <Card className="border-border/60 bg-card px-5 py-5">
            <SectionTitle icon={<AlertTriangle className="h-4 w-4" />} title="Failure Taxonomy" />
            <div className="mt-4 space-y-3">
              {(failureTaxonomy?.patterns || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No failure taxonomy patterns generated.</p>
              ) : (
                failureTaxonomy?.patterns.slice(0, 10).map((pattern) => (
                  <div key={pattern.code} className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{pattern.title}</p>
                      <span className={cn("text-xs font-semibold uppercase", severityClass(pattern.severity))}>{pattern.severity}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{truncateText(pattern.summary, 180)}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="findings" className="space-y-5">
          {findings.length > 0 ? (
            <AgentFindingsWorkbench findings={findings} isStreaming={isStreaming} />
          ) : (
            <section className="flex items-center gap-2 rounded-sm border border-border/60 bg-surface-2/20 px-4 py-5 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {isStreaming
                ? "Waiting for structured findings. This section updates as streaming continues."
                : "No findings were reported for this analysis."}
            </section>
          )}
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="border-border/60 bg-card px-5 py-5">
              <SectionTitle icon={<Wrench className="h-4 w-4" />} title="Tool Diagnostics" />
              <div className="mt-4 space-y-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <MetricChip
                    label="Routing Recall"
                    value={formatPercent(tools?.routingAssessment?.routingRecall)}
                  />
                  <MetricChip
                    label="Routing Precision"
                    value={formatPercent(tools?.routingAssessment?.routingPrecision)}
                  />
                  <MetricChip
                    label="Arbitrary Tool Calls"
                    value={formatPercent(tools?.routingAssessment?.arbitraryCallRate)}
                  />
                </div>
                <div className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-2 text-xs text-muted-foreground">
                  Expected Tool Traces:{" "}
                  <span className="font-medium text-foreground">{tools?.routingAssessment?.expectedToolTraces ?? 0}</span>{" "}
                  | Called:{" "}
                  <span className="font-medium text-foreground">{tools?.routingAssessment?.expectedAndCalled ?? 0}</span>{" "}
                  | Missed:{" "}
                  <span className="font-medium text-foreground">{tools?.routingAssessment?.expectedButMissed ?? 0}</span>{" "}
                  | Called Without Need:{" "}
                  <span className="font-medium text-foreground">{tools?.routingAssessment?.calledWithoutNeed ?? 0}</span>
                </div>

                <BarList
                  title="Tools Solving Users Most"
                  items={topResolvedToolBars}
                  formatter={(value) => `${value.toFixed(1)}%`}
                />

                <BarList
                  title="Underperforming Tool Patterns"
                  items={underperformingToolBars}
                  formatter={(value) => `${value.toFixed(1)}`}
                />

                {(tools?.tools || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tool call data in this run.</p>
                ) : (
                  tools?.tools.slice(0, 8).map((tool) => (
                    <div key={tool.toolName} className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{tool.toolName}</p>
                        <p className="text-xs text-muted-foreground">{tool.calls} calls</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Success {formatPercent(tool.likelySuccessRate)} | Retries {tool.retries} | Avg latency {formatMetricNumber(tool.avgLatencyMs, " ms")}
                      </p>
                    </div>
                  ))
                )}
                {(toolDiagnostics?.systemicIssues || []).slice(0, 3).map((issue) => (
                  <div key={issue.title} className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-2">
                    <p className="text-xs font-semibold text-foreground">{issue.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{truncateText(issue.detail, 180)}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border/60 bg-card px-5 py-5">
              <SectionTitle icon={<Clock3 className="h-4 w-4" />} title="Quality Intelligence" />
              <div className="mt-4 space-y-4">
                <InsightHeader
                  title="LLM Read"
                  headline={quality?.llmInsights?.headline}
                  fallback="No LLM quality insight available yet."
                />

                <div className="grid gap-2 sm:grid-cols-2">
                  <MetricChip
                    label="Judge Sample Traces"
                    value={formatMetricNumber(quality?.analyzedTraceCount || 0)}
                  />
                  <MetricChip
                    label="Recovery Rate"
                    value={formatPercent(quality?.reliability?.recoveryRate || 0)}
                  />
                </div>

                <BarList
                  title="Finding Severity Distribution"
                  items={severityBars}
                  formatter={(value) => `${value.toFixed(0)}`}
                />

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dimension Trend</p>
                  {Object.entries(quality?.dimensionAverages || {})
                    .slice(0, 8)
                    .map(([dimension, score]) => {
                      const delta = quality?.dimensionTrendVsPreviousRun?.[dimension] ?? null;
                      return (
                        <div key={dimension} className="space-y-1.5 rounded-sm border border-border/55 bg-surface-2/20 px-2.5 py-2">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-muted-foreground">{dimension.replace(/_/g, " ")}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-foreground">{formatPercent(toPercent(score))}</span>
                              <Badge className={cn("h-5 px-1.5 text-[10px]", trendClass(delta))}>{trendLabel(delta)}</Badge>
                            </div>
                          </div>
                          <Progress value={toPercent(score)} />
                        </div>
                      );
                    })}
                </div>

                <InsightList
                  title="Root Causes"
                  items={quality?.llmInsights?.rootCauses || []}
                />
                <InsightList
                  title="Reliability Risks"
                  items={quality?.llmInsights?.reliabilityRisks || []}
                />
                <InsightList
                  title="Cost / Latency Drivers"
                  items={quality?.llmInsights?.costLatencyDrivers || []}
                />
                <InsightList
                  title="Action Hints"
                  items={quality?.llmInsights?.actionHints || []}
                />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="border-border/60 bg-card px-5 py-5">
              <SectionTitle icon={<ListChecks className="h-4 w-4" />} title="Action Plan" />
              <div className="mt-4 space-y-3">
                {(actionPlan?.items || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No action plan items generated.</p>
                ) : (
                  actionPlan?.items.slice(0, 10).map((item) => (
                    <div key={`${item.priority}-${item.title}`} className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">P{item.priority} - {item.title}</p>
                        <span className={cn("text-xs font-semibold uppercase", severityClass(item.severity))}>{item.severity}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.why}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="border-border/60 bg-card px-5 py-5">
              <SectionTitle icon={<Beaker className="h-4 w-4" />} title="Experiments" />
              <div className="mt-4 space-y-3">
                {(experiments?.items || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No experiments proposed.</p>
                ) : (
                  experiments?.items.slice(0, 10).map((experiment) => (
                    <div key={experiment.name} className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-3">
                      <p className="text-sm font-semibold text-foreground">{experiment.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{experiment.hypothesis}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Metric: {experiment.metric} | Risk: {experiment.risk} | Effort: {experiment.effort}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <Card className="border-border/60 bg-card px-5 py-5">
            <SectionTitle icon={<AlertTriangle className="h-4 w-4" />} title="Recommendations" />
            <div className="mt-4 space-y-3">
              {(recommendations?.items || []).length === 0 ? (
                <div className="flex items-center gap-2 rounded-sm border border-border/55 bg-surface-2/20 px-3 py-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  No recommendations generated.
                </div>
              ) : (
                recommendations?.items.map((item) => (
                  <div key={`${item.priority}-${item.title}`} className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">P{item.priority} - {item.title}</p>
                      <span className={`text-xs font-semibold uppercase ${severityClass(item.severity)}`}>{item.severity}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      {icon}
      {title}
    </p>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-sm border border-border/55 bg-surface-2/30 px-2.5 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value}</span>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border/55 bg-surface-2/20 px-2.5 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function InsightHeader({
  title,
  headline,
  fallback,
}: {
  title: string;
  headline?: string;
  fallback: string;
}) {
  return (
    <div className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-1 text-sm text-foreground">{headline ? truncateText(headline, 180) : fallback}</p>
    </div>
  );
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  const cleaned = items.map((item) => truncateText(item, 180)).filter((item) => item.length > 0).slice(0, 3);

  if (cleaned.length === 0) return null;

  return (
    <div className="space-y-1.5 rounded-sm border border-border/55 bg-surface-2/20 px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="space-y-1 text-sm text-foreground">
        {cleaned.map((item) => (
          <li key={item} className="leading-relaxed text-sm text-muted-foreground">
            - {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompactPoints({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  const cleaned = items.map((item) => truncateText(item, 120)).filter((item) => item.length > 0).slice(0, 2);

  return (
    <div className="mt-3 space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {cleaned.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="space-y-1 text-xs text-muted-foreground">
          {cleaned.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BarList({
  title,
  items,
  formatter,
}: {
  title: string;
  items: BarItem[];
  formatter: (value: number) => string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">No data in this section.</p>
      </div>
    );
  }

  const max = items.reduce((acc, item) => Math.max(acc, item.value), 0) || 1;

  return (
    <div className="rounded-sm border border-border/55 bg-surface-2/20 px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="mt-2 space-y-2">
        {items.map((item) => {
          const width = Math.max(6, Math.round((item.value / max) * 100));
          return (
            <div key={`${item.label}-${item.value}`} className="space-y-1">
              <div className="flex items-start justify-between gap-2 text-xs">
                <span className="max-w-[70%] text-muted-foreground">{truncateText(item.label, 110)}</span>
                <span className="font-medium text-foreground">{formatter(item.value)}</span>
              </div>
              <div className="h-1.5 rounded-sm bg-surface-3/70">
                <div className="h-full rounded-sm bg-primary/75" style={{ width: `${width}%` }} />
              </div>
              {item.hint ? <p className="text-[11px] text-muted-foreground">{item.hint}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
