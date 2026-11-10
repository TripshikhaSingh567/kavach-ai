"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, FastForward, ShieldAlert, Activity, CheckCircle2, AlertTriangle, Eye, Layers, ArrowRight, Zap } from "lucide-react";

interface DashboardViewProps {
  scenarioId: string;
  setScenarioId: (id: string) => void;
  rawEvents: any[];
  detectedEvents: any[];
  onCorrelate: () => void;
  onSelectEventForInspector?: (event: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  scenarioId,
  setScenarioId,
  rawEvents,
  detectedEvents,
  onCorrelate,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [streamIndex, setStreamIndex] = useState(4); // Start with initial batch visible
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    if (streamIndex >= detectedEvents.length) return;

    const intervalMs = Math.max(500, Math.floor(2500 / playbackSpeed));
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

  const handleInstantAll = () => {
    setStreamIndex(detectedEvents.length);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Scenario Selector & Replay Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Scenario Switcher Card */}
        <div className="lg:col-span-6 p-4 rounded-xl border border-soc-border bg-soc-card shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Attack Scenario Emulation</span>
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Seeded Randomness (Reproducible)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setScenarioId("scenario_a");
                handleReset();
              }}
              className={`p-3 rounded-lg border text-left transition-all ${
                scenarioId === "scenario_a"
                  ? "border-cyan-500/80 bg-cyan-950/30 shadow-md shadow-cyan-950/50"
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
              }`}
            >
              <div className="text-xs font-bold text-white mb-1">Scenario A: Phishing Compromise</div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Spearphishing link, impossible travel Bucharest login, Exchange forwarding rule, financial exfiltration.
              </p>
              <div className="mt-2 text-[10px] font-mono text-cyan-400">T1566 &bull; T1078 &bull; T1114 &bull; T1020</div>
            </button>

            <button
              onClick={() => {
                setScenarioId("scenario_b");
                handleReset();
              }}
              className={`p-3 rounded-lg border text-left transition-all ${
                scenarioId === "scenario_b"
                  ? "border-cyan-500/80 bg-cyan-950/30 shadow-md shadow-cyan-950/50"
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
              }`}
            >
              <div className="text-xs font-bold text-white mb-1">Scenario B: Lateral Movement</div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Subnet port scan, PsExec remote execution, svc_deploy reuse across tier-1 hosts, LSASS memory injection.
              </p>
              <div className="mt-2 text-[10px] font-mono text-cyan-400">T1046 &bull; T1021 &bull; T1078 &bull; T1068</div>
            </button>
          </div>
        </div>

        {/* Playback Controls & Streaming Progress */}
        <div className="lg:col-span-6 p-4 rounded-xl border border-soc-border bg-soc-card shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Stream Replay Controller</span>
              </span>
              <span className="text-xs font-mono text-cyan-300">
                {visibleEvents.length} / {detectedEvents.length} Events Streamed
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 mb-4 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(visibleEvents.length / Math.max(1, detectedEvents.length)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? "Pause Stream" : "Play Stream"}</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs border border-slate-700 transition-colors"
                title="Reset stream to beginning"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleInstantAll}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs border border-slate-700 transition-colors"
                title="Stream all events immediately"
              >
                <FastForward className="w-3.5 h-3.5 text-cyan-400" />
                <span>Load All</span>
              </button>
            </div>

            {/* Speed pills */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-[10px] text-slate-500 px-1">Speed:</span>
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    playbackSpeed === speed
                      ? "bg-cyan-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SOC Telemetry Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-soc-border bg-soc-card">
          <div className="text-xs font-mono text-slate-400 uppercase">Ingested Telemetry</div>
          <div className="text-2xl font-black text-white mt-1 font-mono">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-1">Live buffer entries</div>
        </div>

        <div className="p-4 rounded-xl border border-rose-900/40 bg-rose-950/10">
          <div className="text-xs font-mono text-rose-400 uppercase">Critical Threat Alerts</div>
          <div className="text-2xl font-black text-rose-400 mt-1 font-mono">{stats.critical}</div>
          <div className="text-[11px] text-rose-300/70 mt-1">Composite Risk &ge; 75</div>
        </div>

        <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-950/10">
          <div className="text-xs font-mono text-amber-400 uppercase">Suspicious / High Risk</div>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">{stats.high}</div>
          <div className="text-[11px] text-amber-300/70 mt-1">Risk between 55 - 74</div>
        </div>

        <div className="p-4 rounded-xl border border-soc-border bg-soc-card">
          <div className="text-xs font-mono text-slate-400 uppercase">Noise &amp; Benign Filtered</div>
          <div className="text-2xl font-black text-cyan-400 mt-1 font-mono">{stats.noise}</div>
          <div className="text-[11px] text-slate-500 mt-1">Scanner, dups, healthchecks</div>
        </div>
      </div>

      {/* Main Alert Feed & 3-Way Detection Scoring Table */}
      <div className="rounded-xl border border-soc-border bg-soc-card shadow-lg overflow-hidden">
        <div className="p-4 border-b border-soc-border flex flex-wrap items-center justify-between gap-3 bg-slate-900/40">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Ingestion &amp; 3-Score Threat Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Isolation Forest Anomaly (35%) + HistGB Classifier (35%) + Sigma Rule Match (30%)
            </p>
          </div>

          <button
            onClick={onCorrelate}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 transition-all"
          >
            <span>Correlate Alerts with NetworkX</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Event ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Alert Title &amp; Description</th>
                <th className="px-4 py-3">Entities</th>
                <th className="px-4 py-3">MITRE ATT&amp;CK</th>
                <th className="px-4 py-3 text-center">3-Score Risk Breakdown</th>
                <th className="px-4 py-3 text-right">Composite Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {visibleEvents.map((evt) => {
                const isCrit = evt.risk_score >= 75;
                const isHi = evt.risk_score >= 55 && evt.risk_score < 75;
                const isMed = evt.risk_score >= 35 && evt.risk_score < 55;
                const isDup = evt.is_duplicate;
                const isFP = evt.is_false_positive;
                const isInj = evt.is_prompt_injection;
                const isMiss = evt.is_missing_logs;

                return (
                  <tr
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    {/* Event ID */}
                    <td className="px-4 py-3 font-mono font-medium text-slate-300 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className={isCrit ? "text-rose-400" : isHi ? "text-amber-400" : "text-cyan-400"}>
                          &bull;
                        </span>
                        <span>{evt.id}</span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    {/* Title & Desc */}
                    <td className="px-4 py-3 max-w-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-200">{evt.title}</span>
                        {isDup && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Duplicate
                          </span>
                        )}
                        {isFP && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                            Scanner FP
                          </span>
                        )}
                        {isInj && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                            Injection Defended
                          </span>
                        )}
                        {isMiss && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                            Missing Logs
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5" title={evt.description}>
                        {evt.description}
                      </p>
                    </td>

                    {/* Entities */}
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                      <div>Host: <span className="text-cyan-300">{evt.host || "None"}</span></div>
                      <div>User: <span className="text-purple-300">{evt.user || "None"}</span></div>
                      <div>IP: <span className="text-emerald-300">{evt.source_ip || "None"}</span></div>
                    </td>

                    {/* MITRE ATT&CK */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {evt.mitre_technique_id ? (
                        <div className="inline-flex flex-col">
                          <span className="font-mono text-xs font-bold text-rose-400">
                            {evt.mitre_technique_id}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {evt.mitre_technique_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600 font-mono text-[11px]">Unmapped (Benign)</span>
                      )}
                    </td>

                    {/* 3-Score Breakdown */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-2 text-[10px] font-mono">
                        <div className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-center" title="Isolation Forest (Unsupervised Anomaly)">
                          <div className="text-slate-500">IsoForest</div>
                          <div className="font-bold text-cyan-400">{evt.score_contributions?.isolation_forest?.score || 0}</div>
                        </div>
                        <div className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-center" title="HistGradientBoosting (Known PortScan Classifier)">
                          <div className="text-slate-500">HistGB</div>
                          <div className="font-bold text-blue-400">{evt.score_contributions?.classifier?.score || 0}</div>
                        </div>
                        <div className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-center" title="Sigma Rules Engine">
                          <div className="text-slate-500">Sigma</div>
                          <div className="font-bold text-amber-400">{evt.score_contributions?.sigma?.score || 0}</div>
                        </div>
                      </div>
                    </td>

                    {/* Composite Risk */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span
                        className={`inline-block font-mono font-bold text-xs px-2.5 py-1 rounded ${
                          isCrit
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 glow-rose"
                            : isHi
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 glow-amber"
                            : isMed
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {evt.risk_score} / 100
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Event Detail Modal / Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-soc-card border border-soc-borderLight rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <span className="font-mono font-bold text-sm text-white">Event Telemetry Inspector: {selectedEvent.id}</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 rounded bg-slate-800"
              >
                Close &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-slate-400 text-[11px] uppercase font-mono">Title</div>
                <div className="text-white font-bold text-sm mt-0.5">{selectedEvent.title}</div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px] uppercase font-mono">Full Log Payload</div>
                <div className="p-3 rounded bg-slate-950 font-mono text-slate-300 border border-slate-800 break-words mt-1">
                  {selectedEvent.description}
                </div>
              </div>

              {/* 3-Score Breakdown Detail */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-cyan-400 font-mono font-bold">Isolation Forest</div>
                  <div className="text-lg font-black text-white mt-1 font-mono">
                    {selectedEvent.score_contributions?.isolation_forest?.score}
                  </div>
                  <div className="text-[10px] text-slate-500">Weight: 35% &bull; Contrib: {selectedEvent.score_contributions?.isolation_forest?.contribution}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-blue-400 font-mono font-bold">HistGB Classifier</div>
                  <div className="text-lg font-black text-white mt-1 font-mono">
                    {selectedEvent.score_contributions?.classifier?.score}
                  </div>
                  <div className="text-[10px] text-slate-500">Weight: 35% &bull; Contrib: {selectedEvent.score_contributions?.classifier?.contribution}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-amber-400 font-mono font-bold">Sigma Rules</div>
                  <div className="text-lg font-black text-white mt-1 font-mono">
                    {selectedEvent.score_contributions?.sigma?.score}
                  </div>
                  <div className="text-[10px] text-slate-500">Weight: 30% &bull; Contrib: {selectedEvent.score_contributions?.sigma?.contribution}</div>
                </div>
              </div>

              {selectedEvent.score_contributions?.sigma?.matched_rules?.length > 0 && (
                <div>
                  <div className="text-slate-400 text-[11px] uppercase font-mono">Matched Sigma Signatures</div>
                  <div className="space-y-1.5 mt-1">
                    {selectedEvent.score_contributions.sigma.matched_rules.map((r: any) => (
                      <div key={r.id} className="p-2 rounded bg-amber-950/20 border border-amber-900/40 text-amber-300 font-mono text-[11px] flex justify-between">
                        <span>{r.id}: {r.title}</span>
                        <span className="font-bold">+{r.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
