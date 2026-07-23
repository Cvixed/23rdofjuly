"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Plus,
  History,
  Trash2,
  X,
  MessageSquare,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load sessions on mount & purge >7 days old
  useEffect(() => {
    const saved = localStorage.getItem("naia-chat-sessions");
    const now = Date.now();

    if (saved) {
      try {
        const parsed: ChatSession[] = JSON.parse(saved);
        // Filter out sessions older than 7 days
        const validSessions = parsed.filter(
          (s) => now - s.createdAt < SEVEN_DAYS_MS
        );
        setSessions(validSessions);
        if (validSessions.length > 0) {
          setActiveSessionId(validSessions[0].id);
          setMessages(validSessions[0].messages);
        }
      } catch (e) {
        console.error("Failed to load chat sessions", e);
      }
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  const saveSessionsToStorage = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    localStorage.setItem("naia-chat-sessions", JSON.stringify(updatedSessions));
  };

  // Scroll to bottom on message update
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle switching active session
  const selectSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setMessages(session.messages);
    }
    setIsHistoryOpen(false);
  };

  // Start new chat session
  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setIsHistoryOpen(false);
  };

  // Delete specific session
  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== sessionId);
    saveSessionsToStorage(updated);

    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
        setMessages(updated[0].messages);
      } else {
        startNewChat();
      }
    }
  };

  // Clear all history
  const clearAllHistory = () => {
    saveSessionsToStorage([]);
    startNewChat();
  };

  const handleSubmit = async (e: React.FormEvent, presetMessage?: string) => {
    e?.preventDefault();
    const messageText = presetMessage || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Determine or create current session
    let currentSessionId = activeSessionId;
    let updatedSessions = [...sessions];

    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID();
      setActiveSessionId(currentSessionId);
      const title = messageText.trim().length > 30 
        ? messageText.trim().slice(0, 30) + "..." 
        : messageText.trim();

      const newSession: ChatSession = {
        id: currentSessionId,
        title: title,
        createdAt: Date.now(),
        messages: newMessages,
      };
      updatedSessions = [newSession, ...sessions];
    } else {
      updatedSessions = sessions.map((s) =>
        s.id === currentSessionId ? { ...s, messages: newMessages } : s
      );
    }
    saveSessionsToStorage(updatedSessions);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      const currentMood = localStorage.getItem("naia-mood") || "Neutral";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          mood: currentMood,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        let done = false;
        let accumulatedContent = "";
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            accumulatedContent += chunk;
            const updatedWithAssistant = [...newMessages, { ...assistantMessage, content: accumulatedContent }];
            setMessages(updatedWithAssistant);

            // Sync with session storage
            const synced = updatedSessions.map((s) =>
              s.id === currentSessionId ? { ...s, messages: updatedWithAssistant } : s
            );
            saveSessionsToStorage(synced);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const isTimeout = error instanceof DOMException && error.name === "AbortError";
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: isTimeout
          ? "Sorry bnuy, I took too long to think! 🐰 My brain needs a sec. Try again? 💗"
          : "Oops, I'm having trouble connecting right now. But hey, just know that you're amazing and loved, bnuy! 💗 Try again in a moment?",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-100px)] relative">
      {/* Header with Gemini-like Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-6 pb-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-md shadow-pink-200/40">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">NaiaBot</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Always here for you, bnuy 💗
              </p>
            </div>
          </div>
        </div>

        {/* Gemini Action Controls: New Chat & History Drawer */}
        <div className="flex items-center gap-2">
          <button
            onClick={startNewChat}
            className="flex items-center gap-1 text-xs font-semibold bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-800/50 px-3 py-1.5 rounded-xl hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-all shadow-sm"
            title="Start New Chat"
          >
            <Plus size={14} /> New Chat
          </button>
          
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-pink-500 transition-colors"
            title="Chat History"
          >
            <History size={18} />
          </button>
        </div>
      </motion.div>

      {/* History Drawer Overlay */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
            onClick={() => setIsHistoryOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-80 max-w-[85vw] h-full bg-white dark:bg-slate-900 shadow-2xl p-5 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <History size={18} className="text-pink-500" />
                    <h2 className="font-bold text-gray-800 dark:text-white text-base">Chat History</h2>
                  </div>
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-4 space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <button
                    onClick={startNewChat}
                    className="w-full flex items-center gap-2 p-3 rounded-xl border border-dashed border-pink-300 dark:border-pink-800 text-pink-500 dark:text-pink-400 text-sm font-medium hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all"
                  >
                    <Plus size={16} /> + New Chat
                  </button>

                  {sessions.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">
                      No chat history yet!
                    </p>
                  ) : (
                    sessions.map((s) => {
                      const isActive = s.id === activeSessionId;
                      return (
                        <div
                          key={s.id}
                          onClick={() => selectSession(s.id)}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                            isActive
                              ? "bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-800/50 text-pink-600 dark:text-pink-300"
                              : "hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <MessageSquare size={16} className={isActive ? "text-pink-500" : "text-gray-400"} />
                            <span className="text-xs font-medium truncate max-w-[170px]">
                              {s.title}
                            </span>
                          </div>
                          <button
                            onClick={(e) => deleteSession(s.id, e)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete Chat"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {sessions.length > 0 && (
                <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                  <button
                    onClick={clearAllHistory}
                    className="w-full py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={14} /> Clear All History (Auto-resets weekly)
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-pink-400" />
            </div>
            <h3 className="font-semibold text-gray-700 dark:text-white mb-1">
              Hey there, bnuy! 🐰
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px]">
              I&apos;m NaiaBot, your personal companion. Tell me anything —
              I&apos;m all ears! 💕
            </p>
            <div className="mt-6 space-y-2 w-full max-w-[280px]">
              {[
                "How was your day? ☀️",
                "I need some encouragement 💪",
                "Tell me something sweet 💗",
              ].map((suggestion, i) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  onClick={() => handleSubmit(null as any, suggestion)}
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 bg-pink-50/50 dark:bg-pink-900/20 dark:border-pink-800/50 text-sm text-gray-700 dark:text-white hover:bg-pink-100/50 dark:hover:bg-pink-900/40 hover:border-pink-300 dark:hover:border-pink-600 transition-all text-left"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
                  message.role === "assistant"
                    ? "bg-gradient-to-br from-pink-400 to-rose-500"
                    : "bg-gradient-to-br from-violet-400 to-purple-500"
                }`}
              >
                {message.role === "assistant" ? (
                  <Bot size={14} className="text-white" />
                ) : (
                  <User size={14} className="text-white" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-pink-400 to-rose-500 text-white rounded-tr-md"
                    : "glass-card rounded-tl-md text-gray-800 dark:text-white"
                }`}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-pink-400 to-rose-500">
                <Bot size={14} className="text-white" />
              </div>
              <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed glass-card rounded-tl-md text-gray-800 dark:text-white">
                <div className="flex gap-1 py-1">
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-pink-300" />
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-pink-300" />
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-pink-300" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 pb-3 pt-2">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 glass-card rounded-2xl p-2"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-3 py-2 bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none max-h-[120px]"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 transition-opacity shadow-md shadow-pink-200/30"
          >
            <Send size={16} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
