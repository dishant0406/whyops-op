"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyStateSimple } from "@/components/ui/empty-state-simple";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Filter,
  ListRestart,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { useThreadsStore } from "@/stores/threadsStore";

interface RecentTracesTableProps {
  agentId: string;
}

export function RecentTracesTable({ agentId }: RecentTracesTableProps) {
  const router = useRouter();
  const { threads, isLoading, fetchThreads } = useThreadsStore();
  const [searchQuery, setSearchQuery] = React.useState("");

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Filter threads by agentId if needed
  const filteredThreads = threads.filter((thread) =>
    thread.threadId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="border-border/30 bg-card">
      <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Traces</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search trace ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 pl-9 pr-4"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : filteredThreads.length === 0 ? (
        <EmptyStateSimple
          title="No traces found"
          description={
            searchQuery
              ? `No traces matching "${searchQuery}"`
              : "This agent hasn't generated any traces yet. Run a test to see activity."
          }
          icon={ListRestart}
          action={
            !searchQuery && (
              <Button variant="outline" size="sm">
                Run Test Trace
              </Button>
            )
          }
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-2/50 hover:bg-surface-2/50">
                <TableHead className="px-6 py-3">STATUS</TableHead>
                <TableHead className="px-6 py-3">TRACE ID</TableHead>
                <TableHead className="px-6 py-3">TIMESTAMP</TableHead>
                <TableHead className="px-6 py-3">DURATION</TableHead>
                <TableHead className="px-6 py-3">EVENTS</TableHead>
                <TableHead className="px-6 py-3 text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredThreads.map((thread) => (
                <TableRow
                  key={thread.threadId}
                  className="hover:bg-surface-2/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/agents/${agentId}/traces/${thread.threadId}`)}
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="capitalize text-sm font-medium text-foreground">
                        Active
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-mono text-sm text-primary">
                    {thread.threadId.substring(0, 16)}...
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {thread.lastActivity ? formatTimestamp(thread.lastActivity) : "N/A"}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">
                    {thread.duration ? formatDuration(thread.duration) : "N/A"}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">
                    {thread.eventCount}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-muted-foreground hover:text-primary"
                    >
                      View <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-center border-t border-border/30 p-4">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              Load more traces
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}
