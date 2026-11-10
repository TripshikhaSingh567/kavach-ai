"use client";

import React, { useState } from "react";
import { Download, Search, CheckCircle2, ShieldAlert } from "lucide-react";

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Audit Trail</h2>
          <p className="text-sm text-gray-500 mt-1">
            Append-only audit log with SHA-256 hash chaining to ensure traceability of all automated and manual actions.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-all shadow-xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-gray-500" />
          <span>Export JSON</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2.5 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by action, target, actor, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat === "ALL" ? "All" : cat.toLowerCase().replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/75 text-gray-500 font-semibold text-[11px] uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-6">Log ID</th>
                <th className="py-3.5 px-6">Time</th>
                <th className="py-3.5 px-6">Actor</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Action &amp; target</th>
                <th className="py-3.5 px-6">Reason</th>
                <th className="py-3.5 px-6">SHA-256 hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => {
                const isAnalyst = log.actor?.includes("ANALYST");

                return (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Log ID */}
                    <td className="py-4 px-6 font-mono text-xs font-bold text-brand-600 whitespace-nowrap">
                      {log.id}
                    </td>

                    {/* Time */}
                    <td className="py-4 px-6 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    {/* Actor */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isAnalyst
                            ? "bg-brand-50 text-brand-700 border border-brand-200"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {log.actor}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 text-xs font-medium text-gray-600 whitespace-nowrap">
                      {log.category?.toLowerCase().replace("_", " ")}
                    </td>

                    {/* Action & Target */}
                    <td className="py-4 px-6">
                      <div className="text-xs font-bold text-gray-900">{log.action}</div>
                      <div className="text-xs font-mono text-gray-500 mt-0.5">Target: {log.target}</div>
                    </td>

                    {/* Reason */}
                    <td className="py-4 px-6 text-xs text-gray-600 max-w-sm leading-relaxed">
                      {log.reason}
                    </td>

                    {/* Hash */}
                    <td
                      className="py-4 px-6 font-mono text-[11px] text-gray-400 whitespace-nowrap"
                      title={`Hash: ${log.hash || "N/A"}\nPrevious: ${log.previous_hash || "N/A"}`}
                    >
                      {log.hash ? log.hash.substring(0, 10) + "..." : "Initial"}
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
