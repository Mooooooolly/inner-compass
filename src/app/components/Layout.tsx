import { PenLine, Book, Bookmark, MessageSquare } from 'lucide-react';
import { ViewState } from '@/types';

const NavButton = ({ 
  isActive, 
  onClick, 
  children, 
  label 
}: { 
  isActive: boolean, 
  onClick: () => void, 
  children: React.ReactNode, 
  label: string 
}) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 rounded-lg w-full transition-colors ${isActive ? 'text-stone-900' : 'text-stone-400 hover:bg-stone-100/50 hover:text-stone-600'}`}
    aria-label={label}
  >
    {children}
    <span className="text-[10px] font-serif-tc font-semibold">{label}</span>
  </button>
);

export const Layout = ({ 
  children,
  activeView,
  onNavigate,
  onFeedbackClick,
}: {
  children: React.ReactNode,
  activeView: ViewState,
  onNavigate: (view: ViewState) => void,
  onFeedbackClick: () => void,
}) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#fdfcf8]">
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:flex flex-col items-center justify-between w-24 py-8 px-4 bg-white/50 border-r border-stone-100 shrink-0">
        <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => onNavigate('editor')}>
            <div className="w-12 h-12 bg-stone-900 text-white rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" strokeWidth={2} />
            </div>
            <span className="[writing-mode:vertical-lr] text-[10px] tracking-[0.3em] text-stone-400 font-serif rotate-180 select-none cursor-default">
              INNER GARDEN
            </span>
        </div>

        <nav className="flex flex-col items-center gap-4 w-full">
            <NavButton isActive={activeView === 'editor'} onClick={() => onNavigate('editor')} label="書寫">
              <PenLine className="w-5 h-5" />
            </NavButton>
            <NavButton isActive={activeView === 'list'} onClick={() => onNavigate('list')} label="軌跡">
              <Book className="w-5 h-5" />
            </NavButton>
            <NavButton isActive={activeView === 'collections'} onClick={() => onNavigate('collections')} label="收藏">
              <Bookmark className="w-5 h-5" />
            </NavButton>
        </nav>

        <button onClick={onFeedbackClick} className="text-stone-400 hover:text-stone-600" title="分享回饋">
          <MessageSquare className="w-5 h-5" />
        </button>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 p-4 md:p-12 overflow-y-auto">
        {children}
      </main>

      {/* --- Mobile Bottom Nav --- */}
      <footer className="md:hidden sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-stone-100 p-2 z-40">
        <nav className="flex justify-around items-start">
          <NavButton isActive={activeView === 'editor'} onClick={() => onNavigate('editor')} label="書寫">
            <PenLine className="w-5 h-5" />
          </NavButton>
          <NavButton isActive={activeView === 'list'} onClick={() => onNavigate('list')} label="軌跡">
            <Book className="w-5 h-5" />
          </NavButton>
          <NavButton isActive={activeView === 'collections'} onClick={() => onNavigate('collections')} label="收藏">
            <Bookmark className="w-5 h-5" />
          </NavButton>
          <NavButton isActive={false} onClick={onFeedbackClick} label="回饋">
            <MessageSquare className="w-5 h-5" />
          </NavButton>
        </nav>
      </footer>
    </div>
  );
};