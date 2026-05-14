"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { SUPPORTED_MODELS } from "@/lib/openrouter";
import { Sparkles, BarChart3 } from "lucide-react";

type StatRow = {
  model: string;
  requests: number;
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
  max_ms: number;
  mean_ms: number;
};

type StatsResp = {
  sample_size: number;
  total_tokens: number;
  status_counts: Record<string, number>;
  per_model: StatRow[];
  generated_at: string;
};

type Finding = { area: string; observation: string; severity: "info" | "warning" | "critical" };
type InsightsPayload = {
  headline?: string;
  findings?: Finding[];
  cost_signals?: string[];
  performance_signals?: string[];
  recommendations?: string[];
  raw?: string;
  error?: string;
};

type InsightsResp = {
  sample_size: number;
  insights: InsightsPayload;
  model: string;
};

export default function InsightsPage() {
  const [stats, setStats] = useState<StatsResp | null>(null);
  const [insights, setInsights] = useState<InsightsResp | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState<string>(SUPPORTED_MODELS[0].id);
  const [lookback, setLookback] = useState(200);

  const loadStats = async () => {
    setStatsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stats?limit=${lookback}`);
      if (!res.ok) throw new Error(`Stats request failed: ${res.status}`);
      const data = (await res.json()) as StatsResp;
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setStatsLoading(false);
    }
  };

  const generateInsights = async () => {
    setInsightsLoading(true);
    setError(null);
    setInsights(null);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey || undefined, model, lookback }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(data.error || "AI service not configured. Provide an OpenRouter API key.");
        return;
      }
      if (!res.ok) {
        setError(data.error || `Insights request failed: ${res.status}`);
        return;
      }
      setInsights(data as InsightsResp);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate insights");
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Insights" subtitle="Latency histograms and AI-driven analysis of your API logs" />

      {/* Controls */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Sample Size</label>
            <input
              type="number"
              min={10}
              max={1000}
              value={lookback}
              onChange={e => setLookback(Math.max(10, Math.min(1000, parseInt(e.target.value || "200", 10) || 200)))}
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Insight Model</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none"
            >
              {SUPPORTED_MODELS.map(m => (
                <option key={m.id} value={m.id} className="bg-gray-900">
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">OpenRouter API Key (optional)</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-or-..."
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadStats}
            disabled={statsLoading}
            className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-50 border border-white/[0.1] text-gray-200 text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            <BarChart3 size={16} />
            {statsLoading ? "Loading..." : "Load Latency Stats"}
          </button>
          <button
            onClick={generateInsights}
            disabled={insightsLoading}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            <Sparkles size={16} />
            {insightsLoading ? "Analyzing..." : "Generate AI Insights"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Stats panel */}
      {stats && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Latency Histogram</h3>
            <span className="text-xs text-gray-500">
              {stats.sample_size} requests · {stats.total_tokens.toLocaleString()} tokens
            </span>
          </div>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-gray-500 border-b border-white/[0.06]">
                <th className="text-left py-2 px-2">Model</th>
                <th className="text-right py-2 px-2">Requests</th>
                <th className="text-right py-2 px-2">Mean</th>
                <th className="text-right py-2 px-2">p50</th>
                <th className="text-right py-2 px-2">p95</th>
                <th className="text-right py-2 px-2">p99</th>
                <th className="text-right py-2 px-2">Max</th>
              </tr>
            </thead>
            <tbody>
              {stats.per_model.map(row => (
                <tr key={row.model} className="border-b border-white/[0.03]">
                  <td className="py-2 px-2 text-cyan-400">{row.model}</td>
                  <td className="py-2 px-2 text-right text-gray-300">{row.requests}</td>
                  <td className="py-2 px-2 text-right text-gray-400">{row.mean_ms}ms</td>
                  <td className="py-2 px-2 text-right text-gray-400">{row.p50_ms}ms</td>
                  <td className="py-2 px-2 text-right text-amber-400">{row.p95_ms}ms</td>
                  <td className="py-2 px-2 text-right text-red-400">{row.p99_ms}ms</td>
                  <td className="py-2 px-2 text-right text-gray-500">{row.max_ms}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(stats.status_counts).map(([code, n]) => (
              <span
                key={code}
                className={`px-2 py-1 rounded text-[10px] font-mono ${
                  Number(code) < 300
                    ? "bg-emerald-500/10 text-emerald-400"
                    : Number(code) === 429
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {code}: {n}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Insights panel */}
      {insights && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">AI Insights</h3>
            <span className="text-xs text-gray-500">via {insights.model}</span>
          </div>
          {insights.insights.headline && (
            <p className="text-sm text-cyan-300 mb-3">{insights.insights.headline}</p>
          )}
          {insights.insights.findings && insights.insights.findings.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Findings</h4>
              <div className="space-y-2">
                {insights.insights.findings.map((f, i) => (
                  <div
                    key={i}
                    className={`text-xs px-3 py-2 rounded border ${
                      f.severity === "critical"
                        ? "bg-red-500/10 border-red-500/30 text-red-300"
                        : f.severity === "warning"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                        : "bg-white/[0.03] border-white/[0.08] text-gray-300"
                    }`}
                  >
                    <span className="font-semibold">{f.area}: </span>
                    {f.observation}
                  </div>
                ))}
              </div>
            </div>
          )}
          {insights.insights.cost_signals && insights.insights.cost_signals.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Cost Signals</h4>
              <ul className="text-xs text-gray-300 list-disc pl-5 space-y-1">
                {insights.insights.cost_signals.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {insights.insights.performance_signals && insights.insights.performance_signals.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Performance Signals</h4>
              <ul className="text-xs text-gray-300 list-disc pl-5 space-y-1">
                {insights.insights.performance_signals.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {insights.insights.recommendations && insights.insights.recommendations.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Recommendations</h4>
              <ul className="text-xs text-emerald-300 list-disc pl-5 space-y-1">
                {insights.insights.recommendations.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {insights.insights.raw && !insights.insights.findings && (
            <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono bg-black/20 p-3 rounded">
              {insights.insights.raw}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
