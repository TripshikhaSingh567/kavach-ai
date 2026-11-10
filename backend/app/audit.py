import threading
import hashlib
from datetime import datetime, timezone

_LOCK = threading.Lock()
_AUDIT_LOGS = []
_LOG_COUNTER = 1
_LAST_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

def append_audit_entry(
    actor: str,
    category: str,
    action: str,
    target: str,
    reason: str,
    metadata: dict = None
) -> dict:
    global _LOG_COUNTER, _AUDIT_LOGS, _LAST_HASH
    with _LOCK:
        ts = datetime.now(timezone.utc).isoformat()
        entry_id = f"AUD-{_LOG_COUNTER:05d}"
        
        # Cryptographic SHA-256 hash chain
        payload_to_hash = f"{entry_id}|{ts}|{actor}|{category}|{action}|{target}|{_LAST_HASH}"
        current_hash = hashlib.sha256(payload_to_hash.encode("utf-8")).hexdigest()

        entry = {
            "id": entry_id,
            "timestamp": ts,
            "actor": actor,
            "category": category,
            "action": action,
            "target": target,
            "reason": reason,
            "previous_hash": _LAST_HASH,
            "hash": current_hash,
            "metadata": metadata or {}
        }
        _LAST_HASH = current_hash
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
            action="Engine initialised",
            target="KAVACH-AI Core",
            reason="FastAPI service and scikit-learn detection models (Isolation Forest and gradient boosting) loaded."
        )
        append_audit_entry(
            actor="SYSTEM",
            category="DEFENSE",
            action="Prompt filter active",
            target="Triage agent pipeline",
            reason="Heuristic boundary filter initialized to sanitize adversarial directives in log payloads."
        )

seed_initial_audit()
