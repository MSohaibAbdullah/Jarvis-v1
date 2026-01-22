
import React from 'react';
import { Thread } from '../types';

interface ThreadListProps {
  threads: Thread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onCreateThread: () => void;
  projectName: string;
  isCollapsed: boolean;
}

const ThreadList: React.FC<ThreadListProps> = ({ 
  threads, 
  activeThreadId, 
  onSelectThread, 
  onCreateThread, 
  projectName,
  isCollapsed 
}) => {
  if (isCollapsed) return null;

  return (
    <div className="w-64 h-full bg-white border-r border-slate-100 flex flex-col z-20 overflow-hidden animate-in slide-in-from-left duration-300 shadow-sm">
      <div className="p-6 border-b border-slate-50">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{projectName}</h3>
        <h2 className="text-lg font-bold tracking-tighter">Discussions</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {threads.map(t => (
          <button
            key={t.id}
            onClick={() => onSelectThread(t.id)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all truncate ${activeThreadId === t.id ? 'bg-slate-100 text-black font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            {t.title || 'Untitled Node'}
          </button>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-50">
        <button 
          onClick={onCreateThread}
          className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
        >
          New Discussion
        </button>
      </div>
    </div>
  );
};

export default ThreadList;
