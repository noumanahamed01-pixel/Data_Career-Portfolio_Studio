export type CareerPath = "data_analyst" | "analytics_engineer" | "data_engineer" | "data_scientist";

export interface BusinessCase {
  id: string;
  title: string;
  domain: string;
  roleRelevance: {
    analyst: string;
    dataScientist: string;
    dataEngineer: string;
  };
  summary: string;
  businessProblem: {
    context: string;
    baselineLoss: string;
    targetKPIs: string[];
    stakeholders: string[];
  };
  sqlLab: {
    title: string;
    description: string;
    technique: string;
    sampleSchema: {
      tableName: string;
      columns: { name: string; type: string; desc: string }[];
    }[];
    queries: {
      name: string;
      description: string;
      sql: string;
      mockResults: Record<string, any>[];
      optimizationNote: string;
    }[];
  };
  predictiveModel: {
    modelType: string;
    framework: string;
    pythonCode: string;
    features: { name: string; importance: number; type: string; description: string }[];
    metrics: { name: string; value: string; benchmark: string; businessInterpretation: string }[];
    thresholdSimulation: {
      defaultThreshold: number;
      minThreshold: number;
      maxThreshold: number;
      simulate: (threshold: number) => {
        precision: number;
        recall: number;
        costSaved: number;
        outreachCost: number;
        netBenefit: number;
      };
    };
  };
  automatedPipeline: {
    orchestrator: string;
    layers: {
      name: string;
      tech: string;
      description: string;
      dataContracts: string[];
    }[];
    dagTasks: { id: string; name: string; type: "ingest" | "transform" | "test" | "model" | "alert"; status: "success" | "running" | "idle" }[];
    dbtSnippet: string;
  };
  llmAugmentation: {
    name: string;
    role: string;
    promptTemplate: string;
    sampleInput: Record<string, any>;
    sampleOutput: {
      structuredInsights: string[];
      executiveSummary: string;
      suggestedAction: string;
    };
  };
  dashboardData: {
    timeSeries: { date: string; actual: number; predicted?: number; baseline: number }[];
    cohortMatrix?: { cohort: string; m0: number; m1: number; m2: number; m3: number; m4: number }[];
    distributionData?: { category: string; count: number; riskRate: number }[];
  };
}

export interface RoadmapStep {
  stage: string;
  title: string;
  targetRole: "Analyst" | "Analytics Engineer" | "Data Engineer" | "Data Scientist" | "Cross-Functional";
  timeframe: string;
  keySkills: string[];
  portfolioMustHaves: string[];
  aiEraDifferentiators: string[];
  recommendedProjects: string[];
}

export interface GeneratedProject {
  title: string;
  domain: string;
  difficulty: string;
  businessProblem: string;
  kpis: string[];
  pipelineArchitecture: {
    ingestion: string;
    transformation: string;
    featureStore: string;
    modeling: string;
    llmIntegration: string;
    dashboard: string;
  };
  sqlSnippet: string;
  pythonSnippet: string;
  llmTask: string;
}

export interface InterviewQuestion {
  id: string;
  role: "Data Analyst" | "Data Scientist" | "Data Engineer" | "Cross-Functional";
  category:
    | "Advanced SQL & Modeling"
    | "Business Case & Metrics"
    | "A/B Testing & Statistics"
    | "Python & Machine Learning"
    | "Data Engineering & Architecture";
  difficulty: "Junior" | "Mid" | "Senior" | "Lead/Staff";
  question: string;
  context: string;
  modelAnswer: string;
  seniorTips: string[];
  pitfalls: string[];
  tags: string[];
  codeSnippet?: string;
  evaluationCriteria: string[];
  hint: string;
}
