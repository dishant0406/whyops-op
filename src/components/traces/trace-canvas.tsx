"use client";

import { useMemo } from "react";

import {
  DecisionNode,
  EndNode,
  RejectedNode,
  StartNode,
  ToolCallNode,
  UserInputNode,
} from "@/components/traces/custom-nodes";
import type { TraceDetail } from "@/stores/traceDetailStore";
import { Edge, MarkerType, Node, ReactFlow } from "reactflow";
import {
  Background,
  Controls,
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
  type: "smoothstep" as const,
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

interface TraceCanvasProps {
  trace: TraceDetail;
}

export function TraceCanvas({ trace }: TraceCanvasProps) {
  const { nodes, edges } = useMemo(() => {
    return convertTraceToNodesAndEdges(trace);
  }, [trace]);

  return (
    <div className="h-full w-full bg-surface-2/10">
      <ReactFlow
        nodes={nodes}
        edges={edges}
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

function convertTraceToNodesAndEdges(trace: TraceDetail): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (!trace.events || trace.events.length === 0) {
    return { nodes, edges };
  }

  // Add start node
  nodes.push({
    id: "start",
    type: "start",
    position: { x: 250, y: 0 },
    data: { label: "Start" },
  });

  // Convert events to nodes
  trace.events.forEach((event, index) => {
    let nodeType = "default";
    let label = event.eventType;

    switch (event.eventType) {
      case "user_message":
        nodeType = "userInput";
        label = "User Input";
        break;
      case "llm_response":
        nodeType = "decision";
        label = "LLM Response";
        break;
      case "tool_call":
      case "tool_call_request":
        nodeType = "toolCall";
        label = "Tool Call";
        break;
      case "tool_call_response":
        nodeType = "toolCall";
        label = "Tool Result";
        break;
      case "error":
        nodeType = "rejected";
        label = "Error";
        break;
      default:
        nodeType = "default";
    }

    const yPosition = 100 + index * 150;

    nodes.push({
      id: event.id,
      type: nodeType,
      position: { x: 250, y: yPosition },
      data: {
        label,
        eventType: event.eventType,
        content: event.content,
        metadata: event.metadata,
        stepId: event.stepId,
        timestamp: event.timestamp,
        duration: event.duration,
      },
    });

    // Create edge from previous node
    if (index === 0) {
      edges.push({
        id: "e-start-0",
        source: "start",
        target: event.id,
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--muted-foreground)",
        },
        style: {
          strokeWidth: 2,
          stroke: "var(--muted-foreground)",
        },
      });
    } else {
      const prevEvent = trace.events[index - 1];
      edges.push({
        id: `e-${prevEvent.id}-${event.id}`,
        source: prevEvent.id,
        target: event.id,
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--muted-foreground)",
        },
        style: {
          strokeWidth: 2,
          stroke: "var(--muted-foreground)",
        },
      });
    }
  });

  // Add end node
  const lastEvent = trace.events[trace.events.length - 1];
  if (lastEvent) {
    nodes.push({
      id: "end",
      type: "end",
      position: { x: 250, y: 100 + trace.events.length * 150 },
      data: { label: "End" },
    });

    edges.push({
      id: `e-${lastEvent.id}-end`,
      source: lastEvent.id,
      target: "end",
      type: "smoothstep",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "var(--muted-foreground)",
      },
      style: {
        strokeWidth: 2,
        stroke: "var(--muted-foreground)",
      },
    });
  }

  return { nodes, edges };
}
