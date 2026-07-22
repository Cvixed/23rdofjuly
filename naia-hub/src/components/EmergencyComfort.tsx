"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { comfortMessages } from "@/lib/quotes";

export default function EmergencyComfort() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");

  useEffect(() => {
    if (isOpen) {
      setMessage(comfortMessages[Math.floor(Math.random() * comfortMessages.length)]);
      
      // Breathing cycle: 4s Inhale, 7s Hold, 8s Exhale
      const runCycle = () => {
        setPhase("Inhale");
        setTimeout(() => {
          setPhase("Hold");
          setTimeout(() => {
            setPhase("Exhale");
          }, 7000);
        }, 4000);
      };

      runCycle();
      const interval = setInterval(runCycle, 19000); // 4 + 7 + 8 = 19s total
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-xl shadow-pink-500/30 flex items-center justify-center border-2 border-white/50"
        title="Need a hug?"
      >
        <Heart className="text-white animate-pulse" fill="white" size={24} />
      </motion.button>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md p-6"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2"
            >
              <X size={32} />
            </button>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/80 font-display text-2xl md:text-3xl text-center mb-16 max-w-md"
            >
              &ldquo;{message}&rdquo;
            </motion.p>

            {/* Breathing Circle Container */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <motion.div
                animate={{
                  scale: phase === "Inhale" ? 1.5 : phase === "Hold" ? 1.5 : 1,
                  opacity: phase === "Inhale" ? 0.3 : phase === "Hold" ? 0.5 : 0.1,
                }}
                transition={{
                  duration: phase === "Inhale" ? 4 : phase === "Hold" ? 7 : 8,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-pink-400"
              />
              
              {/* Inner Circle */}
              <div className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center shadow-[0_0_40px_rgba(251,207,232,0.5)]">
                <motion.span
                  key={phase}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-white font-bold tracking-widest uppercase text-sm"
                >
                  {phase}
                </motion.span>
              </div>
            </div>

            <p className="text-white/40 mt-16 text-sm">Breathe with the circle...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
