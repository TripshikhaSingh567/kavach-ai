"use client";

import React from "react";
import { ArrowRight, Layers, Cpu, Database, Network, ShieldCheck } from "lucide-react";

export const ArchitectureView: React.FC = () => {
  const layers = [
    {
      step: "1",
      name: "Telemetry Ingestion",
      tools: "Wazuh Agent & EDR",
      description: "Captures process creation, authentication events, and network flow logs.",
    },
    {
      step: "2",
      name: "Storage & Indexing",
      tools: "Elasticsearch & Kafka",
      description: "Buffers high-volume telemetry and indexes structured security documents.",
    },
    {
      step: "3",
      name: "Threat Detection",
      tools: "Isolation Forest & Sigma",
      description: "Combines anomaly scoring, gradient-boosted patterns, and Sigma rules.",
    },
    {
      step: "4",
      name: "Correlation & Triage",
      tools: "NetworkX & Gemini",
      description: "Clusters alerts into incidents and generates narrative triage with evidence.",
    },
    {
      step: "5",
      name: "Orchestration & Response",
      tools: "SOAR & Human Approval",
      description: "Executes low-risk actions automatically; prompts analysts for high-impact isolation.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Architecture</h2>
        <p className="text-sm text-gray-500 mt-1">
          Production integration blueprint showing telemetry flow across enterprise security systems.
        </p>
      </div>

      {/* 5-Layer Horizontal Flow */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">End-to-end processing pipeline</h3>
            <p className="text-xs text-gray-500 mt-0.5">Telemetry journey from raw endpoint events to coordinated response.</p>
          </div>
          <span className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
            Production Blueprint
          </span>
        </div>

        {/* Horizontal Boxes with Arrows */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-stretch pt-2">
          {layers.map((layer, idx) => (
            <div
              key={layer.step}
              className="flex flex-col justify-between p-4 rounded-xl border border-gray-200 bg-slate-50/70 hover:bg-white hover:border-brand-300 hover:shadow-xs transition-all space-y-3 relative group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                    Layer {layer.step}
                  </span>
                  {idx < layers.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 hidden md:block group-hover:text-brand-600 transition-colors" />
                  )}
                </div>
                <div className="text-sm font-bold text-gray-900 mt-2">{layer.name}</div>
                <div className="text-xs font-mono font-semibold text-brand-600 mt-0.5">{layer.tools}</div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed pt-2 border-t border-gray-200/80">
                {layer.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Implementation Notes */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-gray-900">Implementation notes</h3>
        <ul className="space-y-3 text-xs text-gray-600 leading-relaxed">
          <li className="flex items-start space-x-2.5">
            <span className="text-brand-600 font-bold text-base leading-none">&bull;</span>
            <span>
              <strong className="text-gray-900 font-semibold">Scalability:</strong> Designed to scale horizontally by running stateless FastAPI inference workers behind a load balancer with a Redis queue.
            </span>
          </li>
          <li className="flex items-start space-x-2.5">
            <span className="text-brand-600 font-bold text-base leading-none">&bull;</span>
            <span>
              <strong className="text-gray-900 font-semibold">Integrations:</strong> Connects to existing security pipelines through standard REST APIs and webhook payloads compatible with Wazuh and SOAR engines.
            </span>
          </li>
          <li className="flex items-start space-x-2.5">
            <span className="text-brand-600 font-bold text-base leading-none">&bull;</span>
            <span>
              <strong className="text-gray-900 font-semibold">Audit accountability:</strong> Every detection score, correlation grouping, triage assessment, and containment action is logged in an append-only audit trail with SHA-256 cryptographic hash chaining.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
