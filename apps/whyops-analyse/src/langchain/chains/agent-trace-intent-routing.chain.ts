import { createServiceLogger } from '@whyops/shared/logger';
import { getJudgeModel, invokeWithInvalidModelRetry } from '../config';
import { agentTraceIntentRoutingPrompt } from '../prompts/agent-trace-intent-routing.prompt';
import {
  AgentTraceIntentRoutingResultSchema,
  type AgentTraceIntentRoutingResult,
} from '../schemas/agent-trace-intent-routing.schema';

const logger = createServiceLogger('analyse:langchain:chain:agent-trace-intent-routing');

export interface AgentTraceIntentRoutingInput {
  agentName: string;
  mode: 'quick' | 'standard' | 'deep';
  lookbackDays: number;
  windowStart: string;
  windowEnd: string;
  tracesJson: string;
}

export async function runAgentTraceIntentRoutingChain(
  input: AgentTraceIntentRoutingInput,
  overrideModel?: string
): Promise<AgentTraceIntentRoutingResult> {
  const model = getJudgeModel(overrideModel);
  const structured = model.withStructuredOutput(AgentTraceIntentRoutingResultSchema);
  const chain = agentTraceIntentRoutingPrompt.pipe(structured);

  logger.info(
    {
      mode: input.mode,
      tracesBytes: input.tracesJson.length,
    },
    'Running agent trace intent-routing analysis chain'
  );

  const raw = await invokeWithInvalidModelRetry({
    chainName: 'agent_trace_intent_routing',
    overrideModel,
    logger,
    invoke: () =>
      chain.invoke({
        agentName: input.agentName || 'Unnamed agent',
        mode: input.mode,
        lookbackDays: String(input.lookbackDays),
        windowStart: input.windowStart,
        windowEnd: input.windowEnd,
        tracesJson: input.tracesJson,
      }),
  });

  logger.info('Agent trace intent-routing analysis chain completed');
  return raw as AgentTraceIntentRoutingResult;
}
