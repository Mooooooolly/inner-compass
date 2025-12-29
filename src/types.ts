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
  hasCoachInteraction: boolean;
  messages: Message[];
}