import { z } from 'zod';

// ---------------------------------------------------------------------------
// Agent Summary — structured extraction from system prompt segments
// ---------------------------------------------------------------------------

export const AgentSegmentExtractionSchema = z.object({
  role: z.string().nullable().describe('The agent persona/role described in this segment, or null if not mentioned'),
  domain: z.string().nullable().describe('Domain/industry this segment relates to (e.g. finance, healthcare, e-commerce), or null'),
  capabilities: z.array(z.string()).describe('Specific capabilities or actions the agent can perform based on this segment'),
  constraints: z.array(z.string()).describe('Rules, restrictions, or things the agent must NOT do based on this segment'),
  behavioral_rules: z.array(z.string()).describe('How the agent should behave — tone, format, response style from this segment'),
  tool_usage_patterns: z.array(z.string()).describe('Instructions about when/how to use tools from this segment'),
  target_users: z.array(z.string()).describe('Who the agent is designed to serve, mentioned in this segment'),
  key_instructions: z.array(z.string()).describe('Critical instructions that define agent behavior from this segment'),
  domain_terms: z.array(z.string()).describe('Domain-specific terminology, acronyms, or concepts mentioned'),
});
export type AgentSegmentExtraction = z.infer<typeof AgentSegmentExtractionSchema>;

export const AgentSummarySchema = z.object({
  role: z.string().describe('Complete agent persona/role description'),
  primaryDomain: z.string().describe('Primary domain the agent operates in'),
  secondaryDomains: z.array(z.string()).describe('Other domains the agent touches'),
  capabilities: z.array(z.string()).describe('Complete list of what the agent can do'),
  constraints: z.array(z.string()).describe('Complete list of rules and restrictions'),
  behavioralRules: z.array(z.string()).describe('How the agent should behave — tone, format, response patterns'),
  toolUsagePatterns: z.array(z.string()).describe('Instructions about when/how to use tools'),
  targetUsers: z.array(z.string()).describe('Who the agent is designed to serve'),
  keyInstructions: z.array(z.string()).describe('Critical instructions that define core behavior'),
  domainTerms: z.array(z.string()).describe('Important domain-specific terminology'),
  summary: z.string().describe('2-3 sentence summary of what this agent does and its purpose'),
});
export type AgentSummary = z.infer<typeof AgentSummarySchema>;
