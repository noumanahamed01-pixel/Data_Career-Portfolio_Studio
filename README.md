# Data Career Portfolio Studio 🚀

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://data-career-portfolio-studio.onrender.com/)
[![CI Status](https://img.shields.io/badge/CI-Passing-emerald?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/noumanahamed01-pixel/Data_Career-Portfolio_Studio/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

> 🌐 **Live Production App:** [https://data-career-portfolio-studio.onrender.com/](https://data-career-portfolio-studio.onrender.com/)  
> 🎯 **Target Career Pathway:** Data Analyst → Analytics Engineer → Data Engineer (with Applied ML & AI Literacy)  
> 👤 **Author:** [Nouman Ahamed](https://github.com/noumanahamed01-pixel)

A full-stack, production-grade reference architecture and career elevation platform. It demonstrates how modern data practitioners transition beyond static dashboards into **Analytics Engineering** (Kimball dimensional modeling, dbt Core, data contracts, quarantine routing, Airflow DAG orchestration) and **Pragmatic AI Systems** (time-aware prediction, financial expected-value threshold tuning, and policy-constrained LLM agents).

---

## 🚀 Live Demo & Core Modules

Experience the live system at **[data-career-portfolio-studio.onrender.com](https://data-career-portfolio-studio.onrender.com/)**:

- **Flagship Case Study (`subscription-retention-engine`):** A real-world subscription retention platform distinguishing observed historical baselines from simulated scenario interventions.
- **SQL & Dimensional Modeling Lab:** Interactive window functions, gap-and-island analysis, rolling metrics, and Kimball Staging → Intermediate → Marts transformations.
- **Pipeline DAG & Data Contracts Viewer:** Visualizes multi-source ingestion (`Orders`, `Subscriptions`, `Support`) with schema assertions routing corrupt records to quarantine tables without halting pipelines.
- **Predictive ML & Financial Threshold Optimizer:** Time-aware model training (zero future data leakage) optimized for unit economics (₹80 contact cost vs ₹1,200 retained gross margin).
- **Policy-First LLM Augmentation:** Python business logic decides coupon and discount permissions; Gemini 3.8 Flash formats customer outreach strictly under Pydantic schemas.
- **Staff Interview Vault:** 75 curated technical and behavioral questions across SQL, dbt, distributed data pipelines, and AI engineering.

---

## 🌟 What Hiring Managers & Staff Engineers Respect

Instead of generic tutorial datasets (Titanic, Iris) or 47 bloated repository folders, this architecture demonstrates production judgment:

| Architectural Principle | Naive Approach | Production Reality in This Repo |
| :--- | :--- | :--- |
| **Business Metrics** | Claiming "Saved $1.4M" in a portfolio | Separates **Observed Baselines** (6.8% churn) from **Scenario Simulations** (2.0 pp reduction target, ₹540,000 net simulation) |
| **Data Quality** | Silent drops (`df.dropna()`) | Boundary contracts validate schema; malformed records route to dedicated **Quarantine Tables** |
| **Data Modeling** | Flat, messy 500-line SQL files | Kimball Star-Schema (`stg_` → `int_` → `mart_`) with automated dbt tests |
| **Machine Learning** | Generic ROC-AUC optimization | **Financial Expected-Value Tuning** based on actual unit margins and outreach costs |
| **Generative AI** | Prompting an LLM to decide discounts | **Deterministic Policy Engine First**; LLM used strictly for personalized copy under Pydantic guards |

---

## 🔑 Environment Configuration & API Keys

The application runs fully out-of-the-box with realistic simulated responses for all SQL labs, ML simulators, DAG viewers, and case studies.

To activate real-time Gemini AI features (Career Mentor chat, Custom Portfolio Blueprint Generator, and SQL Reviewer):

1. **Get a Free Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/).
   - Click **"Get API key"** → **"Create API key"** (free tier with generous limits).
2. **On Render.com:**
   - Go to your service dashboard → **Environment** tab.
   - Add environment variable:
     - **Key:** `GEMINI_API_KEY`
     - **Value:** `your_gemini_api_key_here`
   - Click **Save Changes**.

---

## 🛠️ Deploying to Render (Settings Reference)

When hosting on [Render.com](https://render.com), use the following configuration:

| Setting | Value |
| :--- | :--- |
| **Repository** | `https://github.com/noumanahamed01-pixel/Data_Career-Portfolio_Studio` |
| **Environment** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Node Version** | `20` or higher |

*(Note: The repository also includes `render.yaml` which automatically configures these settings).*

---

## 📂 Project Structure
├── .github/workflows/
│ └── ci.yml # Automated GitHub Actions test & build verification
├── src/
│ ├── components/
│ │ ├── BusinessCaseCard.tsx # Comprehensive case study explorer
│ │ ├── CareerRoadmapView.tsx # Strategic Analyst -> AE -> DE roadmap
│ │ ├── ExecutiveDashboard.tsx # Cohort retention heatmaps & metrics
│ │ ├── InterviewVault.tsx # 75 curated technical interview questions
│ │ ├── PipelineDAGViewer.tsx # Ingestion -> Contract -> dbt DAG
│ │ ├── PortfolioGenerator.tsx # Production blueprint generator
│ │ ├── PredictiveMLSimulator.tsx # Expected ROI threshold simulator
│ │ └── SQLLab.tsx # Window functions & gap-and-island queries
│ ├── data/
│ │ ├── businessCases.ts # Core retention & fintech datasets
│ │ └── interviewVaultQuestions.ts# 75 Staff-curated questions with answers
│ └── App.tsx # Single-page application layout
├── server.ts # Express backend & proxy for Gemini API
├── render.yaml # One-click Render infrastructure definition
├── package.json # Build scripts and dependencies
└── vite.config.ts # Vite config

---

## 💻 Local Development

bash
# Clone the repository
git clone https://github.com/noumanahamed01-pixel/Data_Career-Portfolio_Studio.git
cd Data_Career-Portfolio_Studio

# Install dependencies
npm install

# Run the local full-stack development server
npm run dev

# Open http://localhost:3000 in your browser

---

## 📄 License
MIT License - Created for the portfolio of [Nouman Ahamed](https://github.com/noumanahamed01-pixel).
