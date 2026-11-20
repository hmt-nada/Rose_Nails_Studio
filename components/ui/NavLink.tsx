"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

/**
 * A single navbar link with:
 * - Sliding underline on hover (from left)
 * - Text lifts and turns deep-rose on hover
 * - Scale + ripple feedback on click
 * - Active state driven by parent (Framer Motion layoutId pill handled in Navbar)
 */
export default function NavLink({ href, label, isActive, onClick }: NavLinkProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    onClick?.();
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <motion.a
      href={href}
      onClick={handleClick}
      whileTap={{ scale: 0.94 }}
      className={cn(
        "relative group px-1 py-0.5",
        "font-body text-sm font-medium tracking-wide",
        "transition-colors duration-200",
        isActive ? "text-deep-rose" : "text-plum/70 hover:text-deep-rose"
      )}
    >
      {label}

      {/* Sliding underline */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 bottom-0 h-px bg-deep-rose",
          "w-0 group-hover:w-full",
          "origin-left transition-all duration-300 ease-out"
        )}
      />
    </motion.a>
  );
}
