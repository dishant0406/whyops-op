import { createServiceLogger } from '@whyops/shared/logger';
import { getJudgeModel, invokeWithInvalidModelRetry } from '../config';
import { agentSynthesisPrompt } from '../prompts/agent-synthesis.prompt';
import { AgentSynthesisResultSchema, type AgentSynthesisResult } from '../schemas/agent-synthesis.schema';

const logger = createServiceLogger('analyse:langchain:chain:agent-synthesis');

export interface AgentSynthesisInput {
  agentName: string;
  mode: 'quick' | 'standard' | 'deep';
  lookbackDays: number;
  windowStart: string;
  windowEnd: string;
  overviewJson: string;
  toolSignalsJson: string;
  qualitySignalsJson: string;
  dimensionResultsJson: string;
  issuesJson: string;
}

export async function runAgentSynthesisChain(
  input: AgentSynthesisInput,
  overrideModel?: string
): Promise<AgentSynthesisResult> {
  const model = getJudgeModel(overrideModel);
  const structured = model.withStructuredOutput(AgentSynthesisResultSchema);
  const chain = agentSynthesisPrompt.pipe(structured);

  logger.info(
    {
      mode: input.mode,
      dimensionBytes: input.dimensionResultsJson.length,
      issuesBytes: input.issuesJson.length,
    },
    'Running agent synthesis chain'
  );

  const raw = await invokeWithInvalidModelRetry({
    chainName: 'agent_synthesis',
    overrideModel,
    logger,
    invoke: () =>
      chain.invoke({
        agentName: input.agentName || 'Unnamed agent',
        mode: input.mode,
        lookbackDays: String(input.lookbackDays),
        windowStart: input.windowStart,
        windowEnd: input.windowEnd,
        overviewJson: input.overviewJson,
        toolSignalsJson: input.toolSignalsJson,
        qualitySignalsJson: input.qualitySignalsJson,
        dimensionResultsJson: input.dimensionResultsJson,
        issuesJson: input.issuesJson,
      }),
  });

  logger.info('Agent synthesis chain completed');
  return raw as AgentSynthesisResult;
}
