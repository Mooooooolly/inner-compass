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