import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { JoyaLogo } from './JoyaLogo';
import { SocialLinksBar } from './SocialLinksBar';

export const SpotlightFooter: React.FC = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 42, active: false });

  useEffect(() => {
    const footerEl = footerRef.current;
    if (!footerEl) return;

    const handleMove = (e: MouseEvent) => {
      const targetRect = (artRef.current ?? footerEl).getBoundingClientRect();
      const x = ((e.clientX - targetRect.left) / targetRect.width) * 100;
      const y = ((e.clientY - targetRect.top) / targetRect.height) * 100;
      setSpot({ x, y, active: true });
    };

    const handleLeave = () => {
      setSpot((prev) => ({ ...prev, active: false }));
    };

    footerEl.addEventListener('mousemove', handleMove, { passive: true });
    footerEl.addEventListener('mouseleave', handleLeave);
    return () => {
      footerEl.removeEventListener('mousemove', handleMove);
      footerEl.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  const maskGradient = spot.active
    ? `radial-gradient(circle 280px at ${spot.x}% ${spot.y}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 45%, rgba(0,0,0,0) 78%)`
    : `radial-gradient(circle 240px at 50% 42%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 76%)`;

  return (
    <footer className="bg-[#08335d] text-white">

      {/* Interactive Spotlight Navy Footer with Dual-Layer Uploaded WebP Table */}
      <div
        ref={footerRef}
        style={{ containerType: 'inline-size' }}
        className="relative overflow-hidden bg-[#08335d] pt-16 pb-6 px-5 md:px-10"
      >
        {/* Dual-Layer Table Artwork Peeking From Bottom Behind Footer Links (tUdqrq_art) */}
        <div
          ref={artRef}
          className="pointer-events-none select-none aspect-square w-[90cqw] sm:w-[76cqw] md:w-[68cqw] max-w-[980px] absolute -bottom-[26cqw] md:-bottom-[29cqw] left-1/2 -translate-x-1/2 z-0"
        >
          <img
            src="/assets/aistudio/table-unlit_052b18c6.webp"
            alt="طاولة منصة JOYA التفاعلية"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain opacity-95"
          />

          <div
            className="absolute inset-0 transition-opacity duration-200"
            style={{
              WebkitMaskImage: maskGradient,
              maskImage: maskGradient,
            }}
          >
            <img
              src="/assets/aistudio/table-illustration_af98bb1d.webp"
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Top Contact & Brand Row */}
        <div className="max-w-[1440px] mx-auto relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 pb-6">
          <div className="space-y-4">
            <JoyaLogo variant="light" size="lg" />
            <div>
              <a
                href="mailto:hello@joya.today"
                className="inline-block text-xl md:text-3xl font-editorial font-semibold text-white hover:text-[#f7b538] transition-colors"
                dir="ltr"
              >
                hello@joya.today
              </a>
            </div>
            <SocialLinksBar variant="dark" />
          </div>

          <nav aria-label="روابط التذييل">
            <ul className="flex flex-wrap items-center gap-4 md:gap-5 text-sm font-medium text-slate-200">
              <li>
                <Link to="/core-systems" className="hover:text-[#f7b538] transition-colors">
                  الأنظمة الأساسية
                </Link>
              </li>
              <li aria-hidden="true" className="w-1.5 h-1.5 bg-[#f7b538] rotate-45" />
              <li>
                <Link to="/sub-systems" className="hover:text-[#f7b538] transition-colors">
                  الأنظمة الفرعية
                </Link>
              </li>
              <li aria-hidden="true" className="w-1.5 h-1.5 bg-[#f7b538] rotate-45" />
              <li>
                <Link to="/systems" className="hover:text-[#f7b538] transition-colors">
                  جميع الأنظمة
                </Link>
              </li>
              <li aria-hidden="true" className="w-1.5 h-1.5 bg-[#f7b538] rotate-45" />
              <li>
                <Link to="/about" className="hover:text-[#f7b538] transition-colors">
                  عن المنصة
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Table Breathing Spacer Matching Reference (tUdqrq_tableSpace) */}
        <div className="h-[52cqw] sm:h-[40cqw] md:h-[34cqw]" aria-hidden="true" />

        {/* Quiet Bottom Copyright Bar */}
        <div className="max-w-[1440px] mx-auto relative z-10 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300/80">
          <span>© 2026 JOYA — جميع الحقوق محفوظة</span>
          <span className="font-mono-num" dir="ltr">
            JOYA · 28 SYSTEMS
          </span>
        </div>
      </div>
    </footer>
  );
};
