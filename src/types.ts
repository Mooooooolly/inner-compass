export type ViewState = 'editor' | 'list' | 'collections';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  isBookmarked?: boolean; // 新增：紀錄這則訊息是否被收藏
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  createdAt: number;
  updatedAt?: number; // ✨ 新增：更新時間戳記 (設為可選，以相容舊資料)
  hasCoachInteraction: boolean;
  messages: Message[];
}

// ✨ 用於資源控管與對話次數追蹤的資料結構
export interface UsageData {
  lastUpdateDate: string;     // 儲存格式如 "2023-10-27"
  totalDailyCount: number;    // 當日總計對話次數 (上限 20)
}
