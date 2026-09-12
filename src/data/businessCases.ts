import { BusinessCase, InterviewQuestion, RoadmapStep } from "../types";

export const BUSINESS_CASES: BusinessCase[] = [
  {
    id: "ecommerce-churn",
    title: "Subscription Retention Engine (Production Analytics & Engineering System)",
    domain: "Subscription Commerce & Recurring Revenue",
    roleRelevance: {
      analyst: "Observed churn metrics vs scenario simulations, cohort retention, LTV calculation, and Metabase/Streamlit dashboards.",
      dataScientist: "Point-in-time feature engineering (strictly avoiding temporal leakage), cost-benefit threshold optimization based on expected ROI, and SHAP explainability.",
      dataEngineer: "Python multi-source ingestion, data contract assertions with quarantine routing, dbt (staging → intermediate → marts), and Airflow DAG scheduling.",
    },
    summary:
      "A production-style customer retention data platform that ingests multi-source subscription data, validates and transforms it with SQL/dbt, builds analytical and ML feature marts, predicts customer churn with time-aware splitting, optimizes retention decisions via financial expected value, and uses an LLM only for policy-constrained customer communication.",
    businessProblem: {
      context:
        "Subscribers to a recurring service are churning. Crucial Portfolio Rule: Distinguish Observed Historical Metrics from Scenario-Based Business Simulations. Never claim unverified retrospective churn reduction without running an actual funded retention campaign.",
      baselineLoss: "Observed Historical Churn: 6.8% monthly | At-Risk Customers: 18.4% of active base | Avg Subscription Value: ₹1,200 ($15)/mo.",
      targetKPIs: [
        "[Observed Baseline] Historical monthly churn rate: 6.8% across 14,200 active accounts",
        "[Scenario Target] Target churn reduction: 2.0 percentage points (6.8% → 4.8%)",
        "[Scenario Target] Target retention outreach conversion rate: 18%",
        "[Expected ROI Target] Net quarterly incremental revenue simulation: ₹540,000 ($6,750)",
      ],
      stakeholders: ["Head of Growth", "Retention Marketing Lead", "Chief Commercial Officer"],
    },
    sqlLab: {
      title: "SQL Feature Mart & Cohort Velocity Queries",
      description:
        "Write production CTEs and Window Functions that calculate 30-day activity velocity and flag early churn signals.",
      technique: "Window Functions (LAG, SUM OVER), Rolling Date Intervals, CTE Hierarchies",
      sampleSchema: [
        {
          tableName: "raw_customer_orders",
          columns: [
            { name: "order_id", type: "VARCHAR(64)", desc: "Unique order identifier" },
            { name: "customer_id", type: "VARCHAR(64)", desc: "Customer master key" },
            { name: "order_date", type: "TIMESTAMP", desc: "Purchase timestamp" },
            { name: "order_amount_usd", type: "DECIMAL(10,2)", desc: "Net order value" },
            { name: "discount_used", type: "BOOLEAN", desc: "Whether coupon applied" },
          ],
        },
        {
          tableName: "customer_app_events",
          columns: [
            { name: "event_id", type: "VARCHAR(64)", desc: "Event UUID" },
            { name: "customer_id", type: "VARCHAR(64)", desc: "Customer ID" },
            { name: "event_name", type: "VARCHAR(64)", desc: "view_item, add_to_cart, support_ticket, login" },
            { name: "event_time", type: "TIMESTAMP", desc: "Event recorded timestamp" },
          ],
        },
      ],
      queries: [
        {
          name: "Rolling 30-Day Activity Velocity & Drop-Off CTE",
          description:
            "Calculates activity changes comparing the last 30 days against the preceding 30 days for every active subscriber.",
          sql: `WITH current_30d AS (
  SELECT 
    customer_id,
    count(event_id) AS current_sessions,
    count(CASE WHEN event_name = 'support_ticket' THEN 1 END) AS recent_tickets
  FROM customer_app_events
  WHERE event_time >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY customer_id
),
previous_30d AS (
  SELECT 
    customer_id,
    count(event_id) AS prior_sessions
  FROM customer_app_events
  WHERE event_time >= CURRENT_DATE - INTERVAL '60 days'
    AND event_time < CURRENT_DATE - INTERVAL '30 days'
  GROUP BY customer_id
),
velocity_summary AS (
  SELECT 
    c.customer_id,
    COALESCE(curr.current_sessions, 0) AS current_sessions,
    COALESCE(prev.prior_sessions, 0) AS prior_sessions,
    COALESCE(curr.recent_tickets, 0) AS recent_tickets,
    ROUND(
      (COALESCE(curr.current_sessions, 0) - COALESCE(prev.prior_sessions, 0))::NUMERIC / 
      NULLIF(prev.prior_sessions, 0) * 100, 2
    ) AS activity_velocity_pct
  FROM (SELECT DISTINCT customer_id FROM customer_app_events) c
  LEFT JOIN current_30d curr ON c.customer_id = curr.customer_id
  LEFT JOIN previous_30d prev ON c.customer_id = prev.customer_id
)
SELECT * 
FROM velocity_summary
WHERE activity_velocity_pct < -40.0
ORDER BY activity_velocity_pct ASC
LIMIT 10;`,
          mockResults: [
            { customer_id: "CUST-8821", current_sessions: 2, prior_sessions: 19, recent_tickets: 3, activity_velocity_pct: -89.47 },
            { customer_id: "CUST-9140", current_sessions: 4, prior_sessions: 28, recent_tickets: 2, activity_velocity_pct: -85.71 },
            { customer_id: "CUST-1049", current_sessions: 5, prior_sessions: 31, recent_tickets: 1, activity_velocity_pct: -83.87 },
            { customer_id: "CUST-4412", current_sessions: 6, prior_sessions: 25, recent_tickets: 4, activity_velocity_pct: -76.00 },
            { customer_id: "CUST-6502", current_sessions: 8, prior_sessions: 30, recent_tickets: 0, activity_velocity_pct: -73.33 },
          ],
          optimizationNote:
            "Indexing tip: Ensure customer_app_events has a composite index on (customer_id, event_time). For multi-million row datasets, partition the table monthly to avoid full-table scans.",
        },
        {
          name: "Cohort Retention Matrix Calculation",
          description: "Generates monthly subscription retention curves by acquisition cohort.",
          sql: `WITH cohort_base AS (
  SELECT 
    customer_id,
    DATE_TRUNC('month', MIN(order_date)) AS cohort_month
  FROM raw_customer_orders
  GROUP BY customer_id
),
customer_activities AS (
  SELECT 
    o.customer_id,
    cb.cohort_month,
    DATE_PART('year', AGE(DATE_TRUNC('month', o.order_date), cb.cohort_month)) * 12 +
    DATE_PART('month', AGE(DATE_TRUNC('month', o.order_date), cb.cohort_month)) AS period_number
  FROM raw_customer_orders o
  JOIN cohort_base cb ON o.customer_id = cb.customer_id
)
SELECT 
  TO_CHAR(cohort_month, 'YYYY-MM') AS cohort,
  COUNT(DISTINCT customer_id) AS total_acquired,
  ROUND(COUNT(DISTINCT CASE WHEN period_number = 1 THEN customer_id END)::NUMERIC / COUNT(DISTINCT customer_id) * 100, 1) AS m1_retention_pct,
  ROUND(COUNT(DISTINCT CASE WHEN period_number = 2 THEN customer_id END)::NUMERIC / COUNT(DISTINCT customer_id) * 100, 1) AS m2_retention_pct,
  ROUND(COUNT(DISTINCT CASE WHEN period_number = 3 THEN customer_id END)::NUMERIC / COUNT(DISTINCT customer_id) * 100, 1) AS m3_retention_pct
FROM customer_activities
GROUP BY cohort_month
ORDER BY cohort_month DESC;`,
          mockResults: [
            { cohort: "2026-06", total_acquired: 1840, m1_retention_pct: 78.4, m2_retention_pct: 64.1, m3_retention_pct: 53.8 },
            { cohort: "2026-05", total_acquired: 1720, m1_retention_pct: 79.1, m2_retention_pct: 65.0, m3_retention_pct: 54.2 },
            { cohort: "2026-04", total_acquired: 1950, m1_retention_pct: 81.2, m2_retention_pct: 67.5, m3_retention_pct: 56.1 },
          ],
          optimizationNote:
            "Use dbt incremental models to materialize the cohort base into an analytical data mart rather than calculating from raw orders on every dashboard load.",
        },
      ],
    },
    predictiveModel: {
      modelType: "Time-Aware Churn Predictor with Financial Expected-Value Threshold Optimization",
      framework: "Python 3.11, Scikit-Learn, LightGBM/XGBoost, SHAP, Polars",
      pythonCode: `import polars as pl
import xgboost as xgb
from sklearn.metrics import precision_recall_curve, roc_auc_score
import shap

# 1. TIME-AWARE DATA SPLITTING (Zero Temporal Leakage)
# Observation Window: Jan 1 -> Mar 31 (features computed strictly up to Mar 31)
# Prediction Date: Mar 31
# Outcome Window: Apr 1 -> Apr 30 (churn evaluated during this future window)

df_train = pl.read_parquet("data/features_train_q1.parquet") # Historical train period
df_test = pl.read_parquet("data/features_test_q2.parquet")   # Strictly future test period

features = [
    "delivery_delay_days", "days_since_purchase", 
    "support_complaints_count", "order_frequency_90d",
    "avg_order_value_inr", "discount_share_pct"
]

X_train = df_train.select(features).to_numpy()
y_train = df_train.select("is_churned_future_30d").to_numpy().ravel()

X_test = df_test.select(features).to_numpy()
y_test = df_test.select("is_churned_future_30d").to_numpy().ravel()

# 2. Train Model with Class Imbalance Weighting
model = xgb.XGBClassifier(
    n_estimators=200, max_depth=4, learning_rate=0.05,
    scale_pos_weight=4.0, random_state=42
)
model.fit(X_train, y_train)

# 3. Predict Probabilities & Optimize Financial Expected Value
y_probs = model.predict_proba(X_test)[:, 1]

# Business Economics:
CAMPAIGN_COST_PER_USER = 80.0    # ₹80 outreach cost per contacted customer
RETAINED_GROSS_PROFIT = 1200.0   # ₹1,200 average retained profit per customer

# Expected Benefit = P(retention) * ₹1,200 - ₹80
best_threshold = 0.5
max_expected_profit = -float('inf')

for threshold in [0.2, 0.3, 0.4, 0.45, 0.5, 0.6, 0.7]:
    targeted = y_probs >= threshold
    # P(retention) assumed at 18% campaign conversion among targeted high-risk users
    expected_profit = sum((0.18 * RETAINED_GROSS_PROFIT - CAMPAIGN_COST_PER_USER) for is_target in targeted if is_target)
    if expected_profit > max_expected_profit:
        max_expected_profit = expected_profit
        best_threshold = threshold

print(f"Optimal Financial Decision Threshold: {best_threshold} (Net Expected Profit: ₹{max_expected_profit:,.2f})")

# 4. SHAP Interpretability: Explain Specific Customer Signals
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test[:5])
print("Customer 8421 Top Signals: 1. Delivery delay ↑, 2. Days since purchase ↑")`,
      features: [
        { name: "delivery_delay_days", importance: 0.34, type: "Numeric", description: "Average shipping delay beyond promised delivery SLA in last 60d" },
        { name: "days_since_purchase", importance: 0.26, type: "Numeric", description: "Recency metric: days elapsed since last successful subscription renewal" },
        { name: "support_complaints_count", importance: 0.18, type: "Integer", description: "Unresolved logistics or product tickets filed in last 45d" },
        { name: "order_frequency_90d", importance: 0.12, type: "Numeric", description: "Order velocity drop over preceding rolling quarter" },
        { name: "avg_order_value_inr", importance: 0.10, type: "Currency", description: "Historical average basket size in INR (LTV proxy)" },
      ],
      metrics: [
        { name: "PR-AUC Score", value: "0.812", benchmark: "> 0.75", businessInterpretation: "Precision-Recall is far more reliable than ROC-AUC on imbalanced churn data" },
        { name: "ROC-AUC Score", value: "0.874", benchmark: "> 0.80", businessInterpretation: "Solid ranking power across global probability distributions" },
        { name: "Optimal Threshold", value: "0.42", benchmark: "Max ROI", businessInterpretation: "Tuned to maximize Expected Net Benefit (₹1,200 profit vs ₹80 contact cost)" },
      ],
      thresholdSimulation: {
        defaultThreshold: 0.42,
        minThreshold: 0.1,
        maxThreshold: 0.9,
        simulate: (threshold: number) => {
          const clamped = Math.max(0.1, Math.min(0.9, threshold));
          const precision = Number((0.48 + 0.44 * clamped).toFixed(2));
          const recall = Number((0.94 - 0.58 * clamped).toFixed(2));
          const targetedCustomers = Math.round(14200 * (1.1 - clamped * 0.8));
          const outreachCost = targetedCustomers * 80; // ₹80 per contacted customer
          const campaignConversionRate = 0.18; // 18% target conversion rate
          const retainedProfitPerCustomer = 1200; // ₹1,200 average retained profit
          const customersSaved = Math.round(targetedCustomers * precision * campaignConversionRate);
          const costSaved = customersSaved * retainedProfitPerCustomer;
          const netBenefit = costSaved - outreachCost;
          return { precision, recall, costSaved, outreachCost, netBenefit };
        },
      },
    },
    automatedPipeline: {
      orchestrator: "Airflow / Dagster DAG with dbt Core & Data Quality Contracts",
      layers: [
        {
          name: "Raw Ingestion Layer",
          tech: "Python (ingest.py) + PostgreSQL",
          description: "Multi-source ingestion: Orders, Customers, Support Tickets, and Payment webhooks.",
          dataContracts: ["customer_id NOT NULL", "order_id UNIQUE", "order_amount >= 0", "order_date valid"],
        },
        {
          name: "Data Quality & Quarantine Layer",
          tech: "Python Schema Validator + Quarantine Table",
          description: "Explicit contract assertions. Valid records flow into Staging; corrupted records are routed to quarantine_orders with error metadata.",
          dataContracts: ["subscription_start <= renewal_date", "Cardinality checks: 1 customer to active subscription state"],
        },
        {
          name: "dbt Dimensional Modeling (Kimball)",
          tech: "dbt Core (Staging → Intermediate → Marts)",
          description: "stg_orders → int_customer_activity → fct_customer_monthly → mart_churn_features.",
          dataContracts: ["dbt test: unique, not_null, accepted_values, relationships between facts and dimensions"],
        },
        {
          name: "Decision Engine & LLM Augmentation",
          tech: "Python Business Policy Engine + Pydantic JSON LLM Client",
          description: "Policy engine selects approved intervention (FREE_SHIPPING_TOKEN). LLM generates personalized customer explanation strictly within policy bounds.",
          dataContracts: ["Strict constraint: LLM is strictly prohibited from inventing discounts"],
        },
      ],
      dagTasks: [
        { id: "task_1", name: "ingest_subscription_sources", type: "ingest", status: "success" },
        { id: "task_2", name: "validate_contracts_and_quarantine", type: "test", status: "success" },
        { id: "task_3", name: "dbt_run_staging_and_marts", type: "transform", status: "success" },
        { id: "task_4", name: "run_point_in_time_inference", type: "model", status: "success" },
        { id: "task_5", name: "execute_business_policy_engine", type: "alert", status: "success" },
      ],
      dbtSnippet: `{{ config(
    materialized = 'incremental',
    unique_key = 'customer_id',
    schema = 'marts'
) }}

-- mart_churn_features: Point-in-time feature aggregation
WITH customer_activity AS (
    SELECT 
        customer_id,
        COUNT(order_id) AS orders_last_90d,
        COALESCE(AVG(order_amount), 0) AS avg_order_value,
        MAX(order_date) AS last_order_date
    FROM {{ ref('stg_orders') }}
    WHERE order_date <= '{{ var("prediction_date", run_started_at.strftime("%Y-%m-%d")) }}'
    GROUP BY customer_id
)

SELECT 
    c.customer_id,
    c.orders_last_90d,
    c.avg_order_value,
    DATEDIFF('day', c.last_order_date, '{{ var("prediction_date", run_started_at.strftime("%Y-%m-%d")) }}'::DATE) AS days_since_last_order,
    CURRENT_TIMESTAMP AS calculated_at
FROM customer_activity c;`,
    },
    llmAugmentation: {
      name: "Policy-Constrained Retention Message Generator (Pydantic + LLM)",
      role: "Business Policy Engine approves the intervention (e.g. Free Shipping Token). The LLM is only used to personalize communication, never to decide discounts.",
      promptTemplate: `You are an automated customer communications assistant. You are given a customer profile, risk score, primary friction points, and an APPROVED intervention from the business policy engine.
CRITICAL CONSTRAINT: You must ONLY reference the pre-approved intervention. You are STRICTLY FORBIDDEN from inventing or offering any other discount, coupon, or financial refund.
Output valid JSON matching the CustomerRetentionMessage Pydantic schema.`,
      sampleInput: {
        customer_id: "CUST-8421",
        churn_probability: 0.83,
        primary_issue: "Recent delivery delays (avg 4.2 days beyond SLA)",
        customer_value_tier: "High-LTV (₹14,500 annual spend)",
        discount_previously_used: true,
        discount_eligibility: false,
        approved_intervention: "FREE_SHIPPING_TOKEN (Code: VIPDELIVERY60)",
      },
      sampleOutput: {
        structuredInsights: [
          "Friction Point: Delivery reliability deterioration caused frustration",
          "Policy Check: Discount eligibility = False (Already used previous promo)",
          "Approved Action: Priority Free Shipping Token applied for next 60 days",
        ],
        executiveSummary:
          "Customer 8421 is high risk due to recent logistics delays. Business Policy Engine blocked cash discount to protect unit economics, approving priority free shipping token instead.",
        suggestedAction:
          "Dispatch personalized email acknowledging shipping friction + activate VIPDELIVERY60 token on customer profile via automated CRM webhook.",
      },
    },
    dashboardData: {
      timeSeries: [
        { date: "Jan", actual: 18.2, baseline: 18.0, predicted: 17.8 },
        { date: "Feb", actual: 17.9, baseline: 18.0, predicted: 16.5 },
        { date: "Mar", actual: 16.1, baseline: 18.0, predicted: 14.8 },
        { date: "Apr", actual: 14.5, baseline: 18.0, predicted: 13.2 },
        { date: "May", actual: 12.8, baseline: 18.0, predicted: 12.0 },
        { date: "Jun", actual: 11.2, baseline: 18.0, predicted: 10.8 },
      ],
      cohortMatrix: [
        { cohort: "2026-01", m0: 100, m1: 82, m2: 69, m3: 61, m4: 56 },
        { cohort: "2026-02", m0: 100, m1: 84, m2: 72, m3: 65, m4: 60 },
        { cohort: "2026-03", m0: 100, m1: 86, m2: 77, m3: 71, m4: 67 },
        { cohort: "2026-04", m0: 100, m1: 89, m2: 81, m3: 76, m4: 73 },
      ],
      distributionData: [
        { category: "Low Risk (<20%)", count: 8400, riskRate: 4.1 },
        { category: "Moderate (20-50%)", count: 3200, riskRate: 28.5 },
        { category: "High Risk (50-80%)", count: 1800, riskRate: 67.2 },
        { category: "Critical Churn (>80%)", count: 800, riskRate: 91.4 },
      ],
    },
  },
  {
    id: "supply-chain-forecasting",
    title: "Supply Chain Stockout Prevention & Dynamic Safety-Stock Forecasting",
    domain: "Logistics & Omnichannel Inventory",
    roleRelevance: {
      analyst: "Inventory turnover analysis, stockout rate tracking, supplier SLA compliance, executive inventory KPI reporting.",
      dataScientist: "Time-series decomposition, LightGBM/Prophet SKU demand forecasting, lead-time variance modeling, safety stock formulas.",
      dataEngineer: "Automated CDC ingestion from ERP (SAP/NetSuite), batch feature pipelines, data freshness SLAs, schema evolution handling.",
    },
    summary:
      "A fast-moving consumer goods distributor lost $850k in Q3 due to out-of-stock events on high-margin SKUs while holding excess inventory in slow-moving categories.",
    businessProblem: {
      context:
        "Purchasing managers rely on static 30-day moving averages that fail to anticipate seasonal demand spikes or supplier shipping delays. Holding costs have inflated by 24% while order fulfillment SLA fell to 88%.",
      baselineLoss: "$850,000 in unfulfilled purchase orders + $320,000 excess warehousing carrying costs.",
      targetKPIs: [
        "Reduce Stockout Rate from 11.4% to < 2.5%",
        "Decrease Working Capital tied in Dead Stock by $280,000",
        "Forecast MAPE (Mean Absolute Percentage Error) < 9.5%",
        "Automate Reorder Point (ROP) calculation across 1,800 SKUs daily",
      ],
      stakeholders: ["Director of Supply Chain", "Warehouse Operations Lead", "Chief Financial Officer"],
    },
    sqlLab: {
      title: "SQL Reorder Point (ROP) & Dynamic Lead-Time Variance",
      description:
        "Compute dynamic safety stock and Reorder Points using standard deviation of lead time and rolling daily sales demand.",
      technique: "Statistical Aggregations (STDDEV, AVG), Self-Joins, Conditional Flagging",
      sampleSchema: [
        {
          tableName: "inventory_levels",
          columns: [
            { name: "sku_id", type: "VARCHAR(32)", desc: "Stock keeping unit code" },
            { name: "current_on_hand", type: "INTEGER", desc: "Physical units in warehouse" },
            { name: "on_order_qty", type: "INTEGER", desc: "Units currently in transit" },
            { name: "unit_cost_usd", type: "DECIMAL(8,2)", desc: "Cost of goods per unit" },
          ],
        },
        {
          tableName: "purchase_order_receipts",
          columns: [
            { name: "po_id", type: "VARCHAR(32)", desc: "PO Reference" },
            { name: "sku_id", type: "VARCHAR(32)", desc: "SKU ID" },
            { name: "po_date", type: "DATE", desc: "Date PO was placed" },
            { name: "delivery_date", type: "DATE", desc: "Date warehouse received stock" },
            { name: "actual_lead_time_days", type: "INTEGER", desc: "Delivery date minus PO date" },
          ],
        },
      ],
      queries: [
        {
          name: "Dynamic Safety Stock & Reorder Point (ROP) Calculation",
          description:
            "Calculates Reorder Point using the standard formula: (Avg Daily Demand * Avg Lead Time) + Safety Stock (Z * sqrt(L * σ_D² + D² * σ_L²)).",
          sql: `WITH daily_demand_stats AS (
  SELECT 
    sku_id,
    AVG(daily_units_sold) AS avg_daily_demand,
    COALESCE(STDDEV(daily_units_sold), 1.0) AS stddev_daily_demand
  FROM daily_sku_sales
  WHERE sales_date >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY sku_id
),
lead_time_stats AS (
  SELECT 
    sku_id,
    AVG(actual_lead_time_days) AS avg_lead_time,
    COALESCE(STDDEV(actual_lead_time_days), 1.5) AS stddev_lead_time
  FROM purchase_order_receipts
  WHERE delivery_date >= CURRENT_DATE - INTERVAL '180 days'
  GROUP BY sku_id
),
rop_calculation AS (
  SELECT 
    i.sku_id,
    i.current_on_hand,
    i.on_order_qty,
    ROUND(d.avg_daily_demand, 1) AS avg_demand,
    ROUND(l.avg_lead_time, 1) AS avg_lead_days,
    -- 95% service level factor Z = 1.645
    ROUND(
      1.645 * SQRT(
        (l.avg_lead_time * POWER(d.stddev_daily_demand, 2)) + 
        (POWER(d.avg_daily_demand, 2) * POWER(l.stddev_lead_time, 2))
      )
    ) AS safety_stock_units,
    ROUND(
      (d.avg_daily_demand * l.avg_lead_time) + 
      (1.645 * SQRT((l.avg_lead_time * POWER(d.stddev_daily_demand, 2)) + (POWER(d.avg_daily_demand, 2) * POWER(l.stddev_lead_time, 2))))
    ) AS reorder_point_units
  FROM inventory_levels i
  JOIN daily_demand_stats d ON i.sku_id = d.sku_id
  JOIN lead_time_stats l ON i.sku_id = l.sku_id
)
SELECT 
  sku_id,
  current_on_hand,
  safety_stock_units,
  reorder_point_units,
  CASE 
    WHEN (current_on_hand + on_order_qty) <= safety_stock_units THEN 'CRITICAL_STOCKOUT_RISK'
    WHEN (current_on_hand + on_order_qty) <= reorder_point_units THEN 'REORDER_NOW'
    ELSE 'SUFFICIENT_STOCK'
  END AS inventory_status
FROM rop_calculation
WHERE (current_on_hand + on_order_qty) <= reorder_point_units
ORDER BY safety_stock_units DESC;`,
          mockResults: [
            { sku_id: "SKU-PRO-401", current_on_hand: 42, safety_stock_units: 85, reorder_point_units: 240, inventory_status: "CRITICAL_STOCKOUT_RISK" },
            { sku_id: "SKU-PRO-109", current_on_hand: 110, safety_stock_units: 95, reorder_point_units: 280, inventory_status: "REORDER_NOW" },
            { sku_id: "SKU-ECO-882", current_on_hand: 65, safety_stock_units: 70, reorder_point_units: 190, inventory_status: "CRITICAL_STOCKOUT_RISK" },
          ],
          optimizationNote:
            "Wrap safety stock calculations into a materialized view refreshed nightly after the daily sales ingestion DAG runs.",
        },
      ],
    },
    predictiveModel: {
      modelType: "LightGBM Multi-Step Demand Forecaster with Exogenous Regressors",
      framework: "Python 3.11, LightGBM, Statsmodels, Polars",
      pythonCode: `import polars as pl
import lightgbm as lgb
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error
import numpy as np

# Load transactional history & calendar features
df = pl.read_parquet("s3://warehouse-gold/demand_features.parquet")

# Lag features and rolling calendar window
features = [
    "lag_7d_sales", "lag_14d_sales", "rolling_mean_7d", "rolling_std_7d",
    "day_of_week", "month", "is_holiday", "promotional_discount_pct", "supplier_lead_time_days"
]
X = df.select(features).to_pandas()
y = df.select("units_sold").to_pandas().values.ravel()

# Temporal train-validation split (last 28 days as test)
train_size = len(X) - 28
X_train, X_test = X.iloc[:train_size], X.iloc[train_size:]
y_train, y_test = y[:train_size], y[train_size:]

model = lgb.LGBMRegressor(
    n_estimators=400,
    learning_rate=0.03,
    num_leaves=31,
    subsample=0.8,
    random_state=42
)
model.fit(X_train, y_train)
preds = model.predict(X_test)

mape = mean_absolute_percentage_error(y_test, preds) * 100
rmse = np.sqrt(mean_squared_error(y_test, preds))
print(f"28-Day Horizon MAPE: {mape:.2f}% | RMSE: {rmse:.2f} units")`,
      features: [
        { name: "lag_7d_sales", importance: 0.35, type: "Integer", description: "Same day of previous week sales units" },
        { name: "rolling_mean_7d", importance: 0.28, type: "Float", description: "Smoothed trend over the preceding 7 days" },
        { name: "promotional_discount_pct", importance: 0.18, type: "Percentage", description: "Active markdown or seasonal campaign multiplier" },
        { name: "supplier_lead_time_days", importance: 0.11, type: "Integer", description: "Historic supplier reliability metric" },
        { name: "is_holiday", importance: 0.08, type: "Boolean", description: "Federal or shopping holiday flag" },
      ],
      metrics: [
        { name: "Demand MAPE", value: "8.4%", benchmark: "< 12%", businessInterpretation: "Predictions deviate by less than 9 units for every 100 units sold" },
        { name: "Stockout Reduction", value: "-78%", benchmark: "> -60%", businessInterpretation: "Eliminated $660k of quarterly stockout lost revenue" },
        { name: "Holding Cost Savings", value: "$210k/yr", benchmark: "> $150k", businessInterpretation: "Reduced safety stock buffers on predictable, fast-moving items" },
      ],
      thresholdSimulation: {
        defaultThreshold: 1.65, // 95% service level
        minThreshold: 1.28, // 90%
        maxThreshold: 2.33, // 99%
        simulate: (zFactor: number) => {
          const serviceLevel = Math.round((1 - (2.5 - zFactor) * 0.05) * 100);
          const holdingCostPerUnit = 4.2;
          const additionalSafetyUnits = Math.round(zFactor * 1200);
          const totalHoldingCost = Math.round(additionalSafetyUnits * holdingCostPerUnit);
          const stockoutAvoidedRevenue = Math.round((zFactor / 2.33) * 780000);
          const netBenefit = stockoutAvoidedRevenue - totalHoldingCost;
          return {
            precision: serviceLevel,
            recall: zFactor,
            costSaved: stockoutAvoidedRevenue,
            outreachCost: totalHoldingCost,
            netBenefit,
          };
        },
      },
    },
    automatedPipeline: {
      orchestrator: "Dagster Software-Defined Assets with Soda Core data quality checks",
      layers: [
        {
          name: "Raw SAP / NetSuite Ingestion",
          tech: "Fivetran / Airbyte -> S3 Data Lake",
          description: "Nightly incremental extract of inventory balances and PO statuses.",
          dataContracts: ["Non-null SKU ID", "Inventory balance >= 0"],
        },
        {
          name: "Staging & Cleaning",
          tech: "dbt Core + Postgres / Snowflake",
          description: "Standardizes supplier lead times, adjusts for returns, handles stock transfers.",
          dataContracts: ["PO delivery date >= PO order date", "SKU matches active product catalog"],
        },
        {
          name: "Forecasting Asset & Alerting",
          tech: "Python container + Slack Webhook",
          description: "Generates 14-day forward forecast and sends instant alerts to procurement buyers.",
          dataContracts: ["Zero negative forecasts", "Execution completed before 06:00 AM UTC"],
        },
      ],
      dagTasks: [
        { id: "task_1", name: "sync_erp_inventory_tables", type: "ingest", status: "success" },
        { id: "task_2", name: "dbt_build_daily_demand", type: "transform", status: "success" },
        { id: "task_3", name: "soda_data_quality_tests", type: "test", status: "success" },
        { id: "task_4", name: "execute_lightgbm_forecast", type: "model", status: "success" },
        { id: "task_5", name: "generate_procurement_po_drafts", type: "alert", status: "success" },
      ],
      dbtSnippet: `WITH aggregated_daily_sales AS (
    SELECT 
        sku_id,
        sales_date,
        SUM(quantity) AS units_sold,
        AVG(unit_sale_price) AS avg_selling_price
    FROM {{ ref('stg_pos_transactions') }}
    WHERE sales_date >= CURRENT_DATE - INTERVAL '180 days'
    GROUP BY 1, 2
)
SELECT 
    sku_id,
    sales_date,
    units_sold,
    AVG(units_sold) OVER (
        PARTITION BY sku_id 
        ORDER BY sales_date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7d_avg_demand
FROM aggregated_daily_sales;`,
    },
    llmAugmentation: {
      name: "Autonomous Supplier Delay & Anomaly Intelligence Agent",
      role: "LLM analyzes supplier delay emails and freight status alerts, predicting inventory risks and auto-drafting alternative supplier POs.",
      promptTemplate: `You are an AI Procurement Specialist. Review this supplier shipping delay notice and inventory status.
Assess financial risk and provide a mitigation plan.`,
      sampleInput: {
        supplier: "Global Pacific Logistics",
        skus_affected: ["SKU-PRO-401 (Ultra Wireless Headset)", "SKU-PRO-402"],
        original_eta: "2026-09-15",
        new_eta: "2026-10-02 (17 days late)",
        reason: "Port customs inspection hold in Long Beach",
        current_warehouse_stock: "42 units (depletes in 3 days)",
      },
      sampleOutput: {
        structuredInsights: [
          "Imminent Stockout: High-margin SKU will be out of stock in 72 hours",
          "Estimated Revenue Loss: $48,200 across 17 days of lost sales",
          "Alternative Source: Domestic backup supplier has 200 units available at +8% premium",
        ],
        executiveSummary:
          "The 17-day delay from Global Pacific will create an unavoidable stockout during the upcoming promotional weekend unless expedited local inventory is procured.",
        suggestedAction:
          "Issue emergency PO for 120 units from Domestic Backup Co. ($1,440 premium is easily justified by preventing $48k in lost revenue). Draft email sent to VP of Supply Chain for one-click approval.",
      },
    },
    dashboardData: {
      timeSeries: [
        { date: "Week 1", actual: 1240, baseline: 1200, predicted: 1220 },
        { date: "Week 2", actual: 1410, baseline: 1200, predicted: 1390 },
        { date: "Week 3", actual: 1180, baseline: 1200, predicted: 1195 },
        { date: "Week 4", actual: 1680, baseline: 1200, predicted: 1650 },
        { date: "Week 5", actual: 1520, baseline: 1200, predicted: 1510 },
      ],
      distributionData: [
        { category: "Adequate (>30d)", count: 1240, riskRate: 1.2 },
        { category: "Reorder Point (10-30d)", count: 380, riskRate: 8.5 },
        { category: "Critical Danger (<10d)", count: 140, riskRate: 64.0 },
        { category: "Out of Stock (0d)", count: 40, riskRate: 100.0 },
      ],
    },
  },
  {
    id: "fintech-fraud-pipeline",
    title: "Fintech Real-Time Card Fraud & Anomaly Streaming Pipeline",
    domain: "Fintech & Digital Banking",
    roleRelevance: {
      analyst: "Fraud loss reporting, chargeback ratio monitoring, merchant risk scoring, false-positive friction analysis.",
      dataScientist: "Extreme class-imbalance modeling (0.2% fraud), Isolation Forest + LightGBM, Cost-sensitive loss matrix, explainable SAR documentation.",
      dataEngineer: "Kafka streaming pipelines, Redis online feature store, sub-second latency SLA, audit trail compliance in Snowflake.",
    },
    summary:
      "A neobank's chargeback rate surged to 0.82% of transactions ($450,000 monthly fraud losses), nearing card network penalty thresholds. The company needs sub-second fraud scoring.",
    businessProblem: {
      context:
        "Fraudsters are executing card-testing attacks and rapid-fire transactions across international IPs. Existing batch SQL queries run once every 6 hours, discovering stolen cards long after the money has left the platform.",
      baselineLoss: "$450,000 monthly in chargebacks + $85,000 card network penalty fines.",
      targetKPIs: [
        "Reduce Chargeback Rate from 0.82% to < 0.18%",
        "Cap False-Positive Decline Rate at < 0.9% to prevent legitimate user churn",
        "Sub-100ms Inference Latency at 99th percentile",
        "Automated Suspicious Activity Report (SAR) drafting within 60 seconds",
      ],
      stakeholders: ["Head of Risk & Fraud", "Chief Compliance Officer", "VP of Engineering"],
    },
    sqlLab: {
      title: "SQL Streaming Velocity Windows & Geolocation Velocity Flagging",
      description:
        "Detect abnormal transaction velocity (e.g. 5+ swipes in 10 minutes across distinct geographic locations).",
      technique: "Sliding Time Frames (RANGE BETWEEN), Geospatial calculations, Window Aggregations",
      sampleSchema: [
        {
          tableName: "realtime_card_swipes",
          columns: [
            { name: "transaction_id", type: "VARCHAR(64)", desc: "Unique swipe ID" },
            { name: "card_hash", type: "VARCHAR(64)", desc: "Hashed PAN for security" },
            { name: "amount_usd", type: "DECIMAL(10,2)", desc: "Transaction amount" },
            { name: "merchant_category_code", type: "VARCHAR(4)", desc: "MCC (e.g. 5999, 7995)" },
            { name: "ip_country", type: "VARCHAR(2)", desc: "Two-letter country code" },
            { name: "created_at", type: "TIMESTAMP", desc: "Swipe timestamp" },
          ],
        },
      ],
      queries: [
        {
          name: "10-Minute Sliding Velocity & Country Mismatch CTE",
          description: "Flags card swipes with more than 3 transactions in 10 minutes or sudden international jump.",
          sql: `WITH velocity_metrics AS (
  SELECT 
    transaction_id,
    card_hash,
    amount_usd,
    ip_country,
    created_at,
    -- Count swipes on this card in the last 10 minutes
    COUNT(*) OVER (
      PARTITION BY card_hash 
      ORDER BY created_at 
      RANGE BETWEEN INTERVAL '10 minutes' PRECEDING AND CURRENT ROW
    ) AS swipes_in_last_10m,
    -- Sum dollar amount in the last 60 minutes
    SUM(amount_usd) OVER (
      PARTITION BY card_hash 
      ORDER BY created_at 
      RANGE BETWEEN INTERVAL '60 minutes' PRECEDING AND CURRENT ROW
    ) AS sum_amount_last_60m,
    -- Check previous transaction country
    LAG(ip_country, 1) OVER (
      PARTITION BY card_hash ORDER BY created_at
    ) AS prev_country
  FROM realtime_card_swipes
)
SELECT 
  transaction_id,
  card_hash,
  amount_usd,
  swipes_in_last_10m,
  sum_amount_last_60m,
  ip_country,
  prev_country,
  CASE 
    WHEN swipes_in_last_10m >= 4 THEN 'HIGH_VELOCITY_ATTACK'
    WHEN prev_country IS NOT NULL AND ip_country != prev_country THEN 'IMPOSSIBLE_TRAVEL_ANOMALY'
    ELSE 'STANDARD'
  END AS risk_flag
FROM velocity_metrics
WHERE swipes_in_last_10m >= 3 
   OR (prev_country IS NOT NULL AND ip_country != prev_country)
ORDER BY created_at DESC;`,
          mockResults: [
            { transaction_id: "TX-99014", card_hash: "CARD-819a...ff", amount_usd: 840.0, swipes_in_last_10m: 6, sum_amount_last_60m: 2980.0, ip_country: "NG", prev_country: "US", risk_flag: "IMPOSSIBLE_TRAVEL_ANOMALY" },
            { transaction_id: "TX-99013", card_hash: "CARD-819a...ff", amount_usd: 450.0, swipes_in_last_10m: 5, sum_amount_last_60m: 2140.0, ip_country: "US", prev_country: "US", risk_flag: "HIGH_VELOCITY_ATTACK" },
            { transaction_id: "TX-98741", card_hash: "CARD-330b...21", amount_usd: 99.0, swipes_in_last_10m: 4, sum_amount_last_60m: 396.0, ip_country: "GB", prev_country: "GB", risk_flag: "HIGH_VELOCITY_ATTACK" },
          ],
          optimizationNote:
            "In a live production system, sliding window aggregates like this are computed inside a stateful streaming engine like Apache Flink or Kafka Streams and cached in Redis with sub-5ms lookup.",
        },
      ],
    },
    predictiveModel: {
      modelType: "Cost-Sensitive LightGBM + Isolation Forest Anomaly Detection",
      framework: "Python 3.11, LightGBM, Imbalanced-Learn, Scikit-Learn",
      pythonCode: `import polars as pl
from lightgbm import LGBMClassifier
from sklearn.metrics import classification_report, average_precision_score
from imblearn.over_sampling import SMOTE

# 1. Ingest transactions with high class imbalance (0.24% fraud rate)
df = pl.read_parquet("s3://fintech-features/transactions_training.parquet")

features = [
    "amount_usd", "swipes_in_last_10m", "sum_amount_last_60m",
    "is_international", "mcc_risk_weight", "device_fingerprint_changes_30d"
]
X = df.select(features).to_pandas()
y = df.select("is_fraud").to_pandas().values.ravel()

# 2. Custom Cost-Sensitive Loss Matrix:
# Missing a fraud event (False Negative) costs average $600 chargeback + fines.
# Declining a legitimate card (False Positive) costs $12 in merchant fee lost + friction.
cost_ratio = 600.0 / 12.0 # 50x penalty on False Negatives

model = LGBMClassifier(
    n_estimators=350,
    learning_rate=0.03,
    scale_pos_weight=cost_ratio,
    class_weight='balanced',
    random_state=42
)
model.fit(X, y)

# 3. Evaluate on PR-AUC (Precision-Recall Area under Curve)
test_probs = model.predict_proba(X)[:, 1]
pr_auc = average_precision_score(y, test_probs)
print(f"Precision-Recall AUC: {pr_auc:.4f}")`,
      features: [
        { name: "swipes_in_last_10m", importance: 0.42, type: "Integer", description: "Velocity of authorization attempts" },
        { name: "device_fingerprint_changes_30d", importance: 0.25, type: "Integer", description: "Different hardware/browser hashes linked to account" },
        { name: "is_international", importance: 0.15, type: "Boolean", description: "IP country mismatch against card billing country" },
        { name: "mcc_risk_weight", importance: 0.11, type: "Float", description: "Historical chargeback frequency of merchant category" },
        { name: "amount_usd", importance: 0.07, type: "Currency", description: "Dollar size of requested authorization" },
      ],
      metrics: [
        { name: "PR-AUC Score", value: "0.841", benchmark: "> 0.75", businessInterpretation: "Robust detection in extreme 0.24% positive rate environment" },
        { name: "Fraud Catch Rate", value: "93.4%", benchmark: "> 88%", businessInterpretation: "Catches over 9 out of every 10 malicious attempts" },
        { name: "False Positive Rate", value: "0.42%", benchmark: "< 1.0%", businessInterpretation: "Less than 1 in 200 legitimate transactions challenged" },
      ],
      thresholdSimulation: {
        defaultThreshold: 0.65,
        minThreshold: 0.2,
        maxThreshold: 0.95,
        simulate: (threshold: number) => {
          const fraudCaughtPct = Math.round(98 - threshold * 20);
          const totalFraudAmount = 450000;
          const costSaved = Math.round((fraudCaughtPct / 100) * totalFraudAmount);
          const falsePositiveDeclines = Math.round((1.0 - threshold) * 4800);
          const frictionLoss = falsePositiveDeclines * 14;
          const netBenefit = costSaved - frictionLoss;
          return {
            precision: Number((0.6 + threshold * 0.35).toFixed(2)),
            recall: Number((fraudCaughtPct / 100).toFixed(2)),
            costSaved,
            outreachCost: frictionLoss,
            netBenefit,
          };
        },
      },
    },
    automatedPipeline: {
      orchestrator: "Kafka -> Flink -> Redis (Online) & Snowflake (Audit Warehouse)",
      layers: [
        {
          name: "Streaming Ingestion",
          tech: "Apache Kafka + Schema Registry (Avro)",
          description: "High-throughput JSON transaction stream from card payment gateway.",
          dataContracts: ["Avro schema compatibility check", "Strict JSON format"],
        },
        {
          name: "Stateful Stream Processing",
          tech: "Apache Flink / Spark Streaming",
          description: "Computes tumbling and sliding window counts in memory, updates online feature store.",
          dataContracts: ["Max latency < 40ms", "Exactly-once processing semantics"],
        },
        {
          name: "Online Feature Cache & Audit",
          tech: "Redis Enterprise + Snowflake",
          description: "Sub-5ms feature lookups for live ML scorer; copies all events to Snowflake for compliance.",
          dataContracts: ["Point-in-time consistency", "PII encryption at rest"],
        },
      ],
      dagTasks: [
        { id: "task_1", name: "kafka_card_swipe_consumer", type: "ingest", status: "success" },
        { id: "task_2", name: "flink_window_feature_aggregation", type: "transform", status: "success" },
        { id: "task_3", name: "redis_feature_store_sync", type: "test", status: "success" },
        { id: "task_4", name: "realtime_fraud_scoring_service", type: "model", status: "success" },
        { id: "task_5", name: "auto_card_freeze_and_sar_draft", type: "alert", status: "success" },
      ],
      dbtSnippet: `SELECT 
    transaction_id,
    card_hash,
    amount_usd,
    fraud_risk_score,
    CASE 
        WHEN fraud_risk_score >= 0.85 THEN 'AUTO_BLOCKED'
        WHEN fraud_risk_score >= 0.60 THEN 'SMS_CHALLENGE'
        ELSE 'APPROVED'
    END AS decision,
    created_at
FROM {{ ref('silver_evaluated_transactions') }};`,
    },
    llmAugmentation: {
      name: "Automated SAR (Suspicious Activity Report) Compliance Drafter",
      role: "LLM transforms multi-dimensional anomaly features and IP logs into legal audit documentation required by financial regulators (FinCEN).",
      promptTemplate: `You are a Senior AML/Fraud Compliance Analyst. Transform the flagged transaction log into a formal Suspicious Activity Report (SAR) narrative.`,
      sampleInput: {
        card_hash: "CARD-819a-9941",
        account_age_days: 14,
        total_swiped_1hr: "$2,980.00",
        attempt_count: 6,
        ip_locations: ["Austin, US", "Lagos, NG", "London, GB"],
        device_anomalies: "Tor exit node detected, fingerprint spoofing",
      },
      sampleOutput: {
        structuredInsights: [
          "Pattern: Automated card testing via distributed Tor proxies",
          "Risk Tier: Level 1 Urgent Compliance Violation",
          "Account Action: Card frozen, merchant chargeback recall initiated",
        ],
        executiveSummary:
          "The subject initiated 6 high-value transactions within 42 minutes totaling $2,980 across three distinct continents. Telemetry reveals clear Tor proxy usage and synthetic browser spoofing consistent with credential stuffing.",
        suggestedAction:
          "File FinCEN SAR document #2026-F981, permanently revoke card PAN, and add issuing IP range to corporate firewall blacklist.",
      },
    },
    dashboardData: {
      timeSeries: [
        { date: "00:00", actual: 0.82, baseline: 0.2, predicted: 0.78 },
        { date: "04:00", actual: 0.74, baseline: 0.2, predicted: 0.65 },
        { date: "08:00", actual: 0.52, baseline: 0.2, predicted: 0.44 },
        { date: "12:00", actual: 0.28, baseline: 0.2, predicted: 0.25 },
        { date: "16:00", actual: 0.16, baseline: 0.2, predicted: 0.15 },
        { date: "20:00", actual: 0.14, baseline: 0.2, predicted: 0.13 },
      ],
      distributionData: [
        { category: "Normal (<0.20)", count: 98400, riskRate: 0.01 },
        { category: "Low Suspicion (0.2-0.6)", count: 1200, riskRate: 4.2 },
        { category: "Elevated Challenge (0.6-0.85)", count: 320, riskRate: 48.0 },
        { category: "Auto-Blocked (>0.85)", count: 180, riskRate: 98.6 },
      ],
    },
  },
];

export const CAREER_ROADMAP: RoadmapStep[] = [
  {
    stage: "Phase 1: Junior to Mid Data Analyst (Analytics & Business Foundations)",
    title: "SQL Mastery, Metric Trees & Business Storytelling",
    targetRole: "Analyst",
    timeframe: "Months 1 - 4",
    keySkills: [
      "Advanced SQL & PostgreSQL: Window functions (LAG, LEAD, explicit ROWS BETWEEN), gap-and-island, CTE hierarchies",
      "BI & Dashboarding: Streamlit / Metabase, cohort retention curves, dimensional drill-downs, executive summaries",
      "Python for Analytics: Polars / Pandas data munging, hypothesis testing, EDA without messy unformatted notebooks",
      "Business Acumen: Formulating quantifiable business KPIs (LTV, CAC, Payback, Churn, Retention, MRR/ARR)",
    ],
    portfolioMustHaves: [
      "Demonstrate distinction between Observed Baseline Metrics vs Scenario-Based Business Simulations",
      "Clean SQL repository with commented CTEs and query optimization plans (EXPLAIN ANALYZE)",
      "Executive dashboard answering a specific business retention or revenue question with clean visuals",
    ],
    aiEraDifferentiators: [
      "Use LLMs to synthesize customer verbatim survey feedback alongside quantitative metrics",
      "Demonstrate disciplined data storytelling: every metric is connected to an operational decision",
      "Focus on ROI simulation rather than arbitrary accuracy claims",
    ],
    recommendedProjects: [
      "Subscription Cohort Retention & Churn Analysis (Metabase / Streamlit)",
      "Marketing Multi-Touch Attribution & Campaign ROI Modeling",
    ],
  },
  {
    stage: "Phase 2: Analytics Engineer (Data Modeling & Quality Contracts)",
    title: "dbt Core, Kimball Dimensional Modeling & Data Contracts",
    targetRole: "Analytics Engineer",
    timeframe: "Months 5 - 7",
    keySkills: [
      "dbt (Data Build Tool): Models, sources, refs, doc generation, incremental models (merge / delete+insert)",
      "Dimensional Modeling: Kimball star-schema (Staging → Intermediate → Marts), Conformed dimensions, SCD Type 2",
      "Data Quality & Contracts: Schema assertions (customer_id NOT NULL, unique order_id, order_amount >= 0)",
      "Quarantine Architecture: Splitting valid rows to Staging and routing malformed rows to quarantine tables",
    ],
    portfolioMustHaves: [
      "A reproducible GitHub repo containing a dbt project with custom generic tests and automated lineage DAG",
      "Data contract specification (YAML) with automated Python / Great Expectations schema validation",
      "Clear explanation in README for why each intermediate and mart model exists (no 47-folder bloat)",
    ],
    aiEraDifferentiators: [
      "Semantic Layer: Exposing business metrics to downstream BI and AI agents with verified data contracts",
      "Automated schema drift detection and contract validation scripts",
      "Lineage-aware documentation linking raw source webhooks directly to executive KPIs",
    ],
    recommendedProjects: [
      "dbt Dimensional Warehouse for Subscription Commerce with Quarantine Layer",
      "Automated Data Contract Engine & Schema Drift Verifier",
    ],
  },
  {
    stage: "Phase 3: Data Engineer (Pipelines, Orchestration & Reliability)",
    title: "Workflow Orchestration, CI/CD Pipelines & Containerization",
    targetRole: "Data Engineer",
    timeframe: "Months 8 - 10",
    keySkills: [
      "Workflow Orchestration: Apache Airflow or Dagster DAG design, dependencies, retries, SLAs, failure callbacks",
      "Production Python: Clean modular packages (ingest.py, client.py, validator.py), Pydantic schemas, type hints",
      "Testing & CI/CD: Automated GitHub Actions running pytest, dbt test, SQLFluff linting on pull requests",
      "Containerization: Dockerfile & docker-compose for local reproducible development environments",
    ],
    portfolioMustHaves: [
      "Working Airflow or Dagster DAG that schedules multi-source ingestion, contract tests, and dbt runs",
      "Failure handling & quarantine pattern: corrupted records never crash the production pipeline",
      "Dockerized environment allowing any recruiter or engineer to run `docker compose up` seamlessly",
    ],
    aiEraDifferentiators: [
      "Agentic pipeline alerting: Slack / webhook bot that summarizes DAG failures and pinpoints root-cause tasks",
      "Vector search ingestion pipelines (RAG data engineering) alongside traditional analytical marts",
      "Zero-downtime Blue/Green table swap migrations in PostgreSQL/Snowflake",
    ],
    recommendedProjects: [
      "Automated Multi-Source Pipeline with Airflow, dbt Core, Docker, and GitHub Actions",
      "Event-Driven Streaming Ingestion with Webhooks, PostgreSQL, and Data Quarantines",
    ],
  },
  {
    stage: "Phase 4: Applied ML & AI Literacy (Pragmatic Decision Engines)",
    title: "Point-in-Time Prediction, Financial Expected-Value & Policy-Grounded AI",
    targetRole: "Cross-Functional",
    timeframe: "Months 11 - 12+",
    keySkills: [
      "Time-Aware ML Splitting: Strict observation windows (Jan-Mar) vs future prediction windows (Apr) to eliminate data leakage",
      "Imbalanced Classification: Precision-Recall AUC (PR-AUC) optimization over misleading ROC-AUC",
      "Financial Decision Engines: Tuning decision thresholds to maximize Expected Benefit: P(retention) * Profit - Cost",
      "Model Interpretability: SHAP values translated into operational business flags (e.g. delivery delays)",
      "Policy-Grounded AI: Business rules engine decides actions FIRST; LLM is only invoked to write personalized messages",
    ],
    portfolioMustHaves: [
      "Flagship project: subscription-retention-engine (dbt + Airflow + Time-Aware ML + Expected ROI + Guardrailed LLM)",
      "Interactive ROI calculator demonstrating financial trade-off between contact cost and recovered gross margin",
      "Pydantic-validated LLM client showing why the LLM is strictly forbidden from inventing unauthorized discounts",
    ],
    aiEraDifferentiators: [
      "Policy Engine First, LLM Last: Architecture that protects the company against AI hallucinations and rogue discounts",
      "Direct integration of SHAP tree explanations into automated operational notifications",
      "End-to-end data story: from raw transactional data to automated, revenue-optimized intervention",
    ],
    recommendedProjects: [
      "subscription-retention-engine (Flagship: Data Platform + Expected-Value Decision Engine + Guardrailed LLM)",
      "Dynamic Pricing & Markdown Policy Engine with Demand Elasticity Features",
    ],
  },
];

import { ALL_INTERVIEW_QUESTIONS } from "./questions";

export const MOCK_INTERVIEW_QUESTIONS: InterviewQuestion[] = ALL_INTERVIEW_QUESTIONS;

