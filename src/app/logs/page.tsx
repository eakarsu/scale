"use client";

import { useState, useEffect } from "react";
import { PageHeader, DataTable } from "@/components/ui";
import type { ApiLog } from "@/types";

export default function LogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);

  useEffect(() => {
    fetch("/api/logs").then(r => r.json()).then(setLogs);
  }, []);

  return (
    <div>
      <PageHeader title="API Logs" subtitle="Real-time OpenRouter API request logs" />
      <DataTable headers={[
        { label: "Time" }, { label: "Endpoint" }, { label: "Model" },
        { label: "Status" }, { label: "Latency", align: "right" }, { label: "Tokens", align: "right" },
      ]}>
        {logs.map(log => (
          <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors font-mono">
            <td className="py-2.5 px-3 text-xs text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
            <td className="py-2.5 px-3 text-xs text-gray-300">{log.endpoint}</td>
            <td className="py-2.5 px-3 text-xs text-cyan-400">{log.model}</td>
            <td className="py-2.5 px-3">
              <span className={`text-xs font-bold ${log.status < 300 ? "text-emerald-400" : log.status === 429 ? "text-amber-400" : "text-red-400"}`}>{log.status}</span>
            </td>
            <td className="py-2.5 px-3 text-xs text-right text-gray-400">{log.latency}ms</td>
            <td className="py-2.5 px-3 text-xs text-right text-gray-400">{log.tokens > 0 ? log.tokens.toLocaleString() : "—"}</td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
