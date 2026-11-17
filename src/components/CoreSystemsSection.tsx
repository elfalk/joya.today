import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { JoyaSystem } from '../types';
import { JoyaLogo } from './JoyaLogo';
import { SystemCard } from './SystemCard';

interface CoreSystemsSectionProps {
  systems: JoyaSystem[];
}

export const CoreSystemsSection: React.FC<CoreSystemsSectionProps> = ({ systems }) => {
  return (
    <section id="core-systems" className="bg-[#F8FAFC] text-[#08335d] pt-20 pb-20">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10">
        {/* Editorial Section Heading with Site Logo */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 mb-10 border-b border-slate-200/80">
          <div className="space-y-4">
            <JoyaLogo variant="dark" size="md" />
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#08335d]">
                الأنظمة الأساسية
              </h2>
            </div>
          </div>
          <div className="space-y-3 max-w-md">
            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
              عشرة أنظمة متخصصة تغطي القطاعات التجارية الأكثر نشاطاً، بهوية بصرية مستقلة وباقات اشتراك مرنة.
            </p>
            <Link
              to="/core-systems"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#08335d] hover:text-[#D99B26] transition-colors"
            >
              <span>عرض صفحة الأنظمة الأساسية الكاملة</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 10 Core Systems Executive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7">
          {systems.map((sys) => (
            <SystemCard key={sys.id} system={sys} variant="featured" />
          ))}
        </div>
      </div>
    </section>
  );
};
