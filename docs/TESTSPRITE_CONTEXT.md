# TestSprite Context

This file provides machine-readable context for automated or manual test orchestration against the current Clinic implementation.

## 1. App profile

- Product: Clinic management and billing system
- Frontend: React 18 + Vite + TypeScript + Tailwind
- Backend: NestJS + TypeScript
- Database: PostgreSQL + Prisma
- Localization: Arabic + English
- Layout: RTL/LTR aware UI
- Authentication: JWT access + refresh rotation
- RBAC: ADMIN / RECEPTIONIST only

## 2. Core routes and protected areas

### Public routes
- login
- health or basic public endpoints where available

### Protected routes
- dashboard
- patients
- appointments
- visits
- invoices
- reports
- settings

### Admin-only features
- reports
- daily closing
- backups and restore
- user management

## 3. Domain entities

- User
- Patient
- Appointment
- Visit
- Service
- Invoice
- Payment
- Backup audit/log metadata
- Settings / operational configuration

## 4. Critical business checks

TestSprite should prioritize validation of:
- duplicate active invoice per visit
- duplicate Civil ID when populated
- remaining balance correctness
- payment overcollection prevention
- patient archival instead of blind deletion
- report export permissions
- backup/restore access restrictions
- invoice PDF generation parity
- file-share fallback behavior on unsupported platforms

## 5. Data safety expectations

The product is intentionally conservative with financial and clinical records. Test cases should treat destructive patient deletion, silent financial overwrite, and unauthorized report/export access as failures unless explicitly handled by a safe archival or admin-only workflow.

## 6. Key implementation assumptions to preserve

- keep invoice PDF generation deterministic and consistent
- preserve A4 one-page invoice behavior
- do not redesign invoice layout while fixing sharing or icon issues
- do not claim native file-sharing success without actual browser/device support
- keep admin-only access boundaries enforced in both API and UI
- keep translation and layout stubs aligned with Arabic and English expectations

## 7. Primary QA priorities

1. financial correctness and safety
2. backup/restore reliability and validation
3. invoice/payment behavior
4. RBAC drift detection
5. mobile responsiveness and dialog accessibility
6. report/export correctness
7. invoice share behavior and PDF generation parity
8. locale correctness and RTL/LTR support

## 8. Suggested test scenario catalog

- login-success-admin
- login-success-receptionist
- login-failure-invalid-credentials
- patient-create-duplicate-civil-id
- appointment-create-and-cancel
- visit-create-and-link-invoice
- invoice-create-active-constraint
- payment-partial-balance
- payment-over-limit
- admin-report-export-pdf
- admin-report-export-excel
- backup-run-status-list
- backup-restore-admin-only
- invoice-download-vs-share-content-match
- invoice-share-fallback-no-native-support
- invoice-share-mobile-native-support-observed-only
- mobile-dialog-layout-ar-rtl
- mobile-dialog-layout-en-ltr
- modal-keyboard-navigation

## 9. Evidence-based execution note

This test context intentionally reflects code-level reality rather than hypothetical requirements. Automated or manual validation should prioritize implemented behaviors and avoid assuming unsupported browser capabilities such as universal native PDF attachment in every device/browser combination.

## 10. Summary

The Clinic system is a real-world clinical financial operations product. The best validation strategy is to check the actual business rules and runtime constraints present in the implementation, especially around billing integrity, authorization, and browser-specific share support.
