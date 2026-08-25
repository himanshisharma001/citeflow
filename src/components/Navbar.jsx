import React from 'react';
import { FileText, Upload, Sparkles, LogOut, User } from 'lucide-react';

export const Navbar = ({
  documentName,
  pageCount,
  onUploadClick,
  activeMobileTab,
  setActiveMobileTab,
  user,
  onLogout,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur px-2.5 sm:px-6 flex items-center justify-between flex-shrink-0 z-20 w-full overflow-hidden">
      {/* Brand */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white shadow-md shadow-sky-600/30 text-xs sm:text-sm flex-shrink-0">
          CF
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="font-bold text-sm sm:text-base tracking-tight text-white">
            CiteFlow
          </span>
          <span className="text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded">
            STUDIO
          </span>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="flex md:hidden bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs flex-shrink-0 mx-1">
        <button
          onClick={() => setActiveMobileTab('pdf')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
            activeMobileTab === 'pdf'
              ? 'bg-sky-600 text-white font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>PDF</span>
        </button>
        <button
          onClick={() => setActiveMobileTab('chat')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
            activeMobileTab === 'chat'
              ? 'bg-sky-600 text-white font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        {documentName && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300 max-w-[180px] truncate">
            <FileText className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
            <span className="truncate">{documentName}</span>
            {pageCount > 0 && (
              <span className="text-slate-500 font-mono text-[10px] pl-1 border-l border-slate-800">
                {pageCount}p
              </span>
            )}
          </div>
        )}

        <button
          onClick={onUploadClick}
          className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all shadow-md shadow-sky-600/20 active:scale-95 flex-shrink-0"
          title="Upload PDF"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload PDF</span>
        </button>

        {user && (
          <div className="flex items-center gap-1 pl-1 sm:pl-2 border-l border-slate-800">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span className="truncate max-w-[90px]">{user.name || 'User'}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};