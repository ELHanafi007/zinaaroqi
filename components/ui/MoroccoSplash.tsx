"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * MoroccoSplash — Mathematical Fourier Epicycle Loading Screen.
 *
 * Draws the Kingdom of Morocco (full national territory from Tangier to Lagouira)
 * from 601 Fourier DFT coefficients computed from real geographical border coordinates.
 *
 * Concurrently, an authentic English cursive handwriting animation types "by Dream X",
 * starting and ending at the exact same millisecond the Morocco border begins and closes.
 */

type Coeff = [number, number, number]; // [freq, amplitude, phase]

const STORAGE_KEY = "dreamx_morocco_splash_seen";
const TARGET_TEXT = "Zin Aroqi Immobilier";
const DRAW_MS = 3800; // Duration of epicycle drawing & handwriting
const FILL_MS = 750;  // Duration of emerald fill
const HOLD_MS = 800;  // Hold time to appreciate the full map
const FADE_MS = 600;  // Fade out to reveal site

export function MoroccoSplash() {
  const [mounted, setMounted] = useState(false);
  const [fading, setFading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handwritingTextRef = useRef<HTMLSpanElement>(null);
  const penCursorRef = useRef<HTMLSpanElement>(null);
  const flourishRef = useRef<SVGPathElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const formulaRef = useRef<HTMLParagraphElement>(null);

  const coeffsRef = useRef<Coeff[]>([]);
  const pathRef = useRef<[number, number][]>([]);
  const rafRef = useRef<number>(0);

  // Check if splash should run
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const force = params.get("splash") === "1" || params.get("splash") === "true";
    const reset = params.get("splash") === "reset";

    if (reset) {
      sessionStorage.removeItem(STORAGE_KEY);
    }

    try {
      if (!force && sessionStorage.getItem(STORAGE_KEY)) {
        setDismissed(true);
        return;
      }
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Fallback for private mode
    }

    setMounted(true);
  }, []);

  const handleDismiss = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setFading(true);
    setTimeout(() => {
      setDismissed(true);
    }, FADE_MS);
  }, []);

  // Keyboard shortcut: ESC to dismiss immediately
  useEffect(() => {
    if (!mounted || dismissed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, dismissed, handleDismiss]);

  // Load coefficients and initiate canvas animation
  useEffect(() => {
    if (!mounted || dismissed) return;

    let isCancelled = false;

    fetch("/morocco-fourier.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load Fourier data");
        return res.json();
      })
      .then((data: Coeff[]) => {
        if (isCancelled) return;
        coeffsRef.current = data;
        startAnimation();
      })
      .catch(() => {
        // If data fails, bypass splash gracefully
        setDismissed(true);
      });

    return () => {
      isCancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mounted, dismissed]);

  const startAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const coeffs = coeffsRef.current;
    const coeffsCount = coeffs.length;
    const maxEpicycles = Math.min(coeffsCount, 160);

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const startTime = performance.now();
    const effectiveDrawMs = prefersReducedMotion ? 600 : DRAW_MS;
    const totalDuration = effectiveDrawMs + FILL_MS + HOLD_MS + FADE_MS;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w * 0.5;
      // Map elevated to leave generous breathing room for "by Dream X" signature
      const cy = h * 0.40;
      const scale = Math.min(w, h) * 0.285;

      // 1. Clear & Dark Ground
      ctx.fillStyle = "#0c0f13";
      ctx.fillRect(0, 0, w, h);

      // Subtle mathematical drafting grid
      drawGrid(ctx, w, h, cx, cy);

      if (elapsed < effectiveDrawMs) {
        // ==========================================
        // Phase 1: Drawing Morocco & Handwriting in Lockstep
        // ==========================================
        const progress = Math.min(elapsed / effectiveDrawMs, 1);
        const tMax = progress * Math.PI * 2;
        const visibleCoeffs = Math.min(
          maxEpicycles,
          Math.max(6, Math.floor(6 + progress * (maxEpicycles - 6)))
        );

        // Compute traced path up to tMax
        const stepCount = Math.floor(progress * 650);
        const path: [number, number][] = [];
        for (let i = 0; i <= stepCount; i++) {
          const t = (i / 650) * Math.PI * 2;
          if (t > tMax) break;
          const [fx, fy] = evaluate(coeffs, t, visibleCoeffs);
          path.push([cx + fx * scale, cy + fy * scale]);
        }
        pathRef.current = path;

        // Draw epicycles chain
        const [tipX, tipY] = drawEpicyclesChain(
          ctx,
          coeffs,
          tMax,
          visibleCoeffs,
          cx,
          cy,
          scale,
          progress
        );

        // Draw traced contour
        if (path.length > 1) {
          ctx.beginPath();
          ctx.moveTo(path[0][0], path[0][1]);
          for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i][0], path[i][1]);
          }
          ctx.strokeStyle = "#e2d9c2";
          ctx.lineWidth = 1.8;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.shadowColor = "rgba(212, 168, 67, 0.4)";
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Draw active drawing stylus dot
        ctx.beginPath();
        ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#f59e0b";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Synchronized English handwriting for "by Dream X"
        updateHandwriting(progress, false);

        rafRef.current = requestAnimationFrame(render);
      } else if (elapsed < effectiveDrawMs + FILL_MS) {
        // ==========================================
        // Phase 2: Emerald Brand Wash Fill
        // ==========================================
        const fillElapsed = elapsed - effectiveDrawMs;
        const fillProgress = Math.min(fillElapsed / FILL_MS, 1);
        const easedFill = easeInOutQuad(fillProgress);

        const path = pathRef.current;
        if (path.length > 2) {
          ctx.beginPath();
          ctx.moveTo(path[0][0], path[0][1]);
          for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i][0], path[i][1]);
          }
          ctx.closePath();

          // Soft emerald wash
          ctx.save();
          ctx.fillStyle = `rgba(19, 58, 42, ${easedFill * 0.75})`;
          ctx.shadowColor = "rgba(34, 197, 94, 0.25)";
          ctx.shadowBlur = 16 * easedFill;
          ctx.fill();
          ctx.restore();

          // Golden border
          ctx.beginPath();
          ctx.moveTo(path[0][0], path[0][1]);
          for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i][0], path[i][1]);
          }
          ctx.closePath();
          ctx.strokeStyle = "#e2d9c2";
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        updateHandwriting(1, true);
        rafRef.current = requestAnimationFrame(render);
      } else if (elapsed < effectiveDrawMs + FILL_MS + HOLD_MS) {
        // ==========================================
        // Phase 3: Hold State - Completed Country with Signature
        // ==========================================
        const path = pathRef.current;
        if (path.length > 2) {
          ctx.beginPath();
          ctx.moveTo(path[0][0], path[0][1]);
          for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i][0], path[i][1]);
          }
          ctx.closePath();
          ctx.fillStyle = "rgba(19, 58, 42, 0.75)";
          ctx.fill();

          ctx.strokeStyle = "#d4a843";
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        updateHandwriting(1, true);
        rafRef.current = requestAnimationFrame(render);
      } else if (elapsed < totalDuration) {
        // ==========================================
        // Phase 4: Seamless Fade Out
        // ==========================================
        const fadeElapsed = elapsed - (effectiveDrawMs + FILL_MS + HOLD_MS);
        const fadeProgress = Math.min(fadeElapsed / FADE_MS, 1);
        setFading(true);

        const alpha = 1 - easeInOutQuad(fadeProgress);
        ctx.globalAlpha = alpha;

        const path = pathRef.current;
        if (path.length > 2) {
          ctx.beginPath();
          ctx.moveTo(path[0][0], path[0][1]);
          for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i][0], path[i][1]);
          }
          ctx.closePath();
          ctx.fillStyle = "rgba(19, 58, 42, 0.75)";
          ctx.fill();
          ctx.strokeStyle = "#d4a843";
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
        rafRef.current = requestAnimationFrame(render);
      } else {
        // Completed
        setDismissed(true);
        window.removeEventListener("resize", resize);
      }
    };

    rafRef.current = requestAnimationFrame(render);
  };

  /**
   * Synchronized handwriting update:
   * Types "by Dream X" in English handwriting precisely from progress = 0 to progress = 1.
   */
  const updateHandwriting = (progress: number, completed: boolean) => {
    if (!handwritingTextRef.current || !penCursorRef.current) return;

    if (completed || progress >= 1) {
      handwritingTextRef.current.textContent = TARGET_TEXT;
      // Pen lifts and smoothly disappears
      penCursorRef.current.style.opacity = "0";
      if (flourishRef.current) {
        flourishRef.current.style.strokeDashoffset = "0";
      }
      if (subtitleRef.current) subtitleRef.current.style.opacity = "1";
      if (formulaRef.current) formulaRef.current.style.opacity = "0.7";
      return;
    }

    // Exact progress mapping to characters (0 to 10)
    const totalChars = TARGET_TEXT.length;
    const charPos = progress * totalChars;
    const fullChars = Math.floor(charPos);

    handwritingTextRef.current.textContent = TARGET_TEXT.slice(0, fullChars);

    // Pen cursor active and tracking handwriting rhythm
    penCursorRef.current.style.opacity = "1";
    // Natural handwriting vertical pen oscillation
    const penWobble = Math.sin(charPos * Math.PI * 2) * 2.5;
    penCursorRef.current.style.transform = `translateY(${penWobble}px)`;

    // Flourish underline sweeps under the signature in the final 30% of drawing
    if (flourishRef.current) {
      if (progress > 0.70) {
        const flourishProgress = (progress - 0.70) / 0.30;
        const offset = 280 * (1 - easeOutQuad(flourishProgress));
        flourishRef.current.style.strokeDashoffset = String(offset);
      } else {
        flourishRef.current.style.strokeDashoffset = "280";
      }
    }

    // Subtitle & formula fade in gradually as map takes shape
    if (subtitleRef.current) {
      const subAlpha = Math.max(0, (progress - 0.35) * 1.5);
      subtitleRef.current.style.opacity = String(Math.min(subAlpha, 1));
    }
    if (formulaRef.current) {
      const formAlpha = Math.max(0, (progress - 0.50) * 1.4);
      formulaRef.current.style.opacity = String(Math.min(formAlpha, 0.7));
    }
  };

  if (!mounted || dismissed) return null;

  return (
    <div
      role="dialog"
      aria-label="Loading animation"
      className="fixed inset-0 z-[99999] flex flex-col justify-between overflow-hidden select-none"
      style={{
        background: "#0c0f13",
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
      />

      {/* Top Bar with mathematical badge & Skip button */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-[#14181f]/80 px-3.5 py-1.5 backdrop-blur-md">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
          <span className="text-[11px] font-mono tracking-wider text-[#9ca3af]">
            DFT_EPICYCLES · N=601
          </span>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-[#14181f]/80 px-4 py-1.5 text-[12px] font-medium text-[#9ca3af] backdrop-blur-md transition-all hover:border-[#f59e0b]/40 hover:bg-[#1a1f28] hover:text-[#f3f4f6]"
        >
          <span>Skip</span>
          <kbd className="hidden sm:inline-block rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-[#6b7280] group-hover:text-[#9ca3af]">
            ESC
          </kbd>
        </button>
      </div>

      {/* Synchronized English Handwriting Signature ("by Dream X") */}
      <div className="relative z-10 flex flex-col items-center justify-center pb-8 sm:pb-12 pointer-events-none px-4">
        {/* Handwritten text line */}
        <div className="relative flex items-center justify-center min-h-[52px] sm:min-h-[64px]">
          <span
            ref={handwritingTextRef}
            className="text-[34px] sm:text-[46px] font-bold text-[#f3ba4f] tracking-wide select-none"
            style={{
              fontFamily: "'Caveat', 'Dancing Script', 'Brush Script MT', cursive",
              textShadow: "0 0 18px rgba(243, 186, 79, 0.45), 0 2px 4px rgba(0,0,0,0.8)",
            }}
          />

          {/* Golden Fountain Pen Stylus Nib */}
          <span
            ref={penCursorRef}
            className="inline-flex items-center justify-center ml-1 text-[#f59e0b] pointer-events-none"
            style={{
              filter: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.9))",
              transition: "opacity 0.2s ease, transform 0.08s ease-out",
            }}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 -rotate-45"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </span>
        </div>

        {/* Calligraphic Underline Flourish */}
        <svg
          className="w-56 sm:w-72 h-5 -mt-2 overflow-visible"
          viewBox="0 0 260 20"
          fill="none"
        >
          <path
            ref={flourishRef}
            d="M 12 10 Q 75 18, 135 9 T 248 12 Q 220 18, 190 14"
            stroke="#d4a843"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="280"
            strokeDashoffset="280"
            style={{
              filter: "drop-shadow(0 0 6px rgba(212, 168, 67, 0.5))",
            }}
          />
        </svg>

        {/* Subtitle & Formula */}
        <div className="mt-3 flex flex-col items-center gap-1">
          <p
            ref={subtitleRef}
            className="text-[12px] sm:text-[13px] text-[#9ca3af] tracking-widest uppercase transition-opacity duration-500"
            style={{ opacity: 0 }}
          >
            المملكة المغربية · Kingdom of Morocco
          </p>
          <p
            ref={formulaRef}
            className="text-[10px] font-mono text-[#6b7280] tracking-wider transition-opacity duration-500"
            style={{ opacity: 0 }}
          >
            z(t) = ∑ₖ cₖ e^(i·k·t) · Fourier Epicycles N=601
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Mathematical & Canvas Rendering Helpers
// ==========================================

function evaluate(coeffs: Coeff[], t: number, count: number): [number, number] {
  let x = 0;
  let y = 0;
  const n = Math.min(count, coeffs.length);
  for (let i = 0; i < n; i++) {
    const [freq, amp, ph] = coeffs[i];
    const angle = freq * t + ph;
    x += amp * Math.cos(angle);
    y += amp * Math.sin(angle);
  }
  return [x, y];
}

function drawEpicyclesChain(
  ctx: CanvasRenderingContext2D,
  coeffs: Coeff[],
  t: number,
  count: number,
  cx: number,
  cy: number,
  scale: number,
  progress: number
): [number, number] {
  let x = cx;
  let y = cy;

  // Show circles for primary harmonics (up to 18)
  const visibleCircles = Math.min(count, Math.floor(5 + progress * 14));

  for (let i = 0; i < count; i++) {
    const [freq, amp, ph] = coeffs[i];
    const radius = amp * scale;
    const angle = freq * t + ph;
    const nx = x + radius * Math.cos(angle);
    const ny = y + radius * Math.sin(angle);

    if (i < visibleCircles && radius > 1.5) {
      // 1. Circular orbit hairline
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(212, 168, 67, 0.14)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // 2. Connecting arm vector
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = "rgba(212, 168, 67, 0.35)";
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // 3. Pivot joint dot
      if (i < 8 && radius > 6) {
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245, 158, 11, 0.6)";
        ctx.fill();
      }
    }

    x = nx;
    y = ny;
  }

  return [x, y];
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cx: number,
  cy: number
) {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
  ctx.lineWidth = 1;

  const step = 60;
  // Vertical lines
  for (let x = cx % step; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  // Horizontal lines
  for (let y = cy % step; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Soft center crosshair
  ctx.strokeStyle = "rgba(212, 168, 67, 0.08)";
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy);
  ctx.lineTo(cx + 30, cy);
  ctx.moveTo(cx, cy - 30);
  ctx.lineTo(cx, cy + 30);
  ctx.stroke();

  ctx.restore();
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}
