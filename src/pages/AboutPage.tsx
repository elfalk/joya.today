import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Layers, MonitorSmartphone, ShieldCheck } from 'lucide-react';
import { Header } from '../components/Header';
import { SpotlightFooter } from '../components/SpotlightFooter';
import { JoyaLogo } from '../components/JoyaLogo';
import { SeoHead } from '../components/SeoHead';
import { SocialLinksBar } from '../components/SocialLinksBar';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://joya.today';

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'عن منصة JOYA لأنظمة إدارة الأعمال',
      description:
        'تعرف على منصة JOYA المتكاملة التي توفر 28 نظاماً متخصصاً لنقاط البيع، المحاسبة، المخازن، الفروع، وإدارة الأنشطة التجارية.',
      url: `${origin}/about`,
      mainEntity: {
        '@type': 'Organization',
        name: 'JOYA',
        url: origin,
        email: 'hello@joya.today',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: 'عن منصة JOYA', item: `${origin}/about` },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#08335d] flex flex-col">
      <SeoHead
        title="عن منصة JOYA | بيئة تشغيل موحدة لـ 28 نظاماً تجارياً"
        description="تعرّف على معمارية منصة JOYA السحابية والمحلية التي تجمع 28 نظاماً تجارياً وتخصصياً لإدارة المبيعات والمخازن والفروع والحسابات."
        structuredData={structuredData}
      />

      <Header />

      <section className="pt-28 pb-14 bg-[#0B325B] text-white border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 space-y-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-300">
            <Link to="/" className="hover:text-[#D99B26] transition-colors inline-flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>الرئيسية</span>
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#D99B26] font-semibold">عن منصة JOYA</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-5">
              <JoyaLogo variant="light" size="md" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                بيئة تشغيل موحدة لكل نشاط تجاري
              </h1>
              <p className="text-base md:text-lg text-slate-200 leading-relaxed max-w-2xl">
                من نقاط البيع والمحامص إلى المستودعات والعيادات والمصانع، صُممت أنظمة JOYA لتمنح أصحاب الأعمال تحكماً فورياً في المبيعات والمخزون والفروع والتقارير المالية من منصة واحدة.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/core-systems"
                  className="px-5 py-3 bg-[#D99B26] text-[#0B325B] text-sm font-bold inline-flex items-center gap-2 hover:bg-[#eab040] transition-colors"
                >
                  <span>تصفح الأنظمة الأساسية (10)</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Link
                  to="/sub-systems"
                  className="px-5 py-3 border border-white/25 text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-white hover:text-[#0B325B] transition-colors"
                >
                  <span>تصفح الأنظمة الفرعية (18)</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-5 md:px-10 py-16 space-y-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 border border-slate-200 bg-white space-y-3">
            <Layers className="w-7 h-7 text-[#081FF7]" />
            <h2 className="text-xl font-bold">28 نظاماً متخصصاً</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              كل قطاع تجاري أو خدمي يمتلك نظاماً مفصّلاً لإجراءات عمله الفعلية بدلاً من الحلول العامة المحدودة.
            </p>
          </div>

          <div className="p-7 border border-slate-200 bg-white space-y-3">
            <MonitorSmartphone className="w-7 h-7 text-[#D99B26]" />
            <h2 className="text-xl font-bold">تشغيل متعدد المنصات</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              تعمل الأنظمة بسلاسة عبر Windows وAndroid وiOS والويب مع مزامنة سحابية ودعم العمل بدون إنترنت.
            </p>
          </div>

          <div className="p-7 border border-slate-200 bg-white space-y-3">
            <ShieldCheck className="w-7 h-7 text-emerald-700" />
            <h2 className="text-xl font-bold">تجربة مجانية 48 ساعة</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              تتيح المنصة تحميل وتجربة الأنظمة المتاحة مجاناً لمدة 48 ساعة كاملة أو الحجز المسبق للأنظمة القادمة.
            </p>
          </div>
        </div>

        <section className="p-8 border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>جاهز للانطلاق</span>
            </div>
            <h2 className="text-2xl font-bold text-[#08335d]">اكتشف المنظومة المناسبة لنشاطك الآن</h2>
            <p className="text-sm text-slate-600">
              قارن بين 28 نظاماً متكاملاً واختر النظام الأنسب لطبيعة عملك مع تجربة مجانية لمدة 48 ساعة.
            </p>
            <div className="pt-2">
              <SocialLinksBar variant="light" size="sm" />
            </div>
          </div>
          <Link
            to="/systems"
            className="px-6 py-3.5 bg-[#081FF7] text-white text-sm font-bold inline-flex items-center gap-2 shrink-0 hover:opacity-95 transition-opacity"
          >
            <span>تصفح جميع الأنظمة</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <SpotlightFooter />
    </div>
  );
};
