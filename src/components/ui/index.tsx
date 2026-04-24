"use client";

import { cn, getStatusColor, formatNumber } from "@/lib/utils";

// === STATUS BADGE ===
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", getStatusColor(status))}>
      {status.replace("_", " ")}
    </span>
  );
}

// === STAT CARD ===
export function StatCard({ label, value, change, changeDir }: {
  label: string; value: string | number; change?: string; changeDir?: "up" | "down";
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] transition-all">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">{label}</div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      {change && (
        <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", changeDir === "up" ? "text-emerald-400" : "text-red-400")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {changeDir === "up"
              ? <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>
              : <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>}
          </svg>
          {change}
        </div>
      )}
    </div>
  );
}

// === PROGRESS BAR ===
export function ProgressBar({ value, max, color = "bg-cyan-500" }: {
  value: number; max: number; color?: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

// === EMPTY STATE ===
export function EmptyState({ message = "No data found" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-20 text-gray-600 text-sm">
      {message}
    </div>
  );
}

// === PAGE HEADER ===
export function PageHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// === FILTER TABS ===
export function FilterTabs({ options, active, onChange }: {
  options: string[]; active: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            active === o ? "bg-cyan-600 text-white" : "bg-white/[0.05] text-gray-400 hover:text-white"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// === TABLE WRAPPER ===
export function DataTable({ headers, children }: { headers: { label: string; align?: string }[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {headers.map((h, i) => (
              <th key={i} className={cn("py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-medium", h.align === "right" ? "text-right" : "text-left")}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
