import React from 'react';
import { PenLine, Book, Bookmark, MessageSquare } from 'lucide-react'; // ✨ 新增 MessageSquare import
import { ViewState } from '../../types';

interface LayoutProps {
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
  onFeedbackClick: () => void; // ✨ 新增：接收點擊回饋按鈕的事件
  children: React.ReactNode;
}

export function Layout({ activeView, onNavigate, onFeedbackClick, children }: LayoutProps) {
  
  // 定義導航項目
  const navItems = [
    { id: 'editor', icon: PenLine, label: '書寫', view: 'editor' as ViewState },
    { id: 'list', icon: Book, label: '日記', view: 'list' as ViewState },
    { id: 'collections', icon: Bookmark, label: '典藏', view: 'collections' as ViewState },
  ];

  return (
    <div className="flex h-screen bg-[#fcfaf8] text-stone-900 font-serif-tc overflow-hidden selection:bg-[#2f4f2f] selection:text-white">
      {/* 側邊欄 */}
      <aside className="w-20 md:w-64 bg-white border-r border-stone-200 flex flex-col items-center md:items-stretch py-8 z-20 transition-all duration-300">
        
        {/* Logo 區塊 */}
        <div className="mb-12 px-0 md:px-8 flex justify-center md:justify-start">
          <div className="w-10 h-10 bg-[#2f4f2f] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
            IC
          </div>
          <span className="hidden md:block ml-3 font-bold text-xl tracking-wider text-[#2f4f2f] self-center">
            INNER
          </span>
        </div>

        {/* 導航選單 */}
        <nav className="flex-1 w-full px-2 md:px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.view)}
                className={`w-full flex items-center justify-center md:justify-start p-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-[#f4f1ee] text-[#2f4f2f]' 
                    : 'text-stone-400 hover:bg-stone-50 hover:text-stone-600'
                  }`}
                title={item.label}
              >
                <item.icon 
                  className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`hidden md:block ml-3 text-sm font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
                
                {/* 活躍狀態的指示條 (Mobile only) */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#2f4f2f] rounded-r-full md:hidden" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ✨ 新增：側邊欄底部的回饋按鈕 */}
        <div className="mt-auto px-2 md:px-4 pb-4 w-full">
          <button
            onClick={onFeedbackClick}
            className="w-full flex items-center justify-center md:justify-start p-3 rounded-xl text-stone-400 hover:text-[#2f4f2f] hover:bg-stone-50 transition-all duration-200 group"
            title="意見回饋"
          >
            <MessageSquare className="w-6 h-6 group-hover:scale-105 transition-transform" />
            <span className="hidden md:block ml-3 text-sm font-medium tracking-wide">
              回饋
            </span>
          </button>
        </div>
      </aside>

      {/* 主內容區域 */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        <div className="min-h-full p-4 md:p-12 pb-24 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}