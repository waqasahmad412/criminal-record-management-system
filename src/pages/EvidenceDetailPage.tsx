import React, { useState } from 'react';
import {
  Package,
  ArrowLeft,
  Barcode,
  Calendar,
  MapPin,
  Shield,
  FileCheck,
  Send,
  Lock,
  Download,
  AlertTriangle,
  History,
  CheckCircle2,
  X,
  FileText,
  Edit2,
  Trash2
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Evidence, EvidenceCategory } from '../types';

interface EvidenceDetailPageProps {
  evidenceId: string;
  onBack: () => void;
  onNavigate: (route: string) => void;
}

export const EvidenceDetailPage: React.FC<EvidenceDetailPageProps> = ({ evidenceId, onBack, onNavigate }) => {
  const { currentUser, canManageEvidence } = useAuth();
  const [evidence, setEvidence] = useState<Evidence | null>(() => storage.getEvidenceById(evidenceId) || null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    description: evidence?.description || '',
    category: (evidence?.category || 'Physical') as EvidenceCategory,
    storageLocker: evidence?.storageLocker || '',
    notes: evidence?.notes || ''
  });

  // Transfer Form State
  const [transferData, setTransferData] = useState({
    action: 'Transferred' as 'Transferred' | 'Checked Out for Lab' | 'Returned to Storage' | 'Presented in Court' | 'Disposed',
    toLocation: 'State Police Ballistics Forensics Laboratory',
    purpose: 'Forensic microscopic analysis',
    authorizedBy: currentUser?.name || 'Department Supervisor',
    notes: ''
  });

  const refreshEvidence = () => {
    setEvidence(storage.getEvidenceById(evidenceId) || null);
  };

  if (!evidence) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="text-base font-bold text-white">Evidence Record Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">Item reference ({evidenceId}) was not found in the evidence vault.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold uppercase tracking-wider rounded-lg text-white"
        >
          Return to Evidence Vault
        </button>
      </div>
    );
  }

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    storage.recordCustodyTransfer(
      evidence.id,
      transferData.action,
      transferData.toLocation,
      transferData.purpose,
      transferData.authorizedBy,
      currentUser,
      transferData.notes
    );

    refreshEvidence();
    setIsTransferModalOpen(false);
  };

  const handleOpenEdit = () => {
    if (!evidence) return;
    setEditFormData({
      description: evidence.description,
      category: evidence.category,
      storageLocker: evidence.storageLocker,
      notes: evidence.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !evidence) return;

    storage.saveEvidence(
      {
        id: evidence.id,
        caseId: evidence.caseId,
        category: editFormData.category,
        description: editFormData.description.trim(),
        storageLocker: editFormData.storageLocker.trim(),
        notes: editFormData.notes.trim()
      },
      currentUser
    );

    refreshEvidence();
    setIsEditModalOpen(false);
  };

  const handleDeleteEvidence = () => {
    if (!currentUser || !evidence) return;
    storage.deleteEvidence(evidence.id, currentUser);
    setIsDeleteModalOpen(false);
    onBack();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Back to Evidence"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                {evidence.id}
              </h1>
              <Badge type="evidenceStatus" value={evidence.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400">
              Barcode Tag: <span className="font-mono text-purple-400">{evidence.barcodeRef}</span> &bull; Seized {new Date(evidence.collectionDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {canManageEvidence() && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
              Edit Item
            </button>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Log Handover
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Main Evidence Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-2 flex-1">
            <div className="text-xs font-mono text-slate-400 uppercase">Item Description</div>
            <h2 className="text-lg font-bold text-white leading-snug">
              {evidence.description}
            </h2>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-mono text-slate-300 px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700">
                Category: {evidence.category}
              </span>
              <button
                onClick={() => onNavigate(`/cases/${evidence.caseId}`)}
                className="text-xs font-mono text-indigo-300 hover:text-indigo-200 px-2 py-0.5 bg-indigo-950/60 rounded-md border border-indigo-700/60"
              >
                Linked Case: {evidence.caseId} &rarr;
              </button>
            </div>
          </div>

          {/* Barcode Graphic & Locker */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center shrink-0 min-w-[220px]">
            <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mb-1">
              DIGITAL AUDIT TAG
            </div>
            {/* Visual Barcode Bar Mockup */}
            <div className="flex items-center justify-center h-10 gap-0.5 px-2 bg-white rounded-sm my-1">
              <div className="w-1 h-8 bg-black" />
              <div className="w-0.5 h-8 bg-black" />
              <div className="w-1.5 h-8 bg-black" />
              <div className="w-0.5 h-8 bg-black" />
              <div className="w-2 h-8 bg-black" />
              <div className="w-1 h-8 bg-black" />
              <div className="w-0.5 h-8 bg-black" />
              <div className="w-1.5 h-8 bg-black" />
              <div className="w-2 h-8 bg-black" />
              <div className="w-0.5 h-8 bg-black" />
              <div className="w-1 h-8 bg-black" />
            </div>
            <div className="font-mono text-xs font-bold text-purple-400 mt-1">
              {evidence.barcodeRef}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Locker: <strong className="text-white">{evidence.storageLocker}</strong>
            </div>
          </div>
        </div>

        {/* Seizure Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-mono text-[11px] block">Seizing Officer</span>
            <span className="text-white font-medium">{evidence.collectingOfficerName} (Badge #{evidence.collectingOfficerBadge})</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-mono text-[11px] block">Collection Timestamp</span>
            <span className="text-white font-medium">{new Date(evidence.collectionDate).toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-mono text-[11px] block">Current Physical Placement</span>
            <span className="text-white font-medium">{evidence.storageLocker}</span>
          </div>
        </div>

        {/* Secure File Attachment Info */}
        {evidence.fileAttachment && (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{evidence.fileAttachment.name}</span>
                  {evidence.fileAttachment.isClassified && (
                    <span className="px-1.5 py-0.2 bg-red-500/20 text-red-300 text-[9px] font-mono rounded-sm border border-red-500/30">
                      CLASSIFIED EVIDENCE
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {(evidence.fileAttachment.sizeBytes / 1024 / 1024).toFixed(2)} MB &bull; {evidence.fileAttachment.type} &bull; Private Storage Hash Verified
                </div>
              </div>
            </div>
            <button
              onClick={() => alert(`Secure file preview authorized for badge ${currentUser?.badgeNumber}. Authenticated token session verified.`)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
            >
              Verify Attachment
            </button>
          </div>
        )}
      </div>

      {/* Chain of Custody Timeline Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-400" /> Immutable Chain of Custody Log
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict legal requirement under evidentiary statutory rules. Chronological audit events cannot be purged.
            </p>
          </div>
          <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-sm border border-purple-700/60">
            {evidence.custodyHistory.length} Recorded Transfers
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {evidence.custodyHistory.map((cust, idx) => (
            <div key={cust.id} className="relative">
              <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-purple-500 ring-4 ring-slate-900" />
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs uppercase tracking-wide font-mono">
                      {cust.action}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {cust.id}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(cust.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] block">Custodian &amp; Authorizer</span>
                    <span className="text-slate-200">
                      Acting: <strong>{cust.actingUserName}</strong> ({cust.actingUserBadge})<br/>
                      Authorized By: <strong>{cust.authorizedBy}</strong>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] block">Routing / Handover</span>
                    <span className="text-slate-200">
                      From: <span className="font-mono text-slate-400">{cust.fromLocation}</span><br/>
                      To: <span className="font-mono text-purple-300 font-semibold">{cust.toLocation}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-1 text-xs text-slate-300 border-t border-slate-800/60">
                  <span className="font-mono text-slate-400 text-[10px]">Purpose: </span>
                  {cust.purpose}
                  {cust.notes && <span className="italic text-slate-400"> ({cust.notes})</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custody Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Send className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  Record Chain of Custody Transfer
                </h3>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Transfer Action</label>
                <select
                  value={transferData.action}
                  onChange={(e) => setTransferData({ ...transferData, action: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="Transferred">Transferred to External Vault / Lab</option>
                  <option value="Checked Out for Lab">Checked Out for Lab Forensics</option>
                  <option value="Returned to Storage">Returned to Storage Locker</option>
                  <option value="Presented in Court">Presented in Court Exhibit</option>
                  <option value="Disposed">Disposed / Court Ordered Destruction</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Destination Location / Vault Reference *</label>
                <input
                  type="text"
                  required
                  value={transferData.toLocation}
                  onChange={(e) => setTransferData({ ...transferData, toLocation: e.target.value })}
                  placeholder="E.g. District Superior Court Room 3B, State Ballistics Lab"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Reason / Purpose of Movement *</label>
                <input
                  type="text"
                  required
                  value={transferData.purpose}
                  onChange={(e) => setTransferData({ ...transferData, purpose: e.target.value })}
                  placeholder="E.g. Judicial trial presentation, DNA PCR testing"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Authorizing Official *</label>
                <input
                  type="text"
                  required
                  value={transferData.authorizedBy}
                  onChange={(e) => setTransferData({ ...transferData, authorizedBy: e.target.value })}
                  placeholder="Supervisor / Magistrate Name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold uppercase shadow-sm"
                >
                  Sign &amp; Seal Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Evidence Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full my-8 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white font-mono uppercase">
                  Edit Evidence Item ({evidence.id})
                </h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Item Description *</label>
                <textarea
                  rows={2}
                  required
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  >
                    <option value="Physical">Physical</option>
                    <option value="Forensic">Forensic</option>
                    <option value="Digital">Digital</option>
                    <option value="Weapon">Weapon</option>
                    <option value="Narcotics">Narcotics</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Biometric">Biometric</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Storage Locker</label>
                  <input
                    type="text"
                    required
                    value={editFormData.storageLocker}
                    onChange={(e) => setEditFormData({ ...editFormData, storageLocker: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Recovery Circumstances &amp; Notes</label>
                <textarea
                  rows={2}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          title="Delete Forensic Evidence"
          message={`Are you sure you want to permanently delete evidence item ${evidence.id} ("${evidence.description}")? This action cannot be undone.`}
          confirmText="Delete Evidence"
          cancelText="Cancel"
          isDestructive={true}
          onConfirm={handleDeleteEvidence}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};
