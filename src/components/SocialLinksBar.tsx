import React from 'react';
import { useJoya } from '../context/JoyaContext';
import { SocialLinks } from '../types';

export type SocialPlatformKey =
  | 'youtube'
  | 'facebook'
  | 'tiktok'
  | 'linkedin'
  | 'instagram'
  | 'whatsapp';

export interface SocialPlatformMeta {
  key: SocialPlatformKey;
  arLabel: string;
  enLabel: string;
  placeholder: string;
  brandColor: string;
  Icon: React.FC<{ className?: string }>;
}

const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const LinkedInIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.375c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.813 14.125c-.25.703-1.438 1.344-2 1.422-.531.078-1.203.109-1.953-.125-.453-.141-1.031-.328-1.766-.641-3.094-1.344-5.109-4.469-5.266-4.672-.156-.203-1.266-1.688-1.266-3.219s.797-2.281 1.078-2.594c.281-.313.609-.391.813-.391.203 0 .406 0 .578.016.188.016.438-.078.688.531.25.609.859 2.109.938 2.266.078.156.125.344.031.547-.094.203-.141.328-.281.5-.141.172-.297.391-.422.516-.141.141-.297.297-.125.594.172.297.766 1.266 1.641 2.047 1.125 1 2.078 1.313 2.375 1.469.297.156.469.125.641-.078.172-.203.75-.875.953-1.172.203-.297.406-.25.672-.156.266.094 1.719.813 2.016.953.297.141.484.219.563.344.078.125.078.734-.172 1.438z" />
  </svg>
);

export const SOCIAL_PLATFORMS: SocialPlatformMeta[] = [
  {
    key: 'youtube',
    arLabel: 'يوتيوب',
    enLabel: 'YouTube',
    placeholder: 'https://youtube.com/@joyatoday',
    brandColor: '#FF0000',
    Icon: YouTubeIcon,
  },
  {
    key: 'facebook',
    arLabel: 'فيس بوك',
    enLabel: 'Facebook',
    placeholder: 'https://facebook.com/joyatoday',
    brandColor: '#1877F2',
    Icon: FacebookIcon,
  },
  {
    key: 'tiktok',
    arLabel: 'تيك توك',
    enLabel: 'TikTok',
    placeholder: 'https://tiktok.com/@joyatoday',
    brandColor: '#00F2EA',
    Icon: TikTokIcon,
  },
  {
    key: 'linkedin',
    arLabel: 'لينكدان',
    enLabel: 'LinkedIn',
    placeholder: 'https://linkedin.com/company/joyatoday',
    brandColor: '#0A66C2',
    Icon: LinkedInIcon,
  },
  {
    key: 'instagram',
    arLabel: 'انستجرام',
    enLabel: 'Instagram',
    placeholder: 'https://instagram.com/joyatoday',
    brandColor: '#E4405F',
    Icon: InstagramIcon,
  },
  {
    key: 'whatsapp',
    arLabel: 'واتساب',
    enLabel: 'WhatsApp',
    placeholder: 'https://wa.me/201000000000 أو رقم الهاتف',
    brandColor: '#25D366',
    Icon: WhatsAppIcon,
  },
];

interface SocialLinksBarProps {
  variant?: 'dark' | 'light';
  overrideLinks?: SocialLinks;
  size?: 'sm' | 'md';
  onNavigate?: () => void;
}

export const SocialLinksBar: React.FC<SocialLinksBarProps> = ({
  variant = 'dark',
  overrideLinks,
  size = 'md',
  onNavigate,
}) => {
  const { socialLinks } = useJoya();
  const links = overrideLinks ?? socialLinks;

  const configuredPlatforms = SOCIAL_PLATFORMS.filter(
    (p) => Boolean(links[p.key] && links[p.key].trim().length > 0)
  );
  const hasAnyConfigured = configuredPlatforms.length > 0;
  const itemsToRender = hasAnyConfigured ? configuredPlatforms : SOCIAL_PLATFORMS;

  const boxSize = size === 'sm' ? 'w-9 h-9' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]';

  const darkActiveClass =
    'border-white/15 bg-white/[0.04] text-slate-200 hover:border-[#f7b538] hover:text-[#f7b538] hover:bg-white/[0.08]';
  const darkSetupClass =
    'border-white/10 bg-white/[0.02] text-slate-400 hover:border-[#f7b538]/70 hover:text-[#f7b538]';
  const lightActiveClass =
    'border-slate-200 bg-white text-[#08335d] hover:border-[#08335d] hover:bg-[#08335d] hover:text-white';
  const lightSetupClass =
    'border-slate-200 bg-slate-50 text-slate-400 hover:border-[#08335d] hover:text-[#08335d]';

  return (
    <div className="flex flex-wrap items-center gap-2.5" aria-label="حسابات التواصل الاجتماعي">
      {itemsToRender.map(({ key, arLabel, enLabel, Icon }) => {
        const href = links[key]?.trim();
        const commonClasses = `${boxSize} rounded-lg border inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b538]`;

        if (href) {
          return (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${arLabel} (${enLabel})`}
              title={arLabel}
              onClick={onNavigate}
              className={`${commonClasses} ${variant === 'dark' ? darkActiveClass : lightActiveClass}`}
            >
              <Icon className={iconSize} />
            </a>
          );
        }

        return (
          <span
            key={key}
            aria-label={arLabel}
            title={arLabel}
            className={`${commonClasses} ${variant === 'dark' ? darkSetupClass : lightSetupClass}`}
          >
            <Icon className={iconSize} />
          </span>
        );
      })}
    </div>
  );
};
