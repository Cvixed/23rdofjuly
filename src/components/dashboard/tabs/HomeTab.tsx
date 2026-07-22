"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Sun,
  Moon,
  CloudSun,
  PartyPopper,
  RefreshCw,
  Camera,
} from "lucide-react";
import { loveNotes, getRandomQuote } from "@/lib/quotes";
import { NAIA_PHOTOS } from "@/lib/constants";
import Image from "next/image";
import ComplexTodo from "@/components/dashboard/ComplexTodo";
import MoodTracker from "@/components/dashboard/MoodTracker";

function getGreeting(): { text: string; icon: React.ReactNode; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return {
      text: "Good Morning",
      icon: <Sun size={24} className="text-amber-400" />,
      emoji: "🌅",
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      text: "Good Afternoon",
      icon: <CloudSun size={24} className="text-orange-400" />,
      emoji: "☀️",
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      text: "Good Evening",
      icon: <CloudSun size={24} className="text-purple-400" />,
      emoji: "🌆",
    };
  } else {
    return {
      text: "Good Night",
      icon: <Moon size={24} className="text-indigo-400" />,
      emoji: "🌙",
    };
  }
}

function isBirthdayToday(): boolean {
  const now = new Date();
  return now.getMonth() === 6 && now.getDate() === 23; // July is month 6 (0-indexed)
}

export default function DashboardPage() {
  const [currentQuote, setCurrentQuote] = useState("");
  const [randomPhoto, setRandomPhoto] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentQuote(getRandomQuote(loveNotes));
    setRandomPhoto(NAIA_PHOTOS[Math.floor(Math.random() * NAIA_PHOTOS.length)]);
  }, []);

  const shuffleQuote = () => {
    let newQuote = currentQuote;
    while (newQuote === currentQuote) {
      newQuote = getRandomQuote(loveNotes);
    }
    setCurrentQuote(newQuote);
  };

  if (!mounted) return null;

  const greeting = getGreeting();
  const birthday = isBirthdayToday();

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5">
      {/* Birthday Banner */}
      <AnimatePresence>
        {birthday && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 p-5 text-white shadow-xl shadow-pink-300/30"
          >
            <div className="absolute top-2 right-3 text-3xl animate-bounce">
              🎂
            </div>
            <div className="absolute bottom-1 left-3 opacity-50">
              <PartyPopper size={40} />
            </div>
            <h2 className="text-2xl font-display font-bold mb-1">
              Happy Birthday, Bnuy! 🎉
            </h2>
            <p className="text-sm text-white/90">
              Today is YOUR day! You deserve all the love, joy, and happiness in
              the world. I love you more than words can say. 💗
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2.5 mb-1">
          {greeting.icon}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {greeting.text}, <span className="text-pink-500">Bnuy</span>{" "}
            <span className="text-xl">{greeting.emoji}</span>
          </h1>
        </div>
        <p className="text-gray-500 dark:text-white text-sm ml-0.5">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </motion.div>

      <MoodTracker />

      {/* Complex To-Do Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-2 pb-2"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-800 dark:text-white text-lg">My Tasks</h2>
            <p className="text-xs text-gray-500 dark:text-white">Organize your day, bnuy ✨</p>
          </div>
        </div>
        
        <ComplexTodo />
      </motion.div>

      {/* Love Note Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-200/30 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-white text-sm">
              Daily Love Note
            </h2>
          </div>
          <motion.button
            whileTap={{ rotate: 180, scale: 0.9 }}
            onClick={shuffleQuote}
            className="text-gray-400 dark:text-white hover:text-pink-400 transition-colors p-1"
          >
            <RefreshCw size={16} />
          </motion.button>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentQuote}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-gray-600 dark:text-white text-sm leading-relaxed italic"
          >
            &ldquo;{currentQuote}&rdquo;
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Naia's Photo Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-5 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
            <Camera size={16} className="text-white" />
          </div>
          <h2 className="font-semibold text-gray-800 dark:text-white text-sm">
            For My Queen 👑
          </h2>
        </div>
        <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-inner bg-pink-50 group">
          {randomPhoto && (
            <Image
              src={randomPhoto}
              alt="Naia"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 512px) 100vw, 512px"
            />
          )}
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-white mt-3 italic">
          The most beautiful girl in the world 💗
        </p>
      </motion.div>
    </div>
  );
}
