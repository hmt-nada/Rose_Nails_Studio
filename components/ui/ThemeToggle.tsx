"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  size?: "default" | "large";
}

/**
 * 1-Tap Animated Theme Toggle Button.
 * Guarantees a minimum 44x44px tap target for mobile/tablet accessibility.
 * Smoothly morphs between Sun and Moon with rotation and scale transitions.
 */
export default function ThemeToggle({ className = "", size = "default" }: ThemeToggleProps) {
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
        className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-rose/20 bg-pearl/60 dark:bg-surface-elevated/60 shrink-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-rose/25 bg-pearl/80 hover:bg-pearl dark:bg-surface-elevated/90 dark:hover:bg-surface-elevated text-plum hover:text-deep-rose flex items-center justify-center transition-colors cursor-pointer shadow-xs overflow-hidden shrink-0 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -60, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 60, scale: 0.5 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="text-rose"
          >
            <Moon className="w-5 h-5" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: 60, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -60, scale: 0.5 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="text-deep-rose"
          >
            <Sun className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/**
 * Three-option segmented control (Light, Dark, System) with minimum 44px tap targets.
 * Ideal for mobile menus, drawer overlays, and preferences.
 */
export function ThemeSegmentedControl({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ] as const;

  const currentTheme = mounted ? theme || "light" : "light";

  return (
    <div
      role="radiogroup"
      aria-label="Select appearance theme"
      className={`grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-pearl/90 dark:bg-surface-elevated/90 border border-rose/20 shadow-xs ${className}`}
    >
      {options.map((option) => {
        const isSelected = currentTheme === option.id;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setTheme(option.id)}
            className={`relative min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none ${
              isSelected
                ? "text-plum font-semibold"
                : "text-plum/60 hover:text-plum hover:bg-rose/5"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="segmented-theme-active-pill"
                className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl shadow-xs border border-rose/25 -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isSelected ? "text-deep-rose" : "text-plum/50"
              }`}
            />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
