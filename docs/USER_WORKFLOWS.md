# Clinic User Workflows

This document summarizes the current end-to-end product workflows as they are implemented in the repository. It is intended to guide QA, automation, and product validation without changing the underlying application behavior.

## 1. Authentication workflow

### Login
1. User enters email and password.
2. API validates credentials.
3. Access token is issued.
4. Refresh token is managed through secure cookie/session logic.
5. Protected routes are accessible only after authentication succeeds.

### Logout
- token lifecycle is terminated on the server side
- route access is immediately blocked for subsequent requests

### Refresh
- access token refresh is handled client-side according to the configured auth flow
- token rotation is a security requirement in the backend implementation

## 2. Patient management workflow

### Create patient
- patient data is entered with the necessary fields and validation rules
- duplicate Civil IDs are blocked where a value is present

### View patient detail
- patient profile includes relevant operational and financial context
- appointments, visits, and financial records are visible in context

### Archive patient
- patient records may be archived instead of permanently deleted when historical integrity matters
- archived patients are handled according to the service implementation rather than unconditional deletion

## 3. Appointment workflow

### Schedule appointment
- receptionist or admin creates an appointment with patient and time data
- appointment data is stored and available to later visit workflows

### Update appointment
- appointment status or metadata can be changed as part of front-desk operations

### Cancel appointment
- the UI supports appointment cancellation as a standard operational action
- the action must respect business rules and data integrity constraints

## 4. Visit workflow

### Create visit
- a visit is created in the relevant operational context
- related service data and patient/appointment context are retained

### Complete visit
- visit records become part of the billing and reporting lifecycle
- invoice generation depends on a valid active visit state

## 5. Service workflow

### Add services
- clinicians or staff can use service catalog entries during billing-related operations

### Aggregate usage
- service use contributes to invoice totals and reporting outputs

## 6. Invoice workflow

### Create invoice
1. A valid visit context is selected.
2. Invoice data is generated from service and encounter information.
3. The system enforces a single active invoice per visit.
4. Existing invoice history remains visible and auditable.

### View invoice
- invoice details include patient, services, totals, status, payment details, and related actions

### Share invoice
- the invoice PDF can be downloaded, printed, or shared through platform share routes
- the app attempts native file-sharing where browser support exists
- unsupported platforms fall back to text-sharing with a downloaded PDF

### Replace or void invoice
- alternative invoice relationships and voiding are handled by the authorized invoice workflow
- historical integrity is preserved

## 7. Payment workflow

### Record payment
1. User selects invoice.
2. Payment is recorded with the chosen method and amount.
3. Remaining balance is recalculated.
4. Overpayment is prevented.

### Full payment
- full payment clears or reduces remaining balance to zero and updates the invoice status logic accordingly

### Partial payment
- partial payments are supported and tracked against the invoice balance

### Admin reversal
- reversal is restricted to admin-authorized actions and preserves payment history

## 8. Reporting workflow

### Admin report access
- admin users access summary and operational dashboards
- report views contain financial and operational metrics

### Export reports
- PDF or Excel export is generated from the selected reporting date range or summary data
- export file naming is sanitized for safety

## 9. Settings and maintenance workflow

### User management
- admins create and toggle user activation status
- inactive users are handled by service/auth logic

### Backup workflow
- admin users can run a backup or restore flow
- backup status and list endpoints are available via the admin settings surface

## 10. Mobile and responsive workflow

The UX is designed to be usable on smaller screens with:
- mobile-safe card layouts
- responsive tables or stack-friendly alternatives
- dialog and bottom-sheet-style patterns where appropriate
- Arabic/English and RTL/LTR support

## 11. Quality and safety workflow

The system expects operations to be validated in contexts such as:
- duplicate invoice prevention
- duplicate payment prevention
- report export correctness
- patient archival safety
- backup validation
- invoice PDF correctness

## 12. Summary

The current application deliberately prioritizes operational correctness and financial safety over convenience. The everyday workflow is a front-desk/clinic-administration system driven by patient activity, visit-to-invoice revenue logic, and reportable operational metrics.
