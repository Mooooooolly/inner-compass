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
    { id: 'collections', icon: Bookmark, label: '收藏', view: 'collections' as ViewState },
  ];

  return (
    // ✨ 修改 1: 手機版垂直排列 (flex-col)，電腦版水平排列 (md:flex-row)
    <div className="flex h-screen bg-[#fcfaf8] text-stone-900 font-serif-tc overflow-hidden selection:bg-[#2f4f2f] selection:text-white flex-col md:flex-row">
      
      {/* ✨ 修改 2: 側邊欄 RWD 設定
          手機版: fixed bottom-0 (置底), w-full (全寬), h-16 (高度), border-t (上邊框), flex-row (橫向)
          電腦版: relative, w-20, h-full, border-r (右邊框), flex-col (直向)
      */}
      <aside className="
        fixed bottom-0 left-0 right-0 z-40 w-full h-16 bg-white border-t border-stone-200 flex flex-row items-center justify-around px-2
        md:relative md:w-20 md:h-full md:border-r md:border-t-0 md:flex-col md:justify-start md:py-8 md:px-0
      ">
        
        {/* Logo 區塊: 手機版隱藏 (hidden), 電腦版顯示 (md:flex) */}
        <div className="hidden md:flex mb-12 flex-col items-center gap-4">
          <div className="w-10 h-10 bg-[#1c1917] rounded-xl flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-6 h-6" strokeWidth={2} />
          </div>
          <span className="[writing-mode:vertical-lr] text-[10px] tracking-[0.3em] text-stone-400 font-serif rotate-180 select-none cursor-default">
            INNER COMPASS
          </span>
        </div>

        {/* 導航選單: 手機版橫向 (flex-row), 電腦版直向 (md:flex-col) */}
        <nav className="flex flex-1 flex-row items-center justify-around w-full max-w-sm md:max-w-none md:flex-col md:gap-6 md:justify-start">
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
                
                {isActive && (
                  // 手機版: 指示點在下方 (-bottom-1), 電腦版: 指示點在右方 (-right-2)
                  <div className="absolute -bottom-1 md:top-1/2 md:-bottom-auto md:-translate-y-1/2 md:-right-2 w-1 h-1 bg-[#1c1917] rounded-full" />
                )}
              </button>
            );
          })}

          {/* ✨ 修改 3: 回饋按鈕在手機版也加入導航列中，電腦版則維持在底部 */}
          <button
            onClick={onFeedbackClick}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-300 hover:text-[#1c1917] hover:bg-stone-50 transition-all duration-300 md:mt-auto"
            title="交流"
          >
            <MessageSquare className="w-6 h-6" strokeWidth={2} />
          </button>
        </nav>

      </aside>

      {/* 主內容區域: 手機版下方預留空間 (pb-20) 避免被導航列擋住 */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth pb-20 md:pb-0">
        <div className="min-h-full p-4 md:p-12 pb-24 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}