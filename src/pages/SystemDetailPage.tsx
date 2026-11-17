import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  ShoppingBag,
  CalendarClock,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useJoya } from '../context/JoyaContext';
import { LeadRequestType } from '../types';
import { Header } from '../components/Header';
import { SpotlightFooter } from '../components/SpotlightFooter';
import { JoyaLogo } from '../components/JoyaLogo';
import { PlatformIcons } from '../components/PlatformIcons';
import { SystemArtwork } from '../components/SystemArtwork';
import { LeadCaptureModal } from '../components/LeadCaptureModal';
import { SeoHead } from '../components/SeoHead';

export const SystemDetailPage: React.FC = () => {
  const { slug, section } = useParams<{ slug: string; section?: string }>();
  const { systems } = useJoya();

  const system = systems.find((s) => s.slug === slug || s.id === slug);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<LeadRequestType>('download');
  const [selectedPkgId, setSelectedPkgId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (section === 'packages') {
      setTimeout(() => {
        document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [slug, section]);

  if (!system) {
    return (
      <div className="min-h-screen bg-white text-[#0B325B] flex flex-col">
        <SeoHead
          title="النظام غير موجود | JOYA"
          description="لم يتم العثور على النظام المطلوب في منصة JOYA."
          robots="noindex, nofollow"
        />
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-20 text-center space-y-5">
          <h1 className="text-3xl font-bold">النظام غير موجود</h1>
          <p className="text-sm text-slate-600">لم نتمكن من العثور على النظام المطلوب.</p>
          <Link
            to="/"
            className="px-6 py-3 bg-[#0B325B] text-white text-sm font-semibold hover:bg-[#13467d] transition-colors"
          >
            العودة إلى الرئيسية
          </Link>
        </main>
        <SpotlightFooter />
      </div>
    );
  }

  const isAvailable = system.status === 'available';
  const relatedSystems = systems
    .filter((s) => s.id !== system.id && s.category === system.category)
    .slice(0, 4);

  const openModal = (type: LeadRequestType, pkgId?: string) => {
    setModalType(type);
    setSelectedPkgId(pkgId);
    setModalOpen(true);
  };

  const categoryPath = system.category === 'core' ? '/core-systems' : '/sub-systems';
  const categoryLabel = system.category === 'core' ? 'الأنظمة الأساسية' : 'الأنظمة الفرعية';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://joya.today';

  const seoTitle =
    section === 'packages'
      ? `باقات وأسعار ${system.name} | JOYA`
      : section === 'trial'
      ? `${isAvailable ? 'تحميل وتجربة' : 'حجز'} ${system.name} | JOYA`
      : `${system.name} | ${system.shortDesc.slice(0, 48)}`;

  const seoDescription =
    section === 'packages'
      ? `تعرّف على باقات الاشتراك والأسعار الشهرية والسنوية لنظام ${system.name}: ${system.shortDesc}`
      : section === 'trial'
      ? `${isAvailable ? 'حمّل النسخة التجريبية المجانية لمدة 48 ساعة من' : 'احجز نسختك المسبقة من'} ${system.name} — ${system.shortDesc}`
      : system.shortDesc;

  const lowestPackage = system.packages.length > 0
    ? Math.min(...system.packages.map((p) => p.price))
    : undefined;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: system.name,
      applicationCategory: 'BusinessApplication',
      operatingSystem: system.platforms.join(', '),
      description: system.description,
      url: `${origin}/system/${system.slug}`,
      ...(lowestPackage !== undefined
        ? {
            offers: {
              '@type': 'AggregateOffer',
              lowPrice: lowestPackage,
              priceCurrency: 'EGP',
              offerCount: system.packages.length,
            },
          }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: categoryLabel, item: `${origin}${categoryPath}` },
        { '@type': 'ListItem', position: 3, name: system.name, item: `${origin}/system/${system.slug}` },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#0B325B]">
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        type="product"
        structuredData={structuredData}
      />
      <Header />

      {/* Top Editorial Banner */}
      <section className="pt-24 pb-12 bg-[#0B325B] text-white border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mb-6">
            <Link to="/" className="hover:text-[#D99B26] transition-colors inline-flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>الرئيسية</span>
            </Link>
            <span aria-hidden="true">/</span>
            <Link to={categoryPath} className="hover:text-[#D99B26] transition-colors">
              {categoryLabel}
            </Link>
            <span aria-hidden="true">/</span>
            <Link to={`/system/${system.slug}`} className="text-[#D99B26] font-medium" dir="ltr">
              {system.name}
            </Link>
          </nav>

          {/* Crawlable Dedicated Sub-Route Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Link
              to={`/system/${system.slug}`}
              className={`px-3.5 py-1.5 text-xs font-semibold border transition-colors ${
                !section
                  ? 'bg-[#D99B26] border-[#D99B26] text-[#0B325B]'
                  : 'border-white/20 text-slate-200 hover:border-[#D99B26] hover:text-[#D99B26]'
              }`}
            >
              نظرة عامة والمميزات
            </Link>
            <Link
              to={`/system/${system.slug}/packages`}
              className={`px-3.5 py-1.5 text-xs font-semibold border transition-colors ${
                section === 'packages'
                  ? 'bg-[#D99B26] border-[#D99B26] text-[#0B325B]'
                  : 'border-white/20 text-slate-200 hover:border-[#D99B26] hover:text-[#D99B26]'
              }`}
            >
              الباقات والأسعار
            </Link>
            <Link
              to={`/system/${system.slug}/trial`}
              onClick={() => openModal(isAvailable ? 'download' : 'preorder')}
              className={`px-3.5 py-1.5 text-xs font-semibold border transition-colors ${
                section === 'trial'
                  ? 'bg-[#D99B26] border-[#D99B26] text-[#0B325B]'
                  : 'border-white/20 text-slate-200 hover:border-[#D99B26] hover:text-[#D99B26]'
              }`}
            >
              {isAvailable ? 'التجربة المجانية 48 ساعة' : 'الحجز المسبق'}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <JoyaLogo variant="light" size="sm" />
                <span className="text-slate-500" aria-hidden="true">|</span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    isAvailable ? 'text-emerald-400' : 'text-[#F5B841]'
                  }`}
                >
                  {isAvailable ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  <span>{isAvailable ? 'متاح الآن للتحميل والتشغيل' : 'قريباً — متاح للحجز المسبق'}</span>
                </span>
              </div>

              <div>
                <h1
                  className="font-editorial text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4"
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                >
                  {system.name}
                </h1>
                <p className="text-base md:text-lg text-slate-200 leading-relaxed max-w-2xl">
                  {system.description}
                </p>
              </div>

              {/* Supported Platforms */}
              <div className="pt-2 space-y-2">
                <div className="text-xs text-slate-400">المنصات المدعومة للتشغيل:</div>
                <PlatformIcons platforms={system.platforms} showLabels dark />
              </div>

              {/* Primary & Secondary Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-3 max-w-xl">
                {isAvailable ? (
                  <>
                    <button
                      type="button"
                      onClick={() => openModal('download')}
                      style={{ backgroundColor: system.color }}
                      className="flex-1 py-4 px-6 text-white text-sm font-bold flex items-center justify-center gap-2.5 shadow-lg hover:opacity-95 transition-opacity cursor-pointer"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      <span>تحميل النسخة المجانية (تجربة 48 ساعة)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openModal('purchase')}
                      className="py-4 px-6 bg-white/10 border border-white/25 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white hover:text-[#0B325B] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      <span>طلب شراء النظام</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => openModal('preorder')}
                    style={{ backgroundColor: system.color }}
                    className="w-full sm:w-auto py-4 px-8 text-white text-sm font-bold flex items-center justify-center gap-2.5 shadow-lg hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    <CalendarClock className="w-4 h-4 shrink-0" />
                    <span>حجز / طلب النظام مسبقاً</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6">
                <SystemArtwork system={system} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities + Pricing Packages */}
      <main className="max-w-[1440px] mx-auto px-5 md:px-10 py-16 space-y-20">
        {/* System Capabilities */}
        <section>
          <div className="pb-6 border-b border-slate-200 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono-num tracking-[0.2em] text-[#D99B26] uppercase mb-1" dir="ltr">
                SYSTEM CAPABILITIES
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0B325B]">
                أهم الإمكانيات والخصائص التشغيلية
              </h2>
            </div>
            <JoyaLogo variant="dark" size="sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {system.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 border border-slate-200 bg-white flex items-start gap-3.5"
              >
                <div
                  className="w-7 h-7 flex items-center justify-center shrink-0 text-white"
                  style={{ backgroundColor: system.color }}
                >
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{feat}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Multi-Tier Pricing Packages */}
        <section id="packages">
          <div className="pb-6 border-b border-slate-200 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono-num tracking-[0.2em] text-[#D99B26] uppercase mb-1" dir="ltr">
                SUBSCRIPTION & LICENSING TIERS
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0B325B]">
                باقات الأسعار والاشتراكات المتاحة
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>تشمل التحديثات الدورية والدعم الفني المباشر</span>
            </span>
          </div>

          {system.packages.length === 0 ? (
            <div className="p-8 border border-slate-200 text-center text-sm text-slate-600">
              يتم تحديد الباقات حسب حجم النشاط — تواصل معنا للحصول على عرض سعر مخصص.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {system.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative p-7 border bg-white flex flex-col justify-between transition-colors ${
                    pkg.popular
                      ? 'border-[#0B325B] shadow-md'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {pkg.popular && (
                    <div
                      className="text-xs font-bold text-white px-3 py-1 self-start mb-4"
                      style={{ backgroundColor: system.color }}
                    >
                      الأكثر اختياراً
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-[#0B325B]">{pkg.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{pkg.duration}</p>

                    <div className="my-6 pb-6 border-b border-slate-200 flex items-baseline gap-2">
                      <span className="font-mono-num text-4xl font-bold text-[#0B325B]">
                        {pkg.price.toLocaleString()}
                      </span>
                      <span className="text-sm font-semibold text-slate-600">{pkg.currency}</span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-700 mb-8">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>ترخيص كامل لنظام {system.name}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>تدريب وتشغيل مبدئي لفريق العمل</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>نسخ احتياطي سحابي آمن للبيانات</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => openModal(isAvailable ? 'purchase' : 'preorder', pkg.id)}
                    style={pkg.popular ? { backgroundColor: system.color } : undefined}
                    className={`w-full py-3 px-5 text-xs font-bold transition-colors cursor-pointer ${
                      pkg.popular
                        ? 'text-white hover:opacity-95'
                        : 'border border-[#0B325B] text-[#0B325B] hover:bg-[#0B325B] hover:text-white'
                    }`}
                  >
                    {isAvailable ? 'اختيار الباقة وطلب الشراء' : 'حجز الباقة مسبقاً'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related Systems */}
        {relatedSystems.length > 0 && (
          <section className="pt-8 border-t border-slate-200">
            <h3 className="text-xl font-bold text-[#0B325B] mb-6">أنظمة أخرى في نفس الفئة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedSystems.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/system/${rel.slug}`}
                  className="p-5 border border-slate-200 hover:border-[#0B325B] transition-colors flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="w-2.5 h-2.5"
                        style={{ backgroundColor: rel.color }}
                      />
                      <span className="text-[11px] font-medium text-slate-500">
                        {rel.status === 'available' ? 'متاح الآن' : 'قريباً'}
                      </span>
                    </div>
                    <h4 className="font-editorial text-lg font-bold text-[#0B325B]" dir="ltr" style={{ textAlign: 'right' }}>
                      {rel.name}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{rel.shortDesc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <SpotlightFooter />

      <LeadCaptureModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        system={system}
        requestType={modalType}
        initialPackageId={selectedPkgId}
      />
    </div>
  );
};
