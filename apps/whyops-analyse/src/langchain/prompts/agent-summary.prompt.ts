import { ChatPromptTemplate } from '@langchain/core/prompts';

export const AGENT_SUMMARY_VERSION = 'v1.0';

// ---------------------------------------------------------------------------
// Segment extraction prompt — processes one or more prompt segments
// ---------------------------------------------------------------------------
export const agentSegmentExtractionPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an expert system prompt analyst. You extract structured information from AI agent system prompt segments.

Extract ALL relevant information from the provided segment(s). Be thorough — capture every capability, constraint, rule, and instruction. Do not summarize or omit details.

For each field, extract everything you find. If a field is not mentioned in the segment, return an empty array or null.

Key extraction targets:
- **Role**: Who is this agent? What persona does it have?
- **Domain**: What industry or field does it operate in?
- **Capabilities**: What specific actions can it perform? What can it do?
- **Constraints**: What must it NOT do? What are the restrictions?
- **Behavioral rules**: How should it respond? What tone, format, style?
- **Tool usage**: When should it use tools? Any specific patterns?
- **Target users**: Who is this agent built for?
- **Key instructions**: Critical behavior-defining instructions
- **Domain terms**: Important jargon, acronyms, or concepts

Return valid JSON only.`,
  ],
  [
    'user',
    `Extract structured information from this system prompt segment.

SEGMENT NAME: {segmentName}
SEGMENT CONTENT:
{segmentContent}`,
  ],
]);

// ---------------------------------------------------------------------------
// Synthesis prompt — merges multiple segment extractions into one summary
// ---------------------------------------------------------------------------
export const agentSummarySynthesisPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an expert system prompt analyst. You merge multiple extracted summaries into a single comprehensive agent summary.

Rules:
- Deduplicate items that say the same thing in different words
- Preserve ALL unique capabilities, constraints, and instructions — do not drop any
- Synthesize the role description into a clear, complete statement
- Identify the primary domain and any secondary domains
- Write a concise 2-3 sentence summary of the agent's purpose
- Keep domain terms that are essential for understanding the agent
- Return valid JSON only`,
  ],
  [
    'user',
    `Merge these extracted prompt summaries into a comprehensive agent summary.

AGENT NAME: {agentName}
NUMBER OF INPUTS: {segmentCount}

EXTRACTED SUMMARIES:
{extractions}

TOOL DEFINITIONS ({toolCount} tools):
{toolsSummary}

Produce the merged, deduplicated agent summary.`,
  ],
]);
