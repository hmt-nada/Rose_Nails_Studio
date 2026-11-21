"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  MotionValue,
} from "framer-motion";
import { HERO_QUOTES } from "@/lib/constants";
import MagneticButton from "@/components/ui/MagneticButton";
import { scrollToSection } from "@/lib/scroll";

// ─── Quote configuration ────────────────────────────────────────────────────
const ACTIVE_QUOTE_INDEX = 0;
const ACTIVE_QUOTE = HERO_QUOTES[ACTIVE_QUOTE_INDEX];

// Words styled in deep rose gradient
const ROSE_PHRASE = "your nails can be";

// ─── Animation helpers ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function Hero() {
  const shouldReduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  // Scroll parallax transforms
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Text column moves up and gently fades on scroll
  const textY = useTransform(scrollYProgress, [0, 1], ["0px", "-80px"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.1]);

  // Video scales down slightly and rotates a tiny bit for depth
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 0.91]);
  const videoRotate = useTransform(scrollYProgress, [0, 1], [0, 2]);
  const videoY = useTransform(scrollYProgress, [0, 1], ["0px", "35px"]);

  // Scroll-to-book helper
  function scrollToBook() {
    scrollToSection("#book");
  }

  // Split quote into words
  const words = ACTIVE_QUOTE.split(" ");

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative flex items-center min-h-[100svh] min-h-[100dvh] w-full overflow-hidden bg-pearl"
    >
      {/* ── Background blobs drifting with scroll ── */}
      <BackgroundBlobs scrollYProgress={scrollYProgress} />

      {/* ── Ambient parallax bubbles (bigger = faster) ── */}
      {!shouldReduce && <ParallaxBubbles scrollYProgress={scrollYProgress} />}

      {/* ── Main two-column grid (Stacked on mobile/tablet < 1024px) ── */}
      <div className="relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-8 xl:px-16 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 xl:gap-16 items-center pt-24 sm:pt-28 pb-10 sm:pb-16">
        {/* ── LEFT COLUMN (Text moves up & fades on scroll) ── */}
        <motion.div
          style={shouldReduce ? {} : { y: textY, opacity: textOpacity }}
          className="flex flex-col items-start gap-4 sm:gap-6 will-change-transform max-w-xl lg:max-w-none"
        >
          {/* Tagline */}
          <motion.span
            variants={shouldReduce ? {} : fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-block font-body text-xs tracking-[0.3em] uppercase text-deep-rose font-medium"
          >
            Nail art &amp; beauty
          </motion.span>

          {/* Headline – word-by-word stagger with fluid clamp */}
          <h1 className="font-heading text-[clamp(2.15rem,5.8vw,4.5rem)] xl:text-7xl 2xl:text-8xl font-bold leading-[1.08] text-plum tracking-tight">
            {words.map((word, i) => {
              const isRose = ROSE_PHRASE.includes(word);
              return (
                <motion.span
                  key={`${word}-${i}`}
                  variants={shouldReduce ? {} : fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{
                    duration: 0.45,
                    delay: shouldReduce ? 0 : 0.5 + i * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block mr-[0.22em]"
                >
                  {isRose ? (
                    <span
                      className="bg-gradient-to-r from-deep-rose to-rose bg-clip-text text-transparent"
                      style={{ WebkitBackgroundClip: "text" }}
                    >
                      {word}
                    </span>
                  ) : (
                    word
                  )}
                </motion.span>
              );
            })}
          </h1>

          {/* Description */}
          <motion.p
            variants={shouldReduce ? {} : fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: shouldReduce ? 0 : 1.1 }}
            className="font-body text-base xl:text-lg font-light text-plum/65 max-w-md leading-relaxed"
          >
            Custom nail art, flawless manicures and designs made just for you.
            Book your appointment in a few clicks.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={shouldReduce ? {} : fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: shouldReduce ? 0 : 1.3 }}
          >
            <MagneticButton
              onClick={scrollToBook}
              strength={shouldReduce ? 0 : 0.35}
              aria-label="Book your appointment"
            >
              Book Now ✦
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* ── RIGHT COLUMN – Seamless floating transparent animation (scroll depth: scales & rotates) ── */}
        <motion.div
          variants={shouldReduce ? {} : scaleIn}
          initial="hidden"
          animate="visible"
          transition={{
            duration: 0.7,
            delay: shouldReduce ? 0 : 1.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={
            shouldReduce
              ? {}
              : {
                  scale: videoScale,
                  rotate: videoRotate,
                  y: videoY,
                }
          }
          className="relative flex justify-center lg:justify-end items-center w-full will-change-transform mt-2 lg:mt-0"
        >
          {/* Transparent floating animation element (no card, no border, true alpha transparency) */}
          <TransparentFloatingVideo heroRef={heroRef} />
        </motion.div>
      </div>

      {/* ── Scroll hint ── */}
      <motion.div
        variants={
          shouldReduce
            ? {}
            : { hidden: { opacity: 0 }, visible: { opacity: 1 } }
        }
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.8, delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-plum/35 text-xs tracking-widest uppercase font-body pointer-events-none"
        aria-hidden
      >
        <span>Scroll</span>
        <span className="w-px h-10 bg-gradient-to-b from-plum/20 to-transparent" />
      </motion.div>
    </section>
  );
}

// ─── Parallax Floating Bubbles (Bigger = Faster) ─────────────────────────────
interface ParallaxBubblesProps {
  scrollYProgress: MotionValue<number>;
}

function ParallaxBubbles({ scrollYProgress }: ParallaxBubblesProps) {
  const [isMobileOrTouch, setIsMobileOrTouch] = useState(false);

  useEffect(() => {
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 1024;
    setIsMobileOrTouch(isTouch);
  }, []);

  // Parallax speed proportional to size: bigger = drifts faster
  const bigY = useTransform(scrollYProgress, [0, 1], ["0px", "-220px"]);
  const medY = useTransform(scrollYProgress, [0, 1], ["0px", "-130px"]);
  const smallY = useTransform(scrollYProgress, [0, 1], ["0px", "-65px"]);

  // On touch/mobile: render only 1 small bubble to keep 60fps
  if (isMobileOrTouch) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden z-[5]"
      >
        <motion.div
          style={{ y: smallY }}
          animate={{
            x: [0, 8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[6%] w-16 h-16 rounded-full border border-white/40 bg-gradient-to-br from-white/20 via-rose/10 to-transparent backdrop-blur-[1px]"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden z-[5]"
    >
      {/* 1. Large Bubble (130px, fastest drift) */}
      <motion.div
        style={{ y: bigY }}
        animate={{
          x: [0, 18, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[12%] right-[10%] w-32 h-32 rounded-full border border-white/50 bg-gradient-to-br from-white/30 via-rose/10 to-transparent backdrop-blur-[2px] shadow-[0_8px_32px_rgba(232,138,166,0.12)]"
      />

      {/* 2. Medium Bubble (80px, medium drift) */}
      <motion.div
        style={{ y: medY }}
        animate={{
          x: [0, -14, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute top-[62%] right-[5%] w-20 h-20 rounded-full border border-white/40 bg-gradient-to-br from-white/25 via-blush/15 to-transparent backdrop-blur-[1px] shadow-[0_6px_24px_rgba(184,74,110,0.08)]"
      />

      {/* 3. Small Bubble (45px, slowest drift) */}
      <motion.div
        style={{ y: smallY }}
        animate={{
          x: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[32%] right-[42%] w-11 h-11 rounded-full border border-white/40 bg-white/20 backdrop-blur-[1px] shadow-[0_4px_16px_rgba(232,138,166,0.1)]"
      />
    </div>
  );
}

// ─── Background blobs (animated + scroll drift) ──────────────────────────────
interface BackgroundBlobsProps {
  scrollYProgress: MotionValue<number>;
}

function BackgroundBlobs({ scrollYProgress }: BackgroundBlobsProps) {
  const shouldReduce = useReducedMotion();

  // Scroll drift transforms for background blobs
  const driftY1 = useTransform(scrollYProgress, [0, 1], ["0px", "140px"]);
  const driftY2 = useTransform(scrollYProgress, [0, 1], ["0px", "-110px"]);
  const driftY3 = useTransform(scrollYProgress, [0, 1], ["0px", "90px"]);

  if (shouldReduce) {
    return (
      <>
        <div
          aria-hidden
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-blush/25 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 right-0 w-[500px] h-[500px] rounded-full bg-rose/15 blur-3xl pointer-events-none"
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        aria-hidden
        style={{ y: driftY1 }}
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-blush/25 blur-3xl pointer-events-none will-change-transform"
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        style={{ y: driftY2 }}
        className="absolute top-1/2 -left-20 w-[300px] h-[300px] rounded-full bg-rose/10 blur-3xl pointer-events-none will-change-transform"
        animate={{ x: [0, -20, 0] }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        aria-hidden
        style={{ y: driftY3 }}
        className="absolute -bottom-40 right-0 w-[500px] h-[500px] rounded-full bg-rose/15 blur-3xl pointer-events-none will-change-transform"
        animate={{ x: [0, -30, 0] }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </>
  );
}

// ─── WebGL Shaders for Real-Time Alpha Channel Keying ───────────────────────
const VERTEX_SHADER_SRC = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

const FRAGMENT_SHADER_SRC = `
precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;

void main() {
  vec4 color = texture2D(u_image, v_texCoord);
  
  // Calculate maximum channel difference (saturation metric)
  float maxDiff = max(abs(color.r - color.g), max(abs(color.r - color.b), abs(color.g - color.b)));
  
  // The checkerboard pattern is strictly neutral gray (maxDiff <= 0.02)
  // We smoothly feather edges between 0.024 (~6/255) and 0.047 (~12/255)
  float alpha = smoothstep(0.024, 0.047, maxDiff);
  
  // Premultiplied alpha output for clean WebGL compositing over the transparent canvas
  gl_FragColor = vec4(color.rgb * alpha, alpha);
}
`;

// ─── Transparent Floating Video Component ───────────────────────────────────
interface TransparentFloatingVideoProps {
  heroRef: React.RefObject<HTMLElement | null>;
}

function TransparentFloatingVideo({ heroRef }: TransparentFloatingVideoProps) {
  const shouldReduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isEndedRef = useRef(false);
  const isVisibleRef = useRef(true);
  const hasInitializedRef = useRef(false);

  // Setup WebGL Program
  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl =
      canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
      }) ||
      (canvas.getContext(
        "experimental-webgl"
      ) as WebGLRenderingContext | null);

    if (!gl) {
      console.warn("[Rosé Nails Studio] WebGL not supported, falling back.");
      return false;
    }

    glRef.current = gl;

    // Compile Vertex Shader
    const vs = gl.createShader(gl.VERTEX_SHADER);
    if (!vs) return false;
    gl.shaderSource(vs, VERTEX_SHADER_SRC);
    gl.compileShader(vs);

    // Compile Fragment Shader
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fs) return false;
    gl.shaderSource(fs, FRAGMENT_SHADER_SRC);
    gl.compileShader(fs);

    // Link Program
    const program = gl.createProgram();
    if (!program) return false;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(
        "[Rosé Nails Studio] WebGL program link error:",
        gl.getProgramInfoLog(program)
      );
      return false;
    }

    gl.useProgram(program);

    // Positions Buffer (fullscreen quad)
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const posAttr = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // TexCoord Buffer (matching video orientation)
    const texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]),
      gl.STATIC_DRAW
    );
    const texAttr = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(texAttr);
    gl.vertexAttribPointer(texAttr, 2, gl.FLOAT, false, 0, 0);

    // Create Video Texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    textureRef.current = texture;

    // Viewport & Blending
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    hasInitializedRef.current = true;
    return true;
  }, []);

  // Render Single Frame to WebGL Canvas
  const drawFrame = useCallback(() => {
    const gl = glRef.current;
    const video = videoRef.current;
    const texture = textureRef.current;
    if (!gl || !video || !texture || video.readyState < 2) return;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      video
    );
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }, []);

  // Render Loop
  const startRenderLoop = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    function tick() {
      drawFrame();

      const video = videoRef.current;
      if (video && !video.paused && !video.ended && isVisibleRef.current) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else if (isEndedRef.current) {
        // Draw the final frame once and stop
        drawFrame();
      }
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }, [drawFrame]);

  // Video Loaded Metadata
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (glRef.current) {
        glRef.current.viewport(0, 0, canvas.width, canvas.height);
      }
    }

    if (shouldReduce) {
      video.pause();
      if (video.duration) {
        video.currentTime = Math.max(0, video.duration - 0.05);
      }
      setTimeout(drawFrame, 150);
    } else {
      video.play().catch(() => {});
      startRenderLoop();
    }
  }, [shouldReduce, drawFrame, startRenderLoop]);

  // Video Ended Handler (Freezes on last frame without looping)
  const handleVideoEnded = useCallback(() => {
    isEndedRef.current = true;
    drawFrame();
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  }, [drawFrame]);

  // Viewport Observer (plays on enter, pauses on exit)
  useEffect(() => {
    const heroEl = heroRef.current;
    const video = videoRef.current;
    if (!heroEl || !video) return;

    initWebGL();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            isVisibleRef.current = true;
            if (!shouldReduce && isEndedRef.current) {
              // Replay when scrolling back into hero
              isEndedRef.current = false;
              video.currentTime = 0;
              video.play().catch(() => {});
              startRenderLoop();
            } else if (!shouldReduce && video.paused && !isEndedRef.current) {
              video.play().catch(() => {});
              startRenderLoop();
            }
          } else if (!entry.isIntersecting || entry.intersectionRatio === 0) {
            isVisibleRef.current = false;
            video.pause();
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
          }
        }
      },
      { threshold: [0, 0.3] }
    );

    observer.observe(heroEl);

    return () => {
      observer.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [heroRef, initWebGL, shouldReduce, startRenderLoop]);

  return (
    <motion.div
      animate={
        shouldReduce
          ? {}
          : {
              y: [0, -10, 0],
            }
      }
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="relative w-full max-w-[340px] xs:max-w-[420px] sm:max-w-[500px] lg:max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] max-h-[55svh] max-h-[55dvh] aspect-[16/9] flex items-center justify-center pointer-events-none select-none"
    >
      {/* ── Hidden Off-Screen Video Element ── */}
      <video
        ref={videoRef}
        src="/videos/hero.mp4"
        playsInline
        muted
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleVideoEnded}
        onPlay={startRenderLoop}
        className="hidden"
        aria-hidden
      />

      {/* ── Transparent Alpha Canvas (Directly displays floating bottles & splashes) ── */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="w-full h-auto max-h-[55svh] max-h-[55dvh] aspect-[16/9] object-contain drop-shadow-[0_16px_36px_rgba(184,74,110,0.14)]"
        aria-label="Floating Rosé Nails Studio signature nail polish couture animation"
      />
    </motion.div>
  );
}
