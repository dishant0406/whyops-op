import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { JsonViewer } from "@/components/ui/json-viewer";
import { formatCostUsd } from "@/lib/trace-cost";
import { formatDuration } from "@/lib/trace-format";
import { cn } from "@/lib/utils";
import {
  Brain,
  CheckCircle,
  Code2,
  Sparkles,
  StopCircle,
  Terminal,
  User,
  XCircle,
} from "lucide-react";
import { type ReactNode } from "react";
import { Handle, type NodeProps, Position } from "reactflow";

const NODE_CARD_CLASS =
  "relative rounded-xl border border-border/80 bg-card/95 p-0 shadow-sm transition-colors";
const NODE_HEADER_CLASS = "flex items-center gap-2 border-b border-border/70 px-3 py-2";
const NODE_TITLE_CLASS = "text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground";
const META_BADGE_CLASS = "h-4 rounded border border-border bg-surface-2 px-1 text-[9px] text-muted-foreground";
const PREVIEW_TEXT_CLASS =
  "min-h-10 max-h-20 overflow-hidden text-xs leading-5 text-muted-foreground break-words [overflow-wrap:anywhere]";

function toJsonValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return "";
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getLatencyLabel(data: NodeProps["data"]): string {
  const latencyValue = data.metadata?.latencyMs ?? data.metadataSummary?.latency ?? null;
  return typeof latencyValue === "number" ? formatDuration(latencyValue) : latencyValue || "";
}

function buildPreviewText(value: string): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (!compact) {
    return "No payload available.";
  }
  return compact.length > 110 ? `${compact.slice(0, 110)}…` : compact;
}

interface EventNodeShellProps {
  widthClass: string;
  header: ReactNode;
  body: ReactNode;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
  sourceHandleClassName?: string;
  targetHandleClassName?: string;
}

function EventNodeShell({
  widthClass,
  header,
  body,
  showSourceHandle = true,
  showTargetHandle = true,
  sourceHandleClassName,
  targetHandleClassName,
}: EventNodeShellProps) {
  return (
    <div className={cn(NODE_CARD_CLASS, widthClass)}>
      {showTargetHandle && (
        <Handle type="target" position={Position.Top} className={targetHandleClassName} />
      )}
      {header}
      {body}
      {showSourceHandle && (
        <Handle type="source" position={Position.Bottom} className={sourceHandleClassName} />
      )}
    </div>
  );
}

interface EventNodeHeaderProps {
  icon: ReactNode;
  title: string;
  rightSlot?: ReactNode;
  className?: string;
  titleClassName?: string;
}

function EventNodeHeader({
  icon,
  title,
  rightSlot,
  className,
  titleClassName,
}: EventNodeHeaderProps) {
  return (
    <div className={cn(NODE_HEADER_CLASS, className)}>
      {icon}
      <span className={cn(NODE_TITLE_CLASS, titleClassName)}>{title}</span>
      {rightSlot ? <div className="ml-auto flex items-center gap-1">{rightSlot}</div> : null}
    </div>
  );
}

interface JsonPayloadDialogButtonProps {
  value: string;
  title: string;
  description: string;
}

function JsonPayloadDialogButton({ value, title, description }: JsonPayloadDialogButtonProps) {
  const hasPayload = value.trim().length > 0;
  if (!hasPayload) {
    return <span className="text-[10px] text-muted-foreground">No JSON</span>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="nodrag inline-flex h-7 items-center gap-1.5 rounded-md border border-border/70 bg-surface-2/70 px-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Code2 className="h-3 w-3" />
          View JSON
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] gap-0 max-w-3xl overflow-hidden border-border/70 bg-card p-0">
        <DialogHeader className="border-b border-border/70 px-5 py-4">
          <DialogTitle className="break-words text-sm font-semibold text-foreground [overflow-wrap:anywhere]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[65vh] overflow-auto p-4">
          <JsonViewer value={value} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface JsonPreviewSectionProps {
  jsonValue: string;
  dialogTitle: string;
  dialogDescription: string;
  footer?: ReactNode;
  topContent?: ReactNode;
}

function JsonPreviewSection({
  jsonValue,
  dialogTitle,
  dialogDescription,
  footer,
  topContent,
}: JsonPreviewSectionProps) {
  return (
    <div className="space-y-3 px-3 py-3">
      {topContent}
      <p className={PREVIEW_TEXT_CLASS}>{buildPreviewText(jsonValue)}</p>
      <div className={cn("flex items-center gap-2", footer ? "justify-between" : "justify-end")}>
        {footer ? <div className="min-w-0 text-[10px] text-muted-foreground">{footer}</div> : null}
        <JsonPayloadDialogButton
          value={jsonValue}
          title={dialogTitle}
          description={dialogDescription}
        />
      </div>
    </div>
  );
}

interface JsonEventNodeProps {
  widthClass: string;
  icon: ReactNode;
  title: string;
  jsonValue: string;
  dialogTitle: string;
  dialogDescription: string;
  rightSlot?: ReactNode;
  footer?: ReactNode;
  topContent?: ReactNode;
  headerClassName?: string;
  titleClassName?: string;
  showSourceHandle?: boolean;
}

function JsonEventNode({
  widthClass,
  icon,
  title,
  jsonValue,
  dialogTitle,
  dialogDescription,
  rightSlot,
  footer,
  topContent,
  headerClassName,
  titleClassName,
  showSourceHandle = true,
}: JsonEventNodeProps) {
  return (
    <EventNodeShell
      widthClass={widthClass}
      showSourceHandle={showSourceHandle}
      header={
        <EventNodeHeader
          icon={icon}
          title={title}
          rightSlot={rightSlot}
          className={headerClassName}
          titleClassName={titleClassName}
        />
      }
      body={(
        <JsonPreviewSection
          jsonValue={jsonValue}
          dialogTitle={dialogTitle}
          dialogDescription={dialogDescription}
          footer={footer}
          topContent={topContent}
        />
      )}
    />
  );
}

// Start Node
export function StartNode() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-10 w-24 items-center justify-center rounded-full border-2 border-primary/50 bg-background ">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">START</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary/50" />
    </div>
  );
}

// User Input Node - for user_message events
export function UserInputNode({ data }: NodeProps) {
  const content = data.contentText || data.content?.text || data.value || "";
  const jsonValue = toJsonValue(content);
  const rightSlot = data.timeSinceStart !== undefined
    ? <span className="text-[10px] text-muted-foreground">{data.timeSinceStart}ms</span>
    : undefined;

  return (
    <JsonEventNode
      widthClass="w-64"
      icon={<User className="h-3.5 w-3.5 text-primary" />}
      title="User Input"
      rightSlot={rightSlot}
      jsonValue={jsonValue}
      dialogTitle="User Input Payload"
      dialogDescription="Raw event payload for this user input node."
    />
  );
}

// LLM Response Node - for llm_response events
export function LLMResponseNode({ data }: NodeProps) {
  const content = data.contentText || data.content?.text || data.value || "";
  const jsonValue = toJsonValue(content);
  const model = data.metadata?.model || data.metadataSummary?.model || "";
  const latency = getLatencyLabel(data);
  const costUsd = typeof data.metadata?.costUsd === "number"
    ? data.metadata.costUsd
    : (typeof data.metadataSummary?.costUsd === "number" ? data.metadataSummary.costUsd : null);
  const formattedCost = costUsd !== null ? formatCostUsd(costUsd) : null;
  const rightSlot = (
    <>
      {latency ? <Badge className={META_BADGE_CLASS}>{latency}</Badge> : null}
      {formattedCost ? <Badge className={META_BADGE_CLASS}>{formattedCost}</Badge> : null}
    </>
  );
  const footer = model
    ? (
      <span className="inline-flex max-w-[9rem] items-center gap-1 truncate">
        <Sparkles className="h-3 w-3 shrink-0" />
        <span className="truncate">{model}</span>
      </span>
      )
    : undefined;

  return (
    <JsonEventNode
      widthClass="w-72"
      icon={<Brain className="h-3.5 w-3.5 text-primary" />}
      title="LLM Response"
      rightSlot={rightSlot}
      jsonValue={jsonValue}
      dialogTitle="LLM Response Payload"
      dialogDescription="Complete raw payload returned by the model for this response event."
      footer={footer}
    />
  );
}

function getToolCallName(data: NodeProps["data"]): string {
  let toolName = data.contentPreview
    || data.metadata?.tool
    || data.content?.name
    || data.name
    || "";

  if (!toolName && typeof data.contentText === "string") {
    const nameMatch = data.contentText.match(/^([^(\s]+)\s*\(/);
    toolName = nameMatch ? nameMatch[1] : data.contentText;
  }

  return toolName || "Unknown Tool";
}

function getToolCallArguments(data: NodeProps["data"]): unknown {
  let argumentsValue = data.content?.arguments || data.input;

  if (!argumentsValue && typeof data.content === "string") {
    try {
      argumentsValue = JSON.parse(data.content);
    } catch {
      argumentsValue = data.content;
    }
  } else if (!argumentsValue && data.content && typeof data.content === "object") {
    argumentsValue = data.content;
  }

  return argumentsValue;
}

// Tool Call Node - for tool_call events
export function ToolCallNode({ data }: NodeProps) {
  const toolName = getToolCallName(data);
  const argumentsValue = getToolCallArguments(data);
  const jsonValue = argumentsValue ? toJsonValue(argumentsValue) : "";
  const rightSlot = data.duration
    ? <span className="text-[10px] text-muted-foreground">{formatDuration(data.duration)}</span>
    : undefined;

  return (
    <JsonEventNode
      widthClass="w-72"
      icon={<Terminal className="h-3.5 w-3.5 text-warning" />}
      title="Tool Call"
      rightSlot={rightSlot}
      jsonValue={jsonValue}
      dialogTitle={`${toolName} Arguments`}
      dialogDescription="Parsed arguments payload sent to this tool call."
      topContent={(
        <div className="font-mono text-xs font-semibold text-foreground break-words [overflow-wrap:anywhere]">
          {toolName}
        </div>
      )}
    />
  );
}

// Tool Result Node - for tool_call_response events
export function ToolResultNode({ data }: NodeProps) {
  const content = data.contentText || data.contentPreview || data.content?.text || data.content?.result || "";
  const jsonValue = toJsonValue(content);
  const rightSlot = data.duration
    ? <span className="text-[10px] text-muted-foreground">{formatDuration(data.duration)}</span>
    : undefined;

  return (
    <JsonEventNode
      widthClass="w-72"
      icon={<CheckCircle className="h-3.5 w-3.5 text-primary" />}
      title="Tool Result"
      rightSlot={rightSlot}
      jsonValue={jsonValue}
      dialogTitle="Tool Result Payload"
      dialogDescription="Raw result payload returned by this tool execution."
    />
  );
}

// Error Node - for error events
export function ErrorNode({ data }: NodeProps) {
  const content = data.contentText || data.content?.error || data.value || "";
  const jsonValue = toJsonValue(content);

  return (
    <JsonEventNode
      widthClass="w-64"
      icon={<XCircle className="h-3.5 w-3.5 text-destructive" />}
      title="Error"
      titleClassName="text-destructive"
      headerClassName="border-destructive/20 bg-destructive/5"
      jsonValue={jsonValue}
      dialogTitle="Error Payload"
      dialogDescription="Error details captured for this event."
      showSourceHandle={false}
    />
  );
}

// Decision Node (legacy alias for LLM Response) - reuses LLMResponseNode styling
export function DecisionNode({ data }: NodeProps) {
  const content = data.contentText || data.content?.text || data.value || "";
  const jsonValue = toJsonValue(content);
  const model = data.metadata?.model || data.metadataSummary?.model || "";
  const latency = getLatencyLabel(data);
  const rightSlot = latency ? <Badge className={META_BADGE_CLASS}>{latency}</Badge> : undefined;
  const footer = model
    ? (
      <span className="inline-flex max-w-[9rem] items-center gap-1 truncate">
        <Sparkles className="h-3 w-3 shrink-0" />
        <span className="truncate">{model}</span>
      </span>
      )
    : undefined;

  return (
    <JsonEventNode
      widthClass="w-72"
      icon={<Brain className="h-3.5 w-3.5 text-primary" />}
      title="Decision"
      rightSlot={rightSlot}
      jsonValue={jsonValue}
      dialogTitle="Decision Payload"
      dialogDescription="Full payload used to render this decision event."
      footer={footer}
    />
  );
}

// Rejected Node - reuses ErrorNode styling
export function RejectedNode({ data }: NodeProps) {
  const content = data.contentText || data.content?.error || data.value || "";
  const jsonValue = toJsonValue(content);

  return (
    <JsonEventNode
      widthClass="w-64"
      icon={<XCircle className="h-3.5 w-3.5 text-destructive" />}
      title="Rejected"
      titleClassName="text-destructive"
      headerClassName="border-destructive/20 bg-destructive/5"
      jsonValue={jsonValue}
      dialogTitle="Rejected Payload"
      dialogDescription="Raw data for the rejected/error outcome."
      showSourceHandle={false}
    />
  );
}

// End Node
export function EndNode() {
  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Top} />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary ">
        <StopCircle className="h-6 w-6 fill-current text-primary-foreground" />
      </div>
      <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">End</span>
    </div>
  );
}
