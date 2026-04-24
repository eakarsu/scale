"use client";

import { useState, useEffect } from "react";
import { PageHeader, StatusBadge } from "@/components/ui";
import type { Labeler } from "@/types";

export default function TeamPage() {
  const [labelers, setLabelers] = useState<Labeler[]>([]);

  useEffect(() => {
    fetch("/api/labelers").then(r => r.json()).then(setLabelers);
  }, []);

  const regions = new Set(labelers.map(l => l.region));

  return (
    <div>
      <PageHeader
        title="Labeling Workforce"
        subtitle={`${labelers.length} expert annotators across ${regions.size} regions`}
        action={<button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors">+ Invite Labeler</button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {labelers.map(l => (
          <div key={l.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-cyan-500/30 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm font-bold text-white">{l.name}</div>
                <div className="text-xs text-cyan-400 mt-0.5">{l.expertise}</div>
              </div>
              <StatusBadge status={l.status} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div><div className="text-[10px] text-gray-600 uppercase">Tasks</div><div className="text-sm text-gray-300 font-medium">{(l.tasksCompleted / 1000).toFixed(1)}K</div></div>
              <div><div className="text-[10px] text-gray-600 uppercase">Accuracy</div><div className="text-sm text-emerald-400 font-medium">{l.accuracy}%</div></div>
              <div><div className="text-[10px] text-gray-600 uppercase">Rate</div><div className="text-sm text-gray-300 font-medium">${l.hourlyRate}/hr</div></div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
              <span className="text-xs text-gray-500">{l.region}</span>
              <span className="text-xs text-amber-400">{"★".repeat(Math.floor(l.rating))} {l.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
