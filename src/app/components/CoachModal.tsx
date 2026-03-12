'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Bookmark, AlertCircle, Loader2 } from 'lucide-react';
import { Message, UsageData } from '@/types';

const TypingIndicator = () => (
  <div className="flex items-center space-x-2">
    <span className="w-2 h-2 bg-stone-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
    <span className="w-2 h-2 bg-stone-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
    <span className="w-2 h-2 bg-stone-400 rounded-full animate-pulse"></span>
  </div>
);

export const CoachModal = ({ 
  messages, 
  onClose, 
  onAddMessage, 
  onToggleBookmark,
  journalContent, 
  usage 
}: { 
  messages: Message[]; 
  onClose: () => void; 
  onAddMessage: (msg: Message) => void;
  onToggleBookmark: (index: number) => void;
  journalContent: string;
  usage: UsageData;
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(messages.length === 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalDailyLimit = 7;
  const remainingMessages = Math.max(0, totalDailyLimit - usage.totalDailyCount);
  const limitReached = remainingMessages <= 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInitialMessage = async () => {
    setIsLoading(true);
    const systemMessage: Message = {
      role: 'system',
      content: `(系統訊息) 我是你的內在智慧，準備好後，點擊下方按鈕，我會閱讀你的文字，並提出第一個問題。`,
    };
    onAddMessage(systemMessage);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalContent, messages: [] }),
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      const aiMessage: Message = { role: 'assistant', content: data.message };
      onAddMessage(aiMessage);

    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: 'assistant', content: '抱歉，我現在無法回應。請稍後再試。' };
      onAddMessage(errorMessage);
    } finally {
      setIsLoading(false);
      setIsFirstMessage(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || limitReached) return;

    const newUserMessage: Message = { role: 'user', content: input };
    onAddMessage(newUserMessage);
    setInput('');
    setIsLoading(true);

    const messageHistory = [...messages, newUserMessage];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalContent, messages: messageHistory }),
      });

      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      const aiMessage: Message = { role: 'assistant', content: data.message };
      onAddMessage(aiMessage);

    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: 'assistant', content: '抱歉，我現在無法回應。請稍後再試。' };
      onAddMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col border border-stone-200">
        <header className="flex items-center justify-between p-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2f4f2f]" />
            <h2 className="text-lg font-serif-tc font-bold text-stone-800">內在智慧</h2>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#eef3ed] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#2f4f2f]" />
                </div>
              )}
              <div className={`flex items-start gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-4 rounded-xl font-serif-tc text-stone-700 ${msg.role === 'user' ? 'bg-stone-100' : 'bg-[#f7f9f7]'}`}>
                  {msg.content}
                </div>
                {msg.role === 'assistant' && !msg.content.startsWith('(系統訊息)') && (
                   <button onClick={() => onToggleBookmark(index)} className="p-2 text-stone-300 hover:text-yellow-500 rounded-full mt-1.5">
                     <Bookmark className={`w-4 h-4 ${msg.isBookmarked ? 'fill-yellow-400 text-yellow-500' : ''}`} />
                   </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-[#eef3ed] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#2f4f2f]" />
                </div>
               <div className="p-4 rounded-xl bg-[#f7f9f7]">
                 <TypingIndicator />
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {isFirstMessage ? (
          <footer className="p-4 border-t border-stone-100 shrink-0">
             <div className="flex flex-col items-center justify-center text-center p-6 bg-stone-50/70 rounded-lg">
                <p className="text-stone-500 font-serif-tc text-sm mb-4">
                  (系統訊息) 我是你的內在智慧，準備好後，點擊下方按鈕，我會閱讀你的文字，並提出第一個問題。
                </p>
                <button 
                  onClick={handleInitialMessage}
                  disabled={isLoading}
                  className="bg-stone-900 text-white font-serif-tc px-6 py-2.5 rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> 正在分析...</> : '準備好了，開始對話'}
                </button>
            </div>
          </footer>
        ) : limitReached ? (
           <footer className="p-4 border-t border-stone-100 shrink-0">
             <div className="flex flex-col items-center justify-center text-center p-6 bg-yellow-50/70 rounded-lg border border-yellow-200/50">
                <h3 className="font-bold font-serif-tc text-yellow-900 mb-1">今天的對話結束了</h3>
                <p className="text-yellow-700/80 font-serif-tc text-sm mb-4">
                  我們今天已經聊了很多，讓這些想法沉澱一下吧。明天我們再繼續探索。
                </p>
                <button 
                  onClick={onClose}
                  className="bg-yellow-800/80 text-white font-serif-tc px-6 py-2 rounded-lg hover:bg-yellow-800/100 transition-colors"
                >
                  好的，明天見
                </button>
            </div>
          </footer>
        ) : (
          <footer className="p-4 border-t border-stone-100 shrink-0">
            <div className="flex items-center gap-2">
              <div className="text-xs text-stone-400 font-mono px-2 py-1 rounded bg-stone-100">
                {remainingMessages}/{totalDailyLimit}
              </div>
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="輸入你的回應..."
                className="flex-1 bg-stone-100 rounded-lg px-4 py-3 outline-none text-stone-800 font-serif-tc focus:ring-1 focus:ring-stone-300"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="w-11 h-11 bg-stone-900 text-white rounded-lg flex items-center justify-center shrink-0 hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};