# Clinic Business Rules (Implementation-backed)

This document records the business rules currently enforced by the Codebase. It is intended to be used as the source of truth for QA, product validation, and TestSprite-driven checks.

## 1. Identity and role rules

### User roles
The application currently recognizes exactly two roles:
- `ADMIN`
- `RECEPTIONIST`

This is reflected in the Prisma enum, frontend typed role model, and backend guards.

### Access boundaries
- protected routes require authentication
- admin-only features are restricted by `RolesGuard`
- report generation and backup/restore are admin-only
- financial actions are risk-sensitive and restricted by service-level business logic

## 2. Patient rules

### Civil ID handling
- patient Civil ID is treated as an important identifier in patient workflows
- schema/service logic prevents duplicate Civil IDs when a value is present
- legacy import guidance explicitly distinguishes normal validation from rows that cannot be safely reconciled

### Patient lifecycle
- a patient may be archived rather than hard-deleted if historical clinical or financial records depend on the patient record
- archive/restore is safer than destructive deletion and preserves referential integrity
- the codebase does not show a general-purpose unconditional hard-delete path for patients

## 3. Appointment rules

### Appointment status
Appointment records are modeled as operational records with mutable status and scheduling semantics. The app supports appointment scheduling and status-based operational flows.

### Relationship to visits and billing
Appointments can lead to visits; visits are part of the billing chain. The implementation uses operational status transitions instead of purely static records.

## 4. Visit rules

### Visit continuity
A visit is an operational record that ties clinical activity to the service and billing lifecycle.

### Invoice relationship
- visits are a meaningful context for invoicing
- invoice creation is tied to an active visit context
- duplicate active invoice generation per visit is prevented

## 5. Service and pricing rules

### Service catalog
The system maintains a service catalog used for charges and reporting.

### Revenue aggregation
- service usage is aggregated for reporting
- service use is also reflected in invoice totals and report exports

## 6. Invoice rules

### Issue rule
Invoices may only be issued in valid operational states. The system enforces a unique active invoice constraint per visit.

### Replacement and void rule
- the implementation supports invoice replacement/void behavior in a controlled way
- historical invoice records remain visible even after voiding
- voided invoices are not treated as active financial operations

### Duplicate financial prevention
- duplicate active invoice issuance is prevented
- duplicate payment submissions are prevented by validation logic
- the app rejects overcollection beyond remaining balance

## 7. Payment rules

### Payment validity
- payments can be created only for issued, non-voided invoices
- the app checks remaining balance before accepting a payment
- full and partial payments are both supported

### Reversal rule
- payment reversal is restricted to admin-only flows
- reversal is a controlled adjustment that preserves financial auditability

### Overpayment prevention
- the service layer prevents payment values that exceed remaining balance
- partial payment behavior is consistent with the invoice remaining balance calculation

## 8. Financial safety rules

The codebase is explicitly designed around financial safety.

### Guardrails enforced by service layer
- no duplicate active invoice per visit
- no overpayment beyond the remaining invoice value
- no payment against voided invoices
- no destructive patient deletion without a safe archival pattern
- no unrestricted access to backup/restore or report exports by non-admin users

### Auditability expectation
- invoice and payment history must remain traceable
- payment reversals should be deliberate and role-restricted
- historical records cannot be silently overwritten by a soft or hard-delete flow

## 9. Backup and restore rules

### Admin-only operations
Backup creation and restore are only available to admins.

### Safety controls
- overlapping backup/restore operations are prevented
- operations are logged and tied to the acting user/session context
- manifest validation is part of the restore/backup lifecycle
- real database tooling is used rather than simulated data copies

## 10. Reporting rules

### Admin-only access
- report queries and exports require admin privileges
- date range filters are accepted but sanitized for output filenames

### Output rules
- exports support PDF and Excel
- exports are generated only for authorized users
- summary and daily-closing data are locked to admin review

## 11. Localization rules

### Languages
- Arabic and English interfaces are supported
- invoice and general UI flows preserve RTL/LTR behavior as implemented

### File/share messaging
The invoice sharing flow attempts to use native file sharing when the browser supports it; otherwise the app falls back to text-sharing flows and PDF download.

## 12. Intentionally non-destructive product policy

The following product decisions are explicit in the implemented code:
- avoid blind patient deletion
- prefer archive and relationship-safe handling
- keep invoice/payment history intact
- prevent duplicate financial operations rather than recovering from them later
- use real database-level validation and constraints

## 13. QA validation focus

Business rules should be considered failed when any of the following happens:
- duplicate active invoice appears for the same visit
- payment exceeds remaining balance
- a non-admin accesses backup/report actions
- patient record is hard-deleted without a safeguarding workflow
- invoice history or payment history is lost or made ambiguous
- backup/restore cannot validate or restore an expected archive safely

## 14. Summary

Clinic’s business logic is intentionally operationally conservative: it prioritizes correctness, traceability, and financial integrity over convenience. The codebase consistently chooses guarded flows, admin-only sensitive actions, and history-preserving patterns rather than permissive destructive behavior.
