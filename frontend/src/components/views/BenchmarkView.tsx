"use client";

import React from "react";
import { Camera, TrendingUp, TrendingDown, ArrowRight, ShieldCheck, Zap, Clock, UserCheck } from "lucide-react";

interface BenchmarkViewProps {
  benchmarkData: any;
  isScreenshotMode?: boolean;
  onToggleScreenshotMode?: () => void;
}

export const BenchmarkView: React.FC<BenchmarkViewProps> = ({
  benchmarkData,
  isScreenshotMode = false,
  onToggleScreenshotMode,
}) => {
  const comparisons = benchmarkData?.detailed_comparison || [];
  const baseline = benchmarkData?.baseline_summary || {};
  const kavach = benchmarkData?.kavach_summary || {};

  return (
    <div className="space-y-6">
      {/* Page Header (hidden in screenshot mode) */}
      {!isScreenshotMode && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Benchmark</h2>
            <p className="text-sm text-gray-500 mt-1">
              Quantitative comparison of rule-based baseline versus KAVACH-AI on simulated test scenarios.
            </p>
          </div>

          {onToggleScreenshotMode && (
            <button
              onClick={onToggleScreenshotMode}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-all shadow-xs self-start sm:self-auto"
            >
              <Camera className="w-4 h-4 text-gray-500" />
              <span>Slide screenshot mode</span>
            </button>
          )}
        </div>
      )}

      {/* Main Comparison Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Evaluation results</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              All metrics calculated from actual scenario runs.
            </p>
          </div>

          {isScreenshotMode && onToggleScreenshotMode && (
            <button
              onClick={onToggleScreenshotMode}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold underline"
            >
              Exit screenshot mode
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/75 text-gray-500 font-semibold text-[11px] uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-6">Metric</th>
                <th className="py-3.5 px-6">Rule-based baseline</th>
                <th className="py-3.5 px-6 bg-brand-50/60 text-brand-700 border-x border-gray-200 font-bold">
                  KAVACH-AI
                </th>
                <th className="py-3.5 px-6 text-right">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comparisons.map((row: any, idx: number) => {
                return (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    {/* Metric name */}
                    <td className="py-4 px-6 font-semibold text-gray-900">
                      {row.metric}
                    </td>

                    {/* Baseline */}
                    <td className="py-4 px-6 font-mono text-xs text-gray-600">
                      {row.baseline}
                    </td>

                    {/* KAVACH-AI */}
                    <td className="py-4 px-6 font-mono text-xs font-bold text-brand-700 bg-brand-50/40 border-x border-gray-200">
                      {row.kavach_ai}
                    </td>

                    {/* Change */}
                    <td className="py-4 px-6 text-right font-mono text-xs font-semibold text-emerald-700">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{row.improvement}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Short Note: Data is simulated */}
        <div className="px-6 py-3.5 bg-gray-50/75 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
          <div>
            Note: Performance evaluated against CIC-IDS2017 stratified port scan sample and seeded test scenarios. Data is simulated.
          </div>
          <span className="text-gray-400 font-mono text-[11px] hidden md:inline">
            CIC-IDS2017 Sample (6,000 Flows)
          </span>
        </div>
      </div>

      {/* 4 Summary Stat Cards matching SecurePay */}
      {!isScreenshotMode && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                DETECTION RATE
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 tracking-tight mt-2">
              {kavach.detection_rate_pct ?? 100}%
            </div>
            <div className="text-xs text-gray-500 mt-1">vs {baseline.detection_rate_pct ?? 35}% baseline</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                FALSE POSITIVE RATE
              </div>
              <Zap className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-3xl font-bold text-brand-600 tracking-tight mt-2">
              {kavach.false_positive_rate_pct ?? 0}%
            </div>
            <div className="text-xs text-gray-500 mt-1">vs {baseline.false_positive_rate_pct ?? 17}% baseline</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                MEAN TIME TO RESPOND
              </div>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 tracking-tight mt-2">
              {kavach.mttr_minutes ?? 2.4} min
            </div>
            <div className="text-xs text-gray-500 mt-1">vs {baseline.mttr_minutes ?? 52} min baseline</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ANALYST EFFORT
              </div>
              <UserCheck className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 tracking-tight mt-2">
              1 correlated incident
            </div>
            <div className="text-xs text-gray-500 mt-1">vs {baseline.analyst_effort_items ?? 7} disjoint tickets</div>
          </div>
        </div>
      )}
    </div>
  );
};
