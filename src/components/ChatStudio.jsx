import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Square,
  Lightbulb,
  Copy,
  Check,
  RotateCcw,
  Download,
  History,
  Clock,
} from 'lucide-react';

export const ChatStudio = ({
  onCitationClick,
  messages = [],
  onSendMessage,
  onClearChat,
  onToggleSidebar,
  isStreaming,
  cooldownSeconds = 0,
  onStopStream,
  isVisibleMobile,
  hasDocument,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const starterPrompts = [
    'Summarize this document in 3 bullet points',
    'What are the core technical skills mentioned?',
    'List all professional experience and roles',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isStreaming || cooldownSeconds > 0) return;
    onSendMessage(inputPrompt);
    setInputPrompt('');
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExport = () => {
    const chatExport = messages
      .map((m) => `${m.role.toUpperCase()}:\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([chatExport], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CiteFlow-Analysis.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatAssistantText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={`h3-${lineIdx}`} className="text-sm font-bold text-sky-300 mt-3 mb-1">
            {trimmed.replace(/^###\s+/, '')}
          </h3>
        );
      }

      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={`h2-${lineIdx}`} className="text-base font-bold text-white mt-4 mb-1.5 border-b border-slate-800 pb-1">
            {trimmed.replace(/^##\s+/, '')}
          </h2>
        );
      }

      const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ');
      const cleanLine = isBullet ? trimmed.replace(/^[\*\-]\s+/, '') : line;
      const regex = /(\[Page\s*\d+\]|\*\*[^*]+\*\*)/gi;
      const parts = cleanLine.split(regex);

      const parsedSegments = parts.map((part, partIdx) => {
        if (/^\[Page\s*(\d+)\]$/i.test(part)) {
          const match = part.match(/\d+/);
          const pageNum = match ? parseInt(match[0], 10) : 1;
          return (
            <button
              key={`cite-${lineIdx}-${partIdx}`}
              onClick={() => onCitationClick(pageNum)}
              className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full bg-sky-950 border border-sky-400/60 text-sky-300 hover:bg-sky-900 text-xs font-semibold transition-transform active:scale-95 shadow-sm align-middle"
            >
              📄 Page {pageNum}
            </button>
          );
        }

        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={`b-${lineIdx}-${partIdx}`} className="font-semibold text-slate-100">
              {part.slice(2, -2)}
            </strong>
          );
        }

        return part;
      });

      if (isBullet) {
        return (
          <li key={`li-${lineIdx}`} className="ml-4 list-disc text-slate-300 my-1">
            {parsedSegments}
          </li>
        );
      }

      if (!trimmed) return <div key={`empty-${lineIdx}`} className="h-1.5" />;

      return (
        <p key={`p-${lineIdx}`} className="my-1 leading-relaxed text-slate-300">
          {parsedSegments}
        </p>
      );
    });
  };

  return (
    <div
      className={`h-full flex-col bg-slate-900/30 ${
        isVisibleMobile ? 'flex w-full' : 'hidden'
      } md:flex md:w-[45%]`}
    >
      {/* Studio Header */}
      <div className="h-11 bg-slate-900/40 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 text-xs"
            title="Chat History"
          >
            <History className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline text-[11px]">History</span>
          </button>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-semibold text-slate-200">AI Assistant</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <>
              <button
                onClick={handleExport}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                title="Export Conversation (.md)"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClearChat}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition-colors"
                title="Clear Chat History"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {cooldownSeconds > 0 ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3 animate-spin" />
              <span>{cooldownSeconds}s</span>
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-slate-400 font-mono">
                {isStreaming ? 'Streaming...' : 'Ready'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 sm:gap-3 text-xs sm:text-sm group ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center flex-shrink-0 text-sky-400 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className="flex flex-col gap-1 max-w-[90%] sm:max-w-[85%]">
              <div
                className={`rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.role === 'assistant' ? formatAssistantText(msg.content) : msg.content}
              </div>

              {msg.role === 'assistant' && msg.content && !msg.content.startsWith('⚠️') && (
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 py-0.5 px-1.5 rounded bg-slate-950/40"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {hasDocument && messages.length <= 1 && (
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
              <span>Suggested Prompts</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {starterPrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => onSendMessage(prompt)}
                  className="text-xs bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/50 text-slate-300 px-3 py-1.5 rounded-lg transition-all text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex-shrink-0"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={
              cooldownSeconds > 0
                ? `Cooling down (${cooldownSeconds}s)...`
                : 'Ask anything about this document...'
            }
            disabled={isStreaming || cooldownSeconds > 0}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-3.5 sm:pl-4 pr-12 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors disabled:opacity-50"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={onStopStream}
              className="absolute right-1.5 p-2 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-colors"
              title="Stop Generation"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputPrompt.trim() || cooldownSeconds > 0}
              className="absolute right-1.5 p-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-30 disabled:hover:bg-sky-600 transition-colors"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};