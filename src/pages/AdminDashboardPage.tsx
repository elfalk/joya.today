import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Layers,
  LogIn,
  LogOut,
  MessageCircle,
  Plus,
  RefreshCw,
  Save,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  db,
  handleFirestoreError,
  OperationType,
  SUPER_ADMIN_EMAIL,
} from '../lib/firebase';
import { useJoya } from '../context/JoyaContext';
import {
  AdminRecord,
  JoyaSystem,
  LeadFollowUpStatus,
  LeadRecord,
  PlatformType,
  SocialLinks,
  SystemCategory,
  SystemPackage,
  SystemStatus,
} from '../types';
import { JoyaLogo } from '../components/JoyaLogo';
import { SeoHead } from '../components/SeoHead';
import { SOCIAL_PLATFORMS, SocialLinksBar } from '../components/SocialLinksBar';

type AdminTab = 'systems' | 'leads' | 'admins' | 'social';

const ALL_PLATFORMS: { id: PlatformType; label: string }[] = [
  { id: 'windows', label: 'Windows' },
  { id: 'android', label: 'Android' },
  { id: 'ios', label: 'iOS' },
  { id: 'web', label: 'Web' },
];

const FOLLOW_UP_LABELS: Record<LeadFollowUpStatus, string> = {
  new: 'جديد',
  contacted: 'تم التواصل',
  converted: 'تم التفعيل',
  archived: 'مؤرشف',
};

const REQUEST_TYPE_LABELS: Record<string, string> = {
  download: 'تحميل تجربة 48 ساعة',
  purchase: 'طلب شراء',
  preorder: 'حجز مسبق',
};

function formatWhatsAppUrl(phone: string, systemName: string, fullName: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  let normalized = digits;
  if (digits.startsWith('01') && digits.length === 11) {
    normalized = `20${digits.slice(1)}`;
  } else if (digits.startsWith('05') && digits.length === 10) {
    normalized = `966${digits.slice(1)}`;
  }
  const msg = encodeURIComponent(
    `مرحباً ${fullName}، معك فريق JOYA.TODAY بخصوص طلبك لنظام ${systemName}.`
  );
  return `https://wa.me/${normalized}?text=${msg}`;
}

function formatTimestamp(ts: unknown): string {
  if (!ts) return '—';
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
    return (ts as { toDate: () => Date }).toDate().toLocaleString('ar-EG', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }
  return '—';
}

export const AdminDashboardPage: React.FC = () => {
  const {
    systems,
    isCloudSeeded,
    socialLinks,
    authUser,
    authLoading,
    isAdmin,
    loginWithGoogle,
    logout,
    seedSystemsToFirestore,
    upsertSystem,
    toggleSystemStatus,
    deleteSystem,
    saveSocialLinks,
  } = useJoya();

  const { tab } = useParams<{ tab?: string }>();
  const location = useLocation();
  const decodedPath = (() => {
    try {
      return decodeURIComponent(location.pathname);
    } catch {
      return location.pathname;
    }
  })();
  const adminBasePath = decodedPath.startsWith('/ادمن') ? '/ادمن' : '/admin';
  const activeTab: AdminTab =
    tab === 'leads' || tab === 'admins' || tab === 'social' ? tab : 'systems';
  const [seeding, setSeeding] = useState(false);

  // Systems Manager State
  const [sysSearch, setSysSearch] = useState('');
  const [sysFilter, setSysFilter] = useState<'all' | 'core' | 'additional' | 'available' | 'coming_soon'>('all');
  const [editingSystem, setEditingSystem] = useState<JoyaSystem | null>(null);
  const [isNewSystem, setIsNewSystem] = useState(false);
  const [savingSystem, setSavingSystem] = useState(false);

  // Leads CRM State
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadTypeFilter, setLeadTypeFilter] = useState<'all' | 'download' | 'purchase' | 'preorder'>('all');

  // Admins Management State
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'sub_admin' | 'super_admin'>('sub_admin');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Social Links Manager State
  const [socialForm, setSocialForm] = useState<SocialLinks>(socialLinks);
  const [savingSocial, setSavingSocial] = useState(false);
  const [socialSaved, setSocialSaved] = useState(false);
  const [socialError, setSocialError] = useState('');

  useEffect(() => {
    setSocialForm(socialLinks);
  }, [socialLinks]);

  // Auto-seed the 28 systems into Firestore on first authenticated admin session
  useEffect(() => {
    if (isAdmin && !isCloudSeeded && !seeding) {
      setSeeding(true);
      seedSystemsToFirestore()
        .catch(console.error)
        .finally(() => setSeeding(false));
    }
  }, [isAdmin, isCloudSeeded, seeding, seedSystemsToFirestore]);

  // Subscribe to Leads & Admins collections only when verified Admin is authenticated
  useEffect(() => {
    if (!isAdmin) {
      setLeads([]);
      setAdmins([]);
      setLeadsLoading(false);
      return;
    }

    setLeadsLoading(true);
    const leadsQ = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const unsubLeads = onSnapshot(
      leadsQ,
      (snap) => {
        setLeads(snap.docs.map((d) => d.data() as LeadRecord));
        setLeadsLoading(false);
      },
      (error) => {
        setLeadsLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'leads');
      }
    );

    const unsubAdmins = onSnapshot(
      collection(db, 'admins'),
      (snap) => {
        setAdmins(snap.docs.map((d) => d.data() as AdminRecord));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'admins');
      }
    );

    return () => {
      unsubLeads();
      unsubAdmins();
    };
  }, [isAdmin]);

  const filteredSystems = useMemo(() => {
    const q = sysSearch.trim().toLowerCase();
    return systems.filter((s) => {
      if (sysFilter === 'core' && s.category !== 'core') return false;
      if (sysFilter === 'additional' && s.category !== 'additional') return false;
      if (sysFilter === 'available' && s.status !== 'available') return false;
      if (sysFilter === 'coming_soon' && s.status !== 'coming_soon') return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.shortDesc.toLowerCase().includes(q);
    });
  }, [systems, sysSearch, sysFilter]);

  const filteredLeads = useMemo(() => {
    const q = leadSearch.trim().toLowerCase();
    return leads.filter((l) => {
      if (leadTypeFilter !== 'all' && l.requestType !== leadTypeFilter) return false;
      if (!q) return true;
      return (
        l.fullName.toLowerCase().includes(q) ||
        l.businessName.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.systemName.toLowerCase().includes(q) ||
        l.governorate.toLowerCase().includes(q)
      );
    });
  }, [leads, leadSearch, leadTypeFilter]);

  const openNewSystemEditor = () => {
    const nextOrder = systems.length + 1;
    setIsNewSystem(true);
    setEditingSystem({
      id: `joya-custom-${Date.now()}`,
      name: 'JOYA Custom',
      slug: `joya-custom-${Date.now()}`,
      category: 'additional',
      order: nextOrder,
      color: '#081FF7',
      shortDesc: 'وصف مختصر للنظام الجديد',
      description: 'وصف تفصيلي للنظام الجديد ومميزاته التشغيلية.',
      features: ['إدارة المبيعات والفواتير', 'تقارير فورية ونسخ احتياطي'],
      status: 'coming_soon',
      platforms: ['windows', 'web'],
      downloadUrl: 'builtin://joya-custom-48h-trial',
      packages: [
        {
          id: 'pkg-monthly',
          name: 'الباقة الشهرية',
          duration: 'شهري',
          price: 490,
          currency: 'ج.م',
        },
        {
          id: 'pkg-annual',
          name: 'الباقة السنوية',
          duration: 'سنوي',
          price: 4600,
          currency: 'ج.م',
          popular: true,
        },
      ],
    });
  };

  const handleSaveSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSystem) return;
    setSavingSystem(true);
    try {
      const sanitizedSlug = editingSystem.slug
        .toLowerCase()
        .replace(/[^a-z0-9\-_]/g, '-')
        .replace(/-+/g, '-');
      await upsertSystem({
        ...editingSystem,
        id: isNewSystem ? sanitizedSlug || editingSystem.id : editingSystem.id,
        slug: sanitizedSlug || editingSystem.slug,
      });
      setEditingSystem(null);
      setIsNewSystem(false);
    } finally {
      setSavingSystem(false);
    }
  };

  const handleSystemLogoFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 420;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/png');
        setEditingSystem((prev) => (prev ? { ...prev, logoUrl: dataUrl } : prev));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateLeadStatus = async (leadId: string, status: LeadFollowUpStatus) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        followUpStatus: status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `leads/${leadId}`);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteDoc(doc(db, 'leads', leadId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `leads/${leadId}`);
    }
  };

  const handleExportLeadsCsv = () => {
    const headers = [
      'الاسم',
      'النشاط التجاري',
      'الهاتف',
      'المحافظة',
      'النظام',
      'نوع الطلب',
      'الباقة',
      'الحالة',
    ];
    const rows = filteredLeads.map((l) => [
      l.fullName,
      l.businessName,
      l.phone,
      l.governorate,
      l.systemName,
      REQUEST_TYPE_LABELS[l.requestType] || l.requestType,
      l.packageName || '—',
      FOLLOW_UP_LABELS[l.followUpStatus] || l.followUpStatus,
    ]);
    const csv = '\uFEFF' + [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `joya-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const email = newAdminEmail.trim().toLowerCase();
    if (!email.includes('@') || email.length < 5) {
      setAdminError('يرجى إدخال بريد Google صحيح.');
      return;
    }
    if (newAdminName.trim().length < 2) {
      setAdminError('يرجى إدخال اسم المدير.');
      return;
    }
    setAddingAdmin(true);
    try {
      await setDoc(doc(db, 'admins', email), {
        email,
        displayName: newAdminName.trim(),
        role: newAdminRole,
        addedBy: authUser?.email || SUPER_ADMIN_EMAIL,
        createdAt: serverTimestamp(),
      });
      setNewAdminEmail('');
      setNewAdminName('');
    } catch (error) {
      setAdminError('تعذر إضافة المدير. تأكد من صحة البريد وصلاحياتك.');
      console.error(error);
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (email: string) => {
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) return;
    try {
      await deleteDoc(doc(db, 'admins', email));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `admins/${email}`);
    }
  };

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSocialError('');
    setSocialSaved(false);
    setSavingSocial(true);
    try {
      await saveSocialLinks(socialForm);
      setSocialSaved(true);
      setTimeout(() => setSocialSaved(false), 4000);
    } catch (error) {
      setSocialError('تعذر حفظ روابط التواصل. تأكد من صحة الروابط وصلاحية الدخول.');
      console.error(error);
    } finally {
      setSavingSocial(false);
    }
  };

  // ==================== AUTHENTICATION GATE ====================
  const adminTitle =
    activeTab === 'leads'
      ? 'طلبات العملاء والتحميلات | لوحة تحكم JOYA'
      : activeTab === 'admins'
      ? 'حسابات المدراء والصلاحيات | لوحة تحكم JOYA'
      : activeTab === 'social'
      ? 'روابط التواصل الاجتماعي | لوحة تحكم JOYA'
      : 'إدارة الأنظمة الـ 28 | لوحة تحكم JOYA';

  const adminDescription =
    activeTab === 'leads'
      ? 'متابعة طلبات العملاء وتحميلات النسخ التجريبية وطلبات الشراء داخل لوحة تحكم JOYA.'
      : activeTab === 'admins'
      ? 'إدارة صلاحيات المدراء والحسابات المصرح لها بالدخول إلى لوحة تحكم JOYA.'
      : activeTab === 'social'
      ? 'إدارة وتحديث روابط يوتيوب وفيس بوك وتيك توك ولينكدان وانستجرام وواتساب من لوحة تحكم JOYA.'
      : 'إدارة وتعديل باقات وحالات وتفاصيل أنظمة JOYA الـ 28 من لوحة التحكم.';

  const adminSeoMeta = (
    <SeoHead
      title={adminTitle}
      description={adminDescription}
      robots="noindex, nofollow"
    />
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B325B] text-white flex items-center justify-center">
        {adminSeoMeta}
        <div className="text-center space-y-3">
          <JoyaLogo variant="light" size="md" />
          <p className="text-sm text-slate-300">جاري التحقق من صلاحيات لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (!authUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B325B] text-white flex items-center justify-center p-4">
        {adminSeoMeta}
        <div className="w-full max-w-md bg-white text-[#0B325B] joya-gold-frame p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <JoyaLogo variant="dark" size="sm" />
            <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-[#0B325B] inline-flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة للموقع</span>
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">لوحة الإدارة — JOYA.TODAY</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              الدخول مخصص للمدير الرئيسي وحسابات المدراء الفرعيين المصرح لهم بإدارة الأنظمة وطلبات العملاء.
            </p>
          </div>

          {authUser && !isAdmin ? (
            <div className="p-4 bg-red-50 border border-red-200 space-y-3">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>هذا الحساب غير مصرح له بالدخول</span>
              </div>
              <p className="text-xs text-red-600" dir="ltr">
                {authUser.email}
              </p>
              <button
                type="button"
                onClick={logout}
                className="w-full py-2.5 px-4 bg-red-700 text-white text-xs font-semibold hover:bg-red-800 cursor-pointer"
              >
                تسجيل الخروج وتبديل الحساب
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full py-3.5 px-6 bg-[#0B325B] text-white text-sm font-bold flex items-center justify-center gap-2.5 hover:bg-[#13467d] transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول بحساب Google المعتمد</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==================== AUTHENTICATED ADMIN CONSOLE ====================
  return (
    <div className="min-h-screen bg-slate-50 text-[#0B325B] flex flex-col lg:flex-row">
      {adminSeoMeta}
      {/* Sidebar (260px) */}
      <aside className="w-full lg:w-[270px] bg-[#0B325B] text-white shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-l border-white/10">
        <div>
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <Link to="/">
              <JoyaLogo variant="light" size="sm" />
            </Link>
          </div>

          <nav aria-label="أقسام لوحة الإدارة" className="p-4 space-y-1.5">
            <Link
              to={`${adminBasePath}/systems`}
              className={`w-full px-4 py-3 text-sm font-semibold flex items-center gap-3 transition-colors ${
                activeTab === 'systems'
                  ? 'bg-[#D99B26] text-[#0B325B]'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>إدارة الأنظمة ({systems.length})</span>
            </Link>

            <Link
              to={`${adminBasePath}/leads`}
              className={`w-full px-4 py-3 text-sm font-semibold flex items-center gap-3 transition-colors ${
                activeTab === 'leads'
                  ? 'bg-[#D99B26] text-[#0B325B]'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>طلبات العملاء والتحميلات ({leads.length})</span>
            </Link>

            <Link
              to={`${adminBasePath}/admins`}
              className={`w-full px-4 py-3 text-sm font-semibold flex items-center gap-3 transition-colors ${
                activeTab === 'admins'
                  ? 'bg-[#D99B26] text-[#0B325B]'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>حسابات المدراء</span>
            </Link>

            <Link
              to={`${adminBasePath}/social`}
              className={`w-full px-4 py-3 text-sm font-semibold flex items-center gap-3 transition-colors ${
                activeTab === 'social'
                  ? 'bg-[#D99B26] text-[#0B325B]'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span>روابط التواصل</span>
            </Link>
          </nav>
        </div>

        <div className="p-5 border-t border-white/10 space-y-3">
          <div className="text-xs text-slate-300 truncate" dir="ltr">
            {authUser.email}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 py-2 px-3 bg-white/10 text-xs font-medium text-center hover:bg-white/20 transition-colors"
            >
              عرض الموقع
            </Link>
            <button
              type="button"
              onClick={logout}
              className="py-2 px-3 bg-white/10 text-xs font-medium hover:bg-red-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Contract */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>JOYA.TODAY</span>
            <span>/</span>
            <span className="font-semibold text-[#0B325B]">
              {activeTab === 'systems'
                ? 'إدارة الأنظمة الـ 28'
                : activeTab === 'leads'
                ? 'سجل الطلبات والتحميلات'
                : activeTab === 'social'
                ? 'إعدادات روابط التواصل الاجتماعي'
                : 'إدارة حسابات الأدمن'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isCloudSeeded && (
              <button
                type="button"
                onClick={() => seedSystemsToFirestore()}
                disabled={seeding}
                className="px-3.5 py-2 text-xs font-semibold bg-amber-50 border border-amber-300 text-amber-800 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                <span>مزامنة الأنظمة مع السحابة</span>
              </button>
            )}

            {activeTab === 'systems' && (
              <button
                type="button"
                onClick={openNewSystemEditor}
                className="px-4 py-2 bg-[#0B325B] text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#13467d] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة نظام جديد</span>
              </button>
            )}

            {activeTab === 'leads' && (
              <button
                type="button"
                onClick={handleExportLeadsCsv}
                className="px-4 py-2 bg-[#0B325B] text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#13467d] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>تصدير CSV</span>
              </button>
            )}
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1 space-y-6">
          {/* ================= TAB 1: SYSTEMS MANAGER ================= */}
          {activeTab === 'systems' && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="bg-white border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={sysSearch}
                    onChange={(e) => setSysSearch(e.target.value)}
                    placeholder="ابحث في الأنظمة..."
                    className="w-full pr-9 pl-4 py-2 text-sm border border-slate-200 focus:border-[#0B325B] focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 border border-slate-200">
                  {(
                    [
                      { id: 'all', label: 'الكل' },
                      { id: 'core', label: 'الأساسية (10)' },
                      { id: 'additional', label: 'التخصصية (18)' },
                      { id: 'available', label: 'متاح الآن' },
                      { id: 'coming_soon', label: 'قريباً' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSysFilter(f.id)}
                      className={`px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                        sysFilter === f.id
                          ? 'bg-[#0B325B] text-white'
                          : 'text-slate-600 hover:text-[#0B325B]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Systems Data Table */}
              <div className="bg-white border border-slate-200 overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                      <th className="py-3.5 px-4">#</th>
                      <th className="py-3.5 px-4">النظام والهوية</th>
                      <th className="py-3.5 px-4">الفئة</th>
                      <th className="py-3.5 px-4">الحالة (تبديل فوري)</th>
                      <th className="py-3.5 px-4">الباقات</th>
                      <th className="py-3.5 px-4">المنصات</th>
                      <th className="py-3.5 px-4 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {filteredSystems.map((sys) => {
                      const isAvailable = sys.status === 'available';
                      return (
                        <tr key={sys.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono-num text-xs text-slate-400">
                            {String(sys.order).padStart(2, '0')}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              {sys.logoUrl ? (
                                <img
                                  src={sys.logoUrl}
                                  alt={sys.name}
                                  referrerPolicy="no-referrer"
                                  className="w-9 h-9 object-contain shrink-0"
                                />
                              ) : (
                                <span
                                  className="w-3.5 h-3.5 shrink-0"
                                  style={{ backgroundColor: sys.color }}
                                />
                              )}
                              <div>
                                <div className="font-editorial font-bold text-[#0B325B]" dir="ltr" style={{ textAlign: 'right' }}>
                                  {sys.name}
                                </div>
                                <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                                  {sys.shortDesc}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                            {sys.category === 'core' ? 'أساسي' : 'تخصصي'}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => toggleSystemStatus(sys)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border cursor-pointer transition-colors ${
                                isAvailable
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              {isAvailable ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                              <span>{isAvailable ? 'متاح الآن' : 'قريباً'}</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 font-mono-num text-xs text-slate-600 whitespace-nowrap">
                            {sys.packages.length} باقات
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 font-mono-num" dir="ltr">
                            {sys.platforms.join(', ')}
                          </td>
                          <td className="py-3.5 px-4 text-left whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsNewSystem(false);
                                  setEditingSystem(JSON.parse(JSON.stringify(sys)));
                                }}
                                className="px-3 py-1.5 text-xs font-semibold border border-slate-300 hover:border-[#0B325B] text-[#0B325B] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>تعديل</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteSystem(sys.id)}
                                title="حذف النظام"
                                className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 2: LEADS & DOWNLOADS CRM ================= */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              {/* KPI Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-5">
                  <div className="text-xs text-slate-500">إجمالي الطلبات</div>
                  <div className="font-mono-num text-3xl font-bold text-[#0B325B] mt-1">
                    {leads.length}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-5">
                  <div className="text-xs text-slate-500">تحميلات تجريبية (48 ساعة)</div>
                  <div className="font-mono-num text-3xl font-bold text-[#081FF7] mt-1">
                    {leads.filter((l) => l.requestType === 'download').length}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-5">
                  <div className="text-xs text-slate-500">طلبات شراء وحجز</div>
                  <div className="font-mono-num text-3xl font-bold text-[#D99B26] mt-1">
                    {leads.filter((l) => l.requestType !== 'download').length}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-5">
                  <div className="text-xs text-slate-500">جديد (بانتظار التواصل)</div>
                  <div className="font-mono-num text-3xl font-bold text-emerald-700 mt-1">
                    {leads.filter((l) => l.followUpStatus === 'new').length}
                  </div>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="bg-white border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    placeholder="بحث بالاسم، النشاط، الهاتف، أو المحافظة..."
                    className="w-full pr-9 pl-4 py-2 text-sm border border-slate-200 focus:border-[#0B325B] focus:outline-none"
                  />
                </div>

                <div className="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200">
                  {(
                    [
                      { id: 'all', label: 'الكل' },
                      { id: 'download', label: 'تحميل تجريبي' },
                      { id: 'purchase', label: 'طلب شراء' },
                      { id: 'preorder', label: 'حجز مسبق' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setLeadTypeFilter(t.id)}
                      className={`px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap ${
                        leadTypeFilter === t.id
                          ? 'bg-[#0B325B] text-white'
                          : 'text-slate-600 hover:text-[#0B325B]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leads Table */}
              <div className="bg-white border border-slate-200 overflow-x-auto">
                {leadsLoading ? (
                  <div className="p-10 text-center text-sm text-slate-500">جاري تحميل الطلبات...</div>
                ) : filteredLeads.length === 0 ? (
                  <div className="p-12 text-center space-y-2">
                    <p className="text-base font-semibold text-[#0B325B]">لا توجد طلبات عملاء حتى الآن</p>
                    <p className="text-xs text-slate-500">
                      ستظهر هنا تلقائياً بيانات كل عميل يقوم بتحميل نسخة تجريبية أو طلب شراء نظام.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                        <th className="py-3.5 px-4">العميل والنشاط</th>
                        <th className="py-3.5 px-4">الهاتف والواتساب</th>
                        <th className="py-3.5 px-4">المحافظة</th>
                        <th className="py-3.5 px-4">النظام والباقة</th>
                        <th className="py-3.5 px-4">نوع الطلب</th>
                        <th className="py-3.5 px-4">التاريخ</th>
                        <th className="py-3.5 px-4">حالة المتابعة</th>
                        <th className="py-3.5 px-4">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50/80">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#0B325B]">{lead.fullName}</div>
                            <div className="text-xs text-slate-500">{lead.businessName}</div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono-num text-xs text-slate-700" dir="ltr">
                                {lead.phone}
                              </span>
                              <a
                                href={formatWhatsAppUrl(lead.phone, lead.systemName, lead.fullName)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>واتساب</span>
                              </a>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                            {lead.governorate}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-editorial font-bold text-xs text-[#0B325B]" dir="ltr" style={{ textAlign: 'right' }}>
                              {lead.systemName}
                            </div>
                            {lead.packageName && (
                              <div className="text-[11px] text-slate-500 mt-0.5">{lead.packageName}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold whitespace-nowrap">
                            {REQUEST_TYPE_LABELS[lead.requestType] || lead.requestType}
                          </td>
                          <td className="py-3.5 px-4 font-mono-num text-[11px] text-slate-500 whitespace-nowrap">
                            {formatTimestamp(lead.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <select
                              value={lead.followUpStatus}
                              onChange={(e) =>
                                handleUpdateLeadStatus(lead.id, e.target.value as LeadFollowUpStatus)
                              }
                              className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-white focus:border-[#0B325B] focus:outline-none"
                            >
                              {Object.entries(FOLLOW_UP_LABELS).map(([val, lbl]) => (
                                <option key={val} value={val}>
                                  {lbl}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleDeleteLead(lead.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                              title="حذف الطلب"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: ADMINS MANAGEMENT ================= */}
          {activeTab === 'admins' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-white border border-slate-200 p-6 space-y-5 self-start">
                <div>
                  <h2 className="text-lg font-bold text-[#0B325B]">إضافة حساب مدير فرعي</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    أدخل بريد Google الخاص بالمدير المراد السماح له بدخول لوحة التحكم ({adminBasePath}).
                  </p>
                </div>

                {adminError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700">
                    {adminError}
                  </div>
                )}

                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">الاسم الكامل</label>
                    <input
                      type="text"
                      required
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="مثال: سارة محمود"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 focus:border-[#0B325B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">بريد Google الإلكتروني</label>
                    <input
                      type="email"
                      required
                      dir="ltr"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="admin@gmail.com"
                      className="w-full px-3.5 py-2.5 text-sm text-left border border-slate-300 focus:border-[#0B325B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">الصلاحية</label>
                    <select
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value as 'sub_admin' | 'super_admin')}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 bg-white focus:border-[#0B325B] focus:outline-none"
                    >
                      <option value="sub_admin">مدير فرعي (Sub-Admin)</option>
                      <option value="super_admin">مدير رئيسي (Super Admin)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={addingAdmin}
                    className="w-full py-3 bg-[#0B325B] text-white text-xs font-bold hover:bg-[#13467d] cursor-pointer"
                  >
                    {addingAdmin ? 'جاري الإضافة...' : 'منح صلاحية الإدارة'}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 bg-white border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#0B325B]">الحسابات المصرح لها بالدخول</h2>
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                </div>

                <div className="divide-y divide-slate-200">
                  {/* Bootstrapped Super Admin always shown */}
                  <div className="p-5 flex items-center justify-between gap-4 bg-slate-50/70">
                    <div>
                      <div className="font-bold text-sm text-[#0B325B]">المدير الرئيسي للمنصة</div>
                      <div className="font-mono-num text-xs text-slate-600 mt-0.5" dir="ltr">
                        {SUPER_ADMIN_EMAIL}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#D99B26]">Super Admin (محمي)</span>
                  </div>

                  {admins
                    .filter((a) => a.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase())
                    .map((admin) => (
                      <div key={admin.email} className="p-5 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-sm text-[#0B325B]">{admin.displayName}</div>
                          <div className="font-mono-num text-xs text-slate-500 mt-0.5" dir="ltr">
                            {admin.email}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-600">
                            {admin.role === 'super_admin' ? 'مدير رئيسي' : 'مدير فرعي'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteAdmin(admin.email)}
                            className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                            title="إزالة الصلاحية"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: SOCIAL MEDIA LINKS MANAGER ================= */}
          {activeTab === 'social' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white border border-slate-200 p-6 md:p-7 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-[#0B325B]">
                    روابط حسابات التواصل الاجتماعي
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    أدخل روابط حسابات JOYA الرسمية ليتم عرض أيقوناتها وتفعيلها تلقائياً في الفوتر وقائمة الموقع وصفحة المنصة. يمكنك ترك أي حقل فارغاً لإخفاء أيقونته.
                  </p>
                </div>

                {socialError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700">
                    {socialError}
                  </div>
                )}

                {socialSaved && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>تم حفظ روابط التواصل وتحديثها في جميع صفحات الموقع بنجاح.</span>
                  </div>
                )}

                <form onSubmit={handleSaveSocial} className="space-y-4">
                  {SOCIAL_PLATFORMS.map(({ key, arLabel, enLabel, placeholder, brandColor, Icon }) => {
                    const value = socialForm[key] || '';
                    return (
                      <div key={key} className="space-y-1.5">
                        <label
                          htmlFor={`social-${key}`}
                          className="flex items-center justify-between text-xs font-bold text-[#0B325B]"
                        >
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="w-6 h-6 rounded-md inline-flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: brandColor === '#00F2EA' ? '#0F172A' : brandColor }}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <span>{arLabel}</span>
                          </span>
                          <span className="font-mono-num text-[11px] text-slate-400" dir="ltr">
                            {enLabel}
                          </span>
                        </label>

                        <div className="relative flex items-center">
                          <input
                            id={`social-${key}`}
                            type="text"
                            dir="ltr"
                            value={value}
                            onChange={(e) =>
                              setSocialForm((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            placeholder={placeholder}
                            className="w-full pl-9 pr-3.5 py-2.5 text-sm text-left font-mono-num border border-slate-300 focus:border-[#0B325B] focus:outline-none"
                          />
                          {value.trim().length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setSocialForm((prev) => ({
                                  ...prev,
                                  [key]: '',
                                }))
                              }
                              title={`مسح رابط ${arLabel}`}
                              className="absolute left-2.5 p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {key === 'whatsapp' && (
                          <p className="text-[11px] text-slate-500">
                            يمكنك إدخال رابط واتساب كامل مثل <span dir="ltr">https://wa.me/2010...</span> أو كتابة رقم الهاتف مباشرة وسيتم تحويله تلقائياً.
                          </p>
                        )}
                      </div>
                    );
                  })}

                  <div className="pt-3 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={savingSocial}
                      className="px-6 py-3 bg-[#0B325B] text-white text-xs font-bold inline-flex items-center gap-2 hover:bg-[#13467d] transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingSocial ? 'جاري الحفظ...' : 'حفظ روابط التواصل'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSocialForm(socialLinks)}
                      className="px-4 py-3 border border-slate-300 text-xs font-semibold text-slate-700 hover:border-[#0B325B] cursor-pointer"
                    >
                      تراجع عن التعديلات
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Preview Column */}
              <div className="lg:col-span-5 space-y-5 self-start">
                <div className="bg-[#08335d] text-white p-6 space-y-4 border border-[#08335d]">
                  <div className="text-xs font-semibold text-[#D99B26]">
                    معاينة مباشرة في الفوتر والهيدر
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    هكذا ستظهر أيقونات التواصل لزوار الموقع بعد الحفظ:
                  </p>
                  <div className="pt-2">
                    <SocialLinksBar variant="dark" overrideLinks={socialForm} />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 space-y-4">
                  <div className="text-xs font-bold text-[#0B325B]">
                    معاينة على الخلفية الفاتحة
                  </div>
                  <SocialLinksBar variant="light" overrideLinks={socialForm} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= EDIT / CREATE SYSTEM MODAL ================= */}
      {editingSystem && (
        <div className="fixed inset-0 z-50 bg-[#0B325B]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white border border-slate-200 shadow-2xl my-8 overflow-hidden">
            <div className="h-1.5 w-full" style={{ backgroundColor: editingSystem.color }} />

            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0B325B]">
                {isNewSystem ? 'إضافة نظام جديد إلى المنصة' : `تعديل نظام: ${editingSystem.name}`}
              </h2>
              <button
                type="button"
                onClick={() => setEditingSystem(null)}
                className="p-2 text-slate-500 hover:text-[#0B325B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSystem} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">اسم النظام (English)</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={editingSystem.name}
                    onChange={(e) =>
                      setEditingSystem({ ...editingSystem, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">الفئة</label>
                  <select
                    value={editingSystem.category}
                    onChange={(e) =>
                      setEditingSystem({
                        ...editingSystem,
                        category: e.target.value as SystemCategory,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 bg-white"
                  >
                    <option value="core">نظام أساسي (Core)</option>
                    <option value="additional">نظام تخصصي (Additional)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">حالة النظام</label>
                  <select
                    value={editingSystem.status}
                    onChange={(e) =>
                      setEditingSystem({
                        ...editingSystem,
                        status: e.target.value as SystemStatus,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 bg-white"
                  >
                    <option value="available">متاح الآن</option>
                    <option value="coming_soon">قريباً</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">لون الهوية (Hex)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingSystem.color}
                      onChange={(e) =>
                        setEditingSystem({ ...editingSystem, color: e.target.value })
                      }
                      className="w-10 h-9 border border-slate-300 p-0.5 cursor-pointer"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      pattern="^#[0-9a-fA-F]{6}$"
                      value={editingSystem.color}
                      onChange={(e) =>
                        setEditingSystem({ ...editingSystem, color: e.target.value })
                      }
                      className="flex-1 px-3 py-2 text-sm font-mono-num border border-slate-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">الترتيب</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={editingSystem.order}
                    onChange={(e) =>
                      setEditingSystem({
                        ...editingSystem,
                        order: Number(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 text-sm font-mono-num border border-slate-300"
                  />
                </div>
              <div>
                <label className="block text-xs font-semibold mb-1">رابط ملف التسطيب المباشر</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editingSystem.downloadUrl}
                  onChange={(e) =>
                    setEditingSystem({ ...editingSystem, downloadUrl: e.target.value })
                  }
                  placeholder="https://... or builtin://..."
                  className="w-full px-3 py-2 text-sm font-mono-num border border-slate-300"
                />
              </div>
              </div>

              {/* System Logo Upload & URL */}
              <div className="border border-slate-200 p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0B325B]">
                    لوجو النظام (يظهر داخل كارت النظام بدلاً من الأيقونة الافتراضية)
                  </label>
                  {editingSystem.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setEditingSystem({ ...editingSystem, logoUrl: '' })}
                      className="text-xs text-red-600 hover:underline cursor-pointer"
                    >
                      إزالة اللوجو
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-20 border border-slate-200 bg-white flex items-center justify-center p-2 shrink-0">
                    {editingSystem.logoUrl ? (
                      <img
                        src={editingSystem.logoUrl}
                        alt="System Logo Preview"
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[11px] text-slate-400">بدون لوجو</span>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B325B] text-white text-xs font-semibold cursor-pointer hover:bg-[#13467d] transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة اللوجو من الجهاز (PNG / WebP / SVG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleSystemLogoFile(file);
                        }}
                      />
                    </label>

                    <input
                      type="text"
                      dir="ltr"
                      value={editingSystem.logoUrl || ''}
                      onChange={(e) =>
                        setEditingSystem({ ...editingSystem, logoUrl: e.target.value })
                      }
                      placeholder="أو الصق رابط صورة مباشر https://..."
                      className="w-full px-3 py-1.5 text-xs font-mono-num bg-white border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Platforms Checkboxes */}
              <div>
                <label className="block text-xs font-semibold mb-2">أنظمة التشغيل المدعومة</label>
                <div className="flex flex-wrap gap-4" dir="ltr">
                  {ALL_PLATFORMS.map((plat) => {
                    const checked = editingSystem.platforms.includes(plat.id);
                    return (
                      <label
                        key={plat.id}
                        className="inline-flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...editingSystem.platforms, plat.id]
                              : editingSystem.platforms.filter((p) => p !== plat.id);
                            setEditingSystem({
                              ...editingSystem,
                              platforms: next.length > 0 ? next : ['web'],
                            });
                          }}
                        />
                        <span>{plat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">الوصف المختصر (للكارت والقائمة)</label>
                <input
                  type="text"
                  required
                  value={editingSystem.shortDesc}
                  onChange={(e) =>
                    setEditingSystem({ ...editingSystem, shortDesc: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">الوصف التفصيلي الكامل</label>
                <textarea
                  rows={3}
                  required
                  value={editingSystem.description}
                  onChange={(e) =>
                    setEditingSystem({ ...editingSystem, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300"
                />
              </div>

              {/* Multi-Tier Pricing Packages Editor */}
              <div className="border border-slate-200 p-4 space-y-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B325B]">
                    باقات الاشتراك والأسعار المتعددة
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextPkg: SystemPackage = {
                        id: `pkg-${Date.now()}`,
                        name: 'باقة جديدة',
                        duration: 'سنوي',
                        price: 1000,
                        currency: 'ج.م',
                      };
                      setEditingSystem({
                        ...editingSystem,
                        packages: [...editingSystem.packages, nextPkg],
                      });
                    }}
                    className="px-2.5 py-1 bg-[#0B325B] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة باقة</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {editingSystem.packages.map((pkg, pIdx) => (
                    <div
                      key={pkg.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-white p-2.5 border border-slate-200"
                    >
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => {
                          const updated = [...editingSystem.packages];
                          updated[pIdx] = { ...pkg, name: e.target.value };
                          setEditingSystem({ ...editingSystem, packages: updated });
                        }}
                        placeholder="اسم الباقة"
                        className="sm:col-span-4 px-2.5 py-1.5 text-xs border border-slate-300"
                      />
                      <input
                        type="text"
                        value={pkg.duration}
                        onChange={(e) => {
                          const updated = [...editingSystem.packages];
                          updated[pIdx] = { ...pkg, duration: e.target.value };
                          setEditingSystem({ ...editingSystem, packages: updated });
                        }}
                        placeholder="المدة (شهري / سنوي)"
                        className="sm:col-span-3 px-2.5 py-1.5 text-xs border border-slate-300"
                      />
                      <input
                        type="number"
                        min={0}
                        value={pkg.price}
                        onChange={(e) => {
                          const updated = [...editingSystem.packages];
                          updated[pIdx] = { ...pkg, price: Number(e.target.value) || 0 };
                          setEditingSystem({ ...editingSystem, packages: updated });
                        }}
                        placeholder="السعر"
                        className="sm:col-span-2 px-2.5 py-1.5 text-xs font-mono-num border border-slate-300"
                      />
                      <input
                        type="text"
                        value={pkg.currency}
                        onChange={(e) => {
                          const updated = [...editingSystem.packages];
                          updated[pIdx] = { ...pkg, currency: e.target.value };
                          setEditingSystem({ ...editingSystem, packages: updated });
                        }}
                        placeholder="العملة"
                        className="sm:col-span-2 px-2.5 py-1.5 text-xs border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingSystem.packages.filter((_, i) => i !== pIdx);
                          setEditingSystem({ ...editingSystem, packages: updated });
                        }}
                        className="sm:col-span-1 p-1.5 text-red-600 hover:bg-red-50 flex justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSystem(null)}
                  className="px-5 py-2.5 text-xs font-semibold border border-slate-300 text-slate-700 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingSystem}
                  className="px-6 py-2.5 text-xs font-bold bg-[#0B325B] text-white hover:bg-[#13467d] cursor-pointer"
                >
                  {savingSystem ? 'جاري الحفظ...' : 'حفظ التعديلات في السحابة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
