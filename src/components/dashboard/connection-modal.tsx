"use client";

import { useEffect } from "react";

import { InfoBox } from "@/components/onboarding/info-box";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { MacOSWindowContent, MacOSWindowHeader } from "@/components/ui/macos-window";
import { cn } from "@/lib/utils";
import { useConnectionStore } from "@/stores/connectionStore";
import { Info } from "lucide-react";

interface ConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectionModal({ open, onOpenChange }: ConnectionModalProps) {
  const {
    steps,
    logs,
    isTesting,
    isConnected,
    error,
    testConnection,
    reset,
  } = useConnectionStore();

  useEffect(() => {
    if (open && !isTesting && !isConnected) {
      testConnection();
    }
  }, [open, isTesting, isConnected, testConnection]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  // Determine overall status badge
  const getStatusBadge = () => {
    if (error) {
      return (
        <Badge className="shrink-0 bg-destructive/10 text-destructive">
          FAILED
        </Badge>
      );
    }
    if (isConnected) {
      return (
        <Badge className="shrink-0 bg-primary/10 text-primary">
          CONNECTED
        </Badge>
      );
    }
    return (
      <Badge className="shrink-0 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
        WAITING
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl border-border/50 bg-card p-0">
        <div className="space-y-6 p-6 pr-14">
          {/* Header */}
          <DialogHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {error ? "Connection Failed" : isConnected ? "Connection Established" : "Establishing Connection"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {error
                    ? "Could not connect to WhyOps cloud"
                    : isConnected
                    ? "Your agent is connected to WhyOps"
                    : "Connecting local agent to WhyOps cloud"}
                </p>
              </div>
              {getStatusBadge()}
            </div>
          </DialogHeader>

          {/* Connection Steps */}
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-3">
                {/* Status Icon */}
                <div className="mt-0.5">
                  {step.status === "success" ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                      <CheckIcon className="h-3 w-3 text-primary" />
                    </div>
                  ) : step.status === "loading" ? (
                    <div className="flex h-5 w-5 items-center justify-center">
                      <LoadingSpinner className="h-5 w-5 text-yellow-500" />
                    </div>
                  ) : step.status === "error" ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20">
                      <XIcon className="h-3 w-3 text-destructive" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Terminal Log */}
          <div className="overflow-hidden rounded-xl border border-border/50 bg-[oklch(0.15_0.02_180)]">
            <MacOSWindowHeader title="CONNECTION_LOG" />
            <MacOSWindowContent className="p-4 font-mono text-xs leading-relaxed">
              {logs.length === 0 ? (
                <div className="flex gap-2">
                  <span className="text-foreground/80">▂</span>
                </div>
              ) : (
                <>
                  {logs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-primary">[{log.time}]</span>
                      <span className="text-foreground/80">&gt; {log.message}</span>
                      {log.status && (
                        <span
                          className={cn(
                            "ml-auto",
                            log.status === "success" && "text-primary",
                            log.status === "connected" && "text-primary",
                            log.status === "error" && "text-destructive"
                          )}
                        >
                          {log.status === "success" && "✓"}
                          {log.status === "connected" && "✓"}
                          {log.status === "error" && "✗"}
                        </span>
                      )}
                    </div>
                  ))}
                  {isTesting && (
                    <div className="mt-1 flex gap-2">
                      <span className="text-foreground/80">▂</span>
                    </div>
                  )}
                </>
              )}
            </MacOSWindowContent>
          </div>

          {/* Info Message */}
          <InfoBox variant="info" icon={Info} title="">
            Ensure your agent is running and{" "}
            <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-xs text-primary">
              /agent/init
            </code>{" "}
            has been called in your application entry point.
          </InfoBox>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-border/50 bg-surface-2/50 px-6 py-4">
          <div className="flex w-full items-center justify-between">
            <Button
              variant="ghost"
              size="md"
              onClick={() => handleClose(false)}
            >
              {isConnected ? "Close" : "Cancel Connection"}
            </Button>
            {!isConnected && !error && (
              <Button
                variant="outline"
                size="md"
                onClick={testConnection}
                disabled={isTesting}
              >
                {isTesting ? "Testing..." : "Retry"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M13 4L6 11L3 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 4L4 12M4 4L12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
