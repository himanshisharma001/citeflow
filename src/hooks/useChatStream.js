import { useState, useRef } from 'react';

export const useChatStream = (apiBaseUrl = 'http://localhost:5000') => {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef(null);

  const sendMessage = async (prompt, pages = [], currentMessages = [], onUpdateMessages) => {
    if (!prompt.trim() || isStreaming) return;

    const token = localStorage.getItem('citeflow_token');
    const userMsg = { role: 'user', content: prompt };
    
    // Create initial list with a temporary assistant bubble
    const initialList = [...currentMessages, userMsg, { role: 'assistant', content: '...' }];
    onUpdateMessages(initialList);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, pages }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let accumulatedText = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataContent = line.replace('data: ', '').trim();
              if (dataContent === '[DONE]') break;

              try {
                const parsed = JSON.parse(dataContent);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  const updated = [...currentMessages, userMsg, { role: 'assistant', content: accumulatedText }];
                  onUpdateMessages(updated);
                }
              } catch (err) {}
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const updated = [
          ...currentMessages,
          userMsg,
          { role: 'assistant', content: `⚠️ ${err.message}` },
        ];
        onUpdateMessages(updated);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const stopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  return { isStreaming, sendMessage, stopStream };
};