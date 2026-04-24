"use client";

import { useState, useEffect } from "react";
import { PageHeader, FilterTabs, DataTable, StatusBadge } from "@/components/ui";
import type { Evaluation } from "@/types";

export default function EvalsPage() {
  const [evals, setEvals] = useState<Evaluation[]>([]);
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>(["all"]);

  useEffect(() => {
    fetch(`/api/evaluations?category=${category}`).then(r => r.json()).then((data: Evaluation[]) => {
      setEvals(data);
      if (category === "all") {
        const cats = ["all", ...new Set(data.map(e => e.category))];
        setCategories(cats);
      }
    });
  }, [category]);

  return (
    <div>
      <PageHeader
        title="Evaluations & Leaderboard"
        subtitle={`SEAL-style model benchmarking • ${evals.length} evaluations`}
        action={<button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors">+ New Eval</button>}
      />
      <FilterTabs options={categories} active={category} onChange={setCategory} />
      <DataTable headers={[
        { label: "Evaluation" }, { label: "Model" }, { label: "Category" },
        { label: "Score", align: "right" }, { label: "Samples", align: "right" }, { label: "Status" },
      ]}>
        {evals.map(ev => (
          <tr key={ev.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors cursor-pointer">
            <td className="py-3 px-3 font-medium text-white">{ev.name}</td>
            <td className="py-3 px-3 text-cyan-400 font-mono text-xs">{ev.model}</td>
            <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-white/[0.05] text-gray-400 text-xs">{ev.category}</span></td>
            <td className="py-3 px-3 text-right text-white font-bold">{ev.score}</td>
            <td className="py-3 px-3 text-right text-gray-400">{ev.samples.toLocaleString()}</td>
            <td className="py-3 px-3"><StatusBadge status={ev.status} /></td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
