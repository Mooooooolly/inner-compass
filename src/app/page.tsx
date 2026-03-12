'use client';

import React, { useState, useEffect } from 'react';
import { Save, Trash2, Calendar, Check, X, ShieldAlert, Sparkles, ChevronRight, Bookmark, Quote, AlertTriangle, Book, MessageSquare, Loader2, PenLine } from 'lucide-react';
import { Layout } from './components/Layout';
import { CoachModal } from './components/CoachModal';
import { WeeklyGreenhouseCard } from './components/WeeklyGreenhouseCard'; // Assuming this is now correctly in its own file
import { ViewState, JournalEntry, Message, DailySummary, UsageData, WeeklyReport } from '@/types';
import InAppBrowserBanner from './components/InAppBrowserBanner';
import { getUsageData, incrementUsageCount } from '@/lib/usage';

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

const PrivacyNoticeModal = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem('inner_garden_privacy_acknowledged', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200 border border-stone-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-4 text-stone-700">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-serif-tc font-bold text-stone-900 mb-2">
            這裡是您的專屬避風港
          </h3>
          <div className="text-stone-500 font-serif-tc text-sm leading-relaxed mb-6 text-left bg-stone-50 p-4 rounded-lg border border-stone-100">
            <p className="mb-2">
              Inner Garden 採用<strong>「本地儲存」</strong>。您的思緒與對話僅存放於此裝置的溫室中，外界無法窺探。
            </p>
            <p className="text-red-500 font-medium text-xs">
              ⚠️ 若您使用公用電腦（如圖書館），請務必使用「無痕模式」，關閉視窗後資料才會自動清除，以免隱私外洩。
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6 cursor-pointer" onClick={() => setDontShowAgain(!dontShowAgain)}>
          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${dontShowAgain ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300 bg-white'}`}>
             {dontShowAgain && <Check className="w-3 h-3" />}
          </div>
          <span className="text-sm text-stone-600 font-serif-tc select-none">我已了解，不再顯示此提示</span>
        </div>

        <button 
          onClick={handleConfirm}
          className="w-full px-4 py-3 rounded-lg bg-stone-900 text-white font-serif-tc shadow-md hover:bg-stone-800 transition-all active:scale-95"
        >
          開始使用
        </button>
      </div>
    </div>
  );
};

const FeedbackModal = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setStatus('sending');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY, 
          subject: 'Inner Garden 使用者回饋',
          message: message,
          email: 'anonymous@inner-garden.app'
        }),
      });

      const result = await res.json();

      if (result.success) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          setStatus('idle');
          setMessage('');
        }, 2000);
      } else {
        console.error(result);
        setStatus('error');
      }
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200 border border-stone-100 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
        
        <h3 className="text-xl font-serif-tc font-bold text-stone-900 mb-2 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#2f4f2f]" /> 交流與分享
        </h3>
        <p className="text-stone-500 font-serif-tc text-sm mb-4">
          歡迎分享您的使用感受，與我們一起細心灌溉這個空間。
          <br />
          也可以留下聯絡方式，或許我們能有更多討論。
        </p>
        
        {status === 'success' ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center justify-center gap-2 font-serif-tc min-h-[120px]">
            <Check className="w-5 h-5" /> 發送成功！謝謝你的回饋。
          </div>
        ) : (
          <>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="請輸入您的建議..."
              className="w-full h-32 p-3 bg-stone-50 rounded-lg border border-stone-200 focus:ring-1 focus:ring-stone-300 outline-none resize-none font-serif-tc text-stone-700 mb-4"
              disabled={status === 'sending'}
            />
            <button 
              onClick={handleSubmit}
              disabled={!message.trim() || status === 'sending'}
              className="w-full py-2.5 bg-stone-900 text-white rounded-lg font-serif-tc hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'sending' ? <><Loader2 className="w-4 h-4 animate-spin" /> 發送中...</> : '傳送回饋'}
            </button>
            {status === 'error' && <p className="text-red-500 text-xs mt-2 text-center font-serif-tc">發送失敗，請稍後再試。</p>}
          </>
        )}
      </div>
    </div>
  );
};

const formatUpdateTime = (timestamp: number) => {
  const d = new Date(timestamp);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  const [usage, setUsage] = useState<UsageData>({ lastUpdateDate: '', totalDailyCount: 0, sessionCounts: {} });
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);

  const generateYesterdaySummary = async (currentEntries: JournalEntry[], currentSummaries: DailySummary[]) => {
    if (typeof window === 'undefined') return;

    console.log("🚀 啟動每日足跡摘要檢查...");

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayDateString = yesterday.toISOString().split('T')[0];

    const hasYesterdaySummary = currentSummaries.some(s => s.summary_date === yesterdayDateString);

    if (hasYesterdaySummary) {
        console.log("✅ 昨日摘要已存在，無需生成。");
        return;
    }

    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const yesterdayEntries = currentEntries.filter(entry => {
        const entryTimestamp = entry.updatedAt || entry.createdAt;
        return entryTimestamp >= yesterdayStart.getTime() && entryTimestamp <= yesterdayEnd.getTime();
    });

    if (yesterdayEntries.length === 0) {
        console.log("✅ 昨日無日記變動，無需生成摘要。");
        return;
    }

    console.log(`🔍 偵測到昨日有 ${yesterdayEntries.length} 篇日記變動，準備生成摘要...`);

    const combinedContent = yesterdayEntries.map(e => `日期：${e.date}\n內容：\n${e.content}`).join('\n\n---\n\n');
    const key_quotes = yesterdayEntries.flatMap(entry =>
        (entry.messages || []).filter(m => m.isBookmarked).map(m => m.content)
    );

    try {
        const response = await fetch('/api/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: combinedContent }),
        });

        if (!response.ok) {
            throw new Error(`API 請求失敗，狀態碼: ${response.status}`);
        }

        const analysis = await response.json();
        console.log("🤖 AI 摘要生成成功！", analysis);

        const newSummary: DailySummary = {
            summary_date: yesterdayDateString,
            generated_at: new Date().toISOString(),
            activity_stats: {
                diaries_added: 0,
                diaries_deleted: 0,
                conversation_started: yesterdayEntries.some(e => e.hasCoachInteraction),
                daily_limit_reached: usage.totalDailyCount >= 7, // Logic aligned with 7 dialogues
            },
            impacted_diaries: [{
                diary_date: yesterdayDateString,
                sentiment_tags: analysis.sentiment_tags,
                iceberg_depth: analysis.iceberg_depth,
                topic_keywords: analysis.topic_keywords,
                key_quotes: key_quotes,
            }]
        };

        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const updatedSummaries = [...currentSummaries, newSummary].filter(s => new Date(s.generated_at) > ninetyDaysAgo);

        localStorage.setItem('inner_garden_summaries', JSON.stringify(updatedSummaries));
        setSummaries(updatedSummaries);
        console.log("💾 新的每日摘要已儲存，並清除了 90 天前的舊摘要。");

    } catch (error) {
        console.error("❌ 生成每日摘要失敗:", error);
    }
  };

  const generateWeeklyReport = async (currentSummaries: DailySummary[], currentReports: WeeklyReport[]) => {
    if (typeof window === 'undefined') return;

    const today = new Date();
    const isDebugMode = localStorage.getItem('debug_weekly') === 'true';

    if (today.getDay() !== 1 && !isDebugMode) {
        console.log("🌱 今天不是週一，跳過週報生成。");
        return;
    }

    const mondayDateString = today.toISOString().split('T')[0];
    const hasThisWeekReport = currentReports.some(r => r.report_date === mondayDateString);

    if (hasThisWeekReport && !isDebugMode) {
        console.log("✅ 本週週報已存在，無需生成。");
        return;
    }
    
    console.log(isDebugMode ? "[DEBUG MODE] 强制觸發週報生成..." : "📊 正在進行週報聚合...");

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const lastWeekSummaries = currentSummaries.filter(s => new Date(s.generated_at) >= sevenDaysAgo);

    if (lastWeekSummaries.length === 0 && !isDebugMode) {
      console.log("✅ 本週無每日摘要，跳過週報生成。");
      return;
    }

    const allKeywords = lastWeekSummaries.flatMap(s => s.impacted_diaries.flatMap(d => d.topic_keywords));
    const allSentiments = lastWeekSummaries.flatMap(s => s.impacted_diaries.flatMap(d => d.sentiment_tags));

    const keywordRanking = Object.entries(allKeywords.reduce((acc, word) => { acc[word] = (acc[word] || 0) + 1; return acc; }, {} as { [key: string]: number })).map(([word, count]) => ({ word, count })).sort((a, b) => b.count - a.count);
    const sentimentRanking = Object.entries(allSentiments.reduce((acc, sentiment) => { acc[sentiment] = (acc[sentiment] || 0) + 1; return acc; }, {} as { [key: string]: number })).map(([sentiment, count]) => ({ sentiment, count })).sort((a, b) => b.count - a.count);
    
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - 1);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    const formatDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate().toString().padStart(2, '0')}`;
    const week_label = `${formatDate(weekStart)}-${formatDate(weekEnd)}`;

    try {
      const weeklyData = JSON.stringify({ keyword_ranking: keywordRanking, sentiment_ranking: sentimentRanking }, null, 2);
      const response = await fetch('/api/summarize-weekly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weeklyData }),
      });

      if (!response.ok) {
        throw new Error(`API 請求失敗，狀態碼: ${response.status}`);
      }

      const result = await response.json();

      // Construct the image URL from the plant_key
      const imageUrl = `/plants/${result.plant_key}.jpg`;
      
      const newReport: WeeklyReport = {
        report_date: mondayDateString,
        week_label,
        total_diaries_analyzed: lastWeekSummaries.length,
        keyword_ranking: keywordRanking,
        sentiment_ranking: sentimentRanking,
        plant_name: result.plant_name || '新芽', // Fallback for safety
        weekly_insight: result.weekly_insight || '新的開始正在醞釀中。',
        image_url: imageUrl, // Use the locally constructed URL
        turning_point: undefined, // Ensure turning_point is not in the object
      };

      const updatedReports = isDebugMode 
        ? [newReport, ...currentReports.filter(r => r.report_date !== mondayDateString)]
        : [...currentReports, newReport];

      localStorage.setItem('inner_garden_weekly_reports', JSON.stringify(updatedReports));
      setWeeklyReports(updatedReports);
      console.log("💾 新的週報已儲存。");

    } catch (error) {
      console.error("❌ 生成週報失敗:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasAcknowledged = localStorage.getItem('inner_garden_privacy_acknowledged');
      if (!hasAcknowledged) {
        setTimeout(() => setShowPrivacyNotice(true), 1000);
      }
      
      let initialEntries: JournalEntry[] = [];
      let initialSummaries: DailySummary[] = [];
      let initialWeeklyReports: WeeklyReport[] = [];

      try { initialEntries = JSON.parse(localStorage.getItem('inner_garden_entries') || '[]'); } catch (e) { console.error("讀取日記失敗", e); }
      try { initialSummaries = JSON.parse(localStorage.getItem('inner_garden_summaries') || '[]'); } catch (e) { console.error("讀取摘要失敗", e); }
      try { initialWeeklyReports = JSON.parse(localStorage.getItem('inner_garden_weekly_reports') || '[]'); } catch (e) { console.error("讀取週報失敗", e); }
      
      setEntries(initialEntries);
      setSummaries(initialSummaries);
      setWeeklyReports(initialWeeklyReports);
      setUsage(getUsageData());

      generateYesterdaySummary(initialEntries, initialSummaries);
      generateWeeklyReport(initialSummaries, initialWeeklyReports);
    }
  }, []);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('inner_garden_entries', JSON.stringify(entries));
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

      if (newMsg.role === 'assistant' && !newMsg.content.startsWith('(系統訊息)')) {
        const newUsage = incrementUsageCount();
        setUsage(newUsage);
        console.log(`📈 使用頻寬 +1，今日總計: ${newUsage.totalDailyCount}`);
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

  const latestReport = weeklyReports.length > 0 ? weeklyReports.sort((a,b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())[0] : null;

  return (
    <Layout 
      activeView={view} 
      onNavigate={(v) => {
        checkNavigation(() => {
          if (v === 'editor' && view !== 'editor') startNewEntry();
          else setView(v);
        }, 'unsaved');
      }}
      onFeedbackClick={() => setShowFeedback(true)}
    >
      <InAppBrowserBanner />
      {view === 'editor' && (
        <div className="flex flex-col h-full max-w-3xl mx-auto animate-in fade-in duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-stone-200 gap-4 mt-4 md:mt-0">
            <div className="space-y-2">
              <h1 className="text-4xl font-serif-tc font-bold text-stone-900 tracking-wider">整理思緒</h1>
              <p className="text-stone-500 font-serif-tc italic text-sm">在寧靜的空間裡，讓感受自然發芽。</p>
            </div>
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
                  title="刪除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <button onClick={handleSave} disabled={isSaving} className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all shadow-sm font-serif-tc text-sm min-w-[100px] justify-center ${hasSaved ? 'bg-stone-100 text-stone-600 hover:bg-stone-200' : 'bg-[#9e9a93] text-white hover:bg-[#8c8881]'}`}>
                {isSaving ? <span className="animate-spin">⟳</span> : (hasSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                {isSaving ? '儲存中' : (hasSaved ? '已儲存' : '儲存')}
              </button>

              <button 
                onClick={() => checkNavigation(() => setView('list'), 'unsaved')} 
                className="p-2.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                title="結束編輯"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="relative w-full h-[75vh] min-h-[500px]">
            <textarea 
              value={content} 
              onChange={(e) => { 
                setContent(e.target.value); 
                if (hasSaved) setHasSaved(false); 
              }} 
              placeholder="寫下你的想法，讓內在智慧陪你慢慢灌溉..." 
              className="w-full h-full bg-transparent resize-none outline-none text-xl leading-relaxed text-stone-700 placeholder:text-stone-300 font-serif-tc p-2 focus:bg-white/50 transition-colors rounded-xl" 
            />
            
            {hasSaved && (
              <div className="fixed bottom-20 right-6 md:bottom-12 md:right-12 z-50 animate-in zoom-in-50 duration-300">
                 <button 
                   onClick={handleOpenCoach}
                   className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#2f4f2f] text-white shadow-xl hover:scale-110 transition-all duration-300"
                   title="召喚內在智慧"
                 >
                   <div className="absolute inset-0 rounded-full bg-[#2f4f2f] blur opacity-40 group-hover:opacity-70 animate-pulse transition-opacity"></div>
                   <Sparkles className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform" />
                 </button>
                 <div className="absolute bottom-16 right-0 w-max bg-stone-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-2 mr-[-10px]">
                   開啟深度對話
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
      {view === 'list' && (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
           <WeeklyGreenhouseCard report={latestReport} />
          <div className="border-b border-stone-200 pb-4 mt-4 md:mt-0">
             <h1 className="text-3xl font-serif-tc font-bold text-stone-900">紀錄軌跡</h1>
          </div>
          <div className="space-y-4">
            {sortedEntries.length === 0 ? (
               <div className="text-center py-20">
                 <Book className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                 <p className="text-stone-400 font-serif-tc">這片土壤還很安靜。開始寫下你的第一篇日記吧...</p>
               </div>
            ) : (
              sortedEntries.map(entry => (
                <div key={entry.id} onClick={() => handleSelectEntry(entry)} className="group bg-white p-6 rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition-all cursor-pointer flex gap-4 items-start">
                  <div className="flex flex-col items-center min-w-[60px] shrink-0">
                    <div className="w-12 h-12 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 text-lg font-bold font-serif-tc mb-1 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                      {entry.date.split('-')[2]}
                    </div>
                    <span className="text-[10px] text-stone-400 tracking-wider">
                      {entry.date.split('-')[0]}.{entry.date.split('-')[1]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                       <h3 className={`font-serif-tc text-base truncate pr-2 ${entry.content ? 'font-bold text-stone-800' : 'font-normal text-stone-400 italic'}`}>
                         {entry.content || "(尚無內容，等待你留下思緒...)"}
                       </h3>
                       <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 shrink-0" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-400 font-serif-tc">
                       {entry.hasCoachInteraction && (
                         <span className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100 shrink-0 whitespace-nowrap">
                           <Sparkles className="w-3 h-3 mr-1 fill-green-700" />
                           已對話
                         </span>
                       )}
                       <div className="flex items-center gap-1 shrink-0">
                         <PenLine className="w-3 h-3" />
                         <span>{formatUpdateTime(entry.updatedAt || entry.createdAt)}</span> 
                       </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {view === 'collections' && (
         <div className="max-w-3xl mx-auto animate-in fade-in">
            <h1 className="text-3xl font-serif-tc font-bold text-stone-900 mb-8 border-b border-stone-200 pb-4 mt-4 md:mt-0">收藏</h1>
            {allBookmarks.length === 0 ? (
              <div className="text-center py_20">
                <Bookmark className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                <p className="text-stone-400 font-serif-tc">尚無收藏。當你遇到觸動內心的提問時，點擊書籤將其收藏...</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {allBookmarks.map((bookmark, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-all relative group">
                    <Quote className="w-8 h-8 text-stone-100 absolute top-4 right-4" />
                    <p className="font-serif-tc text-stone-700 leading-relaxed mb-4 min-h-[80px]">{bookmark.content}</p>
                    <div className="flex items-center justify-between text-xs text-stone-400 pt-4 border-t border-stone-50">
                      <span>{bookmark.originDate}</span>
                      <button onClick={() => { const entry = entries.find(e => e.id === bookmark.originId); if (entry) handleSelectEntry(entry); }} className="hover:text-stone-900 transition-colors">回溯這場對話 →</button>
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
          usage={usage}
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

      <FeedbackModal 
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />

      <PrivacyNoticeModal 
        isOpen={showPrivacyNotice}
        onClose={() => setShowPrivacyNotice(false)}
      />
    </Layout>
  );
}