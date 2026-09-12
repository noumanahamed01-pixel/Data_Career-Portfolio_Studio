import React, { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  Code2,
  FileText,
  Compass,
  Award,
  Download,
  Trash2,
  Terminal,
  Zap,
  ArrowRight,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  mode?: string;
  isSimulated?: boolean;
  timestamp: string;
}

type MentorMode = "mentor" | "code_review" | "resume_polish" | "mock_interview";

interface ModeConfig {
  id: MentorMode;
  label: string;
  icon: any;
  badge: string;
  placeholder: string;
  presets: string[];
}

const MODES: ModeConfig[] = [
  {
    id: "mentor",
    label: "Career & Transition Strategy",
    icon: Compass,
    badge: "Principal Mentor",
    placeholder:
      "Ask about career roadmaps, how to transition to DS/DE, skills to prioritize in 2026, or interview strategies...",
    presets: [
      "How do I transition from writing ad-hoc SQL queries to an Analytics Engineer / Data Engineer role?",
      "What are the top 3 portfolio projects that impress tech leads in the generative AI era?",
      "How do I explain the business ROI of a predictive churn model to non-technical executives?",
      "Which should I learn first for production pipelines: dbt with Snowflake, or Airflow with Python?",
    ],
  },
  {
    id: "code_review",
    label: "SQL & Python Code Optimizer",
    icon: Code2,
    badge: "Staff Architect",
    placeholder:
      "Paste your SQL query, dbt model, or Python script to analyze Big-O, disk spill, index pruning, and get refactored code...",
    presets: [
      "Review this rolling window query: SELECT user_id, SUM(spend) OVER(PARTITION BY user_id ORDER BY trans_date) FROM orders",
      "Why is my Pandas iterrows() loop taking 15 minutes to compute distance between coordinates?",
      "How do I refactor a slow self-join into a high-performance dbt incremental model?",
      "How to optimize a query in Snowflake that is spilling to remote disk storage?",
    ],
  },
  {
    id: "resume_polish",
    label: "Resume Bullet Polisher",
    icon: FileText,
    badge: "Head of Data / Hiring Bar",
    placeholder:
      "Paste your rough job bullet point or project summary to transform it into Google's XYZ formula: Accomplished [X] as measured by [Y] by doing [Z]...",
    presets: [
      "Wrote SQL queries for sales dashboards and cleaned data with Python Pandas.",
      "Built a churn prediction model using scikit-learn that had 88% accuracy.",
      "Automated daily reporting by scheduling scripts in cron and sending Slack alerts.",
      "Analyzed customer retention and created Tableau reports for leadership.",
    ],
  },
  {
    id: "mock_interview",
    label: "Interactive Bar-Raiser",
    icon: Award,
    badge: "Bar Raiser Interviewer",
    placeholder:
      "Practice an interactive mock interview. Tell me the company or role, and I will pose a real case question and grade your response...",
    presets: [
      "Start a technical case interview for a Senior Data Analyst at a high-growth fintech startup.",
      "Ask me a difficult data modeling question about tracking user subscriptions over time.",
      "Test me on how to diagnose a sudden 15% drop in e-commerce checkout conversion rate.",
      "Ask me a tricky SQL problem involving ranking, ties, and division by zero.",
    ],
  },
];

export const AiMentorChat: React.FC = () => {
  const [activeMode, setActiveMode] = useState<MentorMode>("mentor");
  const [input, setInput] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `### Welcome to Your Staff Data Career & Architecture Mentor

I am your **Staff Data Scientist, Head of Analytics & Principal Data Engineer** advisor.

I am configured with 4 specialized execution modes to accelerate your career transition:
- 🧭 **Career & Transition Strategy**: Build a 60-day roadmap from Data Analyst to Data Scientist / Data Engineer.
- ⚡ **SQL & Python Code Optimizer**: Analyze query execution plans, prevent Snowflake/BigQuery memory spills, and get vectorized code.
- 📄 **Resume Bullet Polisher**: Transform basic analyst tasks into quantified **Google XYZ** leadership bullets.
- 🎯 **Interactive Bar-Raiser**: Simulate grueling technical screens with objective 1-10 scoring and edge-case follow-ups.

Select an execution mode above, click a suggested discussion topic, or ask any technical or architectural question below!`,
      mode: "mentor",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const currentModeConfig = MODES.find((m) => m.id === activeMode) || MODES[0];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: codeSnippet
        ? `${textToSend}\n\n\`\`\`\n${codeSnippet}\n\`\`\``
        : textToSend,
      mode: activeMode,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setCodeSnippet("");
    setShowCodeInput(false);
    setLoading(true);

    try {
      const res = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: textToSend,
          mode: activeMode,
          codeSnippet: codeSnippet || undefined,
          roleTarget: "Data Analyst transitioning to Data Scientist / Data Engineer",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
            mode: activeMode,
            isSimulated: data.isSimulated,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    } catch (err) {
      console.error("Mentor chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I encountered an issue processing your request. Please verify your connection or try again.",
          mode: activeMode,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportChat = () => {
    const markdown = messages
      .map(
        (m) =>
          `### [${m.role.toUpperCase()}] (${m.timestamp})\n\n${m.content}\n\n---\n`
      )
      .join("\n");
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DATA_MENTOR_SESSION_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear this conversation history?")) {
      setMessages([
        {
          role: "assistant",
          content: "Session cleared. What would you like to explore or optimize next?",
          mode: activeMode,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-stone-100 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Staff Data Mentor & Production Reviewer
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              AI Career Mentor & Technical Architecture Copilot
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Tailored specifically for Data Analysts stepping into Data Science and Data
              Engineering. Review SQL/Python execution plans, rewrite resume bullets with Google XYZ
              metrics, and simulate technical interview rounds.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportChat}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
              title="Download session notes as Markdown"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Notes</span>
            </button>
            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 border border-stone-700 transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Persona Mode Switcher */}
        <div className="mt-6 pt-4 border-t border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isSelected = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveMode(m.id);
                  setShowCodeInput(m.id === "code_review");
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-amber-400 text-stone-950 border-amber-400 font-bold shadow-xs"
                    : "bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700/80 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-stone-950" : "text-amber-400"}`} />
                <div className="overflow-hidden">
                  <div className="text-[10px] uppercase tracking-wider opacity-80 leading-none mb-0.5">
                    {m.badge}
                  </div>
                  <div className="text-xs truncate">{m.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Presets Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-stone-600">
            Recommended Inquiries for {currentModeConfig.label}:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentModeConfig.presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(preset)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 transition-colors border border-stone-200 text-left shadow-2xs hover:border-stone-400"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window Container */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg, idx) => {
            const isAssistant = msg.role === "assistant";
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-4xl ${
                  isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isAssistant
                      ? "bg-stone-900 text-amber-400"
                      : "bg-amber-100 text-amber-900 border border-amber-200"
                  }`}
                >
                  {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isAssistant
                      ? "bg-stone-50 border border-stone-200 text-stone-800"
                      : "bg-stone-900 text-stone-100"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans space-y-2">
                    {msg.content}
                  </div>

                  {isAssistant && (
                    <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-700">
                          {msg.isSimulated ? "Simulated Staff Engine" : "Gemini 3.8 Flash"}
                        </span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        className="flex items-center gap-1 hover:text-stone-900 font-medium transition-colors"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-700 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                <span>
                  Staff Mentor is reviewing technical architecture & best practices...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/50 space-y-2">
          {/* Optional Code Snippet Input Box */}
          {showCodeInput && (
            <div className="p-3 rounded-xl bg-stone-900 text-stone-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1.5 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Attach SQL Query / Python Script / Resume Text</span>
                </span>
                <button
                  onClick={() => setShowCodeInput(false)}
                  className="text-stone-400 hover:text-white text-[11px]"
                >
                  Close Code Box
                </button>
              </div>
              <textarea
                id="code-snippet-input"
                rows={3}
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="Paste code or text to review (e.g. SELECT * FROM fact_sales WHERE...)"
                className="w-full text-xs font-mono p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
              />
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              id="btn-toggle-code-box"
              onClick={() => setShowCodeInput(!showCodeInput)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors ${
                showCodeInput
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
              }`}
              title="Attach Code Snippet or Resume Text"
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">Attach Code</span>
            </button>

            <input
              type="text"
              id="ai-mentor-query-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentModeConfig.placeholder}
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900"
            />

            <button
              type="submit"
              id="btn-send-mentor-query"
              disabled={loading || (!input.trim() && !codeSnippet.trim())}
              className="px-5 py-2.5 rounded-xl bg-stone-900 text-stone-50 text-xs font-bold hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>Consult</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
