import React, { useState } from 'react';
import {
  ShieldCheck,
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Save,
  RotateCcw,
  AlertCircle,
  FileBadge,
  Eye,
  Edit2,
  Trash2,
  UserCheck
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface PermissionMatrix {
  id: string;
  module: string;
  description: string;
  permissions: {
    Administrator: boolean;
    Supervisor: boolean;
    'Police Officer': boolean;
    Investigator: boolean;
    'Court Official': boolean;
  };
}

const DEFAULT_PERMISSIONS: PermissionMatrix[] = [
  {
    id: 'criminal_records',
    module: 'Criminal Records Management',
    description: 'Create, update, expunge, and access biometric profiles and criminal dossiers',
    permissions: {
      Administrator: true,
      Supervisor: true,
      'Police Officer': true,
      Investigator: true,
      'Court Official': true
    }
  },
  {
    id: 'record_expunge',
    module: 'Record Expungement & Deletion',
    description: 'Permanently remove or expunge criminal history records from the active registry',
    permissions: {
      Administrator: true,
      Supervisor: false,
      'Police Officer': false,
      Investigator: false,
      'Court Official': false
    }
  },
  {
    id: 'case_management',
    module: 'Case Dossiers & Workflow',
    description: 'File new cases, manage suspect linkings, schedule court hearings, assign detectives',
    permissions: {
      Administrator: true,
      Supervisor: true,
      'Police Officer': true,
      Investigator: true,
      'Court Official': true
    }
  },
  {
    id: 'arrest_management',
    module: 'Arrests & Custody Processing',
    description: 'Log physical bookings, custody transfers, bail records, and holding cell logs',
    permissions: {
      Administrator: true,
      Supervisor: true,
      'Police Officer': true,
      Investigator: true,
      'Court Official': false
    }
  },
  {
    id: 'complaints_intake',
    module: 'Complaints & Citizen Reports',
    description: 'File citizen complaints, review public submissions, forward for criminal investigation',
    permissions: {
      Administrator: true,
      Supervisor: true,
      'Police Officer': true,
      Investigator: true,
      'Court Official': false
    }
  },
  {
    id: 'evidence_custody',
    module: 'Evidence Vault & Chain of Custody',
    description: 'Register physical/digital evidence items, log custody transfers, dispose of items',
    permissions: {
      Administrator: true,
      Supervisor: true,
      'Police Officer': true,
      Investigator: true,
      'Court Official': false
    }
  },
  {
    id: 'advanced_search',
    module: 'Cross-Database Advanced Search',
    description: 'Full-text query biometrics, crime categories, vehicle registrations, and aliases',
    permissions: {
      Administrator: true,
      Supervisor: true,
      'Police Officer': true,
      Investigator: true,
      'Court Official': true
    }
  },
  {
    id: 'reports_analytics',
    module: 'Certified Reports & Statistical Exports',
    description: 'Export departmental crime trends, clearance rates, and legal compliance reports',
    permissions: {
      Administrator: true,
      Supervisor: true,
      'Police Officer': true,
      Investigator: true,
      'Court Official': true
    }
  },
  {
    id: 'audit_logs',
    module: 'Forensic Audit Logs & Inspection',
    description: 'Inspect user action history, security audit events, modify or delete entries',
    permissions: {
      Administrator: true,
      Supervisor: true,
      'Police Officer': false,
      Investigator: false,
      'Court Official': false
    }
  },
  {
    id: 'user_management',
    module: 'Personnel Accounts & Badge Assignment',
    description: 'Create personnel accounts, reset passwords, edit ranks, activate/deactivate users',
    permissions: {
      Administrator: true,
      Supervisor: false,
      'Police Officer': false,
      Investigator: false,
      'Court Official': false
    }
  },
  {
    id: 'backup_recovery',
    module: 'Database Backup & System Recovery',
    description: 'Export cryptographic JSON snapshots, restore system database, perform reset',
    permissions: {
      Administrator: true,
      Supervisor: false,
      'Police Officer': false,
      Investigator: false,
      'Court Official': false
    }
  },
  {
    id: 'system_settings',
    module: 'System Settings & Agency Configuration',
    description: 'Configure retention periods, statutory policies, agency jurisdiction codes',
    permissions: {
      Administrator: true,
      Supervisor: false,
      'Police Officer': false,
      Investigator: false,
      'Court Official': false
    }
  }
];

export const RolesPermissionsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [matrix, setMatrix] = useState<PermissionMatrix[]>(() => {
    const saved = localStorage.getItem('CRMS_RBAC_PERMISSIONS_V1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_PERMISSIONS;
      }
    }
    return DEFAULT_PERMISSIONS;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const users = storage.getUsers();

  const roles: UserRole[] = [
    'Administrator',
    'Supervisor',
    'Police Officer',
    'Investigator',
    'Court Official'
  ];

  const handleToggle = (matrixId: string, role: UserRole) => {
    // Keep Administrator always on for critical system survival
    if (role === 'Administrator' && (matrixId === 'user_management' || matrixId === 'system_settings')) {
      return;
    }

    setMatrix(prev =>
      prev.map(item => {
        if (item.id === matrixId) {
          return {
            ...item,
            permissions: {
              ...item.permissions,
              [role]: !item.permissions[role as keyof typeof item.permissions]
            }
          };
        }
        return item;
      })
    );
  };

  const handleSave = () => {
    localStorage.setItem('CRMS_RBAC_PERMISSIONS_V1', JSON.stringify(matrix));
    if (currentUser) {
      storage.logAudit({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        userBadge: currentUser.badgeNumber,
        action: 'UPDATE_RECORD',
        resourceType: 'User',
        resourceId: 'RBAC_SECURITY_POLICY',
        resourceTitle: 'Role Based Access Control Matrix Updated',
        status: 'Success',
        ipAddress: '10.240.10.2',
        details: 'System Administrator updated the departmental security permissions matrix.'
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setMatrix(DEFAULT_PERMISSIONS);
    localStorage.removeItem('CRMS_RBAC_PERMISSIONS_V1');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-850 p-5 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              Roles &amp; Permissions Matrix
            </h1>
            <span className="px-2.5 py-0.5 rounded-sm bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/30">
              RBAC SECURITY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Departmental Role-Based Access Control: Configure privileges and access bounds for law enforcement personnel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-semibold transition-colors border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Security access privileges successfully updated and applied across all department terminal sessions.</span>
        </div>
      )}

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {roles.map(r => {
          const userCount = users.filter(u => u.role === r).length;
          return (
            <div
              key={r}
              className={`p-3.5 rounded-xl border bg-slate-900 ${
                r === 'Administrator'
                  ? 'border-red-500/30 shadow-xs'
                  : r === 'Supervisor'
                  ? 'border-amber-500/30'
                  : r === 'Police Officer'
                  ? 'border-blue-500/30'
                  : r === 'Investigator'
                  ? 'border-purple-500/30'
                  : 'border-emerald-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  {r === 'Administrator' ? 'Level 5 Clearance' : r === 'Supervisor' ? 'Level 4 Clearance' : 'Field Clearance'}
                </span>
                <span className="px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">
                  {userCount} Users
                </span>
              </div>
              <div className="text-xs font-bold text-white font-mono truncate">{r}</div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {r === 'Administrator'
                  ? 'Full system master privileges, security audit control, personnel accounts.'
                  : r === 'Supervisor'
                  ? 'Command oversight, detective review, approval gates, audit review.'
                  : r === 'Police Officer'
                  ? 'Frontline incident entry, arrest logging, evidence booking, basic records.'
                  : r === 'Investigator'
                  ? 'Case dossiers, forensics coordination, custody tracking, warrant requests.'
                  : 'Judicial docket access, courtroom record verification, certified transcripts.'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Departmental Privilege Allocation Matrix
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Click any cell to toggle authorization status
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 font-mono text-[11px] text-slate-400 uppercase">
                <th className="py-3 px-4 min-w-[260px]">System Module &amp; Operational Capability</th>
                {roles.map(r => (
                  <th key={r} className="py-3 px-3 text-center min-w-[130px]">
                    <span className="block text-white font-semibold">{r}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {matrix.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    idx % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/60'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-xs">{item.module}</div>
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5">{item.description}</div>
                  </td>
                  {roles.map(r => {
                    const isGranted = item.permissions[r as keyof typeof item.permissions];
                    const isLocked = r === 'Administrator' && (item.id === 'user_management' || item.id === 'system_settings');
                    return (
                      <td key={r} className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(item.id, r)}
                          disabled={isLocked}
                          title={isLocked ? 'Master clearance permanently required' : `Toggle permission for ${r}`}
                          className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            isGranted
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                          } ${isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                        >
                          {isGranted ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Granted</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Restricted</span>
                            </>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
