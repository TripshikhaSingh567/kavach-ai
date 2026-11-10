"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { ShieldAlert, Terminal, User, Server, Network } from "lucide-react";

export const MitreNode = memo(({ data }: { data: any }) => {
  const isCritical = data.risk_score >= 80;
  const isHigh = data.risk_score >= 60 && data.risk_score < 80;

  return (
    <div
      className={`px-4 py-3 rounded-lg border bg-soc-card shadow-lg min-w-[240px] max-w-[280px] transition-all hover:border-cyan-400 ${
        isCritical
          ? "border-rose-500/60 shadow-rose-950/40"
          : isHigh
          ? "border-amber-500/60 shadow-amber-950/40"
          : "border-soc-borderLight"
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-cyan-400 border border-slate-900" />

      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800">
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            Step {data.step_number}
          </span>
          <span className="text-xs font-mono font-semibold text-rose-400">
            {data.technique_id}
          </span>
        </div>
        <div
          className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
            isCritical
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
          }`}
        >
          {data.risk_score} RISK
        </div>
      </div>

      {/* Technique Title */}
      <div className="font-semibold text-xs text-slate-100 mb-2 truncate" title={data.technique_name}>
        {data.technique_name}
      </div>

      {/* Target Metadata */}
      <div className="space-y-1 text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-1.5 truncate">
          <Server className="w-3 h-3 text-cyan-400 flex-shrink-0" />
          <span className="truncate">{data.host || "N/A"}</span>
        </div>
        <div className="flex items-center space-x-1.5 truncate">
          <User className="w-3 h-3 text-purple-400 flex-shrink-0" />
          <span className="truncate">{data.user || "N/A"}</span>
        </div>
        <div className="flex items-center space-x-1.5 truncate">
          <Network className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{data.ip || "N/A"}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-cyan-400 border border-slate-900" />
    </div>
  );
});

MitreNode.displayName = "MitreNode";
