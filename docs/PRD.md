# Clinic Product Requirements Document (Source-backed)

This document is derived from the current canonical implementation in the `main` branch and is intended to be a source-backed operational reference for product, QA, and automation work. It does not describe aspirational features that are not present in the codebase; it describes what the application currently enforces and exposes.

## 1. Product overview

Clinic is a clinic operations and billing platform for Arabic/English, admin/receptionist workflows, patient management, appointment booking, visits, service capture, invoicing, payments, reporting, backup/restore, and audit-oriented operational controls.

The implementation combines:
- React 18 + Vite + TypeScript + Tailwind on the frontend
- NestJS + TypeScript on the backend
- PostgreSQL + Prisma 5.x as the source of truth
- JWT access tokens + refresh cookie flow for authentication
- Admin and receptionist RBAC with protected routes and role-aware actions
- Financial guardrails around invoice issuance, payments, and reversals

## 2. Product boundaries and constraints

The system currently assumes:
- only two roles are used: `ADMIN` and `RECEPTIONIST`
- financial workflows are sensitive and must avoid duplicate/unsafe operations
- invoice history and payment history must remain auditable
- patient records must not be blindly deleted if historical financial data depends on them
- Arabic and English UI behavior is supported, including RTL/LTR layout assumptions

## 3. Role model

### ADMIN
- Can access protected admin and operational areas
- Can create or manage users
- Can review reports and daily closing data
- Can trigger backups and restore flows
- Can reverse payments when permitted by the service logic
- Can manage sensitive settings and operational controls

### RECEPTIONIST
- Can operate core front-desk workflows, appointments, visits, patient records, invoicing, and payments
- Can create and manage patient-facing operational records
- Cannot access reports, daily closing, or backup/restore as admin-only modules

This is enforced by backend guards and frontend route gating.

## 4. Primary user workflows

### Patient workflow
- Search patients by name, Civil ID, or other reference data
- Create and edit patients
- View patient detail with appointments, visits, invoice history, and financial context
- Archive patients instead of hard deleting when historical clinical or financial records must remain intact
- Prevent duplicate civil IDs where the schema and service enforce uniqueness

### Appointment workflow
- Create, view, update, and cancel appointments
- Track appointment status transitions
- Associate appointments with visits and billing activity
- Support agenda-style views and mobile-friendly layouts

### Visit workflow
- Create visits from appointments or direct intake
- Record visit data, services, treatment details, and operational context
- Enforce invoice-related rules around visits and billing lifecycle

### Service workflow
- Manage service catalog entries used when creating invoice charges
- Capture service usage and revenue/report aggregation

### Invoice workflow
- Issue invoice for active visit context
- Prevent duplicate active invoices per visit
- Allow replacement invoice relationships where explicitly supported by service logic
- Allow voided invoice history to remain while preventing active duplicate financial records
- Keep payment and remaining-balance calculations consistent

### Payment workflow
- Record payments against invoices
- Reject overcollection beyond remaining balance
- Apply partial and full payment logic
- Support admin reversal of payments when necessary

### Report workflow
- Export summary, revenue, payment method, invoice status, service usage, patient, and daily-closing reports
- Export PDF and Excel reports for admin-only review

### Settings and maintenance workflow
- Manage user accounts and activation state
- Review backup status, list backups, and execute manual backup or restore operations
- Manage operational and configuration settings as part of the admin surface

## 5. Authentication and security

The current implementation uses:
- JWT access tokens
- refresh-token rotation with HTTP-only cookie handling
- protected routes and RBAC guards
- user activation checks and logout handling

Key security assumptions in the code:
- JWT secrets are required runtime configuration values
- production hardening removed insecure JWT fallback secrets
- the API enforces role-protected endpoints
- report, backup, and settings actions are admin-only
- financial endpoints are locked behind role and business logic checks

## 6. Data model and business rules

The canonical Prisma schema defines the domain model for patients, appointments, visits, services, invoices, payments, users, backup logs, settings, audits, and related records.

Important rules currently enforced in code and schema:
- duplicate Civil IDs are rejected where populated
- one active invoice per visit is enforced by an active-invoice constraint pattern
- invoice status transitions are explicit and limited
- void invoices are terminal and remain historically visible
- payment creation is gated to issued invoices and not voided invoices
- payment reversal is restricted to authorized admin flows
- backup operations are admin-only and use real PostgreSQL dump/restore tooling

## 7. Invoice and payment integrity

Financial correctness is one of the highest-priority product guarantees in the current implementation.

Current product expectations:
- invoice totals must match service lines and payment allocations
- remaining balance calculations must be derived from the authoritative invoice state
- duplicate payment submission must be prevented by service and guard logic
- duplicate active invoice issuance must be prevented
- invoice replacement/void relationships must maintain historical traceability
- overpayment and balance overshoot are blocked by validation checks

This is not merely UI behavior; the service layer is the authoritative enforcement point.

## 8. Backup and restore

The backup subsystem is a real database backup/restore implementation, not a mock.

It:
- uses PostgreSQL dump and restore tooling
- stores manifests and metadata for verification
- validates backup integrity using archive/manifest checks
- supports encryption where configured
- prevents overlapping backup/restore actions
- limits restore operations to admin flows

This makes backup/restore a security-sensitive, admin-only area and a critical production risk area if not validated.

## 9. Reporting and exports

Admin-only reporting covers:
- summary metrics
- revenue time series
- payment method breakdown
- invoice status breakdown
- service usage
- visit type breakdown
- appointment status breakdown
- new patient time series
- outstanding invoices
- daily closing

Export formats:
- PDF
- Excel

The report export code sanitizes filename input to reduce header injection risk and ensures reporting remains protected by RBAC.

## 10. Invoice PDF and sharing

The system includes server-side invoice PDF generation and a front-end share flow designed to use the exact generated PDF content when supported by the browser.

Current behavior in implementation:
- the invoice PDF is generated by the same service used for download/print flows
- the share flow attempts Web Share API usage with `navigator.share` and `navigator.canShare({ files: [...] })`
- when native file sharing is unsupported, the app falls back to downloaded PDF + text-based share flows
- the app preserves the original invoice layout and A4 page behavior
- the invoice metadata section includes inline SVG icons for the invoice number and date

It is important to distinguish the implementation from what a browser/device may actually support at runtime.

## 11. Localization and UX

The frontend includes Arabic and English strings and supports both RTL and LTR layouts.

Focus areas in the current implementation include:
- responsive patient/visit/appointment layouts
- mobile-safe cards and dialogs
- clear loading/error states
- accessible modal patterns and keyboard handling
- RTL-aware logical positioning where it was added without harming intentional layout behavior

## 12. Non-goals and explicit constraints

The current implementation does not imply the following unless explicitly confirmed in code:
- unrestricted destructive patient deletion
- direct invoice editing without controlled workflow
- a generic, public admin bypass
- export generation without role checks
- use of a mock backup/restore system in production
- silent acceptance of duplicate financial records

## 13. Product acceptance themes

The product should be considered acceptable only when the following hold:
- financial workflows are consistent and protected against accidental duplicate operations
- patient history remains intact and archival behavior is used instead of blind deletion
- invoice/payment data remain auditable and reversible only under controlled authority
- backup/restore is validated and restricted to admins
- Arabic and English operations remain coherent in responsive interfaces
- reports and exports are admin-only and correctly generated
- browser and device sharing behavior reflects actual support rather than assumed support

## 14. Known implementation realities

The repository code currently signals the following realities:
- native PDF attachment via Web Share API is best-effort and device dependent
- the application is built for a hospital/clinic operational workflow, not a generic personal finance tool
- financial safety and auditability are emphasized more than convenience shortcuts
- patient archival is preferred over direct hard delete when historical records could be affected

## 15. Summary

The current Clinic application is a structured clinical operations and billing system with strong emphasis on operational integrity, privacy boundaries, role enforcement, and customer-facing invoice/report workflows. The code is aligned to a real-world clinic environment where accuracy, auditability, and data safety matter more than relaxed or destructive workflows.
