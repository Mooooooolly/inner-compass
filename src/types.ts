export type ViewState = 'editor' | 'list' | 'collections';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  isBookmarked?: boolean; // 紀錄這則訊息是否被收藏
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  createdAt: number;
  updatedAt?: number; // 更新時間戳記
  hasCoachInteraction: boolean;
  messages: Message[];
}

/**
 * ✨ 頻寬管理 (Usage Control)
 * 用於追蹤每日總量與單篇日記的對話次數
 */
export interface UsageData {
  lastUpdateDate: string;     // 儲存格式如 "2026-02-24"
  totalDailyCount: number;    // 當日總計對話次數 (上限 20)
  sessionCounts: {            // 單篇日記的對話次數紀錄 (上限 10)
    [diaryId: string]: number;
  };
}

/**
 * ✨ 每日足跡摘要 (Daily Footprint Summary)
 * 隔日早晨生成的批次處理報告
 */
export interface DailySummary {
  summary_date: string;       // 摘要所屬日期 (昨日)
  generated_at: string;       // 生成的時間戳記 (今日早晨)
  activity_stats: {
    diaries_added: number;
    diaries_deleted: number;
    conversation_started: boolean;
    daily_limit_reached: boolean;
  };
  impacted_diaries: {
    diary_date: string;
    sentiment_tags: string[];
    iceberg_depth: string;    // 薩提爾冰山深度指標
    topic_keywords: string[];
    key_quotes: string[];     // 昨日該日記的所有典藏金句陣列
  }[];
}