"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-rose/20 bg-pearl/60 dark:bg-surface-elevated/60 shrink-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-rose/25 bg-pearl/80 hover:bg-pearl dark:bg-surface-elevated/90 dark:hover:bg-surface-elevated text-plum hover:text-deep-rose flex items-center justify-center transition-colors cursor-pointer shadow-xs overflow-hidden shrink-0 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="text-rose"
          >
            <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: 60, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -60, scale: 0.6 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="text-deep-rose"
          >
            <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
