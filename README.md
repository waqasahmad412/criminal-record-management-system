# Criminal Record Management System (CRMS)

**CRMS Core** is an advanced, production-grade, full-stack Criminal Record Management System built with React, TypeScript, Tailwind CSS, Recharts, and Lucide Icons.

> **Academic & Demonstration Notice**: This application is an educational prototype and administrative showcase. All identity records, biometric indices, warrants, dockets, and criminal histories contained within the default database are fictional and generated strictly for evaluation purposes.

---

## 🌟 Key Capabilities & Features

### 1. Role-Based Access Control (RBAC)
Supports five statutory law enforcement personas with granular permissions:
- **Administrator** (`admin@crms.gov`): Full system control, user provisioning, security policies, audit oversight, and record expungement authorization.
- **Police Officer** (`officer@crms.gov`): Register & edit criminal records, book custodial arrests, receive citizen complaints, view assigned cases.
- **Investigator** (`investigator@crms.gov`): Manage CID major crime dockets, append confidential field notes, link forensic evidence, update workflow stages.
- **Supervisor** (`supervisor@crms.gov`): Supervisory review, workflow approvals, priority escalations, task assignments, and audit review.
- **Court Official** (`court@crms.gov`): Judicial registry review, case docket tracking, read-only legal access, certified court exports.

*Tip: Use the **Role** picker in the top navigation header or the 1-click login buttons on the login screen to instantaneously test any persona.*

---

### 2. Operational Command Center Dashboard
- Real-time calculated KPI metrics directly aggregated from the persistent database:
  - Criminal Records Indexed
  - Active & Closed Case Dockets
  - Custodial Arrests & Detentions
  - Pending Citizen Complaints
  - Vaulted Evidence & Chain of Custody Events
  - Active Authorized Personnel
- **Recharts Analytics**:
  - Monthly Caseload & Registration Trend (Area Chart)
  - Case Status Ratio (Donut / Pie Chart)
  - Classified Crime Category Volume (Horizontal Bar Chart)
- Live Tamper-Evident Audit Stream
- Priority Investigation Tasks & Deadlines
- Quick Action buttons for fast operational intake

---

### 3. Criminal Records Management
- Unique internal references (`CR-2026-XXXX`) and National ID cross-referencing.
- Complete biometrics: Mugshots, Height, Weight, Hair, Eye Color, Scars/Marks/Tattoos, Fingerprint Classification, Blood Type, DNA Docket, and Gang Affiliations.
- Strict procedural due process statuses: *Suspect (Allegation only)*, *Person of Interest*, *Arrested*, *Charged (Indicted)*, *Convicted*, *Acquitted*, and *Archived*.
- Duplicate subject detection alert on matching name or National ID.
- Tabbed subject dossier: Overview, Linked Cases, Arrest History, Seized Evidence, Documents, and Activity History.
- **Printable Rap Sheet**: Generates an official, print-ready document with badge watermark and signature blocks.

---

### 4. CID Case Management
- Auto-generated case dockets (`CASE-2026-XXXX`).
- Multi-stage investigation workflow: *Registered* &rarr; *Under Review* &rarr; *Under Investigation* &rarr; *Pending Court* &rarr; *Closed* &rarr; *Archived*.
- Primary Investigator & Lead Officer assignment.
- Chronological Investigation Field Notes with restricted/confidential toggles.
- Court Docket Numbers and Judicial Hearing Date scheduling.
- Reciprocal linking between Cases, Criminal Records, Complaints, and Evidence.

---

### 5. Custodial Arrests & Detention Intake
- Unique booking references (`ARR-2026-XXXX`).
- Statutory penal charges, warrant numbers, and Miranda rights warning compliance logging.
- Facility placement (cell/block) and bail/bond amounts.
- Statuses: *In Custody*, *Remanded*, *Released on Bail*, *Transferred*, *Released without Charge*.
- **Printable Booking Slip**: Official committal intake documentation.

---

### 6. Citizen & Incident Complaints
- Unique complaint references (`CMP-2026-XXXX`).
- Priority grading (*Low*, *Medium*, *High*, *Urgent*).
- **Escalate to Case Workflow**: Seamlessly upgrades an urgent citizen complaint into an official CID investigation docket without losing chronological history.

---

### 7. Evidence Vault & Chain of Custody
- Unique evidence IDs (`EVD-2026-XXXX`) and digital barcodes (`EVD-BARCODE-XXXXXX`).
- Vault locker and rack storage locations.
- Classified digital attachment metadata verification.
- **Immutable Chain of Custody Log**: Every transfer records the acting user, badge number, action (*Collected*, *Transferred*, *Checked Out for Lab*, *Returned to Storage*, *Presented in Court*, *Disposed*), origin/destination, purpose, and authorizing officer.
- Custody transfer workflow modal.

---

### 8. Unified Search & Global Spotlight
- Global Spotlight search (`Ctrl+K` or `Cmd+K` anywhere) with instant cross-database matches.
- Dedicated multi-entity search engine (`/search`) supporting combined filters by entity scope, crime category, status, investigator, and keywords.

---

### 9. Reports, Analytics & Exports
- Certified reports: Case Clearance, Criminal Records Dossier, Officer Workload, and Evidence Inventory.
- CSV export for all database entities.
- Official printable PDF reports formatted with law enforcement seals, metadata headers, and verification stamps.
- Automatic audit logging for every exported report.

---

### 10. Security Audit Trail & Administration
- Cryptographic event logger recording Actor, Role, Badge, Event Action, Resource ID, Subnet IP, and detailed payload.
- User management module for account provisioning and credential activation/suspension.
- System settings with retention rules, backup export (JSON), and database restoration.

---

## 🛠️ Technology Stack
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Storage**: Persistent client-side repository with relational schema, event bus, and JSON backup/restore
- **Build**: Vite 8
