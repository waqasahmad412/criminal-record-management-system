import React, { useState } from 'react';
import {
  Briefcase,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Shield,
  Package,
  Plus,
  Lock,
  MessageSquare,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  History,
  ExternalLink,
  Info,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Case, CaseStatus, InvestigationNote, CrimeCategory, CasePriority } from '../types';

interface CaseDetailPageProps {
  caseId: string;
  onBack: () => void;
  onNavigate: (route: string) => void;
}

export const CaseDetailPage: React.FC<CaseDetailPageProps> = ({ caseId, onBack, onNavigate }) => {
  const { currentUser, canManageCases } = useAuth();
  const [c, setC] = useState<Case | undefined>(() => storage.getCaseById(caseId));
  const [notes, setNotes] = useState<InvestigationNote[]>(() => storage.getNotesForCase(caseId));

  const [activeTab, setActiveTab] = useState<'overview' | 'investigation' | 'evidence' | 'suspects' | 'court' | 'history'>('overview');

  // Investigation Note Form
  const [newNoteText, setNewNoteText] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);

  // Note editing state
  const [editingNote, setEditingNote] = useState<InvestigationNote | null>(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [editNoteConfidential, setEditNoteConfidential] = useState(false);
  const [deletingNote, setDeletingNote] = useState<InvestigationNote | null>(null);

  // Case editing state
  const [isEditCaseModalOpen, setIsEditCaseModalOpen] = useState(false);
  const [isDeleteCaseModalOpen, setIsDeleteCaseModalOpen] = useState(false);
  const [caseFormData, setCaseFormData] = useState({
    title: c?.title || '',
    crimeCategory: (c?.crimeCategory || 'Burglary & Theft') as CrimeCategory,
    priority: (c?.priority || 'Medium') as CasePriority,
    status: (c?.status || 'Registered') as CaseStatus,
    incidentDate: c?.incidentDate ? c.incidentDate.split('T')[0] : new Date().toISOString().split('T')[0],
    incidentLocation: c?.incidentLocation || '',
    description: c?.description || '',
    courtDocketNumber: c?.courtDocketNumber || '',
    courtHearingDate: c?.courtHearingDate ? c.courtHearingDate.split('T')[0] : ''
  });

  const refreshCase = () => {
    setC(storage.getCaseById(caseId));
    setNotes(storage.getNotesForCase(caseId));
  };

  if (!c) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="text-base font-bold text-white">Case Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">The requested case reference ({caseId}) was not found in the registry.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold uppercase tracking-wider rounded-lg text-white"
        >
          Return to Cases
        </button>
      </div>
    );
  }

  const db = storage.getState();
  const linkedRecords = db.records.filter(r => c.linkedRecordIds.includes(r.id) || r.linkedCaseIds.includes(c.id));
  const linkedEvidence = db.evidence.filter(e => c.linkedEvidenceIds.includes(e.id) || e.caseId === c.id);
  const auditLogs = db.auditLogs.filter(l => l.resourceId === c.id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newNoteText.trim()) return;

    storage.addInvestigationNote(c.id, newNoteText.trim(), isConfidential, currentUser);
    setNewNoteText('');
    setIsConfidential(false);
    refreshCase();
  };

  const handleOpenEditNote = (n: InvestigationNote) => {
    setEditingNote(n);
    setEditNoteText(n.note);
    setEditNoteConfidential(n.isConfidential);
  };

  const handleSaveEditNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !editingNote || !editNoteText.trim()) return;

    storage.updateInvestigationNote(editingNote.id, editNoteText.trim(), editNoteConfidential, currentUser);
    setEditingNote(null);
    refreshCase();
  };

  const handleDeleteNoteConfirm = () => {
    if (!currentUser || !deletingNote) return;
    storage.deleteInvestigationNote(deletingNote.id, currentUser);
    setDeletingNote(null);
    refreshCase();
  };

  const handleOpenEditCase = () => {
    setCaseFormData({
      title: c.title,
      crimeCategory: c.crimeCategory,
      priority: c.priority,
      status: c.status,
      incidentDate: c.incidentDate.split('T')[0],
      incidentLocation: c.incidentLocation,
      description: c.description,
      courtDocketNumber: c.courtDocketNumber || '',
      courtHearingDate: c.courtHearingDate ? c.courtHearingDate.split('T')[0] : ''
    });
    setIsEditCaseModalOpen(true);
  };

  const handleSaveCaseEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    storage.saveCase(
      {
        id: c.id,
        title: caseFormData.title.trim(),
        crimeCategory: caseFormData.crimeCategory,
        priority: caseFormData.priority,
        status: caseFormData.status,
        incidentDate: new Date(caseFormData.incidentDate).toISOString(),
        incidentLocation: caseFormData.incidentLocation.trim(),
        description: caseFormData.description.trim(),
        courtDocketNumber: caseFormData.courtDocketNumber.trim() || undefined,
        courtHearingDate: caseFormData.courtHearingDate ? new Date(caseFormData.courtHearingDate).toISOString() : undefined
      },
      currentUser
    );

    refreshCase();
    setIsEditCaseModalOpen(false);
  };

  const handleDeleteCaseConfirm = () => {
    if (!currentUser) return;
    storage.deleteCase(c.id, currentUser);
    setIsDeleteCaseModalOpen(false);
    onBack();
  };

  const handleUpdateStatus = (newStatus: CaseStatus) => {
    if (!currentUser) return;
    storage.saveCase(
      {
        id: c.id,
        title: c.title,
        status: newStatus,
        ...(newStatus === 'Closed' ? { closedAt: new Date().toISOString(), closureReason: 'Administrative resolution approved' } : {})
      },
      currentUser
    );
    refreshCase();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Back to Cases"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                {c.title}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {c.id}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {c.crimeCategory} &bull; Opened {new Date(c.createdAt).toLocaleDateString()} by {c.createdBy}
            </p>
          </div>
        </div>

        {/* Workflow Actions */}
        {canManageCases() && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenEditCase}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
              Edit Case
            </button>
            <select
              value={c.status}
              onChange={(e) => handleUpdateStatus(e.target.value as CaseStatus)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-hidden font-mono"
            >
              <option value="Registered">Registered</option>
              <option value="Under Review">Under Review</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Pending Court">Pending Court</option>
              <option value="Closed">Closed</option>
              <option value="Archived">Archived</option>
            </select>
            <button
              onClick={() => setIsDeleteCaseModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Hero Case Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <div className="md:col-span-3 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge type="caseStatus" value={c.status} size="md" />
              <Badge type="casePriority" value={c.priority} size="md" />
              <span className="text-xs font-mono text-slate-300 px-2 py-1 bg-slate-800 rounded-md border border-slate-700">
                Category: {c.crimeCategory}
              </span>
              {c.courtDocketNumber && (
                <span className="text-xs font-mono text-purple-300 px-2 py-1 bg-purple-950/60 rounded-md border border-purple-700/60">
                  Court Docket: {c.courtDocketNumber}
                </span>
              )}
            </div>

            <div>
              <div className="text-xs font-mono text-slate-400 uppercase mb-1">Incident Synopsis &amp; Probable Cause</div>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                {c.description || 'No detailed incident description provided.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="text-slate-400 block font-mono text-[11px]">Incident Date &amp; Time</span>
                <span className="text-white font-medium">{new Date(c.incidentDate).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="text-slate-400 block font-mono text-[11px]">Incident Location</span>
                <span className="text-white font-medium">{c.incidentLocation}</span>
              </div>
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="text-slate-400 block font-mono text-[11px]">Lead Investigator</span>
                <span className="text-white font-medium">{c.primaryInvestigatorName}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="font-mono text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800 pb-2">
              Case Linkages
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Suspects Linked:</span>
              <span className="font-mono text-white font-bold">{linkedRecords.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Evidence Seized:</span>
              <span className="font-mono text-white font-bold">{linkedEvidence.length} items</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Investigation Notes:</span>
              <span className="font-mono text-white font-bold">{notes.length} entries</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Court Status:</span>
              <span className="font-mono text-purple-400 font-bold">{c.status === 'Pending Court' ? 'Hearing Scheduled' : 'Pre-Trial'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto text-xs font-semibold uppercase tracking-wider font-mono">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Investigation Timeline
        </button>
        <button
          onClick={() => setActiveTab('investigation')}
          className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'investigation'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Field Notes ({notes.length})
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'evidence'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Evidence &amp; Forensics ({linkedEvidence.length})
        </button>
        <button
          onClick={() => setActiveTab('suspects')}
          className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'suspects'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Linked Subjects ({linkedRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('court')}
          className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'court'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Court &amp; Judicial Workflow
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Audit History ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Investigation Timeline */}
      {activeTab === 'overview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
            Procedural Milestones &amp; Case Progression
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-slate-900" />
              <div className="text-xs font-semibold text-white">Incident Reported &amp; Registered</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">{new Date(c.incidentDate).toLocaleString()}</div>
              <p className="text-xs text-slate-300 mt-1">Incident occurred at {c.incidentLocation}. Formal incident case record opened.</p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-indigo-500 ring-4 ring-slate-900" />
              <div className="text-xs font-semibold text-white">Primary Investigator Assigned</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</div>
              <p className="text-xs text-slate-300 mt-1">Assigned to {c.primaryInvestigatorName}. Initial scene forensics and evidence logging conducted.</p>
            </div>

            {/* Step 3 */}
            {linkedEvidence.length > 0 && (
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-purple-500 ring-4 ring-slate-900" />
                <div className="text-xs font-semibold text-white">{linkedEvidence.length} Forensic Evidence Items Seized</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Chain of custody established</div>
                <p className="text-xs text-slate-300 mt-1">Items secured in certified vault lockers and lab queue.</p>
              </div>
            )}

            {/* Step 4 */}
            {c.courtDocketNumber && (
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-slate-900" />
                <div className="text-xs font-semibold text-white">Judicial Subpoena &amp; Court Docket Filing</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Docket: {c.courtDocketNumber}</div>
                <p className="text-xs text-slate-300 mt-1">Indictment submitted to District Superior Court. Awaiting formal hearing.</p>
              </div>
            )}

            {/* Step 5 */}
            {c.status === 'Closed' && (
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-slate-900" />
                <div className="text-xs font-semibold text-emerald-400">Case Resolved &amp; Closed</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{c.closedAt ? new Date(c.closedAt).toLocaleDateString() : 'Closed'}</div>
                <p className="text-xs text-slate-300 mt-1">{c.closureReason || 'Case closed under judicial finality.'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Field Notes */}
      {activeTab === 'investigation' && (
        <div className="space-y-6">
          {/* Add Note Form */}
          {canManageCases() && (
            <form onSubmit={handleAddNote} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" /> Append Investigation Field Note
              </h3>
              <textarea
                rows={3}
                required
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log interviews, ballistic findings, wiretap transcripts, or forensic observations..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-hidden"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isConfidential}
                    onChange={(e) => setIsConfidential(e.target.checked)}
                    className="rounded-sm bg-slate-800 text-indigo-600"
                  />
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Mark as Restricted / Confidential
                </label>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
                >
                  Record Note
                </button>
              </div>
            </form>
          )}

          {/* Notes List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
              Official Investigative Record ({notes.length})
            </h3>
            {notes.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No field notes logged for this case yet.</div>
            ) : (
              <div className="space-y-3">
                {notes.map(n => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-xl border text-xs ${
                      n.isConfidential
                        ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">{n.officerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({n.officerRank})</span>
                        {n.isConfidential && (
                          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-sm text-[10px] font-mono border border-amber-500/30 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> CONFIDENTIAL
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                        {canManageCases() && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditNote(n)}
                              className="p-1 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                              title="Edit Field Note"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setDeletingNote(n)}
                              className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                              title="Delete Field Note"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="leading-relaxed text-slate-200">{n.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Evidence */}
      {activeTab === 'evidence' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Case Evidence &amp; Forensics Seizures
            </h3>
            <button
              onClick={() => onNavigate('/evidence')}
              className="text-xs text-blue-400 hover:text-blue-300 font-mono"
            >
              Go to Evidence Vault &rarr;
            </button>
          </div>
          {linkedEvidence.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center">No evidence seizures directly linked.</div>
          ) : (
            <div className="space-y-3">
              {linkedEvidence.map(e => (
                <div
                  key={e.id}
                  onClick={() => onNavigate(`/evidence/${e.id}`)}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{e.description}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      ID: {e.id} &bull; Barcode: {e.barcodeRef} &bull; Storage: {e.storageLocker}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      Custody Transfers: {e.custodyHistory.length} events logged
                    </div>
                  </div>
                  <Badge type="evidenceStatus" value={e.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Suspects */}
      {activeTab === 'suspects' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
            Linked Subjects &amp; Persons of Interest
          </h3>
          {linkedRecords.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center">No criminal records linked to this case yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {linkedRecords.map(r => (
                <div
                  key={r.id}
                  onClick={() => onNavigate(`/records/${r.id}`)}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer transition-colors flex items-center gap-4"
                >
                  <img
                    src={r.photoUrl}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-white text-xs hover:text-blue-400 transition-colors">
                      {r.firstName} {r.lastName}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">{r.id} &bull; {r.nationalId}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge type="recordStatus" value={r.status} size="sm" />
                      <Badge type="riskLevel" value={r.riskLevel} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Court & Judicial Workflow */}
      {activeTab === 'court' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
            Judicial Proceedings &amp; Prosecution Docket
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-400 font-mono text-[11px] block">Court Docket Reference</span>
              <span className="text-base font-bold text-white font-mono">
                {c.courtDocketNumber || 'Pre-Indictment Stage'}
              </span>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-400 font-mono text-[11px] block">Scheduled Hearing Date</span>
              <span className="text-base font-bold text-white font-mono">
                {c.courtHearingDate ? new Date(c.courtHearingDate).toLocaleDateString() : 'Not Scheduled'}
              </span>
            </div>
          </div>

          {c.verdict && (
            <div className="p-4 bg-purple-950/40 border border-purple-800/50 rounded-xl text-xs space-y-1">
              <span className="font-mono text-purple-300 font-bold block">Judicial Verdict / Disposition</span>
              <p className="text-white font-medium">{c.verdict}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Audit History */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
            Case Audit History
          </h3>
          {auditLogs.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center">No specific audit entries logged for this case.</div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white font-mono">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-400 mt-1">{log.details}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">Recorded by {log.userName} ({log.userRole})</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Case Modal */}
      {isEditCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-xl w-full my-8 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white font-mono uppercase">
                  Edit Case Details ({c.id})
                </h3>
              </div>
              <button onClick={() => setIsEditCaseModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCaseEdit} className="space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Case Docket Title *</label>
                <input
                  type="text"
                  required
                  value={caseFormData.title}
                  onChange={(e) => setCaseFormData({ ...caseFormData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Crime Category</label>
                  <select
                    value={caseFormData.crimeCategory}
                    onChange={(e) => setCaseFormData({ ...caseFormData, crimeCategory: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  >
                    <option value="Homicide">Homicide</option>
                    <option value="Armed Robbery">Armed Robbery</option>
                    <option value="Burglary & Theft">Burglary &amp; Theft</option>
                    <option value="Assault & Battery">Assault &amp; Battery</option>
                    <option value="Financial Fraud & Cybercrime">Financial Fraud &amp; Cybercrime</option>
                    <option value="Narcotics Distribution">Narcotics Distribution</option>
                    <option value="Kidnapping">Kidnapping</option>
                    <option value="Organized Crime">Organized Crime</option>
                    <option value="Weapons Trafficking">Weapons Trafficking</option>
                    <option value="Public Corruption">Public Corruption</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Priority</label>
                  <select
                    value={caseFormData.priority}
                    onChange={(e) => setCaseFormData({ ...caseFormData, priority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Status</label>
                  <select
                    value={caseFormData.status}
                    onChange={(e) => setCaseFormData({ ...caseFormData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  >
                    <option value="Registered">Registered</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Pending Court">Pending Court</option>
                    <option value="Closed">Closed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Incident Date</label>
                  <input
                    type="date"
                    value={caseFormData.incidentDate}
                    onChange={(e) => setCaseFormData({ ...caseFormData, incidentDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Incident Location</label>
                  <input
                    type="text"
                    required
                    value={caseFormData.incidentLocation}
                    onChange={(e) => setCaseFormData({ ...caseFormData, incidentLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Court Docket Number</label>
                  <input
                    type="text"
                    value={caseFormData.courtDocketNumber}
                    onChange={(e) => setCaseFormData({ ...caseFormData, courtDocketNumber: e.target.value })}
                    placeholder="CR-2026-XXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Court Hearing Date</label>
                  <input
                    type="date"
                    value={caseFormData.courtHearingDate}
                    onChange={(e) => setCaseFormData({ ...caseFormData, courtHearingDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Incident Description</label>
                <textarea
                  rows={3}
                  value={caseFormData.description}
                  onChange={(e) => setCaseFormData({ ...caseFormData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditCaseModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase shadow-sm"
                >
                  Save Case Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Field Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono uppercase">
                Edit Investigation Note
              </h3>
              <button onClick={() => setEditingNote(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditNote} className="space-y-4">
              <textarea
                rows={4}
                required
                value={editNoteText}
                onChange={(e) => setEditNoteText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white"
              />

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editNoteConfidential}
                  onChange={(e) => setEditNoteConfidential(e.target.checked)}
                  className="rounded-sm bg-slate-800 text-indigo-600"
                />
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Mark as Restricted / Confidential
              </label>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold uppercase shadow-sm"
                >
                  Update Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Case Confirmation Modal */}
      {isDeleteCaseModalOpen && (
        <ConfirmModal
          isOpen={isDeleteCaseModalOpen}
          title="Delete Case Docket"
          message={`Are you sure you want to permanently delete case "${c.title}" (${c.id})? All associated field notes and linked references will be affected.`}
          confirmText="Delete Case"
          cancelText="Cancel"
          isDestructive={true}
          onConfirm={handleDeleteCaseConfirm}
          onCancel={() => setIsDeleteCaseModalOpen(false)}
        />
      )}

      {/* Delete Note Confirmation Modal */}
      {deletingNote && (
        <ConfirmModal
          isOpen={!!deletingNote}
          title="Delete Investigation Note"
          message="Are you sure you want to remove this investigation field note from the official record?"
          confirmText="Delete Note"
          cancelText="Cancel"
          isDestructive={true}
          onConfirm={handleDeleteNoteConfirm}
          onCancel={() => setDeletingNote(null)}
        />
      )}
    </div>
  );
};
