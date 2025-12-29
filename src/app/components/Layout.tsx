"use client";

import React from 'react';
import { BookOpen, BookText, PenLine, Bookmark } from 'lucide-react';
import { ViewState } from '../../types'; // 注意：因為在 components 資料夾，所以要往上兩層找 types

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  const NavButton = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button 
      onClick={() => onNavigate(view)}
      className={`p-3 transition-all duration-300 rounded-xl flex flex-col items-center gap-1 ${
        activeView === view 
          ? 'text-stone-900' 
          : 'text-stone-300 hover:text-stone-500'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-[10px] md:hidden">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fdfcf8]">
      {/* 桌面版側邊欄 */}
      <nav className="hidden md:flex w-24 border-r border-stone-200 flex-col items-center py-8 justify-start sticky top-0 h-screen bg-[#fdfcf8]">
        <div className="flex flex-col items-center mb-12 cursor-pointer" onClick={() => onNavigate('editor')}>
          <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center mb-6 shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="h-32 flex items-center justify-center">
             <span className="font-serif-tc text-[10px] font-bold text-black uppercase tracking-[0.3em] [writing-mode:vertical-rl] rotate-180">
              INNER COMPASS
            </span>
          </div>
        </div>
        <div className="space-y-6 flex flex-col">
          <NavButton view="editor" icon={PenLine} label="撰寫" />
          <NavButton view="list" icon={BookText} label="列表" />
          <NavButton view="collections" icon={Bookmark} label="典藏" />
        </div>
      </nav>

      {/* 手機版 Header */}
      <header className="md:hidden flex items-center p-4 border-b border-stone-200 bg-[#fdfcf8] sticky top-0 z-50">
         <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center mr-3">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif-tc font-bold text-xs tracking-widest uppercase">Inner Compass</span>
          </div>
      </header>

      {/* 主要內容區 */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-16 pb-24 md:pb-16">
        {children}
      </main>

      {/* 手機版底部導航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fdfcf8] border-t border-stone-200 flex justify-around py-2 z-50 pb-safe">
        <NavButton view="editor" icon={PenLine} label="撰寫" />
        <NavButton view="list" icon={BookText} label="列表" />
        <NavButton view="collections" icon={Bookmark} label="典藏" />
      </nav>
    </div>
  );
};