import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const GOLD_FACETS: { points: string; fill: string; shimmer?: boolean }[] = [
  // Top-left serif
  { points: '4,12 36,12 18,22', fill: '#FFF3BA', shimmer: true },
  { points: '4,12 18,22 4,22', fill: '#C8891E' },
  { points: '36,12 68,12 52,22', fill: '#F8D27A' },
  { points: '36,12 52,22 18,22', fill: '#E7AB3C' },
  { points: '52,22 68,12 68,22', fill: '#A86B10' },
  // Upper & mid left arm
  { points: '18,22 38,22 46,65', fill: '#FCE293', shimmer: true },
  { points: '38,22 54,22 66,60', fill: '#D99B26' },
  { points: '38,22 66,60 46,65', fill: '#F4C460' },
  { points: '54,22 66,60 80,82', fill: '#B57614' },
  { points: '46,65 66,60 74,106', fill: '#C9871E' },
  { points: '66,60 80,82 74,106', fill: '#F8D27A', shimmer: true },
  { points: '66,60 92,92 80,82', fill: '#FFEBA8' },
  { points: '80,82 92,92 92,108', fill: '#D99B26' },
  { points: '74,106 80,82 92,108', fill: '#9A5E0B' },
  // Left stem
  { points: '74,106 92,108 82,142', fill: '#F9D682', shimmer: true },
  { points: '92,108 92,136 82,142', fill: '#B57614' },
  { points: '74,106 82,142 74,146', fill: '#CA8B1F' },
  { points: '74,146 82,142 74,178', fill: '#ECB74B' },
  { points: '82,142 92,136 92,178', fill: '#D99B26' },
  { points: '82,142 92,178 74,178', fill: '#FFF1BD', shimmer: true },
  // Bottom-left serif
  { points: '54,178 74,178 54,188', fill: '#D99B26' },
  { points: '74,178 74,188 54,188', fill: '#9A5E0B' },
  { points: '74,178 92,178 82,188', fill: '#F8D27A' },
  { points: '74,178 82,188 74,188', fill: '#C8891E' },
  { points: '92,178 92,188 82,188', fill: '#B57614' },
];

const WIREFRAME_TRIANGLES: string[] = [
  // Top-right serif
  '120,12 148,12 136,22',
  '120,12 136,22 120,22',
  '148,12 176,12 158,22',
  '148,12 158,22 136,22',
  '158,22 176,12 176,22',
  // Right diagonal arm
  '136,22 158,22 138,60',
  '136,22 138,60 118,56',
  '118,56 138,60 122,86',
  '118,56 122,86 106,82',
  '106,82 122,86 106,106',
  '106,82 106,106 92,92',
  '92,92 106,106 92,108',
  // Right stem
  '92,108 106,106 106,144',
  '92,108 106,144 92,136',
  '92,136 106,144 106,178',
  '92,136 106,178 92,178',
  // Bottom-right serif
  '92,178 106,178 106,188',
  '92,178 106,188 92,188',
  '106,178 128,178 106,188',
  '128,178 128,188 106,188',
];

const WIREFRAME_NODES: [number, number][] = [
  [120, 12],
  [148, 12],
  [176, 12],
  [158, 22],
  [136, 22],
  [118, 56],
  [138, 60],
  [122, 86],
  [106, 82],
  [92, 92],
  [92, 108],
  [106, 106],
  [92, 136],
  [106, 144],
  [92, 178],
  [106, 178],
  [128, 178],
  [128, 188],
  [92, 188],
];

export const CreativeHeroY: React.FC = () => {
  const rootRef = useRef<SVGSVGElement>(null);
  const shardsRef = useRef<(SVGPolygonElement | null)[]>([]);

  useEffect(() => {
    const svg = rootRef.current;
    if (!svg) return;

    const ctx = gsap.context(() => {
      shardsRef.current.forEach((shard, idx) => {
        if (!shard) return;
        gsap.to(shard, {
          x: idx % 2 === 0 ? 4 : -4,
          y: -6 - idx * 2,
          rotation: idx % 2 === 0 ? 16 : -14,
          opacity: 0.35,
          transformOrigin: 'center center',
          duration: 2.6 + idx * 0.45,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: idx * 0.35,
        });
      });
    }, svg);

    return () => ctx.revert();
  }, []);

  return (
    <span className="relative inline-flex items-baseline justify-center mx-[0.02em] align-baseline">
      <span className="sr-only">Y</span>
      <svg
        ref={rootRef}
        viewBox="0 0 180 200"
        aria-hidden="true"
        className="h-[0.76em] w-[0.68em] translate-y-[0.03em] overflow-visible select-none"
      >
        <defs>
          <filter id="joyaCyanGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="joyaGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Left Side: Sculpted 3D Low-Poly Pharaonic Gold Facets */}
        <g filter="url(#joyaGoldGlow)">
          {GOLD_FACETS.map((f, idx) => (
            <polygon
              key={idx}
              points={f.points}
              fill={f.fill}
              stroke="#FFF4CC"
              strokeWidth="0.45"
              strokeLinejoin="round"
              className={f.shimmer ? 'joya-facet-pulse' : undefined}
            />
          ))}
        </g>

        {/* Center Spine Seam Glow */}
        <line
          x1="92"
          y1="88"
          x2="92"
          y2="188"
          stroke="#F8D27A"
          strokeWidth="1.2"
          strokeOpacity="0.65"
        />

        {/* Right Side: Glowing Cyan Wireframe Lattice */}
        <g filter="url(#joyaCyanGlow)">
          {WIREFRAME_TRIANGLES.map((pts, idx) => (
            <polygon
              key={idx}
              points={pts}
              fill="rgba(34, 211, 238, 0.08)"
              stroke="#22D3EE"
              strokeWidth="1.35"
              strokeLinejoin="round"
            />
          ))}

          {/* Animated energy flow lines running through the wireframe right arm & stem */}
          <polyline
            points="176,12 158,22 138,60 122,86 106,106 106,144 106,178 128,188"
            fill="none"
            stroke="#E0F9FF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="joya-wire-flow"
          />

          {/* Glowing geometric nodes */}
          {WIREFRAME_NODES.map(([cx, cy], idx) => (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r={idx % 3 === 0 ? 2.2 : 1.5}
              fill="#E0F9FF"
            />
          ))}
        </g>

        {/* Detached Levitating Shards Morphing Between Gold & Wireframe */}
        <polygon
          ref={(el) => {
            shardsRef.current[0] = el;
          }}
          points="86,62 96,54 98,66"
          fill="#F8D27A"
          stroke="#FFF4CC"
          strokeWidth="0.6"
        />
        <polygon
          ref={(el) => {
            shardsRef.current[1] = el;
          }}
          points="95,38 106,32 102,44"
          fill="rgba(34, 211, 238, 0.25)"
          stroke="#22D3EE"
          strokeWidth="1.2"
        />
        <polygon
          ref={(el) => {
            shardsRef.current[2] = el;
          }}
          points="100,118 112,112 110,124"
          fill="rgba(34, 211, 238, 0.2)"
          stroke="#38BDF8"
          strokeWidth="1.2"
        />
        <polygon
          ref={(el) => {
            shardsRef.current[3] = el;
          }}
          points="78,76 88,68 85,80"
          fill="#FFF2B2"
        />
      </svg>
    </span>
  );
};
