import os
import json
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.scenarios import generate_scenario_events
from backend.app.detector import detect_batch
from backend.app.correlator import correlate_events
from backend.app.triage_agent import run_triage_agent
from backend.app.benchmark import get_benchmark_comparison
from backend.app.audit import get_all_audit_logs

FALLBACK_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "fallback"))
os.makedirs(FALLBACK_DIR, exist_ok=True)

def generate_snapshots():
    print(f"Generating fallback snapshots in {FALLBACK_DIR}...")
    
    # 1. Health
    health = {
        "status": "ok",
        "service": "KAVACH-AI (Precomputed Offline Snapshot)",
        "fallback_active": True,
        "models_loaded": True,
        "llm_provider": "Deterministic Fallback Engine",
        "replay_mode": "Simulated data / replay mode active"
    }
    with open(os.path.join(FALLBACK_DIR, "health.json"), "w") as f:
        json.dump(health, f, indent=2)

    # 2. Scenarios
    scenarios = [
        {
            "id": "scenario_a",
            "name": "Scenario A: Phishing-led Credential Compromise",
            "description": "Spearphishing link, impossible travel authentication, mailbox forwarding rule, sensitive data exfiltration.",
            "mitre_chain": ["T1566.002", "T1078.004", "T1114.003", "T1020"],
            "difficulty": "CRITICAL"
        },
        {
            "id": "scenario_b",
            "name": "Scenario B: Lateral Movement & Privilege Escalation",
            "description": "Internal subnet port scan, remote PsExec service execution, credential reuse, LSASS memory injection.",
            "mitre_chain": ["T1046", "T1021.002", "T1078.002", "T1068"],
            "difficulty": "CRITICAL"
        }
    ]
    with open(os.path.join(FALLBACK_DIR, "scenarios.json"), "w") as f:
        json.dump(scenarios, f, indent=2)

    for sc_id in ["scenario_a", "scenario_b"]:
        # Events
        events = generate_scenario_events(sc_id)
        with open(os.path.join(FALLBACK_DIR, f"{sc_id}_events.json"), "w") as f:
            json.dump({"scenario_id": sc_id, "count": len(events), "events": events}, f, indent=2)

        # Detected
        detected = detect_batch(events)
        with open(os.path.join(FALLBACK_DIR, f"{sc_id}_detected.json"), "w") as f:
            json.dump({"scored_events": detected}, f, indent=2)

        # Correlated
        correlated = correlate_events(detected, scenario_id=sc_id)
        with open(os.path.join(FALLBACK_DIR, f"{sc_id}_correlated.json"), "w") as f:
            json.dump(correlated, f, indent=2)

        # Triage
        if correlated.get("correlated_incidents"):
            inc = correlated["correlated_incidents"][0]
            triage = run_triage_agent(inc)
            triage["triage_mode"] = "deterministic_fallback (offline snapshot)"
            with open(os.path.join(FALLBACK_DIR, f"{sc_id}_triage.json"), "w") as f:
                json.dump(triage, f, indent=2)

    # Benchmark
    benchmark = get_benchmark_comparison()
    with open(os.path.join(FALLBACK_DIR, "benchmark.json"), "w") as f:
        json.dump(benchmark, f, indent=2)

    # Audit Log
    audit_data = {"logs": get_all_audit_logs()}
    with open(os.path.join(FALLBACK_DIR, "audit_log.json"), "w") as f:
        json.dump(audit_data, f, indent=2)

    print("All fallback JSON snapshots generated successfully!")

if __name__ == "__main__":
    generate_snapshots()
