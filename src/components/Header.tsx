import React from "react";
import { Sparkles, Database, Code2, LineChart, Target, Bot, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  activeTab: "cases" | "portfolio_gen" | "roadmap" | "interview" | "mentor";
  setActiveTab: (tab: "cases" | "portfolio_gen" | "roadmap" | "interview" | "mentor") => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, hasApiKey }) => {
  return (
    <header className="border-b border-stone-200 bg-stone-50/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-900 text-base tracking-tight">Data Career Studio</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Analyst → Analytics Eng → Data Eng
                </span>
              </div>
              <p className="text-xs text-stone-700 hidden sm:block">
                Production Analytics • dbt & Data Contracts • Expected ROI Decision Engines • Policy AI
              </p>
            </div>
          </div>

          {/* AI Status Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-200/70 border border-stone-300 text-xs text-stone-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="font-medium">Gemini 3.8 Flash</span>
              {hasApiKey ? (
                <span className="w-2 h-2 rounded-full bg-emerald-700" title="Connected" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-700" title="Simulator active" />
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-stone-200/60 no-scrollbar">
          <button
            id="tab-business-cases"
            onClick={() => setActiveTab("cases")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "cases"
                ? "bg-stone-900 text-stone-50 shadow-sm"
                : "text-stone-700 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>Real Business Cases</span>
          </button>

          <button
            id="tab-portfolio-generator"
            onClick={() => setActiveTab("portfolio_gen")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "portfolio_gen"
                ? "bg-stone-900 text-stone-50 shadow-sm"
                : "text-stone-700 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Portfolio Project Generator</span>
          </button>

          <button
            id="tab-career-roadmap"
            onClick={() => setActiveTab("roadmap")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "roadmap"
                ? "bg-stone-900 text-stone-50 shadow-sm"
                : "text-stone-700 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Analyst → DS/DE Roadmap</span>
          </button>

          <button
            id="tab-interview-arena"
            onClick={() => setActiveTab("interview")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "interview"
                ? "bg-stone-900 text-stone-50 shadow-sm"
                : "text-stone-700 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Interview Vault (75 Qs)</span>
          </button>

          <button
            id="tab-ai-mentor"
            onClick={() => setActiveTab("mentor")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "mentor"
                ? "bg-stone-900 text-stone-50 shadow-sm"
                : "text-stone-700 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Staff Career Mentor</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
