import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Brain, Play, User, Terminal, XCircle, StopCircle, CheckCircle } from "lucide-react";
import { Handle, Position, NodeProps } from "reactflow";

// Start Node
export function StartNode({ data }: NodeProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-10 w-24 items-center justify-center rounded-full border-2 border-primary/50 bg-background shadow-[0_0_15px_rgba(24,199,165,0.3)]">
        <span className="text-xs font-bold uppercase text-primary tracking-widest">START</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary/50" />
    </div>
  );
}

// User Input Node
export function UserInputNode({ data }: NodeProps) {
  return (
    <div className="relative w-64 rounded-lg border border-border bg-card p-0 shadow-lg transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
      <Handle type="target" position={Position.Top} className="!bg-border" />
      <div className="flex items-center gap-2 border-b border-border/50 bg-surface-2/30 px-3 py-2">
        <User className="h-3.5 w-3.5 text-blue-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">User Input</span>
      </div>
      <div className="p-4">
        <div className="font-mono text-sm text-foreground">
          {data.value}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary/50" />
    </div>
  );
}

// Decision Node
export function DecisionNode({ data }: NodeProps) {
  return (
    <div className="relative w-64 rounded-lg border border-purple-500/30 bg-card p-0 shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all hover:border-purple-500/60">
      <Handle type="target" position={Position.Top} className="!bg-border" />
      <div className="flex items-center justify-between border-b border-purple-500/20 bg-purple-500/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Decision</span>
        </div>
        {data.badge && (
          <Badge className="h-4 rounded border border-purple-500/30 bg-purple-500/20 px-1 text-[9px] text-purple-300 hover:bg-purple-500/30">
            {data.badge}
          </Badge>
        )}
      </div>
      <div className="p-4">
        <div className="font-medium text-sm text-foreground">
          {data.value}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500/50" />
    </div>
  );
}

// Tool Call Node
export function ToolCallNode({ data }: NodeProps) {
  return (
    <div className="relative w-64 rounded-lg border-2 border-primary bg-card p-0 shadow-[0_0_20px_rgba(24,199,165,0.15)] ring-offset-background transition-all">
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="flex items-center justify-between border-b border-border/50 bg-primary/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Tool Call</span>
        </div>
        <Badge className="h-4 rounded bg-primary text-[9px] text-primary-foreground hover:bg-primary/90">
          ACTIVE
        </Badge>
      </div>
      <div className="p-4 space-y-2">
        <div className="font-mono text-sm font-bold text-foreground">
          {data.name}
        </div>
        <div className="rounded bg-surface-2 p-2 font-mono text-xs text-muted-foreground break-all">
          {data.input}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
}

// Rejected Node
export function RejectedNode({ data }: NodeProps) {
  return (
    <div className="relative w-48 rounded-lg border border-dashed border-border/50 bg-card/50 p-0 opacity-60 hover:opacity-100 transition-opacity">
      <Handle type="target" position={Position.Top} className="!bg-border" />
      <div className="flex items-center gap-2 border-b border-border/30 bg-surface-2/10 px-3 py-2">
        <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rejected</span>
      </div>
      <div className="p-3">
        <div className="font-mono text-xs text-muted-foreground line-through">
          {data.name}
        </div>
      </div>
    </div>
  );
}

// End Node
export function EndNode({ data }: NodeProps) {
  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Top} className="!bg-primary/50" />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-[0_0_15px_rgba(24,199,165,0.5)]">
        <StopCircle className="h-6 w-6 text-primary-foreground fill-current" />
      </div>
    </div>
  );
}
