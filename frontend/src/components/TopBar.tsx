"use client";

import React from "react";
import { Menu, RefreshCw, Bell } from "lucide-react";
import { HealthState } from "@/lib/api";

interface TopBarProps {
  activeTab: string;
  health: HealthState;
  onOpenMobileMenu: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const tabTitles: Record<string, { title: string; breadcrumb: string }> = {
  dashboard: { title: "Live Feed", breadcrumb: "Operations > Live feed" },
  incident: { title: "Incidents", breadcrumb: "Operations > Incident analysis" },
  approvals: { title: "Approvals", breadcrumb: "Response > Containment approvals" },
  robustness: { title: "Robustness", breadcrumb: "Verification > Model & log robustness" },
  benchmark: { title: "Benchmark", breadcrumb: "Evaluation > Quantitative metrics" },
  architecture: { title: "Architecture", breadcrumb: "Design > Enterprise blueprint" },
  audit: { title: "Audit Trail", breadcrumb: "Compliance > Cryptographic audit log" },
};

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  health,
  onOpenMobileMenu,
  onRefresh,
  isRefreshing = false,
}) => {
  const current = tabTitles[activeTab] || { title: "Overview", breadcrumb: "Operations > Overview" };
  const isOnline = health.status === "ONLINE";

  return (
    <header className="h-16 px-6 lg:px-8 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3.5">
        {/* Mobile menu toggle */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="text-xs text-gray-500 font-medium">{current.breadcrumb}</div>
          <h1 className="text-base font-bold text-gray-900 leading-tight mt-0.5">{current.title}</h1>
        </div>
      </div>

      {/* Right Controls matching SecurePay */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Replay Mode Indicator Pill */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Replay mode (simulated data)</span>
        </div>

        {/* Backend Status Indicator Pill */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium border ${
            isOnline
              ? "bg-emerald-50 border-emerald-200/80 text-emerald-800"
              : "bg-gray-100 border-gray-200 text-gray-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? "bg-emerald-500" : "bg-gray-400"
            }`}
          />
          <span>{isOnline ? "Backend connected" : "Using saved snapshot"}</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors disabled:opacity-50 shadow-xs"
            title="Refresh current state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-brand-600" : "text-gray-500"}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>
        )}

        {/* User initials circle matching SecurePay header */}
        <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
            SA
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-gray-900 leading-tight">Security Officer</div>
            <div className="text-[10px] text-gray-400">soc@kavach.ai</div>
          </div>
        </div>
      </div>
    </header>
  );
};
