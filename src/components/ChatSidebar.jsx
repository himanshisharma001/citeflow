import React from 'react';
import { MessageSquare, Plus, Trash2, X, Clock } from 'lucide-react';

export const ChatSidebar = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-72 bg-slate-950 border-r border-slate-800 z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:hidden'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-14 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all shadow-md shadow-sky-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          
          <button
            onClick={onClose}
            className="md:hidden ml-2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 px-2 py-1 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>Chat History</span>
          </div>

          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  if (window.innerWidth < 768) onClose();
                }}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-xs transition-all ${
                  isActive
                    ? 'bg-slate-800/90 text-sky-400 border border-slate-700 font-medium'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                  <span className="truncate">{session.title}</span>
                </div>

                <button
                  onClick={(e) => onDeleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-500 transition-opacity"
                  title="Delete Chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 text-center font-mono">
          CiteFlow Workspace
        </div>
      </aside>
    </>
  );
};