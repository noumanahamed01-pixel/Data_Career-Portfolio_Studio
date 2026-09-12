import { SQL_QUESTIONS } from "./sqlQuestions";
import { BUSINESS_QUESTIONS } from "./businessQuestions";
import { STATS_QUESTIONS } from "./statsQuestions";
import { PYTHON_ML_QUESTIONS } from "./pythonMlQuestions";
import { DATA_ENGINEERING_QUESTIONS } from "./dataEngineeringQuestions";
import { AI_LLM_QUESTIONS } from "./aiQuestions";
import { InterviewQuestion } from "../../types";

export const ALL_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  ...SQL_QUESTIONS, // 15
  ...BUSINESS_QUESTIONS, // 15
  ...STATS_QUESTIONS, // 14
  ...PYTHON_ML_QUESTIONS, // 14
  ...DATA_ENGINEERING_QUESTIONS, // 14
  ...AI_LLM_QUESTIONS, // 3
];

export const QUESTION_CATEGORIES = [
  "All Categories",
  "Advanced SQL & Modeling",
  "Business Case & Metrics",
  "A/B Testing & Statistics",
  "Python & Machine Learning",
  "Data Engineering & Architecture",
] as const;

export const QUESTION_DIFFICULTIES = [
  "All Difficulties",
  "Junior",
  "Mid",
  "Senior",
  "Lead/Staff",
] as const;

export const TARGET_ROLES = [
  "All Roles",
  "Data Analyst",
  "Data Scientist",
  "Data Engineer",
] as const;
