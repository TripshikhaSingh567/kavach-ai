"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Server, User, Globe } from "lucide-react";

export const MitreNode = memo(({ data }: { data: any }) => {
  const isCritical = data.risk_score >= 80;
  const isHigh = data.risk_score >= 60 && data.risk_score < 80;
  const isIncomplete = data.is_missing_logs || data.technique_id === "DEGRADED";

  const getSeverityBadge = () => {
    if (isIncomplete) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Incomplete telemetry</span>
        </span>
      );
    }
    if (isCritical) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>{data.risk_score} Risk</span>
        </span>
      );
    }
    if (isHigh) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          <span>{data.risk_score} Risk</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span>{data.risk_score} Risk</span>
      </span>
    );
  };

  return (
    <div className="w-[290px] bg-white border border-gray-200 rounded-2xl p-4 shadow-xs hover:border-brand-500 transition-all">
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 !bg-brand-600 !border-2 !border-white rounded-full"
      />

      {/* Header with step number & severity pill */}
      <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
        <span className="text-xs font-mono font-medium text-gray-500">
          Step {data.step_number}
        </span>
        {getSeverityBadge()}
      </div>

      {/* Technique title */}
      <div className="mt-2.5">
        <div className="text-xs font-mono font-bold text-brand-600">
          {data.technique_id}
        </div>
        <div
          className="text-sm font-bold text-gray-900 leading-snug mt-0.5 line-clamp-1"
          title={data.technique_name}
        >
          {data.technique_name}
        </div>
      </div>

      {/* Target metadata */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1.5 text-xs text-gray-600 font-mono">
        <div className="flex items-center space-x-2 truncate">
          <Server className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">
            Host: <strong className="text-gray-900 font-medium">{data.host || "N/A"}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-2 truncate">
          <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">
            User: <strong className="text-gray-900 font-medium">{data.user || "N/A"}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-2 truncate">
          <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">
            IP: <strong className="text-gray-900 font-medium">{data.ip || "N/A"}</strong>
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-brand-600 !border-2 !border-white rounded-full"
      />
    </div>
  );
});

MitreNode.displayName = "MitreNode";
