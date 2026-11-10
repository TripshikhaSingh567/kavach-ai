"use client";

import React, { useState } from "react";
import { FileText, Download, ShieldCheck, Filter, Search, CheckCircle2, UserCheck, Bot } from "lucide-react";

interface AuditLogViewProps {
  logs: any[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = ["ALL", "DETECTION", "CORRELATION", "TRIAGE", "APPROVAL", "ACTION_EXECUTION", "DEFENSE"];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "ALL" || log.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kavach_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl border border-soc-border bg-soc-card shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Tamper-Evident Ledger
              </span>
              <span className="text-xs font-mono text-slate-400">SOC 2 &bull; ISO 27001 Audit Ready</span>
            </div>
            <h1 className="text-lg font-black text-white mt-1">Append-Only Resilience Audit Trail</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable chronological record of every ML detection, graph correlation, AI triage recommendation, human approval, and executed containment.
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-cyan-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Trail (JSON)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-soc-border bg-soc-card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by action, target, actor, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-full font-mono"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto text-xs font-mono">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-soc-border bg-soc-card shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Log ID</th>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Actor</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Action &amp; Target</th>
                <th className="px-4 py-3.5">Operational Reason / Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {filteredLogs.map((log) => {
                const isAnalyst = log.actor?.includes("ANALYST");
                const isDefense = log.category === "DEFENSE";
                const isApproval = log.category === "APPROVAL";

                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Log ID */}
                    <td className="px-4 py-3 font-mono font-bold text-cyan-300 whitespace-nowrap">
                      {log.id}
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    {/* Actor */}
                    <td className="px-4 py-3 font-mono whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAnalyst
                            ? "bg-purple-950 text-purple-300 border border-purple-800"
                            : isDefense
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : "bg-slate-900 text-slate-300 border border-slate-800"
                        }`}
                      >
                        {isAnalyst ? <UserCheck className="w-3 h-3 text-purple-400" /> : <Bot className="w-3 h-3 text-cyan-400" />}
                        <span>{log.actor}</span>
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap">
                      <span className="text-slate-400 uppercase font-bold">{log.category}</span>
                    </td>

                    {/* Action & Target */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-white text-xs">{log.action}</div>
                      <div className="text-[11px] font-mono text-cyan-400 mt-0.5">Target: {log.target}</div>
                    </td>

                    {/* Reason */}
                    <td className="px-4 py-3 text-slate-300 text-xs max-w-md">
                      {log.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
