import { createServiceLogger } from '@whyops/shared/logger';
import { getJudgeModel, invokeWithInvalidModelRetry } from '../config';
import { agentSectionInsightsPrompt } from '../prompts/agent-section-insights.prompt';
import {
  AgentSectionInsightsResultSchema,
  type AgentSectionInsightsResult,
} from '../schemas/agent-section-insights.schema';

const logger = createServiceLogger('analyse:langchain:chain:agent-section-insights');

export interface AgentSectionInsightsInput {
  agentName: string;
  mode: 'quick' | 'standard' | 'deep';
  lookbackDays: number;
  windowStart: string;
  windowEnd: string;
  overviewJson: string;
  queryIntelligenceJson: string;
  followupIntelligenceJson: string;
  qualityIntelligenceJson: string;
  dimensionScoresJson: string;
}

export async function runAgentSectionInsightsChain(
  input: AgentSectionInsightsInput,
  overrideModel?: string
): Promise<AgentSectionInsightsResult> {
  const model = getJudgeModel(overrideModel);
  const structured = model.withStructuredOutput(AgentSectionInsightsResultSchema);
  const chain = agentSectionInsightsPrompt.pipe(structured);

  logger.info(
    {
      mode: input.mode,
      queryBytes: input.queryIntelligenceJson.length,
      followupBytes: input.followupIntelligenceJson.length,
      qualityBytes: input.qualityIntelligenceJson.length,
    },
    'Running agent section insights chain'
  );

  const raw = await invokeWithInvalidModelRetry({
    chainName: 'agent_section_insights',
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
        queryIntelligenceJson: input.queryIntelligenceJson,
        followupIntelligenceJson: input.followupIntelligenceJson,
        qualityIntelligenceJson: input.qualityIntelligenceJson,
        dimensionScoresJson: input.dimensionScoresJson,
      }),
  });

  logger.info('Agent section insights chain completed');
  return raw as AgentSectionInsightsResult;
}
