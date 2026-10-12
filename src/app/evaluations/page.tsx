"use client";

import { useState, useEffect } from "react";
import { loadRecords } from "@/lib/records";
import { PageHeader, FilterTabs, DataTable, StatusBadge } from "@/components/ui";
import RecordDialog from "@/components/RecordDialog";
import type { Evaluation } from "@/types";

export default function EvalsPage() {
  const [evals, setEvals] = useState<Evaluation[]>([]);
  const [loadError, setLoadError] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [selected, setSelected] = useState<Evaluation | null>(null);

  useEffect(() => {
    setLoadError("");
    loadRecords<Evaluation>(`/api/evaluations?category=${category}`).then(data => {
      setEvals(data);
      if (category === "all") setCategories(["all", ...new Set(data.map(e => e.category))]);
    }).catch(error => { setEvals([]); setLoadError(error.message); });
  }, [category]);

  const openRow = (row: Evaluation) => setSelected(row);
  const rowKey = (row: Evaluation) => (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openRow(row); }
  };

  return (
    <div>
      <PageHeader
        title="Evaluations & Leaderboard"
        subtitle={`SEAL-style model benchmarking • ${evals.length} evaluations`}
        action={<button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors">+ New Eval</button>}
      />
      {loadError && <p role="alert" className="mb-4 rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{loadError}</p>}
      <FilterTabs options={categories} active={category} onChange={setCategory} />
      <DataTable headers={[
        { label: "Evaluation" }, { label: "Model" }, { label: "Category" },
        { label: "Score", align: "right" }, { label: "Samples", align: "right" }, { label: "Status" },
      ]}>
        {evals.map(ev => (
          <tr
            key={ev.id}
            tabIndex={0}
            onClick={() => openRow(ev)}
            onKeyDown={rowKey(ev)}
            className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors cursor-pointer focus:outline-none focus:bg-white/[0.05]"
          >
            <td className="py-3 px-3 font-medium text-white">{ev.name}</td>
            <td className="py-3 px-3 text-cyan-400 font-mono text-xs">{ev.model}</td>
            <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-white/[0.05] text-gray-400 text-xs">{ev.category}</span></td>
            <td className="py-3 px-3 text-right text-white font-bold">{ev.score}</td>
            <td className="py-3 px-3 text-right text-gray-400">{ev.samples.toLocaleString()}</td>
            <td className="py-3 px-3"><StatusBadge status={ev.status} /></td>
          </tr>
        ))}
      </DataTable>
      {selected && (
        <RecordDialog
          title={`Evaluation · ${selected.name}`}
          item={selected as unknown as Record<string, unknown>}
          onClose={() => setSelected(null)}
          onSave={(updated) => setEvals((current) => current.map((row) => (row.id === selected.id ? { ...row, ...updated } as Evaluation : row)))}
          onDelete={() => setEvals((current) => current.filter((row) => row.id !== selected.id))}
        />
      )}
    </div>
  );
}
