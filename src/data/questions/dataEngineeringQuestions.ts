import { InterviewQuestion } from "../../types";

export const DATA_ENGINEERING_QUESTIONS: InterviewQuestion[] = [
  {
    id: "de-01",
    role: "Data Engineer",
    category: "Data Engineering & Architecture",
    difficulty: "Mid",
    question: "Explain the Medallion Architecture (Bronze, Silver, Gold). What lives in each layer?",
    context: "The universal lakehouse architectural pattern used across Databricks, Snowflake, and BigQuery.",
    modelAnswer: `- **Bronze (Raw / Ingestion Layer)**:
  - Stores raw, untransformed data exactly as received from source systems (API dumps, Kafka event streams, CDC logs).
  - Preserves immutable append-only historical audit trail. Usually stored in raw Parquet/Iceberg format with ingestion timestamps.
- **Silver (Cleansed / Conformed Layer)**:
  - Enforces schema, deduplicates records, handles missing fields, casts data types, and normalizes timestamps to UTC.
  - Joins reference tables to create conformed entity views (e.g. \`silver_orders\`, \`silver_users\`).
- **Gold (Aggregated / Business Mart Layer)**:
  - Star-schema dimensional models, metric marts, and feature stores optimized for BI dashboards, executive reporting, and machine learning models.
  - Heavily indexed, partitioned, and pre-aggregated for lightning-fast sub-second query response.`,
    seniorTips: [
      "Explain the key architectural benefit: If business logic changes in 6 months, you can re-run dbt transformations from the raw Bronze layer without needing to re-fetch data from external third-party production APIs.",
    ],
    pitfalls: [
      "Letting business analysts query the raw Bronze layer directly.",
      "Performing heavy aggregations in the Silver layer instead of keeping it clean and granular.",
    ],
    tags: ["Medallion Architecture", "Lakehouse", "Data Modeling"],
    evaluationCriteria: ["Defines all 3 layers clearly", "Explains re-computability from raw Bronze", "Outlines BI consumption in Gold"],
    hint: "Bronze is raw from the source, Silver is cleaned and deduplicated, Gold is ready for business dashboards.",
  },
  {
    id: "de-02",
    role: "Data Engineer",
    category: "Data Engineering & Architecture",
    difficulty: "Senior",
    question: "How do dbt Incremental Models work, and what is the difference between 'merge' and 'delete+insert' strategies?",
    context: "Critical technique to transform massive tables without expensive full-table refreshes.",
    modelAnswer: `A dbt incremental model only transforms and loads records that have arrived or changed since the last dbt execution, drastically cutting warehouse compute costs.

\`\`\`sql
{{ config(
    materialized = 'incremental',
    unique_key = 'order_id',
    incremental_strategy = 'merge'
) }}

SELECT 
    order_id, customer_id, amount, status, updated_at
FROM {{ ref('silver_orders') }}
{% if is_incremental() %}
    -- Scan only rows updated since the max timestamp already in this table
    WHERE updated_at > (SELECT MAX(updated_at) FROM {{ this }})
{% endif %}
\`\`\`

**Incremental Strategies**:
- **merge (Default)**: Executes an \`UPSERT\` (SQL MERGE statement). Updates existing rows that match the \`unique_key\` and inserts new rows. Ideal for mutable data (orders where status changes from pending to delivered).
- **delete+insert**: Deletes matching records first, then inserts new records. Used when warehouses (or older dialects) don't support native MERGE statements or when partitions can be replaced wholesale.
- **append**: Purely inserts new records without checking for duplicates. 10x faster, but only valid for immutable append-only event logs (clickstreams).`,
    seniorTips: [
      "Late-Arriving Data Trap: Always include a lookback window buffer (e.g. \`updated_at > (SELECT MAX(updated_at) - INTERVAL '3 days' FROM {{ this }})\`) to catch late-arriving events or backfilled edits.",
    ],
    pitfalls: [
      "Omitting \`unique_key\` in a merge strategy, which creates duplicate rows.",
      "Filtering on \`created_at\` instead of \`updated_at\` for mutable records.",
    ],
    tags: ["dbt", "Incremental Models", "Data Engineering", "SQL MERGE"],
    evaluationCriteria: ["Explains is_incremental() macro syntax", "Contrasts merge vs append vs delete+insert", "Mentions lookback buffer for late-arriving data"],
    hint: "How do you tell SQL to only grab yesterday's new rows without rebuilding the whole 5-year table?",
  },
  {
    id: "de-03",
    role: "Data Engineer",
    category: "Data Engineering & Architecture",
    difficulty: "Senior",
    question: "What is Idempotency in data pipelines, and why is it a non-negotiable engineering standard?",
    context: "Fundamental engineering principle ensuring resilient, fault-tolerant ETL/ELT pipelines.",
    modelAnswer: `An operation is **Idempotent** if executing it once, or executing it 100 times with identical input parameters, produces the exact same final state in the database without creating duplicate rows, corrupted state, or side effects:
\`f(f(x)) = f(x)\`

**Why it is Non-Negotiable**:
Pipelines will inevitably fail due to network timeouts, cloud outages, or OOM errors. When an on-call engineer restarts a failed pipeline, or re-runs a backfill for '2026-03-01', it must safely overwrite or upsert the exact day's data without duplicating revenue.

**How to Guarantee Idempotency**:
1. **Partition Overwrites**: \`INSERT OVERWRITE table PARTITION (event_date = '2026-03-01') SELECT ...\` completely wipes that specific partition before writing.
2. **MERGE / UPSERT with Unique Keys**: Match on business primary key; update if exists, insert if new.
3. **Staging / Swap Pattern**: Write pipeline output to a temporary staging table, verify row count and constraints, then atomically swap: \`ALTER TABLE target SWAP WITH staging\`.`,
    seniorTips: [
      "Anti-Pattern to flag: Simple \`INSERT INTO table SELECT ...\` is NOT idempotent because re-running it immediately duplicates all records.",
      "Explain that idempotent tasks enable effortless backfills and zero-downtime pipeline retries.",
    ],
    pitfalls: [
      "Using \`INSERT INTO\` without deduplication logic.",
      "Relying on manual DELETE statements without wrapping inside a database transaction.",
    ],
    tags: ["Idempotency", "ETL Architecture", "Pipeline Reliability"],
    evaluationCriteria: ["Mathematical definition f(f(x))=f(x)", "Explains failure recovery and backfill safety", "Provides partition overwrite or merge solutions"],
    hint: "If a job crashes halfway and you click 'Retry', will you accidentally double-count revenue?",
  },
  {
    id: "de-04",
    role: "Data Engineer",
    category: "Data Engineering & Architecture",
    difficulty: "Senior",
    question: "How do you handle Late-Arriving Data in time-series pipelines (e.g. mobile app offline sync)?",
    context: "Real-world engineering challenge where event timestamps differ significantly from ingestion timestamps.",
    modelAnswer: `Late-arriving data occurs when an event happened at time $T_{event}$ (e.g. user took action in airplane mode on Monday), but doesn't reach the server until $T_{ingest}$ (Wednesday when they reconnect to Wi-Fi).

**Architectural Solutions**:
1. **Differentiate Event Time vs Ingestion Time**:
   - Always store both \`event_timestamp\` (client event time) and \`ingested_at\` (server receipt time).
   - Ingest and partition Bronze raw tables by **Ingestion Date** (so writes are append-only and streaming never re-writes historical partitions).
2. **Watermarking in Streaming (Kafka / Spark Structured Streaming / Flink)**:
   - Define an allowed lateness threshold (e.g. watermark of 24 hours). Events arriving within 24 hours update state; events older than 24 hours are routed to a dead-letter queue or trigger a daily batch reconciliation.
3. **dbt Lookback Window in Batch ELT**:
   - In incremental daily models, look back 3 to 7 days: \`WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days'\` to absorb late-arriving events cleanly into historical aggregates.`,
    seniorTips: [
      "Explain the trade-off: A longer lookback window captures more late data, but increases daily warehouse compute costs.",
      "Mention that BI metrics must state whether they are based on 'Date of Transaction' vs 'Date of Ingestion'.",
    ],
    pitfalls: [
      "Partitioning raw streaming tables by client event time (causes chaotic random writes across thousands of old S3 folders).",
      "Assuming events always arrive in chronological order.",
    ],
    tags: ["Late-Arriving Data", "Streaming Watermarks", "Event Time vs Ingest Time"],
    evaluationCriteria: ["Distinguishes event time vs ingest time", "Explains streaming watermarks", "Implements lookback buffer in incremental models"],
    hint: "What happens when a user plays a game on airplane mode and connects to Wi-Fi 3 days later?",
  },
  {
    id: "de-05",
    role: "Data Engineer",
    category: "Data Engineering & Architecture",
    difficulty: "Mid",
    question: "What are Data Contracts, and how do they solve the age-old conflict between software engineers and data teams?",
    context: "The leading modern data architecture movement bringing software engineering discipline to data.",
    modelAnswer: `Traditionally, backend software engineers deploy database schema changes or alter event payloads without telling the data team, immediately breaking downstream dbt models, dashboards, and ML models.

A **Data Contract** is a formal, versioned agreement between data producers (software engineers) and data consumers (data analysts/scientists) defining:
1. **Schema & Types**: Explicit column names, data types, nullability (e.g. defined via Protobuf, JSON Schema, or dbt contracts).
2. **SLA & Freshness**: Frequency of delivery (e.g. hourly) and maximum allowed latency.
3. **Semantic Definitions**: What 'order_cancelled' actually means in business terms.
4. **Shift-Left Enforcement**: Automated CI/CD checks in the backend GitHub repo that block pull requests if a schema migration breaks a registered data contract!`,
    seniorTips: [
      "Use the term 'Shift-Left': Shifting data quality validation left into backend pull requests rather than detecting breaks downstream when the CEO's dashboard is blank on Monday morning.",
      "Mention dbt's native model contracts feature (\`contract: {enforced: true}\`).",
    ],
    pitfalls: [
      "Thinking data contracts are just documentation in a Notion doc (they must be code-enforced in CI/CD).",
      "Blaming analysts for dashboard outages caused by untracked backend database migrations.",
    ],
    tags: ["Data Contracts", "Data Quality", "Shift-Left", "dbt Contracts"],
    evaluationCriteria: ["Defines formal contract structure", "Explains CI/CD enforcement mechanism", "Advocates shift-left philosophy"],
    hint: "How do you prevent a backend engineer from renaming 'user_id' to 'account_id' and breaking your dashboard?",
  },
  {
    id: "de-06",
    role: "Data Engineer",
    category: "Data Engineering & Architecture",
    difficulty: "Senior",
    question: "Compare Airflow vs Dagster vs Prefect: Task-Driven vs Asset-Driven Orchestration.",
    context: "Evaluates familiarity with modern orchestration paradigms.",
    modelAnswer: `- **Apache Airflow (Task-Driven Workflow)**:
  - Paradigms around **Tasks**: 'First run Task A (Python), then Task B (SQL), then Task C (Email)'.
  - *Pros*: Vast ecosystem, massive community, runs at every Fortune 500 company.
  - *Cons*: Doesn't know what *data* was produced. Tasks just pass execution signals; debugging data lineage is difficult.
- **Dagster (Software-Defined Assets - SDA)**:
  - Paradigms around **Data Assets**: You define the *tables, files, and models* you want to exist, their upstream dependencies, and freshness policies.
  - *Pros*: Native dbt integration, built-in data lineage, local testing without spinning up massive servers.
  - *Cons*: Steeper learning curve; smaller legacy enterprise footprint.
- **Prefect (Python-First Flow & Tasks)**:
  - Turns any Python function into a workflow with simple \`@flow\` and \`@task\` decorators. Dynamic task generation.`,
    seniorTips: [
      "In an interview, state: 'Airflow asks *What tasks should I run?* while Dagster asks *What data assets should exist and are they fresh?*'",
      "Airflow remains the industry standard, but asset-based thinking (dbt + Dagster) is the fastest-growing modern best practice.",
    ],
    pitfalls: [
      "Claiming Airflow is obsolete (it runs the majority of global production workloads).",
      "Passing large dataframes directly through Airflow XComs (XCom is for small metadata, not data transfers!).",
    ],
    tags: ["Airflow", "Dagster", "Orchestration", "Asset-Driven"],
    evaluationCriteria: ["Contrasts task-driven vs asset-driven", "Explains software-defined assets", "Notes XCom metadata limitations in Airflow"],
    hint: "Does the orchestrator care about running a task, or about creating a data asset?",
  },
  {
    id: "de-07",
    role: "Data Engineer",
    category: "Data Engineering & Architecture",
    difficulty: "Mid",
    question: "When does a business actually need Streaming (Kafka/Flink) vs Micro-Batch (every 15 minutes)?",
    context: "Prevents over-engineering and evaluates infrastructure cost awareness.",
    modelAnswer: `Many junior teams over-engineer complex real-time streaming architectures when standard micro-batch would be 10x cheaper and 100x simpler to maintain.

**When Real-Time Streaming (< 1 second) is Truly Required**:
1. **Real-Time Fraud & Anomaly Prevention**: Blocking a compromised credit card before the transaction authorizes at the point-of-sale.
2. **Dynamic In-Session Personalization**: Recommending products based on what the user clicked 5 seconds ago in their active session.
3. **Critical Alerting & IoT Telemetry**: Hospital patient alarms, flight altitude warnings, or factory machine overheating.

**When Micro-Batch (15m to 1hr) is Superior**:
- Executive dashboards, marketing attribution, cohort retention, weekly business reviews.
- Humans do not make strategic business decisions in milliseconds. Running micro-batch allows automated deduplication, simpler schema checks, and drastically lower cloud bills.`,
    seniorTips: [
      "Quote the engineering maxim: 'You are not Google. Micro-batch solves 95% of business analytics problems at 1/10th the infrastructure cost.'",
      "Mention that streaming introduces out-of-order events, exact-once processing complexity, and high on-call pager fatigue.",
    ],
    pitfalls: [
      "Recommending Apache Flink or Kafka for a daily marketing reporting dashboard.",
      "Underestimating the operational maintenance cost of running real-time distributed clusters.",
    ],
    tags: ["Streaming vs Batch", "Kafka", "Cost Optimization", "Architecture"],
    evaluationCriteria: ["Identifies genuine low-latency use cases", "Defends micro-batch simplicity and cost", "Explains operational overhead of streaming"],
    hint: "Does a marketing executive need a revenue dashboard updated every 500 milliseconds?",
  },
  {
    id: "de-08",
    role: "Data Engineer",
    category: "Data Engineering & Architecture",
    difficulty: "Senior",
    question: "Explain the difference between Star Schema and 'One Big Table' (OBT) in modern cloud warehouses.",
    context: "The ongoing architectural debate in Snowflake, BigQuery, and ClickHouse.",
    modelAnswer: `- **Star Schema (Kimball)**:
  - Central fact table joined to multiple dimension tables.
  - *Pros*: Clean governance, single source of truth for entity attributes, lower storage footprint, intuitive for dimensional navigation.
  - *Cons*: Requires runtime joins, which can slow queries down if tables have billions of rows.
- **One Big Table (OBT)**:
  - Pre-joins all dimensions into a massive, highly denormalized single wide table (e.g. 80+ columns).
  - *Pros*: Zero joins at query time! Columnar engines (BigQuery, ClickHouse) only scan the requested columns, making aggregate queries blazingly fast.
  - *Cons*: Storage redundancy, row update anomalies (changing a customer city requires updating 10,000 historical rows), and risk of inconsistent definitions across different wide tables.

**Modern Consensus**:
Maintain a clean Star Schema in the Silver/Gold layer as the canonical source of truth, and materialize specialized OBT marts for specific high-traffic dashboards or real-time OLAP engines (ClickHouse / Apache Pinot).`,
    seniorTips: [
      "Point out that cloud columnar storage compresses repeated strings (run-length encoding, dictionary encoding) so well that OBT storage costs are far lower than traditionally feared.",
    ],
    pitfalls: [
      "Claiming Star Schema is completely dead (it remains the premier paradigm for semantic governance).",
      "Using OBT for operational transactional databases (OBT is strictly for analytical read-heavy OLAP).",
    ],
    tags: ["Star Schema", "OBT", "Kimball", "Columnar Storage"],
    evaluationCriteria: ["Contrasts join performance vs update complexity", "Explains columnar compression impact", "Proposes hybrid modern consensus"],
    hint: "Joins at query time (Star Schema) versus joins at build time (One Big Table).",
  },
  {
    id: "de-09",
    role: "Data Engineer",
    category: "Data Engineering & Architecture",
    difficulty: "Senior",
    question: "What is an Apache Iceberg / Delta Lake table format, and why is the data industry moving toward it?",
    context: "The massive shift away from proprietary warehouse lock-in toward open lakehouse standards.",
    modelAnswer: `Historically, data stored in cloud object storage (S3, GCS) as raw Parquet files lacked ACID transactions, schema evolution, and file-level metadata. Cloud warehouses (Snowflake, BigQuery) locked customers into proprietary storage formats.

**Apache Iceberg and Delta Lake provide an Open Table Format that brings database warehouse features directly to object store Parquet files**:
1. **ACID Transactions**: Multiple engines can safely read and write simultaneously without dirty reads or partial writes.
2. **Schema Evolution**: Add, rename, or drop columns safely without rewriting historical Parquet files.
3. **Hidden Partitioning & Time Travel**: Queries can query \`AS OF TIMESTAMP '2026-01-01'\` using snapshot metadata trees.
4. **Engine Interoperability**: The exact same Iceberg table stored in Amazon S3 can be queried simultaneously by Snowflake, Apache Spark, Trino, and DuckDB without copying or exporting data!`,
    seniorTips: [
      "Mention the cost leverage: Storing data in open Iceberg tables on S3 prevents multi-million dollar vendor lock-in and allows companies to switch query engines effortlessly.",
      "Snowflake and BigQuery have both launched native Managed Iceberg Table support.",
    ],
    pitfalls: [
      "Confusing file formats (Parquet, ORC) with table formats (Iceberg, Delta Lake).",
      "Thinking Iceberg is a compute engine (it is a metadata specification, not a query engine).",
    ],
    tags: ["Apache Iceberg", "Delta Lake", "Open Lakehouse", "Parquet"],
    evaluationCriteria: ["Explains ACID on object storage", "Cites engine interoperability benefit", "Explains snapshot metadata and time travel"],
    hint: "Parquet is the book; Iceberg is the catalog and table of contents that keeps track of the books.",
  },
  {
    id: "de-10",
    role: "Data Engineer",
    category: "Data Engineering & Architecture",
    difficulty: "Mid",
    question: "What is Data Lineage, and how does automated lineage help data teams prevent breaking changes?",
    context: "Fundamental to data governance, root-cause debugging, and impact analysis.",
    modelAnswer: `**Data Lineage** maps the complete lifecycle, journey, and dependencies of data: from its original source ingestion, through intermediate transformations and dbt models, to the final downstream dashboards, ML models, and reverse-ETL syncs.

**Why Automated Lineage is Crucial**:
1. **Impact Analysis (Before Making Changes)**: If an engineer wants to drop or rename column \`customer_status\` in \`silver_users\`, the DAG lineage graph shows instantly that 3 dbt models, 2 executive dashboards, and 1 churn ML pipeline depend on it!
2. **Root-Cause Debugging (During Outages)**: If the 'Daily Active Users' metric looks corrupted on the CEO's dashboard, lineage allows you to trace upstream directly to the exact failing ingest pipeline or dbt model in seconds.
3. **Regulatory Compliance (GDPR / CCPA)**: Proving to auditors exactly where Personally Identifiable Information (PII) flows and where it is hashed or masked.`,
    seniorTips: [
      "Mention open standards like **OpenLineage** and tools like dbt Docs DAG, Atlan, and Monte Carlo.",
      "Column-Level Lineage (CLL) is the pinnacle: tracking not just table-to-table dependencies, but individual column transformations.",
    ],
    pitfalls: [
      "Maintaining manual lineage maps in Excel (guaranteed to be outdated within 48 hours).",
      "Ignoring reverse-ETL endpoints (e.g. syncing data into Salesforce or Braze).",
    ],
    tags: ["Data Lineage", "Governance", "Impact Analysis", "dbt Docs"],
    evaluationCriteria: ["Explains upstream and downstream mapping", "Describes impact analysis workflow", "Mentions column-level lineage"],
    hint: "If you change a formula in column A, which executive charts in the company will change?",
  },
  {
    id: "de-11",
    role: "Data Engineer",
    category: "Data Engineering & Architecture",
    difficulty: "Mid",
    question: "How do you handle semi-structured JSON data inside SQL queries in modern cloud warehouses?",
    context: "Testing ability to extract events, payloads, and nested API data directly in SQL.",
    modelAnswer: `Modern cloud data warehouses have native data types for semi-structured data:
- Snowflake: \`VARIANT\` type, queried with colon syntax (\`raw_json:user.id::INT\`) and \`FLATTEN()\`.
- BigQuery: \`JSON\` type or \`RECORD/STRUCT\`, queried with \`JSON_EXTRACT_SCALAR()\` or \`UNNEST()\`.
- PostgreSQL: \`JSONB\` type, queried with \`->\` (returns JSON) and \`->>\` (returns text).

\`\`\`sql
-- Snowflake Example:
SELECT 
    payload:event_id::STRING AS event_id,
    payload:user.email::STRING AS user_email,
    f.value:product_id::STRING AS item_purchased
FROM raw_events,
LATERAL FLATTEN(input => payload:cart_items) f;

-- BigQuery Example:
SELECT 
    JSON_VALUE(payload, '$.event_id') AS event_id,
    item.product_id
FROM raw_events,
UNNEST(JSON_EXTRACT_ARRAY(payload, '$.cart_items')) AS item;
\`\`\``,
    seniorTips: [
      "Performance Note: Querying deep JSON paths dynamically in SQL causes high CPU overhead. In the Silver layer, always parse high-frequency JSON attributes into explicit, typed columns so the warehouse can leverage columnar compression!",
    ],
    pitfalls: [
      "Using regex text parsing instead of native JSON extraction operators.",
      "Leaving massive tables in raw nested JSON in the Gold reporting layer.",
    ],
    tags: ["JSON in SQL", "Snowflake VARIANT", "BigQuery UNNEST", "Semi-Structured"],
    evaluationCriteria: ["Demonstrates native dialect JSON extraction syntax", "Uses FLATTEN or UNNEST for arrays", "Advises parsing to typed columns for performance"],
    hint: "Use the native colon or arrow operators and flatten arrays into rows.",
  },
  {
    id: "de-12",
    role: "Data Engineer",
    category: "Data Engineering & Architecture",
    difficulty: "Senior",
    question: "What is 'Spill to Disk' (Local and Remote) in cloud data warehouses, and how do you resolve it?",
    context: "Crucial performance and cost tuning diagnostic for Snowflake and BigQuery.",
    modelAnswer: `When a query executes operations requiring large in-memory state (huge JOINs, \`DISTINCT\`, \`GROUP BY\`, or \`ORDER BY\` across hundreds of millions of rows), the database attempts to process it in fast RAM.

If the data exceeds the warehouse node's allocated RAM:
1. **Local Disk Spill**: The query engine starts paging intermediate state to local NVMe SSD storage on the node. Query execution slows down 10x.
2. **Remote Disk Spill**: If local SSD also runs out of space, the query pages to remote cloud object storage (Amazon S3 / Google Cloud Storage). Query performance collapses 100x to 1,000x and costs skyrocket!

**How to Resolve Spill**:
- **Increase Warehouse Size**: Moving from Size M to Size L doubles the RAM per node, keeping the entire join in memory.
- **Filter and Prune Aggressively**: Push filters down before the join; select only necessary columns.
- **Fix Cartesian Products**: Check for exploded many-to-many joins caused by non-unique foreign keys.
- **Partitioning / Clustering**: Ensure joins happen between tables clustered on the same join key.`,
    seniorTips: [
      "Check the Snowflake Query Profile: If 'Bytes spilled to remote storage' is greater than zero, that is a code red emergency requiring immediate query refactoring or warehouse up-scaling.",
    ],
    pitfalls: [
      "Immediately doubling warehouse size before checking for an accidental Cartesian join.",
      "Sorting massive tables (\`ORDER BY\`) unnecessarily in subqueries.",
    ],
    tags: ["Spill to Disk", "Snowflake Performance", "Query Tuning"],
    evaluationCriteria: ["Differentiates local vs remote spill", "Identifies root causes (Cartesian joins, massive sorts)", "Outlines remediation steps"],
    hint: "What happens when your query needs 50 GB of RAM, but the server only has 16 GB?",
  },
  {
    id: "de-13",
    role: "Data Engineer",
    category: "Data Engineering & Architecture",
    difficulty: "Mid",
    question: "What is CI/CD for Analytics (Analytics Engineering), and how do you test data pipelines before merging code?",
    context: "Applying software engineering best practices to SQL and dbt pipelines.",
    modelAnswer: `Analytics Engineering applies software CI/CD principles to SQL models using GitHub Actions and dbt:

**The Modern Analytics CI Pipeline**:
1. **Pull Request Trigger**: An analyst opens a PR changing a SQL model or metric definition.
2. **Automated Slim CI (dbt Cloud / GitHub Actions)**:
   - Spins up an isolated ephemeral database schema (e.g. \`pr_schema_124\`).
   - Runs **only the modified models and their immediate downstream children**:
     \`dbt build --select state:modified+ --defer --state path/to/prod/manifest\`
3. **Automated Quality Assertions**:
   - Runs dbt tests: \`unique\`, \`not_null\`, foreign key relationships, and accepted values.
   - Runs custom business assertion tests (e.g. \`assert_revenue_never_negative\`).
4. **Data Diffing**: Uses tools like **Datafold** or **Recce** to compare output rows between production and the PR schema, showing exact metric impact before merging!
5. **Tear Down**: Destroys the ephemeral test schema after merge.`,
    seniorTips: [
      "Highlight the \`--defer\` flag in dbt: It allows the CI job to run only the 2 changed models while pointing all upstream and downstream references to production tables, running CI in 60 seconds instead of 45 minutes!",
    ],
    pitfalls: [
      "Testing SQL changes directly on the production warehouse schema.",
      "Running a full rebuild of a 500-model project on every minor PR commit.",
    ],
    tags: ["Analytics Engineering", "Slim CI", "dbt Testing", "GitHub Actions"],
    evaluationCriteria: ["Explains isolated ephemeral schemas", "Mentions dbt state:modified and defer", "Describes automated data diffing"],
    hint: "How do you verify a SQL change won't break production before clicking 'Merge' on GitHub?",
  },
  {
    id: "de-14",
    role: "Data Engineer",
    category: "Data Engineering & Architecture",
    difficulty: "Senior",
    question: "How do you design a Zero-Downtime Blue/Green deployment for a core data warehouse table?",
    context: "Ensuring 24/7 continuous dashboard availability while refactoring complex tables.",
    modelAnswer: `If you drop and recreate a core reporting table (or execute a 30-minute heavy insert), any dashboard or analyst query run during that 30-minute window will fail with *'Table does not exist'* or read incomplete data.

**Zero-Downtime Blue/Green Deployment Pattern**:
1. **Build in Isolation (Green)**: Create and populate a shadow staging table completely in the background:
   \`CREATE TABLE fact_orders_green AS SELECT ...\`
2. **Execute Automated Integrity Tests**: Run tests on \`fact_orders_green\` to verify row count, non-null primary keys, and revenue totals match expectations.
3. **Atomic Pointer Swap (Metadata Swap)**:
   - In Snowflake: \`ALTER TABLE fact_orders SWAP WITH fact_orders_green;\`
   - In PostgreSQL: Inside a single transaction, swap table names:
     \`\`\`sql
     BEGIN;
     ALTER TABLE fact_orders RENAME TO fact_orders_old;
     ALTER TABLE fact_orders_green RENAME TO fact_orders;
     DROP TABLE fact_orders_old;
     COMMIT;
     \`\`\`
4. **Result**: The pointer swap executes in **less than 10 milliseconds** at the metadata level. Zero failed queries; zero downtime!`,
    seniorTips: [
      "Snowflake's atomic SWAP executes purely on the metadata catalog; zero physical data bytes are moved.",
      "In BI tools, point dashboards to a permanent VIEW that abstracts underlying table versioning.",
    ],
    pitfalls: [
      "Using \`DROP TABLE fact_orders; CREATE TABLE fact_orders AS ...\` in production.",
      "Performing non-atomic multi-step renames outside of a single transaction block.",
    ],
    tags: ["Blue/Green Deployment", "Zero Downtime", "Atomic Swap", "Table Maintenance"],
    evaluationCriteria: ["Explains metadata swap mechanism", "Guarantees zero-millisecond downtime", "Validates test assertions before swapping"],
    hint: "Build the new table completely under a secret name, then instantly swap names in a transaction.",
  },
];
