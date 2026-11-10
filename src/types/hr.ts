import type { LawArticle, MethodComponent, ChatCitation, ChatFollowUp } from "@/db/schema";

export type WorkspaceTab =
  | "daily"
  | "laws"
  | "techniques"
  | "methods"
  | "questions"
  | "calculators"
  | "templates"
  | "sgk"
  | "quiz"
  | "downloads";

export interface LawItem {
  id: number;
  lawNumber: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  keyArticles: LawArticle[];
  practicalExample: string;
  dailyTips: string[];
  keywords: string[];
  sortOrder: number;
}

export interface HrTopicItem {
  id: number;
  slug: string;
  type: "technique" | "method";
  title: string;
  subtitle: string;
  summary: string;
  stepsOrComponents: MethodComponent[];
  practicalExample: string;
  relatedLaws: string[];
  dailyTips: string[];
  keywords: string[];
  sortOrder: number;
}

export interface QuestionItem {
  id: number;
  category: "kanun" | "teknik" | "metot";
  topicRef: string;
  question: string;
  shortAnswer: string;
  detailedAnswer: string;
  legalBasis: string;
  exampleScenario: string;
  difficulty: "Temel" | "Orta" | "İleri";
  isUserCreated: boolean;
  createdAt: string;
}

export interface DailyInsightItem {
  id: number;
  insightDate: string;
  sourceType: "kanun" | "teknik" | "metot";
  sourceTitle: string;
  headline: string;
  content: string;
  exampleCase: string;
  actionItem: string;
  isRead: boolean;
  isBookmarked: boolean;
}

export interface BookmarkItem {
  id: number;
  itemType: "law" | "technique" | "method" | "question";
  itemId: number;
  title: string;
  createdAt: string;
}

export interface ChatMessageItem {
  id: number;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  citations: ChatCitation[];
  exampleBox: string | null;
  mode?: string;
  intent?: string;
  followUps?: ChatFollowUp[];
  feedback?: string | null;
  createdAt: string;
}

export interface SgkCodeItem {
  id: number;
  code: string;
  title: string;
  category: string;
  severance: string;
  unemployment: string;
  lawRef: string;
  description: string;
  notes: string;
  sortOrder: number;
}
