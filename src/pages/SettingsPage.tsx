import React, { useState } from 'react';
import {
  Settings,
  Save,
  Database,
  RotateCcw,
  Download,
  Upload,
  Shield,
  Server,
  CheckCircle2,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { SystemSettings } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>(() => storage.getSettings());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [importError, setImportError] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    storage.saveSettings(settings, currentUser);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const json = storage.exportDatabaseJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CRMS_DATABASE_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
          alert('Database restored successfully from backup.');
          window.location.reload();
        } else {
          setImportError('Invalid backup file format.');
        }
      } catch {
        setImportError('Failed to parse backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToSeedData = () => {
    storage.resetToDefaults();
    alert('Database successfully reset to demonstration fictional dataset.');
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wide">
              System Settings &amp; Security Configuration
            </h1>
            <span className="px-2 py-0.5 rounded-sm bg-slate-800 text-slate-300 text-xs font-mono font-semibold border border-slate-700">
              V2.4 CORE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Retention rules, evidence limits, database backup &amp; external integration status.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-2 space-y-6">
          {/* General Agency Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" /> Agency &amp; Jurisdictional Identification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Law Enforcement Agency Name</label>
                <input
                  type="text"
                  value={settings.agencyName}
                  onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Jurisdiction Code</label>
                <input
                  type="text"
                  value={settings.jurisdictionCode}
                  onChange={(e) => setSettings({ ...settings, jurisdictionCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Retention & Compliance */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" /> Statutory Retention &amp; Evidence Policies
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Criminal Records Retention (Years)</label>
                <input
                  type="number"
                  value={settings.retentionYearsRecords}
                  onChange={(e) => setSettings({ ...settings, retentionYearsRecords: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Felony Cases Retention (Years)</label>
                <input
                  type="number"
                  value={settings.retentionYearsCases}
                  onChange={(e) => setSettings({ ...settings, retentionYearsCases: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.automaticArchival}
                  onChange={(e) => setSettings({ ...settings, automaticArchival: e.target.checked })}
                  className="rounded-sm bg-slate-800 text-blue-600"
                />
                <span>Automatically archive resolved cases older than statutory threshold</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireTwoOfficerApprovalForRecordDeletion}
                  onChange={(e) => setSettings({ ...settings, requireTwoOfficerApprovalForRecordDeletion: e.target.checked })}
                  className="rounded-sm bg-slate-800 text-blue-600"
                />
                <span>Enforce Dual-Custodian authorization for record expungement/deletion</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save System Configuration
            </button>
          </div>
        </form>

        {/* Right Column: Database Backup & External API Status */}
        <div className="space-y-6">
          {/* Database Backup & Restore */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" /> Backup &amp; Disaster Recovery
            </h3>
            <p className="text-xs text-slate-400">
              Export complete encrypted state including biometrics, cases, custody events, and audit logs to JSON.
            </p>

            {importError && (
              <div className="p-2.5 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-lg">
                {importError}
              </div>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                <Download className="w-4 h-4 text-blue-400" />
                Export Full Backup (JSON)
              </button>

              <label className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wide cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Restore from JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-900/50 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors mt-3"
              >
                <RotateCcw className="w-4 h-4 text-red-400" />
                Reset to Seed Dataset
              </button>
            </div>
          </div>

          {/* External Integrations Mock Adapter Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" /> External Interoperability Connectors
            </h3>
            <p className="text-xs text-slate-400">
              Federated agency interfaces with fictional simulation adapters:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">National ID Verification API</div>
                  <div className="text-[10px] text-slate-500 font-mono">Civic Registry Gateway</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-sm text-[10px] font-mono">
                  ONLINE (MOCK)
                </span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">District Court Docket Sync</div>
                  <div className="text-[10px] text-slate-500 font-mono">Judicial Electronic Filing</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-sm text-[10px] font-mono">
                  ONLINE (MOCK)
                </span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Interpol Red Notice Telemetry</div>
                  <div className="text-[10px] text-slate-500 font-mono">Cross-border Warrants</div>
                </div>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-sm text-[10px] font-mono">
                  OFFLINE / UNCONFIGURED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isResetConfirmOpen && (
        <ConfirmModal
          isOpen={true}
          title="Reset Database to Default"
          message="This will overwrite current modifications with the initial demonstration fictional law enforcement records. Are you sure?"
          confirmText="Confirm Reset"
          requiredConfirmationWord="RESET"
          onConfirm={handleResetToSeedData}
          onCancel={() => setIsResetConfirmOpen(false)}
        />
      )}
    </div>
  );
};
