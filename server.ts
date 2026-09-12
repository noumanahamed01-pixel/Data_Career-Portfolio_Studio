import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Helper function for staff advisor fallback responses
function getAdvisorFallback(activeMode: string): string {
  if (activeMode === "code_review") {
    return `### 🔍 Staff Engineer Code Review & Optimization Analysis

**1. Algorithmic Complexity & Execution Bottlenecks:**
- **Vectorization vs Loops**: If using Python, avoid iterative row-by-row loops (\`iterrows()\`). Replace with \`numpy.select\` or native \`Polars\` expressions for 100x speedup across columnar memory.
- **SQL Window Frame Trap**: Ensure any \`OVER (ORDER BY ...)\` clause has an explicit \`ROWS BETWEEN\` frame. Without it, ANSI SQL defaults to \`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\`, causing catastrophic memory bloat on duplicate values.
- **Micro-Partition Pruning (Snowflake/BigQuery)**: Push date and clustering filters directly into the \`WHERE\` clause. Never wrap partition columns in functions like \`WHERE DATE(created_at) = ...\` as this disables partition pruning.

**2. Production Refactoring Recommendation:**
\`\`\`sql
-- Optimized Production Standard:
WITH filtered_events AS (
    SELECT 
        user_id,
        event_timestamp,
        amount_usd,
        -- Fast window frame with explicit rows bounding
        SUM(amount_usd) OVER (
            PARTITION BY user_id 
            ORDER BY event_timestamp 
            ROWS BETWEEN 30 PRECEDING AND CURRENT ROW
        ) AS rolling_30_event_spend
    FROM {{ ref('silver_events') }}
    WHERE event_date >= CURRENT_DATE - INTERVAL '60 days' -- Enables partition pruning!
)
SELECT * FROM filtered_events;
\`\`\`

**3. Edge Case Checklist:**
- [x] Protected against division by zero using \`NULLIF(denominator, 0)\`
- [x] Handled NULLs in boolean comparisons using \`IS NOT NULL\` (avoided \`!= NULL\`)
- [x] Safe incremental lookback buffer included for late-arriving events`;
  } else if (activeMode === "resume_polish") {
    return `### 📄 Resume Bullet Optimization (Google XYZ Formula)
*Formula: Accomplished [X], as measured by [Y], by doing [Z]*

---

**❌ Before (Weak / Generic Analyst):**
*"Wrote SQL queries for marketing team dashboards and built a churn prediction model in Python."*

**✨ After (Senior Data Professional - Top 5% Standard):**
*"Architected end-to-end customer churn intelligence pipeline using **dbt** incremental models and **LightGBM**, reducing customer retention bleed by **$380K ARR** and lowering executive reporting latency by **74%** via automated **Airflow** orchestration."*

---

**❌ Before (Weak):**
*"Used Pandas to clean data and made Tableau reports."*

**✨ After (Senior Standard):**
*"Designed star-schema dimensional lakehouse on **Snowflake**, authoring 14 automated **dbt data contracts** and CI/CD tests that eliminated **99.2%** of schema-drift dashboard incidents across 4 cross-functional business units."*

**Key Takeaways for Your Portfolio:**
1. Quantify dollar or percentage business impact first.
2. Explicitly cite production technologies (dbt, Snowflake/BigQuery, LightGBM, Airflow/Dagster, Great Expectations).
3. Frame work as automated, reproducible systems rather than ad-hoc queries.`;
  } else if (activeMode === "mock_interview") {
    return `### 🎯 Staff Bar-Raiser Assessment

**1. Candidate Evaluation Score: 7.5 / 10 (Leaning Hire)**

**2. Key Strengths:**
- Structured hypothesis-driven segmentation (split by device, geography, and new vs returning cohorts).
- Checked data integrity and ingestion pipeline status before assuming real customer behavioral shift.

**3. Critical Gaps & Areas to Improve:**
- Missing explicit metric formula: Didn't distinguish between numerator volatility and denominator denominator changes in ratio metrics.
- Did not account for external seasonality or calendar anomalies (e.g. Easter holiday shift).

**4. Staff-Level Reference Formulation:**
*"I establish a 3-tier diagnostic tree: First, rule out telemetry data breaks (failed dbt DAGs, SDK logging updates). Second, run a dimensional variance decomposition across dimensions (platform, region, acquisition channel). Third, calculate cohort retention curves to determine if churn is concentrated in newly acquired users or long-tenured power users."*

**5. Follow-Up Probe:**
*"Suppose the drop is isolated exclusively to Android users in Germany. What specific telemetry or release logs would you request next?"*`;
  } else {
    return `### 🎯 Strategic Guidance: Transitioning from Data Analyst to Data Scientist & Data Engineer

**1. The 2026 Industry Landscape:**
Companies are moving away from siloed analysts who only write ad-hoc queries or data scientists who only build toy Jupyter notebooks. The highest-compensated profiles are **Full-Stack Analytics Engineers** and **Applied Product Data Scientists** who can:
- Model data cleanly in the warehouse using **dbt and Kimball dimensional design**.
- Build predictive ML pipelines with time-aware cross-validation and **financial threshold tuning**.
- Integrate **LLM cognitive agents** to turn unstructured feedback (support tickets, reviews) into structured analytical signals.

**2. Your Immediate 60-Day Technical Progression Plan:**
- **Weeks 1–2 (Data Modeling & dbt)**: Learn dbt Cloud / Core. Build a project with Bronze/Silver/Gold layers, incremental merge strategies, and \`unique\` / \`not_null\` data contracts.
- **Weeks 3–4 (Predictive Modeling Economics)**: Move beyond \`model.fit()\`. Learn to evaluate models using **PR-AUC**, cost-benefit matrices, and SHAP explainability.
- **Weeks 5–6 (Hybrid AI & LLM Augmentation)**: Build an automated root-cause agent using Gemini 3.8 Flash that summarizes anomaly alerts for executive stakeholders.
- **Weeks 7–8 (Packaging & Employer Artifacts)**: Publish a GitHub repository featuring clean folder architecture, automated GitHub Actions CI/CD, and a business-case README.`;
  }
}

// API: Career & Code Advisor (Multi-Mode Staff Mentor)
app.post("/api/gemini/advisor", async (req, res) => {
  const { question, context, roleTarget, mode, codeSnippet } = req.body;
  const activeMode = mode || "mentor";

  try {
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        isSimulated: true,
        answer: getAdvisorFallback(activeMode),
      });
    }

    let systemInstruction = "";
    if (activeMode === "code_review") {
      systemInstruction = `You are a Principal Data Engineer & Staff Analytics Architect conducting a rigorous code review.
Analyze the user's SQL, Python, or dbt code with extreme engineering depth:
1. Algorithmic & Memory Complexity (Big-O, vectorization vs loops, disk spill, micro-partition pruning in Snowflake/BigQuery).
2. Production Vulnerabilities & Traps (Division by zero, NULL boolean 3-valued logic, Cartesian explosion, temporal data leakage).
3. Modern Refactored Code Snippet (clean, formatted, documented production standard).
4. Concrete Performance Benchmarks & Indexing/Clustering guidance.`;
    } else if (activeMode === "resume_polish") {
      systemInstruction = `You are an Executive Hiring Manager and Head of Data at a Tier-1 Tech Company.
Transform the user's raw experience or bullet points into elite, high-impact resume bullets using the Google XYZ framework:
"Accomplished [X], as measured by [Y], by doing [Z]".
Highlight production tools: SQL CTEs/Window functions, dbt, Snowflake, BigQuery, Airflow/Dagster, LightGBM/XGBoost, SHAP, and LLM-augmented pipelines.
Show 3 distinct variants: Senior Data Analyst, Product Data Scientist, and Analytics/Data Engineer.`;
    } else if (activeMode === "mock_interview") {
      systemInstruction = `You are a Staff-Level Bar Raiser Interviewer for Data Analyst and Data Science roles.
Conduct a realistic technical or business case interview.
Evaluate the candidate's answer with:
1. Objective Score (1-10) with hiring recommendation (Strong Hire, Leaning Hire, No Hire).
2. Key Strengths (what they did well).
3. Critical Gaps & Areas to Improve (what was missed).
4. Staff-Level Model Answer (how a Principal/Staff Analyst answers this).
5. A challenging Follow-up Question to test their depth.`;
    } else {
      systemInstruction = `You are an elite Staff Data Scientist, Head of Analytics & Principal Data Engineer Mentor.
Your mentee is preparing for a Data Analyst role with ambitions to transition into Data Science and Data Engineering in the modern AI era.
Provide direct, highly technical yet business-grounded advice:
- Always tie technical architecture (SQL, dbt, Python ML, pipelines) to measurable business outcomes (revenue saved, churn reduced, SLA lowered).
- Provide clean code snippets, system architecture diagrams (ASCII/Markdown), and concrete interview advice.
- Avoid generic platitudes; deliver specific, battle-tested engineering recommendations.`;
    }

    const fullPrompt = `${systemInstruction}

Target Role: ${roleTarget || "Data Analyst transitioning to Data Scientist / Data Engineer"}
User Context / Goal: ${context || "Professional career preparation"}
${codeSnippet ? `Candidate Code/Artifact:\n\`\`\`\n${codeSnippet}\n\`\`\`\n` : ""}
User Inquiry / Topic: ${question}`;

    const generatePromise = ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: fullPrompt,
      config: {
        temperature: 0.6,
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API timeout (8s limit)")), 8000)
    );

    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

    res.json({
      success: true,
      isSimulated: false,
      answer: response.text,
    });
  } catch (error: any) {
    console.error("Gemini advisor error (falling back to curated staff engine):", error?.message);
    // Return curated high-quality staff fallback with simulated flag so user is never stranded
    res.json({
      success: true,
      isSimulated: true,
      answer: getAdvisorFallback(activeMode),
    });
  }
});

// API: Dynamic Portfolio Project Generator
app.post("/api/gemini/generate-project", async (req, res) => {
  const { domain, difficulty, focusArea } = req.body;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        isSimulated: true,
        project: {
          title: `Autonomous ${domain || "E-Commerce"} Customer Intelligence & Churn Prevention Engine`,
          domain: domain || "E-Commerce",
          difficulty: difficulty || "Intermediate-Advanced",
          businessProblem:
            "A subscription brand is experiencing an unbudgeted 16.4% quarterly churn rate among high-LTV cohorts, driving $840k in ARR loss. Stakeholders need early warning alerts, automated retention outreach triggers, and root-cause clustering.",
          kpis: [
            "Monthly Recurring Revenue (MRR) Churn Rate (%)",
            "Customer Lifetime Value (LTV) to CAC Ratio",
            "Model Precision@Top-20% (Targeting efficiency)",
            "Net Saved ARR ($)",
          ],
          pipelineArchitecture: {
            ingestion: "Bronze Layer: Kafka streaming event logs & Stripe subscription webhooks landed in S3/GCS as Parquet.",
            transformation: "Silver Layer: dbt (Data Build Tool) incremental models calculating 30-day rolling activity velocity, logins, and billing failures.",
            featureStore: "Gold Layer: Dimensional star-schema & user_churn_feature_mart with point-in-time correctness.",
            modeling: "Python pipeline: XGBoost classifier with Optuna hyperparameter tuning, SHAP explainability, and MLflow tracking.",
            llmIntegration: "Gemini 3.8 Flash automated root-cause summarizer generating executive retention briefs for CS agents.",
            dashboard: "Executive metrics dashboard with cohort heatmaps, churn probability distribution, and what-if intervention simulator.",
          },
          sqlSnippet: `-- Gold Feature Mart: Customer Activity Velocity & Churn Indicators
WITH user_activity_windows AS (
  SELECT 
    user_id,
    date_trunc('month', event_time) AS activity_month,
    count(DISTINCT session_id) AS monthly_sessions,
    sum(event_value) AS monthly_spend,
    LAG(count(DISTINCT session_id), 1) OVER (
      PARTITION BY user_id ORDER BY date_trunc('month', event_time)
    ) AS prev_month_sessions
  FROM bronze_app_events
  WHERE event_time >= current_date - interval '180 days'
  GROUP BY 1, 2
),
velocity_metrics AS (
  SELECT 
    user_id,
    activity_month,
    monthly_sessions,
    prev_month_sessions,
    ROUND(
      (monthly_sessions - prev_month_sessions)::numeric / 
      NULLIF(prev_month_sessions, 0) * 100, 2
    ) AS session_velocity_pct
  FROM user_activity_windows
)
SELECT * FROM velocity_metrics;`,
          pythonSnippet: `import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import classification_report, roc_auc_score
import shap

def train_churn_pipeline(features_df: pd.DataFrame):
    """
    Production-grade churn model with time-based cross validation
    and SHAP value generation for explainable AI.
    """
    X = features_df.drop(columns=['user_id', 'is_churned', 'snapshot_date'])
    y = features_df['is_churned']
    
    tscv = TimeSeriesSplit(n_splits=5)
    model = XGBClassifier(
        n_estimators=300,
        learning_rate=0.03,
        max_depth=5,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )
    
    for train_idx, val_idx in tscv.split(X):
        X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
        model.fit(X_train, y_train)
        
    y_preds_prob = model.predict_proba(X_val)[:, 1]
    print(f"Validation ROC-AUC: {roc_auc_score(y_val, y_preds_prob):.4f}")
    
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_val)
    return model, shap_values`,
          llmTask:
            "Automated Support Transcript Diagnosis: Whenever a high-churn probability customer contacts support, Gemini parses the conversation sentiment, extracts the primary complaint vector (e.g., pricing, UI bug, missing feature), and outputs a JSON recommendation directly to the retention queue.",
        },
      });
    }

    const prompt = `Generate a comprehensive, production-grade portfolio project blueprint for a Data Analyst transitioning to Analytics Engineer and Data Engineer.
Domain: ${domain || "Subscription Commerce / Fintech"}
Career Track: ${difficulty || "Analyst → Analytics Engineer → Data Engineer"}
Focus: ${focusArea || "Data Contracts + dbt Dimensional Modeling + Time-Aware ML + Policy LLM"}

SENIOR ENGINEERING MANDATES:
1. Don't build "everything" with 47 folders. Build a small, production-grade data system where every component has a clear justification.
2. Distinguish Observed Historical Metrics (e.g., historical churn rate) from Scenario-Based Business Simulations (e.g., target 2.0 pp reduction, expected ROI).
3. Data contracts & quarantine: Validate incoming records at boundary (Pydantic / Great Expectations) and route corrupt records to a quarantine table rather than dropping silently.
4. dbt modeling: Kimball star-schema (Staging -> Intermediate -> Marts).
5. Time-aware ML: Strict observation window vs prediction window (zero temporal leakage). Threshold optimized for Financial Expected Value (P(save)*Profit - Contact Cost).
6. Policy engine first, LLM last: Business logic decides coupons/actions; LLM is strictly used for personalized communication under schema constraints.
7. Dashboards: Recommend Metabase or Streamlit with actionable executive metric trees.

Return STRICT JSON matching this structure (no markdown fences):
{
  "title": "string",
  "domain": "string",
  "difficulty": "string",
  "businessProblem": "string (explicitly distinguishing observed historical baselines vs simulated business targets)",
  "kpis": ["[Observed Baseline] ...", "[Scenario Target] ...", "[Data Quality] ...", "[Expected ROI] ..."],
  "pipelineArchitecture": {
    "ingestion": "string",
    "transformation": "string",
    "featureStore": "string",
    "modeling": "string",
    "llmIntegration": "string",
    "dashboard": "string"
  },
  "sqlSnippet": "string",
  "pythonSnippet": "string",
  "llmTask": "string"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      isSimulated: false,
      project: parsed,
    });
  } catch (error: any) {
    console.error("Project generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate project",
    });
  }
});

// API: Automated LLM Root-Cause Analysis
app.post("/api/gemini/diagnose-metrics", async (req, res) => {
  const { scenario, metricAnomaly, sampleData } = req.body;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        isSimulated: true,
        diagnosis: {
          executiveSummary:
            "A 23.4% spike in checkout abandonment observed between Thursday 14:00 and Friday 08:00 was traced to a 3rd-party payment gateway latency timeout affecting Mobile Safari users on iOS 17.5+.",
          topHypotheses: [
            "Payment Gateway API 504 Gateway Timeouts on Apple Pay tokens",
            "Checkout step 2 JavaScript bundle regression deployed at 13:45 UTC",
            "Seasonal promotional voucher code validation deadlock in database",
          ],
          recommendedActions: [
            "Roll back payment SDK to v4.12.1 and initiate fallback card gateway routing",
            "Create dbt test alert on checkout_conversion_rate with 30-minute alerting interval",
            "Send personalized $10 recovery voucher to 4,820 affected abandoned cart sessions",
          ],
          sqlInvestigationQuery: `SELECT 
  device_os,
  payment_provider,
  count(*) as total_attempts,
  count(case when status = 'failed' then 1 end) as failed_attempts,
  round(count(case when status = 'failed' then 1 end)::numeric / count(*) * 100, 2) as failure_rate_pct,
  round(avg(gateway_latency_ms), 0) as avg_latency_ms
FROM checkout_transactions
WHERE transaction_time >= now() - interval '24 hours'
GROUP BY 1, 2
ORDER BY failure_rate_pct DESC;`,
        },
      });
    }

    const prompt = `You are a Senior Lead Analytics Architect. An executive dashboard has triggered a critical metric anomaly alert:
Scenario: ${scenario || "E-Commerce Checkout Failure Spike"}
Metric Anomaly: ${metricAnomaly || "Checkout abandonment jumped by 24%"}
Sample Log / Metrics Data: ${JSON.stringify(sampleData || {})}

Perform an automated root-cause diagnosis using chain-of-thought analysis. Return STRICT JSON (no markdown):
{
  "executiveSummary": "string",
  "topHypotheses": ["string", "string", "string"],
  "recommendedActions": ["string", "string", "string"],
  "sqlInvestigationQuery": "string"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      isSimulated: false,
      diagnosis: parsed,
    });
  } catch (error: any) {
    console.error("Diagnosis error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to diagnose anomaly",
    });
  }
});

// API: Mock Technical & Case Study Interview
app.post("/api/gemini/mock-interview", async (req, res) => {
  const { role, round, candidateAnswer, questionId } = req.body;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        isSimulated: true,
        feedback: {
          overallScore: 8.5,
          strengths: [
            "Good understanding of SQL window functions (LAG/LEAD) for cohort tracking",
            "Clear articulation of business trade-offs between model recall and customer intervention costs",
          ],
          areasToImprove: [
            "Address data leakage concerns when building features from rolling historical windows",
            "Explicitly mention data quality testing in dbt before feeding the ML model",
          ],
          idealAnswerSummary:
            "A Staff-level candidate would structure this using the STAR method, specify the exact warehouse partition pruning strategy, and detail how to monitor model drift using PSI (Population Stability Index).",
          followUpQuestion:
            "How would your pipeline handle backfilled or late-arriving event data from mobile clients without re-running the entire historical dbt DAG?",
        },
      });
    }

    const prompt = `You are an interview bar raiser at a top tech company evaluating a candidate for a ${role || "Data Analyst / Associate Data Scientist"} role.
Interview Type: ${round || "Technical Case Study & Pipeline Architecture"}
Question Context: ${questionId || "Business Metric Root Cause & SQL Modeling"}
Candidate Answer: ${candidateAnswer}

Evaluate the candidate objectively and constructively. Return STRICT JSON (no markdown):
{
  "overallScore": number (out of 10),
  "strengths": ["string", "string"],
  "areasToImprove": ["string", "string"],
  "idealAnswerSummary": "string",
  "followUpQuestion": "string"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      isSimulated: false,
      feedback: parsed,
    });
  } catch (error: any) {
    console.error("Interview error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to evaluate interview response",
    });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
