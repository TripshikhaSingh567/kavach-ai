const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface HealthState {
  status: "ONLINE" | "FALLBACK" | "WARMING_UP" | "ERROR";
  models_loaded?: boolean;
  llm_provider?: string;
  is_fallback?: boolean;
  message?: string;
}

// Global cache to track if we fell back
let isFallbackActive = false;

export async function checkBackendHealth(timeoutMs = 10000): Promise<HealthState> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}/health`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      isFallbackActive = false;
      return {
        status: "ONLINE",
        models_loaded: data.models_loaded,
        llm_provider: data.llm_provider,
        is_fallback: false,
      };
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn("Backend unavailable or timed out, loading fallback snapshots:", err?.message || err);
    isFallbackActive = true;

    // Check precomputed fallback health
    try {
      const fbRes = await fetch("/fallback/health.json");
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        return {
          status: "FALLBACK",
          models_loaded: fbData.models_loaded,
          llm_provider: fbData.llm_provider,
          is_fallback: true,
          message: "Render backend is waking up or offline. Active mode: Precomputed Snapshot Fallback.",
        };
      }
    } catch {
      // ignore
    }

    return {
      status: "FALLBACK",
      is_fallback: true,
      message: "Render free tier asleep. Fallback snapshots loaded.",
    };
  }
}

export function getIsFallback(): boolean {
  return isFallbackActive;
}

export async function fetchScenarioEvents(scenarioId: string): Promise<any[]> {
  if (!isFallbackActive) {
    try {
      const res = await fetch(`${API_BASE}/scenarios/${scenarioId}/events`);
      if (res.ok) {
        const data = await res.json();
        return data.events || [];
      }
    } catch (e) {
      console.warn("Fetch scenario events failed, falling back to static snapshot", e);
    }
  }
  const fbRes = await fetch(`/fallback/${scenarioId}_events.json`);
  const fbData = await fbRes.json();
  return fbData.events || [];
}

export async function detectEvents(events: any[]): Promise<any[]> {
  if (!isFallbackActive) {
    try {
      const res = await fetch(`${API_BASE}/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.scored_events || [];
      }
    } catch (e) {
      console.warn("Detection API failed, using fallback detected snapshot", e);
    }
  }
  const scenarioId = events[0]?.scenario_id || "scenario_a";
  const fbRes = await fetch(`/fallback/${scenarioId}_detected.json`);
  const fbData = await fbRes.json();
  return fbData.scored_events || [];
}

export async function correlateEvents(events: any[], scenarioId = "scenario_a"): Promise<any> {
  if (!isFallbackActive) {
    try {
      const res = await fetch(`${API_BASE}/correlate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events, scenario_id: scenarioId }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Correlation API failed, using fallback correlated snapshot", e);
    }
  }
  const fbRes = await fetch(`/fallback/${scenarioId}_correlated.json`);
  return await fbRes.json();
}

export async function triageIncident(incident: any, scenarioId = "scenario_a"): Promise<any> {
  if (!isFallbackActive) {
    try {
      const res = await fetch(`${API_BASE}/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incident }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Triage API failed, using fallback triage snapshot", e);
    }
  }
  const fbRes = await fetch(`/fallback/${scenarioId}_triage.json`);
  return await fbRes.json();
}

export async function approveAction(payload: {
  action_id: string;
  action_title: string;
  target: string;
  incident_id: string;
  analyst_name?: string;
  reason?: string;
}): Promise<any> {
  if (!isFallbackActive) {
    try {
      const res = await fetch(`${API_BASE}/actions/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Approve action API failed, simulating approval locally", e);
    }
  }
  return {
    status: "approved",
    action_id: payload.action_id,
    audit_entry_id: `AUD-LOCAL-${Date.now().toString().slice(-4)}`,
    message: `High-impact action '${payload.action_title}' approved and executed (Snapshot mode).`,
  };
}

export async function rejectAction(payload: {
  action_id: string;
  action_title: string;
  target: string;
  incident_id: string;
  analyst_name?: string;
  reason?: string;
}): Promise<any> {
  if (!isFallbackActive) {
    try {
      const res = await fetch(`${API_BASE}/actions/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Reject action API failed, simulating rejection locally", e);
    }
  }
  return {
    status: "rejected",
    action_id: payload.action_id,
    audit_entry_id: `AUD-LOCAL-${Date.now().toString().slice(-4)}`,
    message: `Action '${payload.action_title}' rejected (Snapshot mode).`,
  };
}

export async function fetchBenchmark(): Promise<any> {
  if (!isFallbackActive) {
    try {
      const res = await fetch(`${API_BASE}/benchmark`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Benchmark API failed, using fallback benchmark snapshot", e);
    }
  }
  const fbRes = await fetch("/fallback/benchmark.json");
  return await fbRes.json();
}

export async function fetchAuditLogs(): Promise<any[]> {
  if (!isFallbackActive) {
    try {
      const res = await fetch(`${API_BASE}/audit-log`);
      if (res.ok) {
        const data = await res.json();
        return data.logs || [];
      }
    } catch (e) {
      console.warn("Audit log API failed, using fallback audit snapshot", e);
    }
  }
  const fbRes = await fetch("/fallback/audit_log.json");
  const fbData = await fbRes.json();
  return fbData.logs || [];
}
