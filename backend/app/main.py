import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime, timezone

try:
    from backend.app.models_loader import load_models, iso_forest, gb_classifier
    from backend.app.scenarios import generate_scenario_events
    from backend.app.detector import detect_event, detect_batch
    from backend.app.correlator import correlate_events
    from backend.app.triage_agent import run_triage_agent, GEMINI_API_KEY
    from backend.app.benchmark import get_benchmark_comparison
    from backend.app.audit import append_audit_entry, get_all_audit_logs
except ImportError:
    from app.models_loader import load_models, iso_forest, gb_classifier
    from app.scenarios import generate_scenario_events
    from app.detector import detect_event, detect_batch
    from app.correlator import correlate_events
    from app.triage_agent import run_triage_agent, GEMINI_API_KEY
    from app.benchmark import get_benchmark_comparison
    from app.audit import append_audit_entry, get_all_audit_logs

app = FastAPI(
    title="KAVACH-AI Backend API",
    description="Autonomous Cyber-Resilience Engine - AI Alert Triage & Response",
    version="1.0.0"
)

# CORS setup
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DetectRequest(BaseModel):
    events: List[dict]

class CorrelateRequest(BaseModel):
    events: List[dict]
    scenario_id: Optional[str] = "scenario_a"

class TriageRequest(BaseModel):
    incident: dict

class ActionApprovalRequest(BaseModel):
    action_id: str
    action_title: str
    target: str
    incident_id: str
    analyst_name: Optional[str] = "trips (SOC Analyst)"
    reason: Optional[str] = "Authorized after verification of attack graph evidence."

class ActionRejectRequest(BaseModel):
    action_id: str
    action_title: str
    target: str
    incident_id: str
    analyst_name: Optional[str] = "trips (SOC Analyst)"
    reason: Optional[str] = "False positive suspected or pending additional confirmation."

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "KAVACH-AI Cyber-Resilience Engine",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "models_loaded": iso_forest is not None and gb_classifier is not None,
        "llm_provider": "Gemini (gemini-3.5-flash-lite)",
        "gemini_configured": bool(GEMINI_API_KEY),
        "replay_mode": "Simulated data / replay mode active"
    }

@app.get("/scenarios")
def get_scenarios():
    return [
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

@app.get("/scenarios/{scenario_id}/events")
def get_scenario_events(scenario_id: str):
    if scenario_id not in ["scenario_a", "scenario_b"]:
        raise HTTPException(status_code=404, detail="Scenario not found. Choose 'scenario_a' or 'scenario_b'.")
    
    events = generate_scenario_events(scenario_id)
    return {
        "scenario_id": scenario_id,
        "count": len(events),
        "events": events
    }

@app.post("/detect")
def detect_events_endpoint(req: DetectRequest):
    scored_events = detect_batch(req.events)
    
    # Audit log entry for batch detection
    high_risk_count = sum(1 for e in scored_events if e.get("risk_score", 0) >= 70)
    append_audit_entry(
        actor="SYSTEM",
        category="DETECTION",
        action="BATCH_EVALUATION_COMPLETED",
        target=f"{len(scored_events)} Telemetry Events",
        reason=f"Multi-score detection completed. Flagged {high_risk_count} high-risk events via Isolation Forest + HistGB + Sigma.",
        metadata={"total": len(scored_events), "high_risk_count": high_risk_count}
    )
    
    return {"scored_events": scored_events}

@app.post("/correlate")
def correlate_events_endpoint(req: CorrelateRequest):
    result = correlate_events(req.events, scenario_id=req.scenario_id or "scenario_a")
    
    incidents = result.get("correlated_incidents", [])
    if incidents:
        first_inc = incidents[0]
        append_audit_entry(
            actor="SYSTEM",
            category="CORRELATION",
            action="INCIDENT_CORRELATED",
            target=first_inc["incident_id"],
            reason=f"Graph clustering aggregated {first_inc['event_count']} events across hosts ({', '.join(first_inc['hosts'])}) into a unified incident.",
            metadata={"incident_id": first_inc["incident_id"], "max_risk": first_inc["max_risk_score"]}
        )
        
    return result

@app.post("/triage")
def triage_endpoint(req: TriageRequest):
    incident = req.incident
    triage_result = run_triage_agent(incident)
    
    if triage_result.get("prompt_injection_flagged"):
        append_audit_entry(
            actor="SYSTEM (Prompt Shield)",
            category="DEFENSE",
            action="PROMPT_INJECTION_NEUTRALIZED",
            target=incident.get("incident_id", "INC-0000"),
            reason="Adversarial prompt injection attempt detected in raw telemetry payload and neutralized before LLM dispatch.",
            metadata={"details": triage_result.get("prompt_injection_details")}
        )

    if triage_result.get("uncertain_flag"):
        append_audit_entry(
            actor="SYSTEM (Triage Agent)",
            category="TRIAGE",
            action="CONFIDENCE_DOWNGRADED_UNCERTAIN",
            target=incident.get("incident_id", "INC-0000"),
            reason=triage_result.get("analyst_queue_reason", "Missing logs lowered confidence"),
            metadata={"confidence": triage_result.get("confidence_score")}
        )

    # Automatically execute low-risk actions and audit them
    for act in triage_result.get("recommended_actions", []):
        if act.get("impact") == "LOW" and act.get("status") == "executed":
            append_audit_entry(
                actor="SYSTEM (Playbook Engine)",
                category="ACTION_EXECUTION",
                action=act.get("action_type", "LOW_RISK_ACTION"),
                target=act.get("target", "Target"),
                reason=act.get("description", "Automated low-risk containment action executed without requiring analyst interrupt.")
            )

    return triage_result

@app.post("/actions/approve")
def approve_action_endpoint(req: ActionApprovalRequest):
    entry = append_audit_entry(
        actor=req.analyst_name or "ANALYST (Human-in-the-Loop)",
        category="APPROVAL",
        action=f"APPROVED: {req.action_title}",
        target=req.target,
        reason=req.reason or "Analyst reviewed graph kill-chain and approved high-impact containment.",
        metadata={"action_id": req.action_id, "incident_id": req.incident_id, "status": "approved"}
    )
    return {
        "status": "approved",
        "action_id": req.action_id,
        "audit_entry_id": entry["id"],
        "message": f"High-impact action '{req.action_title}' approved and executed."
    }

@app.post("/actions/reject")
def reject_action_endpoint(req: ActionRejectRequest):
    entry = append_audit_entry(
        actor=req.analyst_name or "ANALYST (Human-in-the-Loop)",
        category="APPROVAL",
        action=f"REJECTED: {req.action_title}",
        target=req.target,
        reason=req.reason or "Analyst rejected high-impact action.",
        metadata={"action_id": req.action_id, "incident_id": req.incident_id, "status": "rejected"}
    )
    return {
        "status": "rejected",
        "action_id": req.action_id,
        "audit_entry_id": entry["id"],
        "message": f"Action '{req.action_title}' was rejected by analyst."
    }

@app.get("/benchmark")
def get_benchmark_endpoint():
    return get_benchmark_comparison()

@app.get("/audit-log")
def get_audit_log_endpoint():
    return {"logs": get_all_audit_logs()}

@app.get("/audit-log/export")
def export_audit_log_endpoint():
    logs = get_all_audit_logs()
    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "total_records": len(logs),
        "audit_trail": logs
    }
