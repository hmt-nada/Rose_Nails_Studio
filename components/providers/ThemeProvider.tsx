"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Synchronizes the browser's <meta name="theme-color"> and document color-scheme
 * with the active class-based theme (light: #FFF8FA, dark: #1A0F15).
 * This ensures mobile address bars (iOS Safari, Android Chrome) and system UI
 * strictly reflect the user's active theme rather than device OS preference.
 */
function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const isDark = resolvedTheme === "dark";
    const color = isDark ? "#1A0F15" : "#FFF8FA";

    // 1. Update or create standard <meta name="theme-color">
    let meta = document.querySelector('meta[name="theme-color"]:not([media])') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = color;

    // 2. Synchronize any media-query-based meta tags so system preferences cannot override user choice
    const mediaMetas = document.querySelectorAll('meta[name="theme-color"][media]');
    mediaMetas.forEach((el) => {
      (el as HTMLMetaElement).content = color;
    });

    // 3. Ensure color-scheme matches for native form controls and scrollbars
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  );
}
