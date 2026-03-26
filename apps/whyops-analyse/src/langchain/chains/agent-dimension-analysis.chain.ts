import { createServiceLogger } from '@whyops/shared/logger';
import { getJudgeModel, invokeWithInvalidModelRetry } from '../config';
import { agentDimensionAnalysisPrompt } from '../prompts/agent-dimension-analysis.prompt';
import {
  AgentDimensionAnalysisResultSchema,
  type AgentDimensionAnalysisResult,
  type AgentJudgeDimension,
} from '../schemas/agent-dimension-analysis.schema';

const logger = createServiceLogger('analyse:langchain:chain:agent-dimension-analysis');

export interface AgentDimensionAnalysisInput {
  dimension: AgentJudgeDimension;
  rubric: string;
  agentName: string;
  mode: 'quick' | 'standard' | 'deep';
  lookbackDays: number;
  windowStart: string;
  windowEnd: string;
  overviewJson: string;
  evidenceJson: string;
}

export async function runAgentDimensionAnalysisChain(
  input: AgentDimensionAnalysisInput,
  overrideModel?: string
): Promise<AgentDimensionAnalysisResult> {
  const model = getJudgeModel(overrideModel);
  const structured = model.withStructuredOutput(AgentDimensionAnalysisResultSchema);
  const chain = agentDimensionAnalysisPrompt.pipe(structured);

  logger.info(
    {
      dimension: input.dimension,
      mode: input.mode,
      evidenceBytes: input.evidenceJson.length,
    },
    'Running agent dimension analysis chain'
  );

  const raw = await invokeWithInvalidModelRetry({
    chainName: `agent_dimension_${input.dimension}`,
    overrideModel,
    logger,
    invoke: () =>
      chain.invoke({
        dimension: input.dimension,
        rubric: input.rubric,
        agentName: input.agentName || 'Unnamed agent',
        mode: input.mode,
        lookbackDays: String(input.lookbackDays),
        windowStart: input.windowStart,
        windowEnd: input.windowEnd,
        overviewJson: input.overviewJson,
        evidenceJson: input.evidenceJson,
      }),
  });

  logger.info({ dimension: input.dimension }, 'Agent dimension analysis chain completed');
  return raw as AgentDimensionAnalysisResult;
}
