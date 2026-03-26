import { z } from 'zod';
import { PatchSchema } from './shared.schema';

export const AgentJudgeDimensionSchema = z.enum([
  'intent_precision',
  'followup_repair',
  'answer_completeness_clarity',
  'tool_routing_quality',
  'tool_invocation_quality',
  'tool_output_utilization',
  'reliability_recovery',
  'latency_cost_efficiency',
  'conversation_ux',
]);
export type AgentJudgeDimension = z.infer<typeof AgentJudgeDimensionSchema>;

export const AgentJudgeSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export type AgentJudgeSeverity = z.infer<typeof AgentJudgeSeveritySchema>;

export const AgentOwnerTypeSchema = z.enum([
  'prompt',
  'tool_schema',
  'router',
  'retry',
  'model',
  'guardrail',
  'ux',
  'unknown',
]);

export const AgentFixTypeSchema = z.enum([
  'instruction',
  'few_shot',
  'schema',
  'routing',
  'fallback',
  'timeout_retry',
  'response_style',
  'cost_policy',
  'other',
]);

export const AgentEvidenceSnippetSchema = z.object({
  traceId: z.string().nullable(),
  signalType: z.string(),
  snippet: z.string(),
});

export const AgentDimensionIssueSchema = z.object({
  code: z.string(),
  title: z.string(),
  detail: z.string(),
  severity: AgentJudgeSeveritySchema,
  confidence: z.coerce.number().min(0).max(1),
  frequency: z.coerce.number().int().nonnegative(),
  impactScore: z.coerce.number().min(0).max(100),
  evidence: z.array(AgentEvidenceSnippetSchema).max(8),
  rootCause: z.string(),
  recommendation: z.object({
    action: z.string(),
    detail: z.string(),
    ownerType: AgentOwnerTypeSchema,
    fixType: AgentFixTypeSchema,
  }),
  patches: z.array(PatchSchema).max(8),
});

export const AgentDimensionAnalysisResultSchema = z.object({
  dimension: AgentJudgeDimensionSchema,
  score: z.coerce.number().min(0).max(1),
  severity: AgentJudgeSeveritySchema,
  confidence: z.coerce.number().min(0).max(1),
  summary: z.string().max(300),
  strengths: z.array(z.string().max(160)).max(8),
  weaknesses: z.array(z.string().max(160)).max(12),
  issues: z.array(AgentDimensionIssueSchema).max(30),
});

export type AgentDimensionAnalysisResult = z.infer<typeof AgentDimensionAnalysisResultSchema>;
