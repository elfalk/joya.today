import React from 'react';
import { Monitor, Smartphone, TabletSmartphone, Globe } from 'lucide-react';
import { PlatformType } from '../types';

const PLATFORM_META: Record<
  PlatformType,
  { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  windows: { label: 'Windows', Icon: Monitor },
  android: { label: 'Android', Icon: Smartphone },
  ios: { label: 'iOS', Icon: TabletSmartphone },
  web: { label: 'Web', Icon: Globe },
};

interface PlatformIconsProps {
  platforms: PlatformType[];
  showLabels?: boolean;
  dark?: boolean;
}

export const PlatformIcons: React.FC<PlatformIconsProps> = ({
  platforms,
  showLabels = false,
  dark = false,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3" dir="ltr">
      {platforms.map((p) => {
        const meta = PLATFORM_META[p];
        if (!meta) return null;
        const Icon = meta.Icon;
        return (
          <span
            key={p}
            title={meta.label}
            className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${
              dark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {showLabels && <span>{meta.label}</span>}
          </span>
        );
      })}
    </div>
  );
};
