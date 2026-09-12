import React, { useState } from "react";
import {
  Briefcase,
  Database,
  Code,
  Network,
  Cpu,
  BarChart3,
  Sliders,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Play,
  Layers,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { BUSINESS_CASES } from "../data/businessCases";
import { BusinessCase } from "../types";

export const BusinessCaseViewer: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("ecommerce-churn");
  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "sql" | "python_ml" | "pipeline" | "llm" | "dashboard"
  >("overview");

  const currentCase =
    BUSINESS_CASES.find((c) => c.id === selectedCaseId) || BUSINESS_CASES[0];

  // SQL Lab state
  const [selectedQueryIndex, setSelectedQueryIndex] = useState(0);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isQueryRunning, setIsQueryRunning] = useState(false);
  const [queryRan, setQueryRan] = useState(true);

  // ML threshold simulation state
  const [threshold, setThreshold] = useState(
    currentCase.predictiveModel.thresholdSimulation.defaultThreshold
  );

  // LLM Live Diagnosis state
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [liveDiagnosis, setLiveDiagnosis] = useState<any>(null);

  const activeQuery = currentCase.sqlLab.queries[selectedQueryIndex] || currentCase.sqlLab.queries[0];
  const simResult = currentCase.predictiveModel.thresholdSimulation.simulate(threshold);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleRunQuery = () => {
    setIsQueryRunning(true);
    setTimeout(() => {
      setIsQueryRunning(false);
      setQueryRan(true);
    }, 450);
  };

  const handleLiveDiagnosis = async () => {
    setIsDiagnosing(true);
    try {
      const res = await fetch("/api/gemini/diagnose-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: currentCase.title,
          metricAnomaly: currentCase.businessProblem.baselineLoss,
          sampleData: currentCase.llmAugmentation.sampleInput,
        }),
      });
      const data = await res.json();
      if (data.success && data.diagnosis) {
        setLiveDiagnosis(data.diagnosis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Case Selector Pills */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
          Select Business Domain Case Study
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {BUSINESS_CASES.map((bCase) => {
            const isSelected = bCase.id === currentCase.id;
            return (
              <button
                key={bCase.id}
                id={`case-card-${bCase.id}`}
                onClick={() => {
                  setSelectedCaseId(bCase.id);
                  setLiveDiagnosis(null);
                  setThreshold(bCase.predictiveModel.thresholdSimulation.defaultThreshold);
                }}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-stone-900 text-stone-50 border-stone-900 shadow-md ring-2 ring-stone-900/20"
                    : "bg-white text-stone-800 border-stone-200 hover:border-stone-400 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-stone-800 text-amber-300" : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {bCase.domain}
                  </span>
                </div>
                <h3 className="font-semibold text-sm line-clamp-1">{bCase.title}</h3>
                <p
                  className={`text-xs mt-1 line-clamp-2 ${
                    isSelected ? "text-stone-300" : "text-stone-700"
                  }`}
                >
                  {bCase.summary}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Case Header & Sub-Tabs */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                  {currentCase.domain}
                </span>
                <span className="text-xs text-stone-600">• Real Business Problem</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {currentCase.title}
              </h1>
            </div>

            {/* Baseline Loss Badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 self-start md:self-auto">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <div>
                <div className="text-[10px] uppercase font-semibold text-rose-700">Baseline At-Risk Bleed</div>
                <div className="text-xs font-bold text-rose-900">{currentCase.businessProblem.baselineLoss.split(" ")[0]}</div>
              </div>
            </div>
          </div>

          {/* Sub-Tabs */}
          <div className="flex gap-1 sm:gap-2 mt-6 overflow-x-auto border-b border-stone-200/80 -mb-6 pb-2 no-scrollbar">
            {[
              { id: "overview", label: "Problem & Roles", icon: Briefcase },
              { id: "sql", label: "SQL Lab (CTEs & Windows)", icon: Database },
              { id: "python_ml", label: "Predictive ML & Simulator", icon: Code },
              { id: "pipeline", label: "Automated Data Pipeline", icon: Network },
              { id: "llm", label: "LLM & AI Augmentation", icon: Cpu },
              { id: "dashboard", label: "Executive Dashboard", icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`subtab-${tab.id}`}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                    isActive
                      ? "border-stone-900 text-stone-900 bg-stone-100/70 font-semibold"
                      : "border-transparent text-stone-700 hover:text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-stone-900" : "text-stone-600"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content View */}
        <div className="p-6">
          {/* 1. OVERVIEW SUBTAB */}
          {activeSubTab === "overview" && (
            <div className="space-y-6">
              {/* Problem Statement Box */}
              <div className="p-5 rounded-xl bg-stone-50 border border-stone-200">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                  Executive Business Context
                </h4>
                <p className="text-stone-800 text-sm leading-relaxed">
                  {currentCase.businessProblem.context}
                </p>
                <div className="mt-4 pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-stone-700 block mb-1">Financial Impact:</span>
                    <span className="text-sm font-semibold text-rose-800">
                      {currentCase.businessProblem.baselineLoss}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-stone-700 block mb-1">Key Stakeholders:</span>
                    <span className="text-sm text-stone-700">
                      {currentCase.businessProblem.stakeholders.join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Target KPIs */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
                  Success Metrics & Quantifiable KPIs
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {currentCase.businessProblem.targetKPIs.map((kpi, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs"
                    >
                      <div className="flex items-center gap-2 text-stone-900 font-medium text-xs mb-1">
                        <span className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span>Target KPI</span>
                      </div>
                      <p className="text-xs font-semibold text-stone-800">{kpi}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Transition Matrix */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                    How Each Role Solves This Business Problem (Career Progression Lens)
                  </h4>
                  <span className="text-xs text-stone-600">See your transition pathway</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Data Analyst */}
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-700 text-white">
                        1. Data Analyst Focus
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {currentCase.roleRelevance.analyst}
                    </p>
                    <div className="mt-3 pt-3 border-t border-blue-200/60 text-[11px] text-blue-900 font-medium">
                      Primary artifact: Business intelligence dashboard, SQL cohort slices, executive readout.
                    </div>
                  </div>

                  {/* Data Scientist */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-700 text-white">
                        2. Data Scientist Transition
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {currentCase.roleRelevance.dataScientist}
                    </p>
                    <div className="mt-3 pt-3 border-t border-emerald-200/60 text-[11px] text-emerald-900 font-medium">
                      Primary artifact: Machine learning scoring model, cost-benefit decision threshold, SHAP explanations.
                    </div>
                  </div>

                  {/* Data Engineer */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-700 text-white">
                        3. Data Engineer Scalability
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {currentCase.roleRelevance.dataEngineer}
                    </p>
                    <div className="mt-3 pt-3 border-t border-amber-200/60 text-[11px] text-amber-900 font-medium">
                      Primary artifact: Automated Dagster/Airflow DAG, dbt Medallion mart, data contract schema tests.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SQL LAB SUBTAB */}
          {activeSubTab === "sql" && (
            <div className="space-y-6">
              {/* Query Selector Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div className="flex gap-2">
                  {currentCase.sqlLab.queries.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => setSelectedQueryIndex(qIdx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedQueryIndex === qIdx
                          ? "bg-stone-900 text-stone-50"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      Query {qIdx + 1}: {q.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(activeQuery.sql)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? "Copied" : "Copy SQL"}</span>
                  </button>
                  <button
                    onClick={handleRunQuery}
                    disabled={isQueryRunning}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{isQueryRunning ? "Running Query..." : "Execute Query"}</span>
                  </button>
                </div>
              </div>

              {/* Technique & Description */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700">
                <div>
                  <span className="font-semibold text-stone-900">Advanced Technique: </span>
                  <span className="font-mono bg-stone-200/80 px-1.5 py-0.5 rounded text-stone-800">
                    {currentCase.sqlLab.technique}
                  </span>
                </div>
                <div className="text-stone-700">{activeQuery.description}</div>
              </div>

              {/* SQL Code Box */}
              <div className="relative rounded-xl bg-stone-950 text-stone-100 font-mono text-xs overflow-hidden border border-stone-800 shadow-inner">
                <div className="flex items-center justify-between px-4 py-2 bg-stone-900/90 border-b border-stone-800 text-[11px] text-stone-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-stone-300 font-sans font-medium">{activeQuery.name}.sql</span>
                  </div>
                  <span>PostgreSQL / Snowflake dialect</span>
                </div>
                <pre className="p-4 overflow-x-auto text-stone-200 leading-relaxed max-h-96">
                  <code>{activeQuery.sql}</code>
                </pre>
              </div>

              {/* Query Optimization Callout */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Staff Data Engineer Optimization Insight: </span>
                  <span>{activeQuery.optimizationNote}</span>
                </div>
              </div>

              {/* Mock Execution Result Table */}
              {queryRan && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Query Execution Results ({activeQuery.mockResults.length} records returned in 42ms)
                    </span>
                    <span className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Execution Plan: Partition Hash Scan (0.042s)
                    </span>
                  </div>

                  <div className="border border-stone-200 rounded-xl overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-100 text-stone-700 border-b border-stone-200 font-semibold">
                        <tr>
                          {Object.keys(activeQuery.mockResults[0] || {}).map((colName) => (
                            <th key={colName} className="px-4 py-2.5 whitespace-nowrap font-mono">
                              {colName}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 bg-white font-mono">
                        {activeQuery.mockResults.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-stone-50">
                            {Object.values(row).map((val: any, cIdx) => (
                              <td key={cIdx} className="px-4 py-2 text-stone-800 whitespace-nowrap">
                                {typeof val === "number" && val < 0 ? (
                                  <span className="text-rose-600 font-semibold">{val}</span>
                                ) : typeof val === "string" && val.includes("RISK") ? (
                                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                                    {val}
                                  </span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. PYTHON & PREDICTIVE ML SUBTAB */}
          {activeSubTab === "python_ml" && (
            <div className="space-y-6">
              {/* Model Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <div className="text-xs font-semibold text-stone-700">Model Architecture & Framework:</div>
                  <div className="text-sm font-bold text-stone-900">{currentCase.predictiveModel.modelType}</div>
                </div>
                <span className="text-xs font-mono bg-stone-200 px-2.5 py-1 rounded text-stone-800 self-start sm:self-auto">
                  {currentCase.predictiveModel.framework}
                </span>
              </div>

              {/* Interactive Decision Threshold Simulator */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 text-stone-100 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="font-semibold text-sm">Business Decision Threshold Simulator</h4>
                      <p className="text-xs text-stone-400">
                        Balance False Positives vs False Negatives based on real dollar impact
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-400">Decision Cutoff: </span>
                    <span className="text-base font-bold text-amber-400 font-mono">
                      {threshold.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-2 mb-6">
                  <input
                    type="range"
                    id="threshold-slider"
                    min={currentCase.predictiveModel.thresholdSimulation.minThreshold}
                    max={currentCase.predictiveModel.thresholdSimulation.maxThreshold}
                    step={0.05}
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-2 bg-stone-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-stone-400 font-mono">
                    <span>Aggressive Outreach (High Recall, Lower Precision)</span>
                    <span>Conservative Targeting (High Precision, Lower Recall)</span>
                  </div>
                </div>

                {/* Simulated Financial Outcome Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700">
                    <div className="text-[11px] text-stone-400 mb-1">Precision (Targeting Accuracy)</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono">
                      {Math.round(simResult.precision * 100)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700">
                    <div className="text-[11px] text-stone-400 mb-1">Recall (Catches Impending Loss)</div>
                    <div className="text-lg font-bold text-amber-400 font-mono">
                      {Math.round(simResult.recall * 100)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700">
                    <div className="text-[11px] text-stone-400 mb-1">Intervention / Outreach Cost</div>
                    <div className="text-lg font-bold text-rose-400 font-mono">
                      ${simResult.outreachCost.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-800/80 border border-amber-500/40 bg-amber-500/10">
                    <div className="text-[11px] text-amber-300 font-medium mb-1">Net Financial Benefit ($)</div>
                    <div className="text-xl font-bold text-amber-400 font-mono">
                      +${simResult.netBenefit.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Importance & Model Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature Importance */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
                    SHAP Value Feature Attribution (Top Drivers)
                  </h4>
                  <div className="space-y-3">
                    {currentCase.predictiveModel.features.map((f, fIdx) => (
                      <div key={fIdx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-mono font-medium text-stone-800">{f.name}</span>
                          <span className="font-mono text-stone-700 font-semibold">
                            {(f.importance * 100).toFixed(0)}% weight
                          </span>
                        </div>
                        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-stone-900 rounded-full"
                            style={{ width: `${f.importance * 100 * 2.2}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-stone-700">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Evaluation Metrics */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
                      Production Model Evaluation vs Business Benchmark
                    </h4>
                    <div className="space-y-3">
                      {currentCase.predictiveModel.metrics.map((m, mIdx) => (
                        <div key={mIdx} className="p-3 rounded-lg bg-stone-50 border border-stone-200/80">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-stone-900">{m.name}</span>
                            <div className="flex items-center gap-2 font-mono text-xs">
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {m.value}
                              </span>
                              <span className="text-stone-700">target: {m.benchmark}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-stone-700">{m.businessInterpretation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-950">
                    <span className="font-semibold">Career Tip for Data Analysts: </span>
                    Never just show accuracy scores to stakeholders. Always report the expected dollar savings at the optimal decision threshold.
                  </div>
                </div>
              </div>

              {/* Python Pipeline Code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Production Python Pipeline (TimeSeriesSplit & Explainability)
                  </h4>
                  <button
                    onClick={() => handleCopy(currentCase.predictiveModel.pythonCode)}
                    className="flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-900 font-medium"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Python Code</span>
                  </button>
                </div>
                <div className="rounded-xl bg-stone-950 text-stone-200 font-mono text-xs overflow-hidden border border-stone-800">
                  <pre className="p-4 overflow-x-auto leading-relaxed max-h-80">
                    <code>{currentCase.predictiveModel.pythonCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* 4. AUTOMATED DATA PIPELINE SUBTAB (Data Engineering) */}
          {activeSubTab === "pipeline" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <div className="text-xs font-semibold text-stone-700">Orchestrator & Architecture:</div>
                  <div className="text-sm font-bold text-stone-900">{currentCase.automatedPipeline.orchestrator}</div>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                  Medallion Lakehouse (Bronze / Silver / Gold)
                </span>
              </div>

              {/* Medallion Layers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentCase.automatedPipeline.layers.map((layer, lIdx) => (
                  <div
                    key={lIdx}
                    className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center text-xs font-bold font-mono">
                          {lIdx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-stone-900">{layer.name}</h4>
                      </div>
                      <div className="text-xs font-mono text-stone-700 mb-2 font-medium">{layer.tech}</div>
                      <p className="text-xs text-stone-700 leading-relaxed mb-3">{layer.description}</p>
                    </div>

                    <div className="pt-3 border-t border-stone-100">
                      <div className="text-[11px] font-semibold text-stone-700 mb-1">Data Contracts & Tests:</div>
                      <ul className="space-y-1">
                        {layer.dataContracts.map((c, cIdx) => (
                          <li key={cIdx} className="text-[11px] text-stone-600 flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive DAG Task Graph */}
              <div className="p-5 rounded-2xl bg-stone-900 text-stone-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-amber-400" />
                    <h4 className="font-semibold text-sm">Automated Airflow / Dagster Task Flow</h4>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono">All 5 Tasks Succeeded</span>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-3 overflow-x-auto py-2">
                  {currentCase.automatedPipeline.dagTasks.map((task, tIdx) => (
                    <React.Fragment key={task.id}>
                      <div className="w-full lg:w-48 p-3 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-mono text-amber-300">{task.type}</div>
                          <div className="text-xs font-medium text-stone-200 line-clamp-1">{task.name}</div>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
                      </div>
                      {tIdx < currentCase.automatedPipeline.dagTasks.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-stone-500 hidden lg:block shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* dbt Incremental Model Snippet */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                    dbt Incremental Transformation Model (Gold Layer)
                  </h4>
                  <button
                    onClick={() => handleCopy(currentCase.automatedPipeline.dbtSnippet)}
                    className="flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-900 font-medium"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy dbt Model</span>
                  </button>
                </div>
                <div className="rounded-xl bg-stone-950 text-stone-200 font-mono text-xs overflow-hidden border border-stone-800">
                  <pre className="p-4 overflow-x-auto leading-relaxed">
                    <code>{currentCase.automatedPipeline.dbtSnippet}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* 5. LLM & AI AUGMENTATION SUBTAB */}
          {activeSubTab === "llm" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-stone-50 to-amber-500/5 border border-amber-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                        AI-Era Portfolio Superpower
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-stone-900">
                      {currentCase.llmAugmentation.name}
                    </h3>
                    <p className="text-xs text-stone-700 mt-1 max-w-2xl">
                      {currentCase.llmAugmentation.role}
                    </p>
                  </div>

                  <button
                    id="btn-run-live-diagnosis"
                    onClick={handleLiveDiagnosis}
                    disabled={isDiagnosing}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-stone-50 font-semibold text-xs hover:bg-stone-800 transition-all shadow-sm shrink-0 self-start sm:self-auto"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
                    <span>{isDiagnosing ? "Diagnosing with Gemini..." : "Run Live Gemini Root-Cause AI"}</span>
                  </button>
                </div>
              </div>

              {/* Live Diagnosis Response (If run) */}
              {liveDiagnosis && (
                <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-700" />
                      Gemini 3.8 Flash Automated Root-Cause Diagnosis
                    </span>
                    <span className="text-[11px] text-emerald-700 font-mono">Status: Verified Pipeline Anomaly</span>
                  </div>

                  <div className="text-xs text-stone-800 leading-relaxed font-medium bg-white p-3 rounded-lg border border-emerald-100">
                    {liveDiagnosis.executiveSummary}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-emerald-100">
                      <div className="font-bold text-stone-900 mb-2">Hypotheses Investigated:</div>
                      <ul className="list-disc list-inside space-y-1 text-stone-700">
                        {liveDiagnosis.topHypotheses?.map((h: string, idx: number) => (
                          <li key={idx}>{h}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-emerald-100">
                      <div className="font-bold text-stone-900 mb-2">Automated Next Actions:</div>
                      <ul className="list-disc list-inside space-y-1 text-stone-700">
                        {liveDiagnosis.recommendedActions?.map((a: string, idx: number) => (
                          <li key={idx}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {liveDiagnosis.sqlInvestigationQuery && (
                    <div className="rounded-lg bg-stone-900 text-stone-200 p-3 font-mono text-[11px] overflow-x-auto">
                      <div className="text-stone-400 mb-1 text-[10px] font-sans">Automated Validation SQL:</div>
                      <code>{liveDiagnosis.sqlInvestigationQuery}</code>
                    </div>
                  )}
                </div>
              )}

              {/* Sample LLM Input & Output Architecture */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Payload */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
                    Structured Input Fed to LLM
                  </h4>
                  <div className="rounded-xl bg-stone-950 text-stone-200 font-mono text-xs p-4 overflow-x-auto max-h-72">
                    <pre>{JSON.stringify(currentCase.llmAugmentation.sampleInput, null, 2)}</pre>
                  </div>
                </div>

                {/* Structured Insights Output */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
                      Structured LLM Synthesis & Proposed Strategy
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                        <div className="text-[11px] font-bold text-stone-700 mb-1">Executive Summary:</div>
                        <p className="text-xs text-stone-800 leading-relaxed">
                          {currentCase.llmAugmentation.sampleOutput.executiveSummary}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                        <div className="text-[11px] font-bold text-stone-700 mb-1">Extracted Insights:</div>
                        <ul className="space-y-1">
                          {currentCase.llmAugmentation.sampleOutput.structuredInsights.map((insight, idx) => (
                            <li key={idx} className="text-xs text-stone-700 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <div className="text-[11px] font-bold text-emerald-900 mb-1">Automated Action:</div>
                        <p className="text-xs text-emerald-950 font-medium">
                          {currentCase.llmAugmentation.sampleOutput.suggestedAction}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. EXECUTIVE DASHBOARD SUBTAB */}
          {activeSubTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Executive Performance & Monitoring Cockpit</h3>
                  <p className="text-xs text-stone-700">
                    Real-time operational visibility designed for C-level leadership
                  </p>
                </div>
                <span className="text-xs text-stone-700 bg-stone-100 px-3 py-1 rounded-full font-medium">
                  Refreshed Hourly via dbt
                </span>
              </div>

              {/* Metric KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs">
                  <div className="text-xs text-stone-700 font-medium mb-1">Current Metric Value</div>
                  <div className="text-2xl font-bold text-stone-900 font-mono">
                    {currentCase.dashboardData.timeSeries[currentCase.dashboardData.timeSeries.length - 1].actual}%
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-800 mt-1 font-medium">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Down 7.0% from baseline</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs">
                  <div className="text-xs text-stone-700 font-medium mb-1">Target Baseline</div>
                  <div className="text-2xl font-bold text-stone-700 font-mono">
                    {currentCase.dashboardData.timeSeries[0].baseline}%
                  </div>
                  <div className="text-[11px] text-stone-600 mt-1">Pre-intervention level</div>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs">
                  <div className="text-xs text-stone-700 font-medium mb-1">Total Monitored Accounts/SKUs</div>
                  <div className="text-2xl font-bold text-stone-900 font-mono">14,200</div>
                  <div className="text-[11px] text-blue-800 mt-1 font-medium">Updated every 24h</div>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-emerald-50/60 shadow-xs">
                  <div className="text-xs text-emerald-900 font-medium mb-1">Projected Annual Savings</div>
                  <div className="text-2xl font-bold text-emerald-900 font-mono">+$420,000</div>
                  <div className="text-[11px] text-emerald-800 mt-1 font-medium">At current model threshold</div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Time Series Trend */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-4">
                    Historical Actual vs Model Prediction Trend
                  </h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={currentCase.dashboardData.timeSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                        <XAxis dataKey="date" stroke="#78716c" fontSize={12} />
                        <YAxis stroke="#78716c" fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="actual"
                          stroke="#1c1917"
                          strokeWidth={2.5}
                          name="Actual Rate"
                          dot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="#d97706"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          name="Model Forecast"
                        />
                        <Line
                          type="monotone"
                          dataKey="baseline"
                          stroke="#ef4444"
                          strokeWidth={1.5}
                          name="Legacy Baseline"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Risk Distribution / Cohort Matrix */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-4">
                    Risk Segmentation & Concentration
                  </h4>
                  {currentCase.dashboardData.distributionData ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={currentCase.dashboardData.distributionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                          <XAxis dataKey="category" stroke="#78716c" fontSize={11} />
                          <YAxis stroke="#78716c" fontSize={12} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#292524" radius={[4, 4, 0, 0]} name="Account Volume" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-xs text-stone-700 p-8 text-center">
                      Cohort Matrix View available in SQL Lab tab.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
