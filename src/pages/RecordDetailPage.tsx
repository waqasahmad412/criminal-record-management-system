import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  FileText,
  AlertTriangle,
  UserX,
  Package,
  Printer,
  History,
  Edit,
  ExternalLink,
  Shield,
  Fingerprint,
  Info,
  Edit2,
  Trash2,
  X,
  Camera
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { printReportDocument } from '../services/export';
import { CriminalRecord, RecordStatus, RiskLevel } from '../types';

interface RecordDetailPageProps {
  recordId: string;
  onBack: () => void;
  onNavigate: (route: string) => void;
}

export const RecordDetailPage: React.FC<RecordDetailPageProps> = ({ recordId, onBack, onNavigate }) => {
  const { currentUser, canEditRecord, canDeleteRecord } = useAuth();
  const [record, setRecord] = useState<CriminalRecord | undefined>(() => storage.getRecordById(recordId));
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'arrests' | 'evidence' | 'documents' | 'history'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: record?.firstName || '',
    lastName: record?.lastName || '',
    nationalId: record?.nationalId || '',
    aliases: record?.aliases?.join(', ') || '',
    dateOfBirth: record?.dateOfBirth || '1990-01-01',
    gender: (record?.gender || 'Male') as 'Male' | 'Female' | 'Other',
    nationality: record?.nationality || 'United States',
    address: record?.address || '',
    phone: record?.phone || '',
    status: (record?.status || 'Suspect') as RecordStatus,
    riskLevel: (record?.riskLevel || 'Medium') as RiskLevel,
    heightCm: record?.heightCm || 175,
    weightKg: record?.weightKg || 75,
    eyeColor: record?.eyeColor || 'Brown',
    hairColor: record?.hairColor || 'Black',
    scarsMarksTattoos: record?.scarsMarksTattoos || '',
    fingerprintClass: record?.fingerprintClass || '',
    gangAffiliation: record?.gangAffiliation || '',
    notes: record?.notes || '',
    photoUrl: record?.photoUrl || ''
  });

  const refreshRecord = () => {
    setRecord(storage.getRecordById(recordId));
  };

  const handleOpenEdit = () => {
    if (!record) return;
    setFormData({
      firstName: record.firstName,
      lastName: record.lastName,
      nationalId: record.nationalId,
      aliases: record.aliases.join(', '),
      dateOfBirth: record.dateOfBirth,
      gender: record.gender,
      nationality: record.nationality,
      address: record.address,
      phone: record.phone || '',
      status: record.status,
      riskLevel: record.riskLevel,
      heightCm: record.heightCm,
      weightKg: record.weightKg,
      eyeColor: record.eyeColor,
      hairColor: record.hairColor,
      scarsMarksTattoos: record.scarsMarksTattoos,
      fingerprintClass: record.fingerprintClass || '',
      gangAffiliation: record.gangAffiliation || '',
      notes: record.notes,
      photoUrl: record.photoUrl
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !record) return;

    const aliasesArray = formData.aliases
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    storage.saveRecord(
      {
        id: record.id,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        nationalId: formData.nationalId.trim(),
        aliases: aliasesArray,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        nationality: formData.nationality,
        address: formData.address,
        phone: formData.phone,
        status: formData.status,
        riskLevel: formData.riskLevel,
        heightCm: Number(formData.heightCm),
        weightKg: Number(formData.weightKg),
        eyeColor: formData.eyeColor,
        hairColor: formData.hairColor,
        scarsMarksTattoos: formData.scarsMarksTattoos,
        fingerprintClass: formData.fingerprintClass,
        gangAffiliation: formData.gangAffiliation,
        notes: formData.notes,
        photoUrl: formData.photoUrl
      },
      currentUser
    );

    refreshRecord();
    setIsEditModalOpen(false);
  };

  const handleDeleteRecord = () => {
    if (!currentUser || !record) return;
    storage.deleteRecord(record.id, currentUser);
    setIsDeleteModalOpen(false);
    onBack();
  };

  if (!record) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="text-base font-bold text-white">Record Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">The requested criminal record reference ({recordId}) does not exist.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold uppercase tracking-wider rounded-lg text-white"
        >
          Return to Records
        </button>
      </div>
    );
  }

  // Related data
  const state = storage.getState();
  const linkedCases = state.cases.filter((c: any) => record.linkedCaseIds?.includes(c.id) || c.linkedRecordIds?.includes(record.id));
  const linkedArrests = state.arrests.filter((a: any) => a.recordId === record.id || record.linkedArrestIds?.includes(a.id));
  const linkedEvidence = state.evidence.filter((e: any) => linkedCases.some((c: any) => c.linkedEvidenceIds?.includes(e.id)));
  const auditEntries = state.auditLogs.filter((l: any) => l.resourceId === record.id || l.resourceTitle?.includes(record.lastName));

  const handlePrintRapSheet = () => {
    const html = `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">SUBJECT RAP SHEET / BIOMETRIC IDENTIFICATION DOSSIER</div>
        <div style="font-size: 12px; color: #64748b;">RECORD IDENTIFIER: <strong>${record.id}</strong> | NATIONAL ID: <strong>${record.nationalId}</strong></div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="width: 130px; vertical-align: top; padding: 10px; border: 1px solid #cbd5e1;">
            <img src="${record.photoUrl}" style="width: 110px; height: 130px; object-fit: cover; border: 1px solid #94a3b8;" />
          </td>
          <td style="vertical-align: top; padding: 10px; border: 1px solid #cbd5e1;">
            <div style="font-size: 15px; font-weight: bold;">${record.firstName} ${record.lastName}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">Aliases: ${record.aliases.join(', ') || 'None'}</div>
            <div style="font-size: 12px; line-height: 1.6;">
              <strong>Current Status:</strong> ${record.status} &nbsp;|&nbsp; <strong>Risk Assessment:</strong> ${record.riskLevel}<br/>
              <strong>Date of Birth:</strong> ${record.dateOfBirth} &nbsp;|&nbsp; <strong>Gender:</strong> ${record.gender}<br/>
              <strong>Nationality:</strong> ${record.nationality} &nbsp;|&nbsp; <strong>Address:</strong> ${record.address}<br/>
              <strong>Height / Weight:</strong> ${record.heightCm} cm / ${record.weightKg} kg<br/>
              <strong>Eyes / Hair:</strong> ${record.eyeColor} / ${record.hairColor}<br/>
              <strong>Marks / Scars:</strong> ${record.scarsMarksTattoos || 'None'}<br/>
              <strong>Fingerprint Classification:</strong> ${record.fingerprintClass || 'Unclassified'}
            </div>
          </td>
        </tr>
      </table>

      <h3>LINKED ARREST CHARGES &amp; BOOKINGS</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 6px; border: 1px solid #cbd5e1;">Arrest ID</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1;">Date &amp; Time</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1;">Booking Officer</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1;">Statutory Charges</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1;">Detention Facility</th>
          </tr>
        </thead>
        <tbody>
          ${linkedArrests.length === 0 ? '<tr><td colspan="5" style="text-align: center; padding: 8px;">No arrest bookings recorded.</td></tr>' : linkedArrests.map((a: any) => `
            <tr>
              <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${a.id}</td>
              <td style="padding: 6px; border: 1px solid #cbd5e1;">${new Date(a.arrestDate).toLocaleString()}</td>
              <td style="padding: 6px; border: 1px solid #cbd5e1;">${a.arrestingOfficerName} (${a.arrestingOfficerBadge})</td>
              <td style="padding: 6px; border: 1px solid #cbd5e1;">${a.statutoryCharges.join('; ')}</td>
              <td style="padding: 6px; border: 1px solid #cbd5e1;">${a.detentionFacility}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h3>INVESTIGATIVE REMARKS</h3>
      <p style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; font-size: 11px; line-height: 1.5;">
        ${record.notes || 'No confidential notes on file.'}
      </p>
    `;

    printReportDocument(
      `CRIMINAL DOSSIER: ${record.firstName} ${record.lastName}`,
      `RECORD ID: ${record.id}`,
      html
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Back to Records"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                {record.firstName} {record.lastName}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {record.id}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              National Reference: <span className="font-mono text-slate-300">{record.nationalId}</span> &bull; Registered {new Date(record.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEditRecord() && (
            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
              Edit Record
            </button>
          )}
          <button
            onClick={handlePrintRapSheet}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Rap Sheet
          </button>
          {canDeleteRecord() && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Hero Subject Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Mugshot Image */}
          <div className="relative shrink-0">
            <img
              src={record.photoUrl}
              alt=""
              className="w-36 h-44 rounded-xl object-cover border-2 border-slate-700 shadow-md"
            />
            <div className="absolute top-2 left-2">
              <Badge type="riskLevel" value={record.riskLevel} size="sm" />
            </div>
          </div>

          {/* Quick Demographics */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs text-slate-400 font-mono uppercase">Full Legal Name</div>
                <div className="text-lg font-bold text-white">
                  {record.firstName} {record.lastName}
                </div>
                {record.aliases.length > 0 && (
                  <div className="text-xs text-slate-400 italic mt-0.5">
                    Aliases: "{record.aliases.join('", "')}"
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase text-right">Legal Classification</div>
                  <Badge type="recordStatus" value={record.status} size="md" />
                </div>
              </div>
            </div>

            {/* Quick Grid Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-mono">Date of Birth</span>
                <span className="text-white font-medium">{record.dateOfBirth}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-mono">Gender / Nationality</span>
                <span className="text-white font-medium">{record.gender} / {record.nationality}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-mono">Height &amp; Weight</span>
                <span className="text-white font-medium">{record.heightCm} cm / {record.weightKg} kg</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-mono">Eyes / Hair</span>
                <span className="text-white font-medium">{record.eyeColor} / {record.hairColor}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-mono text-[11px] text-slate-300">Registered Address:</span>
                <span className="text-white">{record.address}</span>
              </div>
              {record.scarsMarksTattoos && (
                <div className="text-slate-400 mt-1">
                  <span className="font-mono text-[11px] text-slate-300">Marks &amp; Tattoos:</span> {record.scarsMarksTattoos}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Due Process Notice */}
        <div className="mt-4 p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl flex items-start gap-2.5 text-xs text-blue-300">
          <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
          <p>
            <strong>Presumption of Innocence Notice:</strong> An allegation, complaint, or arrest does not establish guilt. Official criminal record classifications reflect administrative procedural states under statutory jurisdiction.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto text-xs font-semibold uppercase tracking-wider font-mono">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Biometrics &amp; Notes
        </button>
        <button
          onClick={() => setActiveTab('cases')}
          className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'cases'
              ? 'border-blue-500 text-blue-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Linked Cases ({linkedCases.length})
        </button>
        <button
          onClick={() => setActiveTab('arrests')}
          className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'arrests'
              ? 'border-blue-500 text-blue-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Arrests ({linkedArrests.length})
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'evidence'
              ? 'border-blue-500 text-blue-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Evidence ({linkedEvidence.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Activity History ({auditEntries.length})
        </button>
      </div>

      {/* Tab 1: Biometrics & Notes */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-blue-400" /> Biometric &amp; Forensic Identifiers
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400 font-mono">Fingerprint Pattern</span>
                <span className="text-white font-mono font-semibold">{record.fingerprintClass || 'Plain Loop (Radial)'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400 font-mono">Blood Classification</span>
                <span className="text-white font-mono">{record.bloodType || 'Pending Lab Swab'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400 font-mono">Affiliations / Gang Ties</span>
                <span className="text-amber-400 font-semibold">{record.gangAffiliation || 'None Confirmed'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400 font-mono">DNA Profile Docket</span>
                <span className="text-white font-mono">{record.dnaProfileRef || 'CODIS-PENDING'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Investigative Intelligence
            </h3>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed min-h-[140px]">
              {record.notes ? record.notes : 'No classified intelligence notes on file.'}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Linked Cases */}
      {activeTab === 'cases' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
            Associated Case Dockets
          </h3>
          {linkedCases.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center">No cases currently linked to this record.</div>
          ) : (
            <div className="space-y-3">
              {linkedCases.map((c: any) => (
                <div
                  key={c.id}
                  onClick={() => onNavigate(`/cases/${c.id}`)}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-2">
                      {c.title}
                      <span className="text-xs font-mono text-slate-400">{c.id}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {c.crimeCategory} &bull; Lead Investigator: {c.primaryInvestigatorName}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge type="caseStatus" value={c.status} size="sm" />
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Arrests */}
      {activeTab === 'arrests' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
            Booking &amp; Custody History
          </h3>
          {linkedArrests.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center">No arrest bookings on file for this subject.</div>
          ) : (
            <div className="space-y-3">
              {linkedArrests.map((a: any) => (
                <div key={a.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-blue-400">{a.id}</span>
                      <span className="text-xs text-slate-400">&bull; {new Date(a.arrestDate).toLocaleString()}</span>
                    </div>
                    <Badge type="arrestStatus" value={a.status} size="sm" />
                  </div>
                  <div className="text-xs text-white">
                    <strong>Charges:</strong> {a.statutoryCharges.join(', ')}
                  </div>
                  <div className="text-xs text-slate-400">
                    Arresting Officer: {a.arrestingOfficerName} ({a.arrestingOfficerBadge}) &bull; Facility: {a.detentionFacility}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Evidence */}
      {activeTab === 'evidence' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
            Physical &amp; Forensic Evidence Seizures
          </h3>
          {linkedEvidence.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center">No evidence seizures directly connected through active cases.</div>
          ) : (
            <div className="space-y-3">
              {linkedEvidence.map((e: any) => (
                <div
                  key={e.id}
                  onClick={() => onNavigate(`/evidence/${e.id}`)}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{e.description}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {e.id} &bull; Barcode: {e.barcodeRef} &bull; {e.storageLocker}
                    </div>
                  </div>
                  <Badge type="evidenceStatus" value={e.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Activity History */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
            Record Audit Trail
          </h3>
          {auditEntries.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center">No specific audit entries logged for this record ID.</div>
          ) : (
            <div className="space-y-2">
              {auditEntries.map((log: any) => (
                <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white font-mono">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-400 mt-1">{log.details}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">Logged by {log.userName} ({log.userRole})</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Record Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  Edit Subject Record ({record.id})
                </h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">First Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Last Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">National ID / Reference *</label>
                  <input
                    type="text"
                    required
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Legal Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="Allegation">Allegation</option>
                    <option value="Suspect">Suspect</option>
                    <option value="Arrested">Arrested</option>
                    <option value="Charged">Charged</option>
                    <option value="Convicted">Convicted</option>
                    <option value="Acquitted">Acquitted</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Risk Assessment</label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Aliases (comma separated)</label>
                  <input
                    type="text"
                    value={formData.aliases}
                    onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Address / Known Residence</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Phone Reference</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Subject Photograph URL</label>
                <input
                  type="text"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Investigative Dossier Remarks</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          title="Delete Criminal Record"
          message={`Are you sure you want to permanently delete and expunge the record for "${record.firstName} ${record.lastName}" (${record.id})? This is a restricted administrative action.`}
          confirmText="Delete Record"
          cancelText="Cancel"
          isDestructive={true}
          onConfirm={handleDeleteRecord}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};
