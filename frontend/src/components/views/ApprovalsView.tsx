"use client";

import React, { useState } from "react";
import { Shield, ShieldAlert, CheckCircle2, XCircle, Clock, Zap, ArrowRight, UserCheck, AlertOctagon } from "lucide-react";
import { approveAction, rejectAction } from "@/lib/api";

interface ApprovalsViewProps {
  triageData: any;
  incidentId?: string;
  onActionUpdated?: () => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  triageData,
  incidentId = "INC-2026-0001",
  onActionUpdated,
}) => {
  const [actions, setActions] = useState<any[]>(() => {
    return triageData?.recommended_actions || [];
  });
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [analystFeedback, setAnalystFeedback] = useState<string>("");

  const lowRiskActions = actions.filter((a) => a.impact === "LOW");
  const highImpactActions = actions.filter((a) => a.impact === "HIGH");

  const handleApprove = async (action: any) => {
    setProcessingId(action.id);
    try {
      await approveAction({
        action_id: action.id,
        action_title: action.title,
        target: action.target,
        incident_id: incidentId,
        analyst_name: "trips (SOC Tier-2 Lead)",
        reason: analystFeedback || "Authorized after confirming kill chain in attack graph.",
      });

      setActions((prev) =>
        prev.map((a) =>
          a.id === action.id ? { ...a, status: "approved" } : a
        )
      );
      if (onActionUpdated) onActionUpdated();
    } catch (e) {
      console.error("Approve failed", e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (action: any) => {
    setProcessingId(action.id);
    try {
      await rejectAction({
        action_id: action.id,
        action_title: action.title,
        target: action.target,
        incident_id: incidentId,
        analyst_name: "trips (SOC Tier-2 Lead)",
        reason: analystFeedback || "Action rejected by analyst to prevent business disruption.",
      });

      setActions((prev) =>
        prev.map((a) =>
          a.id === action.id ? { ...a, status: "rejected" } : a
        )
      );
      if (onActionUpdated) onActionUpdated();
    } catch (e) {
      console.error("Reject failed", e);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl border border-soc-border bg-soc-card shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Human-in-the-Loop Safeguard
              </span>
              <span className="text-xs font-mono text-slate-400">Incident: {incidentId}</span>
            </div>
            <h1 className="text-lg font-black text-white mt-1">Autonomous Resilience &amp; Response Playbook</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Low-risk perimeter actions execute autonomously without delay. High-impact operations (host isolation, account lockout) require explicit analyst authorization.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <div className="text-emerald-400 font-bold">{lowRiskActions.filter(a => a.status === "executed").length}</div>
              <div className="text-[10px] text-slate-500 uppercase">Auto-Executed</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <div className="text-amber-400 font-bold">{highImpactActions.filter(a => a.status === "pending").length}</div>
              <div className="text-[10px] text-slate-500 uppercase">Pending Approval</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: High-Impact Actions Requiring Approval */}
      <div className="rounded-xl border border-rose-900/40 bg-soc-card shadow-xl overflow-hidden">
        <div className="p-4 border-b border-rose-900/40 bg-rose-950/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="text-sm font-bold text-white">High-Impact Containment Actions (Approval Gate)</h2>
              <p className="text-xs text-rose-300/70">Actions that may disrupt business operations or lock out core infrastructure</p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
            HUMAN-IN-THE-LOOP REQUIRED
          </span>
        </div>

        <div className="divide-y divide-slate-800/80 p-4 space-y-4">
          {highImpactActions.map((action) => {
            const isPending = action.status === "pending";
            const isApproved = action.status === "approved";
            const isRejected = action.status === "rejected";

            return (
              <div
                key={action.id}
                className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-rose-400">{action.id}</span>
                    <span className="font-bold text-sm text-white">{action.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Target: {action.target}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{action.description}</p>
                  <div className="text-[11px] font-mono text-slate-500">
                    Impact: <strong className="text-rose-400">HIGH</strong> &bull; Sever network connection or freeze security tokens.
                  </div>
                </div>

                {/* Status & Approval Buttons */}
                <div className="flex items-center space-x-2 self-end md:self-center">
                  {isPending && (
                    <div className="flex items-center space-x-2">
                      <button
                        disabled={processingId === action.id}
                        onClick={() => handleApprove(action)}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve</span>
                      </button>

                      <button
                        disabled={processingId === action.id}
                        onClick={() => handleReject(action)}
                        className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  {isApproved && (
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>APPROVED &amp; EXECUTED</span>
                    </div>
                  )}

                  {isRejected && (
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800 text-xs font-mono font-bold">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>REJECTED BY ANALYST</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Low-Risk Automated Actions */}
      <div className="rounded-xl border border-soc-border bg-soc-card shadow-xl overflow-hidden">
        <div className="p-4 border-b border-soc-border bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Low-Risk Autonomous Actions (Zero Latency)</h2>
              <p className="text-xs text-slate-400">Non-destructive containment executed automatically to stop adversary velocity</p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
            AUTONOMOUS (0.5s)
          </span>
        </div>

        <div className="divide-y divide-slate-800/80 p-4 space-y-3">
          {lowRiskActions.map((action) => (
            <div
              key={action.id}
              className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">{action.id}</span>
                  <span className="font-bold text-xs text-white">{action.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    Target: {action.target}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{action.description}</p>
              </div>

              <div className="flex items-center space-x-1.5 px-3 py-1 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800/60 text-[11px] font-mono font-bold whitespace-nowrap self-end md:self-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>EXECUTED AUTOMATICALLY</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
