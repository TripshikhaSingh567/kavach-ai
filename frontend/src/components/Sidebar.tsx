"use client";

import React from "react";
import {
  Radio,
  ShieldAlert,
  CheckSquare,
  ShieldCheck,
  BarChart2,
  Layers,
  FileText,
  X,
  Shield,
  UserCheck
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const navItems = [
    { id: "dashboard", label: "Live Feed", icon: Radio },
    { id: "incident", label: "Incidents", icon: ShieldAlert },
    { id: "approvals", label: "Approvals", icon: CheckSquare },
    { id: "robustness", label: "Robustness", icon: ShieldCheck },
    { id: "benchmark", label: "Benchmark", icon: BarChart2 },
    { id: "architecture", label: "Architecture", icon: Layers },
    { id: "audit", label: "Audit Trail", icon: FileText },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Fixed Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo & Header */}
          <div className="h-20 px-6 border-b border-gray-100 flex items-center justify-between">
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => {
                setActiveTab("dashboard");
                onClose();
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-xs group-hover:bg-brand-700 transition-colors">
                K
              </div>
              <div>
                <div className="text-base font-bold text-gray-900 tracking-tight leading-none">
                  KAVACH-AI
                </div>
                <div className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider mt-1">
                  Incident Response
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                    isActive
                      ? "bg-brand-50 text-brand-600 font-semibold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? "text-brand-600" : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Analyst / System Card */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                SA
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900">Security Analyst</div>
                <div className="text-[11px] text-gray-500">SOC Operations</div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active session" />
          </div>
        </div>
      </aside>
    </>
  );
};
