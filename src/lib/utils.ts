import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    deployed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    completed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    available: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    running: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    testing: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    paused: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    failed: "bg-red-500/15 text-red-400 border-red-500/30",
    queued: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    on_break: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    inactive: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    unavailable: "bg-red-500/15 text-red-400 border-red-500/30",
    deprecated: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  };
  return colors[status] || colors.active;
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: "text-red-400",
    high: "text-amber-400",
    medium: "text-blue-400",
    low: "text-gray-400",
  };
  return colors[priority] || colors.medium;
}
