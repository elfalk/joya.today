import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, Loader2, ShieldCheck, X } from 'lucide-react';
import { GOVERNORATES } from '../data/initialSystems';
import { useJoya } from '../context/JoyaContext';
import { JoyaSystem, LeadRequestType } from '../types';
import { JoyaLogo } from './JoyaLogo';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  system: JoyaSystem;
  requestType: LeadRequestType;
  initialPackageId?: string;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  system,
  requestType,
  initialPackageId,
}) => {
  const { submitLead, triggerAutoDownload } = useJoya();

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState(GOVERNORATES[0]);
  const [selectedPackageId, setSelectedPackageId] = useState(
    initialPackageId || system.packages[1]?.id || system.packages[0]?.id || ''
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ trialKey?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessInfo(null);
      setSelectedPackageId(
        initialPackageId || system.packages[1]?.id || system.packages[0]?.id || ''
      );
    }
  }, [isOpen, initialPackageId, system]);

  if (!isOpen) return null;

  const isDownload = requestType === 'download';
  const isPurchase = requestType === 'purchase';

  const modalTitle = isDownload
    ? `تحميل النسخة المجانية — ${system.name}`
    : isPurchase
    ? `طلب شراء نظام — ${system.name}`
    : `حجز وطلب مسبق — ${system.name}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
      setError('يرجى كتابة الاسم بالكامل بشكل صحيح.');
      return;
    }
    if (businessName.trim().length < 2) {
      setError('يرجى كتابة اسم النشاط التجاري.');
      return;
    }
    const cleanPhone = phone.replace(/\s+/g, '');
    if (cleanPhone.length < 7) {
      setError('يرجى إدخال رقم هاتف / واتساب صحيح.');
      return;
    }

    const chosenPkg = system.packages.find((p) => p.id === selectedPackageId);

    setSubmitting(true);
    try {
      await submitLead({
        fullName,
        businessName,
        phone: cleanPhone,
        governorate,
        systemId: system.id,
        systemName: system.name,
        requestType,
        packageId: isPurchase && chosenPkg ? chosenPkg.id : undefined,
        packageName:
          isPurchase && chosenPkg
            ? `${chosenPkg.name} (${chosenPkg.price.toLocaleString()} ${chosenPkg.currency})`
            : undefined,
      });

      if (isDownload) {
        const trialKey = triggerAutoDownload(system, fullName.trim(), businessName.trim());
        setSuccessInfo({ trialKey });
      } else {
        setSuccessInfo({});
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B325B]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-modal-title"
    >
      <div className="relative w-full max-w-xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* System Identity Color Top Bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: system.color }} />

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <JoyaLogo variant="dark" size="sm" />
            <h2 id="lead-modal-title" className="text-lg md:text-xl font-bold text-[#0B325B]">
              {modalTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="w-10 h-10 flex items-center justify-center border border-slate-200 text-slate-500 hover:text-[#0B325B] hover:border-[#0B325B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successInfo ? (
          /* Confirmation & 48H Trial Instructions Screen */
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-[#0B325B]">
                  {isDownload
                    ? 'تم تسجيل بياناتك وبدأ تنزيل حزمة التثبيت!'
                    : 'تم تسجيل طلبك بنجاح!'}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {isDownload
                    ? `بدأ المتصفح الآن في تحميل ملف التشغيل الخاص بنظام ${system.name} لفترة التجربة المجانية لمدة 48 ساعة.`
                    : `وصل طلبك إلى فريق مبيعات JOYA.TODAY بنجاح، وسيتواصل معك مستشارنا عبر الواتساب والهاتف في أقرب وقت.`}
                </p>
              </div>
            </div>

            {isDownload && (
              <div className="bg-slate-50 border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B325B]">
                    تعليمات التفعيل لمدة 48 ساعة مجاناً
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                </div>

                {successInfo.trialKey && (
                  <div className="bg-[#0B325B] text-[#D99B26] px-4 py-2.5 font-mono-num text-sm tracking-wider text-center select-all" dir="ltr">
                    {successInfo.trialKey}
                  </div>
                )}

                <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>افتح الملف الذي تم تنزيله على جهازك ثم شغّل حزمة التثبيت.</li>
                  <li>أدخل كود التفعيل الظاهر أعلاه لفتح جميع مزايا النظام لمدة 48 ساعة كاملة.</li>
                  <li>يمكنك ترقية النسخة إلى اشتراك دائم في أي وقت دون فقدان أي بيانات.</li>
                </ol>

                <button
                  type="button"
                  onClick={() =>
                    triggerAutoDownload(system, fullName.trim(), businessName.trim())
                  }
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B325B] underline hover:text-[#D99B26] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>إعادة تحميل الملف إذا لم يبدأ تلقائياً</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-6 bg-[#0B325B] text-white text-sm font-semibold hover:bg-[#13467d] transition-colors cursor-pointer"
            >
              إغلاق والعودة للنظام
            </button>
          </div>
        ) : (
          /* Lead Capture Form */
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0B325B] mb-1.5">
                  الاسم بالكامل <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: أحمد محمد علي"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 focus:border-[#0B325B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B325B] mb-1.5">
                  اسم النشاط التجاري <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="مثال: محمصة وكافيه ركن البن"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 focus:border-[#0B325B] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0B325B] mb-1.5">
                  رقم الهاتف / الواتساب <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full px-3.5 py-2.5 text-sm text-right font-mono-num border border-slate-300 focus:border-[#0B325B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B325B] mb-1.5">
                  المحافظة / المدينة <span className="text-red-600">*</span>
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 bg-white focus:border-[#0B325B] focus:outline-none"
                >
                  {GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Package Selection for Purchase Orders */}
            {isPurchase && system.packages.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-[#0B325B] mb-2">
                  اختر باقة الاشتراك المناسبة <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {system.packages.map((pkg) => {
                    const selected = selectedPackageId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`p-3 text-right border transition-colors cursor-pointer ${
                          selected
                            ? 'border-[#0B325B] bg-[#0B325B]/5'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <div className="text-xs font-bold text-[#0B325B]">{pkg.name}</div>
                        <div className="font-mono-num text-sm font-bold text-[#D99B26] mt-1">
                          {pkg.price.toLocaleString()} {pkg.currency}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{pkg.duration}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: system.color }}
                className="w-full py-3.5 px-6 text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-60 transition-opacity cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحفظ والتنفيذ...</span>
                  </>
                ) : isDownload ? (
                  <>
                    <Download className="w-4 h-4" />
                    <span>تأكيد وبدء التحميل الفوري (48 ساعة)</span>
                  </>
                ) : isPurchase ? (
                  <span>إرسال طلب شراء النظام</span>
                ) : (
                  <span>تأكيد الحجز والطلب المسبق</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
