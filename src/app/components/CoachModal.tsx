"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bookmark } from 'lucide-react';
import { Message, UsageData } from '../../types';
import { getUsageData } from '@/lib/usage';

interface CoachModalProps {
  onClose: () => void;
  messages: Message[];
  onAddMessage: (msg: Message) => void;
  onToggleBookmark: (index: number) => void;
  journalContent: string;
  usage: UsageData;
}

// ✨ 用量圓點元件 (7次)
const UsageDots = ({ count }: { count: number }) => {
  const dots = Array.from({ length: 7 }, (_, i) => (
    <div
      key={i}
      className={`w-1.5 h-1.5 rounded-full transition-colors ${i < count ? 'bg-[#2f4f2f]' : 'bg-stone-200'}`}
    />
  ));
  return <div className="flex items-center gap-1.5">{dots}</div>;
};

export const CoachModal: React.FC<CoachModalProps> = ({
  onClose,
  messages,
  onAddMessage,
  onToggleBookmark,
  journalContent,
  usage
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);

  const isUsageLimited = usage.totalDailyCount >= 7; // 改為 7 次

  // 自動捲動
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // 🧠 AI 核心邏輯
  useEffect(() => {
    const callAI = async (userMessage: string) => {
      if (isProcessingRef.current || usage.totalDailyCount >= 7) return; // 改為 7 次

      isProcessingRef.current = true;
      setIsTyping(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            journalContent: journalContent,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          let errorMessage = `API 請求失敗 (${response.status})`;
          if (response.status === 429) {
            errorMessage = "今日探索頻寬已滿載。"
          } else if (data.reply) {
            errorMessage = data.reply;
          }
          
          onAddMessage({ role: 'assistant', content: `(系統訊息) ${errorMessage}` });
          return; 
        }

        onAddMessage({ role: 'assistant', content: data.reply });

      } catch (error: any) {
        console.error(error);
        onAddMessage({
          role: 'assistant',
          content: `(系統訊息) ${error.message || "抱歉，連線發生未知錯誤。"}`
        });
      } finally {
        setIsTyping(false);
        setTimeout(() => { isProcessingRef.current = false; }, 100);
      }
    };

    if (messages.length === 0 && !isProcessingRef.current) {
      const systemPrompt = "（請閱讀我的日記，並給我一個簡短、溫暖的開場提問，引導我探索這份感受。可以適時同理我的感受，或引用部分日記內容，若日記是一片空白，還是可以從「空白」提問，但不要說你好，也不會使用「您」。）";
      callAI(systemPrompt);
    }

    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'user' && !isTyping && !isProcessingRef.current) {
      callAI(lastMsg.content);
    }

  }, [messages, onAddMessage, journalContent, usage.totalDailyCount]);

  const handleSend = () => {
    if (!input.trim() || isUsageLimited) return;
    onAddMessage({ role: 'user', content: input });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl h-[600px] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-[#fdfcf8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2f4f2f] rounded-lg flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-tc font-bold text-stone-900">
                內在智慧羅盤
              </h3>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <p>今日探索頻寬</p>
                <UsageDots count={usage.totalDailyCount} />
                <span>{usage.totalDailyCount}/7</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fdfcf8]">
           {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start group'}`}>
              <div className={`relative max-w-[85%] p-4 rounded-2xl text-base leading-relaxed font-serif-tc shadow-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-stone-800 text-white rounded-br-none'
                  : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none pr-10'
              }`}>
                {msg.content}
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => onToggleBookmark(idx)}
                    className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
                      msg.isBookmarked ? 'opacity-100 text-[#2f4f2f] bg-stone-100' : 'text-stone-300 hover:text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${msg.isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-300">
               <div className="bg-white border border-stone-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                 <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-150"></span>
               </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-stone-100">
          {isUsageLimited ? (
            <div className="text-center text-sm text-stone-500 font-serif-tc px-4 py-3 bg-stone-50 rounded-lg shadow-sm">
              今日的 7 次對話讓我們看見了珍貴的內在風景。讓這些發現靜靜沉澱，我們明天再繼續探索。
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="在這裡，與內在的聲音共振..."
                className="flex-1 bg-stone-50 border-none rounded-lg px-4 py-3 text-stone-800 focus:ring-1 focus:ring-stone-200 outline-none font-serif-tc placeholder:text-stone-300"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-3 text-stone-400 hover:text-[#2f4f2f] transition-colors disabled:opacity-30"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
