import React, { useState } from "react";
import {
  Sparkles,
  Code2,
  FolderTree,
  Database,
  Terminal,
  FileDown,
  Copy,
  Check,
  CheckCircle2,
  ArrowRight,
  Layers,
  Bot,
  Zap,
} from "lucide-react";
import { GeneratedProject } from "../types";

export const PortfolioGenerator: React.FC = () => {
  const [domain, setDomain] = useState("Fintech & Fraud Analytics");
  const [difficulty, setDifficulty] = useState("Analyst → Data Science Transition");
  const [focusArea, setFocusArea] = useState("Full Modern Stack: SQL + dbt + ML + LLM");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const FLAGSHIP_PROJECT: GeneratedProject = {
    title: "subscription-retention-engine (Production Data Platform)",
    domain: "Subscription Analytics & Retention Engineering",
    difficulty: "Analyst → Analytics Engineer → Data Engineer",
    businessProblem:
      "A subscription SaaS / direct-to-consumer business is losing subscribers. Instead of an unverified retrospective claim, this project separates Observed Baseline Metrics (6.8% monthly churn) from Scenario-Based Business Simulations (2.0 pp reduction target, ₹540,000 net quarterly simulation). Built as a production-grade data platform with data contracts, quarantine routing, dbt modeling (Staging → Intermediate → Marts), time-aware ML, and a policy-grounded LLM.",
    kpis: [
      "[Observed Baseline] Historical monthly churn rate: 6.8% across active subscriber base",
      "[Scenario Target] Simulated churn reduction: 2.0 percentage points (6.8% → 4.8%)",
      "[Data Quality] 100% of malformed webhooks quarantined without pipeline halts",
      "[Decision ROI] Net quarterly incremental revenue simulation: ₹540,000",
    ],
    pipelineArchitecture: {
      ingestion: "Raw Layer: Multi-source Python ingestion (ingest.py) pulling Orders, Subscriptions, and Support webhooks into PostgreSQL.",
      transformation: "dbt Dimensional Modeling: Kimball star-schema (stg_orders → int_customer_activity → mart_retention_kpis).",
      featureStore: "Feature Mart: Point-in-time features computed with zero future data leakage (DATEDIFF strictly relative to prediction date).",
      modeling: "Time-Aware XGBoost / LightGBM: Threshold optimized for Expected Benefit: P(retention) * ₹1,200 profit - ₹80 contact cost.",
      llmIntegration: "Policy Engine First, LLM Last: Python business rules approve the intervention; Gemini generates customer email strictly under Pydantic constraints.",
      dashboard: "Metabase or Streamlit Executive Dashboard with cohort retention heatmap and interactive ROI financial slider.",
    },
    sqlSnippet: `{{ config(
    materialized = 'table',
    schema = 'marts'
) }}

-- mart_customer_retention_features.sql
-- Point-in-time calculation avoiding forward data leakage
WITH active_subscriptions AS (
    SELECT 
        customer_id,
        subscription_tier,
        start_date,
        renewal_date
    FROM {{ ref('stg_subscriptions') }}
    WHERE is_active = TRUE
),

historical_activity AS (
    SELECT 
        customer_id,
        COUNT(order_id) AS total_orders_90d,
        COALESCE(AVG(order_amount), 0) AS avg_order_value,
        MAX(order_date) AS last_order_date
    FROM {{ ref('stg_orders') }}
    -- Strictly filter prior to prediction cutoff date
    WHERE order_date <= '{{ var("cutoff_date", "2026-03-31") }}'
    GROUP BY customer_id
)

SELECT 
    s.customer_id,
    s.subscription_tier,
    COALESCE(h.total_orders_90d, 0) AS orders_last_90d,
    COALESCE(h.avg_order_value, 0) AS avg_order_value,
    DATEDIFF('day', h.last_order_date, '{{ var("cutoff_date", "2026-03-31") }}'::DATE) AS days_since_last_order,
    CURRENT_TIMESTAMP AS mart_updated_at
FROM active_subscriptions s
LEFT JOIN historical_activity h ON s.customer_id = h.customer_id;`,
    pythonSnippet: `import polars as pl
from pydantic import BaseModel, Field
import xgboost as xgb

# 1. DATA CONTRACT VALIDATION & QUARANTINE ROUTING
class OrderRecord(BaseModel):
    order_id: str
    customer_id: str
    order_amount: float = Field(ge=0.0) # Contract assertion: No negative amounts
    order_date: str

def validate_and_route(raw_records: list[dict]):
    valid, quarantined = [], []
    for rec in raw_records:
        try:
            valid.append(OrderRecord(**rec).dict())
        except Exception as err:
            quarantined.append({"record": rec, "error": str(err)})
    return valid, quarantined

# 2. FINANCIAL EXPECTED-VALUE THRESHOLD OPTIMIZATION
def optimize_retention_threshold(y_probs, profit_per_save=1200.0, cost_per_contact=80.0):
    best_t, max_roi = 0.5, -float("inf")
    for t in [0.2, 0.3, 0.4, 0.45, 0.5, 0.6]:
        targeted = (y_probs >= t)
        # Expected Net Benefit = P(save)*Profit - Cost
        simulated_net_profit = sum((0.18 * profit_per_save - cost_per_contact) for is_t in targeted if is_t)
        if simulated_net_profit > max_roi:
            max_roi = simulated_net_profit
            best_t = t
    return best_t, max_roi`,
    llmTask:
      "Policy-Grounded Customer Communication (Pydantic + Gemini): The Python Business Policy Engine decides that Customer 8421 is eligible for 'FREE_SHIPPING_TOKEN' (and blocked from cash discounts due to unit economics). Gemini 3.8 Flash is instructed to personalize the email message without ever inventing or offering unauthorized discounts.",
  };

  const [project, setProject] = useState<GeneratedProject>(FLAGSHIP_PROJECT);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/gemini/generate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, difficulty, focusArea }),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
      }
    } catch (e) {
      console.error("Generation error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReadmeMarkdown = () => {
    return `# ${project.title}

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
[![dbt](https://img.shields.io/badge/dbt-1.8-orange.svg)](https://getdbt.com)
[![XGBoost](https://img.shields.io/badge/ML-XGBoost-green.svg)](https://xgboost.readthedocs.io)
[![Gemini 3.8 Flash](https://img.shields.io/badge/AI-Gemini%203.8%20Flash-amber.svg)](https://deepmind.google/technologies/gemini)

## 📌 Executive Summary & Business Problem
${project.businessProblem}

### Target Impact & KPIs
${project.kpis.map((k) => `- **${k}**`).join("\n")}

---

## 🏗️ End-to-End System Architecture (Medallion Lakehouse)
- **Ingestion (Bronze):** ${project.pipelineArchitecture.ingestion}
- **Transformation (Silver):** ${project.pipelineArchitecture.transformation}
- **Feature Store (Gold):** ${project.pipelineArchitecture.featureStore}
- **Machine Learning Layer:** ${project.pipelineArchitecture.modeling}
- **LLM-Based Analysis:** ${project.pipelineArchitecture.llmIntegration}
- **Executive Dashboard:** ${project.pipelineArchitecture.dashboard}

---

## 💻 Code Artifacts

### 1. dbt Incremental Feature Model (SQL)
\`\`\`sql
${project.sqlSnippet}
\`\`\`

### 2. Predictive Modeling & Evaluation Pipeline (Python)
\`\`\`python
${project.pythonSnippet}
\`\`\`

### 3. AI / LLM Augmentation Module
${project.llmTask}

---

## 🚀 How to Run Locally
1. Clone repository: \`git clone https://github.com/username/project.git\`
2. Install dependencies: \`pip install -r requirements.txt\`
3. Run dbt transformation: \`dbt run --select gold_features\`
4. Execute training pipeline: \`python src/train.py\`
`;
  };

  const handleDownloadReadme = () => {
    const md = generateReadmeMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "PORTFOLIO_README.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-stone-100 shadow-md">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              The 2026 Portfolio Recipe
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            AI-Era Portfolio Project Architecture Blueprint
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Hiring managers no longer want generic Kaggle notebooks (Titanic, Iris, or housing prices).
            Standout portfolios combine <strong>clean SQL data modeling (dbt)</strong>, an <strong>automated orchestration pipeline</strong>, <strong>predictive ML with financial threshold tuning</strong>, and <strong>LLM-powered root-cause reasoning</strong>.
          </p>
        </div>

        {/* Generator Controls */}
        <div className="mt-6 pt-6 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">Business Domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full text-xs bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
            >
              <option>Fintech & Fraud Analytics</option>
              <option>E-Commerce & Subscription Retention</option>
              <option>Supply Chain & Omnichannel Inventory</option>
              <option>B2B SaaS & Product-Led Growth (PLG)</option>
              <option>Healthcare & Patient Readmission</option>
              <option>CleanTech & Renewable Energy Grid</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">Target Career Track</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full text-xs bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
            >
              <option>Data Analyst (SQL + BI Metrics + Streamlit/Metabase)</option>
              <option>Analytics Engineer (dbt Core + Kimball Modeling + Data Contracts)</option>
              <option>Data Engineer (Python Ingest + Airflow/Dagster + CI/CD)</option>
              <option>Pragmatic ML & AI Decision Engines (ROI Thresholds + Policy LLM)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">Key Architecture Focus</label>
            <select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full text-xs bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
            >
              <option>Production Pipeline: Ingestion + Quarantine + dbt + Expected ROI</option>
              <option>Data Quality Contracts & Schema Validation</option>
              <option>Time-Aware Prediction with Financial Threshold Simulation</option>
              <option>Policy Engine First, Guardrailed LLM Last</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setProject(FLAGSHIP_PROJECT)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-300 text-xs font-semibold border border-stone-750 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Flagship: subscription-retention-engine</span>
          </button>

          <button
            id="btn-generate-blueprint"
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs hover:bg-amber-300 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-stone-900" />
            <span>{isLoading ? "Designing Custom Architecture..." : "Generate Custom Architecture Blueprint"}</span>
          </button>
        </div>
      </div>

      {/* Blueprint Display */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-6">
        {/* Project Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900">
                {project.domain}
              </span>
              <span className="text-xs text-stone-700">• {project.difficulty}</span>
            </div>
            <h3 className="text-xl font-bold text-stone-900">{project.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-download-readme"
              onClick={handleDownloadReadme}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition-all shadow-xs"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>Export GitHub README.md</span>
            </button>
          </div>
        </div>

        {/* Business Problem & Target KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl bg-stone-50 border border-stone-200">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Business Problem Statement (Stakeholder Narrative)
            </h4>
            <p className="text-xs text-stone-800 leading-relaxed">{project.businessProblem}</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Demonstrated Business KPIs
            </h4>
            <ul className="space-y-1.5">
              {project.kpis.map((kpi, idx) => (
                <li key={idx} className="text-xs text-stone-700 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{kpi}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Production Folder Structure */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2 mb-3">
            <FolderTree className="w-4 h-4 text-stone-700" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Recommended GitHub Repository Directory Structure
            </h4>
          </div>
          <div className="bg-stone-950 rounded-xl p-4 font-mono text-xs text-stone-300 overflow-x-auto">
            <pre>{`├── .github/workflows/          # CI/CD: Automated pytest, dbt test & SQLFluff on PR
├── airflow_dags/               # Orchestration: Ingestion -> Contract check -> dbt -> Inference
│   └── retention_pipeline_dag.py
├── dbt/                        # Kimball dimensional modeling (Staging -> Intermediate -> Marts)
│   ├── models/
│   │   ├── staging/            # Cleaned 1:1 view of source systems (stg_orders, stg_subs)
│   │   ├── intermediate/       # Business aggregations (int_customer_activity)
│   │   └── marts/              # Analytics & ML feature marts (mart_retention_kpis)
│   └── tests/                  # Data contract assertions (unique, not_null, accepted_values)
├── src/
│   ├── ingestion/              # Multi-source ingestion scripts (Python)
│   ├── contracts/              # Schema validator & quarantine table router (Zero silent drops)
│   ├── modeling/               # Time-aware training (Zero leakage) & expected ROI threshold optimizer
│   └── policy_engine/          # Python business rules + Pydantic-guardrailed LLM client
├── dashboard/                  # Metabase / Streamlit dashboard config & app
├── docker-compose.yml          # One-click local deployment: PostgreSQL + Airflow + Metabase
└── README.md                   # Business case, Observed vs Simulation KPIs, & reproduction guide`}</pre>
          </div>
        </div>

        {/* Code Artifacts: SQL & Python */}
        <div className="space-y-6">
          {/* SQL Snippet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-stone-700" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  1. Production dbt SQL Model (Incremental Window Features)
                </h4>
              </div>
              <button
                onClick={() => handleCopy(project.sqlSnippet, "sql")}
                className="flex items-center gap-1 text-xs text-stone-700 hover:text-stone-900 font-medium"
              >
                {copiedSection === "sql" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === "sql" ? "Copied" : "Copy SQL"}</span>
              </button>
            </div>
            <div className="rounded-xl bg-stone-950 text-stone-200 font-mono text-xs overflow-hidden border border-stone-800">
              <pre className="p-4 overflow-x-auto leading-relaxed">
                <code>{project.sqlSnippet}</code>
              </pre>
            </div>
          </div>

          {/* Python Snippet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-stone-700" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  2. Modular Python ML Pipeline (TimeSeriesSplit & SHAP)
                </h4>
              </div>
              <button
                onClick={() => handleCopy(project.pythonSnippet, "python")}
                className="flex items-center gap-1 text-xs text-stone-700 hover:text-stone-900 font-medium"
              >
                {copiedSection === "python" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === "python" ? "Copied" : "Copy Python"}</span>
              </button>
            </div>
            <div className="rounded-xl bg-stone-950 text-stone-200 font-mono text-xs overflow-hidden border border-stone-800">
              <pre className="p-4 overflow-x-auto leading-relaxed">
                <code>{project.pythonSnippet}</code>
              </pre>
            </div>
          </div>

          {/* LLM Augmentation */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-amber-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                3. Modern AI / LLM Augmentation Layer
              </h4>
            </div>
            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              {project.llmTask}
            </p>
            <div className="mt-2 text-[11px] text-amber-900">
              <strong>Why this stands out:</strong> In 2026, combining classical tabular predictive ML with LLM-based narrative generation shows you understand modern hybrid AI workflows that bridge numbers and executive communication.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
