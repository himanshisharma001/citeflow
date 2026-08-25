import { useState, useEffect } from 'react';

const STORAGE_KEY = 'citeflow_chat_sessions_v1';

const createDefaultSession = () => ({
  id: `session_${Date.now()}`,
  title: 'New Conversation',
  createdAt: Date.now(),
  messages: [
    {
      role: 'assistant',
      content:
        'Upload a document to begin. When answering questions, citations will appear like [Page 1] for direct navigation. You can also ask any general or web-search questions!',
    },
  ],
});

export const useChatSessions = () => {
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
    return [createDefaultSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return sessions[0]?.id || `session_${Date.now()}`;
  });

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save chat sessions:', e);
    }
  }, [sessions]);

  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Start a fresh chat
  const createNewSession = () => {
    const newSession = createDefaultSession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession;
  };

  // Delete a chat session
  const deleteSession = (sessionId, e) => {
    e?.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fallback = createDefaultSession();
        setActiveSessionId(fallback.id);
        return [fallback];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Update messages of active session and auto-generate clean title
  const updateActiveMessages = (newMessages) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== activeSessionId) return session;

        let title = session.title;
        // Auto-title from the first user message if still default
        if (title === 'New Conversation' || title === 'Untitled Chat') {
          const firstUserMsg = newMessages.find((m) => m.role === 'user');
          if (firstUserMsg) {
            title = firstUserMsg.content.slice(0, 28) + (firstUserMsg.content.length > 28 ? '...' : '');
          }
        }

        return {
          ...session,
          title,
          messages: newMessages,
          updatedAt: Date.now(),
        };
      })
    );
  };

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    currentSession,
    createNewSession,
    deleteSession,
    updateActiveMessages,
  };
};