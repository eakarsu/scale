"use client";

import { useState, useEffect } from "react";
import { PageHeader, DataTable, StatusBadge } from "@/components/ui";
import type { FineTune } from "@/types";

export default function FineTunePage() {
  const [finetunes, setFinetunes] = useState<FineTune[]>([]);

  useEffect(() => {
    fetch("/api/finetunes").then(r => r.json()).then(setFinetunes);
  }, []);

  return (
    <div>
      <PageHeader
        title="Fine-Tuning & RLHF"
        subtitle={`${finetunes.length} fine-tuning jobs`}
        action={<button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors">+ New Fine-Tune</button>}
      />
      <DataTable headers={[
        { label: "Name" }, { label: "Base Model" }, { label: "Dataset" },
        { label: "Status" }, { label: "Epochs", align: "right" },
        { label: "Loss", align: "right" }, { label: "Eval Score", align: "right" },
      ]}>
        {finetunes.map(ft => (
          <tr key={ft.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors cursor-pointer">
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
    </div>
  );
}
