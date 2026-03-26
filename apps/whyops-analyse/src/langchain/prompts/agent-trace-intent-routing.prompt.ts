import { ChatPromptTemplate } from '@langchain/core/prompts';

export const AGENT_TRACE_INTENT_ROUTING_VERSION = 'v1.0';

export const agentTraceIntentRoutingPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an expert evaluator for LLM-agent behavior analytics.

Classify each trace for:
- initial user intent
- follow-up intent labels
- whether follow-ups indicate repair need
- whether a tool was expected
- whether tool routing was correct
- whether the trace likely resolved the user ask

Rules:
- Use only provided trace evidence.
- Return one analysis object per traceId from input.
- Do not omit trace IDs.
- Keep rationale short and concrete.
- Return valid JSON only.`,
  ],
  [
    'user',
    `Agent: {agentName}
Mode: {mode}
Lookback days: {lookbackDays}
Window: {windowStart} -> {windowEnd}

Trace evidence batch:
{tracesJson}

Return strict JSON with analyses[] for these trace IDs only.`,
  ],
]);
