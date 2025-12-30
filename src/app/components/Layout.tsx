import React from 'react';
import { PenLine, Book, Bookmark, MessageSquare, BookOpen } from 'lucide-react';
import { ViewState } from '@/types';

interface LayoutProps {
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
  onFeedbackClick: () => void;
  children: React.ReactNode;
}

export function Layout({ activeView, onNavigate, onFeedbackClick, children }: LayoutProps) {
  
  const navItems = [
    { id: 'editor', icon: PenLine, label: '書寫', view: 'editor' as ViewState },
    { id: 'list', icon: Book, label: '日記', view: 'list' as ViewState },
    { id: 'collections', icon: Bookmark, label: '典藏', view: 'collections' as ViewState },
  ];

  return (
    <div className="flex h-screen bg-[#fcfaf8] text-stone-900 font-serif-tc overflow-hidden selection:bg-[#2f4f2f] selection:text-white">
      {/* 側邊欄：固定寬度 w-20 */}
      <aside className="w-20 bg-white border-r border-stone-200 flex flex-col items-center py-8 z-20 shrink-0">
        
        {/* ✨ Logo 區塊：恢復「書本圖示 + 垂直文字」組合 */}
        <div className="mb-12 flex flex-col items-center gap-4">
          {/* 書本圖示容器 */}
          <div className="w-10 h-10 bg-[#1c1917] rounded-xl flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-6 h-6" strokeWidth={2} />
          </div>
          {/* 垂直質感文字 */}
          <span className="[writing-mode:vertical-lr] text-[10px] tracking-[0.3em] text-stone-400 font-serif rotate-180 select-none cursor-default">
            INNER COMPASS
          </span>
        </div>

        {/* 導航選單：純 Icon */}
        <nav className="flex-1 w-full flex flex-col items-center gap-6">
          {navItems.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.view)}
                className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'text-[#1c1917]' 
                    : 'text-stone-300 hover:bg-stone-50 hover:text-stone-600'
                  }`}
                title={item.label}
              >
                <item.icon 
                  className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {/* 活躍狀態的小圓點指示 */}
                {isActive && (
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-[#1c1917] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* 底部回饋按鈕：純 Icon */}
        <div className="mt-auto pb-4">
          <button
            onClick={onFeedbackClick}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-300 hover:text-[#1c1917] hover:bg-stone-50 transition-all duration-300"
            title="意見回饋"
          >
            <MessageSquare className="w-6 h-6" strokeWidth={2} />
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