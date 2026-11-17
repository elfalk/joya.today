import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { JoyaSystem } from '../types';
import { SystemCard } from './SystemCard';

interface SubSystemsSectionProps {
  systems: JoyaSystem[];
}

export const SubSystemsSection: React.FC<SubSystemsSectionProps> = ({ systems }) => {
  if (systems.length === 0) return null;

  return (
    <section
      id="sub-systems"
      className="bg-white text-[#08335d] pt-20 pb-24 border-t border-slate-200"
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-10">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 mb-10 border-b border-slate-200/80">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#08335d]">
              الأنظمة الفرعية
            </h2>
          </div>
          <div className="space-y-3 max-w-md">
            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
              ثمانية عشر نظاماً تخصصياً لتغطية العيادات، الفنادق، المدارس، المقاولات، المصانع، وإدارة الموارد والحسابات.
            </p>
            <Link
              to="/sub-systems"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#08335d] hover:text-[#D99B26] transition-colors"
            >
              <span>عرض صفحة الأنظمة الفرعية الكاملة</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 18 Sub-Systems Executive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {systems.map((sys) => (
            <SystemCard key={sys.id} system={sys} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  );
};
