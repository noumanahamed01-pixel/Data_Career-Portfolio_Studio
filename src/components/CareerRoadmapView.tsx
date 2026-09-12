import React from "react";
import {
  Compass,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Database,
  Code2,
} from "lucide-react";
import { CAREER_ROADMAP } from "../data/businessCases";

export const CareerRoadmapView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-850 text-stone-100 shadow-md">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              The Strategic Career Matrix (Analyst → Analytics Engineer → Data Engineer)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            From Data Analyst to Analytics Engineer & Data Engineer in the AI Era
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            The modern data market is rapidly shifting: Big Data Specialists, Data Engineers, and Analytics Engineers have the highest durable demand. This roadmap takes you from SQL and metric trees into dbt modeling, data contracts, workflow orchestration, and financial expected-value decision engines.
          </p>
        </div>
      </div>

      {/* 3 Transition Phases */}
      <div className="space-y-6">
        {CAREER_ROADMAP.map((phase, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4"
          >
            {/* Phase Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center font-mono font-bold text-sm">
                  0{idx + 1}
                </span>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                    {phase.stage}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900">{phase.title}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                  {phase.timeframe}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                  Target: {phase.targetRole}
                </span>
              </div>
            </div>

            {/* Grid of Key Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Technical Core Skills */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">
                  <Database className="w-4 h-4 text-stone-700" />
                  <span>Key Technical Skills</span>
                </div>
                <ul className="space-y-2">
                  {phase.keySkills.map((skill, sIdx) => (
                    <li key={sIdx} className="text-xs text-stone-700 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-stone-700 shrink-0 mt-0.5" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Portfolio Must-Haves */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">
                  <Layers className="w-4 h-4 text-stone-700" />
                  <span>Portfolio Must-Haves</span>
                </div>
                <ul className="space-y-2">
                  {phase.portfolioMustHaves.map((must, mIdx) => (
                    <li key={mIdx} className="text-xs text-stone-700 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-stone-700 shrink-0 mt-0.5" />
                      <span>{must}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI-Era Differentiators */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider mb-2.5">
                  <Cpu className="w-4 h-4 text-amber-700" />
                  <span>AI Era Differentiator</span>
                </div>
                <ul className="space-y-2">
                  {phase.aiEraDifferentiators.map((diff, dIdx) => (
                    <li key={dIdx} className="text-xs text-amber-950 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                      <span>{diff}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Projects Banner */}
            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-stone-700">Flagship Project Types to Build:</span>
              <div className="flex flex-wrap gap-2">
                {phase.recommendedProjects.map((proj, pIdx) => (
                  <span
                    key={pIdx}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-medium text-[11px] border border-stone-200"
                  >
                    {proj}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What Hiring Managers Reject vs What They Respect */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Anti-Patterns */}
        <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="w-5 h-5 text-rose-700" />
            <h3 className="font-bold text-base text-rose-900">
              The "Anti-Portfolio": Clichés Hiring Managers Reject
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-rose-950">
            <li className="flex items-start gap-2">
              <span className="font-bold text-rose-700 font-mono">✕</span>
              <span><strong>Building "Everything" with 47 Folders:</strong> Trying to cram SQL + dbt + ML + Kafka + Airflow + SHAP + LLM + LangChain + CI/CD into one project. Interviewers immediately test if you can justify every piece.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-rose-700 font-mono">✕</span>
              <span><strong>Unverified Business Claims:</strong> Claiming your model "saved $1.4M" in a portfolio project without ever running an actual retention campaign with marketing. Distinguish Observed Baselines from Scenario Simulations.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-rose-700 font-mono">✕</span>
              <span><strong>Silent Failures & Messy Data Handling:</strong> Dropping corrupted rows silently (`dropna()`) instead of implementing data contracts and dedicated quarantine error tables.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-rose-700 font-mono">✕</span>
              <span><strong>Letting LLMs Make Business Decisions:</strong> Letting an AI prompt decide customer discounts or refunds rather than enforcing a deterministic Python Policy Engine.</span>
            </li>
          </ul>
        </div>

        {/* What They Respect */}
        <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-base text-emerald-900">
              What Senior Interviewers Respect (Top 5% Portfolio)
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-emerald-950">
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-700 font-mono">✓</span>
              <span><strong>Production-Grade Data Contracts:</strong> Schema validation at the boundary, splitting valid records into Staging and corrupted records into a Quarantine table with reasons.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-700 font-mono">✓</span>
              <span><strong>Strict Time-Aware Validation:</strong> Point-in-time feature engineering with distinct observation and prediction windows (zero temporal data leakage).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-700 font-mono">✓</span>
              <span><strong>Financial Expected-Value Tuning:</strong> Optimizing decision thresholds based on actual campaign contact costs (₹80) vs retained profit (₹1,200), not generic ROC-AUC.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-700 font-mono">✓</span>
              <span><strong>Policy-Constrained AI (Pydantic):</strong> Business logic decides the coupon or offer; the LLM is only invoked to personalize customer phrasing under strict schemas.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
