"use client";

import { useState, useEffect } from "react";
import { loadRecords } from "@/lib/records";
import { PageHeader, FilterTabs, DataTable, StatusBadge, ProgressBar } from "@/components/ui";
import RecordDialog from "@/components/RecordDialog";
import type { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    setLoadError("");
    loadRecords<Project>(`/api/projects?status=${filter}`).then(setProjects).catch(error => { setProjects([]); setLoadError(error.message); });
  }, [filter]);

  const openRow = (row: Project) => setSelected(row);
  const rowKey = (row: Project) => (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openRow(row); }
  };

  return (
    <div>
      <PageHeader
        title="Data Labeling Projects"
        subtitle={`${projects.length} projects`}
        action={<button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors">+ New Project</button>}
      />
      {loadError && <p role="alert" className="mb-4 rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{loadError}</p>}
      <FilterTabs options={["all", "active", "completed", "paused"]} active={filter} onChange={setFilter} />
      <DataTable headers={[
        { label: "Project" }, { label: "Client" }, { label: "Type" },
        { label: "Status" }, { label: "Progress" }, { label: "Accuracy", align: "right" },
      ]}>
        {projects.map(p => (
          <tr
            key={p.id}
            tabIndex={0}
            onClick={() => openRow(p)}
            onKeyDown={rowKey(p)}
            className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors cursor-pointer focus:outline-none focus:bg-white/[0.05]"
          >
            <td className="py-3 px-3 font-medium text-white">{p.name}</td>
            <td className="py-3 px-3 text-gray-400">{p.client}</td>
            <td className="py-3 px-3 text-gray-400">{p.type.replace("_", " ")}</td>
            <td className="py-3 px-3"><StatusBadge status={p.status} /></td>
            <td className="py-3 px-3">
              <div className="flex items-center gap-2">
                <div className="w-24"><ProgressBar value={p.completed} max={p.tasks} /></div>
                <span className="text-xs text-gray-500">{p.completed.toLocaleString()}/{p.tasks.toLocaleString()}</span>
              </div>
            </td>
            <td className="py-3 px-3 text-right text-emerald-400 font-medium">{p.accuracy}%</td>
          </tr>
        ))}
      </DataTable>
      {selected && (
        <RecordDialog
          title={`Project · ${selected.name}`}
          item={selected as unknown as Record<string, unknown>}
          onClose={() => setSelected(null)}
          onSave={(updated) => setProjects((current) => current.map((row) => (row.id === selected.id ? { ...row, ...updated } as Project : row)))}
          onDelete={() => setProjects((current) => current.filter((row) => row.id !== selected.id))}
        />
      )}
    </div>
  );
}
