"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bookmark } from 'lucide-react';
import { Message } from '../../types';

interface CoachModalProps {
  onClose: () => void;
  messages: Message[];
  onAddMessage: (msg: Message) => void;
  onToggleBookmark: (index: number) => void;
  journalContent: string;
}

export const CoachModal: React.FC<CoachModalProps> = ({ 
  onClose, 
  messages, 
  onAddMessage, 
  onToggleBookmark,
  journalContent 
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);

  // 自動捲動
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // 🧠 AI 核心邏輯
  useEffect(() => {
    // 定義一個共用的 API 呼叫函式
    const callAI = async (userMessage: string) => {
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
          throw new Error(data.reply || `API 請求失敗 (${response.status})`);
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

    // 1. ✨ 自動開場：如果是空白對話，發送一個「隱藏指令」讓 AI 開場
    if (messages.length === 0 && !isProcessingRef.current) {
      // 這裡傳送的文字是給 AI 看的提示，不會顯示在對話框中（因為這是 assistant 的第一句話）
      const systemPrompt = "（請閱讀我的日記，並直接給我一個簡短、溫暖的開場提問，引導我探索這份感受。請直接提問，不要複述日記內容，也不要說你好。）";
      callAI(systemPrompt);
    }

    // 2. 💬 使用者回覆後：正常的對話流程
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'user' && !isTyping && !isProcessingRef.current) {
      callAI(lastMsg.content);
    }

  }, [messages, isTyping, onAddMessage, journalContent]);

  const handleSend = () => {
    if (!input.trim()) return;
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
              <h3 className="font-serif-tc font-bold text-stone-900">內在智慧羅盤</h3>
              <p className="text-xs text-stone-500">深度探索與引導</p>
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

        <div className="p-4 bg-white border-t border-stone-100 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="在這裡回應你的內在聲音..."
            className="flex-1 bg-stone-50 border-none rounded-lg px-4 py-3 text-stone-800 focus:ring-1 focus:ring-stone-200 outline-none font-serif-tc placeholder:text-stone-300"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 text-stone-400 hover:text-[#2f4f2f] transition-colors disabled:opacity-30"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};