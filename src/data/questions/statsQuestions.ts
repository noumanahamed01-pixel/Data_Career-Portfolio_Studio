import { InterviewQuestion } from "../../types";

export const STATS_QUESTIONS: InterviewQuestion[] = [
  {
    id: "stat-01",
    role: "Data Analyst",
    category: "A/B Testing & Statistics",
    difficulty: "Mid",
    question: "What is a p-value, and what is the most common misconception business stakeholders have about it?",
    context: "The universal statistical literacy question asked across all tech and analytics roles.",
    modelAnswer: `- **Accurate Definition**: A p-value is the probability of observing a test statistic as extreme as (or more extreme than) the observed result, **assuming the null hypothesis (H0) is strictly true**.
- **Most Common Stakeholder Misconception**: Believing that *'a p-value of 0.03 means there is a 97% probability that the new feature is better'* or *'a 3% probability that the null hypothesis is true'*.
- **Why this is wrong**: In classical Frequentist statistics, hypotheses are fixed truths, not random variables. The p-value evaluates \`P(Data | H0)\`, NOT \`P(H0 | Data)\`.

To state the probability that a feature is superior, one must use a **Bayesian** framework with prior probability distributions.`,
    seniorTips: [
      "Use the courtroom analogy: A p-value is the likelihood of seeing all this incriminating evidence assuming the defendant is truly innocent.",
      "Remind interviewers that statistical significance does NOT equal practical/business significance. A 0.01% lift in button click can have p < 0.001 with 10M users, but generate zero real revenue.",
    ],
    pitfalls: [
      "Saying 'p-value is the probability that the result occurred by chance'.",
      "Confusing statistical significance with business impact.",
    ],
    tags: ["p-value", "Hypothesis Testing", "Frequentist Statistics"],
    evaluationCriteria: ["States exact conditional probability definition", "Highlights P(Data|H0) vs P(H0|Data)", "Explains practical vs statistical significance"],
    hint: "Given that the null hypothesis is true, what is the chance of seeing data this extreme?",
  },
  {
    id: "stat-02",
    role: "Data Analyst",
    category: "A/B Testing & Statistics",
    difficulty: "Senior",
    question: "What is Sample Ratio Mismatch (SRM) in an A/B test, why is it fatal, and how do you test for it?",
    context: "The number one data quality check every senior experimentation analyst performs before analyzing any test.",
    modelAnswer: `Sample Ratio Mismatch (SRM) occurs when the observed ratio of visitors assigned to Control vs Variant deviates significantly from the planned experimental design (e.g. designed 50/50, but observed 52/48 across 500,000 visitors).

**Why it is Fatal**:
SRM invalidates the entire experiment. It proves the assignment was non-random. For example:
- The Variant crashed on older Android phones, so those users were dropped from the logging funnel.
- A redirect variant caused slower loading, dropping impatient mobile users before tracking fired.
Analyzing the metric lift on an SRM experiment results in severely biased, misleading conclusions.

**How to Test (Chi-Square Goodness-of-Fit)**:
\`\`\`sql
-- Testing 50/50 split on 10,000 users: Control = 4,850, Variant = 5,150
-- Chi2 = SUM((O - E)^2 / E) = (4850-5000)^2/5000 + (5150-5000)^2/5000 = 4.5 + 4.5 = 9.0
-- With 1 degree of freedom, Chi2 = 9.0 yields p-value = 0.0027 (< 0.001 critical threshold!)
\`\`\`
If Chi-Square p-value < 0.001, halt the test immediately; investigate the assignment and logging infrastructure.`,
    seniorTips: [
      "Mention that major tech companies (Microsoft, Netflix, Booking.com) automatically run automated SRM checks and will refuse to compute metric lifts if SRM triggers.",
      "Explain the common root causes: bot filtering unevenness, redirect latency, or user ID re-assignment mid-session.",
    ],
    pitfalls: [
      "Attempting to 're-weight' the groups mathematically to fix an SRM (you cannot fix a corrupted sample post-hoc).",
      "Ignoring an SRM because the sample size difference looks 'small' in percentage terms.",
    ],
    tags: ["SRM", "Chi-Square", "Experimentation Quality"],
    evaluationCriteria: ["Explains non-random assignment bias", "Uses Chi-Square goodness-of-fit test", "Refuses to report results from an SRM test"],
    hint: "If you flip a fair coin 100,000 times and get 52,000 heads, is the coin fair?",
  },
  {
    id: "stat-03",
    role: "Data Analyst",
    category: "A/B Testing & Statistics",
    difficulty: "Mid",
    question: "Explain Type I error, Type II error, Statistical Power, and how they relate to Sample Size.",
    context: "Fundamental trade-offs in experimental design and hypothesis testing.",
    modelAnswer: `- **Type I Error (α, False Positive)**: Rejecting the null hypothesis when it is actually true (concluding the new feature is a winner when it has zero effect). Typically set to α = 0.05.
- **Type II Error (β, False Negative)**: Failing to reject the null hypothesis when a real difference exists (missing a genuine winning feature).
- **Statistical Power (1 - β)**: The probability of correctly detecting a real effect if it exists. Standard industry benchmark is 80% (Power = 0.80, β = 0.20).

**Relationship to Sample Size**:
To achieve higher power (reduce β) or detect smaller Minimum Detectable Effects (MDE), the required sample size increases quadratically:
\`Sample Size (N) ∝ (Z_α/2 + Z_β)^2 × 2σ^2 / (MDE)^2\`
Detecting a 1% lift requires **4x** the sample size of detecting a 2% lift!`,
    seniorTips: [
      "Explain the business cost trade-off: A high Type I error risks shipping useless features that clutter UI; a high Type II error causes you to kill promising innovations.",
      "Remind stakeholders that stopping an experiment early just because p < 0.05 ('peeking problem') inflates Type I error from 5% up to 30%+.",
    ],
    pitfalls: [
      "Confusing Type I (false positive) with Type II (false negative).",
      "Believing that doubling the sample size cuts the detectable effect in half (it only cuts it by √2).",
    ],
    tags: ["Statistical Power", "Sample Size", "Type I and II Errors"],
    evaluationCriteria: ["Defines alpha, beta, and power accurately", "States quadratic sample size scaling", "Warns against early peeking"],
    hint: "Type I is convicting an innocent person; Type II is letting a guilty person walk free.",
  },
  {
    id: "stat-04",
    role: "Data Analyst",
    category: "A/B Testing & Statistics",
    difficulty: "Senior",
    question: "What is CUPED (Controlled-experiment Using Pre-Experiment Data), and how does it speed up A/B testing?",
    context: "State-of-the-art variance reduction technique developed by Microsoft and used at Netflix, Uber, and Meta.",
    modelAnswer: `CUPED is an analytical variance reduction technique that leverages metric data collected on users *before* the experiment starts to remove background noise from the experimental metric.

**How it works**:
Suppose we are measuring revenue ($Y$). Many users naturally spend more than others due to historical habits ($X$).
We adjust the post-experiment metric $Y$ using their pre-experiment baseline $X$:
\`Y_adjusted = Y - θ * (X - E[X])\`
Where \`θ = Cov(X, Y) / Var(X)\` (the OLS regression coefficient).

**Result**:
- The variance of $Y_adjusted$ is reduced by a factor of \`(1 - ρ^2)\`, where $ρ$ is the correlation between pre- and post-experiment behavior.
- If $ρ = 0.7$, variance drops by nearly **50%**!
- Because required sample size is directly proportional to variance, **CUPED allows companies to reach statistical significance in half the time** or with half the traffic!`,
    seniorTips: [
      "Mention that CUPED is unbiased (it does not distort the true treatment effect).",
      "For brand-new users who have no pre-experiment history ($X$), standard practice is setting $X - E[X] = 0$, applying CUPED cleanly across mixed populations.",
    ],
    pitfalls: [
      "Using pre-experiment data that was collected during an earlier overlapping test (introducing bias).",
      "Believing CUPED is a machine learning model rather than simple linear covariance adjustment.",
    ],
    tags: ["CUPED", "Variance Reduction", "Advanced Experimentation"],
    evaluationCriteria: ["Explains pre-experiment baseline adjustment", "Shows formula or regression logic", "States sample size / runtime reduction impact"],
    hint: "Subtract the part of user performance that was already predictable before the test began.",
  },
  {
    id: "stat-05",
    role: "Data Analyst",
    category: "A/B Testing & Statistics",
    difficulty: "Mid",
    question: "What is the 'Peeking Problem' (optional stopping) in A/B testing, and how do you prevent it?",
    context: "One of the most frequent operational errors made by non-statistical product managers.",
    modelAnswer: `The Peeking Problem occurs when an experimenter checks the dashboard daily and stops the experiment the moment the p-value dips below 0.05.

**Why it Destroys Rigor**:
In classical hypothesis testing, α = 0.05 assumes a **single evaluation at the pre-determined fixed horizon**.
Checking the data repeatedly across 20 days is equivalent to conducting 20 multiple hypothesis tests on correlated data. Random statistical noise will almost certainly cross the p < 0.05 threshold at least once, inflating the true False Positive Rate from 5% to **over 30%**!

**Solutions**:
1. **Fixed Horizon Rigor**: Calculate sample size beforehand and refuse to conclude the test until full sample size is reached.
2. **Sequential Testing (Wald's SPRT or Always Valid p-values)**: Use mathematical frameworks (e.g. Robbins' mixture sequential test used by Optimizely) that adjust significance boundaries for continuous monitoring.`,
    seniorTips: [
      "Cite the famous simulation: If you run an A/B test comparing identical variants (A/A test) for 30 days and check every day, you have a ~35% chance of finding a 'statistically significant' difference!",
      "Explain the psychological driver: Stakeholders are eager to ship winning features quickly, making guardrails essential.",
    ],
    pitfalls: [
      "Stopping a test at Day 3 because 'p = 0.02' without sequential testing corrections.",
      "Believing that larger sample size automatically cures the peeking problem.",
    ],
    tags: ["Peeking Problem", "Sequential Testing", "Experimentation Pitfalls"],
    evaluationCriteria: ["Explains false positive inflation", "Contrasts fixed horizon vs continuous monitoring", "Mentions sequential testing / SPRT"],
    hint: "If you roll a 20-sided die every day until a 1 comes up, you are guaranteed to get a 1 eventually.",
  },
  {
    id: "stat-06",
    role: "Data Analyst",
    category: "A/B Testing & Statistics",
    difficulty: "Senior",
    question: "How do you handle the Multiple Testing Problem when evaluating 10 different variants or 20 secondary metrics?",
    context: "Critical for feature releases that monitor multiple conversion goals simultaneously.",
    modelAnswer: `When testing $k$ independent hypotheses at α = 0.05, the family-wise error rate (FWER)—the probability of getting at least one false positive—is:
\`FWER = 1 - (1 - α)^k\`
For 10 metrics: \`1 - (0.95)^10 ≈ 40%\`! You have a 40% chance of declaring a fake winner.

**Correction Frameworks**:
1. **Bonferroni Correction (Conservative)**:
   - Divides significance threshold by number of tests: \`α_adjusted = α / k\`.
   - For 10 tests, require \`p < 0.005\` instead of 0.05. Guarantees FWER ≤ 0.05, but increases Type II errors (reduces statistical power).
2. **Benjamini-Hochberg Procedure (False Discovery Rate - FDR)**:
   - Ranks all p-values and controls the expected proportion of false discoveries among rejected hypotheses.
   - Far more practical for modern product experimentation with dozens of guardrail metrics.
3. **Primary Metric Specification**:
   - Designate exactly **ONE** primary decision metric before launch. Secondary metrics serve strictly as directional guardrails.`,
    seniorTips: [
      "Always advise product teams: Pick one Primary Decision Metric. If you need multiple metrics, use Benjamini-Hochberg (FDR) rather than hyper-conservative Bonferroni.",
    ],
    pitfalls: [
      "Testing 20 metrics, finding one with p = 0.04, and writing a company memo claiming the feature won.",
      "Applying Bonferroni blindly to hundreds of exploratory data mining queries.",
    ],
    tags: ["Multiple Testing", "Bonferroni", "FDR", "Benjamini-Hochberg"],
    evaluationCriteria: ["Calculates family-wise error inflation", "Explains Bonferroni adjustment", "Introduces Benjamini-Hochberg (FDR)"],
    hint: "If you test enough metrics, random chance guarantees at least one will show p < 0.05.",
  },
  {
    id: "stat-07",
    role: "Data Analyst",
    category: "A/B Testing & Statistics",
    difficulty: "Mid",
    question: "What is the difference between the Novelty Effect and the Primacy Effect in product experimentation?",
    context: "Explains why initial experiment results often reverse or decay after 2-4 weeks.",
    modelAnswer: `- **Novelty Effect**: Existing users are curious about any new visual or interactive element. They click, explore, and engage heavily simply because it is new.
  - *Trajectory*: High initial engagement spike that gradually fades back to baseline over 2–3 weeks.
- **Primacy Effect (Change Aversion)**: Existing users are accustomed to muscle memory and established workflows. When a layout changes, they get frustrated and complain, causing an initial drop in conversion.
  - *Trajectory*: Initial metric dip that steadily recovers as users learn the new interface.

**Analytical Solutions**:
- **Segment New vs Existing Users**: New users never experienced the old interface, so their data is 100% immune to both Novelty and Primacy effects!
- **Run tests for at least 2 full business cycles (14–28 days)** to allow novelty to burn off.`,
    seniorTips: [
      "The ultimate litmus test: Compare new users (signed up during the experiment) against existing users. If the lift is only present in existing users and decay over time, it is 100% a novelty artifact.",
    ],
    pitfalls: [
      "Shipping a feature on Day 4 because engagement spiked 25% (classic novelty trap).",
      "Killing a redesigned checkout on Day 2 because existing users complained (primacy trap).",
    ],
    tags: ["Novelty Effect", "Primacy Effect", "Experimentation Duration"],
    evaluationCriteria: ["Defines both psychological phenomena", "Identifies new-user segmentation technique", "Advocates full business-cycle duration"],
    hint: "Novelty is initial curiosity; Primacy is resistance to changing old habits.",
  },
  {
    id: "stat-08",
    role: "Data Analyst",
    category: "A/B Testing & Statistics",
    difficulty: "Senior",
    question: "Why does the Central Limit Theorem (CLT) allow us to use z-tests/t-tests even when the underlying data is heavily skewed (like revenue)?",
    context: "Tests foundational probability theory and parametric testing assumptions.",
    modelAnswer: `The Central Limit Theorem (CLT) states that if you draw independent, identically distributed (i.i.d.) random samples of size $N$ from *any* population with a finite mean $\mu$ and variance $\sigma^2$, **the distribution of the sample mean ($\bar{X}$) approaches a normal distribution as $N$ increases**, regardless of the shape of the original underlying population.

**Why this matters for Business Analytics**:
- E-commerce revenue and order amounts are heavily right-skewed (most people spend $0–$50, a few spend $5,000+).
- The underlying revenue per user is definitely NOT normally distributed.
- However, in an A/B test with 50,000 users per variant, we are not testing individual rows; we are testing the **difference in sample means** ($\bar{X}_{variant} - \bar{X}_{control}$).
- By the CLT, the distribution of the sample mean is exceptionally close to a Gaussian bell curve, making standard t-tests and z-tests mathematically valid!`,
    seniorTips: [
      "Caveat: For extreme power-law distributions (extreme heavy tails like whale spenders in gaming), CLT convergence requires much larger samples (hundreds of thousands of users) or log/box-cox transformations or bootstrap methods.",
      "Clarify that CLT applies to the *mean*, not individual observations.",
    ],
    pitfalls: [
      "Claiming you cannot run a t-test on revenue because 'revenue is not normal' (ignoring CLT).",
      "Confusing the distribution of the data with the distribution of the sample mean.",
    ],
    tags: ["Central Limit Theorem", "CLT", "Sampling Distributions"],
    evaluationCriteria: ["States CLT theorem on sample means accurately", "Explains applicability to skewed business metrics", "Notes heavy-tail sample size caveats"],
    hint: "CLT applies to the average of the sample, not the individual raw numbers.",
  },
  {
    id: "stat-09",
    role: "Data Analyst",
    category: "A/B Testing & Statistics",
    difficulty: "Mid",
    question: "When should you choose a Non-Parametric test (like Mann-Whitney U) over a standard Student's t-test?",
    context: "Tests understanding of parametric assumptions, ordinal data, and extreme outliers.",
    modelAnswer: `- **Student's t-test (Parametric)**: Tests whether the *means* of two groups are equal. Assumes the sampling distribution of the mean is normal (via CLT) and evaluates actual numeric values.
- **Mann-Whitney U / Wilcoxon Rank-Sum (Non-Parametric)**: Converts raw continuous values into relative ordinal ranks (1st, 2nd, 3rd...) and tests whether one group tends to have systematically higher ranks than the other.

**When to use Mann-Whitney U**:
1. **Ordinal / Ranked Data**: Star ratings (1 to 5 stars), survey Likert scales, or search result rankings where distances between numbers are not linearly quantitative.
2. **Small Sample Sizes with Heavy Skew**: When sample size $N < 30$ and the distribution is severely skewed, so CLT has not kicked in.
3. **Resilience to Extreme Outliers**: A single billionaire spending $1,000,000 will destroy a t-test mean, but in Mann-Whitney U that transaction simply receives rank $N$, having minimal distortive impact.`,
    seniorTips: [
      "Business Warning: Mann-Whitney tests differences in medians/ranks, NOT means. If your executive goal is maximizing total company revenue ($), a feature could win Mann-Whitney U but actually generate *less* total dollars due to losing high-value buyers!",
    ],
    pitfalls: [
      "Using Mann-Whitney for revenue optimization without realizing it ignores magnitude.",
      "Assuming non-parametric tests have zero assumptions (they still assume independent observations).",
    ],
    tags: ["Non-Parametric", "Mann-Whitney", "t-test", "Hypothesis Testing"],
    evaluationCriteria: ["Explains rank conversion mechanism", "Identifies ordinal and outlier use cases", "Warns about revenue magnitude limitation"],
    hint: "Non-parametric tests replace actual numbers with their relative ranks.",
  },
  {
    id: "stat-10",
    role: "Data Analyst",
    category: "A/B Testing & Statistics",
    difficulty: "Lead/Staff",
    question: "How do you run experiments in products with severe Network Effects (e.g. Uber, DoorDash, Slack, Tinder)?",
    context: "Evaluates handling of interference / SUTVA violations in real-world platforms.",
    modelAnswer: `Standard A/B testing relies on the **Stable Unit Treatment Value Assumption (SUTVA)**: the treatment assigned to one user must not affect the outcome of another user.

In network products, SUTVA is severely violated due to **Interference**:
- In Uber: If Treatment riders get discounted rides, they consume available drivers. Control riders nearby experience longer wait times and higher surge prices—making Control artificially worse!
- In Slack: If one colleague has a new messaging feature and their teammate doesn't, they cannot collaborate.

**Advanced Experimentation Designs**:
1. **Cluster-Based Randomization**: Group users into social or company clusters (e.g. randomize entire Slack enterprise workspaces or universities rather than individuals).
2. **Geographic Switchback Experiments**: Randomize geographic markets (e.g. Miami is Treatment this week, Atlanta is Control) or switch between Treatment and Control across alternating time blocks (e.g. 2-hour alternating windows) within the same city.
3. **Synthetic Controls**: Pair treated cities with weighted combinations of untreated cities to estimate the counterfactual.`,
    seniorTips: [
      "Mention SUTVA explicitly—using the exact acronym signals high experimentation maturity.",
      "For switchback experiments, mention that you must include a 'washout window' (e.g. 15-minute buffer) between time blocks to let supply/demand equilibrium reset.",
    ],
    pitfalls: [
      "Running standard user-level randomization in a ride-sharing or delivery marketplace.",
      "Failing to account for carryover effects across time blocks in switchback tests.",
    ],
    tags: ["Network Effects", "SUTVA", "Switchback Experiments", "Marketplace Testing"],
    evaluationCriteria: ["Identifies SUTVA violation and spillover", "Proposes cluster or switchback designs", "Explains washout windows"],
    hint: "If you give half the drivers a bonus, how does that affect the drivers who didn't get the bonus?",
  },
  {
    id: "stat-11",
    role: "Data Analyst",
    category: "A/B Testing & Statistics",
    difficulty: "Mid",
    question: "What is the difference between a Frequentist 95% Confidence Interval and a Bayesian 95% Credible Interval?",
    context: "Tests philosophical and mathematical clarity between the two dominant statistical schools.",
    modelAnswer: `- **Frequentist 95% Confidence Interval**:
  If we were to repeat the identical experiment 100 times under the exact same conditions, **95 of the 100 calculated intervals would contain the true, fixed population parameter**.
  *Crucial*: You CANNOT say *'there is a 95% probability the true value lies in this specific interval'*. The parameter is fixed; the interval is what randomly varies across repeated samples.
- **Bayesian 95% Credible Interval**:
  Given our prior beliefs and the observed data, **there is a 95% probability that the true parameter lies within this specific interval**.
  *Crucial*: The parameter is treated as a random variable with a posterior probability distribution.`,
    seniorTips: [
      "Most business executives interpret Confidence Intervals as Credible Intervals. Knowing the formal Frequentist distinction shows statistical rigor, while understanding Bayesian phrasing shows executive communication empathy.",
    ],
    pitfalls: [
      "Stating that a Frequentist confidence interval means '95% chance the parameter is in this bracket'.",
      "Treating Frequentist parameters as random variables.",
    ],
    tags: ["Confidence Intervals", "Bayesian", "Frequentist", "Statistics Theory"],
    evaluationCriteria: ["Accurate definition of repeated sampling", "Contrasts fixed parameter vs distribution", "Explains executive interpretation gap"],
    hint: "In Frequentist, the parameter is fixed and the interval moves; in Bayesian, the parameter has a probability distribution.",
  },
  {
    id: "stat-12",
    role: "Data Analyst",
    category: "A/B Testing & Statistics",
    difficulty: "Senior",
    question: "When should you use Multi-Armed Bandits (MAB) instead of a traditional A/B test?",
    context: "Examines the Explore vs Exploit trade-off in modern algorithmic decision making.",
    modelAnswer: `A traditional A/B test splits traffic 50/50 for a fixed horizon to find the truth with high statistical confidence (**Pure Exploration**). A Multi-Armed Bandit dynamically shifts traffic toward the better-performing variant in real time to maximize rewards (**Exploration vs Exploitation**).

**When to Choose Multi-Armed Bandits**:
1. **Short Lifecycle / Perishable Opportunities**: Black Friday sales banners, breaking news headlines, or holiday flash promotions where by the time a 14-day A/B test finishes, the commercial window has closed.
2. **High Opportunity Cost**: Testing medical treatments or high-stakes financial conversions where serving an inferior variant causes significant direct revenue loss.
3. **Continuous Algorithm Tuning**: Automated ad creative selection and dynamic headline optimization.

**When to Stay with Traditional A/B Testing**:
- When you need clean, unskewed causal parameter estimates.
- When long-term retention or downstream metrics matter (Bandits optimize short-term clicks at the expense of downstream churn).`,
    seniorTips: [
      "Name standard bandit algorithms: **Thompson Sampling** (Bayesian posterior updating) and **Upper Confidence Bound (UCB1)**.",
      "Explain the bandit penalty: Because traffic dynamically shifts to the winner early, estimating downstream long-term metrics becomes statistically biased.",
    ],
    pitfalls: [
      "Using a Bandit when you need to measure a 90-day retention metric.",
      "Assuming Bandits eliminate the need for hypothesis testing.",
    ],
    tags: ["Multi-Armed Bandits", "Thompson Sampling", "Explore vs Exploit"],
    evaluationCriteria: ["Contrasts Explore vs Exploit goals", "Identifies perishable / short-lived use cases", "Warns about downstream metric bias"],
    hint: "A/B test wants to find the scientific truth; Bandit wants to make the most money right now.",
  },
  {
    id: "stat-13",
    role: "Data Analyst",
    category: "A/B Testing & Statistics",
    difficulty: "Mid",
    question: "What is Survival Analysis, and why is it superior to logistic regression for modeling customer churn?",
    context: "Evaluates modeling time-to-event data with censored observations.",
    modelAnswer: `Logistic regression predicts a binary outcome: *'Did the customer churn? (Yes/No)'*. However, it completely ignores **when** the churn occurred and cannot handle **right-censoring**.

**The Censoring Problem**:
If a customer signed up 20 days ago and is still active today, we don't know if they will churn tomorrow or stay for 5 years. Standard regression must either drop them (introducing severe survival bias) or treat them as 'never churned' (underestimating churn rate).

**Survival Analysis Advantages**:
1. **Handles Right-Censored Data**: Incorporates customers who have not yet churned up to their observation window.
2. **Models Time-to-Event Dynamics**: Uses the **Kaplan-Meier Estimator** to chart survival curves and **Cox Proportional Hazards** to evaluate how features (e.g. app logins, ticket count) increase or decrease instantaneous churn risk over time.`,
    seniorTips: [
      "Mention the Hazard Ratio: A Cox model hazard ratio of 1.4 for 'support tickets > 3' means each additional ticket increases instantaneous risk of churn by 40%.",
      "Mention the Python library \`lifelines\` for implementing Kaplan-Meier and Cox models.",
    ],
    pitfalls: [
      "Using standard linear regression on duration without handling censored records.",
      "Dropping currently active users from churn datasets.",
    ],
    tags: ["Survival Analysis", "Kaplan-Meier", "Cox Proportional Hazards", "Churn"],
    evaluationCriteria: ["Explains right-censoring concept", "Differentiates binary classification vs time-to-event", "Mentions Kaplan-Meier / Hazard ratios"],
    hint: "What do you do with a customer who is still subscribed today—are they churned or not?",
  },
  {
    id: "stat-14",
    role: "Data Analyst",
    category: "A/B Testing & Statistics",
    difficulty: "Lead/Staff",
    question: "What is the Synthetic Control Method, and how does a data analyst measure impact when an A/B test is impossible?",
    context: "Quasi-experimental causal inference for major company-wide launches or citywide regulations.",
    modelAnswer: `When randomized A/B testing is impossible (e.g. launching a national TV campaign, changing GDPR privacy policy across all of Europe, or opening a flagship store in Chicago), we use **Synthetic Controls** to construct a mathematical counterfactual.

**How it works**:
Instead of picking a single 'control city' (like comparing Chicago to New York, which differ in size and climate), Synthetic Control uses convex optimization to find a weighted combination of untreated donor units that matched Chicago's historical metrics prior to the launch:
\`Chicago_Synthetic = 0.45 * Philadelphia + 0.35 * Detroit + 0.20 * Minneapolis\`

**Measuring Impact**:
- Pre-launch: Synthetic Chicago tracks actual Chicago almost identically.
- Post-launch: The divergence between Actual Chicago and Synthetic Chicago represents the true causal treatment effect!`,
    seniorTips: [
      "Contrast with Difference-in-Differences (DiD): DiD assumes parallel trends hold across simple unweighted groups; Synthetic Control explicitly constructs the parallel trend through optimal weights.",
      "Mention placebo tests (in-time and in-space placebos) to evaluate statistical significance.",
    ],
    pitfalls: [
      "Allowing negative weights or extrapolation outside the donor convex hull.",
      "Using donor units that were contaminated by spillover from the treatment.",
    ],
    tags: ["Synthetic Control", "Causal Inference", "Quasi-Experiments"],
    evaluationCriteria: ["Explains lack of randomized control constraint", "Describes convex weighted combination of donors", "Contrasts pre vs post trajectory divergence"],
    hint: "Create a 'fake Chicago' by mixing percentages of other similar cities that didn't receive the launch.",
  },
];
