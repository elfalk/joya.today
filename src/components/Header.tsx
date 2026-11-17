import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { JoyaLogo } from './JoyaLogo';
import { SocialLinksBar } from './SocialLinksBar';

export const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const goldCurtainRef = useRef<HTMLDivElement>(null);
  const navyCurtainRef = useRef<HTMLDivElement>(null);
  const linksWrapRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const gold = goldCurtainRef.current;
    const navy = navyCurtainRef.current;
    const linksWrap = linksWrapRef.current;
    if (!gold || !navy || !linksWrap) return;

    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      const tl = gsap.timeline();
      tl.set([gold, navy], { pointerEvents: 'auto', visibility: 'visible' })
        .fromTo(
          gold,
          { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' },
          {
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 82%)',
            duration: 0.48,
            ease: 'power3.inOut',
          }
        )
        .fromTo(
          navy,
          { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' },
          {
            clipPath: 'polygon(0 0, 100% 0, 100% 94%, 0 100%)',
            duration: 0.55,
            ease: 'power4.inOut',
          },
          '-=0.34'
        )
        .fromTo(
          linksWrap.querySelectorAll('.menu-anim-item'),
          { y: 36, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, duration: 0.42, ease: 'power3.out' },
          '-=0.25'
        );
    } else {
      document.body.style.overflow = '';
      const tl = gsap.timeline();
      tl.to(navy, {
        clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
        duration: 0.4,
        ease: 'power3.inOut',
      })
        .to(
          gold,
          {
            clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
            duration: 0.35,
            ease: 'power3.inOut',
          },
          '-=0.28'
        )
        .set([gold, navy], { pointerEvents: 'none', visibility: 'hidden' });
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0B325B]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Mark */}
          <Link to="/" className="shrink-0 flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D99B26]">
            <img
              src="/assets/joya-header-logo.svg"
              alt="JOYA Logo"
              referrerPolicy="no-referrer"
              className="h-9 md:h-10 w-auto object-contain select-none"
            />
          </Link>

          {/* Zone 2: Minimal Menu Icon Only */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              className="w-11 h-11 flex flex-col items-center justify-center gap-1.5 text-white hover:text-[#D99B26] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D99B26]"
            >
              <span
                className={`block w-7 h-[2px] bg-current transition-transform duration-300 ${
                  menuOpen ? 'translate-y-[4px] rotate-45' : ''
                }`}
              />
              <span
                className={`block w-7 h-[2px] bg-current transition-transform duration-300 ${
                  menuOpen ? '-translate-y-[4px] -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Tilted Gold Accent Curtain (Matching Reference Video) */}
      <div
        ref={goldCurtainRef}
        aria-hidden={!menuOpen}
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)', visibility: 'hidden' }}
        className="fixed inset-0 z-40 bg-[#D99B26] pointer-events-none"
      />

      {/* Tilted Deep Navy Fullscreen Menu Curtain */}
      <div
        ref={navyCurtainRef}
        aria-hidden={!menuOpen}
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)', visibility: 'hidden' }}
        className="fixed inset-0 z-40 bg-[#0B325B] text-white pointer-events-none flex items-center overflow-y-auto"
      >
        <div
          ref={linksWrapRef}
          className="max-w-[1200px] w-full mx-auto px-6 sm:px-10 md:px-16 pt-24 pb-12 grid grid-cols-1 md:grid-cols-12 gap-10 items-center"
        >
          {/* Main Editorial Menu Links */}
          <nav aria-label="قائمة الصفحات" className="md:col-span-8 flex flex-col gap-3 sm:gap-4">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="menu-anim-item text-right text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
            >
              <span className="menu-roll-item">
                <span className="roll-primary">الرئيسية</span>
                <span className="roll-clone" aria-hidden="true">الرئيسية</span>
              </span>
            </Link>

            <Link
              to="/core-systems"
              onClick={() => setMenuOpen(false)}
              className="menu-anim-item text-right text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
            >
              <span className="menu-roll-item">
                <span className="roll-primary">الأنظمة الأساسية (10)</span>
                <span className="roll-clone" aria-hidden="true">الأنظمة الأساسية (10)</span>
              </span>
            </Link>

            <Link
              to="/sub-systems"
              onClick={() => setMenuOpen(false)}
              className="menu-anim-item text-right text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
            >
              <span className="menu-roll-item">
                <span className="roll-primary">الأنظمة الفرعية (18)</span>
                <span className="roll-clone" aria-hidden="true">الأنظمة الفرعية (18)</span>
              </span>
            </Link>

            <Link
              to="/systems"
              onClick={() => setMenuOpen(false)}
              className="menu-anim-item text-right text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
            >
              <span className="menu-roll-item">
                <span className="roll-primary">دليل الأنظمة الكامل (28)</span>
                <span className="roll-clone" aria-hidden="true">دليل الأنظمة الكامل (28)</span>
              </span>
            </Link>

            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="menu-anim-item text-right text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
            >
              <span className="menu-roll-item">
                <span className="roll-primary">عن منصة JOYA</span>
                <span className="roll-clone" aria-hidden="true">عن منصة JOYA</span>
              </span>
            </Link>
          </nav>

          {/* Secondary Info Column */}
          <div className="md:col-span-4 space-y-5 border-t md:border-t-0 md:border-r border-white/15 pt-6 md:pt-0 md:pr-8">
            <div className="menu-anim-item">
              <JoyaLogo variant="light" size="lg" />
            </div>
            <p className="menu-anim-item text-sm text-slate-300 leading-relaxed">
              منصة JOYA تجمع 28 نظاماً متكاملاً لإدارة نقاط البيع، المخازن، الصيانة، العيادات، والمحاسبة ببيئة سحابية ومحلية عالية الاعتمادية.
            </p>
            <div className="menu-anim-item pt-1">
              <SocialLinksBar
                variant="dark"
                size="sm"
                onNavigate={() => setMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
