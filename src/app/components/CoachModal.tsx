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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    // 1. 開場白 (維持原樣，因為這樣最快最穩)
    if (messages.length === 0 && !isProcessingRef.current) {
      isProcessingRef.current = true;
      setIsTyping(true);

      setTimeout(() => {
        const snippet = journalContent.slice(0, 15) + (journalContent.length > 15 ? "..." : "");
        const greeting = journalContent.trim() 
          ? `我讀了你寫的「${snippet}」。\n\n這段文字裡似乎藏著一些情緒，你現在感覺身體哪個部位最有感覺？`
          : "我看見你打開了日記，但還沒寫下文字。現在的心情還好嗎？想聊聊嗎？";

        onAddMessage({ role: 'assistant', content: greeting });
        setIsTyping(false);
        setTimeout(() => { isProcessingRef.current = false; }, 100);
      }, 1500);
    }

    // 2. 使用者回覆後 -> 呼叫真實 AI API 🚀
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'user' && !isTyping && !isProcessingRef.current) {
      isProcessingRef.current = true;
      setIsTyping(true);

      const fetchAIResponse = async () => {
        try {
          // 呼叫我們剛剛寫好的後端
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: lastMsg.content,
              journalContent: journalContent,
              // history: messages // 如果未來要讓 AI 記得上下文，可以把這個傳過去
            }),
          });

          if (!response.ok) throw new Error('API request failed');

          const data = await response.json();
          
          onAddMessage({ role: 'assistant', content: data.reply });
        
        } catch (error) {
          console.error(error);
          onAddMessage({ role: 'assistant', content: "抱歉，我的連線訊號有點微弱...能請你再說一次嗎？" });
        } finally {
          setIsTyping(false);
          setTimeout(() => { isProcessingRef.current = false; }, 100);
        }
      };

      fetchAIResponse();
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