"use client";

import React, { useState } from "react";
import { Check, X, ShieldAlert, CheckCircle2, Clock, CheckSquare } from "lucide-react";
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
    return (triageData?.recommended_actions || []).map((a: any) => ({
      ...a,
      updatedAt: null,
      updatedBy: null,
    }));
  });
  const [processingId, setProcessingId] = useState<string | null>(null);

  const needsApproval = actions.filter((a) => a.impact === "HIGH");
  const ranAutomatically = actions.filter((a) => a.impact === "LOW");

  const handleApprove = async (action: any) => {
    setProcessingId(action.id);
    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    try {
      await approveAction({
        action_id: action.id,
        action_title: action.title,
        target: action.target,
        incident_id: incidentId,
        analyst_name: "Security Analyst",
        reason: "Authorized after verifying incident kill chain.",
      });

      setActions((prev) =>
        prev.map((a) =>
          a.id === action.id
            ? { ...a, status: "approved", updatedAt: nowTime, updatedBy: "Analyst" }
            : a
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
    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    try {
      await rejectAction({
        action_id: action.id,
        action_title: action.title,
        target: action.target,
        incident_id: incidentId,
        analyst_name: "Security Analyst",
        reason: "Action rejected to maintain service continuity.",
      });

      setActions((prev) =>
        prev.map((a) =>
          a.id === action.id
            ? { ...a, status: "rejected", updatedAt: nowTime, updatedBy: "Analyst" }
            : a
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
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Approvals</h2>
        <p className="text-sm text-gray-500 mt-1">
          Review high-impact containment actions requiring analyst authorization before execution.
        </p>
      </div>

      {/* Section 1: Needs Approval */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Needs approval</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Actions with potential to disrupt host connectivity or production services.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {needsApproval.filter((a) => a.status === "pending").length} pending
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {needsApproval.map((action) => {
            const isPending = action.status === "pending";
            const isApproved = action.status === "approved";
            const isRejected = action.status === "rejected";

            return (
              <div
                key={action.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {action.id}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{action.title}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{action.description}</p>
                  <div className="text-xs font-mono text-gray-500">
                    Target: <strong className="font-semibold text-gray-900">{action.target}</strong>
                  </div>
                </div>

                {/* Status / Actions */}
                <div className="flex items-center space-x-2.5 self-start sm:self-center">
                  {isPending && (
                    <>
                      <button
                        disabled={processingId === action.id}
                        onClick={() => handleApprove(action)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </button>

                      <button
                        disabled={processingId === action.id}
                        onClick={() => handleReject(action)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-rose-50 hover:border-rose-300 text-rose-700 text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {isApproved && (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Approved by analyst {action.updatedAt ? `(${action.updatedAt})` : ""}</span>
                    </div>
                  )}

                  {isRejected && (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold shadow-xs">
                      <X className="w-4 h-4 text-rose-600" />
                      <span>Rejected by analyst {action.updatedAt ? `(${action.updatedAt})` : ""}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Ran Automatically */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Ran automatically</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Low-risk perimeter actions executed immediately to prevent further progression.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {ranAutomatically.length} executed
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {ranAutomatically.map((action) => (
            <div
              key={action.id}
              className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                    {action.id}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{action.title}</span>
                </div>
                <p className="text-xs text-gray-600">{action.description}</p>
                <div className="text-xs font-mono text-gray-500">
                  Target: <strong className="font-semibold text-gray-900">{action.target}</strong>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold self-start sm:self-center whitespace-nowrap shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Executed automatically</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
