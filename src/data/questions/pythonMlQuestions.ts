import { InterviewQuestion } from "../../types";

export const PYTHON_ML_QUESTIONS: InterviewQuestion[] = [
  {
    id: "py-01",
    role: "Data Scientist",
    category: "Python & Machine Learning",
    difficulty: "Mid",
    question: "Why is df.iterrows() slow in Pandas, and how do you vectorize row-wise computations?",
    context: "Fundamental Python performance question testing vectorization mindset.",
    modelAnswer: `\`df.iterrows()\` is notoriously slow because it iterates through rows one by one in pure Python overhead, creating a new Pandas \`Series\` object for every single row and boxing C primitives into Python objects.

**Performance Hierarchy (Fastest to Slowest)**:
1. **NumPy / Pandas Native Vectorization**: Operates directly on contiguous C memory arrays with SIMD CPU instructions. (~1,000x faster than iterrows)
2. **\`np.select\` / \`np.where\`**: For conditional logic across multiple columns.
3. **\`df.apply()\` with lambda**: Still runs in Python loop space, but avoids Series construction overhead (~20x faster than iterrows).
4. **\`df.itertuples()\`**: Yields lightweight namedtuples without Series boxing (~100x faster than iterrows).
5. **\`df.iterrows()\`**: Absolute slowest; never use in production.

\`\`\`python
# SLOW (Never do this):
for idx, row in df.iterrows():
    df.loc[idx, 'tier'] = 'VIP' if row['spend'] > 1000 else 'Regular'

# FAST (Vectorized with np.select):
import numpy as np
conditions = [df['spend'] > 1000, df['spend'] > 500]
choices = ['VIP', 'Gold']
df['tier'] = np.select(conditions, choices, default='Regular')
\`\`\``,
    seniorTips: [
      "In modern 2026 data stacks, mention **Polars**: Polars is written in Rust, uses Apache Arrow columnar memory natively, multithreads automatically, and executes vectorized lazy queries 10–50x faster than Pandas.",
    ],
    pitfalls: [
      "Modifying a DataFrame inside an iterrows loop with \`df.loc[idx]\` (O(N^2) quadratic disaster).",
      "Assuming df.apply() is truly vectorized (it is not; it is just an optimized Python for-loop).",
    ],
    tags: ["Pandas", "Vectorization", "Python Performance"],
    evaluationCriteria: ["Explains Series boxing overhead", "Demonstrates np.where / np.select vectorization", "Ranks execution speeds accurately"],
    hint: "Think about contiguous memory and C-level loops versus Python object creation overhead.",
  },
  {
    id: "py-02",
    role: "Data Scientist",
    category: "Python & Machine Learning",
    difficulty: "Senior",
    question: "What is Data Leakage in predictive modeling, what are the most common forms, and how do you prevent them?",
    context: "The #1 reason machine learning models achieve 99% accuracy in development but catastrophically fail in production.",
    modelAnswer: `Data Leakage occurs when information from outside the training dataset (specifically from the test set or from the future) is inadvertently introduced into the model training pipeline.

**Two Primary Forms**:
1. **Target / Feature Leakage (Temporal Leakage)**:
   - Including a feature that is only created *after* or *as a consequence of* the target event.
   - *Example*: Predicting customer churn, but including \`account_cancellation_survey_score\` or \`refund_amount_last_day\` as an input feature!
2. **Train-Test Contamination**:
   - Performing transformations (imputing missing values with mean, scaling with \`StandardScaler\`, or doing target encoding) on the **entire dataset before splitting**.
   - The training set now 'knows' the mean/variance of the future test set.

**Prevention**:
- Always fit transformers strictly on the train split using \`sklearn.pipeline.Pipeline\`:
\`\`\`python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

# Safe pipeline: Scaler is fit ONLY on training folds during CV!
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('model', LogisticRegression())
])
\`\`\`
- Enforce strict time-based split cutoffs for timeseries data.`,
    seniorTips: [
      "Explain the golden rule: If a feature cannot be computed in real-time at the exact moment the model will be asked to score the user in production, it is data leakage.",
    ],
    pitfalls: [
      "Running \`StandardScaler.fit_transform(df)\` before train_test_split.",
      "Using future lookahead windows in rolling features.",
    ],
    tags: ["Data Leakage", "Scikit-Learn Pipelines", "ML Production"],
    evaluationCriteria: ["Distinguishes target leakage vs train-test contamination", "Explains Sklearn Pipeline usage", "Emphasizes production temporal reality"],
    hint: "Could this feature possibly be known by the server at the moment of prediction?",
  },
  {
    id: "py-03",
    role: "Data Scientist",
    category: "Python & Machine Learning",
    difficulty: "Senior",
    question: "Why is standard K-Fold Cross-Validation invalid for time-series data, and what should you use instead?",
    context: "Validates understanding of temporal dependency, autocorrelation, and forward-looking bias.",
    modelAnswer: `Standard K-Fold Cross-Validation shuffles data randomly into $K$ partitions. In time-series or sequential data, this violates the fundamental law of causality:
- The model trains on future data (e.g. Wednesday and Friday) to predict past data (e.g. Tuesday).
- Because real-world metrics exhibit strong autocorrelation and trends, this creates severe temporal leakage, producing artificially inflated metrics that fail in real-world forward inference.

**Correct Approach: TimeSeriesSplit (Rolling / Expanding Window)**:
\`\`\`python
from sklearn.model_selection import TimeSeriesSplit

tscv = TimeSeriesSplit(n_splits=5)
# Fold 1: Train on Month 1-2, Test on Month 3
# Fold 2: Train on Month 1-3, Test on Month 4
# Fold 3: Train on Month 1-4, Test on Month 5
for train_index, test_index in tscv.split(X):
    X_train, X_test = X.iloc[train_index], X.iloc[test_index]
    y_train, y_test = y.iloc[train_index], y.iloc[test_index]
    model.fit(X_train, y_train)
\`\`\`

**Blocked / Purged TimeSplit**:
Include an embargo/gap period between training and test sets to eliminate spillover from overlapping window features.`,
    seniorTips: [
      "Mention Marcos Lopez de Prado's 'Purging and Embargo' concept from quantitative finance.",
      "If features include 7-day rolling averages, the test set must begin at least 7 days after the training set ends to prevent overlap.",
    ],
    pitfalls: [
      "Shuffling rows in time-series datasets.",
      "Failing to leave an embargo buffer for rolling window features.",
    ],
    tags: ["TimeSeriesSplit", "Cross-Validation", "Time Series ML"],
    evaluationCriteria: ["Explains causality violation and forward leakage", "Demonstrates TimeSeriesSplit expanding window", "Notes embargo / gap periods"],
    hint: "Can you train on tomorrow's stock price to predict yesterday's?",
  },
  {
    id: "py-04",
    role: "Data Scientist",
    category: "Python & Machine Learning",
    difficulty: "Mid",
    question: "When should you use ROC-AUC vs Precision-Recall AUC (PR-AUC) to evaluate a classification model?",
    context: "Critical evaluation metric choice for imbalanced business problems like fraud or click-through rates.",
    modelAnswer: `- **ROC-AUC (Receiver Operating Characteristic)**: Plots True Positive Rate (Recall) vs False Positive Rate (FPR = FP / (FP + TN)).
  - Because FPR has True Negatives (TN) in the denominator, in heavily imbalanced problems (e.g. 99.5% legitimate transactions, 0.5% fraud), the huge number of TNs keeps FPR tiny.
  - A terrible model predicting 50,000 false alarms can still report an artificially high ROC-AUC of 0.94!
- **Precision-Recall AUC (PR-AUC)**: Plots Precision (TP / (TP + FP)) vs Recall (TP / (TP + FN)).
  - PR-AUC **completely excludes True Negatives (TN)** from its calculation!
  - It focuses exclusively on the minority class of interest. If false alarms explode, Precision plummets immediately, causing PR-AUC to drop sharply.

**Decision Rule**:
- **Balanced or mildly imbalanced classes**: ROC-AUC is standard.
- **Severe Class Imbalance (< 5% positives)**: Always use **PR-AUC (Average Precision)**.`,
    seniorTips: [
      "Baseline Rule: The baseline of a random guess in ROC-AUC is always 0.50. In PR-AUC, the baseline of a random guess is equal to the positive class prevalence (e.g. 0.005 for 0.5% fraud).",
    ],
    pitfalls: [
      "Reporting 0.98 ROC-AUC on a 0.1% fraud dataset and claiming the model is perfect.",
      "Using accuracy as an evaluation metric for imbalanced classes.",
    ],
    tags: ["ROC-AUC", "PR-AUC", "Class Imbalance", "Model Evaluation"],
    evaluationCriteria: ["Explains TN influence on FPR", "Differentiates imbalanced vs balanced class suitability", "Identifies random guess baselines"],
    hint: "Look at the denominator of FPR: what happens when True Negatives is in the millions?",
  },
  {
    id: "py-05",
    role: "Data Scientist",
    category: "Python & Machine Learning",
    difficulty: "Senior",
    question: "How do you handle severe class imbalance: Synthetic Oversampling (SMOTE) vs Cost-Sensitive Weighting?",
    context: "Contrasts academic synthetic data generation against modern production machine learning standards.",
    modelAnswer: `- **SMOTE (Synthetic Minority Over-sampling Technique)**: Creates synthetic points along the line segments between existing minority neighbors in feature space.
  - *Production Weaknesses*: Distorts probability calibration, suffers in high dimensions (curse of dimensionality), slows down training drastically by ballooning dataset size, and can generate unrealistic combinations of categorical features.
- **Cost-Sensitive Weighting / Focal Loss (Modern Standard)**:
  - Keeps the original ground-truth data distribution intact without adding fake rows.
  - Penalizes minority class misclassification directly inside the gradient descent loss function.
  - In XGBoost / LightGBM: simply set \`scale_pos_weight = (count_negative / count_positive)\`.

\`\`\`python
# Production Standard: Cost-sensitive gradient weighting
import xgboost as xgb

ratio = len(y_train[y_train == 0]) / len(y_train[y_train == 1])
model = xgb.XGBClassifier(
    scale_pos_weight=ratio,
    eval_metric='aucpr',
    random_state=42
)
\`\`\``,
    seniorTips: [
      "In industry, 95% of practitioners prefer \`scale_pos_weight\` or class weights over SMOTE because it is deterministic, lightning-fast, and doesn't pollute the lakehouse with synthetic noise.",
      "Post-model probability calibration (Platt scaling or Isotonic regression) is essential when applying class weights.",
    ],
    pitfalls: [
      "Applying SMOTE to the entire dataset before train/test splitting (massive data leakage).",
      "Assuming higher recall from SMOTE comes with no precision penalty.",
    ],
    tags: ["Class Imbalance", "SMOTE", "Cost-Sensitive", "XGBoost"],
    evaluationCriteria: ["Contrasts synthetic rows vs loss function weighting", "Identifies scale_pos_weight in XGBoost", "Cites probability calibration need"],
    hint: "Is it better to invent fake rows, or simply penalize mistakes on the rare class more heavily?",
  },
  {
    id: "py-06",
    role: "Data Scientist",
    category: "Python & Machine Learning",
    difficulty: "Senior",
    question: "What are SHAP (SHapley Additive exPlanations) values, and how do they differ from classical feature importance?",
    context: "The gold standard framework for explainable AI (XAI) and stakeholder trust.",
    modelAnswer: `Classical tree feature importance (like Gini impurity reduction or split gain) provides a global aggregate ranking of features, but suffers from two massive flaws:
1. **Bias toward high-cardinality features** (IDs, continuous numbers get favored over binary flags).
2. **No Directionality or Local Explainability**: It tells you 'Income is important', but cannot tell you *for customer #419*, did their income increase or decrease their churn risk?

**SHAP (Rooted in Cooperative Game Theory)**:
SHAP measures the fair marginal contribution of each feature to the difference between the model's prediction and the baseline expected prediction across all possible feature permutations.

**Key Properties**:
- **Local + Global**: Explains an individual prediction (local) while aggregating to global summaries.
- **Directional**: Shows whether a feature pushed the risk *up* or *down*.
- **Consistency**: If a model changes so that feature X contributes more to predictions, its SHAP value will never decrease.

\`\`\`python
import shap
explainer = shap.TreeExplainer(model)
shap_values = explainer(X_test)
# Summary plot shows magnitude AND positive/negative direction
shap.summary_plot(shap_values, X_test)
\`\`\``,
    seniorTips: [
      "Mention that for tree models (XGBoost, LightGBM, CatBoost), \`TreeSHAP\` computes exact Shapley values in polynomial time $O(TLD^2)$ rather than exponential time.",
      "Explain the executive value: SHAP powers regulatory adverse action notices (e.g. telling a loan applicant the top 3 reasons they were denied).",
    ],
    pitfalls: [
      "Using default scikit-learn Gini feature importances on uncurated datasets.",
      "Running KernelSHAP on 100,000 rows without realizing it is computationally prohibitive (use TreeSHAP instead).",
    ],
    tags: ["SHAP", "Explainability", "XAI", "Game Theory"],
    evaluationCriteria: ["Cites game-theory cooperative origin", "Contrasts local vs global explainability", "Demonstrates directional insight"],
    hint: "Think about dividing prize money fairly among team members based on their marginal contributions.",
  },
  {
    id: "py-07",
    role: "Data Scientist",
    category: "Python & Machine Learning",
    difficulty: "Mid",
    question: "Explain the difference between L1 (Lasso) and L2 (Ridge) Regularization and why L1 drives feature selection.",
    context: "Core mathematical intuition behind linear model regularization.",
    modelAnswer: `Regularization prevents overfitting by adding a penalty term to the loss function:

- **L2 Regularization (Ridge)**:
  - Penalty: \`λ * Σ(β_j^2)\` (Sum of squared coefficients).
  - Shrinks coefficients asymptotically toward zero, but **never forces them to exactly zero**. Keeps all features in the model, handling multicollinearity gracefully.
- **L1 Regularization (Lasso)**:
  - Penalty: \`λ * Σ(|β_j|)\` (Sum of absolute values of coefficients).
  - Drives coefficients to **exactly zero**, performing automatic sparse feature selection!

**Geometric Intuition**:
The L1 constraint region is a diamond with sharp corners that lie directly on the coordinate axes. When the elliptical contours of the OLS loss function expand, they naturally hit the corner of the diamond first, setting one or more coefficients exactly to 0. The L2 constraint is a smooth circle, so the intersection almost never lands exactly on an axis.`,
    seniorTips: [
      "ElasticNet combines both penalties: \`α * L1 + (1 - α) * L2\`. It gives you Lasso's feature sparsity while retaining Ridge's ability to handle groups of correlated features.",
    ],
    pitfalls: [
      "Using L1 or L2 regularization without scaling features first (StandardScaler is mandatory; otherwise larger-scale features get penalized unfairly).",
    ],
    tags: ["Regularization", "Lasso", "Ridge", "Feature Selection"],
    evaluationCriteria: ["States exact penalty formulas", "Explains geometric diamond vs circle intuition", "Identifies feature selection mechanism"],
    hint: "Diamond corners lie on the axes (zeroing out weights); circles do not have corners.",
  },
  {
    id: "py-08",
    role: "Data Scientist",
    category: "Python & Machine Learning",
    difficulty: "Mid",
    question: "How do Random Forests differ from Gradient Boosted Trees (XGBoost/LightGBM)?",
    context: "Comparing bagging vs boosting ensemble architectures.",
    modelAnswer: `- **Random Forest (Bagging - Bootstrap Aggregating)**:
  - Trains multiple deep, independent decision trees in parallel on random bootstrap samples of data and random subsets of features.
  - Trees are trained to high depth (low bias, high variance).
  - Averages predictions to **reduce variance** (combat overfitting).
- **Gradient Boosted Trees (Boosting - XGBoost/LightGBM)**:
  - Trains shallow, weak trees (stumps) **sequentially**.
  - Each new tree is trained to predict the **pseudo-residuals (negative gradients)** of the ensemble's previous errors.
  - Sequentially combines trees to **reduce bias**.

**Operational Differences**:
- Random Forest is hard to overfit and requires little hyperparameter tuning.
- Gradient Boosting consistently achieves higher benchmark accuracy on tabular data, but is sensitive to hyperparameters (learning rate, max depth) and can overfit if given too many trees without early stopping.`,
    seniorTips: [
      "LightGBM's secret: Leaf-wise tree growth and histogram-based binning makes it 10x faster than traditional XGBoost with identical or superior accuracy.",
    ],
    pitfalls: [
      "Claiming boosting runs trees in parallel (each tree depends on the residuals of the previous tree; only feature split searching is parallelized).",
    ],
    tags: ["Random Forest", "XGBoost", "LightGBM", "Ensemble Learning"],
    evaluationCriteria: ["Contrasts parallel bagging vs sequential boosting", "Explains residual fitting mechanism", "Compares bias vs variance reduction"],
    hint: "Bagging is a democracy of independent experts; Boosting is a student correcting mistakes after each test.",
  },
  {
    id: "py-09",
    role: "Data Scientist",
    category: "Python & Machine Learning",
    difficulty: "Senior",
    question: "Why should you almost never use a default classification threshold of 0.50 in a real-world business setting?",
    context: "Connects machine learning probability outputs directly to business economics.",
    modelAnswer: `A threshold of 0.50 assumes that the business cost of a **False Positive (Type I)** is exactly equal to the cost of a **False Negative (Type II)**. In the real world, this is almost never true!

**Real-World Cost Asymmetries**:
1. **Fintech Fraud Detection**:
   - False Negative (Missing a $2,000 fraud ring): Loss = **$2,000** plus chargeback fee.
   - False Positive (Flagging a legit user for SMS 2FA): Cost = **$0.02** for SMS and tiny friction.
   - Optimal threshold should be tuned aggressively low (e.g. 0.12) to catch nearly all fraud.
2. **VIP Customer Retention Retention Outreach**:
   - Calling churn-risk enterprise clients with a $200 discount.
   - Optimal threshold must maximize: \`Net ROI = (True Positives * Churn Saved) - (Predicted Positives * Incentive Cost)\`.

**Solution**:
Generate the Precision-Recall curve, construct an expected cost/benefit matrix, and select the operational threshold that maximizes net dollar profit.`,
    seniorTips: [
      "In an interview, say: 'Data scientists build probability estimators; business executives and cost curves decide the threshold.'",
    ],
    pitfalls: [
      "Evaluating a model strictly with \`accuracy_score\` or default 0.50 \`predict()\` outputs.",
      "Failing to quantify the monetary dollar cost of a false positive vs false negative.",
    ],
    tags: ["Classification Threshold", "Cost-Benefit Matrix", "Business ML"],
    evaluationCriteria: ["Explains cost asymmetry", "Demonstrates dollar-weighted optimization", "Uses predict_proba() rather than predict()"],
    hint: "Does letting a $1,000 fraudster escape cost the same as asking a legitimate user to confirm an SMS code?",
  },
  {
    id: "py-10",
    role: "Data Scientist",
    category: "Python & Machine Learning",
    difficulty: "Mid",
    question: "What is the Bias-Variance Tradeoff, and how do you diagnose whether a model suffers from high bias vs high variance?",
    context: "Foundational machine learning diagnostic question.",
    modelAnswer: `- **Bias (Underfitting)**: Error caused by overly simplistic assumptions. The model fails to capture underlying patterns in data.
  - *Diagnosis*: High training error AND high validation error.
  - *Fix*: Add more features, create interaction terms, decrease regularization, use a more complex model (e.g. switch from linear to tree ensemble).
- **Variance (Overfitting)**: Error caused by excessive sensitivity to small fluctuations/noise in the training set.
  - *Diagnosis*: Very low training error, but high/exploding validation error.
  - *Fix*: Increase regularization (higher L1/L2, lower max_depth), collect more training data, prune features, use bagging/dropout.

\`\`\`
Total Error = Bias^2 + Variance + Irreducible Error (Noise)
\`\`\``,
    seniorTips: [
      "Plot Learning Curves: Graph training loss and validation loss as a function of sample size. If both plateau high and close together = High Bias. If there is a massive gap between train and validation = High Variance.",
    ],
    pitfalls: [
      "Adding more training data to fix high bias (more data only helps high variance).",
      "Assuming zero error is achievable (irreducible noise always exists).",
    ],
    tags: ["Bias-Variance", "Learning Curves", "Overfitting"],
    evaluationCriteria: ["Defines bias vs variance correctly", "Provides learning curve diagnostic criteria", "Lists specific mitigation strategies for each"],
    hint: "High bias is too dumb to learn; high variance memorizes the noise.",
  },
  {
    id: "py-11",
    role: "Data Scientist",
    category: "Python & Machine Learning",
    difficulty: "Senior",
    question: "How does Bayesian Optimization (e.g. Optuna) outperform Random Search and Grid Search for hyperparameter tuning?",
    context: "State-of-the-art hyperparameter optimization (HPO) in production pipelines.",
    modelAnswer: `- **Grid Search**: Evaluates every combination in a pre-defined grid. Computationally exhaustive, suffers from the curse of dimensionality, wastes compute evaluating useless regions.
- **Random Search**: Samples parameter combinations randomly. Proven to outperform Grid Search because it explores continuous dimensions much more thoroughly, but remains 'memoryless' (does not learn from past evaluations).
- **Bayesian Optimization (Tree-structured Parzen Estimators - TPE in Optuna)**:
  - Treats the hyperparameter tuning objective function as a black box.
  - Builds a probabilistic surrogate model (Gaussian Process or Parzen Estimator) mapping hyperparameter choices to expected validation loss.
  - Uses an **Acquisition Function** (Expected Improvement) to balance exploring unexplored areas vs exploiting parameters that historically yielded top scores.

**Result**:
Reaches superior model hyperparameters in **1/5th the compute time and iterations** of Grid Search!`,
    seniorTips: [
      "Mention Optuna's **Pruning** feature (Asynchronous Successive Halving - ASHA): Optuna automatically terminates unpromising training runs early at epoch 5 rather than waiting for epoch 100, saving massive cloud GPU/CPU costs.",
    ],
    pitfalls: [
      "Using Grid Search on 8 continuous parameters (exponential time complexity).",
      "Tuning hyperparameters directly on the test set instead of a validation fold.",
    ],
    tags: ["Optuna", "Hyperparameter Tuning", "Bayesian Optimization"],
    evaluationCriteria: ["Contrasts memoryless vs sequential learning", "Explains surrogate model and acquisition function", "Mentions automated trial pruning"],
    hint: "Bayesian optimization remembers which trials worked well and focuses future searches around those sweet spots.",
  },
  {
    id: "py-12",
    role: "Data Scientist",
    category: "Python & Machine Learning",
    difficulty: "Senior",
    question: "How do you build an automated Data Drift and Concept Drift detection pipeline for deployed models?",
    context: "Essential MLOps and monitoring capability for production model reliability.",
    modelAnswer: `- **Data Drift (Covariate Shift)**: The distribution of input features $P(X)$ changes over time, while the relationship $P(Y|X)$ remains constant.
  - *Example*: An inflation wave shifts customer income distribution from $50k to $75k.
  - *Statistical Tests*:
    - **Kolmogorov-Smirnov (K-S) test** for continuous feature distribution divergence.
    - **Population Stability Index (PSI)**: PSI > 0.2 signals significant distribution drift requiring retraining.
- **Concept Drift**: The relationship between inputs and outputs $P(Y|X)$ changes.
  - *Example*: A pandemic hits; historical travel booking features no longer predict hotel booking conversion.
  - *Detection*: Continuous monitoring of live ground-truth metrics (Precision, Recall, Brier Score) over time.

**Automated Remediation Architecture**:
Trigger automated dbt incremental feature updates and Airflow retraining DAGs whenever PSI exceeds threshold or rolling 7-day PR-AUC drops below baseline.`,
    seniorTips: [
      "Mention open-source libraries like **Evidently AI** or **Great Expectations** for automated drift reporting.",
      "Explain the lag challenge: Ground truth labels (e.g. did the loan default?) can take 6-12 months to mature, making Data Drift monitoring your only immediate early warning signal.",
    ],
    pitfalls: [
      "Confusing Data Drift (inputs change) with Concept Drift (ground-truth relationships change).",
      "Retraining models blindly every Sunday without verifying data distribution shifts.",
    ],
    tags: ["Data Drift", "Concept Drift", "MLOps", "PSI"],
    evaluationCriteria: ["Distinguishes data drift vs concept drift", "Cites statistical tests (PSI, KS)", "Outlines automated alerting and retraining loop"],
    hint: "Data drift is the incoming ingredients changing; concept drift is customers no longer liking the recipe.",
  },
  {
    id: "py-13",
    role: "Data Scientist",
    category: "Python & Machine Learning",
    difficulty: "Mid",
    question: "When should you use PCA (Principal Component Analysis) vs t-SNE / UMAP for dimensionality reduction?",
    context: "Tests understanding of linear projection vs non-linear manifold learning.",
    modelAnswer: `- **PCA (Linear Projection)**:
  - Finds orthogonal linear axes (principal components) that maximize the variance of the data.
  - *Pros*: Deterministic, fast, mathematically exact, preserves global structure, and can transform new out-of-sample data points using the fitted projection matrix.
  - *Use Case*: Feature reduction before regression/clustering, multicollinearity removal, image compression.
- **t-SNE / UMAP (Non-linear Manifold Learning)**:
  - Models high-dimensional local neighborhood distances and projects them onto 2D/3D space.
  - *Pros*: Unbelievably good at visualizing complex, non-linear clusters (e.g. user embeddings, genomics, text clusters).
  - *Cons*: Non-deterministic, computationally heavy, distances between distant clusters are meaningless in t-SNE, and traditional t-SNE cannot easily project new unseen data points.

**Rule of Thumb**: Use PCA for machine learning feature engineering; use UMAP/t-SNE for exploratory 2D visualization and cluster discovery.`,
    seniorTips: [
      "UMAP generally outperforms t-SNE: it preserves more global structure, is significantly faster, and supports projecting new unseen points via its learned fuzzy simplicial set.",
    ],
    pitfalls: [
      "Feeding t-SNE coordinates directly as training features to a predictive linear model.",
      "Forgetting to scale features with StandardScaler prior to PCA.",
    ],
    tags: ["PCA", "t-SNE", "UMAP", "Dimensionality Reduction"],
    evaluationCriteria: ["Contrasts linear vs non-linear manifold", "Identifies visualization vs feature engineering use cases", "Mentions global vs local structure preservation"],
    hint: "PCA draws straight lines that maximize variance; t-SNE bends like rubber to keep neighbors together on a 2D plot.",
  },
  {
    id: "py-14",
    role: "Data Scientist",
    category: "Python & Machine Learning",
    difficulty: "Senior",
    question: "How do you combine classical Machine Learning with modern LLM reasoning in a production analytical pipeline?",
    context: "The cutting-edge hybrid AI architecture demanded in 2026 enterprise data teams.",
    modelAnswer: `Modern production workflows use **Hybrid AI Architecture**: pairing high-throughput tabular ML with LLM cognitive reasoning:

1. **Stage 1: High-Speed Tabular Filtering (XGBoost / LightGBM)**:
   - Evaluates 1,000,000 transactions per second for numerical risk signals (velocity, spend deviation).
   - Filters down to the top 0.1% most anomalous, complex, or high-risk cases.
2. **Stage 2: LLM Cognitive Augmentation (Gemini 3.8 Flash)**:
   - Ingests unstructured context for the flagged 0.1%: customer support chat transcripts, dispute notes, merchant logs.
   - Synthesizes findings, conducts root-cause diagnosis, and formats a structured JSON investigation report or regulatory compliance draft in < 2 seconds.
3. **Stage 3: Feedback Loop**:
   - LLM extracted entities and sentiment scores are converted into structured tabular features stored in the lakehouse to improve next month's XGBoost retraining.

**Why this wins**: Tabular ML handles billions of rows cost-effectively; LLMs handle messy human language and executive storytelling.`,
    seniorTips: [
      "Highlight cost and latency economics: Running an LLM on 10,000,000 rows directly is slow and financially reckless. Using XGBoost as a first-stage filter makes LLM reasoning economically viable.",
      "Always enforce structured JSON outputs with schema validation (Pydantic / Instructor) when calling LLMs.",
    ],
    pitfalls: [
      "Trying to use an LLM to predict tabular numerical patterns that gradient boosting solves in 2 milliseconds.",
      "Not validating LLM JSON outputs before persisting to database.",
    ],
    tags: ["Hybrid AI", "LLM Augmentation", "Modern Architecture", "Gemini"],
    evaluationCriteria: ["Articulates 2-stage funnel architecture", "Explains cost/latency economics", "Shows tabular ML and LLM synergy"],
    hint: "Use fast tabular models to filter the needle in the haystack, then send the needle to an LLM for deep analysis.",
  },
];
