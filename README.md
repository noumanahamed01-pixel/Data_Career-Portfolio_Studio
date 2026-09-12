# Data Career Portfolio Studio 🚀

> **Target Career Pathway:** Data Analyst → Analytics Engineer → Data Engineer (with Applied ML & AI Literacy)  
> **Repository:** [github.com/noumanahamed01-pixel/Data_Career-Portfolio_Studio](https://github.com/noumanahamed01-pixel/Data_Career-Portfolio_Studio)

A production-grade web application and reference architecture platform demonstrating how to transition from traditional dashboard-only analysis into modern Analytics Engineering (**dbt Core**, **Kimball dimensional modeling**, **Data Contracts & Quarantine tables**, **Airflow DAG orchestration**) and financial expected-value decision systems (**Time-aware ML**, **Expected ROI threshold tuning**, and **Policy-Constrained LLMs**).

---

## 🔑 Required API Key (To Run AI Features)

The application includes interactive AI capabilities (Staff-Level Career Mentor, Custom Portfolio Blueprint Generator, and SQL/Code Reviewer):

1. **Get a Free Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/).
   - Click **"Get API key"** → **"Create API key"** (free with standard rate limits).
2. **Where to place the key**:
   - **Local development:** Add `GEMINI_API_KEY="your_key_here"` in your `.env` file.
   - **Cloud Hosting (Render/Railway):** Add `GEMINI_API_KEY` under the service's **Environment Variables** dashboard.
3. *Note:* The application runs smoothly even without an API key by gracefully utilizing realistic simulated responses for all technical labs, case studies, and code reviews.

---

## 🖱️ How to Deploy to GitHub (Without Using Any Terminal)

### Method 1: 1-Click "Export to GitHub" in AI Studio
1. In Google AI Studio (top-right corner), click the **Settings / Menu** icon.
2. Select **"Export to GitHub"**.
3. Authorize your GitHub account if prompted.
4. Select repository: **`noumanahamed01-pixel/Data_Career-Portfolio_Studio`**.
5. Click **Push / Export**. AI Studio will automatically commit and push all files, folders, and workflows.

### Method 2: Drag & Drop via GitHub Web UI
1. In AI Studio, click the menu and select **"Download as ZIP"**.
2. Extract the downloaded ZIP file on your computer.
3. Open [https://github.com/noumanahamed01-pixel/Data_Career-Portfolio_Studio](https://github.com/noumanahamed01-pixel/Data_Career-Portfolio_Studio) in your browser.
4. Click **"Add file"** → **"Upload files"**.
5. Drag and drop all extracted project files and folders into the window.
6. Click the green **"Commit changes"** button at the bottom.

---

## 🌐 1-Click Free Web Hosting (Render.com)

Once your code is in GitHub, you can host the live web application online for free:

1. Sign up on [Render.com](https://render.com) using your GitHub account.
2. Click **New +** → **Web Service**.
3. Connect your repository: `noumanahamed01-pixel/Data_Career-Portfolio_Studio`.
4. Fill in the build settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Click **Advanced** → **Add Environment Variable**:
   - Key: `GEMINI_API_KEY`
   - Value: *(your Gemini API key)*
6. Click **Create Web Service**. Render will deploy your live portfolio application.

---

## 🌟 What This Project Proves to Hiring Managers

1. **Separation of Observed vs Simulated Metrics:** Distinguishes observed historical churn (6.8%) from scenario-based targets (2.0 pp reduction target, ₹540,000 quarterly simulation).
2. **Data Contracts & Quarantine Routing:** Enforces boundary checks (`customer_id NOT NULL`, `order_amount >= 0`). Corrupt records are sent to a quarantine table rather than dropped silently.
3. **dbt Dimensional Modeling:** Demonstrates clean Kimball staging (`stg_orders` → `int_customer_activity` → `mart_churn_features`) with point-in-time calculation to prevent temporal data leakage.
4. **Financial Expected-Value Tuning:** Tunes decision thresholds based on actual outreach cost (₹80) vs retained gross margin (₹1,200), rather than misleading ROC-AUC scores.
5. **Policy Engine First, LLM Last:** Business logic approves the coupon/token; Gemini with Pydantic schemas strictly personalizes the customer email without ever hallucinating unauthorized discounts.

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
├── package.json # Build scripts and dependencies
└── vite.config.ts # Vite config

---

## 📄 License
MIT License - Created for the portfolio of [Nouman Ahamed](https://github.com/noumanahamed01-pixel).
