export type PlatformType = 'windows' | 'android' | 'ios' | 'web';

export type SystemStatus = 'available' | 'coming_soon';

export type SystemCategory = 'core' | 'additional';

export interface SystemPackage {
  id: string;
  name: string;
  duration: string;
  price: number;
  currency: string;
  popular?: boolean;
}

export interface JoyaSystem {
  id: string;
  name: string;
  slug: string;
  category: SystemCategory;
  order: number;
  color: string;
  shortDesc: string;
  description: string;
  features: string[];
  status: SystemStatus;
  platforms: PlatformType[];
  downloadUrl: string;
  logoUrl?: string;
  packages: SystemPackage[];
  updatedAt?: unknown;
}

export type LeadRequestType = 'download' | 'purchase' | 'preorder';

export type LeadFollowUpStatus = 'new' | 'contacted' | 'converted' | 'archived';

export interface LeadRecord {
  id: string;
  fullName: string;
  businessName: string;
  phone: string;
  governorate: string;
  systemId: string;
  systemName: string;
  requestType: LeadRequestType;
  packageId?: string;
  packageName?: string;
  followUpStatus: LeadFollowUpStatus;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AdminRecord {
  email: string;
  displayName: string;
  role: 'super_admin' | 'sub_admin';
  addedBy?: string;
  createdAt?: unknown;
}

export interface SocialLinks {
  youtube: string;
  facebook: string;
  tiktok: string;
  linkedin: string;
  instagram: string;
  whatsapp: string;
  updatedAt?: unknown;
}
