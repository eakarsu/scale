"use client";

import { useState, useEffect } from "react";
import { loadRecords } from "@/lib/records";
import { PageHeader, DataTable, StatusBadge } from "@/components/ui";
import RecordDialog from "@/components/RecordDialog";
import type { FineTune } from "@/types";

export default function FineTunePage() {
  const [finetunes, setFinetunes] = useState<FineTune[]>([]);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<FineTune | null>(null);

  useEffect(() => {
    setLoadError("");
    loadRecords<FineTune>("/api/finetunes").then(setFinetunes).catch(error => { setFinetunes([]); setLoadError(error.message); });
  }, []);

  const openRow = (row: FineTune) => setSelected(row);
  const rowKey = (row: FineTune) => (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openRow(row); }
  };

  return (
    <div>
      <PageHeader
        title="Fine-Tuning & RLHF"
        subtitle={`${finetunes.length} fine-tuning jobs`}
        action={<button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors">+ New Fine-Tune</button>}
      />
      {loadError && <p role="alert" className="mb-4 rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{loadError}</p>}
      <DataTable headers={[
        { label: "Name" }, { label: "Base Model" }, { label: "Dataset" },
        { label: "Status" }, { label: "Epochs", align: "right" },
        { label: "Loss", align: "right" }, { label: "Eval Score", align: "right" },
      ]}>
        {finetunes.map(ft => (
          <tr
            key={ft.id}
            tabIndex={0}
            onClick={() => openRow(ft)}
            onKeyDown={rowKey(ft)}
            className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors cursor-pointer focus:outline-none focus:bg-white/[0.05]"
          >
            <td className="py-3 px-3 font-medium text-white font-mono text-xs">{ft.name}</td>
            <td className="py-3 px-3 text-cyan-400 font-mono text-xs">{ft.baseModel}</td>
            <td className="py-3 px-3 text-gray-400 text-xs">{ft.dataset}</td>
            <td className="py-3 px-3"><StatusBadge status={ft.status} /></td>
            <td className="py-3 px-3 text-right text-gray-300">{ft.epochs}</td>
            <td className="py-3 px-3 text-right text-gray-300">{ft.loss ?? "—"}</td>
            <td className="py-3 px-3 text-right text-emerald-400 font-medium">{ft.evalScore ? `${ft.evalScore}%` : "—"}</td>
          </tr>
        ))}
      </DataTable>
      {selected && (
        <RecordDialog
          title={`Fine-tune · ${selected.name}`}
          item={selected as unknown as Record<string, unknown>}
          onClose={() => setSelected(null)}
          onSave={(updated) => setFinetunes((current) => current.map((row) => (row.id === selected.id ? { ...row, ...updated } as FineTune : row)))}
          onDelete={() => setFinetunes((current) => current.filter((row) => row.id !== selected.id))}
        />
      )}
    </div>
  );
}
