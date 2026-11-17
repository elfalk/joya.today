import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowLeft } from 'lucide-react';
import { CreativeHeroY } from './CreativeHeroY';

gsap.registerPlugin(ScrollTrigger);

const HERO_TUT_PATH = '/assets/aistudio/396e9cd9b0f84c96678589b796b07376_ad1729fe.jpg';
let cachedHeroTutUrl: string | null = null;

function processHeroTutImage(): Promise<string> {
  if (cachedHeroTutUrl) {
    return Promise.resolve(cachedHeroTutUrl);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No 2d context'));
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const d = imageData.data;

        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        const isOuterBlack = (p: number) => {
          const i = p * 4;
          return Math.max(d[i], d[i + 1], d[i + 2]) <= 24;
        };

        // Seed BFS flood-fill from image borders to remove outer pure-black backdrop
        for (let x = 0; x < w; x++) {
          const top = x;
          const bot = (h - 1) * w + x;
          if (!visited[top] && isOuterBlack(top)) {
            visited[top] = 1;
            queue[tail++] = top;
          }
          if (!visited[bot] && isOuterBlack(bot)) {
            visited[bot] = 1;
            queue[tail++] = bot;
          }
        }
        for (let y = 0; y < h; y++) {
          const left = y * w;
          const right = y * w + (w - 1);
          if (!visited[left] && isOuterBlack(left)) {
            visited[left] = 1;
            queue[tail++] = left;
          }
          if (!visited[right] && isOuterBlack(right)) {
            visited[right] = 1;
            queue[tail++] = right;
          }
        }

        while (head < tail) {
          const p = queue[head++];
          const x = p % w;
          const y = (p - x) / w;

          if (x > 0) {
            const np = p - 1;
            if (!visited[np] && isOuterBlack(np)) {
              visited[np] = 1;
              queue[tail++] = np;
            }
          }
          if (x < w - 1) {
            const np = p + 1;
            if (!visited[np] && isOuterBlack(np)) {
              visited[np] = 1;
              queue[tail++] = np;
            }
          }
          if (y > 0) {
            const np = p - w;
            if (!visited[np] && isOuterBlack(np)) {
              visited[np] = 1;
              queue[tail++] = np;
            }
          }
          if (y < h - 1) {
            const np = p + w;
            if (!visited[np] && isOuterBlack(np)) {
              visited[np] = 1;
              queue[tail++] = np;
            }
          }
        }

        // Clear outer flood-filled pixels
        for (let p = 0; p < w * h; p++) {
          if (visited[p]) {
            d[p * 4 + 3] = 0;
          }
        }

        // Key interior black regions inside the right cyan wireframe mesh (preserving dark details on left half)
        const wireframeStartX = Math.floor(w * 0.505);
        for (let y = 0; y < h; y++) {
          const rowOffset = y * w;
          for (let x = wireframeStartX; x < w; x++) {
            const p = rowOffset + x;
            if (visited[p]) continue;
            const i = p * 4;
            const m = Math.max(d[i], d[i + 1], d[i + 2]);
            if (m <= 16) {
              d[i + 3] = 0;
            } else if (m < 52) {
              const a = (m - 16) / (52 - 16);
              d[i + 3] = Math.round(a * 255);
              const boost = 1 / Math.max(0.2, a);
              d[i] = Math.min(255, Math.round(d[i] * boost));
              d[i + 1] = Math.min(255, Math.round(d[i + 1] * boost));
              d[i + 2] = Math.min(255, Math.round(d[i + 2] * boost));
            }
          }
        }

        // Soften 1px anti-aliased edge around the outer cutout
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const p = y * w + x;
            const i = p * 4;
            if (d[i + 3] === 0) continue;
            const touchesBg =
              visited[p - 1] || visited[p + 1] || visited[p - w] || visited[p + w];
            if (touchesBg) {
              const m = Math.max(d[i], d[i + 1], d[i + 2]);
              if (m < 56) {
                const a = Math.max(0, (m - 20) / (56 - 20));
                d[i + 3] = Math.round(a * 255);
                const boost = 1 / Math.max(0.25, a);
                d[i] = Math.min(255, Math.round(d[i] * boost));
                d[i + 1] = Math.min(255, Math.round(d[i + 1] * boost));
                d[i + 2] = Math.min(255, Math.round(d[i + 2] * boost));
              }
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const url = canvas.toDataURL('image/png');
        cachedHeroTutUrl = url;
        resolve(url);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = HERO_TUT_PATH;
  });
}

export const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const logoParallaxRef = useRef<HTMLDivElement>(null);
  const logoFloatRef = useRef<HTMLDivElement>(null);
  const characterParallaxRef = useRef<HTMLDivElement>(null);
  const characterFloatRef = useRef<HTMLDivElement>(null);
  const floatersRef = useRef<(HTMLDivElement | null)[]>([]);
  const [heroArtUrl, setHeroArtUrl] = useState<string | null>(() => cachedHeroTutUrl);

  useEffect(() => {
    let active = true;
    processHeroTutImage()
      .then((url) => {
        if (active) setHeroArtUrl(url);
      })
      .catch(() => {
        // Fallback handled with mix-blend-screen below
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Decorative 3D icons gentle drift
      floatersRef.current.forEach((el, idx) => {
        if (!el) return;
        gsap.to(el, {
          y: idx % 2 === 0 ? -10 : 10,
          rotation: idx % 2 === 0 ? 2.5 : -2.5,
          duration: 3.6 + idx * 0.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      // Calm, very gentle opposite ambient motion between character and JOYA logo
      if (characterFloatRef.current) {
        gsap.fromTo(
          characterFloatRef.current,
          { x: -5, y: 4 },
          {
            x: 5,
            y: -5,
            duration: 4.8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          }
        );
      }

      if (logoFloatRef.current) {
        gsap.fromTo(
          logoFloatRef.current,
          { x: 6, y: -4 },
          {
            x: -6,
            y: 5,
            duration: 4.8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          }
        );
      }

      // Subtle opposite scroll parallax
      if (logoParallaxRef.current) {
        gsap.to(logoParallaxRef.current, {
          yPercent: -10,
          opacity: 0.6,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        });
      }

      if (characterParallaxRef.current) {
        gsap.to(characterParallaxRef.current, {
          yPercent: 6,
          scale: 1.02,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        });
      }
    }, section);

    // Subtle opposite mouse parallax
    const xSetters = floatersRef.current.map((el) =>
      el ? gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3.out' }) : null
    );
    const charX = characterParallaxRef.current
      ? gsap.quickTo(characterParallaxRef.current, 'x', { duration: 1.1, ease: 'power3.out' })
      : null;
    const charY = characterParallaxRef.current
      ? gsap.quickTo(characterParallaxRef.current, 'y', { duration: 1.1, ease: 'power3.out' })
      : null;
    const logoX = logoParallaxRef.current
      ? gsap.quickTo(logoParallaxRef.current, 'x', { duration: 1.1, ease: 'power3.out' })
      : null;
    const logoY = logoParallaxRef.current
      ? gsap.quickTo(logoParallaxRef.current, 'y', { duration: 1.1, ease: 'power3.out' })
      : null;

    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;

      floatersRef.current.forEach((_, idx) => {
        const depth = (idx % 3 + 1) * 8;
        xSetters[idx]?.(nx * depth * (idx % 2 === 0 ? 1 : -1));
      });

      // Calm opposite directions: character vs JOYA logo
      charX?.(nx * -8);
      charY?.(ny * -5);
      logoX?.(nx * 9);
      logoY?.(ny * 5);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ctx.revert();
    };
  }, []);

  const setFloaterRef = (index: number) => (el: HTMLDivElement | null) => {
    floatersRef.current[index] = el;
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full bg-[#0B325B] text-white overflow-hidden pt-24 pb-8 flex flex-col justify-between"
    >
      <div className="relative flex-1 flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto px-4 pt-4">
        {/* Written JOYA Editorial Display Typography Behind & Lifted Above Artwork */}
        <div
          ref={logoParallaxRef}
          className="relative z-10 w-full flex justify-center select-none pointer-events-none -mb-6 sm:-mb-9 md:-mb-12"
        >
          <div ref={logoFloatRef} className="flex justify-center items-center">
            <h1
              className="font-editorial font-black uppercase tracking-[0.12em] pl-[0.12em] leading-[0.88] text-white text-[clamp(5.25rem,20vw,15.5rem)] text-center drop-shadow-[0_12px_36px_rgba(0,0,0,0.28)]"
              dir="ltr"
            >
              <span>JO</span>
              <CreativeHeroY />
              <span>A</span>
            </h1>
          </div>
        </div>

        {/* Smaller Floating 3D Commerce Elements Placed BEHIND the Character (z-[12]) */}
        <div
          ref={setFloaterRef(0)}
          className="hidden sm:block absolute top-[26%] left-[12%] md:left-[18%] z-[12] w-14 md:w-20 opacity-85 pointer-events-none"
        >
          <svg viewBox="0 0 120 120" className="w-full h-auto drop-shadow-[0_12px_18px_rgba(0,0,0,0.4)]">
            <defs>
              <linearGradient id="posGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F8D27A" />
                <stop offset="100%" stopColor="#B87A14" />
              </linearGradient>
              <linearGradient id="posScreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#081FF7" />
                <stop offset="100%" stopColor="#051188" />
              </linearGradient>
            </defs>
            <polygon points="60,12 104,36 60,60 16,36" fill="url(#posGold)" />
            <polygon points="16,36 60,60 60,104 16,80" fill="#1E3A5F" stroke="#D99B26" strokeWidth="1.5" />
            <polygon points="104,36 60,60 60,104 104,80" fill="#132945" stroke="#D99B26" strokeWidth="1.5" />
            <polygon points="26,44 54,59 54,84 26,69" fill="url(#posScreen)" />
          </svg>
        </div>

        <div
          ref={setFloaterRef(1)}
          className="hidden sm:block absolute top-[24%] right-[12%] md:right-[18%] z-[12] w-14 md:w-20 opacity-85 pointer-events-none"
        >
          <svg viewBox="0 0 120 120" className="w-full h-auto drop-shadow-[0_12px_18px_rgba(0,0,0,0.4)]">
            <polygon points="60,14 102,38 60,62 18,38" fill="#F6E3B4" stroke="#D99B26" strokeWidth="2" />
            <polygon points="18,38 60,62 60,106 18,82" fill="#D99B26" stroke="#FFF7DF" strokeWidth="1.5" />
            <polygon points="102,38 60,62 60,106 102,82" fill="#9A6B12" stroke="#F6E3B4" strokeWidth="1.5" />
          </svg>
        </div>

        <div
          ref={setFloaterRef(2)}
          className="hidden sm:block absolute bottom-[26%] left-[15%] md:left-[22%] z-[12] w-16 md:w-22 opacity-80 pointer-events-none -rotate-12"
        >
          <svg viewBox="0 0 160 104" className="w-full h-auto drop-shadow-[0_14px_20px_rgba(0,0,0,0.4)]">
            <rect x="6" y="10" width="148" height="88" rx="10" fill="#102C4E" stroke="#D99B26" strokeWidth="2.5" />
            <rect x="22" y="30" width="26" height="20" rx="4" fill="#F5C76B" />
            <circle cx="122" cy="70" r="10" fill="#D99B26" opacity="0.9" />
            <circle cx="134" cy="70" r="10" fill="#F8D27A" opacity="0.75" />
          </svg>
        </div>

        <div
          ref={setFloaterRef(3)}
          className="hidden sm:block absolute bottom-[28%] right-[15%] md:right-[22%] z-[12] w-14 md:w-20 opacity-80 pointer-events-none rotate-12"
        >
          <svg viewBox="0 0 120 120" className="w-full h-auto drop-shadow-[0_14px_20px_rgba(0,0,0,0.4)]">
            <rect x="12" y="14" width="96" height="92" rx="8" fill="#FFFFFF" stroke="#D99B26" strokeWidth="2.5" />
            <rect x="26" y="64" width="14" height="26" fill="#0B325B" />
            <rect x="48" y="46" width="14" height="44" fill="#081FF7" />
            <rect x="70" y="30" width="14" height="60" fill="#D99B26" />
          </svg>
        </div>

        {/* Central Hero Artwork Layer with Calm Gentle Motion */}
        <div
          ref={characterParallaxRef}
          className="relative z-20 w-[250px] sm:w-[300px] md:w-[340px] lg:w-[360px] mx-auto pointer-events-none select-none"
        >
          <div ref={characterFloatRef}>
            <img
              src={heroArtUrl || HERO_TUT_PATH}
              alt="JOYA Editorial Hero Artwork"
              referrerPolicy="no-referrer"
              className={`w-full h-auto aspect-[1200/1697] object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)] ${
                heroArtUrl ? '' : 'mix-blend-screen'
              }`}
            />
          </div>
        </div>

        {/* Subtitle & Lowered CTA Under the Hero Image */}
        <div className="relative z-30 mt-5 text-center space-y-5 max-w-2xl px-4">
          <p className="text-sm md:text-base text-slate-200 leading-relaxed">
            منظومة الأنظمة التجارية والمحاسبية الأسرع انتشاراً لإدارة المبيعات والمخازن والفروع من مكان واحد
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#reveal-bridge"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 bg-white/5 text-xs md:text-sm font-medium text-slate-100 hover:border-[#D99B26] hover:text-[#D99B26] transition-colors"
            >
              <span>استكشف المزيد</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </a>
            <Link
              to="/systems"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D99B26] text-[#0B325B] text-xs md:text-sm font-bold hover:bg-[#eab040] transition-colors"
            >
              <span>دليل الأنظمة (28)</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
