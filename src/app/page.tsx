"use client";

import React, { useState, useEffect } from 'react';
import { Save, Trash2, Calendar, Check, X, Sparkles, ChevronRight, Bookmark, Quote, AlertTriangle, Clock, Book } from 'lucide-react';
import { Layout } from './components/Layout';
import { CoachModal } from './components/CoachModal';
import { ViewState, JournalEntry, Message } from '../types';

// ✨ 通用警告視窗元件
const WarningModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  type: 'unsaved' | 'delete';
}) => {
  if (!isOpen) return null;

  const isDelete = type === 'delete';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200 border border-stone-100">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDelete ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-serif-tc font-bold text-stone-900 mb-2">
          {isDelete ? '確定要刪除嗎？' : '尚未儲存'}
        </h3>
        <p className="text-stone-500 font-serif-tc text-sm leading-relaxed mb-6">
          {isDelete 
            ? '此動作無法復原，這篇日記將會永遠消失。' 
            : '您有尚未儲存的內容，若現在離開，剛才寫下的文字將會遺失。'}
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-stone-200 text-stone-600 font-serif-tc hover:bg-stone-50 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg text-white font-serif-tc shadow-sm transition-all ${
              isDelete 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-stone-900 hover:bg-stone-800'
            }`}
          >
            {isDelete ? '確認刪除' : '確定離開'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 🛠️ 輔助函式：格式化「最後更新時間」
const formatUpdateTime = (timestamp: number) => {
  const d = new Date(timestamp);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export default function Home() {
  const [view, setView] = useState<ViewState>('editor');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  
  const [showCoach, setShowCoach] = useState(false);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);

  const [showWarning, setShowWarning] = useState(false);
  const [warningType, setWarningType] = useState<'unsaved' | 'delete'>('unsaved');
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('inner_compass_entries');
      if (saved) {
        try {
          setEntries(JSON.parse(saved));
        } catch (e) {
          console.error("讀取失敗", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('inner_compass_entries', JSON.stringify(entries));
    }
  }, [entries]);

  const isDirty = !hasSaved && content.trim().length > 0;

  const checkNavigation = (action: () => void, type: 'unsaved' | 'delete' = 'unsaved') => {
    if ((view === 'editor' && isDirty) || type === 'delete') {
      setPendingAction(() => action);
      setWarningType(type);
      setShowWarning(true);
    } else {
      action();
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    const now = Date.now();
    
    const newEntry: JournalEntry = {
      id: activeId || Math.random().toString(36).substr(2, 9),
      date,
      content,
      createdAt: activeId ? (entries.find(e => e.id === activeId)?.createdAt || now) : now,
      updatedAt: now,
      hasCoachInteraction: activeMessages.length > 0,
      messages: activeMessages
    };

    if (activeId) {
      setEntries(prev => prev.map(e => e.id === activeId ? newEntry : e));
    } else {
      setEntries(prev => [newEntry, ...prev]);
      setActiveId(newEntry.id);
    }

    setTimeout(() => {
      setIsSaving(false);
      setHasSaved(true);
    }, 800);
  };

  const handleOpenCoach = () => {
    setShowCoach(true);
  };

  const handleUpdateMessages = (newMsg: Message) => {
    setActiveMessages(prev => {
      const updatedMsgs = [...prev, newMsg];
      
      if (activeId) {
        setEntries(prevEntries => prevEntries.map(e => e.id === activeId ? 
          { ...e, messages: updatedMsgs, hasCoachInteraction: true, updatedAt: Date.now() } : e
        ));
      }
      return updatedMsgs;
    });
  };

  const handleToggleBookmark = (index: number) => {
    setActiveMessages(prev => {
      const updatedMsgs = [...prev];
      const msg = updatedMsgs[index];
      updatedMsgs[index] = { ...msg, isBookmarked: !msg.isBookmarked };
      
      if (activeId) {
        setEntries(prevEntries => prevEntries.map(e => e.id === activeId ? 
          { ...e, messages: updatedMsgs, updatedAt: Date.now() } : e
        ));
      }
      return updatedMsgs;
    });
  };

  const handleSelectEntry = (entry: JournalEntry) => {
    setActiveId(entry.id);
    setContent(entry.content);
    setDate(entry.date);
    setActiveMessages(entry.messages || []);
    setHasSaved(true);
    setView('editor');
  };

  const startNewEntry = () => {
    setActiveId(null);
    setContent('');
    setDate(new Date().toISOString().split('T')[0]);
    setActiveMessages([]);
    setHasSaved(false);
    setView('editor');
  };

  const sortedEntries = [...entries].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
  });

  const allBookmarks = sortedEntries.flatMap(entry => 
    (entry.messages || [])
      .filter(m => m.isBookmarked)
      .map(m => ({ ...m, originDate: entry.date, originId: entry.id }))
  );

  return (
    <Layout 
      activeView={view} 
      onNavigate={(v) => {
        checkNavigation(() => {
          if (v === 'editor' && view !== 'editor') startNewEntry();
          else setView(v);
        }, 'unsaved');
      }}
    >
      {view === 'editor' && (
        <div className="flex flex-col h-full max-w-3xl mx-auto animate-in fade-in duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-stone-200 gap-4 mt-4 md:mt-0">
            <div className="space-y-2">
              <h1 className="text-4xl font-serif-tc font-bold text-stone-900 tracking-wider">回顧思緒</h1>
              <p className="text-stone-500 font-serif-tc italic text-sm">讓文字流淌，承接你的所有心情。</p>
            </div>
            {/* ✨ 工具列區塊：加入 flex-wrap 以適應小螢幕 */}
            <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
              <div className="flex items-center bg-white border border-stone-200 rounded-lg px-3 py-2 shadow-sm">
                <Calendar className="w-4 h-4 text-stone-400 mr-2" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent text-sm text-stone-600 outline-none font-serif-tc min-w-[100px]" />
              </div>
              
              {activeId && (
                <button 
                  onClick={() => checkNavigation(() => {
                    setEntries(prev => prev.filter(e => e.id !== activeId)); 
                    startNewEntry();
                  }, 'delete')}
                  className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-stone-100 rounded-lg transition-colors"
                  title="刪除日記"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <button onClick={handleSave} disabled={isSaving} className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all shadow-sm font-serif-tc text-sm min-w-[100px] justify-center ${hasSaved ? 'bg-stone-100 text-stone-600 hover:bg-stone-200' : 'bg-[#9e9a93] text-white hover:bg-[#8c8881]'}`}>
                {isSaving ? <span className="animate-spin">⟳</span> : (hasSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                {isSaving ? '儲存中' : (hasSaved ? '已儲存' : '儲存')}
              </button>

              {/* ✨ 新增：整合進來的「結束」按鈕 (純 icon 版) */}
              <button 
                onClick={() => checkNavigation(() => setView('list'), 'unsaved')} 
                className="p-2.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                title="結束編輯"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* 🗑️ 已移除：原本下方的獨立結束按鈕區塊 */}

          <div className="flex-1 relative min-h-[60vh]">
            <textarea 
              value={content} 
              onChange={(e) => { 
                setContent(e.target.value); 
                if (hasSaved) setHasSaved(false); 
              }} 
              placeholder="寫下你的想法，讓內在智慧陪你探索..." 
              className="w-full h-full bg-transparent resize-none outline-none text-xl leading-relaxed text-stone-700 placeholder:text-stone-300 font-serif-tc p-2 focus:bg-white/50 transition-colors rounded-xl" 
            />
            
            {hasSaved && (
              <div className="absolute bottom-4 right-4 z-20 animate-in zoom-in-50 duration-300">
                 <button 
                   onClick={handleOpenCoach}
                   className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#2f4f2f] text-white shadow-xl hover:scale-110 transition-all duration-300"
                   title="召喚內在智慧"
                 >
                   <div className="absolute inset-0 rounded-full bg-[#2f4f2f] blur opacity-40 group-hover:opacity-70 animate-pulse transition-opacity"></div>
                   <Sparkles className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform" />
                 </button>
                 <div className="absolute bottom-16 right-0 w-max bg-stone-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-2 mr-[-10px]">
                   與 AI 教練對話
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
      {view === 'list' && (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
          <div className="border-b border-stone-200 pb-4 mt-4 md:mt-0">
             <h1 className="text-3xl font-serif-tc font-bold text-stone-900">日記列表</h1>
             <p className="text-stone-400 text-sm mt-1">依照日期排序</p>
          </div>
          <div className="space-y-4">
            {sortedEntries.length === 0 ? (
               <div className="text-center py-20">
                 <Book className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                 <p className="text-stone-400 font-serif-tc">還沒有任何紀錄。開始寫下你的第一篇日記吧...</p>
               </div>
            ) : (
              sortedEntries.map(entry => (
                <div key={entry.id} onClick={() => handleSelectEntry(entry)} className="group bg-white p-6 rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition-all cursor-pointer flex gap-6 items-start">
                  <div className="flex flex-col items-center min-w-[60px]">
                    <div className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 text-xs font-serif-tc mb-2 group-hover:bg-stone-900 group-hover:text-white transition-colors">{entry.date.split('-')[2]}</div>
                    <span className="text-[10px] text-stone-400">{entry.date.split('-')[0]}-{entry.date.split('-')[1]}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif-tc font-bold text-lg text-stone-800 line-clamp-1">{entry.date}</h3>
                        {entry.hasCoachInteraction && <span className="px-2 py-0.5 bg-[#f0fdf4] text-[#15803d] text-[10px] rounded-full border border-[#bbf7d0]">已開啟對話</span>}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-stone-300">
                        <Clock className="w-3 h-3" />
                        <span>編輯於 {formatUpdateTime(entry.updatedAt || entry.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-stone-500 font-serif-tc line-clamp-2 leading-relaxed text-sm">{entry.content}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-600" />
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {view === 'collections' && (
         <div className="max-w-3xl mx-auto animate-in fade-in">
            <h1 className="text-3xl font-serif-tc font-bold text-stone-900 mb-8 border-b border-stone-200 pb-4 mt-4 md:mt-0">典藏</h1>
            {allBookmarks.length === 0 ? (
              <div className="text-center py-20">
                <Bookmark className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                <p className="text-stone-400 font-serif-tc">尚無典藏。當你遇到觸動內心的提問時，點擊書籤圖標將其收錄...</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {allBookmarks.map((bookmark, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-all relative group">
                    <Quote className="w-8 h-8 text-stone-100 absolute top-4 right-4" />
                    <p className="font-serif-tc text-stone-700 leading-relaxed mb-4 min-h-[80px]">{bookmark.content}</p>
                    <div className="flex items-center justify-between text-xs text-stone-400 pt-4 border-t border-stone-50">
                      <span>{bookmark.originDate}</span>
                      <button onClick={() => { const entry = entries.find(e => e.id === bookmark.originId); if (entry) handleSelectEntry(entry); }} className="hover:text-stone-900 transition-colors">查看日記 →</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
         </div>
      )}
      
      {showCoach && (
        <CoachModal 
          messages={activeMessages} 
          onClose={() => setShowCoach(false)} 
          onAddMessage={handleUpdateMessages}
          onToggleBookmark={handleToggleBookmark}
          journalContent={content} 
        />
      )}

      <WarningModal 
        isOpen={showWarning}
        type={warningType}
        onClose={() => setShowWarning(false)}
        onConfirm={() => {
          setShowWarning(false);
          pendingAction();
        }}
      />
    </Layout>
  );
}