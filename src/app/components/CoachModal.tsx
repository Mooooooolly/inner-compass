"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { Message } from '../../types'; // 注意：往上兩層找 types

interface CoachModalProps {
  onClose: () => void;
  messages: Message[];
  onAddMessage: (msg: Message) => void;
}

export const CoachModal: React.FC<CoachModalProps> = ({ onClose, messages, onAddMessage }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    onAddMessage({ role: 'user', content: input });
    setInput('');
    setIsTyping(true);

    // 模擬 AI 回應
    setTimeout(() => {
      setIsTyping(false);
      onAddMessage({ 
        role: 'assistant', 
        content: '我聽到了你的感受。這確實是一個值得深思的觀點，你能多說一點嗎？' 
      });
    }, 1500);
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
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-base leading-relaxed font-serif-tc shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-stone-800 text-white rounded-br-none' 
                  : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
               <div className="bg-white border border-stone-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                 <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-150"></span>
               </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-stone-100 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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