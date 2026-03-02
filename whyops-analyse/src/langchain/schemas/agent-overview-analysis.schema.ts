import { z } from 'zod';

const QueryCountItemSchema = z.object({
  query: z.string(),
  count: z.coerce.number().int().nonnegative(),
});

const HighErrorQueryItemSchema = z.object({
  query: z.string(),
  traceCount: z.coerce.number().int().nonnegative(),
  errorRate: z.coerce.number().min(0).max(100),
});

const HighLatencyQueryItemSchema = z.object({
  query: z.string(),
  traceCount: z.coerce.number().int().nonnegative(),
  avgLatencyMs: z.coerce.number().nonnegative(),
});

const CountByKeyItemSchema = z.object({
  key: z.string(),
  count: z.coerce.number().int().nonnegative(),
});

const NumberByKeyItemSchema = z.object({
  key: z.string(),
  value: z.coerce.number().nullable(),
});

const NullableDeltaByKeyItemSchema = z.object({
  key: z.string(),
  delta: z.coerce.number().nullable(),
});

const IntentDemandItemSchema = z.object({
  intent: z.string(),
  count: z.coerce.number().int().nonnegative(),
  share: z.coerce.number().min(0).max(100),
});

const IntentOutcomeItemSchema = z.object({
  intent: z.string(),
  traceCount: z.coerce.number().int().nonnegative(),
  share: z.coerce.number().min(0).max(100),
  errorRate: z.coerce.number().min(0).max(100),
  followupRate: z.coerce.number().min(0).max(100),
  toolUsageRate: z.coerce.number().min(0).max(100),
  likelyResolvedRate: z.coerce.number().min(0).max(100),
  expectedToolMissRate: z.coerce.number().min(0).max(100),
  arbitraryToolCallRate: z.coerce.number().min(0).max(100),
});

const IntentDevelopmentNeedItemSchema = z.object({
  intent: z.string(),
  traceCount: z.coerce.number().int().nonnegative(),
  developmentNeedScore: z.coerce.number().min(0).max(100),
  likelyResolvedRate: z.coerce.number().min(0).max(100),
  expectedToolMissRate: z.coerce.number().min(0).max(100),
  reasons: z.array(z.string()).max(8),
});

const ToolItemSchema = z.object({
  toolName: z.string(),
  calls: z.coerce.number().int().nonnegative(),
  likelyErrors: z.coerce.number().int().nonnegative(),
  likelySuccessRate: z.coerce.number().min(0).max(100),
  retries: z.coerce.number().int().nonnegative(),
  avgLatencyMs: z.coerce.number().nullable(),
  avgResponseBytes: z.coerce.number().nonnegative(),
});

const ToolEffectivenessItemSchema = z.object({
  toolName: z.string(),
  traces: z.coerce.number().int().nonnegative(),
  likelyResolvedRate: z.coerce.number().min(0).max(100),
  errorRate: z.coerce.number().min(0).max(100),
  followupRate: z.coerce.number().min(0).max(100),
  arbitraryCallRate: z.coerce.number().min(0).max(100),
});

export const AgentOverviewAnalysisResultSchema = z.object({
  overview: z.object({
    totalTraces: z.coerce.number().int().nonnegative(),
    totalEvents: z.coerce.number().int().nonnegative(),
    activeDays: z.coerce.number().int().nonnegative(),
    multiTurnRate: z.coerce.number().min(0).max(100),
    errorRate: z.coerce.number().min(0).max(100),
    avgLatencyMs: z.coerce.number().nullable(),
    p50LatencyMs: z.coerce.number().nullable(),
    p90LatencyMs: z.coerce.number().nullable(),
    totalTokens: z.coerce.number().nonnegative(),
    avgTokensPerResponse: z.coerce.number().nullable(),
    toolCallRate: z.coerce.number().min(0).max(100),
  }),
  query_intelligence: z.object({
    topInitialQueries: z.array(QueryCountItemSchema).max(30),
    topRepeatedQueries: z.array(QueryCountItemSchema).max(30),
    topHighErrorQueries: z.array(HighErrorQueryItemSchema).max(30),
    topHighLatencyQueries: z.array(HighLatencyQueryItemSchema).max(30),
    firstQueryIntentCategories: z.array(CountByKeyItemSchema).max(40),
    topFirstQueryIntents: z.array(IntentDemandItemSchema).max(20),
    firstQueryIntentOutcomes: z.array(IntentOutcomeItemSchema).max(30),
    topIntentsNeedingDevelopment: z.array(IntentDevelopmentNeedItemSchema).max(20),
  }),
  followup_intelligence: z.object({
    topFollowups: z.array(QueryCountItemSchema).max(30),
    followupRate: z.coerce.number().min(0).max(100),
    followupCount: z.coerce.number().int().nonnegative(),
    avgTurnsPerTrace: z.coerce.number().nonnegative(),
    loopingTraces: z.coerce.number().int().nonnegative(),
    intentCategories: z.array(CountByKeyItemSchema).max(40),
  }),
  intent_intelligence: z.object({
    topIntentClusters: z
      .array(
        z.object({
          clusterKey: z.string(),
          sampleQuery: z.string(),
          count: z.coerce.number().int().nonnegative(),
        })
      )
      .max(30),
    intentDistribution: z.array(NumberByKeyItemSchema).max(40),
    intentShiftVsPreviousRun: z.array(NullableDeltaByKeyItemSchema).max(40),
  }),
  tool_intelligence: z.object({
    tools: z.array(ToolItemSchema).max(80),
    bestPerformingTools: z.array(ToolItemSchema).max(20),
    expensiveTools: z.array(ToolItemSchema).max(20),
    routingSignals: z.object({
      likelyToolNeededTraces: z.coerce.number().int().nonnegative(),
      likelyToolNeededWithoutToolTraces: z.coerce.number().int().nonnegative(),
      toolNeedMissRate: z.coerce.number().min(0).max(100),
      topToolNeedWithoutToolQueries: z.array(QueryCountItemSchema).max(30),
    }),
    routingAssessment: z.object({
      expectedToolTraces: z.coerce.number().int().nonnegative(),
      expectedAndCalled: z.coerce.number().int().nonnegative(),
      expectedButMissed: z.coerce.number().int().nonnegative(),
      calledWithoutNeed: z.coerce.number().int().nonnegative(),
      routingRecall: z.coerce.number().min(0).max(100),
      routingPrecision: z.coerce.number().min(0).max(100),
      arbitraryCallRate: z.coerce.number().min(0).max(100),
    }),
    effectiveness: z.object({
      topResolvedTools: z.array(ToolEffectivenessItemSchema).max(20),
      underperformingTools: z.array(ToolEffectivenessItemSchema).max(20),
      mostUsedTools: z.array(ToolEffectivenessItemSchema).max(20),
    }),
    utilization: z.object({
      totalToolResponses: z.coerce.number().int().nonnegative(),
      consumedToolResponses: z.coerce.number().int().nonnegative(),
      utilizationRate: z.coerce.number().min(0).max(100),
    }),
  }),
  quality_intelligence: z.object({
    analyzedTraceCount: z.coerce.number().int().nonnegative(),
    sampled: z.boolean(),
    sampleLimit: z.coerce.number().int().positive(),
    dimensionAverages: z.array(NumberByKeyItemSchema).max(40),
    dimensionTrendVsPreviousRun: z.array(NullableDeltaByKeyItemSchema).max(40),
    severityDistribution: z.array(CountByKeyItemSchema).max(30),
    reliability: z.object({
      tracesWithError: z.coerce.number().int().nonnegative(),
      recoveredTraces: z.coerce.number().int().nonnegative(),
      recoveryRate: z.coerce.number().min(0).max(100),
    }),
  }),
});

export type AgentOverviewAnalysisResult = z.infer<typeof AgentOverviewAnalysisResultSchema>;
