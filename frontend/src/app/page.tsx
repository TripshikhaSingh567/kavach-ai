"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardView } from "@/components/views/DashboardView";
import { IncidentDetailView } from "@/components/views/IncidentDetailView";
import { ApprovalsView } from "@/components/views/ApprovalsView";
import { RobustnessView } from "@/components/views/RobustnessView";
import { BenchmarkView } from "@/components/views/BenchmarkView";
import { ArchitectureView } from "@/components/views/ArchitectureView";
import { AuditLogView } from "@/components/views/AuditLogView";
import {
  checkBackendHealth,
  fetchScenarioEvents,
  detectEvents,
  correlateEvents,
  triageIncident,
  fetchBenchmark,
  fetchAuditLogs,
  HealthState
} from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [scenarioId, setScenarioId] = useState<string>("scenario_a");
  const [health, setHealth] = useState<HealthState>({ status: "WARMING_UP" });

  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [detectedEvents, setDetectedEvents] = useState<any[]>([]);
  const [correlatedData, setCorrelatedData] = useState<any>(null);
  const [triageData, setTriageData] = useState<any>(null);
  const [benchmarkData, setBenchmarkData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [isLoadingPipeline, setIsLoadingPipeline] = useState<boolean>(true);
  const [isLoadingTriage, setIsLoadingTriage] = useState<boolean>(false);

  // Initialize and check health on load
  const initApp = useCallback(async () => {
    setIsLoadingPipeline(true);
    // 10s timeout ping to backend
    const h = await checkBackendHealth(10000);
    setHealth(h);

    try {
      // Load scenario events
      const events = await fetchScenarioEvents(scenarioId);
      setRawEvents(events);

      // Run 3-way detection
      const scored = await detectEvents(events);
      setDetectedEvents(scored);

      // Run correlation
      const correlated = await correlateEvents(scored, scenarioId);
      setCorrelatedData(correlated);

      // Load benchmark & audit log in parallel
      const [bench, logs] = await Promise.all([fetchBenchmark(), fetchAuditLogs()]);
      setBenchmarkData(bench);
      setAuditLogs(logs);

      // Triage primary incident
      if (correlated?.correlated_incidents?.length > 0) {
        setIsLoadingTriage(true);
        const triage = await triageIncident(correlated.correlated_incidents[0], scenarioId);
        setTriageData(triage);
        setIsLoadingTriage(false);
      }
    } catch (err) {
      console.error("Initialization error:", err);
    } finally {
      setIsLoadingPipeline(false);
    }
  }, [scenarioId]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  const handleCorrelate = () => {
    setActiveTab("incident");
  };

  const handleRefreshAudit = async () => {
    const logs = await fetchAuditLogs();
    setAuditLogs(logs);
  };

  return (
    <div className="min-h-screen bg-soc-bg flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        onRetryHealth={initApp}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {isLoadingPipeline && !detectedEvents.length ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <div className="text-sm font-mono text-slate-300">
              Initializing KAVACH-AI Pipeline &amp; Telemetry Streams...
            </div>
            <div className="text-xs font-mono text-slate-500">
              Pinging backend / loading CIC-IDS2017 detection models
            </div>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <DashboardView
                scenarioId={scenarioId}
                setScenarioId={setScenarioId}
                rawEvents={rawEvents}
                detectedEvents={detectedEvents}
                onCorrelate={handleCorrelate}
              />
            )}

            {activeTab === "incident" && (
              <IncidentDetailView
                correlatedData={correlatedData}
                triageData={triageData}
                onNavigateToApprovals={() => setActiveTab("approvals")}
                isLoadingTriage={isLoadingTriage}
              />
            )}

            {activeTab === "approvals" && (
              <ApprovalsView
                triageData={triageData}
                incidentId={correlatedData?.correlated_incidents?.[0]?.incident_id}
                onActionUpdated={handleRefreshAudit}
              />
            )}

            {activeTab === "robustness" && <RobustnessView />}

            {activeTab === "benchmark" && <BenchmarkView benchmarkData={benchmarkData} />}

            {activeTab === "architecture" && <ArchitectureView />}

            {activeTab === "audit" && <AuditLogView logs={auditLogs} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-soc-border py-4 px-6 text-center text-xs font-mono text-slate-500 bg-soc-bg">
        <div className="flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto">
          <span>KAVACH-AI &bull; Autonomous AI Cyber-Resilience Prototype</span>
          <span className="text-slate-600">Simulated Data &bull; Ground Truth CIC-IDS2017 Sample &bull; MITRE ATT&amp;CK Matrix</span>
        </div>
      </footer>
    </div>
  );
}
