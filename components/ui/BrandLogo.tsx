"use client";

import { useState } from "react";
import Image from "next/image";

interface BrandLogoProps {
  size?: number; // Target height in pixels (e.g. 36-40px)
  className?: string;
  priority?: boolean;
}

/**
 * Reusable brand logo component for Rosé Nails Studio.
 * Renders the official brand logo (public/logo.png) with precise aspect ratio
 * and sharp alignment. Gracefully falls back to nothing if the image cannot be loaded.
 */
export default function BrandLogo({
  size = 38,
  className = "",
  priority = false,
}: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  // Original logo dimensions: 270px width x 426px height (aspect ratio ~0.6338)
  const width = Math.round(size * (270 / 426));

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center ${className}`}
      style={{ height: `${size}px`, width: `${width}px` }}
    >
      <Image
        src="/logo.png"
        alt="Rosé Nails Studio logo"
        width={width}
        height={size}
        priority={priority}
        onError={() => setHasError(true)}
        className="h-full w-full object-contain select-none"
      />
    </div>
  );
}
