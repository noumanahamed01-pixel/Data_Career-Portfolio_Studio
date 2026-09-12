import { InterviewQuestion } from "../../types";

export const BUSINESS_QUESTIONS: InterviewQuestion[] = [
  {
    id: "biz-01",
    role: "Data Analyst",
    category: "Business Case & Metrics",
    difficulty: "Senior",
    question: "Our Weekly Active Users (WAU) dropped by 12% last week. How would you systematically diagnose the root cause?",
    context: "The archetype analytical case study question used across Meta, Uber, Amazon, and Stripe.",
    modelAnswer: `Use a MECE (Mutually Exclusive, Collectively Exhaustive) 4-step diagnostic framework:

1. **Step 1: Data Sanity & Instrumentation Check**:
   - Check if the drop is real or a telemetry bug: Did tracking scripts fail? Were logging events dropped? Was there an ETL pipeline delay or timezone partition failure?
   - Verify DAU and MAU to see if this is an abrupt single-day outage or a continuous structural bleed.

2. **Step 2: Dimensional Breakdown (Where is it coming from?)**:
   - **Platform & Client**: iOS vs Android vs Web (did an iOS app update crash on launch?).
   - **Geography**: Global vs localized country/region (internet outage, regional holiday, local regulation).
   - **User Segment**: New users vs Power users vs Casual users vs Resurrected users.
   - **Acquisition Channel**: Organic vs Paid Search vs Paid Social (did paid ad campaigns pause?).

3. **Step 3: Internal Product vs External Factors**:
   - **Internal**: Recent code deployments, A/B test rollouts, UI changes, server latency spikes, payment gateway outages.
   - **External**: Public holidays (Thanksgiving, Christmas), seasonality, competitor marketing blitz, news scandals.

4. **Step 4: Funnel & Behavior Decomposition**:
   - Decompose WAU: Was the drop in top-of-funnel logins, or did users log in but fail to reach the core 'active' action (e.g. video watch, search, purchase)?
   - Formulate actionable conclusions and present immediate mitigations to product leadership.`,
    seniorTips: [
      "Always start with data sanity checks! In the real world, ~40% of sudden single-week metric drops are tracking or pipeline ingestion bugs.",
      "Break users down using the classic Accounting Equation: WAU(t) = WAU(t-1) + New + Resurrected - Churned.",
    ],
    pitfalls: [
      "Immediately jumping to wild product hypotheses ('Maybe users don't like the new logo') before checking basic sanity and dimensional cuts.",
      "Not separating new user acquisition drop from existing user retention drop.",
    ],
    tags: ["Root Cause Analysis", "Metric Drop", "Product Analytics"],
    evaluationCriteria: ["Data sanity verification first", "Structured MECE decomposition", "Internal vs external factor assessment"],
    hint: "Start with data integrity, segment across standard dimensions, check internal code releases, and isolate user cohorts.",
  },
  {
    id: "biz-02",
    role: "Data Analyst",
    category: "Business Case & Metrics",
    difficulty: "Mid",
    question: "How do you calculate Customer Lifetime Value (LTV) and Customer Acquisition Cost (CAC), and what is a healthy ratio?",
    context: "Core unit economics question essential for growth and finance analytics.",
    modelAnswer: `- **CAC (Customer Acquisition Cost)**: Total Sales & Marketing expenses over a given period divided by the number of new customers acquired in that period:
  \`CAC = Total S&M Spend / New Customers Acquired\`

- **LTV (Customer Lifetime Value)**:
  \`LTV = (Average Order Value × Purchase Frequency × Gross Margin %) / Churn Rate\`
  Or in SaaS:
  \`LTV = (ARPU × Gross Margin %) / Monthly Churn Rate\`

- **Benchmarks**:
  - **LTV:CAC Ratio of 3:1** is the golden SaaS and e-commerce standard.
  - **< 1:1**: Losing money on every user acquired (unsustainable).
  - **> 5:1**: Under-investing in marketing; missing opportunities for rapid scale.
  - **CAC Payback Period**: Months required to recoup acquisition cost (healthy SaaS is < 12 months).`,
    seniorTips: [
      "Distinguish between Blended CAC (total spend / all signups, including organic) and Paid CAC (paid ad spend / only paid signups). Blended CAC can dangerously mask rising paid acquisition costs.",
      "Always use Gross Margin in the numerator! Never use Gross Revenue, because fulfilling orders incurs cost-of-goods-sold.",
    ],
    pitfalls: [
      "Ignoring churn in the denominator.",
      "Using top-line revenue instead of gross margin.",
      "Treating CAC as uniform without segmenting by marketing channel.",
    ],
    tags: ["LTV", "CAC", "Unit Economics", "SaaS Metrics"],
    evaluationCriteria: ["Correct formula using gross margin", "Knows 3:1 benchmark", "Explains CAC payback period"],
    hint: "LTV requires margin and churn; CAC requires total sales/marketing spend divided by acquired customers.",
  },
  {
    id: "biz-03",
    role: "Data Analyst",
    category: "Business Case & Metrics",
    difficulty: "Senior",
    question: "How do you identify and measure feature cannibalization when launching a new product capability?",
    context: "Evaluates ability to look at holistic business impact rather than isolated feature vanity metrics.",
    modelAnswer: `Feature cannibalization occurs when engagement with a new feature comes at the expense of an existing, often higher-margin or more critical, feature rather than expanding net total activity.

**Measurement Framework**:
1. **Define Net Total Metric**: Track the aggregate KPI (e.g. Total Transactions or Total Time Spent), not just the new feature's adoption count.
2. **Pre-Post Analysis with Matched Pairs or A/B Testing**:
   - In an A/B test: Measure Feature A usage in Control vs (Feature A + Feature B) in Variant.
   - If Variant total engagement does not exceed Control, Feature B is 100% cannibalizing Feature A.
3. **Transition Probability Matrix (Markov Chain)**: Track user paths: Did users who previously clicked the main CTA switch to the new CTA, or are incremental users clicking it?
4. **Economic Valuation**: Even if feature B cannibalizes feature A, is Feature B higher margin, higher retention, or lower support cost? Cannibalization is acceptable if Net Contribution Margin increases.`,
    seniorTips: [
      "Cite the classic example: Launching a 'Save for Later' button might decrease immediate checkout conversion if users postpone purchase decisions.",
      "Always emphasize Net Incremental Lift over standalone adoption counters.",
    ],
    pitfalls: [
      "Declaring the new feature a huge success solely because 50,000 users clicked it, while overall revenue dropped.",
      "Failing to segment by user intent.",
    ],
    tags: ["Cannibalization", "A/B Testing", "Product Strategy"],
    evaluationCriteria: ["Focuses on net incremental value", "Designs control vs treatment comparison", "Considers economic margin trade-offs"],
    hint: "Did the pie get bigger, or did users just eat a different slice of the same pie?",
  },
  {
    id: "biz-04",
    role: "Data Analyst",
    category: "Business Case & Metrics",
    difficulty: "Lead/Staff",
    question: "What is a 'North Star Metric' (NSM), and how would you choose one for a two-sided marketplace like Uber or Airbnb?",
    context: "Evaluates executive-level strategic framing and holistic business understanding.",
    modelAnswer: `A North Star Metric is the single key metric that best captures the core value your product delivers to customers, aligns cross-functional company teams, and drives sustainable long-term revenue.

**For a Two-Sided Marketplace (Airbnb / Uber)**:
- **Poor Choices**:
  - *Registered Users*: Vanity metric; doesn't measure real value exchange.
  - *Gross Bookings ($)*: Financial lagging indicator; can be inflated by price hikes while user volume shrinks.
- **Ideal North Star Metric**:
  - **Airbnb**: \`Nights Booked with 4+ Star Review\` (captures both supply fulfillment, guest demand, and quality experience).
  - **Uber**: \`Completed Rides per Week\` (measures transaction density and liquidity for both drivers and riders).

**Supporting Input Metrics Tree**:
1. **Supply Liquidity**: Active hosts/drivers, response time, rejection rate.
2. **Demand Volume**: Searches with available inventory, booking conversion rate.
3. **Matching Efficiency**: Time to match, cancellation rate, price surge multiplier.`,
    seniorTips: [
      "Emphasize that a North Star Metric must have a 'Counter-Metric' or guardrail (e.g. Cancellation Rate or Safety Incident Rate) so teams don't game the primary metric.",
      "Explain the metric hierarchy: North Star → Input Metrics → Operational Output.",
    ],
    pitfalls: [
      "Picking a pure lagging financial metric like quarterly revenue.",
      "Picking a metric that favors one side of the marketplace while destroying the other (e.g. driver earnings vs passenger prices).",
    ],
    tags: ["North Star Metric", "Marketplace", "Product Strategy"],
    evaluationCriteria: ["Differentiates vanity vs value exchange", "Selects completed successful matches", "Establishes guardrail counter-metrics"],
    hint: "What single event represents mutual value delivered to both the buyer and the seller simultaneously?",
  },
  {
    id: "biz-05",
    role: "Data Analyst",
    category: "Business Case & Metrics",
    difficulty: "Senior",
    question: "What is an 'Activation Metric' or 'Aha! Moment' (e.g. Facebook's 7 friends in 10 days), and how do you find it with data?",
    context: "Fundamental to user onboarding, growth loops, and early lifecycle retention.",
    modelAnswer: `An activation metric is an early behavioral milestone that correlates strongly with long-term user retention.

**Methodology to Discover It**:
1. **Cohort Segmentation**: Group historical users into two cohorts: Retained at Day 90 vs Churned by Day 90.
2. **Feature Candidate Extraction**: In the first N days (e.g. Day 1–7), measure behavioral frequencies:
   - Added X friends, listened to Y songs, completed profile, sent 1st message, invited 1 teammate.
3. **Statistical Correlation & Precision/Recall Curve**:
   - For every threshold of behavior (e.g. 1 friend, 2 friends, 3 friends...):
   - Calculate **Precision** (% of users hitting threshold who retained) and **Recall** (% of all retained users who hit the threshold).
   - Find the sweet spot (F1-score / inflection point) where the behavior is both achievable by mainstream users and predictive of retention.
4. **Causality vs Correlation Validation**:
   - Run an A/B test encouraging users to hit that milestone (e.g. guided onboarding tour) to prove that driving this behavior *causes* higher retention.`,
    seniorTips: [
      "Stress that correlation ≠ causation! If power users add 7 friends naturally, forcing an unmotivated user to add 7 spam accounts won't magically retain them.",
      "The metric must be simple, memorable, and operational for product teams to optimize.",
    ],
    pitfalls: [
      "Confusing correlation with causation without recommending an experimental validation.",
      "Setting the threshold so high that only top 1% power users ever achieve it.",
    ],
    tags: ["Activation", "Aha Moment", "Growth Analytics"],
    evaluationCriteria: ["Explains retention correlation methodology", "Evaluates precision vs recall tradeoff", "Highlights causality verification"],
    hint: "Compare early actions of users who stayed vs users who left, and find the inflection point.",
  },
  {
    id: "biz-06",
    role: "Data Analyst",
    category: "Business Case & Metrics",
    difficulty: "Mid",
    question: "How do you distinguish between a retention curve that flattens vs one that decays to zero?",
    context: "The definitive analytical test for Product-Market Fit (PMF).",
    modelAnswer: `- **Decays to Zero**: The percentage of retained users continuously drops month after month (e.g. 50% → 25% → 10% → 3% → 0%). This indicates a 'leaky bucket' with no real Product-Market Fit. No amount of paid marketing will sustain growth.
- **Flattens (Asymptotic Plateau)**: The retention curve declines initially during onboarding but stabilizes at a constant level (e.g. stabilizes at 22% from Month 3 to Month 12). This plateau represents a loyal core cohort that finds persistent value.

\`\`\`
% Retained
100% | ╲
     |  ╲
 25% |   ─────── Plateau = Product-Market Fit!
  0% |          ╲──── Continuous decay = Leaky bucket
     +──────────────── Months Since Signup
\`\`\``,
    seniorTips: [
      "State Brian Balfour's law: You cannot build a billion-dollar company without a flat retention curve.",
      "Smile Curves: Mention that in exceptional viral products (Slack, Figma), cohort curves sometimes curve back upwards due to re-engagement and network expansion.",
    ],
    pitfalls: [
      "Confusing high initial Day 1 retention with long-term retention plateau.",
      "Calculating retention across mixed cohorts instead of tracking fixed acquisition dates.",
    ],
    tags: ["Retention Curves", "Product-Market Fit", "Cohort Analysis"],
    evaluationCriteria: ["Explains asymptotic plateau", "Connects plateau to Product-Market Fit", "Draws contrast with leaky bucket"],
    hint: "Does the curve level out horizontally, or does it keep sloping downward toward the x-axis?",
  },
  {
    id: "biz-07",
    role: "Data Analyst",
    category: "Business Case & Metrics",
    difficulty: "Mid",
    question: "What is Price Elasticity of Demand, and how would a data analyst model it to optimize revenue?",
    context: "Core monetization and pricing strategy challenge.",
    modelAnswer: `Price Elasticity of Demand (PED) measures the percentage change in quantity demanded in response to a percentage change in price:

\`PED = (% Change in Quantity Demanded) / (% Change in Price)\`

- **Elastic (|PED| > 1)**: Demand is highly sensitive to price. Raising prices reduces total revenue because volume drops drastically.
- **Inelastic (|PED| < 1)**: Demand is insensitive to price (e.g. enterprise software, insulin, essential utilities). Raising prices increases total revenue.
- **Unit Elastic (|PED| = 1)**: Revenue is maximized.

**Analytical Modeling Approaches**:
1. **Log-Log Linear Regression**: \`ln(Quantity) = β0 + β1 * ln(Price) + controls\`. The coefficient β1 directly represents the elasticity!
2. **Geo-Based A/B Testing**: Roll out different price tiers in statistically matched geographic regions to measure empirical demand response without cross-user contamination.`,
    seniorTips: [
      "Note the Log-Log trick: \`ln(Q) = β * ln(P)\` allows instant interpretation of β as price elasticity.",
      "Beware endogeneity: In observational data, prices are often higher when demand is high (e.g. Uber surge or holiday flights). You must control for seasonality or use experimental pricing.",
    ],
    pitfalls: [
      "Ignoring competitor substitute pricing.",
      "Failing to control for confounding demand surges (e.g. umbrellas priced higher in the rain).",
    ],
    tags: ["Price Elasticity", "Econometrics", "Revenue Optimization"],
    evaluationCriteria: ["Correct elasticity formula", "Interprets elastic vs inelastic", "Explains log-log regression estimation"],
    hint: "Formula is % change in quantity divided by % change in price. Log-log regression makes the slope coefficient equal to elasticity.",
  },
  {
    id: "biz-08",
    role: "Data Analyst",
    category: "Business Case & Metrics",
    difficulty: "Senior",
    question: "Explain the difference between First-Touch, Last-Touch, and Multi-Touch/Shapley Attribution in marketing analytics.",
    context: "Key question for digital advertising, customer journeys, and media-mix modeling.",
    modelAnswer: `- **First-Touch**: Attributes 100% of the conversion credit to the very first marketing channel the customer touched (e.g. first Google Search ad).
  - *Bias*: Heavily favors top-of-funnel brand awareness; ignores nurture campaigns.
- **Last-Touch**: Attributes 100% of credit to the final touchpoint immediately before checkout (e.g. Retargeting ad or coupon email).
  - *Bias*: Heavily overvalues bottom-of-funnel retargeting while undervaluing discovery channels.
- **Multi-Touch Linear / U-Shaped**: Splits credit across touchpoints (e.g. 40% first touch, 40% last touch, 20% middle touches).
- **Data-Driven / Shapley Value Attribution**: Game-theory approach evaluating the marginal lift a channel provides when present vs absent across all possible customer journey combinations.`,
    seniorTips: [
      "Emphasize the industry shift: With Apple iOS App Tracking Transparency (ATT) and third-party cookie deprecation, deterministic multi-touch tracking is fading. Top companies use **Media Mix Modeling (MMM)** (Bayesian regression like Meta Robyn or Google LightweightMMM) combined with randomized geo-lift experiments.",
    ],
    pitfalls: [
      "Relying solely on Last-Touch and making decisions to eliminate brand advertising.",
      "Assuming web cookie tracking is 100% accurate across devices.",
    ],
    tags: ["Marketing Attribution", "Shapley Value", "Media Mix Modeling"],
    evaluationCriteria: ["Contrasts single-touch vs multi-touch biases", "Explains game-theory Shapley concept", "Notes modern cookie privacy constraints"],
    hint: "Who gets the credit when a customer clicks an Instagram ad on Monday, reads a blog on Wednesday, and clicks an email on Friday?",
  },
  {
    id: "biz-09",
    role: "Data Analyst",
    category: "Business Case & Metrics",
    difficulty: "Mid",
    question: "How do you evaluate whether a decline in Average Order Value (AOV) is a positive or negative business signal?",
    context: "Demonstrates that metrics must never be evaluated in a vacuum without full system context.",
    modelAnswer: `A decline in Average Order Value (AOV = Total Revenue / Total Orders) cannot be judged in isolation; it depends on order frequency, customer volume, and gross margin:

**Scenario A: Negative Signal (Bad)**:
- Customers are purchasing fewer items per basket due to economic belt-tightening or worse product recommendations.
- Total orders remain flat or drop, leading to an overall revenue contraction.

**Scenario B: Positive Signal (Good!)**:
- The company launched a lower-friction subscription or reduced free shipping thresholds from $100 to $25.
- Customers now order 4 times per month instead of once per quarter. Even though AOV dropped from $80 to $40, annual spend per customer surged from $320 to $1,920!
- The company successfully acquired a massive new demographic of cost-conscious users with high retention potential.

**Diagnostic Metric Checklist**:
- Track \`Revenue = Unique Customers × Order Frequency × AOV\`.
- Check if overall Customer Lifetime Value (LTV) and Gross Margin are growing.`,
    seniorTips: [
      "Always break top-line revenue into its multiplicative components: Users × Transactions/User × Basket Size.",
      "Never declare an isolated metric move good or bad without looking at the parent revenue equation.",
    ],
    pitfalls: [
      "Recommending forced minimum basket requirements that destroy order velocity.",
      "Assuming high AOV is always better (luxury jewelry has high AOV but tiny transaction frequency).",
    ],
    tags: ["AOV", "E-Commerce", "Metric Decomposition"],
    evaluationCriteria: ["Deconstructs revenue equation", "Provides positive and negative scenarios", "Evaluates frequency vs basket size"],
    hint: "Revenue is Customers × Frequency × AOV. If frequency triples, does it matter if AOV dropped by 20%?",
  },
  {
    id: "biz-10",
    role: "Data Analyst",
    category: "Business Case & Metrics",
    difficulty: "Senior",
    question: "How do you determine whether a marketplace is supply-constrained or demand-constrained, and how does your analytics focus change?",
    context: "Crucial strategic diagnostic for ride-sharing, food delivery, freelancing, and lodging platforms.",
    modelAnswer: `- **Supply-Constrained**: There are more buyers than sellers. High buyer search volume, high surge pricing, long wait times, high unfulfilled search rates, high driver/host utilization.
  - *Strategy*: Focus analytics on supply acquisition, onboarding funnel velocity, host retention, and reducing driver downtime.
- **Demand-Constrained**: Abundant inventory/sellers sitting idle with insufficient buyer orders. High driver idle time, low room occupancy rates, discounting required to spur orders.
  - *Strategy*: Focus analytics on buyer acquisition campaigns, promotional incentives, repeat booking loops, and pricing elasticity.

**Key Diagnostic Metrics**:
- **Search-to-Fulfill Ratio**: Percentage of customer search sessions that result in an accepted transaction.
- **Utilization Rate**: % of available provider hours actively engaged in billable work.
- **Surge Multiplier Frequency**: How often pricing algorithms trigger peak surge due to inventory deficits.`,
    seniorTips: [
      "Marketplaces are rarely globally constrained; they are hyper-locally constrained by city, neighborhood, and time-of-day (e.g. supply constrained in Manhattan on Friday night, but demand constrained on Tuesday morning).",
    ],
    pitfalls: [
      "Treating the entire marketplace as a single aggregate number instead of geographic micro-markets.",
      "Pouring marketing budget into buyer incentives when there is zero supply to serve them.",
    ],
    tags: ["Marketplaces", "Supply vs Demand", "Platform Dynamics"],
    evaluationCriteria: ["Identifies liquidity indicators", "Contrasts supply vs demand metrics", "Notes hyper-local geographical dynamics"],
    hint: "Look at provider idle time versus customer unfulfilled search rates.",
  },
  {
    id: "biz-11",
    role: "Data Analyst",
    category: "Business Case & Metrics",
    difficulty: "Junior",
    question: "What is Net Promoter Score (NPS), how is it calculated, and what are its major analytical flaws?",
    context: "Tests familiarity with customer sentiment metrics and statistical rigor.",
    modelAnswer: `NPS is measured by asking customers: *"On a scale of 0 to 10, how likely are you to recommend us to a friend or colleague?"*

- **Promoters (Score 9–10)**: Loyal enthusiasts.
- **Passives (Score 7–8)**: Satisfied but unenthusiastic; vulnerable to competitors.
- **Detractors (Score 0–6)**: Unhappy customers who can damage brand via word of mouth.

\`NPS = % Promoters - % Detractors\` (Range: -100 to +100)

**Analytical Flaws**:
1. **Destruction of Granularity**: Grouping 0 and 6 into the same bucket destroys valuable information (a 6 is vastly different from a 0).
2. **Cultural Response Bias**: Certain countries (e.g. Japan) rarely give 9s or 10s due to cultural modesty, creating false low scores compared to the US.
3. **Weak Correlation to Retention**: Stated intent does not equal actual behavior. Users who rate 10 may still churn if price increases; users who rate 6 may stay for years due to high switching costs.`,
    seniorTips: [
      "Recommend pairing NPS with behavioral metrics: Always measure actual referral rates and churn probability instead of relying solely on survey answers.",
      "Look at customer service CSAT or Customer Effort Score (CES) as better operational proxies.",
    ],
    pitfalls: [
      "Accepting NPS as the supreme metric without questioning sample response bias.",
      "Treating a 1-point swing in NPS as statistically significant with a small sample size.",
    ],
    tags: ["NPS", "Customer Sentiment", "Survey Analytics"],
    evaluationCriteria: ["Correct formula & categorization", "Identifies loss of statistical variance", "Notes cultural and response biases"],
    hint: "Subtract Detractors (0-6) from Promoters (9-10). Note how wide the Detractor bucket is.",
  },
  {
    id: "biz-12",
    role: "Data Analyst",
    category: "Business Case & Metrics",
    difficulty: "Senior",
    question: "How do you calculate and interpret Customer Churn: Logo Churn vs Net Revenue Churn?",
    context: "Crucial difference between counting customer heads vs counting dollars.",
    modelAnswer: `- **Logo Churn (Customer Count)**:
  \`Logo Churn = (Customers Lost in Period) / (Customers at Start of Period)\`
- **Gross Revenue Churn**:
  \`Gross Rev Churn = (MRR Lost from Cancellations + Downgrades) / (MRR at Start of Period)\`
- **Net Revenue Retention (NRR) / Net Revenue Churn**:
  \`NRR = (Starting MRR - Churn - Contraction + Expansion/Upsells) / (Starting MRR)\`

**Why Net Revenue Churn Can Be Negative (The Holy Grail)**:
If existing customers expand their subscriptions (upgrading tiers, adding seats) by more than the revenue lost from churned accounts, you achieve **Net Negative Revenue Churn** (NRR > 100%, e.g. Snowflake's famous 158% NRR). The company grows even if zero new customers are acquired!`,
    seniorTips: [
      "Explain that losing 1 enterprise customer paying $500k/yr is disastrous compared to losing 10 SMB customers paying $1k/yr, yet Logo Churn would treat the 10 SMB losses as 10x worse.",
      "Always report Logo Churn alongside NRR to give a balanced picture of customer happiness vs financial expansion.",
    ],
    pitfalls: [
      "Including new customer acquisitions inside the retention/churn numerator.",
      "Assuming high Logo Churn always means high revenue loss.",
    ],
    tags: ["Churn", "NRR", "SaaS Economics"],
    evaluationCriteria: ["Contrasts logo vs revenue churn", "Explains Net Negative Churn concept", "Calculates NRR correctly"],
    hint: "Logo churn counts account IDs; Revenue churn counts recurring dollars.",
  },
  {
    id: "biz-13",
    role: "Data Analyst",
    category: "Business Case & Metrics",
    difficulty: "Mid",
    question: "How do you design an executive dashboard that stakeholders will actually adopt and use?",
    context: "Evaluates business empathy, information hierarchy, and BI craftsmanship.",
    modelAnswer: `A successful executive dashboard follows the **'5-Second / 30-Second / 5-Minute' Rule**:

1. **5 Seconds (Executive Cockpit)**: Top-line North Star KPI cards with clear trend indicators (e.g. ARR: $12.4M, +8% MoM vs target). Immediate green/red status.
2. **30 Seconds (Diagnostic Trends)**: Time-series charts comparing current performance against trailing 12-month baseline and budget targets. Segmented by key business dimensions (Region, Segment).
3. **5 Minutes (Operational Drilldown)**: Filterable tables and cohort views allowing department heads to investigate specific anomalies.

**Design Principles**:
- **Action-Oriented**: Every chart must answer a specific business decision (e.g. 'Where should marketing spend next week?' not just 'Here is a pie chart of visitors').
- **Single Source of Truth**: Grounded in validated dbt Gold layer models, avoiding rogue calculations.
- **Fast Load Time**: Sub-2 second rendering via pre-aggregated materialized tables.`,
    seniorTips: [
      "Rule of thumb: Never put more than 6-8 visualizations on a single executive view. Cognitive overload kills adoption.",
      "Include clear data definitions and timestamp of last data refresh so stakeholders never doubt freshness.",
    ],
    pitfalls: [
      "Building a kitchen-sink dashboard with 25 random charts and 15 dropdown filters.",
      "Using vanity pie charts with 12 indistinguishable color slices.",
    ],
    tags: ["Dashboard Design", "BI Strategy", "Stakeholder Management"],
    evaluationCriteria: ["Articulates 3-tier hierarchy", "Emphasizes actionability over vanity charts", "Focuses on speed and data trust"],
    hint: "Start with the high-level number, show the trend over time, then provide drilldown capability.",
  },
  {
    id: "biz-14",
    role: "Data Analyst",
    category: "Business Case & Metrics",
    difficulty: "Lead/Staff",
    question: "We noticed that overall conversion rate increased, but conversion rate dropped in every single geographic market. How is this possible?",
    context: "The legendary Simpson's Paradox test applied to real-world conversion funnel analytics.",
    modelAnswer: `This is a textbook manifestation of **Simpson's Paradox**: an aggregate statistical trend reverses when the data is split into underlying sub-groups, caused by a shift in the relative weighting/composition of the population.

**How it happens in real business**:
Suppose we have two markets: US (high converting, e.g. 10%) and India (low converting, e.g. 2%).

- **Period 1**:
  - US: 1,000 visitors, 100 orders = 10%
  - India: 9,000 visitors, 180 orders = 2%
  - Overall: 280 orders / 10,000 visitors = **2.8%**

- **Period 2 (Marketing redirects budget heavily to US)**:
  - US: 8,000 visitors, 720 orders = **9%** (Dropped from 10%!)
  - India: 2,000 visitors, 30 orders = **1.5%** (Dropped from 2%!)
  - Overall: 750 orders / 10,000 visitors = **7.5%** (Surged from 2.8% to 7.5%!)

Even though conversion rate dropped in both individual countries, shifting the traffic mix heavily toward the inherently higher-converting US market caused the aggregate blended conversion rate to nearly triple!`,
    seniorTips: [
      "Whenever overall metrics and segmented metrics contradict each other, immediately check for a **mix shift** in traffic or demographic composition.",
      "Remind interviewers that you must never make resource allocation decisions based solely on aggregated unsegmented averages.",
    ],
    pitfalls: [
      "Claiming the data must be corrupted or calculated incorrectly.",
      "Failing to explain the underlying weighting/composition shift.",
    ],
    tags: ["Simpsons Paradox", "Mix Shift", "Statistical Reasoning"],
    evaluationCriteria: ["Identifies Simpson's Paradox", "Walks through concrete numerical example", "Explains population mix shift mechanism"],
    hint: "Think about what happens if high-converting users become a much larger percentage of total traffic.",
  },
  {
    id: "biz-15",
    role: "Data Analyst",
    category: "Business Case & Metrics",
    difficulty: "Senior",
    question: "How would you model and detect 'Silent Churn' in a non-contractual business like e-commerce or grocery delivery?",
    context: "Tests analytical handling of businesses without a formal 'Cancel Subscription' button.",
    modelAnswer: `In contractual SaaS, churn is explicit (the user clicks 'Cancel'). In non-contractual commerce (Amazon, DoorDash), churn is implicit and silent—users simply stop ordering.

**Analytical Solutions**:
1. **Recency-Frequency-Monetary (RFM) Dynamic Inactivity Windows**:
   - Calculate each user's historical Inter-Purchase Time (IPT). If a user typically orders every 7 days, 21 days of inactivity is a strong churn signal.
   - For an annual shopper, 21 days is normal. Churn definition must be parameterized by individual or segment buying cadence: \`Last Purchase > (Avg IPT + 2 × StdDev(IPT))\`.
2. **Buy 'Til You Die (BTYD) Probabilistic Models**:
   - Use classical probabilistic customer base models like **BG/NBD (Beta-Geometric / Negative Binomial)** and **Pareto/NBD**.
   - These models calculate \`P(Alive)\`—the probability that a customer is still active—based solely on their recency and frequency history.
3. **Leading Telemetry Signals**:
   - App opens without purchase, unlinking payment methods, declining search sessions, push notification opt-outs.`,
    seniorTips: [
      "Mention the Python library \`lifetimes\`: it implements BG/NBD and Gamma-Gamma spend models out of the box.",
      "Explain the intervention strategy: You must trigger re-engagement campaigns when P(Alive) drops below 0.6, not after it hits 0.",
    ],
    pitfalls: [
      "Arbitrarily declaring 'anyone who hasn't bought in 90 days is churned' without analyzing inter-purchase time variance.",
      "Confusing seasonal buyers (holiday shoppers) with churned users.",
    ],
    tags: ["Silent Churn", "RFM", "BTYD Models", "E-Commerce"],
    evaluationCriteria: ["Identifies non-contractual challenge", "Calculates individual inter-purchase cadence", "Mentions BG/NBD or survival modeling"],
    hint: "How do you know if a customer quit grocery delivery, or if they just bought groceries two days ago?",
  },
];
