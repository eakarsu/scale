import prisma from "@/lib/prisma";
import { StatCard, ProgressBar } from "@/components/ui";
import { formatNumber } from "@/lib/utils";

export default async function DashboardPage() {
  const [projects, agents, evaluations, datasets, labelers, finetunes, logs] = await Promise.all([
    prisma.project.findMany(),
    prisma.agent.findMany(),
    prisma.evaluation.findMany(),
    prisma.dataset.findMany(),
    prisma.labeler.findMany(),
    prisma.fineTune.findMany(),
    prisma.apiLog.findMany(),
  ]);

  const totalTasks = projects.reduce((s, p) => s + p.tasks, 0);
  const completedTasks = projects.reduce((s, p) => s + p.completed, 0);
  const activeProjects = projects.filter(p => p.status === "active").length;
  const totalRequests = agents.reduce((s, a) => s + a.requests, 0);
  const avgAccuracy = projects.length > 0 ? (projects.reduce((s, p) => s + p.accuracy, 0) / projects.length).toFixed(1) : "0";

  const topProjects = [...projects].sort((a, b) => b.tasks - a.tasks).slice(0, 6);
  const topAgents = agents.filter(a => a.status === "deployed").sort((a, b) => b.requests - a.requests).slice(0, 6);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and key metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Projects" value={activeProjects} change="+3 this week" changeDir="up" />
        <StatCard label="Total Tasks" value={formatNumber(totalTasks)} change="+12.4%" changeDir="up" />
        <StatCard label="Avg Accuracy" value={`${avgAccuracy}%`} change="+2.1%" changeDir="up" />
        <StatCard label="Agent Requests" value={formatNumber(totalRequests)} change="+18.7%" changeDir="up" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Models Available" value={formatNumber(await prisma.model.count())} />
        <StatCard label="Evaluations" value={formatNumber(evaluations.length)} />
        <StatCard label="Datasets" value={formatNumber(datasets.length)} />
        <StatCard label="Active Labelers" value={formatNumber(labelers.filter(l => l.status === "active").length)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Top Projects by Volume</h3>
          <div className="space-y-3">
            {topProjects.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.client}</div>
                </div>
                <div className="w-32"><ProgressBar value={p.completed} max={p.tasks} /></div>
                <div className="text-xs text-gray-400 w-12 text-right">{Math.round(p.completed / p.tasks * 100)}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Agent Performance</h3>
          <div className="space-y-3">
            {topAgents.map(a => (
              <div key={a.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{a.name}</div>
                  <div className="text-xs text-gray-500">{a.model}</div>
                </div>
                <div className="text-xs text-gray-400">{formatNumber(a.requests)} req</div>
                <div className="text-xs text-emerald-400 font-medium">{a.successRate}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
