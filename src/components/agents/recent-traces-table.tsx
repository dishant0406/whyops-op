"use client";

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
import { getAgent } from "@/constants/mock-data";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Filter,
  Search,
  ListRestart
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import * as React from "react";

export function RecentTracesTable() {
  const router = useRouter();
  const params = useParams();
  const agentId = (params.agentId as string) || "1";
  const agent = getAgent(agentId);
  const [searchQuery, setSearchQuery] = React.useState("");

  if (!agent) return null;

  const filteredTraces = agent.traces.filter((trace) =>
    trace.id.toLowerCase().includes(searchQuery.toLowerCase())
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

      {filteredTraces.length === 0 ? (
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
                <TableHead className="px-6 py-3">TOKENS</TableHead>
                <TableHead className="px-6 py-3 text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTraces.map((trace) => (
                <TableRow 
                  key={trace.id} 
                  className="hover:bg-surface-2/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/agents/${agentId}/traces/${trace.id}`)}
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {trace.status === "success" && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                      {trace.status === "warning" && (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                      {trace.status === "error" && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="capitalize text-sm font-medium text-foreground">
                        {trace.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-mono text-sm text-primary">
                    {trace.id}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {trace.timestamp}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">
                    {trace.duration}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">
                    {trace.tokens}
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
