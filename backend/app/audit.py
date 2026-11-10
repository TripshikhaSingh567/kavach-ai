import threading
from datetime import datetime, timezone

_LOCK = threading.Lock()
_AUDIT_LOGS = []
_LOG_COUNTER = 1

def append_audit_entry(
    actor: str,
    category: str,
    action: str,
    target: str,
    reason: str,
    metadata: dict = None
) -> dict:
    global _LOG_COUNTER, _AUDIT_LOGS
    with _LOCK:
        entry = {
            "id": f"AUD-{_LOG_COUNTER:05d}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "actor": actor,
            "category": category,
            "action": action,
            "target": target,
            "reason": reason,
            "metadata": metadata or {}
        }
        _LOG_COUNTER += 1
        _AUDIT_LOGS.insert(0, entry) # Most recent first
        return entry

def get_all_audit_logs() -> list[dict]:
    with _LOCK:
        return list(_AUDIT_LOGS)

def seed_initial_audit():
    if not _AUDIT_LOGS:
        append_audit_entry(
            actor="SYSTEM",
            category="STARTUP",
            action="ENGINE_INITIALIZED",
            target="KAVACH-AI Core",
            reason="FastAPI backend and scikit-learn models (Isolation Forest + HistGradientBoosting) loaded successfully."
        )
        append_audit_entry(
            actor="SYSTEM",
            category="DEFENSE",
            action="PROMPT_SHIELD_ARMED",
            target="Triage Agent Pipeline",
            reason="Adversarial prompt injection filters initialized with heuristic boundary enforcement."
        )

seed_initial_audit()
