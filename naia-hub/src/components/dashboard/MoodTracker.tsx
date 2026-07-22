"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Smile, Frown, Coffee, CloudRain } from "lucide-react";

export type Mood = "Happy" | "Calm" | "Tired" | "Anxious";

const moods: { type: Mood; icon: React.ReactNode; color: string }[] = [
  { type: "Happy", icon: <Smile size={20} />, color: "hover:bg-yellow-100 hover:text-yellow-600 border-yellow-200" },
  { type: "Calm", icon: <Coffee size={20} />, color: "hover:bg-green-100 hover:text-green-600 border-green-200" },
  { type: "Tired", icon: <CloudRain size={20} />, color: "hover:bg-blue-100 hover:text-blue-600 border-blue-200" },
  { type: "Anxious", icon: <Frown size={20} />, color: "hover:bg-indigo-100 hover:text-indigo-600 border-indigo-200" },
];

export default function MoodTracker() {
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("naia-mood");
    if (saved) setCurrentMood(saved as Mood);
  }, []);

  const handleMoodSelect = (mood: Mood) => {
    setCurrentMood(mood);
    localStorage.setItem("naia-mood", mood);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card rounded-2xl p-5"
    >
      <h2 className="font-semibold text-gray-800 text-sm mb-3">
        How are you feeling right now?
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {moods.map((m) => {
          const isSelected = currentMood === m.type;
          return (
            <button
              key={m.type}
              onClick={() => handleMoodSelect(m.type)}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all ${
                isSelected
                  ? `bg-white shadow-md border-pink-400 scale-105`
                  : `bg-white/40 border-gray-100 text-gray-500 ${m.color}`
              }`}
            >
              <div className={`${isSelected ? "text-pink-500" : ""}`}>{m.icon}</div>
              <span className={`text-[10px] font-medium uppercase tracking-wider ${isSelected ? "text-pink-600" : ""}`}>
                {m.type}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
