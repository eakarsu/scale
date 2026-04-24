"use client";

import { useState, useEffect } from "react";
import { PageHeader, StatusBadge } from "@/components/ui";
import { Search } from "lucide-react";
import type { Model } from "@/types";

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/models?search=${search}`).then(r => r.json()).then(setModels);
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Model Hub"
        subtitle={`OpenRouter-powered gateway • ${models.length} models`}
        action={
          <div className="flex items-center gap-2 bg-white/[0.05] rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search models..." className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-48" />
          </div>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {models.map(m => (
          <div key={m.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{m.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{m.provider}</div>
              </div>
              <StatusBadge status={m.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><div className="text-[10px] text-gray-600 uppercase tracking-wider">Context</div><div className="text-sm text-gray-300 font-medium">{m.contextWindow}</div></div>
              <div><div className="text-[10px] text-gray-600 uppercase tracking-wider">Pricing</div><div className="text-sm text-gray-300 font-medium">{m.pricing}</div></div>
              <div><div className="text-[10px] text-gray-600 uppercase tracking-wider">Latency</div><div className="text-sm text-gray-300 font-medium">{m.latency}</div></div>
              <div><div className="text-[10px] text-gray-600 uppercase tracking-wider">Rating</div><div className="text-sm text-amber-400 font-medium">{"★".repeat(Math.floor(m.rating))} {m.rating}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
