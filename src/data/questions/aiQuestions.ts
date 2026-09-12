import { InterviewQuestion } from "../../types";

export const AI_LLM_QUESTIONS: InterviewQuestion[] = [
  {
    id: "ai-01",
    role: "Cross-Functional",
    category: "Python & Machine Learning",
    difficulty: "Senior",
    question: "How do you evaluate and safeguard Text-to-SQL systems built with Large Language Models (LLMs)?",
    context: "High-demand modern AI capability allowing non-technical stakeholders to ask questions in plain English.",
    modelAnswer: `Text-to-SQL systems translate natural language into SQL queries. Without safeguards, they suffer from hallucinations, security vulnerabilities (SQL injection), and massive runaway compute costs.

**Evaluation & Safeguard Framework**:
1. **Semantic Layer Abstraction (Do not give LLMs raw table access)**:
   - Provide the LLM with a curated **Semantic Layer** (dbt Metrics / Cube.js / LookML definitions) rather than raw Bronze/Silver lakehouse schemas.
   - Restrict the schema prompt to verified views with documented business definitions.
2. **Deterministic Syntax & AST Validation (SQLFluff / sqlglot)**:
   - Parse the generated query with \`sqlglot\` to verify Abstract Syntax Tree (AST) validity before execution.
   - Enforce read-only permissions: Ban \`INSERT\`, \`UPDATE\`, \`DELETE\`, \`DROP\`, \`ALTER\`.
3. **Execution Guardrails & Resource Limits**:
   - Wrap queries in read-only database roles with strict execution timeouts (e.g. 10s maximum) and automatic \`LIMIT 1000\` injection.
   - Enforce cost estimators: In BigQuery, run \`dry_run=True\` to reject queries scanning > 50 GB.
4. **Benchmarking with Spider / BIRD Methodology**:
   - Maintain a benchmark suite of 200 real stakeholder questions paired with verified human ground-truth SQL queries. Measure **Execution Accuracy (EX)** (do both queries return identical result sets?).`,
    seniorTips: [
      "Explain the BigQuery dry_run pattern: Always calculate estimated scan bytes before firing the query to prevent a single hallucinated cross-join from racking up a $2,000 cloud bill.",
      "Few-Shot In-Context Prompting: Include 3-5 verified (question -> SQL) pairs in the system prompt for domain-specific schemas.",
    ],
    pitfalls: [
      "Granting the LLM execution role write or DDL permissions.",
      "Evaluating accuracy solely by string comparison rather than SQL execution result parity.",
    ],
    tags: ["Text-to-SQL", "LLM Evaluation", "AI Safety", "sqlglot"],
    evaluationCriteria: ["Implements semantic layer abstraction", "Enforces AST parsing and read-only limits", "Uses dry-run cost estimation"],
    hint: "How do you make sure an AI doesn't write a query that drops a database or costs $5,000?",
  },
  {
    id: "ai-02",
    role: "Cross-Functional",
    category: "Python & Machine Learning",
    difficulty: "Mid",
    question: "What is Retrieval-Augmented Generation (RAG) and when should a data team use RAG vs Fine-Tuning?",
    context: "Core generative AI architecture decision for enterprise enterprise data applications.",
    modelAnswer: `- **RAG (Retrieval-Augmented Generation)**:
  - Dynamically searches an external knowledge base (vector database like Chroma/Pinecone or keyword search), retrieves relevant context chunks, and injects them into the LLM's prompt context at inference time.
  - *Best For*: Frequently updating enterprise data (internal company wikis, customer support transcripts, changing product inventory), verifiable source citations, and immediate zero-cost updates without model retraining.
- **Fine-Tuning**:
  - Continues gradient descent training on a pre-trained base model with specialized input-output prompt pairs to adjust the model's internal weights.
  - *Best For*: Teaching specialized style, tone, unique JSON syntax, or domain terminology (e.g. medical or legal jargon), NOT for injecting volatile factual knowledge.

**Rule of Thumb**:
Use **RAG** for knowledge retrieval and dynamic enterprise documents; use **Fine-Tuning** for behavior, style, and specialized syntax formatting.`,
    seniorTips: [
      "Hybrid Search is the state of the art: Combining dense vector embeddings (semantic similarity) with BM25 sparse keyword search and a re-ranking model (Cohere Rerank) delivers 30% higher retrieval precision.",
    ],
    pitfalls: [
      "Fine-tuning a model to 'memorize' company sales numbers (LLMs will hallucinate outdated figures).",
      "Ignoring chunking strategy and metadata filtering in RAG pipelines.",
    ],
    tags: ["RAG", "Fine-Tuning", "Vector Search", "LLM Architecture"],
    evaluationCriteria: ["Contrasts knowledge injection vs behavioral conditioning", "Identifies volatility advantages of RAG", "Recommends hybrid search"],
    hint: "RAG gives the model an open-book reference text; Fine-tuning is training the model to study for a test.",
  },
  {
    id: "ai-03",
    role: "Cross-Functional",
    category: "Python & Machine Learning",
    difficulty: "Senior",
    question: "How do you build an LLM-powered Root-Cause Analysis Agent that synthesizes unstructured logs with structured telemetry?",
    context: "Practical AI application for automated incident triage and anomaly response.",
    modelAnswer: `Combining structured SQL telemetry metrics with unstructured textual logs creates an autonomous diagnostic intelligence engine:

**Architecture**:
1. **Anomaly Trigger**: An automated dbt test or threshold monitor detects a 24% spike in checkout failures in the European region.
2. **Context Gathering (Tool Calling)**:
   - Structured Tool: Queries the lakehouse for affected payment gateways, error codes (e.g. HTTP 504), and user operating systems.
   - Unstructured Tool: Fetches recent customer support chat logs, Datadog server logs, and payment provider status feeds.
3. **Synthesis via Gemini 3.8 Flash**:
   - Feeds the structured error distribution and the unstructured log excerpts into Gemini with a strict Pydantic schema:
     \`\`\`json
     {
       "root_cause_summary": "Third-party payment gateway Adyen experiencing timeout on 3D-Secure v2 in Germany",
       "financial_impact_est_usd": 42000,
       "recommended_immediate_action": "Reroute German checkout transactions to secondary gateway Stripe",
       "confidence_score": 0.94
     }
     \`\`\`
4. **Automated Incident Dispatch**: Dispatches the structured JSON summary directly to the engineering Slack channel and PagerDuty alert.`,
    seniorTips: [
      "Emphasize the human-in-the-loop principle: The LLM suggests the rerouting or mitigation, but high-impact financial changes require one-click human approval.",
      "Enforce strict schema output using structured JSON generation rather than unstructured conversational text.",
    ],
    pitfalls: [
      "Flooding the LLM prompt with 50,000 raw log lines without pre-filtering or clustering.",
      "Letting autonomous agents execute write actions without human guardrails.",
    ],
    tags: ["LLM Agents", "Root-Cause Analysis", "Incident Response", "Gemini"],
    evaluationCriteria: ["Demonstrates structured + unstructured synergy", "Enforces structured JSON output schema", "Maintains human-in-the-loop safety"],
    hint: "Combine the numbers from SQL with the words from error logs to produce an actionable diagnosis.",
  },
];
