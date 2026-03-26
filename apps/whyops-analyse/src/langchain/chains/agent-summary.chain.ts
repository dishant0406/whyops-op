import { createServiceLogger } from '@whyops/shared/logger';
import { getJudgeModel, invokeWithInvalidModelRetry } from '../config';
import { agentSegmentExtractionPrompt, agentSummarySynthesisPrompt } from '../prompts';
import {
  AgentSegmentExtractionSchema,
  AgentSummarySchema,
  type AgentSegmentExtraction,
  type AgentSummary,
} from '../schemas/agent-summary.schema';
import type { PromptBlock } from '../utils/prompt-segmenter';

const logger = createServiceLogger('analyse:langchain:chain:agent-summary');
const SEGMENT_BATCH_CHAR_LIMIT = 12000;
const EXTRACTION_CONCURRENCY = 4;

export interface AgentSummaryInput {
  agentName: string;
  segments: PromptBlock[];
  toolsSummary: string;
  toolCount: number;
}

type SegmentBatch = { names: string[]; content: string };

function chunkSegment(segment: PromptBlock): SegmentBatch[] {
  const raw = segment.content.trim();
  const header = `--- ${segment.name} ---\n`;
  const maxContentChars = Math.max(2000, SEGMENT_BATCH_CHAR_LIMIT - header.length - 32);
  if (raw.length <= maxContentChars) {
    return [{ names: [segment.name], content: `${header}${raw}` }];
  }

  const lines = raw.split('\n');
  const chunks: SegmentBatch[] = [];
  let current = '';
  let index = 1;

  for (const line of lines) {
    const next = current ? `${current}\n${line}` : line;
    if (next.length > maxContentChars && current) {
      chunks.push({
        names: [`${segment.name}#${index}`],
        content: `${header}${current}`,
      });
      current = line;
      index += 1;
      continue;
    }
    current = next;
  }

  if (current) {
    chunks.push({
      names: [`${segment.name}#${index}`],
      content: `${header}${current}`,
    });
  }

  return chunks;
}

function buildBatches(segments: PromptBlock[]): SegmentBatch[] {
  const batches: SegmentBatch[] = [];
  let currentNames: string[] = [];
  let currentContent = '';

  for (const piece of segments.flatMap(chunkSegment)) {
    if (currentContent && currentContent.length + piece.content.length + 2 > SEGMENT_BATCH_CHAR_LIMIT) {
      batches.push({ names: currentNames, content: currentContent });
      currentNames = [];
      currentContent = '';
    }
    currentNames.push(...piece.names);
    currentContent = currentContent ? `${currentContent}\n\n${piece.content}` : piece.content;
  }

  if (currentContent) {
    batches.push({ names: currentNames, content: currentContent });
  }

  return batches;
}

async function extractBatch(
  batch: SegmentBatch,
  overrideModel?: string
): Promise<AgentSegmentExtraction> {
  const model = getJudgeModel(overrideModel);
  const structured = model.withStructuredOutput(AgentSegmentExtractionSchema);
  const chain = agentSegmentExtractionPrompt.pipe(structured);
  const raw = await invokeWithInvalidModelRetry({
    chainName: 'agent_segment_extraction',
    overrideModel,
    logger,
    invoke: () =>
      chain.invoke({
        segmentName: batch.names.join(', '),
        segmentContent: batch.content,
      }),
  });
  return raw as AgentSegmentExtraction;
}

async function synthesizeSummary(
  input: AgentSummaryInput,
  extractions: AgentSegmentExtraction[],
  overrideModel?: string
): Promise<AgentSummary> {
  const model = getJudgeModel(overrideModel);
  const structured = model.withStructuredOutput(AgentSummarySchema);
  const chain = agentSummarySynthesisPrompt.pipe(structured);
  const raw = await invokeWithInvalidModelRetry({
    chainName: 'agent_summary_synthesis',
    overrideModel,
    logger,
    invoke: () =>
      chain.invoke({
        agentName: input.agentName,
        segmentCount: String(extractions.length),
        extractions: JSON.stringify(extractions),
        toolsSummary: input.toolsSummary,
        toolCount: String(input.toolCount),
      }),
  });
  return raw as AgentSummary;
}

async function singlePassSummary(input: AgentSummaryInput, overrideModel?: string): Promise<AgentSummary> {
  const extraction = await extractBatch(
    {
      names: ['full_prompt'],
      content: input.segments.map((segment) => `--- ${segment.name} ---\n${segment.content}`).join('\n\n'),
    },
    overrideModel
  );
  return synthesizeSummary(input, [extraction], overrideModel);
}

export async function runAgentSummaryChain(input: AgentSummaryInput, overrideModel?: string): Promise<AgentSummary> {
  const totalChars = input.segments.reduce((sum, segment) => sum + segment.content.length, 0);
  logger.info({ agentName: input.agentName, segmentCount: input.segments.length, totalChars }, 'Starting agent summary extraction');

  if (totalChars <= SEGMENT_BATCH_CHAR_LIMIT) {
    return singlePassSummary(input, overrideModel);
  }

  const batches = buildBatches(input.segments);
  logger.info({ agentName: input.agentName, batchCount: batches.length }, 'Large prompt; using map-reduce extraction');
  const extractions: AgentSegmentExtraction[] = [];

  for (let i = 0; i < batches.length; i += EXTRACTION_CONCURRENCY) {
    const batchSlice = batches.slice(i, i + EXTRACTION_CONCURRENCY);
    const results = await Promise.allSettled(
      batchSlice.map((batch) => extractBatch(batch, overrideModel))
    );
    for (const result of results) {
      if (result.status === 'fulfilled') extractions.push(result.value);
      else logger.warn({ err: result.reason }, 'Segment extraction batch failed');
    }
  }

  if (extractions.length === 0) {
    throw new Error('All segment extractions failed');
  }

  const summary = await synthesizeSummary(input, extractions, overrideModel);
  logger.info({
    role: summary.role.slice(0, 100),
    primaryDomain: summary.primaryDomain,
    capabilities: summary.capabilities.length,
    constraints: summary.constraints.length,
  }, 'Agent summary extraction completed');
  return summary;
}
