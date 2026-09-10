# Clinic Testing Guide

This guide describes how to validate the current implementation in a way that matches the real behavior of the repository.

## 1. Test layers

### 1. Unit and service validation
Focus on:
- Prisma model integrity
- business-rule validation in service layers
- auth and RBAC guard enforcement
- report export generation
- backup manifest validation
- payment and invoice arithmetic

### 2. API validation
Check:
- health endpoint status
- auth login and refresh flows
- invoice lifecycle endpoints
- payment endpoints
- report export endpoints
- backup endpoints
- patient archive/restore flows

### 3. Frontend validation
Check:
- route access and redirect behavior
- admin controls visibility
- patient management screens
- appointment and visit flows
- invoice detail, payment, and share workflows
- Arabic/English and RTL/LTR rendering
- mobile layouts at narrow widths

### 4. Browser/device validation
Check actual browser support for:
- `navigator.share`
- `navigator.canShare({ files: [...] })`
- invoice PDF download and open behavior
- WhatsApp/Telegram/SMS fallback behavior

Do not infer file-sharing success without observing actual native browser behavior.

## 2. Critical financial tests

### Invoice duplication prevention
- attempt to create a second active invoice for the same visit
- confirm that the second invoice is rejected or blocked

### Payment validation
- attempt to pay more than the remaining invoice balance
- confirm payment is rejected

### Void and replacement handling
- create or validate invoice void/replacement flow
- confirm historical records remain accessible and safe

## 3. RBAC tests

### Admin-only tests
- access reports, backup, and settings with an admin user
- confirm success

### Receptionist restrictions
- attempt to access admin-only endpoints as receptionist
- confirm it is rejected

## 4. Patient integrity tests

### Civil ID uniqueness
- try creating patients with duplicate Civil ID values
- confirm system blocks the duplicate

### Archive workflow
- archive a patient with financial/clinical history
- confirm the record is not blindly destroyed

## 5. Backup/restore tests

### Backup integrity
- run manual backup
- verify file creation and metadata
- confirm backup listing works

### Restore safety
- validate that restore is admin-only
- attempt restore with invalid backup data and confirm it fails safely

## 6. Reporting tests

### PDF export
- generate PDF export for a known date range
- confirm the response is valid PDF content

### Excel export
- generate Excel export
- confirm file is valid and downloaded correctly

## 7. Invoice PDF and share tests

### Download vs share parity
- generate an invoice PDF via download action
- generate the same invoice PDF via share workflow
- confirm the PDF content is the same actual document

### Sharing fallback checks
- where native file-sharing is unsupported, confirm the app downloads the PDF and uses text share fallback
- confirm the user is told that manual attachment may be required

### Browser support check
- verify `navigator.share` and `navigator.canShare` availability before claiming native attachment support

## 8. Mobile width checks

Test at 360px, 375px, and 390px in both Arabic/RTL and English/LTR.

Check:
- share button visibility
- dialog fit and overflow
- message preview correctness
- invoice details layout stability
- no duplicate share/download actions
- no console errors

## 9. Accessibility tests

Check:
- dialog `aria-modal`, focus handling, and Escape behavior
- keyboard navigation for modals and actions
- visible labels and clear error messages
- invoice metadata icons are decorative and not interfering with semantics

## 10. Regression prevention checklists

Before sign-off, ensure:
- no unrelated files were changed
- no production infrastructure or secrets were altered
- no database schema was changed without explicit justification
- invoice layout and one-page A4 behavior remain intact
- no temporary generated artifacts are committed unintentionally

## 11. Exit criteria

The implementation is ready for a broader product approval pass only when:
- financial guardrails pass service validation
- patient history remains intact
- RBAC is enforced on both frontend and backend
- backup/restore is admin-only and validated
- invoice PDF generation remains consistent between download/share/print paths
- native share behavior is only reported when browser/device support is actually observed

## 12. Summary

The repo’s validation stance is deliberately conservative: verify actual behavior, document exceptions, and avoid claiming support where only a fallback path is available. That is especially important for invoice PDF sharing, where browser capability and device support vary significantly.
