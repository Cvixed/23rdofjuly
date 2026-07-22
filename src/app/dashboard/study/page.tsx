"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Music } from "lucide-react";
import AIFlashcards from "@/components/study/AIFlashcards";
import Image from "next/image";

export default function StudyRoomPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  
  // Audio ref for a soft bell sound when timer ends (optional, omitting actual file for now)
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer finished!
      setIsActive(false);
      // Toggle break/work
      if (!isBreak) {
        setIsBreak(true);
        setTimeLeft(5 * 60); // 5 min break
      } else {
        setIsBreak(false);
        setTimeLeft(25 * 60); // back to work
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, timeLeft, isBreak]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const content = (
    <div className={`max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5 ${isZenMode ? "h-screen flex flex-col justify-center max-w-lg" : ""}`}>
      {/* Header */}
      {!isZenMode && (
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Study Room 📚
          </h1>
          <button 
            onClick={() => setIsZenMode(true)}
            className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
          >
            <Maximize2 size={12} /> Zen Mode
          </button>
        </div>
      )}

      {isZenMode && (
        <button 
          onClick={() => setIsZenMode(false)}
          className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[100]"
        >
          <Minimize2 size={32} />
        </button>
      )}

      {/* Pomodoro Timer */}
      <motion.div
        layout
        className={`glass-card rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden ${
          isZenMode ? "bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl" : ""
        }`}
      >
        {isZenMode && <div className="absolute inset-0 bg-slate-900/40 -z-10" />}

        <div className="flex items-center gap-2 mb-6">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
            !isBreak ? "bg-rose-100 text-rose-600" : "bg-transparent text-gray-400"
          }`}>
            Focus
          </span>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
            isBreak ? "bg-green-100 text-green-600" : "bg-transparent text-gray-400"
          }`}>
            Break
          </span>
        </div>

        <motion.h2 
          className={`font-display text-7xl md:text-8xl tracking-tight mb-8 ${
            isZenMode ? "text-white" : "text-gray-800"
          }`}
          animate={{ scale: isActive ? 1.05 : 1 }}
          transition={{ duration: 1, repeat: isActive ? Infinity : 0, repeatType: "reverse" }}
        >
          {formatTime(timeLeft)}
        </motion.h2>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 ${
              isActive 
                ? "bg-white text-rose-500 border-2 border-rose-100" 
                : "bg-gradient-to-br from-rose-400 to-pink-500 text-white"
            }`}
          >
            {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          
          <button
            onClick={resetTimer}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isZenMode ? "bg-white/10 text-white hover:bg-white/20" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {isActive && !isBreak && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-8 text-sm italic ${isZenMode ? "text-white/70" : "text-gray-500"}`}
          >
            "You're doing great, bnuy! Keep going!" 🐰
          </motion.p>
        )}
      </motion.div>

      {/* Lofi Player & AI Flashcards (Hidden in Zen Mode) */}
      {!isZenMode && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-6">
          <AIFlashcards />

          <div className="glass-card rounded-2xl p-5 mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Music size={16} className="text-white" />
              </div>
              <h2 className="font-semibold text-gray-800 text-sm">Lofi Study Beats</h2>
            </div>
            <iframe
              style={{ borderRadius: "12px" }}
              src="https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0"
              width="100%"
              height="152"
              frameBorder="0"
              allowFullScreen={false}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
          </div>
        </motion.div>
      )}
    </div>
  );

  if (isZenMode) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-6">
        {/* Render a dark Magical Orbs background for Zen Mode */}
        <div className="absolute inset-0 pointer-events-none opacity-50">
           <motion.div
              animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[100px]"
            />
            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/20 blur-[120px]"
            />
        </div>
        
        {content}
      </div>
    );
  }

  return content;
}
