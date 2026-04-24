"use client";

import { usePathname } from "next/navigation";
import { Search, ChevronRight } from "lucide-react";

const PAGE_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/models": "Model Hub",
  "/evaluations": "Evaluations",
  "/agents": "Agents",
  "/data": "Data Engine",
  "/team": "Workforce",
  "/finetune": "Fine-Tuning",
  "/logs": "API Logs",
  "/playground": "Playground",
};

export default function Header() {
  const pathname = usePathname();
  const pageName = PAGE_NAMES[pathname] || "Dashboard";

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06] flex-shrink-0 bg-[#0a0e17]">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Nexus AI</span>
        <ChevronRight size={14} />
        <span className="text-white font-medium">{pageName}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-1.5">
          <Search size={16} className="text-gray-500" />
          <input placeholder="Search..." className="bg-transparent text-sm text-white placeholder-gray-600 outline-none w-40" />
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
          E
        </div>
      </div>
    </header>
  );
}
