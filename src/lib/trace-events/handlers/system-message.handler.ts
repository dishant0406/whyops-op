import type { EventHandler, CanvasNodeData, SidebarData, TimelineData } from "../types";
import type { TraceEvent } from "@/stores/traceDetailStore";

function extractSystemText(content: TraceEvent["content"]): { text: string; preview: string } {
  if (!content) {
    return { text: "", preview: "" };
  }

  if (typeof content === "string") {
    return {
      text: content,
      preview: content.length > 100 ? content.slice(0, 100) + "..." : content,
    };
  }

  if (Array.isArray(content)) {
    const systemMessages = content.filter((msg) => msg.role === "system");
    if (systemMessages.length > 0 && systemMessages[0].content) {
      const text = typeof systemMessages[0].content === "string"
        ? systemMessages[0].content
        : JSON.stringify(systemMessages[0].content);
      return {
        text,
        preview: text.length > 100 ? text.slice(0, 100) + "..." : text,
      };
    }
  }

  const text = JSON.stringify(content);
  return { text, preview: text.length > 100 ? text.slice(0, 100) + "..." : text };
}

export const SystemMessageHandler: EventHandler = {
  eventType: "system_message",

  nodeConfig: {
    nodeType: "start",
    label: "System",
    highlight: false,
  },

  getCanvasData(event: TraceEvent): CanvasNodeData {
    const { text, preview } = extractSystemText(event.content);

    return {
      label: this.nodeConfig.label,
      eventType: event.eventType,
      content: event.content,
      metadata: event.metadata,
      stepId: event.stepId,
      parentStepId: event.parentStepId ?? null,
      spanId: event.spanId ?? null,
      timestamp: event.timestamp,
      duration: event.duration ?? null,
      timeSinceStart: event.timeSinceStart ?? 0,
      isLateEvent: event.isLateEvent ?? false,
      contentText: text,
      contentPreview: preview,
      truncated: text.length > 200,
      nodeType: this.nodeConfig.nodeType,
      highlight: this.nodeConfig.highlight ?? false,
    };
  },

  getSidebarData(event: TraceEvent): SidebarData {
    const { text } = extractSystemText(event.content);

    return {
      title: "System Message",
      subtitle: `Step ${event.stepId} • ${new Date(event.timestamp).toLocaleTimeString()}`,
      sections: [
        {
          title: "System Prompt",
          type: "text",
          content: text,
          collapsible: text.length > 500,
          defaultOpen: true,
        },
        {
          title: "Raw Content",
          type: "json",
          content: event.content as Record<string, unknown>,
          collapsible: true,
          defaultOpen: false,
        },
        {
          title: "Metadata",
          type: "json",
          content: (event.metadata as Record<string, unknown>) || {},
          collapsible: true,
          defaultOpen: false,
        },
      ],
    };
  },

  getTimelineData(event: TraceEvent): TimelineData {
    const { preview } = extractSystemText(event.content);

    return {
      title: "System Message",
      description: preview || "System configuration",
      icon: "settings",
      status: "completed",
      timestamp: event.timestamp,
      duration: event.duration ?? undefined,
      metadata: event.metadata,
    };
  },
};
