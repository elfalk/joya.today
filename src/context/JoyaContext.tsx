import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  SUPER_ADMIN_EMAIL,
} from '../lib/firebase';
import { INITIAL_SYSTEMS } from '../data/initialSystems';
import { JoyaSystem, LeadRequestType, SocialLinks, SystemStatus } from '../types';

export const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  youtube: '',
  facebook: '',
  tiktok: '',
  linkedin: '',
  instagram: '',
  whatsapp: '',
};

function normalizeSocialUrl(raw: string, isWhatsapp = false): string {
  const trimmed = raw.trim().slice(0, 500);
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (isWhatsapp) {
    const digits = trimmed.replace(/[^0-9]/g, '');
    if (digits.length >= 7) {
      const normalized = digits.startsWith('01') && digits.length === 11
        ? `20${digits.slice(1)}`
        : digits.startsWith('05') && digits.length === 10
        ? `966${digits.slice(1)}`
        : digits;
      return `https://wa.me/${normalized}`;
    }
  }
  return `https://${trimmed}`;
}

export interface LeadSubmissionInput {
  fullName: string;
  businessName: string;
  phone: string;
  governorate: string;
  systemId: string;
  systemName: string;
  requestType: LeadRequestType;
  packageId?: string;
  packageName?: string;
}

interface JoyaContextValue {
  systems: JoyaSystem[];
  systemsLoading: boolean;
  isCloudSeeded: boolean;
  socialLinks: SocialLinks;
  socialLoading: boolean;
  authUser: User | null;
  authLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  seedSystemsToFirestore: () => Promise<void>;
  upsertSystem: (system: JoyaSystem) => Promise<void>;
  toggleSystemStatus: (system: JoyaSystem) => Promise<void>;
  deleteSystem: (id: string) => Promise<void>;
  saveSocialLinks: (links: SocialLinks) => Promise<void>;
  submitLead: (input: LeadSubmissionInput) => Promise<string>;
  triggerAutoDownload: (system: JoyaSystem, customerName: string, businessName: string) => string;
}

const JoyaContext = createContext<JoyaContextValue | null>(null);

const INITIAL_SYSTEM_MAP = new Map(INITIAL_SYSTEMS.map((s) => [s.id, s]));

function sortSystems(list: JoyaSystem[]): JoyaSystem[] {
  return [...list].sort((a, b) => {
    if (a.category !== b.category) {
      return a.category === 'core' ? -1 : 1;
    }
    return a.order - b.order;
  });
}

export const JoyaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systems, setSystems] = useState<JoyaSystem[]>(() => sortSystems(INITIAL_SYSTEMS));
  const [systemsLoading, setSystemsLoading] = useState(true);
  const [isCloudSeeded, setIsCloudSeeded] = useState(false);

  const [socialLinks, setSocialLinks] = useState<SocialLinks>(DEFAULT_SOCIAL_LINKS);
  const [socialLoading, setSocialLoading] = useState(true);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Subscribe to public systems catalog in Firestore
  useEffect(() => {
    const q = query(collection(db, 'systems'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setSystems(sortSystems(INITIAL_SYSTEMS));
          setIsCloudSeeded(false);
        } else {
          const cloudSystems = snapshot.docs.map((d) => {
            const data = d.data() as JoyaSystem;
            const fallback = INITIAL_SYSTEM_MAP.get(data.id);
            const hasLogo = Boolean(data.logoUrl && data.logoUrl.trim().length > 0);
            return {
              ...data,
              logoUrl: hasLogo ? data.logoUrl : fallback?.logoUrl,
            };
          });
          setSystems(sortSystems(cloudSystems));
          setIsCloudSeeded(true);
        }
        setSystemsLoading(false);
      },
      (error) => {
        console.warn('Systems listener fallback to initial data:', error);
        setSystems(sortSystems(INITIAL_SYSTEMS));
        setSystemsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to public social media links in /settings/social
  useEffect(() => {
    const socialRef = doc(db, 'settings', 'social');
    const unsubscribe = onSnapshot(
      socialRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<SocialLinks>;
          setSocialLinks({
            youtube: typeof data.youtube === 'string' ? data.youtube : '',
            facebook: typeof data.facebook === 'string' ? data.facebook : '',
            tiktok: typeof data.tiktok === 'string' ? data.tiktok : '',
            linkedin: typeof data.linkedin === 'string' ? data.linkedin : '',
            instagram: typeof data.instagram === 'string' ? data.instagram : '',
            whatsapp: typeof data.whatsapp === 'string' ? data.whatsapp : '',
            updatedAt: data.updatedAt,
          });
        } else {
          setSocialLinks(DEFAULT_SOCIAL_LINKS);
        }
        setSocialLoading(false);
      },
      () => {
        setSocialLinks(DEFAULT_SOCIAL_LINKS);
        setSocialLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Verify admin privileges when Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (!user || !user.email || !user.emailVerified) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAuthLoading(false);
        return;
      }

      const normalizedEmail = user.email.toLowerCase();
      if (normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
        setIsSuperAdmin(true);
        setIsAdmin(true);
        // Ensure super admin profile exists in /admins
        try {
          const superRef = doc(db, 'admins', normalizedEmail);
          const superSnap = await getDoc(superRef);
          if (!superSnap.exists()) {
            await setDoc(superRef, {
              email: normalizedEmail,
              displayName: user.displayName || 'المدير الرئيسي',
              role: 'super_admin',
              addedBy: 'system',
              createdAt: serverTimestamp(),
            });
          }
        } catch {
          // Non-fatal if already handled by rules
        }
        setAuthLoading(false);
        return;
      }

      setIsSuperAdmin(false);
      try {
        const adminSnap = await getDoc(doc(db, 'admins', normalizedEmail));
        setIsAdmin(adminSnap.exists());
      } catch {
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const seedSystemsToFirestore = useCallback(async () => {
    const batch = writeBatch(db);
    for (const sys of INITIAL_SYSTEMS) {
      const ref = doc(db, 'systems', sys.id);
      batch.set(ref, {
        ...sys,
        updatedAt: serverTimestamp(),
      });
    }
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'systems');
    }
  }, []);

  const upsertSystem = useCallback(async (system: JoyaSystem) => {
    const ref = doc(db, 'systems', system.id);
    const payload: Record<string, unknown> = {
      id: system.id,
      name: system.name.trim(),
      slug: system.slug.trim(),
      category: system.category,
      order: Number(system.order) || 1,
      color: system.color,
      shortDesc: system.shortDesc.trim(),
      description: system.description.trim(),
      features: system.features.filter((f) => f.trim().length > 0).slice(0, 15),
      status: system.status,
      platforms: system.platforms.length > 0 ? system.platforms : ['windows', 'web'],
      downloadUrl: system.downloadUrl.trim(),
      packages: system.packages.slice(0, 10),
      updatedAt: serverTimestamp(),
    };

    if (system.logoUrl && system.logoUrl.trim().length > 0) {
      payload.logoUrl = system.logoUrl.trim();
    }

    try {
      await setDoc(ref, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `systems/${system.id}`);
    }
  }, []);

  const toggleSystemStatus = useCallback(async (system: JoyaSystem) => {
    const nextStatus: SystemStatus = system.status === 'available' ? 'coming_soon' : 'available';
    const ref = doc(db, 'systems', system.id);
    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          ...system,
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, {
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `systems/${system.id}`);
    }
  }, []);

  const deleteSystem = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'systems', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `systems/${id}`);
    }
  }, []);

  const saveSocialLinks = useCallback(async (links: SocialLinks) => {
    const payload = {
      youtube: normalizeSocialUrl(links.youtube),
      facebook: normalizeSocialUrl(links.facebook),
      tiktok: normalizeSocialUrl(links.tiktok),
      linkedin: normalizeSocialUrl(links.linkedin),
      instagram: normalizeSocialUrl(links.instagram),
      whatsapp: normalizeSocialUrl(links.whatsapp, true),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'settings', 'social'), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/social');
    }
  }, []);

  const submitLead = useCallback(async (input: LeadSubmissionInput): Promise<string> => {
    const leadId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const payload: Record<string, unknown> = {
      id: leadId,
      fullName: input.fullName.trim().slice(0, 120),
      businessName: input.businessName.trim().slice(0, 160),
      phone: input.phone.trim().slice(0, 30),
      governorate: input.governorate.trim().slice(0, 80),
      systemId: input.systemId,
      systemName: input.systemName,
      requestType: input.requestType,
      followUpStatus: 'new',
      createdAt: serverTimestamp(),
    };

    if (input.packageId) payload.packageId = input.packageId;
    if (input.packageName) payload.packageName = input.packageName;

    try {
      await setDoc(doc(db, 'leads', leadId), payload);
      return leadId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `leads/${leadId}`);
    }
  }, []);

  const triggerAutoDownload = useCallback(
    (system: JoyaSystem, customerName: string, businessName: string): string => {
      const trialKey = `JOYA-${system.slug.toUpperCase().replace('JOYA-', '')}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}-48H`;

      const url = system.downloadUrl?.trim();
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${system.name.replace(/\s+/g, '-')}-Setup`);
        link.setAttribute('rel', 'noopener noreferrer');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return trialKey;
      }

      // Built-in 48-hour trial installer package receipt
      const installerHtml = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>تثبيت ${system.name} — نسخة تجريبية 48 ساعة</title>
<style>
  body { font-family: Tahoma, Arial, sans-serif; background: #0B325B; color: #fff; padding: 40px; line-height: 1.8; }
  .box { max-width: 680px; margin: auto; background: #fff; color: #0B325B; border: 3px solid #D99B26; padding: 32px; }
  .key { background: #0B325B; color: #D99B26; font-family: monospace; font-size: 20px; padding: 12px 18px; letter-spacing: 2px; display: inline-block; margin: 12px 0; }
  h1 { margin-top: 0; color: ${system.color}; }
</style>
</head>
<body>
  <div class="box">
    <h1>حزمة التثبيت — ${system.name}</h1>
    <p><strong>منصة JOYA.TODAY — BUSINESS TODAY</strong></p>
    <p>مرحباً <strong>${customerName}</strong> (${businessName})،</p>
    <p>مفتاح التفعيل التجريبي الخاص بك لمدة <strong>48 ساعة كاملة</strong>:</p>
    <div class="key">${trialKey}</div>
    <h3>خطوات التشغيل والتفعيل:</h3>
    <ol>
      <li>تأكد من اتصال الجهاز بالإنترنت في المرة الأولى لتوثيق رخصة الـ 48 ساعة.</li>
      <li>افتح ملف التشغيل وأدخل رمز التفعيل أعلاه لفتح جميع خصائص ${system.name}.</li>
      <li>للتفعيل الدائم أو المساعدة الفنية، تواصل مع فريق JOYA.TODAY عبر الموقع.</li>
    </ol>
    <p style="font-size:12px;color:#64748b;">تاريخ الإصدار: ${new Date().toLocaleString('ar-EG')}</p>
  </div>
</body>
</html>`;

      const blob = new Blob([installerHtml], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${system.name.replace(/\s+/g, '-')}-48H-Trial-Installer.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      return trialKey;
    },
    []
  );

  return (
    <JoyaContext.Provider
      value={{
        systems,
        systemsLoading,
        isCloudSeeded,
        socialLinks,
        socialLoading,
        authUser,
        authLoading,
        isAdmin,
        isSuperAdmin,
        loginWithGoogle,
        logout,
        seedSystemsToFirestore,
        upsertSystem,
        toggleSystemStatus,
        deleteSystem,
        saveSocialLinks,
        submitLead,
        triggerAutoDownload,
      }}
    >
      {children}
    </JoyaContext.Provider>
  );
};

export function useJoya(): JoyaContextValue {
  const ctx = useContext(JoyaContext);
  if (!ctx) {
    throw new Error('useJoya must be used within a JoyaProvider');
  }
  return ctx;
}
