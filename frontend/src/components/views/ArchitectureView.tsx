"use client";

import React from "react";
import { Layers, Shield, Database, Cpu, Network, ArrowRight, Server, Terminal, Lock, CheckCircle2 } from "lucide-react";

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl border border-soc-border bg-soc-card shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            System Design &amp; Scalability
          </span>
          <span className="text-xs font-mono text-slate-400">Enterprise Blueprint</span>
        </div>
        <h1 className="text-lg font-black text-white mt-1">Enterprise Production Architecture</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Blueprint illustrating how KAVACH-AI integrates into enterprise security operations with Wazuh, Elasticsearch, SIEM, SOAR, and EDR.
        </p>
      </div>

      {/* Production Architecture Diagram Canvas */}
      <div className="p-6 rounded-xl border border-soc-border bg-soc-card shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              End-to-End Cyber-Resilience Pipeline
            </h2>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-800">
            Production Integration Specification (Diagram Only)
          </span>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Layer 1: Ingestion & EDR */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold mb-1">Layer 1: Telemetry</div>
              <h3 className="text-xs font-bold text-white">Wazuh &amp; EDR Agents</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Endpoints, firewalls, and cloud IDPs stream raw security events and NetFlow captures.
              </p>
            </div>
            <div className="space-y-1.5 font-mono text-[10px] text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <div>&bull; Wazuh EDR Agent</div>
              <div>&bull; Sysmon / Auditd</div>
              <div>&bull; CloudTrail / Azure IDP</div>
              <div>&bull; Suricata / Zeek PCAP</div>
            </div>
          </div>

          {/* Layer 2: Pipeline & Storage */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-blue-400 font-bold mb-1">Layer 2: Storage</div>
              <h3 className="text-xs font-bold text-white">Elasticsearch / SIEM</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Logstash and Kafka buffer streams into Elasticsearch indices for fast query retrieval.
              </p>
            </div>
            <div className="space-y-1.5 font-mono text-[10px] text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <div>&bull; Elasticsearch Cluster</div>
              <div>&bull; Apache Kafka Queue</div>
              <div>&bull; Splunk / Chronicle</div>
              <div>&bull; OpenSearch Ingestion</div>
            </div>
          </div>

          {/* Layer 3: KAVACH-AI Engine */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/50 space-y-3 flex flex-col justify-between shadow-lg shadow-cyan-950/40">
            <div>
              <div className="text-[10px] font-mono uppercase text-cyan-300 font-bold mb-1">Layer 3: Resilience</div>
              <h3 className="text-xs font-bold text-white">KAVACH-AI Detection</h3>
              <p className="text-[11px] text-slate-300 mt-1">
                Hybrid scikit-learn models (Isolation Forest + HistGB) combined with Sigma rules.
              </p>
            </div>
            <div className="space-y-1.5 font-mono text-[10px] text-cyan-300 bg-slate-900/90 p-2.5 rounded border border-cyan-800">
              <div>&bull; Isolation Forest (Volume)</div>
              <div>&bull; HistGB (PortScan Patterns)</div>
              <div>&bull; Sigma Rules Engine</div>
              <div>&bull; 3-Way Composite Risk</div>
            </div>
          </div>

          {/* Layer 4: Correlation & AI */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/50 space-y-3 flex flex-col justify-between shadow-lg shadow-purple-950/40">
            <div>
              <div className="text-[10px] font-mono uppercase text-purple-300 font-bold mb-1">Layer 4: Triage</div>
              <h3 className="text-xs font-bold text-white">NetworkX + Gemini</h3>
              <p className="text-[11px] text-slate-300 mt-1">
                NetworkX graph clusters alerts into 1 incident; Gemini synthesizes kill-chain narrative.
              </p>
            </div>
            <div className="space-y-1.5 font-mono text-[10px] text-purple-300 bg-slate-900/90 p-2.5 rounded border border-purple-800">
              <div>&bull; NetworkX Entity Graph</div>
              <div>&bull; MITRE ATT&amp;CK Mapping</div>
              <div>&bull; Prompt Shield Defense</div>
              <div>&bull; Confidence Calibration</div>
            </div>
          </div>

          {/* Layer 5: SOAR & Execution */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-1">Layer 5: Response</div>
              <h3 className="text-xs font-bold text-white">SOAR &amp; Human Approval</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Autonomous low-risk containment + analyst approval gate for high-impact host isolation.
              </p>
            </div>
            <div className="space-y-1.5 font-mono text-[10px] text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <div>&bull; Firewall IP Drop (Auto)</div>
              <div>&bull; Token Revoke (Auto)</div>
              <div>&bull; EDR Host Isolation (Approve)</div>
              <div>&bull; AD Account Lock (Approve)</div>
            </div>
          </div>
        </div>

        {/* Technical Architecture Notes */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-cyan-400 font-bold mb-1">Enterprise Scalability</div>
            <p className="text-slate-400 text-[11px]">
              Microservices deployed on Kubernetes with Redis pub/sub queues, capable of processing &gt;50,000 EPS (events per second) with horizontal worker autoscaling.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-purple-400 font-bold mb-1">Zero Trust Governance</div>
            <p className="text-slate-400 text-[11px]">
              Prompt Shield boundary enforcement prevents prompt injections. Append-only tamper-evident audit logs exportable for SOC 2 Type II and ISO 27001 compliance.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-emerald-400 font-bold mb-1">SOAR Ecosystem Ready</div>
            <p className="text-slate-400 text-[11px]">
              Prebuilt webhooks and API schemas for Palo Alto Cortex XSOAR, Splunk SOAR, Tines, and Shuffle open-source automation engines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
