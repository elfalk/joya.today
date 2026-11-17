import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, Clock } from 'lucide-react';
import { JoyaSystem } from '../types';
import { PlatformIcons } from './PlatformIcons';

interface SystemCardProps {
  system: JoyaSystem;
  variant?: 'featured' | 'compact';
}

export const SystemCard: React.FC<SystemCardProps> = ({
  system,
  variant = 'compact',
}) => {
  const isAvailable = system.status === 'available';
  const isFeatured = variant === 'featured';
  const lowestPkg =
    system.packages.length > 0
      ? [...system.packages].sort((a, b) => a.price - b.price)[0]
      : null;

  return (
    <Link
      to={`/system/${system.slug}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-[0_1px_3px_rgba(8,51,93,0.04)] hover:shadow-[0_20px_44px_-16px_rgba(8,51,93,0.14)] hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08335d]"
    >
      {/* Subtle Brand Top Hairline */}
      <div
        className="h-[3px] w-full opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: system.color }}
        aria-hidden="true"
      />

      {/* Top Metadata Rail (Clean Typography — Zero Pills) */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono-num font-bold text-slate-400">
            {String(system.order).padStart(2, '0')}
          </span>
          <span className="text-slate-300" aria-hidden="true">
            ·
          </span>
          <span
            className={`inline-flex items-center gap-1.5 font-semibold ${
              isAvailable ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {isAvailable ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Clock className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{isAvailable ? 'متاح الآن' : 'قريباً'}</span>
          </span>
        </div>

        <PlatformIcons platforms={system.platforms} />
      </div>

      {/* Borderless Tonal Brand Showcase Stage */}
      <div
        className={`mx-5 rounded-xl flex items-center justify-center px-6 transition-colors duration-300 ${
          isFeatured ? 'h-44 sm:h-48' : 'h-36'
        }`}
        style={{
          background: `radial-gradient(circle at 50% 45%, ${system.color}12 0%, rgba(248,250,252,0.95) 75%)`,
        }}
      >
        {system.logoUrl ? (
          <img
            src={system.logoUrl}
            alt={`${system.name} Logo`}
            referrerPolicy="no-referrer"
            className={`${
              isFeatured ? 'max-h-32 sm:max-h-36 max-w-[230px]' : 'max-h-24 max-w-[190px]'
            } w-auto object-contain transition-transform duration-300 ease-out group-hover:scale-[1.05] select-none`}
          />
        ) : (
          <span
            className="font-editorial font-bold text-2xl tracking-tight"
            style={{ color: system.color }}
            dir="ltr"
          >
            {system.name}
          </span>
        )}
      </div>

      {/* Content & Feature Highlights */}
      <div className="p-6 flex-1 flex flex-col justify-between gap-5">
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <h3
              className={`font-editorial font-bold tracking-tight ${
                isFeatured ? 'text-2xl md:text-[26px]' : 'text-xl'
              }`}
              style={{ color: '#08335d' }}
              dir="ltr"
            >
              {system.name}
            </h3>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
            {system.shortDesc}
          </p>

          {isFeatured && system.features.length > 0 && (
            <ul className="pt-2 space-y-1.5">
              {system.features.slice(0, 2).map((feat, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed"
                >
                  <Check
                    className="w-3.5 h-3.5 shrink-0 mt-0.5"
                    style={{ color: system.color }}
                  />
                  <span className="line-clamp-1">{feat}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Clean Action Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {lowestPkg ? (
              <span>
                يبدأ من{' '}
                <strong className="font-mono-num text-[#08335d] font-bold">
                  {lowestPkg.price.toLocaleString('en-US')} {lowestPkg.currency}
                </strong>
                <span className="text-slate-400"> / {lowestPkg.duration}</span>
              </span>
            ) : (
              <span>باقات مرنة للأعمال</span>
            )}
          </div>

          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-colors"
            style={{ color: isAvailable ? system.color : '#08335d' }}
          >
            <span>{isAvailable ? 'تجربة 48 ساعة' : 'التفاصيل والحجز'}</span>
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
};
