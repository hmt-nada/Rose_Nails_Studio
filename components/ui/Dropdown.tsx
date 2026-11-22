"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  ReactNode,
  KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export interface DropdownProps<T extends string = string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  align?: "left" | "right";
  id?: string;
  "aria-label"?: string;
}

export default function Dropdown<T extends string = string>({
  options,
  value,
  onChange,
  label,
  placeholder,
  icon,
  size = "md",
  disabled = false,
  className,
  triggerClassName,
  menuClassName,
  align = "left",
  id: customId,
  "aria-label": ariaLabel,
}: DropdownProps<T>) {
  const generatedId = useId();
  const id = customId || generatedId;
  const listboxId = `listbox-${id}`;

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchStringRef = useRef("");

  const selectedOption = options.find((opt) => opt.value === value);

  // Mount detection for React portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Screen size breakpoint detection (< 640px = mobile bottom sheet)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Menu positioning state for desktop portal
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
    placement: "bottom" | "top";
  }>({ top: 0, left: 0, width: 0, placement: "bottom" });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || isMobile) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = Math.min(options.length * 44 + 20, 280);

    const placeTop = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
    const top = placeTop
      ? Math.max(12, rect.top - estimatedHeight - 6)
      : rect.bottom + 6;

    const minWidth = Math.max(rect.width, 180);
    let left = align === "right" ? rect.right - minWidth : rect.left;
    left = Math.max(12, Math.min(left, window.innerWidth - minWidth - 12));

    setMenuPosition({
      top,
      left,
      width: minWidth,
      placement: placeTop ? "top" : "bottom",
    });
  }, [options.length, isMobile, align]);

  // Keep position updated on scroll/resize while open
  useEffect(() => {
    if (!isOpen || isMobile) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition, { passive: true });
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, isMobile, updatePosition]);

  // Outside click detection to close menu
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Sync focused index with selected option when opening
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex((opt) => opt.value === value);
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, options, value]);

  // Scroll focused option into view when keyboard navigating
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && menuRef.current) {
      const el = menuRef.current.querySelector<HTMLElement>(
        `[data-option-index="${focusedIndex}"]`
      );
      if (el) {
        el.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen, focusedIndex]);

  const selectOption = useCallback(
    (optValue: T) => {
      onChange(optValue);
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    [onChange]
  );

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        setIsOpen(true);
        updatePosition();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
        break;
      case "Home":
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setFocusedIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          selectOption(options[focusedIndex].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        // Type to search
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
          searchStringRef.current += e.key.toLowerCase();
          searchTimeoutRef.current = setTimeout(() => {
            searchStringRef.current = "";
          }, 600);

          const matchIdx = options.findIndex((opt) =>
            opt.label.toLowerCase().startsWith(searchStringRef.current)
          );
          if (matchIdx !== -1) {
            setFocusedIndex(matchIdx);
          }
        }
        break;
    }
  };

  // Size styling tokens
  const sizeStyles = {
    sm: "px-2.5 py-1.5 text-xs rounded-full gap-1.5",
    md: "px-3.5 py-2 text-xs font-medium rounded-full gap-2",
    lg: "px-4 py-2.5 text-sm font-medium rounded-full gap-2.5",
  }[size];

  const chevronSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }[size];

  return (
    <div className={cn("relative inline-block text-left", className)}>
      {/* ─── Trigger Button ─── */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel || label || placeholder || "Select option"}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            updatePosition();
            setIsOpen((prev) => !prev);
          }
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex items-center justify-between",
          "bg-white/60 dark:bg-surface/60",
          "hover:bg-white/80 dark:hover:bg-surface/80",
          "border border-rose/25 dark:border-rose/25",
          "hover:border-rose/45 dark:hover:border-rose/40",
          "shadow-[0_2px_10px_rgba(184,74,110,0.06)] hover:shadow-[0_4px_16px_rgba(184,74,110,0.12)] dark:shadow-none",
          "text-plum font-body font-medium transition-all duration-150 cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/45 dark:focus-visible:ring-rose/50",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          isOpen && "border-rose/50 dark:border-rose/50 ring-2 ring-rose/20 dark:ring-rose/25 shadow-[0_4px_16px_rgba(184,74,110,0.14)]",
          sizeStyles,
          triggerClassName
        )}
      >
        <span className="flex items-center gap-1.5 truncate">
          {icon && <span className="shrink-0 text-deep-rose dark:text-rose">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder || label || "Select"}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "text-plum/50 dark:text-pearl/50 transition-transform duration-200 shrink-0 ml-1",
            chevronSizes,
            isOpen && "rotate-180 text-deep-rose dark:text-rose"
          )}
          aria-hidden="true"
        />
      </button>

      {/* ─── Dropdown Menu Portal ─── */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* ── Desktop Floating Panel (>= 640px) ── */}
                {!isMobile ? (
                  <motion.div
                    ref={menuRef}
                    id={listboxId}
                    role="listbox"
                    aria-label={label || placeholder || "Options"}
                    tabIndex={-1}
                    onKeyDown={handleKeyDown}
                    initial={{ opacity: 0, scale: 0.95, y: menuPosition.placement === "top" ? 4 : -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: menuPosition.placement === "top" ? 4 : -4 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: "fixed",
                      top: menuPosition.top,
                      left: menuPosition.left,
                      minWidth: menuPosition.width,
                    }}
                    className={cn(
                      "z-[99999] overflow-hidden",
                      "bg-white/90 dark:bg-[#1E1219]/90 backdrop-blur-2xl",
                      "border border-rose/25 dark:border-rose/25",
                      "rounded-2xl p-1.5",
                      "shadow-[0_12px_36px_rgba(184,74,110,0.16),0_2px_10px_rgba(184,74,110,0.08)]",
                      "dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)]",
                      menuClassName
                    )}
                  >
                    <ul className="max-h-64 overflow-y-auto overscroll-contain p-0.5 space-y-0.5 focus:outline-none scrollbar-thin">
                      {options.map((opt, index) => {
                        const isSelected = opt.value === value;
                        const isHighlighted = focusedIndex === index;

                        return (
                          <li
                            key={opt.value}
                            id={`option-${id}-${opt.value}`}
                            data-option-index={index}
                            role="option"
                            aria-selected={isSelected}
                            onMouseEnter={() => setFocusedIndex(index)}
                            onClick={() => selectOption(opt.value)}
                            className={cn(
                              "relative px-3 py-2 rounded-xl cursor-pointer select-none",
                              "flex items-center justify-between gap-3 text-xs font-medium font-body",
                              "transition-colors duration-100",
                              isSelected
                                ? "text-deep-rose dark:text-rose font-semibold"
                                : "text-plum/85 dark:text-pearl/85 hover:text-plum dark:hover:text-pearl"
                            )}
                          >
                            {/* Sliding Pink Highlight Behind Option */}
                            {isHighlighted && (
                              <motion.div
                                layoutId={`dropdown-highlight-${id}`}
                                className="absolute inset-0 rounded-xl bg-rose/15 dark:bg-rose/25 pointer-events-none"
                                transition={{
                                  type: "spring",
                                  stiffness: 450,
                                  damping: 35,
                                }}
                              />
                            )}

                            <span className="relative z-10 flex items-center gap-2 truncate">
                              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                              <span className="truncate">{opt.label}</span>
                            </span>

                            {isSelected && (
                              <Check
                                className="relative z-10 w-3.5 h-3.5 text-deep-rose dark:text-rose shrink-0"
                                aria-hidden="true"
                              />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                ) : (
                  /* ── Mobile Bottom Sheet (< 640px) ── */
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setIsOpen(false)}
                      className="fixed inset-0 bg-plum/40 dark:bg-black/60 backdrop-blur-sm z-[99998]"
                      aria-hidden="true"
                    />

                    {/* Bottom Sheet Surface */}
                    <motion.div
                      ref={menuRef}
                      id={listboxId}
                      role="listbox"
                      aria-label={label || placeholder || "Options"}
                      tabIndex={-1}
                      onKeyDown={handleKeyDown}
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 28, stiffness: 320 }}
                      drag="y"
                      dragConstraints={{ top: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(_, info) => {
                        if (info.offset.y > 100 || info.velocity.y > 400) {
                          setIsOpen(false);
                        }
                      }}
                      className={cn(
                        "fixed bottom-0 inset-x-0 z-[99999]",
                        "bg-white/95 dark:bg-[#1E1219]/95 backdrop-blur-2xl",
                        "border-t border-rose/25 dark:border-rose/25",
                        "rounded-t-3xl p-4 pb-8",
                        "shadow-[0_-8px_32px_rgba(184,74,110,0.18)] dark:shadow-[0_-12px_40px_rgba(0,0,0,0.7)]",
                        "max-h-[80vh] flex flex-col overscroll-contain",
                        menuClassName
                      )}
                    >
                      {/* Drag Handle */}
                      <div
                        className="w-12 h-1.5 bg-plum/20 dark:bg-pearl/20 rounded-full mx-auto mb-3 shrink-0 cursor-grab active:cursor-grabbing"
                        aria-hidden="true"
                      />

                      {(label || placeholder) && (
                        <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider uppercase text-plum/50 dark:text-pearl/50">
                          {label || placeholder}
                        </div>
                      )}

                      <ul className="overflow-y-auto overscroll-contain space-y-1 p-0.5 focus:outline-none">
                        {options.map((opt, index) => {
                          const isSelected = opt.value === value;
                          const isHighlighted = focusedIndex === index;

                          return (
                            <li
                              key={opt.value}
                              id={`option-mobile-${id}-${opt.value}`}
                              data-option-index={index}
                              role="option"
                              aria-selected={isSelected}
                              onMouseEnter={() => setFocusedIndex(index)}
                              onClick={() => selectOption(opt.value)}
                              className={cn(
                                "relative min-h-[48px] px-4 py-3 rounded-xl cursor-pointer select-none",
                                "flex items-center justify-between gap-3 text-sm font-medium font-body",
                                "transition-colors duration-100",
                                isSelected
                                  ? "text-deep-rose dark:text-rose font-semibold bg-rose/10 dark:bg-rose/15"
                                  : "text-plum dark:text-pearl active:bg-rose/10"
                              )}
                            >
                              {/* Sliding Highlight for Mobile Focus */}
                              {isHighlighted && (
                                <motion.div
                                  layoutId={`dropdown-mobile-highlight-${id}`}
                                  className="absolute inset-0 rounded-xl bg-rose/15 dark:bg-rose/20 pointer-events-none"
                                  transition={{
                                    type: "spring",
                                    stiffness: 450,
                                    damping: 35,
                                  }}
                                />
                              )}

                              <span className="relative z-10 flex items-center gap-3 truncate">
                                {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                                <span className="truncate">{opt.label}</span>
                              </span>

                              {isSelected && (
                                <Check
                                  className="relative z-10 w-4 h-4 text-deep-rose dark:text-rose shrink-0"
                                  aria-hidden="true"
                                />
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  </>
                )}
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
