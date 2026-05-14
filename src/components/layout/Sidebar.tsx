"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FolderOpen, Layers, Activity, Bot,
  Database, Users, Orbit, FileText, MessageSquare, Menu, Zap, Sparkles
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/models", label: "Model Hub", icon: Layers },
  { href: "/evaluations", label: "Evaluations", icon: Activity },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/data", label: "Data Engine", icon: Database },
  { href: "/team", label: "Workforce", icon: Users },
  { href: "/finetune", label: "Fine-Tuning", icon: Orbit },
  { href: "/logs", label: "API Logs", icon: FileText },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/playground", label: "Playground", icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <aside className={cn("flex-shrink-0 bg-[#060911] border-r border-white/[0.06] flex flex-col transition-all duration-200", open ? "w-56" : "w-16")}>
      {/* Header */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-white/[0.06]">
        <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
        {open && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Zap size={14} />
            </div>
            <span className="font-bold text-white tracking-tight text-lg">Nexus</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-cyan-600/15 text-cyan-400 border border-cyan-500/20"
                  : "text-gray-500 hover:text-white hover:bg-white/[0.03] border border-transparent"
              )}
            >
              <Icon size={18} />
              {open && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.06]">
        {open && (
          <div className="bg-white/[0.03] rounded-lg p-3">
            <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Gateway</div>
            <div className="text-xs text-cyan-400 font-medium">OpenRouter API</div>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400">Connected</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
