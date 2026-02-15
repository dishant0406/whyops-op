"use client";

import type { TraceDetail } from "@/stores/traceDetailStore";
import { useParams } from "next/navigation";

interface TraceTimelineProps {
  trace: TraceDetail;
}

export function TraceTimeline({ trace }: TraceTimelineProps) {
  if (!trace.events || trace.events.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No events in this trace</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-2">
        {trace.events.map((event, index) => (
          <div
            key={event.id}
            className="flex items-start gap-4 rounded-lg border border-border/30 bg-card p-3"
          >
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {event.stepId}
              </div>
              {index < trace.events.length - 1 && (
                <div className="h-full w-px bg-border/30" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  {getEventTypeLabel(event.eventType)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {event.timestamp ? formatTimestamp(event.timestamp) : "N/A"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {getEventDescription(event)}
              </p>
              {event.duration && (
                <p className="text-xs text-muted-foreground">
                  Duration: {formatDuration(event.duration)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getEventTypeLabel(eventType: string): string {
  switch (eventType) {
    case "user_message":
      return "User Message";
    case "llm_response":
      return "LLM Response";
    case "tool_call":
      return "Tool Call";
    case "tool_call_request":
      return "Tool Request";
    case "tool_call_response":
      return "Tool Response";
    case "error":
      return "Error";
    default:
      return eventType;
  }
}

function getEventDescription(event: any): string {
  if (event.content?.content) {
    const content = event.content.content;
    if (typeof content === "string") {
      return content.substring(0, 100) + (content.length > 100 ? "..." : "");
    }
  }
  if (event.metadata?.model) {
    return `Model: ${event.metadata.model}`;
  }
  return "No description available";
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}
