"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RefreshCw, ChevronRight } from "lucide-react";

interface Flashcard {
  question: string;
  answer: string;
}

export default function AIFlashcards() {
  const [inputText, setInputText] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const generateFlashcards = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setFlashcards([]);
    setCurrentIndex(0);
    setIsFlipped(false);

    try {
      const res = await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (data.flashcards) {
        setFlashcards(data.flashcards);
      }
    } catch (e) {
      console.error("Failed to fetch flashcards", e);
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const reset = () => {
    setFlashcards([]);
    setInputText("");
  };

  return (
    <div className="glass-card rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-800 text-sm">AI Study Buddy</h2>
          <p className="text-xs text-gray-500">Paste your notes, I'll quiz you!</p>
        </div>
      </div>

      {flashcards.length === 0 ? (
        <div className="space-y-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your study material here (e.g., Biology notes, History text)..."
            className="w-full h-32 text-sm bg-white/60 border border-purple-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none shadow-inner"
          />
          <button
            onClick={generateFlashcards}
            disabled={!inputText.trim() || isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {isLoading ? "Generating Flashcards..." : "Generate Magic Flashcards"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Card {currentIndex + 1} of {flashcards.length}</span>
            <button onClick={reset} className="flex items-center gap-1 hover:text-purple-500 transition-colors">
              <RefreshCw size={12} /> Start Over
            </button>
          </div>

          <div className="perspective-1000 relative w-full h-48 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
              initial={false}
              animate={{ rotateX: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
              className="w-full h-full preserve-3d relative"
            >
              {/* Front (Question) */}
              <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-white to-purple-50 rounded-xl border border-purple-100 shadow-md flex items-center justify-center p-6 text-center">
                <p className="text-gray-700 font-medium">{flashcards[currentIndex].question}</p>
                <div className="absolute bottom-3 text-[10px] text-purple-400 font-medium uppercase tracking-wider">Tap to flip</div>
              </div>

              {/* Back (Answer) */}
              <div
                className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md flex items-center justify-center p-6 text-center"
                style={{ transform: "rotateX(180deg)" }}
              >
                <p className="text-white font-medium">{flashcards[currentIndex].answer}</p>
              </div>
            </motion.div>
          </div>

          <button
            onClick={nextCard}
            className="w-full py-3 rounded-xl bg-purple-50 text-purple-600 font-medium text-sm flex items-center justify-center gap-2 hover:bg-purple-100 transition-colors"
          >
            Next Card <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
