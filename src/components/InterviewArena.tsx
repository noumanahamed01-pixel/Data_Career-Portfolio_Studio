import React, { useState, useMemo, useEffect } from "react";
import {
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  Code2,
  Lightbulb,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronRight,
  HelpCircle,
  Copy,
  Layers,
  TrendingUp,
} from "lucide-react";
import {
  ALL_INTERVIEW_QUESTIONS,
  QUESTION_CATEGORIES,
  QUESTION_DIFFICULTIES,
  TARGET_ROLES,
} from "../data/questions";
import { InterviewQuestion } from "../types";

export const InterviewArena: React.FC = () => {
  // Modes: "study" (browse & master 75 questions) or "mock" (live AI bar-raiser grading)
  const [activeMode, setActiveMode] = useState<"study" | "mock">("study");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All Difficulties");
  const [selectedRole, setSelectedRole] = useState<string>("All Roles");

  // Selected Question for detail / mock test
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    ALL_INTERVIEW_QUESTIONS[0].id
  );

  // Mastered questions tracking (localStorage persisted)
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("data_interview_mastered");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Study view toggles
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Mock interview evaluation state
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  useEffect(() => {
    try {
      localStorage.setItem("data_interview_mastered", JSON.stringify(masteredIds));
    } catch (e) {
      console.error("Failed to save mastered status", e);
    }
  }, [masteredIds]);

  // Filtered Questions List
  const filteredQuestions = useMemo(() => {
    return ALL_INTERVIEW_QUESTIONS.filter((q) => {
      // Category filter
      if (selectedCategory !== "All Categories" && q.category !== selectedCategory) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== "All Difficulties" && q.difficulty !== selectedDifficulty) {
        return false;
      }
      // Role filter
      if (
        selectedRole !== "All Roles" &&
        q.role !== selectedRole &&
        q.role !== "Cross-Functional"
      ) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText =
          q.question.toLowerCase().includes(query) ||
          q.context.toLowerCase().includes(query) ||
          q.tags.some((t) => t.toLowerCase().includes(query)) ||
          q.modelAnswer.toLowerCase().includes(query);
        if (!matchesText) return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedRole]);

  // Current active question
  const currentQ = useMemo(() => {
    return (
      ALL_INTERVIEW_QUESTIONS.find((q) => q.id === selectedQuestionId) ||
      filteredQuestions[0] ||
      ALL_INTERVIEW_QUESTIONS[0]
    );
  }, [selectedQuestionId, filteredQuestions]);

  const toggleMastered = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMasteredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleRevealAnswer = (id: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleEvaluate = async () => {
    if (!candidateAnswer.trim()) return;
    setIsEvaluating(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/gemini/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: currentQ.role,
          round: currentQ.category,
          candidateAnswer,
          questionId: currentQ.question,
        }),
      });
      const data = await res.json();
      if (data.success && data.feedback) {
        setFeedback(data.feedback);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Stats */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-stone-100 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Staff-Level Question Bank & Bar Raiser
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              Data Analyst, Data Scientist & Data Engineer Interview Vault
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Master <strong>75 curated questions</strong> spanning Advanced SQL, Product Metrics,
              A/B Testing, Predictive ML, and Modern Data Engineering Pipelines. Study verified
              model answers or test yourself with live AI evaluation.
            </p>
          </div>

          {/* Progress Tracker Pill */}
          <div className="flex items-center gap-4 bg-stone-800/80 p-4 rounded-xl border border-stone-700/60 shrink-0">
            <div>
              <div className="text-xs text-stone-400 font-medium">Mastered Progress</div>
              <div className="text-xl font-mono font-bold text-amber-400">
                {masteredIds.length}{" "}
                <span className="text-xs text-stone-400 font-normal">
                  / {ALL_INTERVIEW_QUESTIONS.length} Questions
                </span>
              </div>
            </div>
            <div className="w-16 bg-stone-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(masteredIds.length / ALL_INTERVIEW_QUESTIONS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between flex-wrap gap-3">
          <div className="inline-flex p-1 bg-stone-800/90 rounded-xl border border-stone-700 text-xs font-semibold">
            <button
              id="tab-study-mode"
              onClick={() => setActiveMode("study")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeMode === "study"
                  ? "bg-amber-400 text-stone-950 shadow-xs"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Study & Model Answers (75 Questions)</span>
            </button>
            <button
              id="tab-mock-mode"
              onClick={() => setActiveMode("mock")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeMode === "mock"
                  ? "bg-amber-400 text-stone-950 shadow-xs"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live AI Bar-Raiser Practice</span>
            </button>
          </div>

          <div className="text-xs text-stone-400">
            Showing <strong className="text-stone-200">{filteredQuestions.length}</strong> of{" "}
            {ALL_INTERVIEW_QUESTIONS.length} questions
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="search-questions-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SQL, Window, Churn, dbt..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-stone-800 text-stone-900"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-stone-800 text-stone-900"
            >
              {QUESTION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              id="filter-difficulty"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-stone-800 text-stone-900"
            >
              {QUESTION_DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>

          {/* Target Role Filter */}
          <div>
            <select
              id="filter-role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-stone-800 text-stone-900"
            >
              {TARGET_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Quick Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100">
          <span className="text-[11px] font-semibold text-stone-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Quick Filter:
          </span>
          {QUESTION_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors ${
                  isSelected
                    ? "bg-stone-900 text-white font-medium shadow-xs"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* MODE 1: STUDY & MODEL ANSWERS */}
      {activeMode === "study" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question List Column */}
          <div className="lg:col-span-5 space-y-2 max-h-[850px] overflow-y-auto pr-1">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center bg-white border border-stone-200 rounded-2xl text-xs text-stone-500">
                No questions found matching your filter criteria. Try adjusting the search.
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isSelected = q.id === currentQ.id;
                const isMastered = masteredIds.includes(q.id);

                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-stone-900 text-stone-50 border-stone-900 shadow-md ring-1 ring-stone-900/20"
                        : "bg-white text-stone-800 border-stone-200 hover:border-stone-400 hover:bg-stone-50/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-stone-800 text-amber-300"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {q.category}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            q.difficulty === "Junior"
                              ? "bg-emerald-100 text-emerald-800"
                              : q.difficulty === "Mid"
                              ? "bg-blue-100 text-blue-800"
                              : q.difficulty === "Senior"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-purple-100 text-purple-900"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>

                      <button
                        onClick={(e) => toggleMastered(q.id, e)}
                        title={isMastered ? "Mark as Incomplete" : "Mark as Mastered"}
                        className={`text-xs p-1 rounded-md transition-colors ${
                          isMastered
                            ? "text-emerald-500 bg-emerald-950/40"
                            : isSelected
                            ? "text-stone-500 hover:text-stone-300"
                            : "text-stone-400 hover:text-stone-600"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold leading-snug line-clamp-2">{q.question}</h4>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100/20 text-[11px]">
                      <span className={isSelected ? "text-stone-400" : "text-stone-500"}>
                        {q.role}
                      </span>
                      {isMastered && (
                        <span className="text-emerald-500 font-semibold text-[10px]">
                          ✓ Mastered
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Question Details Column */}
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
            {/* Header with Title & Action */}
            <div className="pb-4 border-b border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900">
                    {currentQ.category}
                  </span>
                  <span className="text-xs text-stone-500">
                    • {currentQ.difficulty} Level • {currentQ.role}
                  </span>
                </div>

                <button
                  id="btn-toggle-mastered"
                  onClick={() => toggleMastered(currentQ.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    masteredIds.includes(currentQ.id)
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {masteredIds.includes(currentQ.id) ? "Mastered" : "Mark as Mastered"}
                  </span>
                </button>
              </div>

              <h3 className="text-lg font-bold text-stone-900 leading-snug">
                {currentQ.question}
              </h3>
              <p className="text-xs text-stone-600 mt-1.5">{currentQ.context}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {currentQ.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Model Answer Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-stone-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                    Model Senior/Staff-Level Answer
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(currentQ.modelAnswer, currentQ.id)}
                    className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 font-medium"
                  >
                    {copiedCodeId === currentQ.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedCodeId === currentQ.id ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    onClick={() => toggleRevealAnswer(currentQ.id)}
                    className="flex items-center gap-1 text-xs text-amber-700 font-semibold hover:underline"
                  >
                    {revealedAnswers[currentQ.id] !== false ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {revealedAnswers[currentQ.id] !== false ? "Hide Answer" : "Reveal Answer"}
                    </span>
                  </button>
                </div>
              </div>

              {revealedAnswers[currentQ.id] !== false ? (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {currentQ.modelAnswer}
                </div>
              ) : (
                <div
                  onClick={() => toggleRevealAnswer(currentQ.id)}
                  className="p-8 rounded-xl bg-stone-50 border border-dashed border-stone-300 text-center cursor-pointer hover:bg-stone-100/60 transition-colors"
                >
                  <Eye className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                  <p className="text-xs text-stone-600 font-medium">
                    Answer hidden for self-testing. Click anywhere to reveal model answer.
                  </p>
                </div>
              )}
            </div>

            {/* Senior Tips & Rookie Pitfalls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Senior Tips */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                  <Lightbulb className="w-4 h-4 text-emerald-700" />
                  <span>Senior/Staff Tips (How to Stand Out)</span>
                </div>
                <ul className="space-y-1.5">
                  {currentQ.seniorTips.map((tip, idx) => (
                    <li key={idx} className="text-xs text-emerald-950 flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 shrink-0 mt-1.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pitfalls to Avoid */}
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 uppercase tracking-wider mb-2">
                  <AlertCircle className="w-4 h-4 text-rose-700" />
                  <span>Common Pitfalls (Rookie Traps)</span>
                </div>
                <ul className="space-y-1.5">
                  {currentQ.pitfalls.map((pit, idx) => (
                    <li key={idx} className="text-xs text-rose-950 flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-700 shrink-0 mt-1.5" />
                      <span>{pit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Test in Bar-Raiser Arena CTA */}
            <div className="pt-2 flex items-center justify-between border-t border-stone-100">
              <span className="text-xs text-stone-500">Want to test your own response?</span>
              <button
                onClick={() => {
                  setActiveMode("mock");
                  setCandidateAnswer("");
                  setFeedback(null);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-900 hover:text-amber-600 transition-colors"
              >
                <span>Practice this question in AI Bar-Raiser</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: LIVE AI BAR-RAISER PRACTICE */}
      {activeMode === "mock" && (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="pb-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900">
                  {currentQ.category}
                </span>
                <span className="text-xs text-stone-500">
                  • {currentQ.difficulty} • Target: {currentQ.role}
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 leading-snug">
                {currentQ.question}
              </h3>
            </div>

            <button
              onClick={() => setActiveMode("study")}
              className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 shrink-0 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Back to Question Bank</span>
            </button>
          </div>

          {/* Context & Hints */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                Scenario Context
              </h4>
              <p className="text-xs text-stone-700">{currentQ.context}</p>
            </div>
            <div className="sm:max-w-xs p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 shrink-0">
              <strong>Interviewer Hint:</strong> {currentQ.hint}
            </div>
          </div>

          {/* Answer Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Your Candidate Response (Simulate a Real Technical Interview)
            </label>
            <textarea
              id="mock-candidate-answer-textarea"
              rows={7}
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              placeholder="Structure your answer clearly:
1. State your high-level approach and key assumptions.
2. Outline specific formulas, SQL window logic, or ML algorithms.
3. Address edge cases, data sanity checks, and business ROI impact..."
              className="w-full text-xs sm:text-sm p-4 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-stone-900 placeholder:text-stone-400 leading-relaxed font-sans"
            />

            <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
              <span>{candidateAnswer.length} characters</span>
              <button
                id="btn-submit-mock-answer"
                onClick={handleEvaluate}
                disabled={isEvaluating || !candidateAnswer.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-stone-50 font-bold text-xs hover:bg-stone-800 transition-all shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isEvaluating ? "Bar-Raiser is Evaluating..." : "Grade My Response"}</span>
              </button>
            </div>
          </div>

          {/* AI Bar-Raiser Feedback Output */}
          {feedback && (
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
              {/* Score Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center text-lg font-bold font-mono">
                    {feedback.overallScore}/10
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">Interviewer Assessment</h4>
                    <p className="text-xs text-stone-600">
                      {feedback.overallScore >= 8
                        ? "Strong Hire / Above Hiring Bar"
                        : feedback.overallScore >= 6
                        ? "Leaning Hire / Solid Foundation with Edge Cases to Tighten"
                        : "Needs Deeper Technical & Business Grounding"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Strengths & Areas to Improve */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-emerald-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Key Strengths</span>
                  </div>
                  <ul className="space-y-1.5">
                    {feedback.strengths?.map((s: string, idx: number) => (
                      <li key={idx} className="text-xs text-stone-700 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 shrink-0 mt-1.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white border border-amber-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span>Areas for Improvement</span>
                  </div>
                  <ul className="space-y-1.5">
                    {feedback.areasToImprove?.map((a: string, idx: number) => (
                      <li key={idx} className="text-xs text-stone-700 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0 mt-1.5" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Ideal Staff-Level Reference */}
              <div className="p-4 rounded-xl bg-white border border-stone-200">
                <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                  Staff-Level Reference Approach:
                </h5>
                <p className="text-xs text-stone-800 leading-relaxed">
                  {feedback.idealAnswerSummary}
                </p>
              </div>

              {/* Tough Follow-up Question */}
              {feedback.followUpQuestion && (
                <div className="p-4 rounded-xl bg-stone-900 text-stone-100">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                    <ChevronRight className="w-4 h-4" />
                    <span>Interviewer Follow-Up Curveball:</span>
                  </div>
                  <p className="text-xs text-stone-200 font-medium leading-relaxed">
                    "{feedback.followUpQuestion}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
