import { createServiceLogger } from '@whyops/shared/logger';
import { getJudgeModel, invokeWithInvalidModelRetry } from '../config';
import { agentOverviewAnalysisPrompt } from '../prompts/agent-overview-analysis.prompt';
import {
  AgentOverviewAnalysisResultSchema,
  type AgentOverviewAnalysisResult,
} from '../schemas/agent-overview-analysis.schema';

const logger = createServiceLogger('analyse:langchain:chain:agent-overview-analysis');

export interface AgentOverviewAnalysisInput {
  agentName: string;
  mode: 'quick' | 'standard' | 'deep';
  lookbackDays: number;
  windowStart: string;
  windowEnd: string;
  overviewJson: string;
  evidenceJson: string;
}

export async function runAgentOverviewAnalysisChain(
  input: AgentOverviewAnalysisInput,
  overrideModel?: string
): Promise<AgentOverviewAnalysisResult> {
  const model = getJudgeModel(overrideModel);
  const structured = model.withStructuredOutput(AgentOverviewAnalysisResultSchema);
  const chain = agentOverviewAnalysisPrompt.pipe(structured);

  logger.info(
    {
      mode: input.mode,
      lookbackDays: input.lookbackDays,
      evidenceBytes: input.evidenceJson.length,
      overviewBytes: input.overviewJson.length,
    },
    'Running agent overview analysis chain'
  );

  const raw = await invokeWithInvalidModelRetry({
    chainName: 'agent_overview_analysis',
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
        evidenceJson: input.evidenceJson,
      }),
  });

  logger.info('Agent overview analysis chain completed');
  return raw as AgentOverviewAnalysisResult;
}
