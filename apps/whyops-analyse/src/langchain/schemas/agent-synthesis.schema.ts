import { z } from 'zod';
import {
  AgentFixTypeSchema,
  AgentJudgeDimensionSchema,
  AgentJudgeSeveritySchema,
  AgentOwnerTypeSchema,
} from './agent-dimension-analysis.schema';

export const AgentFailurePatternSchema = z.object({
  code: z.string(),
  title: z.string(),
  dimension: AgentJudgeDimensionSchema,
  severity: AgentJudgeSeveritySchema,
  count: z.coerce.number().int().nonnegative(),
  impactScore: z.coerce.number().min(0).max(100),
  summary: z.string(),
  recommendedFixTypes: z.array(AgentFixTypeSchema).max(6),
});

export const AgentActionPlanItemSchema = z.object({
  priority: z.coerce.number().int().min(1).max(50),
  title: z.string(),
  why: z.string(),
  ownerType: AgentOwnerTypeSchema,
  fixType: AgentFixTypeSchema,
  dimensions: z.array(AgentJudgeDimensionSchema).max(9),
  steps: z.array(z.string()).max(8),
  metric: z.string(),
  expectedImpact: z.string(),
  severity: AgentJudgeSeveritySchema,
});

export const AgentExperimentItemSchema = z.object({
  name: z.string(),
  hypothesis: z.string(),
  change: z.string(),
  metric: z.string(),
  successCriteria: z.string(),
  risk: z.enum(['low', 'medium', 'high']),
  effort: z.enum(['S', 'M', 'L']),
});

export const AgentSynthesisResultSchema = z.object({
  executiveSummary: z.string(),
  failureTaxonomy: z.object({
    patterns: z.array(AgentFailurePatternSchema).max(25),
  }),
  toolDiagnostics: z.object({
    tools: z.array(
      z.object({
        toolName: z.string(),
        riskSummary: z.string(),
        keyIssues: z.array(z.string()).max(8),
      })
    ).max(40),
    systemicIssues: z.array(
      z.object({
        title: z.string(),
        detail: z.string(),
        severity: AgentJudgeSeveritySchema,
        relatedTools: z.array(z.string()).max(12),
      })
    ).max(12),
    routingAnomalies: z.array(
      z.object({
        title: z.string(),
        detail: z.string(),
        severity: AgentJudgeSeveritySchema,
        evidence: z.array(z.string()).max(6),
      })
    ).max(12),
  }),
  actionPlan: z.object({
    items: z.array(AgentActionPlanItemSchema).max(20),
  }),
  experiments: z.object({
    items: z.array(AgentExperimentItemSchema).max(20),
  }),
});

export type AgentSynthesisResult = z.infer<typeof AgentSynthesisResultSchema>;
