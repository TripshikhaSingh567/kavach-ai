"use client";

import React from "react";
import { Shield, Activity, Radio, Cpu, CheckCircle2, AlertTriangle, Layers, FileText, BarChart3, Database } from "lucide-react";
import { HealthState } from "@/lib/api";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: HealthState;
  onRetryHealth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  health,
  onRetryHealth
}) => {
  const navItems = [
    { id: "dashboard", label: "SOC Live Feed", icon: Radio },
    { id: "incident", label: "Correlated Incident & Attack Graph", icon: Activity },
    { id: "approvals", label: "Playbook & Approvals", icon: Shield },
    { id: "robustness", label: "Robustness & Prompt Shield", icon: AlertTriangle },
    { id: "benchmark", label: "Benchmark & Evaluation", icon: BarChart3 },
    { id: "architecture", label: "Production Architecture", icon: Layers },
    { id: "audit", label: "Audit Trail", icon: FileText },
  ];

  return (
    <header className="border-b border-soc-border bg-soc-bg/95 backdrop-blur sticky top-0 z-50">
      {/* Top Telemetry & Status Bar */}
      <div className="px-6 py-2 border-b border-soc-border/50 flex flex-wrap items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Radio className="w-3.5 h-3.5 text-amber-400 radar-pulse" />
            <span className="font-semibold">Simulated data / replay mode</span>
          </div>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">Dataset: CIC-IDS2017 Stratified Sample (6,000 Flows)</span>
        </div>

        {/* Backend & Fallback Badge */}
        <div className="flex items-center space-x-2">
          {health.status === "WARMING_UP" && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>Warming up backend (Render free tier)...</span>
            </div>
          )}

          {health.status === "ONLINE" && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold">Backend Live (FastAPI + ML)</span>
              <span className="text-emerald-500/70">| {health.llm_provider || "Gemini 3.5"}</span>
            </div>
          )}

          {health.status === "FALLBACK" && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-semibold">Fallback data</span>
                <span className="text-slate-400 text-[11px]">(Snapshot Active)</span>
              </div>
              {onRetryHealth && (
                <button
                  onClick={onRetryHealth}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 text-[11px]"
                >
                  Ping Backend
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Brand & Tab Bar */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg tracking-wider text-white">KAVACH<span className="text-cyan-400">-AI</span></span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-800/40">
                v1.0-DEMO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Autonomous AI Cyber-Resilience & Incident Triage Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
