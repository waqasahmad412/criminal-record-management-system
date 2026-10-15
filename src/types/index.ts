export type UserRole = 'Administrator' | 'Police Officer' | 'Investigator' | 'Supervisor' | 'Court Official';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  badgeNumber: string;
  role: UserRole;
  department: string;
  rank: string;
  avatarUrl: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions: string[];
}

export type RecordStatus = 'Suspect' | 'Person of Interest' | 'Arrested' | 'Charged' | 'Convicted' | 'Acquitted' | 'Expunged' | 'Archived';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Extreme';

export interface CriminalRecord {
  id: string; // e.g. CR-2026-0042
  nationalId: string; // e.g. ID-8942-X8
  firstName: string;
  lastName: string;
  aliases: string[];
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  nationality: string;
  address: string;
  phone?: string;
  photoUrl: string;
  status: RecordStatus;
  riskLevel: RiskLevel;
  heightCm: number;
  weightKg: number;
  eyeColor: string;
  hairColor: string;
  scarsMarksTattoos: string;
  fingerprintClass?: string;
  bloodType?: string;
  dnaProfileRef?: string;
  gangAffiliation?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdById?: string;
  createdByRole?: UserRole;
  linkedCaseIds: string[];
  linkedArrestIds: string[];
  linkedComplaintIds: string[];
  isArchived?: boolean;
}

export type CaseStatus = 'Registered' | 'Under Review' | 'Under Investigation' | 'Pending Court' | 'Closed' | 'Archived';
export type CasePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type CrimeCategory = 
  | 'Homicide'
  | 'Armed Robbery'
  | 'Cybercrime'
  | 'Narcotics & Smuggling'
  | 'Financial Fraud'
  | 'Assault & Battery'
  | 'Burglary & Theft'
  | 'Domestic Violence'
  | 'Traffic & DUI'
  | 'Other';

export interface InvestigationNote {
  id: string;
  caseId: string;
  officerId: string;
  officerName: string;
  officerRank: string;
  note: string;
  isConfidential: boolean;
  createdAt: string;
}

export interface Case {
  id: string; // CASE-2026-0142
  title: string;
  crimeCategory: CrimeCategory;
  priority: CasePriority;
  status: CaseStatus;
  incidentDate: string;
  incidentLocation: string;
  description: string;
  primaryInvestigatorId: string;
  primaryInvestigatorName: string;
  leadOfficerId: string;
  leadOfficerName: string;
  courtDocketNumber?: string;
  courtHearingDate?: string;
  verdict?: string;
  linkedRecordIds: string[];
  linkedComplaintIds: string[];
  linkedEvidenceIds: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdById?: string;
  createdByRole?: UserRole;
  closedAt?: string;
  closureReason?: string;
}

export type ArrestStatus = 'In Custody' | 'Released on Bail' | 'Transferred' | 'Released without Charge' | 'Remanded';

export interface Arrest {
  id: string; // ARR-2026-0091
  recordId: string;
  suspectName: string;
  caseId?: string;
  caseTitle?: string;
  arrestDate: string;
  arrestLocation: string;
  arrestingOfficerId: string;
  arrestingOfficerName: string;
  arrestingOfficerBadge: string;
  statutoryCharges: string[];
  warrantNumber?: string;
  mirandaRightsRead: boolean;
  mirandaReadTime?: string;
  bailAmount?: number;
  status: ArrestStatus;
  detentionFacility: string;
  cellNumber?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  createdByRole?: UserRole;
}

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ComplaintStatus = 'Received' | 'Under Review' | 'Assigned' | 'In Progress' | 'Converted to Case' | 'Resolved' | 'Closed';
export type ComplaintCategory = 'Theft / Loss' | 'Noise / Disturbance' | 'Harassment / Stalking' | 'Vandalism' | 'Suspicious Activity' | 'Cyber Harassment' | 'Assault' | 'Fraud' | 'Other';

export interface Complaint {
  id: string; // CMP-2026-0512
  complainantName: string;
  complainantPhone: string;
  complainantEmail?: string;
  complainantAddress?: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  incidentDate: string;
  incidentLocation: string;
  description: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  linkedRecordId?: string;
  linkedCaseId?: string;
  internalNotes?: string;
  resolutionSummary?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  createdById?: string;
  createdByRole?: UserRole;
}

export type EvidenceCategory = 'Physical' | 'Forensic' | 'Digital / Cyber' | 'Weapon' | 'Narcotics' | 'Documentary' | 'Biological' | 'Audio / Video';
export type EvidenceStatus = 'Logged' | 'In Lab Analysis' | 'In Storage Locker' | 'Presented in Court' | 'Released' | 'Destroyed' | 'Archived';

export interface CustodyEvent {
  id: string;
  evidenceId: string;
  timestamp: string;
  actingUserId: string;
  actingUserName: string;
  actingUserBadge: string;
  action: 'Collected' | 'Transferred' | 'Checked Out for Lab' | 'Returned to Storage' | 'Presented in Court' | 'Disposed';
  fromLocation: string;
  toLocation: string;
  purpose: string;
  authorizedBy: string;
  notes?: string;
}

export interface Evidence {
  id: string; // EVD-2026-0312
  caseId: string;
  caseTitle?: string;
  category: EvidenceCategory;
  description: string;
  collectionDate: string;
  collectingOfficerId: string;
  collectingOfficerName: string;
  collectingOfficerBadge: string;
  storageLocker: string; // e.g. Locker B-14, Shelf 3
  status: EvidenceStatus;
  fileAttachment?: {
    name: string;
    type: string;
    sizeBytes: number;
    url: string;
    isClassified: boolean;
  };
  custodyHistory: CustodyEvent[];
  barcodeRef: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  createdById?: string;
  createdByRole?: UserRole;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userBadge: string;
  action: string; // e.g. "RECORD_CREATE", "CASE_UPDATE_STATUS", "CUSTODY_TRANSFER"
  resourceType: 'CriminalRecord' | 'Case' | 'Arrest' | 'Complaint' | 'Evidence' | 'User' | 'SystemSetting' | 'ReportExport' | 'Report';
  resourceId: string;
  resourceTitle?: string;
  status: 'Success' | 'Failed' | 'Denied';
  ipAddress: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'assignment' | 'alert' | 'status_change' | 'deadline' | 'custody';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface TaskItem {
  id: string;
  assignedToId: string;
  assignedToName: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
  isCompleted: boolean;
  relatedCaseId?: string;
  createdAt: string;
  createdBy?: string;
  createdById?: string;
  createdByRole?: UserRole;
}

export interface SystemSettings {
  agencyName: string;
  jurisdictionCode: string;
  retentionYearsRecords: number;
  retentionYearsCases: number;
  automaticArchival: boolean;
  requireTwoOfficerApprovalForRecordDeletion: boolean;
  digitalEvidenceMaxFileMb: number;
  auditLogRetentionDays: number;
  nationalIdVerificationMockEnabled: boolean;
  courtSyncMockEnabled: boolean;
  interopolSyncMockEnabled: boolean;
}

export type ReportType =
  | 'cases_summary'
  | 'records_summary'
  | 'officer_workload'
  | 'evidence_inventory'
  | 'arrests_summary'
  | 'custom_investigation';

export type ReportStatus = 'Draft' | 'Under Review' | 'Approved' | 'Certified Official';

export interface ReportRecord {
  id: string; // e.g. RPT-2026-001
  reportType: ReportType;
  title: string;
  subtitle: string;
  category: string;
  department: string;
  status: ReportStatus;
  benchmarkGoal?: number; // e.g. 65 (%)
  dateRange: '30' | '90' | '365' | 'all';
  summary: string;
  findings: string;
  recommendations: string;
  confidentialNotes?: string;
  authorName: string;
  authorBadge: string;
  authorRole: string;
  rosterTitle?: string;
  sealText?: string;
  sealReference?: string;
  officerSignature?: string;
  signatureDateBadge?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  createdAt: string;
  updatedAt: string;
}
