import requests

RENDER_URL = "https://kavach-ai-backend-rcyi.onrender.com"

def verify_live_backend():
    print("1. Testing live Render /health...")
    r = requests.get(f"{RENDER_URL}/health", timeout=15)
    print("Health response:", r.status_code, r.json())
    assert r.status_code == 200

    print("\n2. Testing Scenario A events...")
    r = requests.get(f"{RENDER_URL}/scenarios/scenario_a/events", timeout=15)
    assert r.status_code == 200
    events_a = r.json()["events"]
    print(f"Scenario A: {len(events_a)} events retrieved")

    print("\n3. Testing Detect on Render...")
    r = requests.post(f"{RENDER_URL}/detect", json={"events": events_a}, timeout=15)
    assert r.status_code == 200
    detected_a = r.json()["scored_events"]
    print(f"Detected {len(detected_a)} scored events")

    print("\n4. Testing Correlate on Render...")
    r = requests.post(f"{RENDER_URL}/correlate", json={"events": detected_a, "scenario_id": "scenario_a"}, timeout=15)
    assert r.status_code == 200
    corr_a = r.json()
    incidents_a = corr_a["correlated_incidents"]
    print(f"Correlated {len(incidents_a)} incident: {incidents_a[0]['incident_id']} with {incidents_a[0]['event_count']} events")

    print("\n5. Testing Live Gemini Triage on Render...")
    r = requests.post(f"{RENDER_URL}/triage", json={"incident": incidents_a[0]}, timeout=30)
    assert r.status_code == 200
    triage_a = r.json()
    print("Triage mode:", triage_a.get("triage_mode"))
    print("Confidence:", triage_a.get("confidence_score"))
    print("Actions:", len(triage_a.get("recommended_actions", [])))

    print("\n6. Testing Scenario B...")
    r = requests.get(f"{RENDER_URL}/scenarios/scenario_b/events", timeout=15)
    events_b = r.json()["events"]
    r = requests.post(f"{RENDER_URL}/detect", json={"events": events_b}, timeout=15)
    detected_b = r.json()["scored_events"]
    r = requests.post(f"{RENDER_URL}/correlate", json={"events": detected_b, "scenario_id": "scenario_b"}, timeout=15)
    corr_b = r.json()
    incidents_b = corr_b["correlated_incidents"]
    print(f"Scenario B correlated: {incidents_b[0]['incident_id']} with {incidents_b[0]['event_count']} events")

    print("\n7. Testing Benchmark on Render...")
    r = requests.get(f"{RENDER_URL}/benchmark", timeout=15)
    assert r.status_code == 200
    bench = r.json()
    print(f"Benchmark comparisons: {len(bench['detailed_comparison'])} rows")

    print("\n8. Testing Audit Log on Render...")
    r = requests.get(f"{RENDER_URL}/audit-log", timeout=15)
    assert r.status_code == 200
    audit = r.json()
    print(f"Audit entries on Render: {len(audit['logs'])}")

    print("\nALL LIVE RENDER BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    verify_live_backend()
