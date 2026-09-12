import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { BusinessCaseViewer } from "./components/BusinessCaseViewer";
import { PortfolioGenerator } from "./components/PortfolioGenerator";
import { CareerRoadmapView } from "./components/CareerRoadmapView";
import { InterviewArena } from "./components/InterviewArena";
import { AiMentorChat } from "./components/AiMentorChat";
import { Database, Sparkles, Layers, ShieldCheck, Github } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "cases" | "portfolio_gen" | "roadmap" | "interview" | "mentor"
  >("cases");
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.hasApiKey) {
          setHasApiKey(true);
        }
      })
      .catch((err) => console.error("Health check error:", err));
  }, []);

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans flex flex-col antialiased selection:bg-amber-200 selection:text-stone-900">
      {/* Top Navigation */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} hasApiKey={hasApiKey} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "cases" && <BusinessCaseViewer />}
        {activeTab === "portfolio_gen" && <PortfolioGenerator />}
        {activeTab === "roadmap" && <CareerRoadmapView />}
        {activeTab === "interview" && <InterviewArena />}
        {activeTab === "mentor" && <AiMentorChat />}
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-xs text-stone-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900">Data Career & Portfolio Studio</span>
            <span>•</span>
            <span>Architected for Modern Analysts, Data Scientists & Data Engineers</span>
          </div>

          <div className="flex items-center gap-4 text-stone-700">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Gemini 3.8 Flash Core</span>
            </span>
            <span>•</span>
            <span>SQL • dbt • Python • LightGBM • Airflow</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
