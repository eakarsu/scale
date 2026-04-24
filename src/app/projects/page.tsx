"use client";

import { useState, useEffect } from "react";
import { PageHeader, FilterTabs, DataTable, StatusBadge, ProgressBar } from "@/components/ui";
import type { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch(`/api/projects?status=${filter}`).then(r => r.json()).then(setProjects);
  }, [filter]);

  return (
    <div>
      <PageHeader
        title="Data Labeling Projects"
        subtitle={`${projects.length} projects`}
        action={<button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors">+ New Project</button>}
      />
      <FilterTabs options={["all", "active", "completed", "paused"]} active={filter} onChange={setFilter} />
      <DataTable headers={[
        { label: "Project" }, { label: "Client" }, { label: "Type" },
        { label: "Status" }, { label: "Progress" }, { label: "Accuracy", align: "right" },
      ]}>
        {projects.map(p => (
          <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors cursor-pointer">
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
    </div>
  );
}
