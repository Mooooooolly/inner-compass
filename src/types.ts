export type ViewState = 'editor' | 'list' | 'collections';

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isBookmarked?: boolean;
};

export type JournalEntry = {
  id: string;
  date: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  hasCoachInteraction: boolean;
  messages?: Message[];
};

export type UsageData = {
  lastUpdateDate: string;
  totalDailyCount: number;
  sessionCounts: { [sessionId: string]: number };
};

// src/types.ts

export type DailySummary = {
  summary_date: string; // YYYY-MM-DD
  generated_at: string; // ISO 8601
  activity_stats: {
    diaries_added: number;
    diaries_deleted: number;
    conversation_started: boolean;
    daily_limit_reached: boolean;
  };
  impacted_diaries: {
    diary_date: string; // YYYY-MM-DD
    sentiment_tags: string[];
    iceberg_depth: 'surface' | 'deeper' | 'core';
    topic_keywords: string[];
    key_quotes: string[];
  }[];
};

export type WeeklyReport = {
  report_date: string; // YYYY-MM-DD, a Monday
  week_label: string; // e.g., "6/24-6/30"
  total_diaries_analyzed: number;
  keyword_ranking: { word: string; count: number }[];
  sentiment_ranking: { sentiment: string; count: number }[];
  plant_name: string;
  weekly_insight: string;
  turning_point?: string; // This field is now optional
  image_url: string; // Can be a local path or empty
};
