"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Server,
  User,
  Globe,
  Radio,
  Sliders,
  Activity,
  ShieldAlert,
  AlertTriangle,
  Filter
} from "lucide-react";

interface DashboardViewProps {
  scenarioId: string;
  setScenarioId: (id: string) => void;
  rawEvents: any[];
  detectedEvents: any[];
  onCorrelate: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  scenarioId,
  setScenarioId,
  rawEvents,
  detectedEvents,
  onCorrelate,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [streamIndex, setStreamIndex] = useState(4);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;
    if (streamIndex >= detectedEvents.length) return;

    const intervalMs = Math.max(500, Math.floor(2200 / playbackSpeed));
    const timer = setInterval(() => {
      setStreamIndex((prev) => {
        if (prev < detectedEvents.length) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, streamIndex, detectedEvents.length, playbackSpeed]);

  const visibleEvents = detectedEvents.slice(0, streamIndex);

  const stats = {
    total: visibleEvents.length,
    critical: visibleEvents.filter((e) => e.risk_score >= 75).length,
    high: visibleEvents.filter((e) => e.risk_score >= 55 && e.risk_score < 75).length,
    noise: visibleEvents.filter((e) => !e.is_malicious || e.is_duplicate || e.is_false_positive).length,
  };

  const handleReset = () => {
    setStreamIndex(1);
    setIsPlaying(true);
  };

  const handleLoadAll = () => {
    setStreamIndex(detectedEvents.length);
    setIsPlaying(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Live Feed</h2>
          <p className="text-sm text-gray-500 mt-1">
            Streaming endpoint and network telemetry with three-score threat evaluation.
          </p>
        </div>

        <button
          onClick={onCorrelate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all shadow-xs self-start sm:self-auto"
        >
          <span>Correlate incident</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Scenario Selector: Clean Rows / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => {
            setScenarioId("scenario_a");
            handleReset();
          }}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            scenarioId === "scenario_a"
              ? "bg-white border-brand-600 shadow-xs ring-2 ring-brand-100"
              : "bg-white border-gray-200 hover:border-gray-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">
              Scenario A: Phishing credential compromise
            </span>
            {scenarioId === "scenario_a" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                <span>Active</span>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            Spearphishing email click, impossible travel authentication from Romania, mailbox forwarding rule, and sensitive data access over SMB.
          </p>
          <div className="mt-3 text-xs font-mono text-gray-500 flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">MITRE:</span> T1566 &bull; T1078 &bull; T1114 &bull; T1020
          </div>
        </div>

        <div
          onClick={() => {
            setScenarioId("scenario_b");
            handleReset();
          }}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            scenarioId === "scenario_b"
              ? "bg-white border-brand-600 shadow-xs ring-2 ring-brand-100"
              : "bg-white border-gray-200 hover:border-gray-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">
              Scenario B: Lateral movement
            </span>
            {scenarioId === "scenario_b" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                <span>Active</span>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            Internal subnet port scan, remote service execution via PsExec, service credential reuse across hosts, and LSASS memory access.
          </p>
          <div className="mt-3 text-xs font-mono text-gray-500 flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">MITRE:</span> T1046 &bull; T1021 &bull; T1078 &bull; T1068
          </div>
        </div>
      </div>

      {/* Toolbar: Replay Controls */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleLoadAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors shadow-xs"
          >
            <FastForward className="w-3.5 h-3.5 text-gray-500" />
            <span>Load all</span>
          </button>
        </div>

        {/* Speed Controls & Count */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-gray-500 mr-1 font-medium">Speed:</span>
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  playbackSpeed === speed
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-500">
            Showing <strong className="text-gray-900 font-semibold">{visibleEvents.length}</strong> of {detectedEvents.length} events
          </span>
        </div>
      </div>

      {/* 4 Stat Cards matching SecurePay Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              INGESTED EVENTS
            </div>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight mt-2">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">Stream buffer telemetry</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>CRITICAL ALERTS</span>
            </div>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-bold text-rose-600 tracking-tight mt-2">{stats.critical}</div>
          <div className="text-xs text-gray-500 mt-1">Risk score &ge; 75</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span>HIGH-RISK ALERTS</span>
            </div>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-orange-600 tracking-tight mt-2">{stats.high}</div>
          <div className="text-xs text-gray-500 mt-1">Risk score 55–74</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>FILTERED NOISE</span>
            </div>
            <Filter className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight mt-2">{stats.noise}</div>
          <div className="text-xs text-gray-500 mt-1">Benign and duplicates</div>
        </div>
      </div>

      {/* Event Table with Expandable Row Breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Recent security events</h3>
            <p className="text-xs text-gray-500 mt-0.5">Click any row to inspect the three-score detection breakdown.</p>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {visibleEvents.length} events recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm table-fixed">
            <thead className="bg-gray-50/75 text-gray-500 font-semibold text-[11px] uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-6 w-28">Time</th>
                <th className="py-3.5 px-6 w-5/12">Event</th>
                <th className="py-3.5 px-6 w-44">Host / User</th>
                <th className="py-3.5 px-6 w-44">Technique</th>
                <th className="py-3.5 px-6 text-right w-36">Risk score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleEvents.map((evt) => {
                const isCrit = evt.risk_score >= 75;
                const isHi = evt.risk_score >= 55 && evt.risk_score < 75;
                const isExpanded = expandedEventId === evt.id;

                return (
                  <React.Fragment key={evt.id}>
                    <tr
                      onClick={() => toggleExpand(evt.id)}
                      className={`cursor-pointer transition-colors ${
                        isExpanded ? "bg-brand-50/40" : "hover:bg-gray-50/70"
                      }`}
                    >
                      {/* Time */}
                      <td className="py-3.5 px-6 text-xs font-mono text-gray-500 whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      {/* Title & Badges */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center space-x-2 truncate">
                          <span className="font-semibold text-gray-900 truncate">{evt.title}</span>
                          {evt.is_duplicate && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium flex-shrink-0">
                              Duplicate
                            </span>
                          )}
                          {evt.is_false_positive && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium flex-shrink-0">
                              Scanner
                            </span>
                          )}
                          {evt.is_prompt_injection && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium flex-shrink-0">
                              Injection defended
                            </span>
                          )}
                          {evt.is_missing_logs && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium flex-shrink-0">
                              Incomplete
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1 truncate">
                          {evt.id} &bull; {evt.description}
                        </div>
                      </td>

                      {/* Host / User */}
                      <td className="py-3.5 px-6 text-xs font-mono text-gray-600 truncate">
                        <div className="truncate">
                          Host: <span className="text-gray-900 font-medium">{evt.host || "N/A"}</span>
                        </div>
                        <div className="truncate mt-0.5">
                          User: <span className="text-gray-900 font-medium">{evt.user || "N/A"}</span>
                        </div>
                      </td>

                      {/* Technique */}
                      <td className="py-3.5 px-6 truncate">
                        {evt.mitre_technique_id ? (
                          <div className="truncate">
                            <span className="text-xs font-mono font-bold text-brand-600">
                              {evt.mitre_technique_id}
                            </span>
                            <div className="text-xs text-gray-500 truncate mt-0.5">
                              {evt.mitre_technique_name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-mono">Unmapped</span>
                        )}
                      </td>

                      {/* Single Risk Score Number */}
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-2 justify-end w-full">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              isCrit
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : isHi
                                ? "bg-orange-50 text-orange-700 border border-orange-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isCrit ? "bg-rose-500" : isHi ? "bg-orange-500" : "bg-emerald-500"
                              }`}
                            />
                            <span>{evt.risk_score}</span>
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable 3-Score Breakdown */}
                    {isExpanded && (
                      <tr className="bg-gray-50/60">
                        <td colSpan={5} className="py-4 px-6 border-b border-gray-200">
                          <div className="space-y-3">
                            <div className="text-xs font-bold text-gray-900">
                              Threat score breakdown for {evt.id}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                                <div className="text-xs font-medium text-gray-500">Isolation Forest (anomaly)</div>
                                <div className="text-xl font-bold text-gray-900 mt-1">
                                  {evt.score_contributions?.isolation_forest?.score ?? 0}
                                </div>
                                <div className="text-[11px] text-gray-500 mt-0.5">
                                  Weight: 35% &bull; Contribution: {evt.score_contributions?.isolation_forest?.contribution ?? 0}
                                </div>
                              </div>

                              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                                <div className="text-xs font-medium text-gray-500">Gradient boosted classifier</div>
                                <div className="text-xl font-bold text-gray-900 mt-1">
                                  {evt.score_contributions?.classifier?.score ?? 0}
                                </div>
                                <div className="text-[11px] text-gray-500 mt-0.5">
                                  Weight: 35% &bull; Contribution: {evt.score_contributions?.classifier?.contribution ?? 0}
                                </div>
                              </div>

                              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                                <div className="text-xs font-medium text-gray-500">Sigma rule matches</div>
                                <div className="text-xl font-bold text-gray-900 mt-1">
                                  {evt.score_contributions?.sigma?.score ?? 0}
                                </div>
                                <div className="text-[11px] text-gray-500 mt-0.5">
                                  Weight: 30% &bull; Contribution: {evt.score_contributions?.sigma?.contribution ?? 0}
                                </div>
                              </div>
                            </div>

                            {evt.score_contributions?.sigma?.matched_rules?.length > 0 && (
                              <div className="pt-2">
                                <div className="text-xs font-semibold text-gray-700 mb-1.5">Matched rules:</div>
                                <div className="flex flex-wrap gap-2">
                                  {evt.score_contributions.sigma.matched_rules.map((rule: any) => (
                                    <span
                                      key={rule.id}
                                      className="text-xs px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-800 shadow-xs"
                                    >
                                      <strong className="text-brand-600">{rule.id}</strong>: {rule.title}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
