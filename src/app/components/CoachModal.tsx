"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bookmark } from 'lucide-react';
import { Message } from '../../types';

interface CoachModalProps {
  onClose: () => void;
  messages: Message[];
  onAddMessage: (msg: Message) => void;
  onToggleBookmark: (index: number) => void;
  journalContent: string; // ✨ 新增：讓教練讀得到日記內容
}

const AI_RESPONSES = [
  "這是一個很有趣的角度，當你這麼想的時候，心裡是什麼感覺？",
  "如果把這個情況暫停一下，你覺得最核心的糾結點在哪裡？",
  "聽起來這對你很重要。這讓你聯想到了過去的什麼經驗嗎？",
  "試著深呼吸一下。如果此刻不急著找答案，你會想對自己說什麼？",
  "這份感受背後，是不是藏著一個你很重視的價值觀？",
];

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
    // 情況一：完全沒有訊息 -> AI 要發起第一句話 (Initial Greeting)
    if (messages.length === 0 && !isProcessingRef.current) {
      isProcessingRef.current = true;
      setIsTyping(true); // 顯示 AI 正在輸入...

      // 模擬 AI 閱讀日記並思考的時間
      setTimeout(() => {
        // 擷取日記前段作為引言，增加真實感
        const snippet = journalContent.slice(0, 15) + (journalContent.length > 15 ? "..." : "");
        const greeting = journalContent.trim() 
          ? `我讀了你寫的「${snippet}」。\n\n這段文字裡似乎藏著一些情緒，你現在感覺身體哪個部位最有感覺？`
          : "我看見你打開了日記，但還沒寫下文字。現在的心情還好嗎？想聊聊嗎？";

        onAddMessage({ role: 'assistant', content: greeting });
        setIsTyping(false);
        
        setTimeout(() => { isProcessingRef.current = false; }, 100);
      }, 1500); // 1.5秒後出字
    }

    // 情況二：使用者回覆了 -> AI 要接話 (Follow-up)
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'user' && !isTyping && !isProcessingRef.current) {
      isProcessingRef.current = true;
      setIsTyping(true);

      const randomResponse = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];

      setTimeout(() => {
        onAddMessage({ role: 'assistant', content: randomResponse });
        setIsTyping(false);
        setTimeout(() => { isProcessingRef.current = false; }, 100);
      }, 1200);
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
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-[#fdfcf8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2f4f2f] rounded-lg flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-tc font-bold text-stone-900">內在智慧羅盤</h3>
              <p className="text-xs text-stone-500">正在聆聽並感受你的文字...</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fdfcf8]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start group'}`}>
              <div className={`relative max-w-[85%] p-4 rounded-2xl text-base leading-relaxed font-serif-tc shadow-sm ${
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
          
          {/* Typing Indicator */}
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

        {/* Input Area */}
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