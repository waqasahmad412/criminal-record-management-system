import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Server,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HardDrive,
  Calendar,
  Clock,
  Layers,
  Archive,
  RefreshCw
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const BackupRestorePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const db = storage.getFilteredState(currentUser);

  const totalRecords = db.records.length;
  const totalCases = db.cases.length;
  const totalArrests = db.arrests.length;
  const totalComplaints = db.complaints.length;
  const totalEvidence = db.evidence.length;
  const totalUsers = db.users.length;
  const totalAuditLogs = db.auditLogs.length;

  const estimatedJsonBytes = JSON.stringify(storage.getState()).length;
  const estimatedKb = (estimatedJsonBytes / 1024).toFixed(1);

  const handleExportBackup = () => {
    setIsExporting(true);
    try {
      const json = storage.exportDatabaseJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `CRMS_PRECINCT_BACKUP_${timestamp}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (currentUser) {
        storage.logAudit({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          userBadge: currentUser.badgeNumber,
          action: 'EXPORT_RECORD',
          resourceType: 'SystemSetting',
          resourceId: filename,
          resourceTitle: 'Full Departmental Database Backup Export',
          status: 'Success',
          ipAddress: '10.240.10.2',
          details: `Exported full encrypted dataset containing ${totalRecords} records, ${totalCases} cases, and ${totalAuditLogs} audit logs.`
        });
      }

      setImportStatus({
        type: 'success',
        message: `Database backup (${filename}) created and downloaded successfully.`
      });
    } catch {
      setImportStatus({
        type: 'error',
        message: 'Failed to generate backup JSON archive.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = storage.importDatabaseJson(text, currentUser);
        if (ok) {
          setImportStatus({
            type: 'success',
            message: 'Database restored successfully! Refreshing terminal state...'
          });
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          setImportStatus({
            type: 'error',
            message: 'Invalid backup file schema: Required CRMS state tables not detected in JSON.'
          });
        }
      } catch {
        setImportStatus({
          type: 'error',
          message: 'Malformed JSON payload: Could not parse backup archive.'
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetToSeedData = () => {
    storage.resetToDefaults();
    setIsResetConfirmOpen(false);
    setImportStatus({
      type: 'success',
      message: 'System database successfully restored to pristine demonstration dataset.'
    });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-850 p-5 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wide flex items-center gap-2">
              <Database className="w-6 h-6 text-emerald-400" />
              Backup &amp; Disaster Recovery
            </h1>
            <span className="px-2.5 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
              HIGH AVAILABILITY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Departmental data preservation, snapshot exports, forensic archives, and rollback controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-md shadow-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export Backup (JSON)'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {importStatus && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-mono ${
            importStatus.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* Database State Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Criminal Records</div>
          <div className="text-lg font-bold font-mono text-white mt-0.5">{totalRecords}</div>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Case Dossiers</div>
          <div className="text-lg font-bold font-mono text-white mt-0.5">{totalCases}</div>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Custody Bookings</div>
          <div className="text-lg font-bold font-mono text-white mt-0.5">{totalArrests}</div>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Complaints</div>
          <div className="text-lg font-bold font-mono text-white mt-0.5">{totalComplaints}</div>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Evidence Items</div>
          <div className="text-lg font-bold font-mono text-white mt-0.5">{totalEvidence}</div>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Personnel Accounts</div>
          <div className="text-lg font-bold font-mono text-white mt-0.5">{totalUsers}</div>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Audit Trails</div>
          <div className="text-lg font-bold font-mono text-white mt-0.5">{totalAuditLogs}</div>
        </div>
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Backup & Restore Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Database Snapshot Management
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-sm bg-slate-800 text-slate-300 text-xs font-mono">
                Payload Size: ~{estimatedKb} KB
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Export Card */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Download className="w-5 h-5 text-emerald-400" />
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-sm">
                      JSON FORMAT
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white font-mono">Full Export Backup</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Serializes all records, biometric details, cases, chain-of-custody logs, and users into a portable JSON document.
                  </p>
                </div>
                <button
                  onClick={handleExportBackup}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  Download Backup File
                </button>
              </div>

              {/* Import Card */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/40 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Upload className="w-5 h-5 text-blue-400" />
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-sm">
                      RESTORE FROM FILE
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white font-mono">Restore System Database</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Upload a verified CRMS backup JSON file to overwrite and restore database tables to a past state.
                  </p>
                </div>
                <label className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-semibold cursor-pointer transition-colors shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Backup File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Reset to Seed Dataset */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-rose-300 font-mono text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  Emergency Factory Reset / Seed Reinitialization
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Re-populates the database with default fictional police precinct cases, criminal records, and personnel rosters.
                </p>
              </div>
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Seed Dataset
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Automated Schedule & Integrity Status */}
        <div className="space-y-6">
          {/* Automated Schedule Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Automated Retention &amp; Snapshots
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Daily Differential Snapshot</div>
                  <div className="text-[10px] text-slate-400 font-mono">03:00 AM UTC (Every 24h)</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded-sm">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Weekly Cold Storage Archive</div>
                  <div className="text-[10px] text-slate-400 font-mono">Sunday 04:00 AM UTC</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded-sm">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Cryptographic State Hash</div>
                  <div className="text-[10px] text-slate-400 font-mono">SHA-256 Verified</div>
                </div>
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-mono rounded-sm">
                  INTEACT
                </span>
              </div>
            </div>
          </div>

          {/* Compliance & Tamper Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              CJIS &amp; Forensic Admissibility
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              All exported backups preserve non-repudiation timestamps and immutable audit records for judicial scrutiny and regulatory compliance.
            </p>
          </div>
        </div>
      </div>

      {isResetConfirmOpen && (
        <ConfirmModal
          isOpen={true}
          title="Reset Database to Default"
          message="This action will overwrite current records with the initial demonstration fictional law enforcement dataset. Are you sure you wish to proceed?"
          confirmText="Confirm Reset"
          requiredConfirmationWord="RESET"
          onConfirm={handleResetToSeedData}
          onCancel={() => setIsResetConfirmOpen(false)}
        />
      )}
    </div>
  );
};
