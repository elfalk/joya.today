# Security Specification — JOYA.TODAY

## Data Invariants
1. **Default Deny**: All unspecified Firestore paths deny read and write access (`/{document=**}`).
2. **Systems Catalog Integrity**: Only verified admins (`yuoseef01102@gmail.com` or verified documents in `/admins/{email}`) may create, modify, or delete documents in `/systems`. All system documents enforce strict key allowlists, string length limits, hex color regex, platform allowlists, and `request.time` timestamp validation.
3. **PII Isolation on Leads**: Customer leads (`/leads/{leadId}`) contain phone numbers and personal names. Public visitors may ONLY `create` a new lead with `followUpStatus == 'new'` and `createdAt == request.time`. `get`, `list`, `update`, and `delete` on `/leads` are strictly locked to verified admins (`isAdmin()`).
4. **Admin Escalation Prevention**: Only verified existing admins can add or update `/admins/{adminEmail}` documents, and the bootstrapped super admin (`yuoseef01102@gmail.com`) cannot be deleted.
5. **Email Spoofing Protection**: All admin checks strictly require `request.auth.token.email_verified == true`.
6. **Public Social Settings Integrity**: `/settings/social` is publicly readable (`get` only, no `list`), while `create` and `update` are strictly restricted to verified admins (`isAdmin()`) with strict key allowlists, HTTP(S) URL regex validation, and `request.time` timestamp verification. `delete` is denied.

## Dirty Dozen Adversarial Payloads (Blocked with PERMISSION_DENIED)
1. Unauthenticated `update` or `delete` on `/systems/joya-pos`.
2. Non-admin authenticated user attempting to `list` or `get` `/leads`.
3. Unverified email spoofing `yuoseef01102@gmail.com` (`email_verified: false`).
4. Public visitor creating a lead with `followUpStatus: 'converted'` instead of `'new'`.
5. Public visitor creating a lead with a shadow field `isAdmin: true`.
6. Public visitor creating a lead with a forged past `createdAt` timestamp instead of `request.time`.
7. Attacker injecting a 5KB string into `leadId` or `fullName`.
8. Non-admin attempting to insert their own email into `/admins/{email}`.
9. Admin attempting to delete the bootstrapped super admin `/admins/yuoseef01102@gmail.com`.
10. Admin attempting to mutate immutable `createdAt` or `id` on an existing `/leads/{leadId}` document.
11. Admin creating a system with an invalid hex color (`"red"` instead of `"#081FF7"`).
12. Unauthenticated or non-admin user attempting to write `/settings/social`, or injecting `javascript:` URLs / shadow keys into `/settings/social`.
