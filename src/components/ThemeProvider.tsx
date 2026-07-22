"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    // Dark mode active between 8 PM (20) and 6 AM
    if (hour >= 20 || hour < 6) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {mounted && isDark ? (
          // Sleepy Bnuy Mode (Dark Orbs & Stars)
          <>
            <motion.div
              animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[100px]"
            />
            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/10 blur-[120px]"
            />
          </>
        ) : mounted ? (
          // Magical Orbs (Light Mode)
          <>
            <motion.div
              animate={{ x: [0, 60, -30, 0], y: [0, -40, 40, 0], scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[10%] left-[-5%] w-[40vw] h-[40vw] bg-pink-400/40 rounded-full blur-[80px]"
            />
            <motion.div
              animate={{ x: [0, -80, 50, 0], y: [0, 60, -30, 0], scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[5%] right-[-10%] w-[50vw] h-[50vw] bg-purple-400/40 rounded-full blur-[90px]"
            />
            <motion.div
              animate={{ x: [0, 40, -60, 0], y: [0, 50, -40, 0], scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[40%] left-[20%] w-[35vw] h-[35vw] bg-rose-300/40 rounded-full blur-[80px]"
            />
          </>
        ) : null}
      </div>
      {children}
    </>
  );
}
