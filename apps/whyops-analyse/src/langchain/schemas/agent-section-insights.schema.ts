import { z } from 'zod';

const InsightBlockSchema = z.object({
  headline: z.string().max(180),
  keyThemes: z.array(z.string().max(220)).max(8),
  frictionPoints: z.array(z.string().max(220)).max(8),
  opportunities: z.array(z.string().max(220)).max(8),
  actionHints: z.array(z.string().max(220)).max(8),
});

const FollowupInsightBlockSchema = z.object({
  headline: z.string().max(180),
  whyUsersFollowUp: z.array(z.string().max(220)).max(8),
  unresolvedPatterns: z.array(z.string().max(220)).max(8),
  repairOpportunities: z.array(z.string().max(220)).max(8),
  actionHints: z.array(z.string().max(220)).max(8),
});

const QualityInsightBlockSchema = z.object({
  headline: z.string().max(180),
  rootCauses: z.array(z.string().max(220)).max(8),
  reliabilityRisks: z.array(z.string().max(220)).max(8),
  costLatencyDrivers: z.array(z.string().max(220)).max(8),
  actionHints: z.array(z.string().max(220)).max(8),
});

export const AgentSectionInsightsResultSchema = z.object({
  query: InsightBlockSchema,
  followup: FollowupInsightBlockSchema,
  quality: QualityInsightBlockSchema,
});

export type AgentSectionInsightsResult = z.infer<typeof AgentSectionInsightsResultSchema>;
