"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyStateSimple } from "@/components/ui/empty-state-simple";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Agent } from "@/stores/agentsStore";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Database,
  Inbox,
  MessageSquare,
  MoreHorizontal,
  Search,
  Search as SearchIcon,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

interface AgentsTableProps {
  agents?: Agent[];
}

const AGENTS_TABLE_TEXT = {
  title: "Agents List",
  searchPlaceholder: "Search agents...",
  sortPlaceholder: "Sort by",
  sortOptions: [
    { value: "last-7-days", label: "Last 7 days" },
    { value: "last-30-days", label: "Last 30 days" },
    { value: "all-time", label: "All time" },
  ],
  columns: ["Name", "Status", "Traces", "Success", "Last Active", "Actions"],
  actionColumn: "Actions",
  actionLabel: "More options",
  countLabel: (filtered: number, total: number) =>
    `Showing ${filtered} of ${total} agents`,
};

function AgentIcon({ type }: { type?: string }) {
  switch (type) {
    case "user":
      return <User className="h-5 w-5 text-foreground/60" />;
    case "message":
      return <MessageSquare className="h-5 w-5 text-foreground/60" />;
    case "database":
      return <Database className="h-5 w-5 text-foreground/60" />;
    case "search":
      return <SearchIcon className="h-5 w-5 text-foreground/60" />;
    case "credit-card":
      return <CreditCard className="h-5 w-5 text-foreground/60" />;
    default:
      return <User className="h-5 w-5 text-foreground/60" />;
  }
}

function MoreIcon() {
  return <MoreHorizontal className="h-4 w-4" />;
}

function formatLastActive(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AgentsTable({ agents = [] }: AgentsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState(
    AGENTS_TABLE_TEXT.sortOptions[0]?.value ?? ""
  );

  const router = useRouter();

  const filteredAgents = agents.filter((agent: Agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="border-border/30 bg-card">
      {/* Header */}
      <div className="border-b border-border/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {AGENTS_TABLE_TEXT.title}
          </h2>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={AGENTS_TABLE_TEXT.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-64 pl-9 pr-4"
              />
            </div>
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue
                  placeholder={AGENTS_TABLE_TEXT.sortPlaceholder}
                />
              </SelectTrigger>
              <SelectContent>
                {AGENTS_TABLE_TEXT.sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredAgents.length === 0 ? (
        <EmptyStateSimple
          title="No agents found"
          description={
            searchQuery
              ? `No agents matching "${searchQuery}"`
              : "No agents deployed yet. Create your first agent to get started."
          }
          icon={Inbox}
          action={
            !searchQuery && (
              <Button variant="outline" size="sm">
                Create Agent
              </Button>
            )
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-2/50">
              {AGENTS_TABLE_TEXT.columns.map((column) => (
                <TableHead
                  key={column}
                  className={cn(
                    "px-6 py-3",
                    column === AGENTS_TABLE_TEXT.actionColumn && "text-right"
                  )}
                >
                  {column === AGENTS_TABLE_TEXT.actionColumn ? (
                    <span className="sr-only">{column}</span>
                  ) : (
                    column
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.map((agent: Agent) => (
              <TableRow
                key={agent.id}
                className="hover:bg-surface-2/50 cursor-pointer transition-colors"
                onClick={() => router.push(`/agents/${agent.id}`)}
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2">
                      <AgentIcon type={agent.metadata?.icon as string | undefined} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {agent.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {agent.versionHash?.substring(0, 8) || "v1.0.0"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge
                    className={cn(
                      "font-medium",
                      agent.status === "active" && "bg-primary/20 text-primary",
                      agent.status === "inactive" && "bg-muted/30 text-muted-foreground"
                    )}
                  >
                    {agent.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-foreground">
                  {agent.tracesCount.toLocaleString()}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      agent.successRate >= 95
                        ? "text-primary"
                        : agent.successRate >= 85
                        ? "text-accent-foreground"
                        : "text-destructive"
                    )}
                  >
                    {agent.successRate}%
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {formatLastActive(agent.lastActive)}
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <button
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={AGENTS_TABLE_TEXT.actionLabel}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreIcon />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Footer */}
      {filteredAgents.length > 0 && (
        <div className="flex items-center justify-between border-t border-border/30 px-6 py-4">
          <p className="text-xs text-muted-foreground">
            {AGENTS_TABLE_TEXT.countLabel(
              filteredAgents.length,
              agents.length
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
