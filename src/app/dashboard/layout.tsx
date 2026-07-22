"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, SmilePlus, MessageCircleHeart, BookOpen } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/mood", label: "Mood", icon: SmilePlus },
  { href: "/dashboard/study", label: "Study", icon: BookOpen },
  { href: "/dashboard/chat", label: "Chat", icon: MessageCircleHeart },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isAuth = sessionStorage.getItem("naia-auth");
    if (isAuth !== "true") {
      router.replace("/");
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-pink-400 text-4xl"
        >
          ♡
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/50 to-purple-50/30 flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-lg">
          <div className="mx-3 mb-3 rounded-2xl glass-card border border-white/30 shadow-lg shadow-pink-200/20">
            <div className="flex items-center justify-around py-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative flex flex-col items-center gap-0.5 px-6 py-2 group"
                  >
                    <div className="relative">
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 -m-2 rounded-xl bg-pink-100/80"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                      <Icon
                        size={22}
                        className={`relative z-10 transition-colors duration-200 ${
                          isActive
                            ? "text-pink-500"
                            : "text-gray-400 group-hover:text-pink-400"
                        }`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-medium transition-colors duration-200 ${
                        isActive ? "text-pink-500" : "text-gray-400"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
