"use client";

import { useState, useEffect } from "react";
import { PageHeader, StatusBadge } from "@/components/ui";
import { formatNumber } from "@/lib/utils";
import type { Agent } from "@/types";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    fetch("/api/agents").then(r => r.json()).then(setAgents);
  }, []);

  return (
    <div>
      <PageHeader
        title="AI Agents"
        subtitle={`Agentex-powered deployment • ${agents.length} agents`}
        action={<button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors">+ Deploy Agent</button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map(a => (
          <div key={a.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-cyan-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-white">{a.name}</div>
                <div className="text-xs text-gray-500 font-mono mt-0.5">{a.model}</div>
              </div>
              <StatusBadge status={a.status} />
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div><div className="text-[10px] text-gray-600 uppercase">Requests</div><div className="text-sm text-gray-300 font-medium">{formatNumber(a.requests)}</div></div>
              <div><div className="text-[10px] text-gray-600 uppercase">Latency</div><div className="text-sm text-gray-300 font-medium">{a.avgLatency}</div></div>
              <div><div className="text-[10px] text-gray-600 uppercase">Success</div><div className="text-sm text-emerald-400 font-medium">{a.successRate}%</div></div>
              <div><div className="text-[10px] text-gray-600 uppercase">Tools</div><div className="text-sm text-gray-300 font-medium">{a.tools}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
