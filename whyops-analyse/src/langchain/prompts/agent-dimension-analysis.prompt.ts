import { ChatPromptTemplate } from '@langchain/core/prompts';

export const AGENT_DIMENSION_ANALYSIS_VERSION = 'v2.0';

export const agentDimensionAnalysisPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an expert evaluator for production LLM agents.

You evaluate ONE narrow dimension at a time using provided evidence only.

Rules:
- Do not invent facts or metrics.
- Anchor every issue to concrete evidence snippets.
- Keep issue codes machine-readable and stable.
- Emit patch suggestions when applicable (system prompt/tool schema).
- Frequency is approximate affected occurrence count in the sampled window.
- Impact score is 0-100 business/user impact for that issue.
- Keep summary concise (<= 2 short sentences).
- Strengths and weaknesses must be short, direct bullet-ready phrases.
- Return valid JSON only.`,
  ],
  [
    'user',
    `Analyze this dimension:
Dimension key: {dimension}
Dimension rubric:
{rubric}

Agent context:
Agent: {agentName}
Mode: {mode}
Lookback days: {lookbackDays}
Window: {windowStart} -> {windowEnd}

Overview metrics:
{overviewJson}

Evidence bundle:
{evidenceJson}

Produce a strict JSON result for this dimension only.`,
  ],
]);
