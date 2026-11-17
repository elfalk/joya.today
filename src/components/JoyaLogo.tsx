import React, { useEffect, useState } from 'react';

interface JoyaLogoProps {
  variant?: 'light' | 'dark' | 'watermark';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  wordmarkOnly?: boolean;
  className?: string;
}

const RAW_LOGO_PATH = '/assets/aistudio/____JOYA_________26c631bb.png';
const processedCache: Record<string, string> = {};

function processOfficialLogo(
  variant: 'light' | 'dark' | 'watermark',
  wordmarkOnly: boolean
): Promise<string> {
  const cacheKey = `${variant}_${wordmarkOnly ? 'word' : 'full'}`;
  if (processedCache[cacheKey]) {
    return Promise.resolve(processedCache[cacheKey]);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        // Exact crop bounds inside 2000x2000 official brand PNG
        const sx = wordmarkOnly ? 732 : 465;
        const sy = wordmarkOnly ? 1130 : 1125;
        const sw = wordmarkOnly ? 536 : 1070;
        const sh = wordmarkOnly ? 142 : 400;

        const canvas = document.createElement('canvas');
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No 2d context'));
          return;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        const imageData = ctx.getImageData(0, 0, sw, sh);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = (r + g + b) / 3;

          if (Math.abs(lum - 246) <= 1.2) {
            // Solid #F6F6F6 backdrop -> transparent
            data[i + 3] = 0;
          } else if (lum > 246) {
            // Anti-aliased J, O, A white letters
            const alpha = Math.min(1, (lum - 246) / 9);
            if (variant === 'light') {
              data[i] = 255;
              data[i + 1] = 255;
              data[i + 2] = 255;
              data[i + 3] = Math.round(alpha * 255);
            } else if (variant === 'dark') {
              data[i] = 11;
              data[i + 1] = 50;
              data[i + 2] = 91;
              data[i + 3] = Math.round(alpha * 255);
            } else {
              data[i] = 11;
              data[i + 1] = 50;
              data[i + 2] = 91;
              data[i + 3] = Math.round(alpha * 160);
            }
          } else {
            // Anti-aliased Y and BUSINESS TODAY silver-gray elements
            const alpha = Math.min(1, (246 - lum) / 29);
            if (variant === 'light') {
              data[i] = 203;
              data[i + 1] = 213;
              data[i + 2] = 225;
              data[i + 3] = Math.round(alpha * 245);
            } else if (variant === 'dark') {
              data[i] = 100;
              data[i + 1] = 116;
              data[i + 2] = 139;
              data[i + 3] = Math.round(alpha * 245);
            } else {
              data[i] = 148;
              data[i + 1] = 163;
              data[i + 2] = 184;
              data[i + 3] = Math.round(alpha * 150);
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const url = canvas.toDataURL('image/png');
        processedCache[cacheKey] = url;
        resolve(url);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = RAW_LOGO_PATH;
  });
}

export const JoyaLogo: React.FC<JoyaLogoProps> = ({
  variant = 'light',
  size = 'md',
  wordmarkOnly = false,
  className = '',
}) => {
  const cacheKey = `${variant}_${wordmarkOnly ? 'word' : 'full'}`;
  const [src, setSrc] = useState<string | null>(() => processedCache[cacheKey] || null);

  useEffect(() => {
    let active = true;
    processOfficialLogo(variant, wordmarkOnly)
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch(() => {
        // Fallback handled below
      });
    return () => {
      active = false;
    };
  }, [variant, wordmarkOnly]);

  const sizeClass =
    size === 'hero'
      ? 'w-[74vw] sm:w-[62vw] max-w-[680px] h-auto'
      : size === 'sm'
      ? 'h-9 w-auto'
      : size === 'lg'
      ? 'h-16 md:h-20 w-auto'
      : 'h-11 md:h-12 w-auto';

  if (src) {
    return (
      <img
        src={src}
        alt={wordmarkOnly ? 'JOYA' : 'JOYA — BUSINESS TODAY'}
        referrerPolicy="no-referrer"
        className={`${sizeClass} object-contain select-none ${
          variant === 'watermark' ? 'opacity-30' : ''
        } ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={wordmarkOnly ? 'JOYA' : 'JOYA — BUSINESS TODAY'}
      className={`${sizeClass} aspect-[2.675/1] opacity-0 pointer-events-none select-none ${className}`}
    />
  );
};
