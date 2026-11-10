import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
import json

client = TestClient(app)

def test_endpoints():
    print("Testing /health...")
    r = client.get("/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    health_data = r.json()
    print("Health response:", health_data)
    assert health_data["status"] == "ok"
    assert health_data["models_loaded"] is True

    print("\nTesting /scenarios...")
    r = client.get("/scenarios")
    assert r.status_code == 200
    scenarios = r.json()
    print(f"Loaded {len(scenarios)} scenarios: {[s['id'] for s in scenarios]}")

    print("\nTesting /scenarios/scenario_a/events...")
    r = client.get("/scenarios/scenario_a/events")
    assert r.status_code == 200
    events_data = r.json()
    events = events_data["events"]
    print(f"Retrieved {len(events)} events for Scenario A")

    print("\nTesting /detect...")
    r = client.post("/detect", json={"events": events})
    assert r.status_code == 200
    scored_events = r.json()["scored_events"]
    print(f"Scored {len(scored_events)} events. First event risk: {scored_events[0]['risk_score']}")

    print("\nTesting /correlate...")
    r = client.post("/correlate", json={"events": scored_events, "scenario_id": "scenario_a"})
    assert r.status_code == 200
    corr = r.json()
    incidents = corr["correlated_incidents"]
    print(f"Correlated into {len(incidents)} incident(s): {incidents[0]['incident_id']} with {incidents[0]['event_count']} events")
    assert len(incidents[0]["attack_graph"]["nodes"]) > 0

    print("\nTesting /triage...")
    r = client.post("/triage", json={"incident": incidents[0]})
    assert r.status_code == 200
    triage = r.json()
    print("Triage mode:", triage.get("triage_mode"))
    print("Triage confidence:", triage.get("confidence_score"))
    print("What happened:", triage.get("what_likely_happened")[:100], "...")
    print("Actions:", len(triage.get("recommended_actions", [])))

    print("\nTesting /actions/approve...")
    first_act = triage["recommended_actions"][-1]
    r = client.post("/actions/approve", json={
        "action_id": first_act["id"],
        "action_title": first_act["title"],
        "target": first_act["target"],
        "incident_id": incidents[0]["incident_id"]
    })
    assert r.status_code == 200
    print("Approve response:", r.json())

    print("\nTesting /benchmark...")
    r = client.get("/benchmark")
    assert r.status_code == 200
    bench = r.json()
    print("Benchmark comparison rows:", len(bench["detailed_comparison"]))
    for row in bench["detailed_comparison"]:
        print(f" - {row['metric']}: Baseline {row['baseline']} vs KAVACH {row['kavach_ai']} ({row['improvement']})")

    print("\nTesting /audit-log...")
    r = client.get("/audit-log")
    assert r.status_code == 200
    logs = r.json()["logs"]
    print(f"Audit log records: {len(logs)}")

    print("\nALL BACKEND ENDPOINTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
