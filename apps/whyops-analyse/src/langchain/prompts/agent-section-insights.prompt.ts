import { ChatPromptTemplate } from '@langchain/core/prompts';

export const AGENT_SECTION_INSIGHTS_VERSION = 'v1.0';

export const agentSectionInsightsPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are a principal LLM analytics reviewer.

Generate concise section-level insights for:
- query intelligence
- follow-up intelligence
- quality intelligence

Rules:
- Use only supplied evidence.
- Be concrete and actionable.
- Keep points short and specific.
- Prefer direct bullet-style phrases (1 sentence each).
- Do not repeat exact metric values in every point.
- Return valid JSON only.`,
  ],
  [
    'user',
    `Agent: {agentName}
Mode: {mode}
Lookback days: {lookbackDays}
Window: {windowStart} -> {windowEnd}

Overview:
{overviewJson}

Query intelligence:
{queryIntelligenceJson}

Follow-up intelligence:
{followupIntelligenceJson}

Quality intelligence:
{qualityIntelligenceJson}

Dimension score highlights:
{dimensionScoresJson}

Return structured JSON insights for query, followup, and quality sections.`,
  ],
]);
