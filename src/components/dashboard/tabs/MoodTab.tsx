"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smile,
  Moon as MoonIcon,
  Frown,
  Heart,
  Music,
  Camera,
  ArrowLeft,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  comfortMessages,
  missingYouMessages,
  happyMessages,
  getRandomQuote,
} from "@/lib/quotes";
import { PLAYLISTS, COUPLE_PHOTOS } from "@/lib/constants";
import Image from "next/image";

type Mood = "happy" | "tired" | "stressed" | "missing" | null;

const moodConfig = {
  happy: {
    emoji: "😊",
    label: "Happy",
    icon: Smile,
    color: "from-amber-400 to-orange-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800/50",
  },
  tired: {
    emoji: "🥱",
    label: "Tired",
    icon: MoonIcon,
    color: "from-blue-400 to-indigo-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800/50",
  },
  stressed: {
    emoji: "😫",
    label: "Stressed",
    icon: Frown,
    color: "from-purple-400 to-violet-400",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800/50",
  },
  missing: {
    emoji: "🥺",
    label: "Missing You",
    icon: Heart,
    color: "from-pink-400 to-rose-400",
    bg: "bg-pink-50 dark:bg-pink-900/20",
    border: "border-pink-200 dark:border-pink-800/50",
  },
};

function PhotoGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const photos = COUPLE_PHOTOS.slice(0, 9);

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <motion.div
            key={photo}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => setSelectedPhoto(photo)}
          >
            <Image
              src={photo}
              alt={`Our memory ${i + 1}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 512px) 33vw, 170px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-md w-full aspect-square rounded-2xl overflow-hidden"
            >
              <Image
                src={selectedPhoto}
                alt="Our memory"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState<Mood>(null);
  const [moodMessage, setMoodMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<{ mood: NonNullable<Mood>; timestamp: string }[]>([]);

  useEffect(() => {
    setMounted(true);
    const savedLogs = JSON.parse(localStorage.getItem("naia-mood-logs") || "[]");
    savedLogs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setLogs(savedLogs.slice(0, 5));
  }, []);

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#FFB6C1", "#FF69B4", "#FFD700", "#FF1493", "#FFC0CB"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const handleMoodSelect = useCallback(
    (mood: Mood) => {
      if (!mood) return;
      setSelectedMood(mood);

      // Save to localStorage
      const prevLogs = JSON.parse(localStorage.getItem("naia-mood-logs") || "[]");
      const newEntry = { mood, timestamp: new Date().toISOString() };
      prevLogs.push(newEntry);
      localStorage.setItem("naia-mood-logs", JSON.stringify(prevLogs));
      
      prevLogs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(prevLogs.slice(0, 5));

      // Set appropriate message
      switch (mood) {
        case "happy":
          setMoodMessage(getRandomQuote(happyMessages));
          setTimeout(fireConfetti, 300);
          break;
        case "tired":
        case "stressed":
          setMoodMessage(getRandomQuote(comfortMessages));
          break;
        case "missing":
          setMoodMessage(getRandomQuote(missingYouMessages));
          break;
      }
    },
    [fireConfetti]
  );

  const handleReset = () => {
    setSelectedMood(null);
    setMoodMessage("");
  };

  if (!mounted) return null;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          {selectedMood && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleReset}
              className="text-gray-500 dark:text-gray-300 hover:text-pink-400 transition-colors"
            >
              <ArrowLeft size={20} />
            </motion.button>
          )}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            How are you feeling?
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {selectedMood
            ? "I'm here for you, always. 💗"
            : "Tap on your current mood, bnuy ~"}
        </p>
      </motion.div>

      {/* Mood Selection Grid */}
      <AnimatePresence mode="wait">
        {!selectedMood ? (
          <motion.div
            key="mood-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(moodConfig) as Array<keyof typeof moodConfig>).map(
                (mood, i) => {
                  const config = moodConfig[mood];
                  return (
                    <motion.button
                      key={mood}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleMoodSelect(mood)}
                      className={`glass-card rounded-2xl p-6 text-center border ${config.border} hover:shadow-lg transition-all duration-300 group`}
                    >
                      <motion.div
                        className="text-5xl mb-3"
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      >
                        {config.emoji}
                      </motion.div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-white group-hover:text-pink-500 transition-colors">
                        {config.label}
                      </p>
                    </motion.button>
                  );
                }
              )}
            </div>

            {/* Mood History Section */}
            {logs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 col-span-2"
              >
                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 px-2">
                  Recent Moods
                </h2>
                <div className="space-y-3">
                  {logs.map((log, i) => {
                    const config = moodConfig[log.mood];
                    if (!config) return null;
                    const date = new Date(log.timestamp);
                    return (
                      <div key={i} className={`glass-card rounded-2xl p-4 flex items-center justify-between border ${config.border}`}>
                        <div className="flex items-center gap-3">
                           <span className="text-2xl">{config.emoji}</span>
                           <span className="font-medium text-gray-700 dark:text-white">{config.label}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="mood-response"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Selected Mood Card */}
            <div
              className={`rounded-2xl p-5 ${moodConfig[selectedMood].bg} border ${moodConfig[selectedMood].border}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">
                  {moodConfig[selectedMood].emoji}
                </span>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    Feeling {moodConfig[selectedMood].label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed italic">
                &ldquo;{moodMessage}&rdquo;
              </p>
            </div>

            {/* Conditional Content */}
            {(selectedMood === "tired" || selectedMood === "stressed") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                {/* Spotify Embed */}
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Music size={18} className="text-green-500" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-white">
                      Some music to calm your soul 🎵
                    </h3>
                  </div>
                  <div className="rounded-xl overflow-hidden">
                    <iframe
                      src={PLAYLISTS[0]}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Cute Photos */}
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Camera size={18} className="text-pink-500" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-white">
                      Something to make you smile 📸
                    </h3>
                  </div>
                  <PhotoGallery />
                </div>
              </motion.div>
            )}

            {selectedMood === "missing" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                {/* Photo Collage */}
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart
                      size={18}
                      className="text-pink-500"
                      fill="currentColor"
                    />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-white">
                      Our precious memories together 💕
                    </h3>
                  </div>
                  <PhotoGallery />
                </div>

                {/* Spotify for Missing */}
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Music size={18} className="text-green-500" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-white">
                      Our playlist 🎶
                    </h3>
                  </div>
                  <div className="rounded-xl overflow-hidden">
                    <iframe
                      src={PLAYLISTS[1]}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {selectedMood === "happy" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                {/* Celebration */}
                <div className="glass-card rounded-2xl p-6 text-center">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{
                      duration: 0.5,
                      repeat: 3,
                      repeatDelay: 1,
                    }}
                    className="text-6xl mb-3 inline-block"
                  >
                    🎉
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                    Yaaay! Love to see it!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Your happiness is the most beautiful thing, bnuy. Keep
                    shining! ✨
                  </p>
                </div>

                {/* Happy Spotify */}
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Music size={18} className="text-green-500" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-white">
                      Keep the vibes going! 🎵
                    </h3>
                  </div>
                  <div className="rounded-xl overflow-hidden">
                    <iframe
                      src={PLAYLISTS[2]}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
