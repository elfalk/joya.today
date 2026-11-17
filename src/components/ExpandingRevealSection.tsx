import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { JoyaLogo } from './JoyaLogo';

gsap.registerPlugin(ScrollTrigger);

interface BristlePoint {
  cos: number;
  sin: number;
  sx: number;
  sy: number;
  spike: number;
  notch: number;
}

// Deterministic pseudo-random generator for organic brush bristles
function seeded(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

export const ExpandingRevealSection: React.FC = () => {
  const portalRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const trackFillRef = useRef<HTMLSpanElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const [lightTone, setLightTone] = useState(false);

  const bristles = useMemo<BristlePoint[]>(() => {
    const count = 320;
    const pts: BristlePoint[] = [];
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      // Superellipse rectangular contour (exponent 0.34 gives crisp corners matching portrait card)
      const sx = Math.sign(cos) * Math.pow(Math.abs(cos), 0.34);
      const sy = Math.sign(sin) * Math.pow(Math.abs(sin), 0.34);

      // Multi-scale horizontal/radial dry-brush jaggedness matching the reference video
      const coarse = Math.sin(i * 0.42) * 0.35 + Math.cos(i * 0.91) * 0.25;
      const medium = seeded(i) * 0.65;
      const fine = seeded(i * 3 + 7) * 0.45;
      // Stronger horizontal brush streaks along left/right edges
      const sideBias = 0.55 + Math.abs(cos) * 0.65;
      const spike = Math.max(0, (coarse * 0.45 + medium * 0.55 + fine * 0.5) * sideBias);
      const notch = (seeded(i * 5 + 19) - 0.5) * 0.22;

      pts.push({ cos, sin, sx, sy, spike, notch });
    }
    return pts;
  }, []);

  useEffect(() => {
    const portal = portalRef.current;
    const canvas = canvasRef.current;
    const card = cardRef.current;
    const text = textRef.current;
    const trackFill = trackFillRef.current;
    const cue = cueRef.current;
    if (!portal || !canvas || !card || !text) return;

    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    let lastProgress = 0;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawPaint(lastProgress);
    };

    const drawPaint = (progress: number) => {
      lastProgress = progress;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx2d.clearRect(0, 0, w, h);

      // Inner text fades out cleanly in early scroll (0.04 -> 0.26)
      const textFade = Math.max(0, Math.min(1, 1 - (progress - 0.04) / 0.22));
      gsap.set(text, { opacity: textFade, y: (1 - textFade) * -14 });

      // Progress track bar fills 0 -> 1 across portal
      if (trackFill) {
        trackFill.style.transform = `scaleX(${Math.min(1, progress / 0.92)})`;
      }

      // Brush paint expansion runs 0.14 -> 0.84
      const rawPaint = Math.max(0, Math.min(1, (progress - 0.14) / 0.70));
      // Smooth easeInOut cubic
      const p =
        rawPaint < 0.5
          ? 4 * rawPaint * rawPaint * rawPaint
          : 1 - Math.pow(-2 * rawPaint + 2, 3) / 2;

      // Switch scroll cue tone to dark blue once white paint reaches bottom
      setLightTone(p >= 0.62);

      // Cue fades out at the very end as transition completes
      if (cue) {
        const cueOpacity = progress > 0.88 ? Math.max(0, 1 - (progress - 0.88) / 0.1) : 1;
        cue.style.opacity = String(cueOpacity);
      }

      // Card gentle scale + smooth dissolve as white paint fills screen (0.74 -> 0.95)
      const cardScale = 1 + rawPaint * 0.14 + Math.max(0, (progress - 0.78) / 0.22) * 0.28;
      const cardOpacity = progress > 0.76 ? Math.max(0, 1 - (progress - 0.76) / 0.18) : 1;
      gsap.set(card, { scale: cardScale, opacity: cardOpacity });

      if (rawPaint <= 0.001) return;

      const cardW = card.offsetWidth || Math.min(w * 0.7, 420);
      const cardH = card.offsetHeight || cardW * 1.25;
      const cx = w / 2;
      const cy = h / 2;

      // Full coverage diagonal reach when p -> 1
      const maxHalfW = w * 0.78;
      const maxHalfH = h * 0.78;
      const startHalfW = cardW * 0.49;
      const startHalfH = cardH * 0.49;

      const rx = startHalfW + (maxHalfW - startHalfW) * p;
      const ry = startHalfH + (maxHalfH - startHalfH) * p;

      // Dramatic rough dry-brush spikes peaking mid-transition, overflowing viewport at end
      const baseUnit = Math.min(w, h);
      const spikeReach =
        Math.sin(Math.min(1, rawPaint) * Math.PI) * baseUnit * 0.13 +
        rawPaint * baseUnit * 0.14;

      ctx2d.fillStyle = '#FFFFFF';
      ctx2d.beginPath();

      for (let i = 0; i < bristles.length; i++) {
        const b = bristles[i];
        const radialReach = b.spike * spikeReach;
        // Favor horizontal brush tear streaks along left & right sides (like video)
        const extraX = b.sx * (rx + b.notch * 18) + Math.sign(b.cos) * radialReach * (0.65 + 0.55 * Math.abs(b.cos));
        const extraY = b.sy * (ry + b.notch * 14) + Math.sign(b.sin) * radialReach * (0.45 + 0.45 * Math.abs(b.sin));

        const px = cx + extraX;
        const py = cy + extraY;
        if (i === 0) ctx2d.moveTo(px, py);
        else ctx2d.lineTo(px, py);
      }

      ctx2d.closePath();
      ctx2d.fill();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const st = ScrollTrigger.create({
      trigger: portal,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        drawPaint(self.progress);
      },
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      st.kill();
    };
  }, [bristles]);

  return (
    <section
      id="reveal-bridge"
      ref={portalRef}
      className="relative h-[280svh] w-full bg-[#08335d] text-[#08335d]"
    >
      {/* Sticky Fullscreen Portal Stage (_1g8gFq_stage) */}
      <div className="sticky top-0 h-[100svh] w-full overflow-clip grid place-items-center">
        {/* Organic Brush-Stroke White Paint Reveal Canvas (_1g8gFq_paint) */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-full z-0"
        />

        {/* Framed Portrait Portal Card (_1g8gFq_painting) */}
        <div
          ref={cardRef}
          className="relative z-10 h-[min(68svh,calc((100vw-40px)*1.25))] aspect-[440/556] bg-[#FFFFFF] flex flex-col items-center justify-center p-8 sm:p-10 md:p-12 text-center will-change-transform"
        >
          <img
            src="/assets/aistudio/card-border-gold_4e955beb.svg"
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full pointer-events-none select-none object-fill"
          />

          <div
            ref={textRef}
            className="relative z-10 flex flex-col items-center gap-3.5 sm:gap-4 max-w-[270px] sm:max-w-[300px]"
          >
            <JoyaLogo variant="dark" size="sm" />

            <img
              src="/assets/aistudio/separator_3d85b60d.svg"
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="w-32 sm:w-40 h-auto pointer-events-none select-none my-0.5"
            />

            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#08335d] leading-snug text-balance">
              بيئة تشغيل موحدة لكل نشاط تجاري
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              من نقاط البيع والمحامص إلى المستودعات والعيادات والمصانع في منظومة متكاملة جاهزة للعمل الفوري.
            </p>
          </div>
        </div>

        {/* Bottom Scroll Cue + Progress Line (_1g8gFq_cue) */}
        <div
          ref={cueRef}
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none transition-colors duration-300 ${
            lightTone ? 'text-[#08335d]' : 'text-[#FDFFFF]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-medium whitespace-nowrap">
            <span>استمر بالتمرير</span>
            <span className="text-[#f7b538] animate-bounce inline-block">↓</span>
          </div>
          <span className="w-24 sm:w-28 h-[1px] bg-current/25 block overflow-hidden">
            <span
              ref={trackFillRef}
              className="block h-full w-full bg-[#f7b538] origin-right"
              style={{ transform: 'scaleX(0)' }}
            />
          </span>
        </div>
      </div>
    </section>
  );
};
