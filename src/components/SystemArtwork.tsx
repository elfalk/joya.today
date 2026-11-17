import React from 'react';
import {
  Coffee,
  Scissors,
  Shirt,
  ShoppingCart,
  Utensils,
  Pill,
  Smartphone,
  Wrench,
  Sparkles,
  Croissant,
  Layers,
} from 'lucide-react';
import { JoyaSystem } from '../types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'joya-pos': Coffee,
  'joya-salon': Scissors,
  'joya-retail': Shirt,
  'joya-market': ShoppingCart,
  'joya-restaurant': Utensils,
  'joya-pharmacy': Pill,
  'joya-electronics': Smartphone,
  'joya-garage': Wrench,
  'joya-laundry': Sparkles,
  'joya-bakery': Croissant,
};

interface SystemArtworkProps {
  system: JoyaSystem;
  compact?: boolean;
}

export const SystemArtwork: React.FC<SystemArtworkProps> = ({ system, compact = false }) => {
  const Icon = ICON_MAP[system.id] || Layers;
  const hasCustomLogo = Boolean(system.logoUrl && system.logoUrl.trim().length > 0);

  return (
    <div
      className={`w-full flex items-center justify-center ${
        compact ? 'min-h-[140px] py-2' : 'min-h-[180px] md:min-h-[210px] py-3'
      }`}
    >
      {hasCustomLogo ? (
        <img
          src={system.logoUrl}
          alt={`${system.name} Logo`}
          referrerPolicy="no-referrer"
          className={`${
            compact ? 'h-40 max-w-[220px]' : 'h-48 md:h-56 max-w-[280px]'
          } w-auto object-contain transition-transform duration-500 group-hover:scale-105 select-none`}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 text-center transition-transform duration-500 group-hover:scale-105 select-none">
          <Icon className="w-14 h-14 md:w-16 md:h-16" style={{ color: system.color }} />
          <span
            className="font-editorial font-bold text-xl tracking-tight"
            style={{ color: system.color }}
            dir="ltr"
          >
            {system.name}
          </span>
        </div>
      )}
    </div>
  );
};
