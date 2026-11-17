import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useJoya } from '../context/JoyaContext';
import { Header } from '../components/Header';
import { SpotlightFooter } from '../components/SpotlightFooter';
import { SystemCard } from '../components/SystemCard';
import { SeoHead } from '../components/SeoHead';
import { PlatformType } from '../types';

interface CategorySystemsPageProps {
  mode: 'all' | 'core' | 'additional';
}

const MODE_META = {
  all: {
    title: 'دليل أنظمة JOYA الكاملة (28 نظاماً) | حلول الأعمال ونقاط البيع',
    description:
      'استعرض جميع أنظمة JOYA الـ 28 لإدارة الكافيهات، المطاعم، السوبر ماركت، الصيدليات، العيادات، الفنادق، المقاولات، والمصانع على مختلف الأجهزة.',
    heading: 'جميع أنظمة JOYA',
    subtitle: 'منظومة متكاملة تضم 28 نظاماً تجارياً وتخصصياً تغطي كافة القطاعات والأنشطة.',
    path: '/systems',
  },
  core: {
    title: 'الأنظمة الأساسية من JOYA | نقاط البيع والمحامص والمطاعم والصيدليات',
    description:
      'اكتشف الأنظمة العشرة الأساسية من JOYA: أنظمة الكاشير والمحامص والصالونات والتجزئة والسوبر ماركت والمطاعم والصيدليات والسيارات والمغاسل والمخابز.',
    heading: 'الأنظمة الأساسية',
    subtitle: 'عشرة أنظمة رئيسية مصممة لإدارة الأنشطة التجارية اليومية بكفاءة وسرعة عالية.',
    path: '/core-systems',
  },
  additional: {
    title: 'الأنظمة الفرعية والتخصصية من JOYA | العيادات والفنادق والمصانع والمحاسبة',
    description:
      'تصفح 18 نظاماً فرعياً متخصصاً من JOYA لإدارة السبا، الجيم، العيادات، طب الأسنان، الفنادق، المدارس، الشحن، المقاولات، العقارات، المصانع، والحسابات.',
    heading: 'الأنظمة الفرعية',
    subtitle: 'ثمانية عشر نظاماً تخصصياً لمختلف القطاعات الطبية، الهندسية، الإنتاجية، والإدارية.',
    path: '/sub-systems',
  },
} as const;

export const CategorySystemsPage: React.FC<CategorySystemsPageProps> = ({ mode }) => {
  const { systems } = useJoya();
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | PlatformType>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mode]);

  const meta = MODE_META[mode];

  const categorySystems = useMemo(() => {
    return systems.filter((sys) => {
      if (mode === 'core' && sys.category !== 'core') return false;
      if (mode === 'additional' && sys.category !== 'additional') return false;
      if (platformFilter !== 'all' && !sys.platforms.includes(platformFilter)) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        sys.name.toLowerCase().includes(q) ||
        sys.shortDesc.toLowerCase().includes(q) ||
        sys.slug.toLowerCase().includes(q)
      );
    });
  }, [systems, mode, platformFilter, search]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://joya.today';

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: meta.heading,
      description: meta.description,
      url: `${origin}${meta.path}`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: categorySystems.length,
        itemListElement: categorySystems.map((sys, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: sys.name,
          url: `${origin}/system/${sys.slug}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'الرئيسية',
          item: `${origin}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: meta.heading,
          item: `${origin}${meta.path}`,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#08335d] flex flex-col">
      <SeoHead
        title={meta.title}
        description={meta.description}
        structuredData={structuredData}
      />

      <Header />

      {/* Top Dark Editorial Banner */}
      <section className="pt-28 pb-12 bg-[#0B325B] text-white border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 space-y-6">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <Link to="/" className="hover:text-[#D99B26] transition-colors inline-flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>الرئيسية</span>
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#D99B26] font-semibold">{meta.heading}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                {meta.heading}
              </h1>
              <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                {meta.subtitle}
              </p>
            </div>

            {/* Crawlable Category Switch Links */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/systems"
                className={`px-4 py-2 text-xs font-bold border transition-colors ${
                  mode === 'all'
                    ? 'bg-[#D99B26] border-[#D99B26] text-[#0B325B]'
                    : 'border-white/20 text-white hover:border-[#D99B26] hover:text-[#D99B26]'
                }`}
              >
                جميع الأنظمة (28)
              </Link>
              <Link
                to="/core-systems"
                className={`px-4 py-2 text-xs font-bold border transition-colors ${
                  mode === 'core'
                    ? 'bg-[#D99B26] border-[#D99B26] text-[#0B325B]'
                    : 'border-white/20 text-white hover:border-[#D99B26] hover:text-[#D99B26]'
                }`}
              >
                الأنظمة الأساسية (10)
              </Link>
              <Link
                to="/sub-systems"
                className={`px-4 py-2 text-xs font-bold border transition-colors ${
                  mode === 'additional'
                    ? 'bg-[#D99B26] border-[#D99B26] text-[#0B325B]'
                    : 'border-white/20 text-white hover:border-[#D99B26] hover:text-[#D99B26]'
                }`}
              >
                الأنظمة الفرعية (18)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Toolbar + Systems Grid */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-5 md:px-10 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم النظام أو النشاط التجاري..."
              className="w-full pr-10 pl-4 py-2.5 text-sm border border-slate-300 focus:border-[#08335d] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
            {(
              [
                { id: 'all', label: 'All Platforms' },
                { id: 'windows', label: 'Windows' },
                { id: 'android', label: 'Android' },
                { id: 'ios', label: 'iOS' },
                { id: 'web', label: 'Web' },
              ] as const
            ).map((plat) => (
              <button
                key={plat.id}
                type="button"
                onClick={() => setPlatformFilter(plat.id)}
                className={`px-3 py-1.5 text-xs font-semibold border cursor-pointer transition-colors ${
                  platformFilter === plat.id
                    ? 'bg-[#08335d] border-[#08335d] text-white'
                    : 'border-slate-300 text-slate-600 hover:border-[#08335d] hover:text-[#08335d]'
                }`}
              >
                {plat.label}
              </button>
            ))}
          </div>
        </div>

        {categorySystems.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-slate-200 bg-white">
            <p className="text-lg font-bold text-[#08335d]">لا توجد أنظمة مطابقة لبحثك</p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPlatformFilter('all');
              }}
              className="px-5 py-2 bg-[#08335d] text-white text-xs font-semibold cursor-pointer"
            >
              إعادة ضبط البحث
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              mode === 'core'
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {categorySystems.map((sys) => (
              <SystemCard
                key={sys.id}
                system={sys}
                variant={mode === 'core' ? 'featured' : 'compact'}
              />
            ))}
          </div>
        )}
      </main>

      <SpotlightFooter />
    </div>
  );
};
