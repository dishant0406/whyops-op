"use client";

import {
  DecisionNode,
  EndNode,
  RejectedNode,
  StartNode,
  ToolCallNode,
  UserInputNode,
} from "@/components/traces/custom-nodes";
import { getTrace, getTraceEdges, getTraceNodes } from "@/constants/mock-data";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import {
  Background,
  Controls,
  Edge,
  MarkerType,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

const nodeTypes = {
  start: StartNode,
  userInput: UserInputNode,
  decision: DecisionNode,
  toolCall: ToolCallNode,
  rejected: RejectedNode,
  end: EndNode,
};

// Custom edges style
const defaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "var(--muted-foreground)",
  },
  style: {
    strokeWidth: 2,
    stroke: "var(--muted-foreground)",
  },
  animated: false,
};

export function TraceCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const params = useParams();
  const agentId = (params.agentId as string) || "1";
  const traceId = (params.traceId as string) || "tr_abc123";

  useEffect(() => {
    const trace = getTrace(agentId, traceId);
    if (trace) {
      setNodes(getTraceNodes(trace));
      setEdges(getTraceEdges(trace));
    }
  }, [agentId, traceId, setNodes, setEdges]);

  return (
    <div className="h-full w-full bg-surface-2/10">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        attributionPosition="bottom-right"
        className="bg-background"
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="var(--border)" gap={20} size={1} />
        <Controls className="bg-surface-2 border-border/50 text-foreground fill-foreground" />
      </ReactFlow>
      
      <div className="absolute bottom-4 right-16 rounded bg-surface-2/50 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm border border-border/20">
        Canvas: 100%
      </div>
    </div>
  );
}
