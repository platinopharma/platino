"use client";
import React from "react";
import { AlertTriangle, FolderOpen, Loader2, RefreshCw } from "lucide-react";
import { Btn, Card } from "@/features/live/ui";

export interface TableLoadingSkeletonProps {
  rows?: number;
  colSpan: number;
}

export function TableLoadingSkeleton({ rows = 5, colSpan }: TableLoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-line/60">
          <td colSpan={colSpan} className="px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="h-4 w-24 rounded bg-ink/10" />
              <div className="h-4 flex-1 rounded bg-ink/5" />
              <div className="h-4 w-16 rounded bg-ink/10" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export interface TableEmptyStateProps {
  colSpan: number;
  icon?: React.ElementType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function TableEmptyState({
  colSpan,
  icon: Icon = FolderOpen,
  title = "No records found",
  description = "There are currently no matching items to display.",
  actionLabel,
  onAction,
}: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2">
          <div className="grid size-10 place-items-center rounded-full bg-paper-alt border border-line text-ink-subtle">
            <Icon className="size-5" />
          </div>
          <h4 className="mt-1 text-sm font-semibold text-ink">{title}</h4>
          <p className="text-xs text-ink-muted leading-relaxed">{description}</p>
          {actionLabel && onAction && (
            <div className="mt-2">
              <Btn size="sm" variant="outline" onClick={onAction}>
                {actionLabel}
              </Btn>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export function CardLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse rounded-xl border border-line bg-paper p-6">
      <div className="h-5 w-48 rounded bg-ink/10" />
      <div className="space-y-2.5 pt-2">
        <div className="h-4 w-full rounded bg-ink/5" />
        <div className="h-4 w-3/4 rounded bg-ink/5" />
        <div className="h-4 w-5/6 rounded bg-ink/5" />
      </div>
      <div className="flex gap-3 pt-4">
        <div className="h-9 w-24 rounded-md bg-ink/10" />
        <div className="h-9 w-24 rounded-md bg-ink/10" />
      </div>
    </div>
  );
}

export interface ErrorStateBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorStateBanner({ message, onRetry }: ErrorStateBannerProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-alert/30 bg-alert/10 px-4 py-3 text-sm text-alert">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="size-4 shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-md border border-alert/30 bg-paper px-2.5 py-1 text-xs font-medium text-alert transition-colors hover:bg-alert/10"
        >
          <RefreshCw className="size-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
