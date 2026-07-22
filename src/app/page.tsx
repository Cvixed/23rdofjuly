"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Lock, Sparkles } from "lucide-react";
import { SECRET_PIN } from "@/lib/constants";

function FloatingParticle({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.div
      className="absolute text-pink-300/40 pointer-events-none select-none"
      initial={{ y: "100vh", x: `${x}vw`, opacity: 0, scale: 0.5 }}
      animate={{
        y: "-10vh",
        opacity: [0, 0.7, 0],
        scale: [0.5, 1, 0.5],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 8 + Math.random() * 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {Math.random() > 0.5 ? (
        <Heart size={16 + Math.random() * 16} fill="currentColor" />
      ) : (
        <Sparkles size={14 + Math.random() * 12} />
      )}
    </motion.div>
  );
}

export default function PinLoginPage() {
  const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const isAuth = sessionStorage.getItem("naia-auth");
    if (isAuth === "true") {
      router.replace("/dashboard");
    }
  }, [router]);

  const handlePinInput = useCallback(
    (digit: string) => {
      if (activeIndex >= 6 || success) return;
      const newPin = [...pin];
      newPin[activeIndex] = digit;
      setPin(newPin);
      setError(false);

      if (activeIndex === 5) {
        const enteredPin = newPin.join("");
        if (enteredPin === SECRET_PIN) {
          setSuccess(true);
          sessionStorage.setItem("naia-auth", "true");
          setTimeout(() => {
            router.push("/dashboard");
          }, 2500);
        } else {
          setError(true);
          setTimeout(() => {
            setPin(["", "", "", "", "", ""]);
            setActiveIndex(0);
            setError(false);
          }, 1200);
        }
      } else {
        setActiveIndex(activeIndex + 1);
      }
    },
    [activeIndex, pin, success, router]
  );

  const handleDelete = useCallback(() => {
    if (activeIndex <= 0) return;
    const newPin = [...pin];
    newPin[activeIndex - 1] = "";
    setPin(newPin);
    setActiveIndex(activeIndex - 1);
    setError(false);
  }, [activeIndex, pin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handlePinInput(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePinInput, handleDelete]);

  if (!mounted) return null;

  const numpadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.6}
            x={Math.random() * 100}
          />
        ))}
      </div>

      {/* Glassmorphism Overlay Circles */}
      <motion.div
        className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-pink-300/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-80px] right-[-80px] w-[350px] h-[350px] rounded-full bg-purple-300/20 blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -25, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="glass-card rounded-3xl p-8 text-center">
          {/* Lock Icon */}
          <motion.div
            className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-300/40"
            animate={
              error
                ? { x: [-10, 10, -10, 10, 0] }
                : success
                ? { scale: [1, 1.2, 1], rotate: [0, 360] }
                : {}
            }
            transition={
              error
                ? { duration: 0.4 }
                : success
                ? { duration: 0.8 }
                : {}
            }
          >
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="heart"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Heart
                    size={28}
                    className="text-white"
                    fill="white"
                  />
                </motion.div>
              ) : (
                <motion.div key="lock">
                  <Lock size={28} className="text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1 font-display">
            {success ? "Welcome Back" : "Hey There ♡"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-white mb-6">
            {success
              ? "Identity Confirmed"
              : "Enter your special code to continue"}
          </p>

          {/* PIN Dots */}
          <div className="flex justify-center gap-3 mb-8">
            {pin.map((digit, i) => (
              <motion.div
                key={i}
                className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                  error
                    ? "border-red-400 bg-red-50"
                    : success
                    ? "border-green-400 bg-green-50"
                    : digit
                    ? "border-pink-400 bg-pink-50"
                    : i === activeIndex
                    ? "border-pink-400 bg-white shadow-md shadow-pink-200/50"
                    : "border-gray-200 bg-white/50"
                }`}
                animate={
                  digit
                    ? { scale: [1, 1.15, 1] }
                    : i === activeIndex
                    ? { scale: [1, 1.03, 1] }
                    : {}
                }
                transition={
                  digit
                    ? { duration: 0.2 }
                    : { duration: 1.5, repeat: Infinity }
                }
              >
                {digit && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-3 h-3 rounded-full ${
                      error
                        ? "bg-red-400"
                        : success
                        ? "bg-green-400"
                        : "bg-pink-400"
                    }`}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-sm mb-4"
              >
                Hmm, that&apos;s not right. Try again! 💕
              </motion.p>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <p className="text-pink-500 font-semibold text-lg font-display">
                  Welcome, My Queen 👑
                </p>
                <p className="text-gray-400 dark:text-white text-xs mt-1">
                  Preparing your space...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Numpad */}
          {!success && (
            <motion.div
              className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {numpadKeys.map((key, i) => {
                if (key === "") return <div key={i} />;
                if (key === "del") {
                  return (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleDelete}
                      className="h-14 rounded-2xl bg-white/60 hover:bg-white/80 border border-gray-200/50 text-gray-500 dark:text-white text-sm font-medium transition-all duration-200 active:bg-pink-50"
                    >
                      ←
                    </motion.button>
                  );
                }
                return (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePinInput(key)}
                    className="h-14 rounded-2xl bg-white/60 hover:bg-white/80 border border-gray-200/50 text-gray-700 dark:text-white text-xl font-medium transition-all duration-200 active:bg-pink-50 active:border-pink-300"
                  >
                    {key}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
