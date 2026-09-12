import { InterviewQuestion } from "../../types";

export const SQL_QUESTIONS: InterviewQuestion[] = [
  {
    id: "sql-01",
    role: "Data Analyst",
    category: "Advanced SQL & Modeling",
    difficulty: "Mid",
    question: "What is the difference between ROW_NUMBER(), RANK(), and DENSE_RANK() in SQL?",
    context: "Fundamental window function question asked in almost every technical screen for Data Analysts.",
    modelAnswer: `All three functions assign integer ranks to rows ordered by a specified column:
- **ROW_NUMBER()**: Always assigns a distinct sequential integer (1, 2, 3, 4...) regardless of ties.
- **RANK()**: Assigns identical ranks to tied rows, but skips subsequent ranks (1, 2, 2, 4).
- **DENSE_RANK()**: Assigns identical ranks to tied rows without skipping numbers (1, 2, 2, 3).

Example:
\`\`\`sql
SELECT 
  employee_id, department, salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS row_num,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rnk,
  DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dense_rnk
FROM employees;
\`\`\``,
    seniorTips: [
      "Explain the exact business use case: Use DENSE_RANK() when you need 'Top 3 highest salary tiers' so ties don't prematurely consume ranking slots.",
      "Mention that ROW_NUMBER() is non-deterministic on ties unless an explicit secondary tie-breaker column is supplied.",
    ],
    pitfalls: [
      "Forgetting to specify the PARTITION BY vs ORDER BY clause.",
      "Assuming RANK() handles pagination (use ROW_NUMBER() instead).",
    ],
    tags: ["Window Functions", "Ranking", "Core SQL"],
    evaluationCriteria: ["Explains tie handling", "Gives concrete numerical example", "Demonstrates practical use case"],
    hint: "Think about what happens when two rows have the exact same salary: does the next row get rank 3 or 4?",
  },
  {
    id: "sql-02",
    role: "Data Analyst",
    category: "Advanced SQL & Modeling",
    difficulty: "Mid",
    question: "How do you calculate Month-over-Month (MoM) revenue growth using LAG() vs a Self-Join?",
    context: "Tests timeseries manipulation and computational efficiency in modern analytical engines.",
    modelAnswer: `Window functions (LAG) are preferred over self-joins because they avoid an expensive NxN join comparison and evaluate in a single partition scan.

\`\`\`sql
WITH monthly_revenue AS (
  SELECT 
    DATE_TRUNC('month', order_date) AS rev_month,
    SUM(order_amount) AS revenue
  FROM orders
  GROUP BY 1
),
growth_calc AS (
  SELECT 
    rev_month,
    revenue,
    LAG(revenue, 1) OVER (ORDER BY rev_month) AS prev_month_revenue
  FROM monthly_revenue
)
SELECT 
  rev_month,
  revenue,
  prev_month_revenue,
  ROUND((revenue - prev_month_revenue) / NULLIF(prev_month_revenue, 0) * 100, 2) AS mom_growth_pct
FROM growth_calc;
\`\`\``,
    seniorTips: [
      "Always use NULLIF(denominator, 0) to prevent division-by-zero crashes.",
      "Explain query execution: LAG executes via an in-memory WindowAggregate operator rather than a nested loop or hash join.",
    ],
    pitfalls: [
      "Calling LAG directly inside the aggregation without a CTE or subquery in databases that forbid nested aggregates.",
      "Failing to check for missing/sparse months where LAG(1) might fetch 2 months ago instead of the immediate prior month.",
    ],
    tags: ["Window Functions", "MoM Growth", "CTEs"],
    evaluationCriteria: ["Uses LAG correctly", "Protects against division by zero", "Explains performance benefit over self-join"],
    hint: "Use DATE_TRUNC first in a CTE to roll up daily data, then apply LAG on the monthly summary.",
  },
  {
    id: "sql-03",
    role: "Data Analyst",
    category: "Advanced SQL & Modeling",
    difficulty: "Senior",
    question: "How do you solve a classic 'Gaps and Islands' problem in SQL (e.g. finding consecutive active login streaks)?",
    context: "The gold standard interview question separating mid-level analysts from senior data practitioners.",
    modelAnswer: `The Gaps and Islands problem identifies sequences of consecutive events. The standard technique is subtracting a ROW_NUMBER() from the date, which generates an identical constant date anchor for consecutive days.

\`\`\`sql
WITH distinct_logins AS (
  SELECT DISTINCT user_id, CAST(login_time AS DATE) AS login_date
  FROM user_logins
),
sequenced AS (
  SELECT 
    user_id,
    login_date,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) AS rn,
    login_date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) * INTERVAL '1 day') AS streak_group
  FROM distinct_logins
)
SELECT 
  user_id,
  streak_group,
  MIN(login_date) AS streak_start,
  MAX(login_date) AS streak_end,
  COUNT(*) AS consecutive_days
FROM sequenced
GROUP BY user_id, streak_group
HAVING COUNT(*) >= 3
ORDER BY consecutive_days DESC;
\`\`\``,
    seniorTips: [
      "Clearly explain the mathematical intuition: (date - row_number) remains constant if and only if both advance by 1 each step.",
      "Remember to deduplicate multiple logins on the same calendar day first using SELECT DISTINCT.",
    ],
    pitfalls: [
      "Not handling duplicate daily logins before computing row numbers.",
      "Trying to solve this with complex recursive CTEs instead of the elegant row_number delta trick.",
    ],
    tags: ["Gaps and Islands", "Streaks", "Advanced SQL"],
    evaluationCriteria: ["Explains date - rn delta trick", "Deduplicates same-day events", "Produces streak start/end/length"],
    hint: "If you have dates Day 1, Day 2, Day 3 with row numbers 1, 2, 3: what is Day - RowNumber for all three?",
  },
  {
    id: "sql-04",
    role: "Data Analyst",
    category: "Advanced SQL & Modeling",
    difficulty: "Senior",
    question: "Explain the difference between ROWS BETWEEN and RANGE BETWEEN in SQL window frames.",
    context: "Tests deep understanding of analytical window frame specifications in Postgres/Snowflake/BigQuery.",
    modelAnswer: `- **ROWS BETWEEN**: Evaluates physical row offsets relative to the current row, regardless of value ties.
- **RANGE BETWEEN**: Evaluates logical value differences based on the values in the ORDER BY expression.

\`\`\`sql
-- ROWS: strictly the previous 2 physical rows + current row (always 3 rows max)
AVG(amount) OVER (ORDER BY trans_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)

-- RANGE: all transactions within the last 2 days of current trans_date (could be 1 or 50 rows)
SUM(amount) OVER (ORDER BY trans_date RANGE BETWEEN INTERVAL '2 days' PRECEDING AND CURRENT ROW)
\`\`\``,
    seniorTips: [
      "Highlight default window frame trap: In standard ANSI SQL, 'ORDER BY col' without a frame defaults to 'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW', which can cause surprising performance issues or duplicate aggregates on ties.",
      "Use ROWS for moving averages over fixed event counts, and RANGE for sliding temporal windows.",
    ],
    pitfalls: [
      "Assuming RANGE operates on row counts instead of value deltas.",
      "Not realizing that duplicate values in ORDER BY with RANGE merge together in the frame.",
    ],
    tags: ["Window Frames", "Performance", "PostgreSQL"],
    evaluationCriteria: ["Differentiates physical vs logical offsets", "Mentions tie behavior", "Knows default frame trap"],
    hint: "Think about 'ROWS' as counting items in a line, while 'RANGE' is measuring distance on a calendar or thermometer.",
  },
  {
    id: "sql-05",
    role: "Data Analyst",
    category: "Advanced SQL & Modeling",
    difficulty: "Junior",
    question: "What is the difference between WHERE and HAVING, and what is the SQL query execution order?",
    context: "Core foundational query question asked to verify SQL operational fundamentals.",
    modelAnswer: `- **WHERE**: Filters individual rows *before* any groupings or aggregations are computed. Cannot contain aggregate functions like SUM() or COUNT().
- **HAVING**: Filters aggregated groups *after* GROUP BY has executed. Can contain aggregate expressions.

**SQL Execution Order:**
1. **FROM / JOIN** (Table resolution & cross products)
2. **WHERE** (Filter base rows)
3. **GROUP BY** (Aggregate partitions)
4. **HAVING** (Filter aggregated groups)
5. **SELECT** (Compute projections & expressions)
6. **DISTINCT** (Remove duplicates)
7. **WINDOW FUNCTIONS** (OVER clauses)
8. **ORDER BY** (Sort output)
9. **LIMIT / OFFSET** (Pagination cutoffs)`,
    seniorTips: [
      "Explaining the execution order demonstrates why you cannot use column aliases created in SELECT inside the WHERE clause.",
      "Always push non-aggregate filters down into WHERE rather than HAVING to reduce the volume of rows the database must hash and aggregate.",
    ],
    pitfalls: [
      "Filtering by pre-aggregated columns inside HAVING, wasting query CPU.",
      "Thinking SELECT runs first because it is written first.",
    ],
    tags: ["Execution Order", "Aggregations", "Fundamentals"],
    evaluationCriteria: ["Correct execution sequence", "Explains pre-agg vs post-agg filtering", "Explains alias scope"],
    hint: "Remember the acronym: Fresh Water Gives Healthier Spring Water On Land (FROM, WHERE, GROUP BY, HAVING, SELECT, WINDOW, ORDER BY, LIMIT).",
  },
  {
    id: "sql-06",
    role: "Data Analyst",
    category: "Advanced SQL & Modeling",
    difficulty: "Mid",
    question: "How do you identify duplicate records in a table and delete only the redundant copies in SQL?",
    context: "Standard data cleansing and ETL integrity challenge.",
    modelAnswer: `Use a CTE with ROW_NUMBER() partitioned by the business key, then delete records where the row number is greater than 1.

\`\`\`sql
WITH ranked_records AS (
  SELECT 
    id,
    user_email,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_email 
      ORDER BY created_at DESC, id DESC
    ) AS row_num
  FROM customers
)
DELETE FROM customers
WHERE id IN (
  SELECT id FROM ranked_records WHERE row_num > 1
);
\`\`\``,
    seniorTips: [
      "In modern cloud warehouses like Snowflake/BigQuery where DELETE subqueries can be expensive, consider using \`CREATE OR REPLACE TABLE customers AS SELECT ... WHERE row_num = 1\` instead.",
      "Specify deterministic secondary sort keys (e.g. \`id DESC\`) so you consistently keep the latest or earliest record.",
    ],
    pitfalls: [
      "Using RANK() instead of ROW_NUMBER(), which could leave duplicates if timestamps tie.",
      "Running DELETE without testing the SELECT count first.",
    ],
    tags: ["Deduplication", "Data Quality", "CTEs"],
    evaluationCriteria: ["Uses ROW_NUMBER() with PARTITION BY", "Maintains latest/earliest record cleanly", "Considers warehouse constraints"],
    hint: "Partition by the duplicate key columns, order by timestamp, and filter for row_number > 1.",
  },
  {
    id: "sql-07",
    role: "Data Analyst",
    category: "Advanced SQL & Modeling",
    difficulty: "Senior",
    question: "How do you build an n-day Cohort Retention Matrix in pure SQL?",
    context: "Essential capability for product and growth analysts in SaaS, e-commerce, and mobile apps.",
    modelAnswer: `Cohort retention requires two steps: defining each user's cohort acquisition month/day, and calculating their active activity period relative to that cohort.

\`\`\`sql
WITH user_first_purchase AS (
  SELECT 
    user_id,
    DATE_TRUNC('month', MIN(order_date)) AS cohort_month
  FROM orders
  GROUP BY user_id
),
monthly_activities AS (
  SELECT DISTINCT
    o.user_id,
    ufp.cohort_month,
    -- Months between cohort acquisition and current activity
    (DATE_PART('year', AGE(DATE_TRUNC('month', o.order_date), ufp.cohort_month)) * 12 +
     DATE_PART('month', AGE(DATE_TRUNC('month', o.order_date), ufp.cohort_month)))::INT AS month_number
  FROM orders o
  JOIN user_first_purchase ufp ON o.user_id = ufp.user_id
)
SELECT 
  TO_CHAR(cohort_month, 'YYYY-MM') AS cohort,
  COUNT(DISTINCT user_id) AS cohort_size,
  ROUND(COUNT(DISTINCT CASE WHEN month_number = 0 THEN user_id END)::NUMERIC / COUNT(DISTINCT user_id) * 100, 1) AS m0,
  ROUND(COUNT(DISTINCT CASE WHEN month_number = 1 THEN user_id END)::NUMERIC / COUNT(DISTINCT user_id) * 100, 1) AS m1,
  ROUND(COUNT(DISTINCT CASE WHEN month_number = 2 THEN user_id END)::NUMERIC / COUNT(DISTINCT user_id) * 100, 1) AS m2,
  ROUND(COUNT(DISTINCT CASE WHEN month_number = 3 THEN user_id END)::NUMERIC / COUNT(DISTINCT user_id) * 100, 1) AS m3
FROM monthly_activities
GROUP BY cohort_month
ORDER BY cohort_month ASC;
\`\`\``,
    seniorTips: [
      "Mention that M0 should always be 100% (sanity check). If M0 < 100%, check if the activity definition excludes the acquisition action.",
      "For dynamic month columns across years, explain how pivot tables or BI semantic layers (Looker/dbt) unpivot period numbers.",
    ],
    pitfalls: [
      "Hardcoding date math without accounting for leap years or variable month lengths.",
      "Double-counting users who placed multiple orders in month 1.",
    ],
    tags: ["Cohort Analysis", "Retention", "Product Analytics"],
    evaluationCriteria: ["Defines cohort by MIN(date)", "Calculates relative period offset", "Handles multi-month matrix cleanly"],
    hint: "Find each user's first month, join back to all their purchase months, and compute the difference in months.",
  },
  {
    id: "sql-08",
    role: "Data Analyst",
    category: "Advanced SQL & Modeling",
    difficulty: "Mid",
    question: "What is the difference between UNION and UNION ALL, and what are the performance implications?",
    context: "Tests basic knowledge of set operations and resource overhead in large queries.",
    modelAnswer: `- **UNION**: Combines the result sets of two queries and *removes duplicate rows*. To do this, the database must execute a costly distinct sort or hash operation across all returned rows.
- **UNION ALL**: Simply concatenates both result sets together without checking for duplicates.

\`\`\`sql
-- High overhead (Spills to disk if dataset is millions of rows)
SELECT customer_id FROM web_orders
UNION
SELECT customer_id FROM mobile_orders;

-- Fast, zero deduplication overhead
SELECT customer_id FROM web_orders
UNION ALL
SELECT customer_id FROM mobile_orders;
\`\`\``,
    seniorTips: [
      "Senior standard: Always default to \`UNION ALL\` unless business logic explicitly requires deduplication.",
      "If deduplication is truly required, it is often faster to write \`UNION ALL\` and group by the primary key or use a CTE with partition indexing.",
    ],
    pitfalls: [
      "Using UNION by reflex when the two tables are already disjoint (e.g. current_orders and archived_orders).",
      "Having mismatched column data types between the two query branches.",
    ],
    tags: ["Set Operations", "Performance", "Optimization"],
    evaluationCriteria: ["States deduplication behavior", "Identifies sorting/memory performance cost", "Advocates UNION ALL default"],
    hint: "UNION performs a hidden DISTINCT operation on the combined set.",
  },
  {
    id: "sql-09",
    role: "Data Analyst",
    category: "Advanced SQL & Modeling",
    difficulty: "Senior",
    question: "How do you write a Recursive CTE in SQL, and what are real-world data analyst use cases?",
    context: "Evaluates ability to query hierarchical or graph data (organizational charts, bill of materials, user referral trees).",
    modelAnswer: `A Recursive CTE consists of two parts joined by UNION ALL:
1. **Anchor Member**: The base query that initiates the recursion (e.g. CEO or top-level category).
2. **Recursive Member**: References the CTE name itself to traverse parent-child relationships until no more rows match.

\`\`\`sql
WITH RECURSIVE org_hierarchy AS (
  -- 1. Anchor: Top level CEO (manager_id IS NULL)
  SELECT 
    employee_id, name, manager_id, 1 AS org_level
  FROM employees
  WHERE manager_id IS NULL
  
  UNION ALL
  
  -- 2. Recursive Member: Direct reports
  SELECT 
    e.employee_id, e.name, e.manager_id, o.org_level + 1
  FROM employees e
  JOIN org_hierarchy o ON e.manager_id = o.employee_id
)
SELECT * FROM org_hierarchy ORDER BY org_level, employee_id;
\`\`\``,
    seniorTips: [
      "Always mention cycle prevention: If there is a cyclic reference (A reports to B, B reports to A), the query will loop indefinitely. Modern engines allow adding a cycle guard or MAXRECURSION limit.",
      "Real-world analyst use case: Customer referral attribution chains to calculate multi-tier referral bonuses.",
    ],
    pitfalls: [
      "Using UNION instead of UNION ALL in the recursive step (disallowed in most dialects).",
      "Failing to set a termination condition or max depth limit.",
    ],
    tags: ["Recursive CTE", "Hierarchical Data", "Graphs"],
    evaluationCriteria: ["Defines anchor and recursive parts", "Explains termination condition", "Mentions cycle hazard"],
    hint: "Start with the root node, then join the table against the CTE itself to crawl down the tree.",
  },
  {
    id: "sql-10",
    role: "Data Analyst",
    category: "Advanced SQL & Modeling",
    difficulty: "Mid",
    question: "How do NULL values behave in SQL aggregations (COUNT, AVG, SUM) and boolean comparisons?",
    context: "Essential trap question testing precision in metric calculations.",
    modelAnswer: `- **COUNT(*)**: Counts every row in the table, including rows containing all NULLs.
- **COUNT(column)**: Counts only rows where \`column IS NOT NULL\`.
- **SUM(column)**: Ignores NULLs. If all rows are NULL, returns NULL.
- **AVG(column)**: Equivalent to \`SUM(col) / COUNT(col)\`. It excludes NULLs from both numerator and denominator (it does NOT treat NULL as zero!).
- **Boolean Comparisons**: Any comparison with NULL using standard operators (\`val = NULL\`, \`val != NULL\`) evaluates to **UNKNOWN (three-valued logic)**, never TRUE or FALSE. You must use \`IS NULL\` or \`IS NOT NULL\`.`,
    seniorTips: [
      "The AVG() trap: If a customer made 0 purchases but has NULL in purchase_amount, AVG will artificially inflate because inactive users are ignored. Use \`AVG(COALESCE(purchase_amount, 0))\` if inactive users should dilute the average.",
      "Beware \`NOT IN (subquery)\`: If the subquery contains even a single NULL, the entire \`NOT IN\` returns zero rows! Always use \`NOT EXISTS\` instead.",
    ],
    pitfalls: [
      "Using \`WHERE column = NULL\`.",
      "Assuming AVG treats NULL as 0.",
      "Using NOT IN with nullable foreign keys.",
    ],
    tags: ["NULL Handling", "Three-Valued Logic", "Aggregations"],
    evaluationCriteria: ["Contrasts COUNT(*) vs COUNT(col)", "Explains AVG calculation with NULLs", "Warns about NOT IN with NULLs"],
    hint: "NULL means 'unknown', not zero or empty string.",
  },
  {
    id: "sql-11",
    role: "Data Analyst",
    category: "Advanced SQL & Modeling",
    difficulty: "Senior",
    question: "How do you optimize a query that is running slowly in Snowflake or BigQuery without creating traditional indexes?",
    context: "Tests modern cloud data warehousing architecture where traditional B-Tree indexes do not exist.",
    modelAnswer: `Modern cloud columnar warehouses (Snowflake, BigQuery) do not use B-Tree indexes. Instead, they rely on micro-partitioning, column metadata (min/max values), and cluster keys.

Optimization checklist:
1. **Partition Pruning**: Filter by partitioned/clustered columns (e.g. \`event_date >= '2026-01-01'\`) to eliminate scanning untouched micro-partitions.
2. **Column Projection Pruning**: Never use \`SELECT *\`. Only select the 4-5 necessary columns to avoid reading terabytes of columnar storage from object store.
3. **Cluster Keys**: If queries frequently filter on \`tenant_id\` and \`event_type\`, define explicit cluster keys to sort and group related records into the same micro-partitions.
4. **Join Spill Prevention**: Check the Query Profile for 'Bytes spilled to local/remote storage'. Increase warehouse size or broadcast smaller tables.
5. **Materialize Heavy Subqueries**: Use dbt incremental tables or Materialized Views for complex multi-table window aggregates.`,
    seniorTips: [
      "Mention Snowflake Query Profile: Look at 'Partitions Scanned' vs 'Partitions Total'. A well-tuned query scans < 5% of total partitions.",
      "In BigQuery, mention partitioned tables by ingestion or event date and clustering by high-cardinality search attributes.",
    ],
    pitfalls: [
      "Suggesting 'create a B-Tree index' on Snowflake or BigQuery (they do not exist).",
      "Applying functions to partition keys in WHERE clauses like \`WHERE DATE(created_at) = ...\` which disables partition pruning.",
    ],
    tags: ["Snowflake", "BigQuery", "Query Optimization", "Cloud Warehouse"],
    evaluationCriteria: ["Identifies micro-partition pruning", "Addresses SELECT * columnar penalty", "Mentions cluster keys and query profiling"],
    hint: "Cloud warehouses store data in columnar blocks with min/max metadata; how do you ensure the query engine skips blocks?",
  },
  {
    id: "sql-12",
    role: "Data Analyst",
    category: "Advanced SQL & Modeling",
    difficulty: "Mid",
    question: "What is the difference between a Star Schema and a Snowflake Schema in dimensional data modeling?",
    context: "Dimensional modeling fundamentals for building analytical data marts and BI layers.",
    modelAnswer: `- **Star Schema**: Has a central Fact table (events/transactions) surrounded by de-normalized Dimension tables (entities). Dimension tables contain redundant attributes to avoid multi-hop joins. Highly optimized for OLAP query speed and BI usability.
- **Snowflake Schema**: Normalizes the dimension tables into sub-dimensions (e.g. \`dim_product\` joins to \`dim_sub_category\` which joins to \`dim_category\`). Reduces storage redundancy but introduces more complex joins and slower analytical queries.

\`\`\`
Star Schema:
fact_sales ──> dim_customer
fact_sales ──> dim_product (contains category & department directly)

Snowflake Schema:
fact_sales ──> dim_product ──> dim_category ──> dim_department
\`\`\``,
    seniorTips: [
      "In modern cloud warehouses where storage is cheap and compute/joins are expensive, the Star Schema is overwhelmingly preferred.",
      "Star schemas are significantly simpler for business users to navigate in BI tools like Metabase, Tableau, and Looker.",
    ],
    pitfalls: [
      "Confusing Snowflake Schema with Snowflake the Cloud Data Warehouse.",
      "Over-normalizing dimensional data into 3NF for analytical reporting.",
    ],
    tags: ["Kimball", "Dimensional Modeling", "Data Warehousing"],
    evaluationCriteria: ["Contrasts normalized vs denormalized dimensions", "Explains query performance tradeoff", "Identifies BI user impact"],
    hint: "Star schema looks like a simple star with 1 hop; snowflake has branches like ice crystals with multiple join hops.",
  },
  {
    id: "sql-13",
    role: "Data Analyst",
    category: "Advanced SQL & Modeling",
    difficulty: "Senior",
    question: "What is a Slowly Changing Dimension (SCD Type 1 vs Type 2), and how is it implemented in SQL/dbt?",
    context: "Critical concept for tracking historical changes in customer address, subscription tier, or territory.",
    modelAnswer: `- **SCD Type 1 (Overwrite)**: Overwrites existing data with new values. Historical context is lost. Good for correcting spelling typos.
- **SCD Type 2 (Add New Row with Validity Dates)**: Preserves history by adding a new record with \`valid_from\`, \`valid_to\`, and \`is_current\` flag.

\`\`\`sql
-- Querying SCD Type 2 table point-in-time:
SELECT 
  f.order_id,
  f.order_date,
  d.customer_name,
  d.customer_tier
FROM fact_orders f
JOIN dim_customer_scd2 d 
  ON f.customer_id = d.customer_id
 AND f.order_date >= d.valid_from 
 AND (f.order_date < d.valid_to OR d.valid_to IS NULL);
\`\`\``,
    seniorTips: [
      "Explain how dbt handles this out-of-the-box using the \`dbt snapshot\` command with check/timestamp strategies.",
      "Point-in-time correctness: If a customer placed an order in 2024 as 'Silver' and upgraded to 'Gold' in 2026, Type 2 ensures historical reporting credits the 2024 order to the Silver tier.",
    ],
    pitfalls: [
      "Joining without date range bounding, causing multiple matching dimension rows and duplicate order metrics.",
      "Over-using Type 2 on columns that change daily (causing massive table bloat).",
    ],
    tags: ["SCD Type 2", "Historical Modeling", "dbt Snapshots"],
    evaluationCriteria: ["Explains Type 1 vs Type 2 difference", "Provides point-in-time join logic", "Mentions valid_from/valid_to mechanics"],
    hint: "Type 1 overwrites yesterday; Type 2 writes a new row and marks yesterday's row as expired.",
  },
  {
    id: "sql-14",
    role: "Data Analyst",
    category: "Advanced SQL & Modeling",
    difficulty: "Junior",
    question: "Explain the difference between INNER, LEFT, RIGHT, FULL OUTER, and CROSS JOIN.",
    context: "Everyday join syntax and record preservation behavior.",
    modelAnswer: `- **INNER JOIN**: Returns only rows where there is a match in both tables.
- **LEFT JOIN**: Returns all rows from left table, and matching rows from right table (NULL if no match).
- **RIGHT JOIN**: Returns all rows from right table, and matching rows from left table.
- **FULL OUTER JOIN**: Returns all rows when there is a match in either left or right table.
- **CROSS JOIN**: Produces a Cartesian product (multiplies every row of table A by every row of table B).

\`\`\`sql
-- Finding users who never placed an order:
SELECT u.user_id, u.email
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.order_id IS NULL;
\`\`\``,
    seniorTips: [
      "Anti-Join Pattern: A LEFT JOIN with \`WHERE right_table.key IS NULL\` is the standard high-performance anti-join pattern.",
      "Watch out for filter placement in LEFT JOIN: Putting right-table conditions in the \`WHERE\` clause implicitly converts a LEFT JOIN into an INNER JOIN! Put conditions in the \`ON\` clause instead.",
    ],
    pitfalls: [
      "Accidentally creating a CROSS JOIN by omitting an ON condition.",
      "Converting LEFT JOIN to INNER JOIN by filtering right-table columns in WHERE.",
    ],
    tags: ["Joins", "Anti-Join", "Fundamentals"],
    evaluationCriteria: ["Accurate Venn diagram mental model", "Explains Anti-Join pattern", "Warns about WHERE filter on outer tables"],
    hint: "Think about which table's rows you want to protect from being dropped if there's no match.",
  },
  {
    id: "sql-15",
    role: "Data Analyst",
    category: "Advanced SQL & Modeling",
    difficulty: "Senior",
    question: "How do you calculate percentiles (e.g. median, p90, p95, p99) in SQL?",
    context: "Average is misleading for skewed metrics like latency, delivery times, or customer order value.",
    modelAnswer: `Standard averages are vulnerable to outliers. SQL provides \`PERCENTILE_CONT\` (continuous interpolation) and \`PERCENTILE_DISC\` (discrete actual value).

\`\`\`sql
SELECT 
  service_name,
  COUNT(*) AS total_requests,
  ROUND(AVG(latency_ms), 1) AS avg_latency,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms) AS median_p50,
  PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY latency_ms) AS p90_latency,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) AS p99_latency
FROM api_request_logs
WHERE request_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY service_name;
\`\`\``,
    seniorTips: [
      "Explain the difference between CONT (interpolates between two adjacent rows) and DISC (picks the nearest actual observed row).",
      "For petabyte-scale tables where exact percentiles require sorting all rows, mention approximate percentile functions like \`APPROX_PERCENTILE\` or \`APPROX_QUANTILES\` (HyperLogLog / t-digest) to reduce compute by 90%.",
    ],
    pitfalls: [
      "Confusing NTILE(100) with PERCENTILE_CONT (NTILE assigns bucket numbers to individual rows, whereas PERCENTILE_CONT computes the aggregate value).",
      "Using AVG for skewed server latency or e-commerce spend data.",
    ],
    tags: ["Percentiles", "Aggregations", "Statistics in SQL"],
    evaluationCriteria: ["Uses WITHIN GROUP (ORDER BY col)", "Distinguishes continuous vs discrete", "Mentions approx algorithms for big data"],
    hint: "Use PERCENTILE_CONT with the WITHIN GROUP syntax.",
  },
];
