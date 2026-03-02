import { z } from 'zod';

export const InitialIntentCategorySchema = z.enum([
  'real_time_lookup',
  'troubleshooting_support',
  'how_to_guidance',
  'planning_recommendation',
  'content_generation',
  'data_analysis_reporting',
  'account_or_action_request',
  'comparison_decision',
  'casual_or_other',
]);
export type InitialIntentCategory = z.infer<typeof InitialIntentCategorySchema>;

export const FollowupIntentCategorySchema = z.enum([
  'clarification_needed',
  'missing_info',
  'correction',
  'retry_rephrase',
  'new_intent',
]);
export type FollowupIntentCategory = z.infer<typeof FollowupIntentCategorySchema>;

export const RoutingDecisionSchema = z.enum([
  'correct_tool_call',
  'missed_required_tool',
  'unnecessary_tool_call',
  'tool_not_needed',
]);
export type RoutingDecision = z.infer<typeof RoutingDecisionSchema>;

export const AgentTraceIntentRoutingItemSchema = z.object({
  traceId: z.string(),
  initialIntent: InitialIntentCategorySchema,
  followupIntents: z.array(FollowupIntentCategorySchema).max(12),
  needsRepairFollowup: z.boolean(),
  expectedToolNeed: z.boolean(),
  routingDecision: RoutingDecisionSchema,
  likelyResolved: z.boolean(),
  confidence: z.coerce.number().min(0).max(1),
  rationale: z.string().max(280),
});

export const AgentTraceIntentRoutingResultSchema = z.object({
  analyses: z.array(AgentTraceIntentRoutingItemSchema).max(160),
});

export type AgentTraceIntentRoutingItem = z.infer<typeof AgentTraceIntentRoutingItemSchema>;
export type AgentTraceIntentRoutingResult = z.infer<typeof AgentTraceIntentRoutingResultSchema>;
