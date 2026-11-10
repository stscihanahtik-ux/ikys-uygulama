import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
} from "drizzle-orm/pg-core";

export interface LawArticle {
  articleNo: string;
  title: string;
  content: string;
  hrImpact: string;
}

export interface MethodComponent {
  title: string;
  description: string;
}

export interface ChatCitation {
  type: "kanun" | "teknik" | "metot" | "soru";
  ref: string;
  title: string;
}

export interface ChatFollowUp {
  label: string;
  prompt: string;
}

export const laws = pgTable("laws", {
  id: serial("id").primaryKey(),
  lawNumber: text("law_number").notNull().unique(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  summary: text("summary").notNull(),
  keyArticles: jsonb("key_articles").$type<LawArticle[]>().notNull(),
  practicalExample: text("practical_example").notNull(),
  dailyTips: jsonb("daily_tips").$type<string[]>().notNull(),
  keywords: jsonb("keywords").$type<string[]>().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const hrTopics = pgTable("hr_topics", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(), // 'technique' | 'method'
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  summary: text("summary").notNull(),
  stepsOrComponents: jsonb("steps_or_components").$type<MethodComponent[]>().notNull(),
  practicalExample: text("practical_example").notNull(),
  relatedLaws: jsonb("related_laws").$type<string[]>().notNull(),
  dailyTips: jsonb("daily_tips").$type<string[]>().notNull(),
  keywords: jsonb("keywords").$type<string[]>().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // 'kanun' | 'teknik' | 'metot'
  topicRef: text("topic_ref").notNull(),
  question: text("question").notNull(),
  shortAnswer: text("short_answer").notNull(),
  detailedAnswer: text("detailed_answer").notNull(),
  legalBasis: text("legal_basis").notNull(),
  exampleScenario: text("example_scenario").notNull(),
  difficulty: text("difficulty").notNull().default("Orta"),
  isUserCreated: boolean("is_user_created").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyInsights = pgTable("daily_insights", {
  id: serial("id").primaryKey(),
  insightDate: text("insight_date").notNull().unique(),
  sourceType: text("source_type").notNull(),
  sourceTitle: text("source_title").notNull(),
  headline: text("headline").notNull(),
  content: text("content").notNull(),
  exampleCase: text("example_case").notNull(),
  actionItem: text("action_item").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  isBookmarked: boolean("is_bookmarked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  itemType: text("item_type").notNull(),
  itemId: integer("item_id").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().default("default"),
  role: text("role").notNull(),
  content: text("content").notNull(),
  citations: jsonb("citations").$type<ChatCitation[]>().notNull().default([]),
  exampleBox: text("example_box"),
  mode: text("mode").notNull().default("detayli"),
  intent: text("intent").notNull().default("mevzuat"),
  followUps: jsonb("follow_ups").$type<ChatFollowUp[]>().notNull().default([]),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull(),
  known: boolean("known").notNull().default(false),
  chosenOption: text("chosen_option"),
  isCorrect: boolean("is_correct").notNull().default(false),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Kullanıcılar: yönetici ve kayıtlı üyeler. Şifreler scrypt ile hashlenir, asla düz metin saklanmaz.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  fullName: text("full_name").notNull().default(""),
  email: text("email").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // 'admin' | 'user'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  kind: text("kind").notNull().default("yenilik"), // yenilik | guncelleme | duyuru | bakim
  version: text("version").notNull().default(""),
  body: text("body").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const featureRequests = pgTable("feature_requests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  area: text("area").notNull().default("Diğer"),
  status: text("status").notNull().default("fikir"), // fikir | planlandi | gelistiriliyor | yayinda
  priority: text("priority").notNull().default("orta"), // dusuk | orta | yuksek
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// SGK işten ayrılış (çıkış nedeni) kodları
export const sgkCodes = pgTable("sgk_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull().default("diger"), // isci | isveren | yasal | diger
  severance: text("severance").notNull().default("hayir"), // evet | hayir | duruma_bagli
  unemployment: text("unemployment").notNull().default("hayir"), // evet | hayir | duruma_bagli
  lawRef: text("law_ref").notNull().default(""),
  description: text("description").notNull().default(""),
  notes: text("notes").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Çalışan kayıtları (yalnızca yönetici paneli; kişisel veri içerir)
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  department: text("department").notNull().default(""),
  jobTitle: text("job_title").notNull().default(""),
  contractType: text("contract_type").notNull().default("belirsiz"), // belirsiz | belirli
  startDate: text("start_date").notNull(), // YYYY-AA-GG
  endDate: text("end_date"), // YYYY-AA-GG | null
  grossSalary: doublePrecision("gross_salary").notNull().default(0),
  probationMonths: integer("probation_months").notNull().default(2),
  usedLeaveDays: integer("used_leave_days").notNull().default(0),
  exitCode: text("exit_code").notNull().default(""),
  kvkkNoticeDate: text("kvkk_notice_date").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
