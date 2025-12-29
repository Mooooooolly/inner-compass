export type ViewState = 'editor' | 'list' | 'collections';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  createdAt: number;
  hasCoachInteraction: boolean;
  messages: Message[];
}