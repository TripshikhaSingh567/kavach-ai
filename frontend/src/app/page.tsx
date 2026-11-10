"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isScreenshotMode, setIsScreenshotMode] = useState<boolean>(false);

  // Sync activeTab with URL hash
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (
        hash &&
        ["dashboard", "incident", "approvals", "robustness", "benchmark", "architecture", "audit"].includes(hash)
      ) {
        setActiveTab(hash);
      }
      const onHashChange = () => {
        const h = window.location.hash.replace("#", "");
        if (
          h &&
          ["dashboard", "incident", "approvals", "robustness", "benchmark", "architecture", "audit"].includes(h)
        ) {
          setActiveTab(h);
        }
      };
      window.addEventListener("hashchange", onHashChange);
      return () => window.removeEventListener("hashchange", onHashChange);
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.location.hash = tab;
    }
  };

  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [detectedEvents, setDetectedEvents] = useState<any[]>([]);
  const [correlatedData, setCorrelatedData] = useState<any>(null);
  const [triageData, setTriageData] = useState<any>(null);
  const [benchmarkData, setBenchmarkData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [isLoadingPipeline, setIsLoadingPipeline] = useState<boolean>(true);
  const [isLoadingTriage, setIsLoadingTriage] = useState<boolean>(false);

  const initApp = useCallback(async () => {
    setIsLoadingPipeline(true);
    const h = await checkBackendHealth(10000);
    setHealth(h);

    try {
      const events = await fetchScenarioEvents(scenarioId);
      setRawEvents(events);

      const scored = await detectEvents(events);
      setDetectedEvents(scored);

      const correlated = await correlateEvents(scored, scenarioId);
      setCorrelatedData(correlated);

      const [bench, logs] = await Promise.all([fetchBenchmark(), fetchAuditLogs()]);
      setBenchmarkData(bench);
      setAuditLogs(logs);

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
    if (typeof window !== "undefined") {
      window.location.hash = "incident";
    }
  };

  const handleRefreshAudit = async () => {
    const logs = await fetchAuditLogs();
    setAuditLogs(logs);
  };

  return (
    <div className={`min-h-screen ${isScreenshotMode ? "bg-white" : "bg-canvas"}`}>
      {/* Sidebar (hidden in slide screenshot mode) */}
      {!isScreenshotMode && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex flex-col min-h-screen ${!isScreenshotMode ? "lg:pl-64" : ""}`}>
        {/* Slim Top Bar */}
        {!isScreenshotMode && (
          <TopBar
            activeTab={activeTab}
            health={health}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onRefresh={initApp}
            isRefreshing={isLoadingPipeline}
          />
        )}

        {/* Content View */}
        <main
          className={`flex-1 p-6 md:p-8 ${
            isScreenshotMode ? "max-w-6xl mx-auto p-4" : "max-w-7xl w-full mx-auto"
          }`}
        >
          {isLoadingPipeline && !detectedEvents.length ? (
            <div className="py-28 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <div className="text-base font-bold text-gray-900">
                Loading security operations workspace...
              </div>
              <div className="text-xs text-gray-500">
                Testing service health and loading baseline telemetry
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
                  onNavigateToApprovals={() => handleTabChange("approvals")}
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

              {activeTab === "benchmark" && (
                <BenchmarkView
                  benchmarkData={benchmarkData}
                  isScreenshotMode={isScreenshotMode}
                  onToggleScreenshotMode={() => setIsScreenshotMode(!isScreenshotMode)}
                />
              )}

              {activeTab === "architecture" && <ArchitectureView />}

              {activeTab === "audit" && <AuditLogView logs={auditLogs} />}
            </>
          )}
        </main>

        {/* Quiet Footer (hidden in screenshot mode) */}
        {!isScreenshotMode && (
          <footer className="border-t border-gray-200 py-4 px-6 md:px-8 bg-white text-xs text-gray-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>KAVACH-AI &bull; Autonomous incident triage and containment</div>
              <div className="text-xs text-gray-400">
                Dataset: CIC-IDS2017 sample (6,000 flows) &bull; Replay mode active
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
