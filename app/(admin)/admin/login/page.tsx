"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Floating glass decorative bubbles
const BUBBLES = [
  { size: 96, top: "12%", left: "8%", delay: 0, duration: 8 },
  { size: 64, top: "25%", right: "12%", delay: 1.5, duration: 7 },
  { size: 120, bottom: "18%", left: "14%", delay: 0.8, duration: 9 },
  { size: 80, bottom: "15%", right: "10%", delay: 2.2, duration: 7.5 },
  { size: 48, top: "60%", right: "22%", delay: 3, duration: 6.5 },
];

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(
          error.message === "Invalid login credentials"
            ? "Invalid email or password. Please double-check your credentials."
            : error.message || "An error occurred during authentication."
        );
        setShakeKey((prev) => prev + 1);
        setIsLoading(false);
        return;
      }

      // Smooth success transition
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 700);
    } catch {
      setErrorMessage("Unable to connect to the authentication service. Please try again.");
      setShakeKey((prev) => prev + 1);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-pearl">
      {/* ── Theme Toggle in Top Right ── */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      {/* ── Ambient Blurred Blobs ── */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.5, 0.35],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-rose/25 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.45, 0.3],
          x: [0, -30, 0],
          y: [0, 25, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute -bottom-32 -right-24 w-[30rem] h-[30rem] rounded-full bg-blush/40 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-deep-rose/10 blur-3xl"
      />

      {/* ── Floating Glass Bubbles ── */}
      {BUBBLES.map((bubble, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -25, 0],
            x: [0, 10, 0],
            rotate: [0, 8, 0],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            delay: bubble.delay,
            ease: "easeInOut",
          }}
          style={{
            width: bubble.size,
            height: bubble.size,
            top: bubble.top,
            left: bubble.left,
            right: bubble.right,
            bottom: bubble.bottom,
          }}
          className="pointer-events-none absolute hidden sm:block rounded-full bg-white/40 dark:bg-rose/10 backdrop-blur-md border border-white/70 dark:border-rose/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_25px_rgba(243,166,189,0.1)]"
        />
      ))}

      {/* ── Login Glass Card ── */}
      <motion.div
        key={shakeKey}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={
          shakeKey > 0
            ? {
                opacity: 1,
                y: 0,
                scale: 1,
                x: [0, -12, 12, -8, 8, -4, 4, 0],
                transition: { duration: 0.45 },
              }
            : {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
              }
        }
        className="relative z-10 w-full max-w-md rounded-3xl bg-white/75 dark:bg-surface-elevated/85 backdrop-blur-2xl border border-rose/20 dark:border-rose/25 p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(184,74,110,0.14)] dark:shadow-[0_0_35px_rgba(243,166,189,0.08)]"
      >
        {/* Brand Emblem */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-deep-rose to-rose flex items-center justify-center text-pearl shadow-lg shadow-deep-rose/20 mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <p className="text-xs tracking-[0.25em] uppercase font-medium text-deep-rose mb-1">
            Rosé Nails Studio
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-plum tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-plum/70 font-light mt-2 max-w-xs">
            Sign in to access your appointment bookings, studio services and schedule.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-3.5 rounded-2xl bg-rose/10 border border-rose/30 flex items-start gap-2.5 text-plum text-xs sm:text-sm"
          >
            <AlertCircle className="w-4 h-4 text-deep-rose shrink-0 mt-0.5" />
            <p className="flex-1 font-medium leading-relaxed">{errorMessage}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-medium uppercase tracking-wider text-plum/80 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-plum/40">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rosenails.com"
                disabled={isLoading || isSuccess}
                className="w-full pl-10 pr-4 py-3 bg-pearl/60 dark:bg-surface/60 border border-rose/25 rounded-xl text-plum text-sm placeholder:text-plum/35 focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium uppercase tracking-wider text-plum/80 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-plum/40">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading || isSuccess}
                className="w-full pl-10 pr-11 py-3 bg-pearl/60 dark:bg-surface/60 border border-rose/25 rounded-xl text-plum text-sm placeholder:text-plum/35 focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-all disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-plum/50 hover:text-plum transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full mt-2 py-3.5 px-6 rounded-full bg-deep-rose hover:bg-plum text-pearl font-medium text-sm shadow-md shadow-deep-rose/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group overflow-hidden relative"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-pearl animate-pulse" />
                <span>Signing in...</span>
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="w-4 h-4 text-pearl animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <span className="text-pearl/80 group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-rose/15 text-center">
          <p className="text-[11px] text-plum/50 font-light">
            Rosé Nails Studio &bull; Private Admin Access Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
