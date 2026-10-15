import {
  User,
  CriminalRecord,
  Case,
  Arrest,
  Complaint,
  Evidence,
  AuditLog,
  NotificationItem,
  TaskItem,
  SystemSettings,
  InvestigationNote,
  ReportRecord
} from '../types';

const STORAGE_KEY = 'CRMS_PERSISTENT_DATABASE_V2';

export interface DatabaseState {
  users: User[];
  records: CriminalRecord[];
  cases: Case[];
  arrests: Arrest[];
  complaints: Complaint[];
  evidence: Evidence[];
  notes: InvestigationNote[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  tasks: TaskItem[];
  settings: SystemSettings;
  reports: ReportRecord[];
}

const DEFAULT_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Director Elena Vance',
    email: 'admin@crms.gov',
    password: 'password123',
    badgeNumber: 'ADM-001',
    role: 'Administrator',
    department: 'Metropolitan Police HQ - Internal Affairs & Admin',
    rank: 'Assistant Commissioner',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 019-2831',
    isActive: true,
    createdAt: '2025-01-10T08:00:00Z',
    permissions: ['ALL_PERMISSIONS', 'USER_MANAGE', 'SETTINGS_MANAGE', 'AUDIT_VIEW', 'RECORDS_DELETE', 'ARCHIVE_OVERRIDE']
  },
  {
    id: 'usr-officer-1',
    name: 'Officer Marcus Brody',
    email: 'officer@crms.gov',
    password: 'password123',
    badgeNumber: 'PO-4482',
    role: 'Police Officer',
    department: '4th Precinct - Patrol Division',
    rank: 'Senior Patrol Officer',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 014-9920',
    isActive: true,
    createdAt: '2025-02-14T09:30:00Z',
    permissions: ['RECORD_CREATE', 'RECORD_EDIT', 'ARREST_MANAGE', 'COMPLAINT_MANAGE', 'CASE_VIEW']
  },
  {
    id: 'usr-investigator-1',
    name: 'Detective Sarah Jenkins',
    email: 'investigator@crms.gov',
    password: 'password123',
    badgeNumber: 'INV-1092',
    role: 'Investigator',
    department: 'Major Crimes & Criminal Investigation Division (CID)',
    rank: 'Detective First Grade',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 017-3312',
    isActive: true,
    createdAt: '2025-01-20T11:00:00Z',
    permissions: ['CASE_MANAGE', 'NOTE_ADD', 'EVIDENCE_LINK', 'CASE_STATUS_UPDATE', 'RECORD_VIEW']
  },
  {
    id: 'usr-supervisor-1',
    name: 'Captain Raymond Holt',
    email: 'supervisor@crms.gov',
    password: 'password123',
    badgeNumber: 'SUP-0210',
    role: 'Supervisor',
    department: 'Operations & Supervisory Command',
    rank: 'Captain',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 012-7744',
    isActive: true,
    createdAt: '2025-01-05T08:00:00Z',
    permissions: ['CASE_APPROVE', 'WORKFLOW_MONITOR', 'RECORD_VIEW', 'AUDIT_VIEW', 'TASK_ASSIGN']
  },
  {
    id: 'usr-court-1',
    name: 'Clerk Jonathan Miller',
    email: 'court@crms.gov',
    password: 'password123',
    badgeNumber: 'CRT-8819',
    role: 'Court Official',
    department: 'District Superior Court - Judicial Registry',
    rank: 'Chief Deputy Clerk',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 018-4491',
    isActive: true,
    createdAt: '2025-03-01T10:00:00Z',
    permissions: ['RECORD_READ_ONLY', 'CASE_READ_ONLY', 'EVIDENCE_READ_ONLY', 'COURT_EXPORT']
  }
];

const DEFAULT_SETTINGS: SystemSettings = {
  agencyName: 'Metropolitan Law Enforcement Department',
  jurisdictionCode: 'METRO-DIST-04',
  retentionYearsRecords: 20,
  retentionYearsCases: 25,
  automaticArchival: true,
  requireTwoOfficerApprovalForRecordDeletion: true,
  digitalEvidenceMaxFileMb: 50,
  auditLogRetentionDays: 365,
  nationalIdVerificationMockEnabled: true,
  courtSyncMockEnabled: true,
  interopolSyncMockEnabled: false
};

const DEFAULT_RECORDS: CriminalRecord[] = [
  {
    id: 'CR-2026-0042',
    nationalId: 'ID-8831-TX',
    firstName: 'Victor',
    lastName: 'Kozlov',
    aliases: ['The Ghost', 'Viktor K.'],
    dateOfBirth: '1984-06-14',
    gender: 'Male',
    nationality: 'United States',
    address: '742 Evergreen Terrace, Sector 4, Metro City',
    phone: '+1 (555) 782-9901',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    status: 'Charged',
    riskLevel: 'Extreme',
    heightCm: 185,
    weightKg: 88,
    eyeColor: 'Blue',
    hairColor: 'Brown',
    scarsMarksTattoos: 'Scorpion tattoo on right forearm, 5cm surgical scar above left eyebrow',
    fingerprintClass: 'Whorl-Plain-Group-A',
    bloodType: 'O-Negative',
    gangAffiliation: 'Bayside Syndicate (Alleged)',
    notes: 'Suspect has extensive firearms handling history and international travel ties. Flight risk flagged.',
    createdAt: '2026-01-12T14:22:00Z',
    updatedAt: '2026-03-20T10:15:00Z',
    createdBy: 'Director Elena Vance',
    linkedCaseIds: ['CASE-2026-0142'],
    linkedArrestIds: ['ARR-2026-0091'],
    linkedComplaintIds: ['CMP-2026-0512']
  },
  {
    id: 'CR-2026-0089',
    nationalId: 'ID-4920-CA',
    firstName: 'Dominic',
    lastName: 'Moretti',
    aliases: ['Nico', 'Dom'],
    dateOfBirth: '1991-11-03',
    gender: 'Male',
    nationality: 'United States',
    address: '1204 Pine Hollow Ave, Suite 3B',
    phone: '+1 (555) 612-3344',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    status: 'Convicted',
    riskLevel: 'High',
    heightCm: 178,
    weightKg: 80,
    eyeColor: 'Brown',
    hairColor: 'Black',
    scarsMarksTattoos: 'Tribal band on left shoulder, burn mark on right knuckle',
    fingerprintClass: 'Loop-Radial-Group-C',
    bloodType: 'A-Positive',
    notes: 'Prior convictions in financial wire fraud, wiretapping, and interstate grand larceny.',
    createdAt: '2025-08-19T09:10:00Z',
    updatedAt: '2026-02-11T16:40:00Z',
    createdBy: 'Officer Marcus Brody',
    linkedCaseIds: ['CASE-2026-0188'],
    linkedArrestIds: ['ARR-2026-0105'],
    linkedComplaintIds: []
  },
  {
    id: 'CR-2026-0112',
    nationalId: 'ID-3391-NY',
    firstName: 'Kassandra',
    lastName: 'Vane',
    aliases: ['Cassie', 'Hex'],
    dateOfBirth: '1995-02-28',
    gender: 'Female',
    nationality: 'United States',
    address: '88 Cyber Boulevard, Apt 12F',
    phone: '+1 (555) 301-4455',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    status: 'Suspect',
    riskLevel: 'Medium',
    heightCm: 168,
    weightKg: 58,
    eyeColor: 'Green',
    hairColor: 'Auburn',
    scarsMarksTattoos: 'Circuit board motif tattoo across upper spine',
    fingerprintClass: 'Arch-Tented-Group-B',
    bloodType: 'B-Positive',
    notes: 'Specialist in decentralized transaction interception and corporate ransomware breach vectors.',
    createdAt: '2026-02-04T11:45:00Z',
    updatedAt: '2026-03-15T09:20:00Z',
    createdBy: 'Detective Sarah Jenkins',
    linkedCaseIds: ['CASE-2026-0210'],
    linkedArrestIds: [],
    linkedComplaintIds: ['CMP-2026-0604']
  },
  {
    id: 'CR-2026-0145',
    nationalId: 'ID-9912-FL',
    firstName: 'Devon',
    lastName: 'Cross',
    aliases: ['DC', 'Razor'],
    dateOfBirth: '1989-09-17',
    gender: 'Male',
    nationality: 'United States',
    address: '310 Industrial Way, Warehouse 9',
    phone: '+1 (555) 902-8871',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    status: 'Arrested',
    riskLevel: 'High',
    heightCm: 182,
    weightKg: 91,
    eyeColor: 'Hazel',
    hairColor: 'Shaved',
    scarsMarksTattoos: 'Dagger tattoo on neck, jagged scar on right jaw',
    fingerprintClass: 'Loop-Ulnar-Group-A',
    bloodType: 'AB-Positive',
    notes: 'Arrested in armed home invasion sting operation. Recovered unlicensed tactical equipment.',
    createdAt: '2026-03-01T15:30:00Z',
    updatedAt: '2026-03-28T18:00:00Z',
    createdBy: 'Officer Marcus Brody',
    linkedCaseIds: ['CASE-2026-0233'],
    linkedArrestIds: ['ARR-2026-0118'],
    linkedComplaintIds: []
  },
  {
    id: 'CR-2026-0177',
    nationalId: 'ID-1084-IL',
    firstName: 'Maya',
    lastName: 'Lin',
    aliases: ['Jade'],
    dateOfBirth: '1998-04-12',
    gender: 'Female',
    nationality: 'United States',
    address: '450 Harbor View Road, Building D',
    phone: '+1 (555) 441-2980',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    status: 'Person of Interest',
    riskLevel: 'Low',
    heightCm: 162,
    weightKg: 52,
    eyeColor: 'Dark Brown',
    hairColor: 'Black',
    scarsMarksTattoos: 'Small crescent moon tattoo behind left ear',
    fingerprintClass: 'Plain-Arch-Group-D',
    bloodType: 'A-Negative',
    notes: 'Witnessed jewelry heist transaction; undergoing investigative interview. Cooperating with authorities.',
    createdAt: '2026-03-12T10:00:00Z',
    updatedAt: '2026-03-25T14:10:00Z',
    createdBy: 'Detective Sarah Jenkins',
    linkedCaseIds: ['CASE-2026-0233'],
    linkedArrestIds: [],
    linkedComplaintIds: []
  }
];

const DEFAULT_CASES: Case[] = [
  {
    id: 'CASE-2026-0142',
    title: 'Operation Iron Vault: Harbor Armory Robbery',
    crimeCategory: 'Armed Robbery',
    priority: 'Critical',
    status: 'Pending Court',
    incidentDate: '2026-01-10T23:45:00Z',
    incidentLocation: 'Pier 42 Maritime Logistics Terminal',
    description: 'Coordinated night assault on a secure high-capacity cargo depot. Tactical explosives and modified automatic rifles deployed. Two security guards hospitalized.',
    primaryInvestigatorId: 'usr-investigator-1',
    primaryInvestigatorName: 'Detective Sarah Jenkins',
    leadOfficerId: 'usr-officer-1',
    leadOfficerName: 'Officer Marcus Brody',
    courtDocketNumber: 'CR-2026-FED-8841',
    courtHearingDate: '2026-11-15T09:00:00Z',
    verdict: 'Indictment handed down; awaiting trial date',
    linkedRecordIds: ['CR-2026-0042'],
    linkedComplaintIds: ['CMP-2026-0512'],
    linkedEvidenceIds: ['EVD-2026-0312', 'EVD-2026-0315'],
    createdAt: '2026-01-11T08:00:00Z',
    updatedAt: '2026-03-24T16:00:00Z',
    createdBy: 'Detective Sarah Jenkins'
  },
  {
    id: 'CASE-2026-0188',
    title: 'Vanguard Securities Multi-State Wire Fraud',
    crimeCategory: 'Financial Fraud',
    priority: 'High',
    status: 'Closed',
    incidentDate: '2025-11-04T12:00:00Z',
    incidentLocation: 'Online / Distributed Banking Nodes',
    description: 'Illicit spoofing of institutional wire requests exceeding $4.2M across 14 municipal credit unions.',
    primaryInvestigatorId: 'usr-investigator-1',
    primaryInvestigatorName: 'Detective Sarah Jenkins',
    leadOfficerId: 'usr-supervisor-1',
    leadOfficerName: 'Captain Raymond Holt',
    courtDocketNumber: 'CR-2025-DIST-3310',
    verdict: 'Guilty Plea Entered - 8 Years Federal Penitentiary',
    linkedRecordIds: ['CR-2026-0089'],
    linkedComplaintIds: [],
    linkedEvidenceIds: ['EVD-2026-0320'],
    createdAt: '2025-11-10T10:00:00Z',
    updatedAt: '2026-02-15T15:30:00Z',
    createdBy: 'Director Elena Vance',
    closedAt: '2026-02-15T15:30:00Z',
    closureReason: 'Conviction secured and sentencing completed'
  },
  {
    id: 'CASE-2026-0210',
    title: 'Metro Power Grid Substation Intrusion',
    crimeCategory: 'Cybercrime',
    priority: 'High',
    status: 'Under Investigation',
    incidentDate: '2026-02-01T03:14:00Z',
    incidentLocation: 'North District SCADA Operations Facility',
    description: 'Unauthorized penetration into municipal telemetry logs via compromised VPN gateway. Command payload intercepted prior to transformer circuit actuation.',
    primaryInvestigatorId: 'usr-investigator-1',
    primaryInvestigatorName: 'Detective Sarah Jenkins',
    leadOfficerId: 'usr-officer-1',
    leadOfficerName: 'Officer Marcus Brody',
    linkedRecordIds: ['CR-2026-0112'],
    linkedComplaintIds: ['CMP-2026-0604'],
    linkedEvidenceIds: ['EVD-2026-0328'],
    createdAt: '2026-02-02T09:00:00Z',
    updatedAt: '2026-03-29T11:45:00Z',
    createdBy: 'Detective Sarah Jenkins'
  },
  {
    id: 'CASE-2026-0233',
    title: 'Midtown Jewelry Exchange Aggravated Burglary',
    crimeCategory: 'Burglary & Theft',
    priority: 'Critical',
    status: 'Under Investigation',
    incidentDate: '2026-02-28T21:10:00Z',
    incidentLocation: '400 Diamond Row, Suite 100',
    description: 'Breach of reinforced vault door using diamond-tipped thermal lance. Uncut gemstones valued at $1.8M stolen. Alarm sensors bypassed.',
    primaryInvestigatorId: 'usr-investigator-1',
    primaryInvestigatorName: 'Detective Sarah Jenkins',
    leadOfficerId: 'usr-officer-1',
    leadOfficerName: 'Officer Marcus Brody',
    linkedRecordIds: ['CR-2026-0145', 'CR-2026-0177'],
    linkedComplaintIds: [],
    linkedEvidenceIds: ['EVD-2026-0335', 'EVD-2026-0340'],
    createdAt: '2026-03-01T06:30:00Z',
    updatedAt: '2026-03-27T14:20:00Z',
    createdBy: 'Officer Marcus Brody'
  },
  {
    id: 'CASE-2026-0255',
    title: 'Riverside Corridor Narcotics Distribution Hub',
    crimeCategory: 'Narcotics & Smuggling',
    priority: 'Medium',
    status: 'Under Review',
    incidentDate: '2026-03-10T19:00:00Z',
    incidentLocation: 'Abandoned Barge Facility, Slip 18',
    description: 'Surveillance operation confirmed offloading of illicit synthetic opioids. Search warrant in progress with District Court magistrate.',
    primaryInvestigatorId: 'usr-investigator-1',
    primaryInvestigatorName: 'Detective Sarah Jenkins',
    leadOfficerId: 'usr-supervisor-1',
    leadOfficerName: 'Captain Raymond Holt',
    linkedRecordIds: [],
    linkedComplaintIds: [],
    linkedEvidenceIds: [],
    createdAt: '2026-03-11T13:00:00Z',
    updatedAt: '2026-03-28T09:15:00Z',
    createdBy: 'Captain Raymond Holt'
  }
];

const DEFAULT_ARRESTS: Arrest[] = [
  {
    id: 'ARR-2026-0091',
    recordId: 'CR-2026-0042',
    suspectName: 'Victor Kozlov',
    caseId: 'CASE-2026-0142',
    caseTitle: 'Operation Iron Vault: Harbor Armory Robbery',
    arrestDate: '2026-01-14T04:30:00Z',
    arrestLocation: 'Highway 9 Southbound Rest Stop',
    arrestingOfficerId: 'usr-officer-1',
    arrestingOfficerName: 'Officer Marcus Brody',
    arrestingOfficerBadge: 'PO-4482',
    statutoryCharges: ['Penal Code §211 - Armed Robbery', 'Penal Code §182 - Criminal Conspiracy', 'Penal Code §245 - Assault with Deadly Weapon'],
    warrantNumber: 'WRNT-2026-8809',
    mirandaRightsRead: true,
    mirandaReadTime: '2026-01-14T04:34:00Z',
    bailAmount: 750000,
    status: 'Remanded',
    detentionFacility: 'County High Security Detention Complex',
    cellNumber: 'Wing C, Cell 14',
    notes: 'Suspect attempted to discard encrypted satellite telephone upon vehicle stop. No physical injuries reported.',
    createdAt: '2026-01-14T06:00:00Z',
    updatedAt: '2026-01-14T06:00:00Z'
  },
  {
    id: 'ARR-2026-0105',
    recordId: 'CR-2026-0089',
    suspectName: 'Dominic Moretti',
    caseId: 'CASE-2026-0188',
    caseTitle: 'Vanguard Securities Multi-State Wire Fraud',
    arrestDate: '2025-11-20T14:15:00Z',
    arrestLocation: 'Metro International Airport - Terminal 2 Gate 18',
    arrestingOfficerId: 'usr-officer-1',
    arrestingOfficerName: 'Officer Marcus Brody',
    arrestingOfficerBadge: 'PO-4482',
    statutoryCharges: ['Title 18 U.S.C. §1343 - Wire Fraud', 'Title 18 U.S.C. §1956 - Money Laundering'],
    warrantNumber: 'FED-WRNT-5521',
    mirandaRightsRead: true,
    mirandaReadTime: '2025-11-20T14:18:00Z',
    bailAmount: 500000,
    status: 'In Custody',
    detentionFacility: 'Federal Transfer Center',
    notes: 'Booked with multiple forged international passports and bearer bonds.',
    createdAt: '2025-11-20T16:00:00Z',
    updatedAt: '2025-11-20T16:00:00Z'
  },
  {
    id: 'ARR-2026-0118',
    recordId: 'CR-2026-0145',
    suspectName: 'Devon Cross',
    caseId: 'CASE-2026-0233',
    caseTitle: 'Midtown Jewelry Exchange Aggravated Burglary',
    arrestDate: '2026-03-02T01:20:00Z',
    arrestLocation: '310 Industrial Way, Warehouse 9',
    arrestingOfficerId: 'usr-officer-1',
    arrestingOfficerName: 'Officer Marcus Brody',
    arrestingOfficerBadge: 'PO-4482',
    statutoryCharges: ['Penal Code §459 - Commercial Burglary', 'Penal Code §496 - Receiving Stolen Property'],
    mirandaRightsRead: true,
    mirandaReadTime: '2026-03-02T01:25:00Z',
    bailAmount: 250000,
    status: 'In Custody',
    detentionFacility: 'Central City Jail',
    cellNumber: 'Detention Block 3',
    notes: 'Surrendered without resistance when SWAT breach team entered premises.',
    createdAt: '2026-03-02T03:00:00Z',
    updatedAt: '2026-03-02T03:00:00Z'
  }
];

const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-2026-0512',
    complainantName: 'Harrison Ford Logistics (Rep: Arthur Pendelton)',
    complainantPhone: '+1 (555) 392-1002',
    complainantEmail: 'security@maritimelogistics.corp',
    complainantAddress: 'Pier 42 Maritime Logistics Terminal',
    category: 'Theft / Loss',
    priority: 'Urgent',
    status: 'Converted to Case',
    incidentDate: '2026-01-10T23:50:00Z',
    incidentLocation: 'Pier 42 Terminal Gate',
    description: 'Reporting heavy gunfire, perimeter breach, and robbery of military-spec security shipments.',
    assignedOfficerId: 'usr-officer-1',
    assignedOfficerName: 'Officer Marcus Brody',
    linkedCaseId: 'CASE-2026-0142',
    linkedRecordId: 'CR-2026-0042',
    internalNotes: 'Escalated immediately to CID and tactical command. Transferred to Case CASE-2026-0142.',
    resolutionSummary: 'Formally merged into felony case filing.',
    createdAt: '2026-01-11T00:15:00Z',
    updatedAt: '2026-01-11T08:00:00Z'
  },
  {
    id: 'CMP-2026-0604',
    complainantName: 'Dr. Evelyn Carter',
    complainantPhone: '+1 (555) 773-1992',
    complainantEmail: 'e.carter@metropowermunicipal.org',
    complainantAddress: '100 North Grid Road',
    category: 'Cyber Harassment',
    priority: 'High',
    status: 'Converted to Case',
    incidentDate: '2026-02-01T04:00:00Z',
    incidentLocation: 'North Substation Infrastructure',
    description: 'Extortion demand email received on Chief Engineer terminal demanding 15 Bitcoin or threatening rolling brownouts.',
    assignedOfficerId: 'usr-investigator-1',
    assignedOfficerName: 'Detective Sarah Jenkins',
    linkedCaseId: 'CASE-2026-0210',
    linkedRecordId: 'CR-2026-0112',
    internalNotes: 'Origin IP trace routed through Tor exit node. Header forensic dump linked to CASE-2026-0210.',
    createdAt: '2026-02-01T06:00:00Z',
    updatedAt: '2026-02-02T09:00:00Z'
  },
  {
    id: 'CMP-2026-0789',
    complainantName: 'Eleanor Vance-Sims',
    complainantPhone: '+1 (555) 492-3110',
    complainantEmail: 'eleanor.vs@gmail.com',
    complainantAddress: '550 Maple Street, Apt 4',
    category: 'Suspicious Activity',
    priority: 'Medium',
    status: 'In Progress',
    incidentDate: '2026-03-25T20:30:00Z',
    incidentLocation: 'Alleyway adjacent to Maple & 6th',
    description: 'Dark-tinted van idling nightly with license plates covered in electrical tape. Individuals seen photographing bank branch back door.',
    assignedOfficerId: 'usr-officer-1',
    assignedOfficerName: 'Officer Marcus Brody',
    internalNotes: 'Patrol cruiser dispatched to conduct license plate check. Area added to scheduled night surveillance grid.',
    createdAt: '2026-03-26T08:15:00Z',
    updatedAt: '2026-03-26T10:00:00Z'
  },
  {
    id: 'CMP-2026-0810',
    complainantName: 'Marcus Gable',
    complainantPhone: '+1 (555) 882-9941',
    complainantAddress: '14 Elm Creek Lane',
    category: 'Noise / Disturbance',
    priority: 'Low',
    status: 'Resolved',
    incidentDate: '2026-03-22T23:00:00Z',
    incidentLocation: '18 Elm Creek Lane',
    description: 'Excessive late night commercial vehicle unloading noise during restricted municipal quiet hours.',
    assignedOfficerId: 'usr-officer-1',
    assignedOfficerName: 'Officer Marcus Brody',
    internalNotes: 'Warning citation issued to tenant. Sound decibel testing verified compliant after warning.',
    resolutionSummary: 'Tenant agreed to move loading hours to daylight schedule. Matter resolved peacefully.',
    createdAt: '2026-03-23T01:00:00Z',
    updatedAt: '2026-03-23T04:30:00Z'
  }
];

const DEFAULT_EVIDENCE: Evidence[] = [
  {
    id: 'EVD-2026-0312',
    caseId: 'CASE-2026-0142',
    caseTitle: 'Operation Iron Vault: Harbor Armory Robbery',
    category: 'Weapon',
    description: 'Modified Colt M4 Carbine 5.56mm with obliterated serial number and silencer attachment.',
    collectionDate: '2026-01-11T02:30:00Z',
    collectingOfficerId: 'usr-officer-1',
    collectingOfficerName: 'Officer Marcus Brody',
    collectingOfficerBadge: 'PO-4482',
    storageLocker: 'Vault Alpha, Rack 4, Lockbox 12',
    status: 'In Storage Locker',
    barcodeRef: 'EVD-BARCODE-994102',
    notes: 'Ballistics report confirmed match to projectile extracted from pier guard booth pillar.',
    fileAttachment: {
      name: 'ballistics_report_m4_carbine.pdf',
      type: 'application/pdf',
      sizeBytes: 2450000,
      url: 'https://example.com/evidence/classified/m4_ballistics.pdf',
      isClassified: true
    },
    custodyHistory: [
      {
        id: 'CUST-001',
        evidenceId: 'EVD-2026-0312',
        timestamp: '2026-01-11T02:30:00Z',
        actingUserId: 'usr-officer-1',
        actingUserName: 'Officer Marcus Brody',
        actingUserBadge: 'PO-4482',
        action: 'Collected',
        fromLocation: 'Pier 42 Maritime Terminal - Crane 3 Base',
        toLocation: 'Precinct 4 Mobile Evidence Van',
        purpose: 'Initial scene recovery and securing lethal evidence',
        authorizedBy: 'Captain Raymond Holt'
      },
      {
        id: 'CUST-002',
        evidenceId: 'EVD-2026-0312',
        timestamp: '2026-01-11T05:00:00Z',
        actingUserId: 'usr-investigator-1',
        actingUserName: 'Detective Sarah Jenkins',
        actingUserBadge: 'INV-1092',
        action: 'Transferred',
        fromLocation: 'Precinct 4 Mobile Evidence Van',
        toLocation: 'State Police Ballistics Forensics Laboratory',
        purpose: 'Rifling striation analysis and serial restoration',
        authorizedBy: 'Detective Sarah Jenkins'
      },
      {
        id: 'CUST-003',
        evidenceId: 'EVD-2026-0312',
        timestamp: '2026-01-18T14:00:00Z',
        actingUserId: 'usr-investigator-1',
        actingUserName: 'Detective Sarah Jenkins',
        actingUserBadge: 'INV-1092',
        action: 'Returned to Storage',
        fromLocation: 'State Police Ballistics Forensics Laboratory',
        toLocation: 'Central Evidence Vault Alpha, Rack 4, Lockbox 12',
        purpose: 'Secure retention pending District Court hearing',
        authorizedBy: 'Director Elena Vance'
      }
    ],
    createdAt: '2026-01-11T03:00:00Z',
    updatedAt: '2026-01-18T14:10:00Z'
  },
  {
    id: 'EVD-2026-0315',
    caseId: 'CASE-2026-0142',
    caseTitle: 'Operation Iron Vault: Harbor Armory Robbery',
    category: 'Digital / Cyber',
    description: 'Black Samsung Galaxy S23 Ultra recovered during Highway 9 rest stop vehicle search.',
    collectionDate: '2026-01-14T04:40:00Z',
    collectingOfficerId: 'usr-officer-1',
    collectingOfficerName: 'Officer Marcus Brody',
    collectingOfficerBadge: 'PO-4482',
    storageLocker: 'Faraday Cage Storage C-02',
    status: 'In Lab Analysis',
    barcodeRef: 'EVD-BARCODE-994119',
    notes: 'Phone placed in Faraday bag immediately. Cyber forensics extracting Signal app encrypted DB.',
    custodyHistory: [
      {
        id: 'CUST-004',
        evidenceId: 'EVD-2026-0315',
        timestamp: '2026-01-14T04:40:00Z',
        actingUserId: 'usr-officer-1',
        actingUserName: 'Officer Marcus Brody',
        actingUserBadge: 'PO-4482',
        action: 'Collected',
        fromLocation: 'Vehicle Glovebox - Lincoln Navigator',
        toLocation: 'Mobile Evidence Lockbox',
        purpose: 'Seizure pursuant to felony search warrant',
        authorizedBy: 'Officer Marcus Brody'
      },
      {
        id: 'CUST-005',
        evidenceId: 'EVD-2026-0315',
        timestamp: '2026-01-15T09:00:00Z',
        actingUserId: 'usr-investigator-1',
        actingUserName: 'Detective Sarah Jenkins',
        actingUserBadge: 'INV-1092',
        action: 'Checked Out for Lab',
        fromLocation: 'Faraday Cage Storage C-02',
        toLocation: 'Cyber Forensics Unit - Terminal 4',
        purpose: 'JTAG physical chip-off extraction',
        authorizedBy: 'Detective Sarah Jenkins'
      }
    ],
    createdAt: '2026-01-14T06:30:00Z',
    updatedAt: '2026-01-15T09:15:00Z'
  },
  {
    id: 'EVD-2026-0320',
    caseId: 'CASE-2026-0188',
    caseTitle: 'Vanguard Securities Multi-State Wire Fraud',
    category: 'Documentary',
    description: 'Certified financial ledgers and ledger hard drives documenting 38 wire transactions totaling $4.2M.',
    collectionDate: '2025-11-15T10:00:00Z',
    collectingOfficerId: 'usr-investigator-1',
    collectingOfficerName: 'Detective Sarah Jenkins',
    collectingOfficerBadge: 'INV-1092',
    storageLocker: 'Archive Chamber 2, Shelf 8',
    status: 'Presented in Court',
    barcodeRef: 'EVD-BARCODE-881290',
    notes: 'Marked as Prosecution Exhibit 14 in Federal District Court proceedings.',
    custodyHistory: [
      {
        id: 'CUST-006',
        evidenceId: 'EVD-2026-0320',
        timestamp: '2025-11-15T10:00:00Z',
        actingUserId: 'usr-investigator-1',
        actingUserName: 'Detective Sarah Jenkins',
        actingUserBadge: 'INV-1092',
        action: 'Collected',
        fromLocation: 'Vanguard Securities Server Room',
        toLocation: 'CID Evidence Locker',
        purpose: 'Judicial subpoena seizure',
        authorizedBy: 'Federal Magistrate Judge'
      },
      {
        id: 'CUST-007',
        evidenceId: 'EVD-2026-0320',
        timestamp: '2026-02-10T09:30:00Z',
        actingUserId: 'usr-court-1',
        actingUserName: 'Clerk Jonathan Miller',
        actingUserBadge: 'CRT-8819',
        action: 'Presented in Court',
        fromLocation: 'CID Evidence Locker',
        toLocation: 'Federal Courtroom 3B',
        purpose: 'Admitted into trial evidence record',
        authorizedBy: 'Honorable Judge Arthur Stern'
      }
    ],
    createdAt: '2025-11-15T12:00:00Z',
    updatedAt: '2026-02-10T10:00:00Z'
  },
  {
    id: 'EVD-2026-0328',
    caseId: 'CASE-2026-0210',
    caseTitle: 'Metro Power Grid Substation Intrusion',
    category: 'Digital / Cyber',
    description: 'Packet capture pcap dump and forensic RAM image of gateway firewall SCADA-GW-01.',
    collectionDate: '2026-02-02T05:10:00Z',
    collectingOfficerId: 'usr-investigator-1',
    collectingOfficerName: 'Detective Sarah Jenkins',
    collectingOfficerBadge: 'INV-1092',
    storageLocker: 'Digital Repository Secure Drive #3',
    status: 'In Lab Analysis',
    barcodeRef: 'EVD-BARCODE-774012',
    notes: 'Contains cryptographic signatures matching known state-sponsored malware strain.',
    custodyHistory: [
      {
        id: 'CUST-008',
        evidenceId: 'EVD-2026-0328',
        timestamp: '2026-02-02T05:10:00Z',
        actingUserId: 'usr-investigator-1',
        actingUserName: 'Detective Sarah Jenkins',
        actingUserBadge: 'INV-1092',
        action: 'Collected',
        fromLocation: 'North Substation Server Rack',
        toLocation: 'Digital Repository Secure Drive #3',
        purpose: 'Incident response live memory imaging',
        authorizedBy: 'Detective Sarah Jenkins'
      }
    ],
    createdAt: '2026-02-02T06:00:00Z',
    updatedAt: '2026-02-02T06:00:00Z'
  },
  {
    id: 'EVD-2026-0335',
    caseId: 'CASE-2026-0233',
    caseTitle: 'Midtown Jewelry Exchange Aggravated Burglary',
    category: 'Physical',
    description: 'Diamond-tipped oxygen thermal lance assembly and high pressure gas regulator.',
    collectionDate: '2026-03-01T04:15:00Z',
    collectingOfficerId: 'usr-officer-1',
    collectingOfficerName: 'Officer Marcus Brody',
    collectingOfficerBadge: 'PO-4482',
    storageLocker: 'Heavy Equipment Secure Bay 1',
    status: 'In Storage Locker',
    barcodeRef: 'EVD-BARCODE-661902',
    notes: 'Recovered in rear loading alley behind 400 Diamond Row.',
    custodyHistory: [
      {
        id: 'CUST-009',
        evidenceId: 'EVD-2026-0335',
        timestamp: '2026-03-01T04:15:00Z',
        actingUserId: 'usr-officer-1',
        actingUserName: 'Officer Marcus Brody',
        actingUserBadge: 'PO-4482',
        action: 'Collected',
        fromLocation: 'Rear Loading Alley - Diamond Row',
        toLocation: 'Heavy Equipment Secure Bay 1',
        purpose: 'Burglary tool seizure and trace swab',
        authorizedBy: 'Officer Marcus Brody'
      }
    ],
    createdAt: '2026-03-01T05:00:00Z',
    updatedAt: '2026-03-01T05:00:00Z'
  }
];

const DEFAULT_NOTES: InvestigationNote[] = [
  {
    id: 'NOTE-001',
    caseId: 'CASE-2026-0142',
    officerId: 'usr-investigator-1',
    officerName: 'Detective Sarah Jenkins',
    officerRank: 'Detective First Grade',
    note: 'Interrogated night terminal watchman. Guard confirmed suspects had specific interior access codes to warehouse Bay 9.',
    isConfidential: true,
    createdAt: '2026-01-12T16:30:00Z'
  },
  {
    id: 'NOTE-002',
    caseId: 'CASE-2026-0142',
    officerId: 'usr-investigator-1',
    officerName: 'Detective Sarah Jenkins',
    officerRank: 'Detective First Grade',
    note: 'Ballistics report confirmed Colt M4 rifle serial matches smuggled shipment reported in Interpol Red Notice.',
    isConfidential: false,
    createdAt: '2026-01-19T11:00:00Z'
  },
  {
    id: 'NOTE-003',
    caseId: 'CASE-2026-0210',
    officerId: 'usr-investigator-1',
    officerName: 'Detective Sarah Jenkins',
    officerRank: 'Detective First Grade',
    note: 'Cyber unit extracted SSH keypair from suspect Kassandra Vane personal rig matching SSH signature logged in SCADA telemetry.',
    isConfidential: true,
    createdAt: '2026-02-15T14:15:00Z'
  }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-9910',
    timestamp: '2026-03-29T11:45:00Z',
    userId: 'usr-investigator-1',
    userName: 'Detective Sarah Jenkins',
    userRole: 'Investigator',
    userBadge: 'INV-1092',
    action: 'CASE_NOTE_CREATE',
    resourceType: 'Case',
    resourceId: 'CASE-2026-0210',
    resourceTitle: 'Metro Power Grid Substation Intrusion',
    status: 'Success',
    ipAddress: '10.240.12.84',
    details: 'Appended confidential forensic findings note to active investigation file.'
  },
  {
    id: 'AUD-9909',
    timestamp: '2026-03-28T18:00:00Z',
    userId: 'usr-officer-1',
    userName: 'Officer Marcus Brody',
    userRole: 'Police Officer',
    userBadge: 'PO-4482',
    action: 'RECORD_UPDATE',
    resourceType: 'CriminalRecord',
    resourceId: 'CR-2026-0145',
    resourceTitle: 'Devon Cross',
    status: 'Success',
    ipAddress: '10.240.14.12',
    details: 'Updated status to Arrested following tactical warrant execution.'
  },
  {
    id: 'AUD-9908',
    timestamp: '2026-03-27T14:20:00Z',
    userId: 'usr-supervisor-1',
    userName: 'Captain Raymond Holt',
    userRole: 'Supervisor',
    userBadge: 'SUP-0210',
    action: 'CASE_WORKFLOW_APPROVE',
    resourceType: 'Case',
    resourceId: 'CASE-2026-0233',
    resourceTitle: 'Midtown Jewelry Exchange Aggravated Burglary',
    status: 'Success',
    ipAddress: '10.240.10.1',
    details: 'Approved escalation of case to Major Crimes priority.'
  },
  {
    id: 'AUD-9907',
    timestamp: '2026-03-26T10:00:00Z',
    userId: 'usr-officer-1',
    userName: 'Officer Marcus Brody',
    userRole: 'Police Officer',
    userBadge: 'PO-4482',
    action: 'COMPLAINT_UPDATE',
    resourceType: 'Complaint',
    resourceId: 'CMP-2026-0789',
    resourceTitle: 'Eleanor Vance-Sims',
    status: 'Success',
    ipAddress: '10.240.14.12',
    details: 'Assigned patrol officer and logged surveillance status.'
  },
  {
    id: 'AUD-9906',
    timestamp: '2026-03-25T14:10:00Z',
    userId: 'usr-investigator-1',
    userName: 'Detective Sarah Jenkins',
    userRole: 'Investigator',
    userBadge: 'INV-1092',
    action: 'RECORD_CREATE',
    resourceType: 'CriminalRecord',
    resourceId: 'CR-2026-0177',
    resourceTitle: 'Maya Lin',
    status: 'Success',
    ipAddress: '10.240.12.84',
    details: 'Registered Person of Interest record connected to Jewelry Exchange incident.'
  },
  {
    id: 'AUD-9905',
    timestamp: '2026-03-24T16:00:00Z',
    userId: 'usr-admin-1',
    userName: 'Director Elena Vance',
    userRole: 'Administrator',
    userBadge: 'ADM-001',
    action: 'REPORT_EXPORT',
    resourceType: 'ReportExport',
    resourceId: 'RPT-MONTHLY-Q1',
    resourceTitle: 'Quarterly Law Enforcement Clearance Report',
    status: 'Success',
    ipAddress: '10.240.10.2',
    details: 'Exported certified executive felony breakdown report to CSV/PDF.'
  },
  {
    id: 'AUD-9904',
    timestamp: '2026-03-23T04:30:00Z',
    userId: 'usr-officer-1',
    userName: 'Officer Marcus Brody',
    userRole: 'Police Officer',
    userBadge: 'PO-4482',
    action: 'COMPLAINT_RESOLVE',
    resourceType: 'Complaint',
    resourceId: 'CMP-2026-0810',
    resourceTitle: 'Marcus Gable',
    status: 'Success',
    ipAddress: '10.240.14.12',
    details: 'Resolved noise complaint with tenant remediation.'
  },
  {
    id: 'AUD-9903',
    timestamp: '2026-03-20T10:15:00Z',
    userId: 'usr-admin-1',
    userName: 'Director Elena Vance',
    userRole: 'Administrator',
    userBadge: 'ADM-001',
    action: 'RECORD_UPDATE',
    resourceType: 'CriminalRecord',
    resourceId: 'CR-2026-0042',
    resourceTitle: 'Victor Kozlov',
    status: 'Success',
    ipAddress: '10.240.10.2',
    details: 'Updated flight risk classification to Extreme.'
  },
  {
    id: 'AUD-9902',
    timestamp: '2026-03-15T09:20:00Z',
    userId: 'usr-investigator-1',
    userName: 'Detective Sarah Jenkins',
    userRole: 'Investigator',
    userBadge: 'INV-1092',
    action: 'EVIDENCE_TRANSFER',
    resourceType: 'Evidence',
    resourceId: 'EVD-2026-0315',
    resourceTitle: 'Samsung Galaxy S23 Ultra',
    status: 'Success',
    ipAddress: '10.240.12.84',
    details: 'Logged chain of custody checkout to Cyber Forensics Unit.'
  },
  {
    id: 'AUD-9901',
    timestamp: '2026-03-01T10:00:00Z',
    userId: 'usr-court-1',
    userName: 'Clerk Jonathan Miller',
    userRole: 'Court Official',
    userBadge: 'CRT-8819',
    action: 'USER_LOGIN',
    resourceType: 'User',
    resourceId: 'usr-court-1',
    resourceTitle: 'Clerk Jonathan Miller',
    status: 'Success',
    ipAddress: '10.240.20.14',
    details: 'Successful authenticated session initiated from District Court branch.'
  }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    userId: 'usr-investigator-1',
    title: 'Pre-Trial Hearing Scheduled',
    message: 'District Court hearing set for Case CASE-2026-0142 on Nov 15, 2026.',
    type: 'deadline',
    timestamp: '2026-03-28T10:00:00Z',
    isRead: false,
    link: '/cases/CASE-2026-0142'
  },
  {
    id: 'NOTIF-02',
    userId: 'usr-investigator-1',
    title: 'Evidence Forensics Completed',
    message: 'Ballistics report ready for Colt Carbine (EVD-2026-0312).',
    type: 'custody',
    timestamp: '2026-03-27T16:20:00Z',
    isRead: false,
    link: '/evidence/EVD-2026-0312'
  },
  {
    id: 'NOTIF-03',
    userId: 'usr-officer-1',
    title: 'New Complaint Assigned',
    message: 'Suspicious vehicle report CMP-2026-0789 assigned to Sector 4 patrol.',
    type: 'assignment',
    timestamp: '2026-03-26T08:20:00Z',
    isRead: true,
    link: '/complaints'
  },
  {
    id: 'NOTIF-04',
    userId: 'usr-supervisor-1',
    title: 'Warrant Execution Completed',
    message: 'Suspect Devon Cross detained under Case CASE-2026-0233.',
    type: 'status_change',
    timestamp: '2026-03-02T03:30:00Z',
    isRead: false,
    link: '/cases/CASE-2026-0233'
  }
];

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'TSK-101',
    assignedToId: 'usr-investigator-1',
    assignedToName: 'Detective Sarah Jenkins',
    title: 'Submit Grand Jury Evidence Packet',
    description: 'Compile ballistics match certificates and witness affidavits for Harbor Robbery trial.',
    priority: 'Critical',
    dueDate: '2026-10-30',
    isCompleted: false,
    relatedCaseId: 'CASE-2026-0142',
    createdAt: '2026-03-20T10:00:00Z'
  },
  {
    id: 'TSK-102',
    assignedToId: 'usr-investigator-1',
    assignedToName: 'Detective Sarah Jenkins',
    title: 'Decrypt SCADA Telemetry Logs',
    description: 'Coordinate with Cyber Division on decryption keys for Substation breach pcap.',
    priority: 'High',
    dueDate: '2026-10-25',
    isCompleted: false,
    relatedCaseId: 'CASE-2026-0210',
    createdAt: '2026-03-22T14:00:00Z'
  },
  {
    id: 'TSK-103',
    assignedToId: 'usr-officer-1',
    assignedToName: 'Officer Marcus Brody',
    title: 'Conduct Night Patrol on 6th & Maple',
    description: 'Check license plate tags in commercial alleyway per complaint CMP-2026-0789.',
    priority: 'Medium',
    dueDate: '2026-10-18',
    isCompleted: true,
    createdAt: '2026-03-26T09:00:00Z'
  },
  {
    id: 'TSK-104',
    assignedToId: 'usr-supervisor-1',
    assignedToName: 'Captain Raymond Holt',
    title: 'Review Monthly CID Clearance Metrics',
    description: 'Verify quarterly audit report figures before State Police oversight submission.',
    priority: 'Medium',
    dueDate: '2026-10-31',
    isCompleted: false,
    createdAt: '2026-03-25T11:00:00Z'
  }
];

const DEFAULT_REPORTS: ReportRecord[] = [
  {
    id: 'RPT-2026-001',
    reportType: 'cases_summary',
    title: 'Metropolitan Case Clearance & Felony Audit Report',
    subtitle: 'Classified felony intake, judicial dispositions, and clearance velocity docket',
    category: 'Case Clearance & Prosecution',
    department: 'Major Crimes & Criminal Investigation Division (CID)',
    status: 'Certified Official',
    benchmarkGoal: 65,
    dateRange: '90',
    summary: 'Comprehensive quarterly assessment of active and closed felony caseload across Metropolitan District 4. Clearance rates comply with statutory oversight benchmarks.',
    findings: 'Armed robbery clearances have exceeded projections by 14%. Homicide task forces have successfully cleared 3 major multi-jurisdictional matters. Average case turnaround reduced to 42 days.',
    recommendations: 'Authorize 2 additional senior investigators for digital forensics triage. Streamline prosecutor evidence hand-off packages.',
    confidentialNotes: 'Internal IA review completed without derogatory flags.',
    authorName: 'Director Elena Vance',
    authorBadge: 'ADM-001',
    authorRole: 'Administrator',
    rosterTitle: 'Active and Historical Cases Roster',
    sealText: 'OFFICIAL CRMS SEAL\nDIGITALLY SIGNED & VERIFIED',
    sealReference: 'REF: R7Z78MS6',
    officerSignature: 'Director Elena Vance (Assistant Commissioner)',
    signatureDateBadge: '2026-03-25 / Badge: ADM-001',
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-03-25T10:30:00Z'
  },
  {
    id: 'RPT-2026-002',
    reportType: 'records_summary',
    title: 'Criminal Records Registry & High-Risk Subject Dossier',
    subtitle: 'Comprehensive identity, biometric classification, and threat assessment registry',
    category: 'Intelligence & Records Registry',
    department: 'Central Records & Biometric Registry Bureau',
    status: 'Approved',
    benchmarkGoal: 100,
    dateRange: 'all',
    summary: 'Master repository ledger of registered persons of interest, convicted felons, and active suspects within Metropolitan jurisdiction.',
    findings: 'Extreme-risk subjects are 100% cataloged with biometric fingerprint profiles. No identity mismatch anomalies reported this period.',
    recommendations: 'Mandate semi-annual warrant verification audits for all medium-to-high risk individuals on conditional release.',
    confidentialNotes: 'Biometric hashing verified against National Fingerprint Automated Index.',
    authorName: 'Detective Sarah Jenkins',
    authorBadge: 'INV-1092',
    authorRole: 'Investigator',
    createdAt: '2026-03-05T09:00:00Z',
    updatedAt: '2026-03-20T14:15:00Z'
  },
  {
    id: 'RPT-2026-003',
    reportType: 'officer_workload',
    title: 'Law Enforcement Officer Caseload & Productivity Audit',
    subtitle: 'Operational workload distribution, complaint resolution, and arrest execution metrics',
    category: 'Workload & Personnel Audit',
    department: 'Operations & Supervisory Command',
    status: 'Under Review',
    benchmarkGoal: 80,
    dateRange: '90',
    summary: 'Evaluation of case assignment equity, patrol enforcement actions, and complaint handling among active duty officers and detectives.',
    findings: 'Detective squad case allocation is balanced across senior and junior investigators. Patrol division response latency decreased by 18%.',
    recommendations: 'Reassign secondary complaint intake during peak weekend shifts to the Community Liaison desk.',
    confidentialNotes: 'Shift overtime hours tracked within municipal fiscal allocations.',
    authorName: 'Captain Raymond Holt',
    authorBadge: 'SUP-0210',
    authorRole: 'Supervisor',
    createdAt: '2026-03-10T11:00:00Z',
    updatedAt: '2026-03-22T16:00:00Z'
  },
  {
    id: 'RPT-2026-004',
    reportType: 'evidence_inventory',
    title: 'Evidence Vault Forensic Inventory & Integrity Inspection',
    subtitle: 'Statutory chain of custody compliance and storage security verification',
    category: 'Forensic Vault & Chain of Custody',
    department: 'Forensic Services & Evidence Management Bureau',
    status: 'Certified Official',
    benchmarkGoal: 100,
    dateRange: 'all',
    summary: 'Annual physical and digital inventory verification of all seized narcotics, ballistics, digital media, and weapons in secure vaults.',
    findings: 'Zero chain-of-custody discrepancies detected. All high-caliber weapons accounted for with tamper-evident seals intact.',
    recommendations: 'Upgrade environmental monitoring sensors in Digital Locker #3 and expand refrigeration capacity for biological exhibits.',
    confidentialNotes: 'Chain-of-custody transfer records archived with SHA-256 integrity stamps.',
    authorName: 'Director Elena Vance',
    authorBadge: 'ADM-001',
    authorRole: 'Administrator',
    createdAt: '2026-03-12T13:30:00Z',
    updatedAt: '2026-03-24T09:45:00Z'
  },
  {
    id: 'RPT-2026-005',
    reportType: 'arrests_summary',
    title: 'Custodial Arrests & Booking Facility Log',
    subtitle: 'Warrant executions, statutory charge distributions, and detention intake ledger',
    category: 'Arrest & Custodial Processing',
    department: 'Central Booking & Detention Command',
    status: 'Approved',
    benchmarkGoal: 95,
    dateRange: '30',
    summary: 'Detailed log of all custodial bookings, statutory charges filed, bail determinations, and detention facility assignments.',
    findings: '100% Miranda warnings verified with timestamped officer logs. Average booking intake process clocked at 28 minutes.',
    recommendations: 'Maintain direct coordination with Magistrate Court on weekend bail hearings.',
    confidentialNotes: 'Facility capacity utilization remains below statutory 85% cap.',
    authorName: 'Officer Marcus Brody',
    authorBadge: 'PO-4482',
    authorRole: 'Police Officer',
    createdAt: '2026-03-15T15:00:00Z',
    updatedAt: '2026-03-26T12:00:00Z'
  }
];

// In-memory fallback if localStorage is disabled
let memoryDb: DatabaseState | null = null;

class StorageService {
  private listeners: (() => void)[] = [];

  constructor() {
    this.ensureInitialized();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => {
      try { l(); } catch (e) { console.error('Listener error', e); }
    });
  }

  private ensureInitialized() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.resetToDefaults();
      } else {
        // Validate JSON
        const parsed = JSON.parse(raw);
        if (!parsed.records || !parsed.cases || !parsed.users) {
          this.resetToDefaults();
        }
      }
    } catch {
      this.resetToDefaults();
    }
  }

  public resetToDefaults(): DatabaseState {
    const initialState: DatabaseState = {
      users: DEFAULT_USERS,
      records: DEFAULT_RECORDS,
      cases: DEFAULT_CASES,
      arrests: DEFAULT_ARRESTS,
      complaints: DEFAULT_COMPLAINTS,
      evidence: DEFAULT_EVIDENCE,
      notes: DEFAULT_NOTES,
      auditLogs: DEFAULT_AUDIT_LOGS,
      notifications: DEFAULT_NOTIFICATIONS,
      tasks: DEFAULT_TASKS,
      settings: DEFAULT_SETTINGS,
      reports: DEFAULT_REPORTS
    };
    this.saveState(initialState);
    return initialState;
  }

  public getState(): DatabaseState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.reports || !Array.isArray(parsed.reports) || parsed.reports.length === 0) {
          parsed.reports = DEFAULT_REPORTS;
          this.saveState(parsed);
        }
        return parsed;
      }
    } catch {
      // Ignore
    }
    if (memoryDb) return memoryDb;
    return this.resetToDefaults();
  }

  private saveState(state: DatabaseState) {
    memoryDb = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage save failed, using memory state', e);
    }
    this.notify();
  }

  // ROLE-BASED ACCESS & DATA ISOLATION HELPERS
  // Admin work is isolated: items created by Administrator are NOT visible to regular Users.
  // Regular Users' work is always visible to Administrator (Admin sees everything).
  public isCreatedByAdmin(item: any): boolean {
    if (!item) return false;
    if (item.createdByRole === 'Administrator') return true;
    if (item.userRole === 'Administrator') return true;
    if (item.createdById === 'usr-admin-1') return true;
    const author = (
      item.createdBy ||
      item.userName ||
      item.arrestingOfficerName ||
      item.collectingOfficerName ||
      item.assignedOfficerName ||
      ''
    ).toLowerCase();
    if (author.includes('director') || author.includes('elena vance') || author.includes('admin')) {
      return true;
    }
    return false;
  }

  public isVisibleToUser(item: any, user: User | null | undefined): boolean {
    // Administrator sees EVERYTHING (all users' work + admin's own work)
    if (!user || user.role === 'Administrator') {
      return true;
    }
    // Regular User (Police Officer / user):
    // Admin ka sara kaam user ki taraf show NA ho!
    if (this.isCreatedByAdmin(item)) {
      return false;
    }
    return true;
  }

  public getFilteredState(user?: User | null): DatabaseState {
    const full = this.getState();
    if (!user || user.role === 'Administrator') {
      return full;
    }
    return {
      ...full,
      records: full.records.filter(r => this.isVisibleToUser(r, user)),
      cases: full.cases.filter(c => this.isVisibleToUser(c, user)),
      arrests: full.arrests.filter(a => this.isVisibleToUser(a, user)),
      complaints: full.complaints.filter(cm => this.isVisibleToUser(cm, user)),
      evidence: full.evidence.filter(e => this.isVisibleToUser(e, user)),
      notes: full.notes.filter(n => this.isVisibleToUser(n, user)),
      tasks: full.tasks.filter(t => this.isVisibleToUser(t, user)),
      auditLogs: full.auditLogs.filter(al => this.isVisibleToUser(al, user)),
    };
  }

  // AUDIT LOGGING
  public logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
    const state = this.getState();
    const newLog: AuditLog = {
      ...entry,
      id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString()
    };
    state.auditLogs = [newLog, ...state.auditLogs];
    this.saveState(state);
    return newLog;
  }

  // USERS
  public getUsers(): User[] {
    return this.getState().users;
  }

  public getUserById(id: string): User | undefined {
    return this.getState().users.find(u => u.id === id);
  }

  public saveUser(user: User, actingUser?: User): User {
    const state = this.getState();
    const idx = state.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      state.users[idx] = user;
    } else {
      state.users.push(user);
    }
    this.saveState(state);

    if (actingUser) {
      this.logAudit({
        userId: actingUser.id,
        userName: actingUser.name,
        userRole: actingUser.role,
        userBadge: actingUser.badgeNumber,
        action: idx >= 0 ? 'USER_UPDATE' : 'USER_CREATE',
        resourceType: 'User',
        resourceId: user.id,
        resourceTitle: user.name,
        status: 'Success',
        ipAddress: '10.240.10.1',
        details: `Saved profile for ${user.name} (${user.role}).`
      });
    }

    return user;
  }

  public deleteUser(userId: string, actingUser: User): boolean {
    const state = this.getState();
    const target = state.users.find(u => u.id === userId);
    if (!target) return false;
    state.users = state.users.filter(u => u.id !== userId);
    this.saveState(state);
    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: 'USER_DELETE',
      resourceType: 'User',
      resourceId: userId,
      resourceTitle: target.name,
      status: 'Success',
      ipAddress: '10.240.10.1',
      details: `Deleted user account for ${target.name} (${target.badgeNumber}).`
    });
    this.notify();
    return true;
  }

  // CRIMINAL RECORDS
  public getRecords(user?: User | null): CriminalRecord[] {
    const records = this.getState().records;
    if (!user || user.role === 'Administrator') return records;
    return records.filter(r => this.isVisibleToUser(r, user));
  }

  public getRecordById(id: string): CriminalRecord | undefined {
    return this.getState().records.find(r => r.id === id);
  }

  public saveRecord(record: Partial<CriminalRecord> & { firstName: string; lastName: string }, actingUser: User): CriminalRecord {
    const state = this.getState();
    const now = new Date().toISOString();
    let saved: CriminalRecord;

    if (record.id) {
      const idx = state.records.findIndex(r => r.id === record.id);
      if (idx >= 0) {
        saved = {
          ...state.records[idx],
          ...record,
          updatedAt: now
        } as CriminalRecord;
        state.records[idx] = saved;
      } else {
        saved = {
          ...record,
          id: record.id,
          createdAt: now,
          updatedAt: now,
          createdBy: actingUser.name,
          createdById: actingUser.id,
          createdByRole: actingUser.role,
          linkedCaseIds: record.linkedCaseIds || [],
          linkedArrestIds: record.linkedArrestIds || [],
          linkedComplaintIds: record.linkedComplaintIds || []
        } as CriminalRecord;
        state.records.push(saved);
      }
    } else {
      const year = new Date().getFullYear();
      const num = String(state.records.length + 43).padStart(4, '0');
      const generatedId = `CR-${year}-${num}`;

      saved = {
        nationalId: record.nationalId || `ID-${Math.floor(1000 + Math.random() * 9000)}-REG`,
        aliases: record.aliases || [],
        dateOfBirth: record.dateOfBirth || '1990-01-01',
        gender: record.gender || 'Male',
        nationality: record.nationality || 'United States',
        address: record.address || 'Address unverified',
        phone: record.phone || '',
        photoUrl: record.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
        status: record.status || 'Suspect',
        riskLevel: record.riskLevel || 'Medium',
        heightCm: record.heightCm || 175,
        weightKg: record.weightKg || 75,
        eyeColor: record.eyeColor || 'Brown',
        hairColor: record.hairColor || 'Black',
        scarsMarksTattoos: record.scarsMarksTattoos || 'None reported',
        notes: record.notes || '',
        ...record,
        id: generatedId,
        createdAt: now,
        updatedAt: now,
        createdBy: actingUser.name,
        createdById: actingUser.id,
        createdByRole: actingUser.role,
        linkedCaseIds: record.linkedCaseIds || [],
        linkedArrestIds: record.linkedArrestIds || [],
        linkedComplaintIds: record.linkedComplaintIds || []
      } as CriminalRecord;
      state.records.unshift(saved);
    }

    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: record.id ? 'RECORD_UPDATE' : 'RECORD_CREATE',
      resourceType: 'CriminalRecord',
      resourceId: saved.id,
      resourceTitle: `${saved.firstName} ${saved.lastName}`,
      status: 'Success',
      ipAddress: '10.240.14.88',
      details: `${record.id ? 'Updated' : 'Registered new'} criminal record for ${saved.firstName} ${saved.lastName} [${saved.status}].`
    });

    return saved;
  }

  public deleteRecord(recordId: string, actingUser: User): boolean {
    const state = this.getState();
    const item = state.records.find(r => r.id === recordId);
    if (!item) return false;

    state.records = state.records.filter(r => r.id !== recordId);
    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: 'RECORD_DELETE',
      resourceType: 'CriminalRecord',
      resourceId: recordId,
      resourceTitle: `${item.firstName} ${item.lastName}`,
      status: 'Success',
      ipAddress: '10.240.10.2',
      details: `Expunged/deleted criminal record for ${item.firstName} ${item.lastName}.`
    });

    return true;
  }

  // CASES
  public getCases(user?: User | null): Case[] {
    const cases = this.getState().cases;
    if (!user || user.role === 'Administrator') return cases;
    return cases.filter(c => this.isVisibleToUser(c, user));
  }

  public getCaseById(id: string): Case | undefined {
    return this.getState().cases.find(c => c.id === id);
  }

  public saveCase(caseData: Partial<Case> & { title: string }, actingUser: User): Case {
    const state = this.getState();
    const now = new Date().toISOString();
    let saved: Case;

    if (caseData.id) {
      const idx = state.cases.findIndex(c => c.id === caseData.id);
      if (idx >= 0) {
        saved = {
          ...state.cases[idx],
          ...caseData,
          updatedAt: now
        } as Case;
        state.cases[idx] = saved;
      } else {
        saved = {
          ...caseData,
          id: caseData.id,
          createdAt: now,
          updatedAt: now,
          createdBy: actingUser.name,
          createdById: actingUser.id,
          createdByRole: actingUser.role,
          linkedRecordIds: caseData.linkedRecordIds || [],
          linkedComplaintIds: caseData.linkedComplaintIds || [],
          linkedEvidenceIds: caseData.linkedEvidenceIds || []
        } as Case;
        state.cases.push(saved);
      }
    } else {
      const year = new Date().getFullYear();
      const num = String(state.cases.length + 260).padStart(4, '0');
      const generatedId = `CASE-${year}-${num}`;

      saved = {
        crimeCategory: 'Burglary & Theft',
        priority: 'Medium',
        status: 'Registered',
        incidentDate: now,
        incidentLocation: 'Metro City jurisdiction',
        description: '',
        primaryInvestigatorId: actingUser.id,
        primaryInvestigatorName: actingUser.name,
        leadOfficerId: actingUser.id,
        leadOfficerName: actingUser.name,
        linkedRecordIds: [],
        linkedComplaintIds: [],
        linkedEvidenceIds: [],
        ...caseData,
        id: generatedId,
        createdAt: now,
        updatedAt: now,
        createdBy: actingUser.name,
        createdById: actingUser.id,
        createdByRole: actingUser.role
      } as Case;
      state.cases.unshift(saved);
    }

    // Auto-link reciprocally to linked criminal records
    if (saved.linkedRecordIds && saved.linkedRecordIds.length > 0) {
      state.records.forEach(r => {
        if (saved.linkedRecordIds.includes(r.id) && !r.linkedCaseIds.includes(saved.id)) {
          r.linkedCaseIds.push(saved.id);
        }
      });
    }

    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: caseData.id ? 'CASE_UPDATE' : 'CASE_CREATE',
      resourceType: 'Case',
      resourceId: saved.id,
      resourceTitle: saved.title,
      status: 'Success',
      ipAddress: '10.240.12.84',
      details: `${caseData.id ? 'Updated' : 'Opened new'} case "${saved.title}" [Status: ${saved.status}].`
    });

    return saved;
  }

  public deleteCase(caseId: string, actingUser: User): boolean {
    const state = this.getState();
    const item = state.cases.find(c => c.id === caseId);
    if (!item) return false;

    state.cases = state.cases.filter(c => c.id !== caseId);
    state.records.forEach(r => {
      r.linkedCaseIds = r.linkedCaseIds.filter(id => id !== caseId);
    });
    state.notes = state.notes.filter(n => n.caseId !== caseId);
    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: 'CASE_DELETE',
      resourceType: 'Case',
      resourceId: caseId,
      resourceTitle: item.title,
      status: 'Success',
      ipAddress: '10.240.10.1',
      details: `Expunged/deleted case docket "${item.title}" (${caseId}).`
    });
    return true;
  }

  // INVESTIGATION NOTES
  public getNotesForCase(caseId: string, user?: User | null): InvestigationNote[] {
    const notes = this.getState().notes.filter(n => n.caseId === caseId);
    if (!user || user.role === 'Administrator') return notes;
    return notes.filter(n => this.isVisibleToUser(n, user));
  }

  public addInvestigationNote(caseId: string, noteText: string, isConfidential: boolean, actingUser: User): InvestigationNote {
    const state = this.getState();
    const note: InvestigationNote = {
      id: `NOTE-${Date.now().toString().slice(-4)}`,
      caseId,
      officerId: actingUser.id,
      officerName: actingUser.name,
      officerRank: actingUser.rank,
      note: noteText,
      isConfidential,
      createdAt: new Date().toISOString()
    };
    state.notes.push(note);
    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: 'CASE_NOTE_CREATE',
      resourceType: 'Case',
      resourceId: caseId,
      status: 'Success',
      ipAddress: '10.240.12.84',
      details: `Added ${isConfidential ? 'confidential' : 'general'} note to case ${caseId}.`
    });

    return note;
  }

  public updateInvestigationNote(noteId: string, noteText: string, isConfidential: boolean, actingUser: User): InvestigationNote | null {
    const state = this.getState();
    const note = state.notes.find(n => n.id === noteId);
    if (!note) return null;

    note.note = noteText;
    note.isConfidential = isConfidential;
    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: 'CASE_NOTE_UPDATE',
      resourceType: 'Case',
      resourceId: note.caseId,
      status: 'Success',
      ipAddress: '10.240.12.84',
      details: `Updated field note ${noteId} on case ${note.caseId}.`
    });

    return note;
  }

  public deleteInvestigationNote(noteId: string, actingUser: User): boolean {
    const state = this.getState();
    const note = state.notes.find(n => n.id === noteId);
    if (!note) return false;

    state.notes = state.notes.filter(n => n.id !== noteId);
    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: 'CASE_NOTE_DELETE',
      resourceType: 'Case',
      resourceId: note.caseId,
      status: 'Success',
      ipAddress: '10.240.12.84',
      details: `Removed field note ${noteId} from case ${note.caseId}.`
    });

    return true;
  }

  // ARRESTS
  public getArrests(user?: User | null): Arrest[] {
    const arrests = this.getState().arrests;
    if (!user || user.role === 'Administrator') return arrests;
    return arrests.filter(a => this.isVisibleToUser(a, user));
  }

  public saveArrest(arrestData: Partial<Arrest> & { recordId: string; suspectName: string }, actingUser: User): Arrest {
    const state = this.getState();
    const now = new Date().toISOString();
    let saved: Arrest;

    if (arrestData.id) {
      const idx = state.arrests.findIndex(a => a.id === arrestData.id);
      if (idx >= 0) {
        saved = {
          ...state.arrests[idx],
          ...arrestData,
          updatedAt: now
        } as Arrest;
        state.arrests[idx] = saved;
      } else {
        saved = {
          ...arrestData,
          id: arrestData.id,
          createdAt: now,
          updatedAt: now,
          createdById: actingUser.id,
          createdByRole: actingUser.role
        } as Arrest;
        state.arrests.push(saved);
      }
    } else {
      const year = new Date().getFullYear();
      const num = String(state.arrests.length + 120).padStart(4, '0');
      const generatedId = `ARR-${year}-${num}`;

      saved = {
        arrestDate: now,
        arrestLocation: 'Precinct Sector 4',
        arrestingOfficerId: actingUser.id,
        arrestingOfficerName: actingUser.name,
        arrestingOfficerBadge: actingUser.badgeNumber,
        statutoryCharges: ['Penal Code §459 - Robbery/Theft'],
        mirandaRightsRead: true,
        mirandaReadTime: now,
        status: 'In Custody',
        detentionFacility: 'Central City Detention Complex',
        notes: '',
        ...arrestData,
        id: generatedId,
        createdAt: now,
        updatedAt: now,
        createdById: actingUser.id,
        createdByRole: actingUser.role
      } as Arrest;
      state.arrests.unshift(saved);
    }

    // Link reciprocally to criminal record
    const rec = state.records.find(r => r.id === saved.recordId);
    if (rec && !rec.linkedArrestIds.includes(saved.id)) {
      rec.linkedArrestIds.push(saved.id);
      if (rec.status === 'Suspect') {
        rec.status = 'Arrested';
      }
    }

    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: arrestData.id ? 'ARREST_UPDATE' : 'ARREST_CREATE',
      resourceType: 'Arrest',
      resourceId: saved.id,
      resourceTitle: saved.suspectName,
      status: 'Success',
      ipAddress: '10.240.14.88',
      details: `Logged arrest booking ${saved.id} for ${saved.suspectName}.`
    });

    return saved;
  }

  public deleteArrest(arrestId: string, actingUser: User): boolean {
    const state = this.getState();
    const item = state.arrests.find(a => a.id === arrestId);
    if (!item) return false;

    state.arrests = state.arrests.filter(a => a.id !== arrestId);
    state.records.forEach(r => {
      r.linkedArrestIds = r.linkedArrestIds.filter(id => id !== arrestId);
    });
    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: 'ARREST_DELETE',
      resourceType: 'Arrest',
      resourceId: arrestId,
      resourceTitle: item.suspectName,
      status: 'Success',
      ipAddress: '10.240.10.1',
      details: `Expunged/deleted arrest booking record ${arrestId} for ${item.suspectName}.`
    });
    return true;
  }

  // COMPLAINTS
  public getComplaints(user?: User | null): Complaint[] {
    const complaints = this.getState().complaints;
    if (!user || user.role === 'Administrator') return complaints;
    return complaints.filter(c => this.isVisibleToUser(c, user));
  }

  public saveComplaint(complaintData: Partial<Complaint> & { complainantName: string; description: string }, actingUser: User): Complaint {
    const state = this.getState();
    const now = new Date().toISOString();
    let saved: Complaint;

    if (complaintData.id) {
      const idx = state.complaints.findIndex(c => c.id === complaintData.id);
      if (idx >= 0) {
        saved = {
          ...state.complaints[idx],
          ...complaintData,
          updatedAt: now
        } as Complaint;
        state.complaints[idx] = saved;
      } else {
        saved = {
          ...complaintData,
          id: complaintData.id,
          createdAt: now,
          updatedAt: now,
          createdBy: actingUser.name,
          createdById: actingUser.id,
          createdByRole: actingUser.role
        } as Complaint;
        state.complaints.push(saved);
      }
    } else {
      const year = new Date().getFullYear();
      const num = String(state.complaints.length + 820).padStart(4, '0');
      const generatedId = `CMP-${year}-${num}`;

      saved = {
        complainantPhone: '',
        category: 'Suspicious Activity',
        priority: 'Medium',
        status: 'Received',
        incidentDate: now,
        incidentLocation: 'Metro City jurisdiction',
        assignedOfficerId: actingUser.id,
        assignedOfficerName: actingUser.name,
        ...complaintData,
        id: generatedId,
        createdAt: now,
        updatedAt: now,
        createdBy: actingUser.name,
        createdById: actingUser.id,
        createdByRole: actingUser.role
      } as Complaint;
      state.complaints.unshift(saved);
    }

    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: complaintData.id ? 'COMPLAINT_UPDATE' : 'COMPLAINT_CREATE',
      resourceType: 'Complaint',
      resourceId: saved.id,
      resourceTitle: saved.complainantName,
      status: 'Success',
      ipAddress: '10.240.14.88',
      details: `${complaintData.id ? 'Updated' : 'Logged citizen'} complaint ${saved.id} (${saved.category}) [${saved.status}].`
    });

    return saved;
  }

  public deleteComplaint(complaintId: string, actingUser: User): boolean {
    const state = this.getState();
    const item = state.complaints.find(c => c.id === complaintId);
    if (!item) return false;

    state.complaints = state.complaints.filter(c => c.id !== complaintId);
    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: 'COMPLAINT_DELETE',
      resourceType: 'Complaint',
      resourceId: complaintId,
      resourceTitle: item.complainantName,
      status: 'Success',
      ipAddress: '10.240.10.1',
      details: `Deleted citizen complaint record ${complaintId}.`
    });
    return true;
  }

  // EVIDENCE & CHAIN OF CUSTODY
  public getEvidence(user?: User | null): Evidence[] {
    const evidence = this.getState().evidence;
    if (!user || user.role === 'Administrator') return evidence;
    return evidence.filter(e => this.isVisibleToUser(e, user));
  }

  public getEvidenceById(id: string): Evidence | undefined {
    return this.getState().evidence.find(e => e.id === id);
  }

  public saveEvidence(evidenceData: Partial<Evidence> & { caseId: string; description: string }, actingUser: User): Evidence {
    const state = this.getState();
    const now = new Date().toISOString();
    let saved: Evidence;

    if (evidenceData.id) {
      const idx = state.evidence.findIndex(e => e.id === evidenceData.id);
      if (idx >= 0) {
        saved = {
          ...state.evidence[idx],
          ...evidenceData,
          updatedAt: now
        } as Evidence;
        state.evidence[idx] = saved;
      } else {
        saved = {
          ...evidenceData,
          id: evidenceData.id,
          createdAt: now,
          updatedAt: now,
          createdBy: actingUser.name,
          createdById: actingUser.id,
          createdByRole: actingUser.role
        } as Evidence;
        state.evidence.push(saved);
      }
    } else {
      const year = new Date().getFullYear();
      const num = String(state.evidence.length + 350).padStart(4, '0');
      const generatedId = `EVD-${year}-${num}`;

      const initialCustodyEvent = {
        id: `CUST-${Date.now().toString().slice(-4)}`,
        evidenceId: generatedId,
        timestamp: now,
        actingUserId: actingUser.id,
        actingUserName: actingUser.name,
        actingUserBadge: actingUser.badgeNumber,
        action: 'Collected' as const,
        fromLocation: 'Incident Location',
        toLocation: evidenceData.storageLocker || 'Central Evidence Vault Locker A-01',
        purpose: 'Initial chain of custody cataloging',
        authorizedBy: actingUser.name
      };

      saved = {
        category: 'Physical',
        collectionDate: now,
        collectingOfficerId: actingUser.id,
        collectingOfficerName: actingUser.name,
        collectingOfficerBadge: actingUser.badgeNumber,
        storageLocker: 'Central Evidence Vault Locker A-01',
        status: 'In Storage Locker',
        barcodeRef: `EVD-BARCODE-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: '',
        custodyHistory: [initialCustodyEvent],
        ...evidenceData,
        id: generatedId,
        createdAt: now,
        updatedAt: now,
        createdBy: actingUser.name,
        createdById: actingUser.id,
        createdByRole: actingUser.role
      } as Evidence;
      state.evidence.unshift(saved);
    }

    // Link reciprocally to Case
    const targetCase = state.cases.find(c => c.id === saved.caseId);
    if (targetCase && !targetCase.linkedEvidenceIds.includes(saved.id)) {
      targetCase.linkedEvidenceIds.push(saved.id);
    }

    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: evidenceData.id ? 'EVIDENCE_UPDATE' : 'EVIDENCE_CREATE',
      resourceType: 'Evidence',
      resourceId: saved.id,
      resourceTitle: saved.description,
      status: 'Success',
      ipAddress: '10.240.12.84',
      details: `${evidenceData.id ? 'Updated metadata for' : 'Logged new forensic evidence'} item ${saved.id}.`
    });

    return saved;
  }

  public recordCustodyTransfer(
    evidenceId: string,
    action: 'Transferred' | 'Checked Out for Lab' | 'Returned to Storage' | 'Presented in Court' | 'Disposed',
    toLocation: string,
    purpose: string,
    authorizedBy: string,
    actingUser: User,
    notes?: string
  ): Evidence | null {
    const state = this.getState();
    const item = state.evidence.find(e => e.id === evidenceId);
    if (!item) return null;

    const fromLocation = item.storageLocker;
    const now = new Date().toISOString();

    const event = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      evidenceId,
      timestamp: now,
      actingUserId: actingUser.id,
      actingUserName: actingUser.name,
      actingUserBadge: actingUser.badgeNumber,
      action,
      fromLocation,
      toLocation,
      purpose,
      authorizedBy,
      notes
    };

    item.custodyHistory.push(event);
    item.storageLocker = toLocation;

    if (action === 'Checked Out for Lab') {
      item.status = 'In Lab Analysis';
    } else if (action === 'Returned to Storage') {
      item.status = 'In Storage Locker';
    } else if (action === 'Presented in Court') {
      item.status = 'Presented in Court';
    } else if (action === 'Disposed') {
      item.status = 'Destroyed';
    }

    item.updatedAt = now;
    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: 'CUSTODY_TRANSFER',
      resourceType: 'Evidence',
      resourceId: evidenceId,
      resourceTitle: item.description,
      status: 'Success',
      ipAddress: '10.240.12.84',
      details: `Custody transition [${action}] transferred to ${toLocation}. Authorized by ${authorizedBy}.`
    });

    return item;
  }

  public deleteEvidence(evidenceId: string, actingUser: User): boolean {
    const state = this.getState();
    const item = state.evidence.find(e => e.id === evidenceId);
    if (!item) return false;

    state.evidence = state.evidence.filter(e => e.id !== evidenceId);
    state.cases.forEach(c => {
      c.linkedEvidenceIds = c.linkedEvidenceIds.filter(id => id !== evidenceId);
    });
    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: 'EVIDENCE_DELETE',
      resourceType: 'Evidence',
      resourceId: evidenceId,
      resourceTitle: item.description,
      status: 'Success',
      ipAddress: '10.240.10.1',
      details: `Removed evidence item ${evidenceId} (${item.description}) from vault registry.`
    });
    return true;
  }

  // AUDIT LOGS
  public getAuditLogs(user?: User | null): AuditLog[] {
    const logs = this.getState().auditLogs;
    if (!user || user.role === 'Administrator') return logs;
    return logs.filter(l => this.isVisibleToUser(l, user));
  }

  public updateAuditLog(updatedLog: AuditLog, actingUser: User): AuditLog | null {
    const state = this.getState();
    const idx = state.auditLogs.findIndex(l => l.id === updatedLog.id);
    if (idx === 0 || idx > 0) {
      state.auditLogs[idx] = {
        ...state.auditLogs[idx],
        ...updatedLog
      };
      this.saveState(state);
      this.notify();
      return state.auditLogs[idx];
    }
    return null;
  }

  public deleteAuditLog(logId: string, actingUser?: User): boolean {
    const state = this.getState();
    const item = state.auditLogs.find(l => l.id === logId);
    if (!item) return false;

    state.auditLogs = state.auditLogs.filter(l => l.id !== logId);
    this.saveState(state);
    this.notify();
    return true;
  }

  public clearAuditLogs(actingUser?: User): boolean {
    const state = this.getState();
    state.auditLogs = [];
    this.saveState(state);
    this.notify();
    return true;
  }

  // NOTIFICATIONS & TASKS
  public getNotifications(userId?: string): NotificationItem[] {
    const notifs = this.getState().notifications;
    if (!userId) return notifs;
    return notifs.filter(n => n.userId === userId || n.userId === 'ALL');
  }

  public markNotificationAsRead(notifId: string) {
    const state = this.getState();
    const target = state.notifications.find(n => n.id === notifId);
    if (target) {
      target.isRead = true;
      this.saveState(state);
    }
  }

  public markAllNotificationsAsRead(userId?: string) {
    const state = this.getState();
    state.notifications.forEach(n => {
      if (!userId || n.userId === userId || n.userId === 'ALL') {
        n.isRead = true;
      }
    });
    this.saveState(state);
  }

  public deleteNotification(notifId: string): boolean {
    const state = this.getState();
    const item = state.notifications.find(n => n.id === notifId);
    if (!item) return false;
    state.notifications = state.notifications.filter(n => n.id !== notifId);
    this.saveState(state);
    return true;
  }

  public clearAllNotifications(userId?: string): void {
    const state = this.getState();
    if (!userId) {
      state.notifications = [];
    } else {
      state.notifications = state.notifications.filter(n => n.userId !== userId && n.userId !== 'ALL');
    }
    this.saveState(state);
  }

  public getTasks(userId?: string, user?: User | null): TaskItem[] {
    let tasks = this.getState().tasks;
    if (user && user.role !== 'Administrator') {
      tasks = tasks.filter(t => this.isVisibleToUser(t, user));
    }
    if (!userId) return tasks;
    return tasks.filter(t => t.assignedToId === userId);
  }

  public toggleTaskComplete(taskId: string): boolean {
    const state = this.getState();
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      task.isCompleted = !task.isCompleted;
      this.saveState(state);
      return task.isCompleted;
    }
    return false;
  }

  public saveTask(taskData: Partial<TaskItem> & { title: string; assignedToId: string }, actingUser: User): TaskItem {
    const state = this.getState();
    let saved: TaskItem;
    if (taskData.id) {
      const idx = state.tasks.findIndex(t => t.id === taskData.id);
      if (idx >= 0) {
        saved = { ...state.tasks[idx], ...taskData } as TaskItem;
        state.tasks[idx] = saved;
      } else {
        saved = { ...taskData, id: taskData.id, createdAt: new Date().toISOString() } as TaskItem;
        state.tasks.push(saved);
      }
    } else {
      const assignedUser = state.users.find(u => u.id === taskData.assignedToId);
      saved = {
        priority: 'Medium',
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        isCompleted: false,
        assignedToName: assignedUser ? assignedUser.name : 'Officer',
        description: '',
        ...taskData,
        id: `TSK-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString()
      } as TaskItem;
      state.tasks.unshift(saved);
    }
    this.saveState(state);
    return saved;
  }

  public deleteTask(taskId: string): boolean {
    const state = this.getState();
    const item = state.tasks.find(t => t.id === taskId);
    if (!item) return false;

    state.tasks = state.tasks.filter(t => t.id !== taskId);
    this.saveState(state);
    return true;
  }

  // REPORTS
  public getReports(): ReportRecord[] {
    const reports = this.getState().reports || [];
    return reports.map(r => ({
      ...r,
      rosterTitle: r.rosterTitle || (
        r.reportType === 'cases_summary' ? 'Active and Historical Cases Roster' :
        r.reportType === 'records_summary' ? 'Criminal Records Master Registry' :
        r.reportType === 'officer_workload' ? 'Officer Caseload & Enforcement Productivity Audit' :
        r.reportType === 'evidence_inventory' ? 'Forensic Evidence Vault Inventory' :
        r.reportType === 'arrests_summary' ? 'Custodial Arrests & Detention Intake Ledger' :
        'Investigation Dossier Roster'
      ),
      sealText: r.sealText || 'OFFICIAL CRMS SEAL\nDIGITALLY SIGNED & VERIFIED',
      sealReference: r.sealReference || 'REF: R7Z78MS6',
      officerSignature: r.officerSignature || (r.authorName ? `${r.authorName} (${r.authorRole || 'Reporting Officer'})` : 'Authorized Officer Signature: __________________________'),
      signatureDateBadge: r.signatureDateBadge || `${new Date(r.updatedAt || r.createdAt || Date.now()).toISOString().split('T')[0]} / ${r.authorBadge || 'Badge: UNK'}`
    }));
  }

  public getReportById(reportId: string): ReportRecord | undefined {
    return this.getReports().find(r => r.id === reportId || r.reportType === reportId);
  }

  public saveReport(reportData: Partial<ReportRecord> & { title: string }, actingUser: User): ReportRecord {
    const state = this.getState();
    if (!state.reports) state.reports = [];
    let saved: ReportRecord;
    const now = new Date().toISOString();

    if (reportData.id) {
      const idx = state.reports.findIndex(r => r.id === reportData.id);
      if (idx >= 0) {
        saved = {
          ...state.reports[idx],
          ...reportData,
          lastEditedBy: actingUser.name,
          lastEditedAt: now,
          updatedAt: now
        } as ReportRecord;
        state.reports[idx] = saved;
      } else {
        saved = {
          id: reportData.id,
          reportType: reportData.reportType || 'custom_investigation',
          subtitle: reportData.subtitle || 'Official Intelligence and Statistical Report',
          category: reportData.category || 'General Operations',
          department: reportData.department || actingUser.department,
          status: reportData.status || 'Draft',
          benchmarkGoal: reportData.benchmarkGoal ?? 70,
          dateRange: reportData.dateRange || '90',
          summary: reportData.summary || '',
          findings: reportData.findings || '',
          recommendations: reportData.recommendations || '',
          confidentialNotes: reportData.confidentialNotes || '',
          authorName: reportData.authorName || actingUser.name,
          authorBadge: reportData.authorBadge || actingUser.badgeNumber,
          authorRole: reportData.authorRole || actingUser.role,
          lastEditedBy: actingUser.name,
          lastEditedAt: now,
          createdAt: now,
          updatedAt: now,
          ...reportData
        } as ReportRecord;
        state.reports.push(saved);
      }
    } else {
      const newId = `RPT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      saved = {
        id: newId,
        reportType: reportData.reportType || 'custom_investigation',
        subtitle: reportData.subtitle || 'Official Intelligence and Statistical Report',
        category: reportData.category || 'General Operations',
        department: reportData.department || actingUser.department,
        status: reportData.status || 'Draft',
        benchmarkGoal: reportData.benchmarkGoal ?? 70,
        dateRange: reportData.dateRange || '90',
        summary: reportData.summary || '',
        findings: reportData.findings || '',
        recommendations: reportData.recommendations || '',
        confidentialNotes: reportData.confidentialNotes || '',
        authorName: actingUser.name,
        authorBadge: actingUser.badgeNumber,
        authorRole: actingUser.role,
        lastEditedBy: actingUser.name,
        lastEditedAt: now,
        createdAt: now,
        updatedAt: now,
        ...reportData
      } as ReportRecord;
      state.reports.unshift(saved);
    }

    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: reportData.id ? 'REPORT_UPDATE' : 'REPORT_CREATE',
      resourceType: 'Report',
      resourceId: saved.id,
      resourceTitle: saved.title,
      status: 'Success',
      ipAddress: '10.240.10.1',
      details: `Saved changes to official report docket ${saved.id}: "${saved.title}". Status: ${saved.status}.`
    });

    return saved;
  }

  public deleteReport(reportId: string, actingUser: User): boolean {
    const state = this.getState();
    const existing = (state.reports || []).find(r => r.id === reportId);
    if (!existing) return false;

    state.reports = (state.reports || []).filter(r => r.id !== reportId);
    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: 'REPORT_DELETE',
      resourceType: 'Report',
      resourceId: reportId,
      resourceTitle: existing.title,
      status: 'Success',
      ipAddress: '10.240.10.1',
      details: `Deleted official report docket ${reportId}: "${existing.title}".`
    });

    return true;
  }

  // SETTINGS
  public getSettings(): SystemSettings {
    return this.getState().settings;
  }

  public saveSettings(settings: Partial<SystemSettings>, actingUser: User): SystemSettings {
    const state = this.getState();
    state.settings = { ...state.settings, ...settings };
    this.saveState(state);

    this.logAudit({
      userId: actingUser.id,
      userName: actingUser.name,
      userRole: actingUser.role,
      userBadge: actingUser.badgeNumber,
      action: 'SETTINGS_UPDATE',
      resourceType: 'SystemSetting',
      resourceId: 'SYS-GLOBAL',
      resourceTitle: 'System Security Configuration',
      status: 'Success',
      ipAddress: '10.240.10.1',
      details: 'Updated global retention and security policy settings.'
    });

    return state.settings;
  }

  // BACKUP & RESTORE
  public exportDatabaseJson(): string {
    return JSON.stringify(this.getState(), null, 2);
  }

  public importDatabaseJson(jsonString: string, actingUser: User): boolean {
    try {
      const parsed = JSON.parse(jsonString) as DatabaseState;
      if (!parsed.records || !parsed.cases || !parsed.users) {
        return false;
      }
      this.saveState(parsed);
      this.logAudit({
        userId: actingUser.id,
        userName: actingUser.name,
        userRole: actingUser.role,
        userBadge: actingUser.badgeNumber,
        action: 'DATABASE_RESTORE',
        resourceType: 'SystemSetting',
        resourceId: 'DB-RESTORE',
        resourceTitle: 'System Backup Snapshot',
        status: 'Success',
        ipAddress: '10.240.10.1',
        details: 'Restored full database state from uploaded JSON snapshot.'
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new StorageService();
