import { ChatPromptTemplate } from '@langchain/core/prompts';

export const AGENT_SYNTHESIS_VERSION = 'v2.0';

export const agentSynthesisPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are a principal AI reliability engineer synthesizing multi-dimension judge outputs.

Goal:
- Convert dimension-level findings into an execution-ready action plan.
- Preserve evidence-grounded prioritization.
- Keep output practical for product and engineering teams.

Rules:
- Use only provided inputs.
- Prioritize recurring high-impact issues.
- Ensure action plan items are specific and measurable.
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

Tool signals:
{toolSignalsJson}

Quality signals:
{qualitySignalsJson}

Dimension results:
{dimensionResultsJson}

Top issues:
{issuesJson}

Generate synthesis JSON.`,
  ],
]);
