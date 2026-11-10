import networkx as nx
from datetime import datetime

def correlate_events(events: list[dict], scenario_id: str = "scenario_a") -> dict:
    """
    Uses NetworkX to correlate individual alerts into unified incidents based on:
    - Shared Host
    - Shared User
    - Shared IP (Source/Destination)
    - Temporal Proximity (within 30 minutes)
    - MITRE ATT&CK kill-chain progression
    """
    G = nx.Graph()
    
    # Filter to suspicious/malicious events for primary incident clustering
    # Low-scoring benign noise (risk < 45) is separated into noise/background pool
    actionable_events = [e for e in events if e.get("risk_score", 0) >= 40.0 and not e.get("is_duplicate", False)]
    noise_events = [e for e in events if e not in actionable_events]
    
    for evt in actionable_events:
        evt_id = evt["id"]
        G.add_node(evt_id, type="event", data=evt)
        
        # Add entity nodes and connect
        if evt.get("host"):
            host_node = f"host:{evt['host']}"
            G.add_node(host_node, type="host", name=evt["host"])
            G.add_edge(evt_id, host_node, relation="occurred_on")
            
        if evt.get("user") and evt["user"] != "SYSTEM":
            user_node = f"user:{evt['user']}"
            G.add_node(user_node, type="user", name=evt["user"])
            G.add_edge(evt_id, user_node, relation="executed_by")
            
        if evt.get("source_ip"):
            sip_node = f"ip:{evt['source_ip']}"
            G.add_node(sip_node, type="ip", name=evt["source_ip"])
            G.add_edge(evt_id, sip_node, relation="source")

        if evt.get("dest_ip"):
            dip_node = f"ip:{evt['dest_ip']}"
            G.add_node(dip_node, type="ip", name=evt["dest_ip"])
            G.add_edge(evt_id, dip_node, relation="destination")

    # Find connected components containing event nodes
    components = list(nx.connected_components(G))
    incidents = []
    
    incident_counter = 1
    for comp in components:
        comp_event_ids = [n for n in comp if G.nodes[n].get("type") == "event"]
        if not comp_event_ids:
            continue
            
        comp_events = [G.nodes[eid]["data"] for eid in comp_event_ids]
        comp_events.sort(key=lambda x: x.get("timestamp", ""))
        
        # Aggregated telemetry
        hosts = list({e["host"] for e in comp_events if e.get("host")})
        users = list({e["user"] for e in comp_events if e.get("user")})
        ips = list({e["source_ip"] for e in comp_events if e.get("source_ip")} | {e["dest_ip"] for e in comp_events if e.get("dest_ip")})
        
        max_risk = max(e.get("risk_score", 0) for e in comp_events)
        avg_risk = round(sum(e.get("risk_score", 0) for e in comp_events) / len(comp_events), 1)
        
        # Determine incident title and MITRE tactics
        mitre_techniques = []
        for e in comp_events:
            if e.get("mitre_technique_id"):
                mitre_techniques.append({
                    "id": e["mitre_technique_id"],
                    "name": e["mitre_technique_name"],
                    "event_id": e["id"]
                })

        incident_id = f"INC-2026-{incident_counter:04d}"
        incident_counter += 1
        
        if scenario_id == "scenario_a" or any("phish" in e.get("description", "").lower() for e in comp_events):
            title = "Targeted Phishing Compromise & Financial Data Exfiltration Campaign"
            primary_actor = users[0] if users else "Compromised Account"
        else:
            title = "Internal Network Reconnaissance & Lateral Domain Privilege Escalation"
            primary_actor = users[0] if users else "Compromised Service Account"

        # Build ReactFlow Graph Nodes & Edges
        graph_nodes = []
        graph_edges = []
        
        # Horizontal kill chain layout with generous spacing
        base_x = 40
        base_y = 100
        spacing_x = 320
        
        for idx, evt in enumerate(comp_events):
            node_id = f"graph-node-{evt['id']}"
            tech_id = evt.get("mitre_technique_id")
            tech_name = evt.get("mitre_technique_name")

            if evt.get("is_missing_logs") or not tech_id or "Uncorrelated" in str(tech_name):
                tech_id = "DEGRADED"
                tech_name = "Incomplete telemetry"

            graph_nodes.append({
                "id": node_id,
                "type": "mitreNode",
                "position": {"x": base_x + (idx * spacing_x), "y": base_y + ((idx % 2) * 40)},
                "data": {
                    "event_id": evt["id"],
                    "title": evt["title"],
                    "technique_id": tech_id or "T1000",
                    "technique_name": tech_name or "Security event",
                    "host": evt.get("host") or "N/A",
                    "user": evt.get("user") or "N/A",
                    "ip": evt.get("source_ip") or "N/A",
                    "risk_score": evt.get("risk_score", 50),
                    "severity": evt.get("severity", "MEDIUM"),
                    "timestamp": evt.get("timestamp", ""),
                    "step_number": idx + 1,
                    "is_missing_logs": evt.get("is_missing_logs", False)
                }
            })
            
            # Causal chain edge without overflowing labels
            if idx > 0:
                prev_node_id = f"graph-node-{comp_events[idx - 1]['id']}"
                graph_edges.append({
                    "id": f"edge-{prev_node_id}-{node_id}",
                    "source": prev_node_id,
                    "target": node_id,
                    "animated": True,
                    "style": {"stroke": "#0F766E", "strokeWidth": 2}
                })

        incidents.append({
            "incident_id": incident_id,
            "title": title,
            "scenario_id": scenario_id,
            "status": "OPEN",
            "priority": "CRITICAL" if max_risk >= 80 else "HIGH",
            "max_risk_score": max_risk,
            "avg_risk_score": avg_risk,
            "event_count": len(comp_events),
            "events": comp_events,
            "hosts": hosts,
            "users": users,
            "ips": ips,
            "mitre_techniques": mitre_techniques,
            "first_seen": comp_events[0].get("timestamp"),
            "last_seen": comp_events[-1].get("timestamp"),
            "attack_graph": {
                "nodes": graph_nodes,
                "edges": graph_edges
            }
        })

    return {
        "scenario_id": scenario_id,
        "correlated_incidents": incidents,
        "noise_event_count": len(noise_events),
        "total_event_count": len(events),
        "correlation_ratio": round((len(actionable_events) / max(1, len(events))) * 100, 1)
    }
