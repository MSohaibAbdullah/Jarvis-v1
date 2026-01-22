
import React, { useState } from 'react';
import { Project, FileData } from '../types';

interface ProjectListProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onOpenGlobalSettings: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  activeProjectId, 
  onSelectProject, 
  onCreateProject, 
  onUpdateProject, 
  onOpenGlobalSettings,
  onToggleCollapse,
  isCollapsed
}) => {
  const [showSettings, setShowSettings] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, projId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newFile: FileData = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type || 'application/octet-stream',
        content: content
      };
      const proj = projects.find(p => p.id === projId);
      if (proj) onUpdateProject(projId, { files: [...proj.files, newFile] });
    };
    reader.readAsDataURL(file);
  };

  return (
    <nav className="w-16 h-full bg-slate-900 flex flex-col items-center py-6 space-y-4 z-30 shadow-2xl transition-all duration-300">
      <div className="flex flex-col items-center mb-2">
        {/* Logo */}
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center cursor-pointer hover:rotate-12 transition-transform duration-500 shadow-lg shadow-white/10 mb-1">
          <div className="w-4 h-4 bg-black"></div>
        </div>
        <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">Jarvis</span>
        
        {/* Collapse Toggle */}
        <button 
          onClick={onToggleCollapse}
          className="w-10 h-10 rounded-xl flex flex-col items-center justify-center space-y-1.5 hover:bg-slate-800 transition-colors group mb-4"
          title={isCollapsed ? "Expand Sidebars" : "Collapse Sidebars"}
        >
          <div className="w-5 h-[2px] bg-white group-hover:scale-x-110 transition-transform"></div>
          <div className="w-5 h-[2px] bg-white group-hover:scale-x-110 transition-transform"></div>
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="flex-1 w-full space-y-4 px-2 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
          {projects.map(p => (
            <div key={p.id} className="relative group">
              <button
                onClick={() => onSelectProject(p.id)}
                className={`w-12 h-12 rounded-xl transition-all duration-300 flex items-center justify-center font-bold text-xs ${activeProjectId === p.id ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-white'}`}
              >
                {p.name.substring(0, 2).toUpperCase()}
              </button>
              <div className="absolute left-16 top-3 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-800">
                {p.name}
              </div>
              {activeProjectId === p.id && (
                  <button 
                    onClick={() => setShowSettings(p.id)}
                    className="absolute -right-1 -bottom-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white scale-75 border-2 border-slate-900 hover:scale-100 transition-transform"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </button>
              )}
            </div>
          ))}
          <button 
            onClick={() => onCreateProject('New Project')}
            className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-700 text-slate-600 flex items-center justify-center hover:border-slate-500 hover:text-slate-400 transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      )}

      {/* Global Settings at the bottom */}
      <button 
        onClick={onOpenGlobalSettings}
        className="p-3 text-slate-500 hover:text-white transition-all hover:bg-slate-800 rounded-xl group mt-auto"
        title="Global System Protocol"
      >
        <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-8 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-xl text-white tracking-tight">Project Node Architecture</h3>
              <button onClick={() => setShowSettings(null)} className="text-slate-500 hover:text-white transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {projects.find(p => p.id === showSettings)?.files.map(f => (
                  <div key={f.id} className="flex items-center justify-between text-xs bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-slate-300">
                    <span className="truncate flex-1 font-medium">{f.name}</span>
                    <button onClick={() => {
                        const proj = projects.find(p => p.id === showSettings);
                        if (proj) onUpdateProject(showSettings, { files: proj.files.filter(x => x.id !== f.id) });
                    }} className="text-red-400 hover:text-red-300 font-bold ml-3">DEL</button>
                  </div>
                ))}
              </div>
              
              <label className="block border-2 border-dashed border-slate-700 rounded-2xl py-10 text-center cursor-pointer hover:border-slate-500 hover:bg-slate-800/30 transition-all group">
                <input type="file" className="hidden" onChange={(e) => handleFile(e, showSettings)} />
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] group-hover:scale-110 transition-transform block">
                   + Inject Technical Intelligence
                </span>
              </label>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Workspace Label</label>
                <input 
                  className="w-full bg-slate-800 border-none p-4 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Project Label"
                  value={projects.find(p => p.id === showSettings)?.name}
                  onChange={(e) => onUpdateProject(showSettings, { name: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default ProjectList;
