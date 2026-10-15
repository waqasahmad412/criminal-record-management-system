import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Shield,
  Barcode,
  Calendar,
  Lock,
  ArrowRight,
  X,
  FileCheck,
  Edit2,
  Trash2
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { Evidence, EvidenceCategory, EvidenceStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { exportToCsv } from '../services/export';

interface EvidencePageProps {
  onNavigate: (route: string) => void;
  openCreateModal?: boolean;
}

export const EvidencePage: React.FC<EvidencePageProps> = ({ onNavigate, openCreateModal = false }) => {
  const { currentUser, canManageEvidence } = useAuth();
  const [evidenceList, setEvidenceList] = useState<Evidence[]>(() => storage.getEvidence());

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(openCreateModal);
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null);
  const [deletingEvidence, setDeletingEvidence] = useState<Evidence | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    caseId: '',
    category: 'Physical' as EvidenceCategory,
    description: '',
    storageLocker: 'Vault Alpha, Rack 2, Shelf 4',
    notes: ''
  });

  const allCases = storage.getCases();

  const refreshEvidence = () => {
    setEvidenceList(storage.getEvidence());
  };

  const handleOpenCreate = () => {
    setEditingEvidence(null);
    setFormData({
      caseId: allCases[0]?.id || '',
      category: 'Physical',
      description: '',
      storageLocker: 'Central Vault Locker B-04',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: Evidence) => {
    setEditingEvidence(e);
    setFormData({
      caseId: e.caseId,
      category: e.category,
      description: e.description,
      storageLocker: e.storageLocker,
      notes: e.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteEvidence = () => {
    if (!currentUser || !deletingEvidence) return;
    storage.deleteEvidence(deletingEvidence.id, currentUser);
    setDeletingEvidence(null);
    refreshEvidence();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const targetCase = allCases.find(c => c.id === formData.caseId);

    storage.saveEvidence(
      {
        ...(editingEvidence ? { id: editingEvidence.id } : {}),
        caseId: formData.caseId,
        caseTitle: targetCase?.title,
        category: formData.category,
        description: formData.description.trim(),
        storageLocker: formData.storageLocker.trim(),
        notes: formData.notes.trim()
      },
      currentUser
    );

    refreshEvidence();
    setIsModalOpen(false);
  };

  const filteredEvidence = useMemo(() => {
    return evidenceList.filter(e => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        e.id.toLowerCase().includes(q) ||
        e.barcodeRef.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.storageLocker.toLowerCase().includes(q) ||
        e.caseId.toLowerCase().includes(q);

      const matchCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;

      return matchQuery && matchCategory && matchStatus;
    });
  }, [evidenceList, searchQuery, categoryFilter, statusFilter]);

  const handleExportCsv = () => {
    const rows = filteredEvidence.map(e => ({
      'Evidence ID': e.id,
      'Barcode': e.barcodeRef,
      'Case ID': e.caseId,
      'Category': e.category,
      'Description': e.description,
      'Status': e.status,
      'Storage Locker': e.storageLocker,
      'Collecting Officer': `${e.collectingOfficerName} (${e.collectingOfficerBadge})`,
      'Custody Events Logged': e.custodyHistory.length,
      'Collection Date': e.collectionDate
    }));
    exportToCsv('CRMS_Evidence_Inventory', rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wide">
              Evidence Vault &amp; Chain of Custody
            </h1>
            <span className="px-2 py-0.5 rounded-sm bg-purple-500/10 text-purple-400 text-xs font-mono font-semibold border border-purple-500/20">
              {filteredEvidence.length} Items Vaulted
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Tamper-evident custody audit trails, forensic locker locations, and court submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          {canManageEvidence() && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Deposit Evidence
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by description, barcode (EVD-BARCODE-...), evidence ID, locker..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono"
          >
            <option value="ALL">All Categories</option>
            <option value="Physical">Physical</option>
            <option value="Forensic">Forensic</option>
            <option value="Digital / Cyber">Digital / Cyber</option>
            <option value="Weapon">Weapon</option>
            <option value="Narcotics">Narcotics</option>
            <option value="Documentary">Documentary</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono"
          >
            <option value="ALL">All Custody States</option>
            <option value="In Storage Locker">In Storage Locker</option>
            <option value="In Lab Analysis">In Lab Analysis</option>
            <option value="Presented in Court">Presented in Court</option>
            <option value="Released">Released</option>
            <option value="Destroyed">Destroyed</option>
          </select>
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filteredEvidence.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Evidence Items Found"
            description="No items match your criteria."
            actionText={canManageEvidence() ? "Deposit Evidence" : undefined}
            onAction={handleOpenCreate}
            secondaryActionText="Reset Filters"
            onSecondaryAction={() => {
              setSearchQuery('');
              setCategoryFilter('ALL');
              setStatusFilter('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 font-mono text-slate-400 uppercase text-[11px]">
                  <th className="py-3 px-4">Evidence &amp; Barcode</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Storage Location</th>
                  <th className="py-3 px-3">Custody Status</th>
                  <th className="py-3 px-3">Linked Case</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEvidence.map(e => (
                  <tr
                    key={e.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onNavigate(`/evidence/${e.id}`)}
                  >
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-purple-400">{e.id}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Barcode className="w-3 h-3" />
                        <span>{e.barcodeRef}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-white max-w-sm truncate group-hover:text-purple-400 transition-colors">
                        {e.description}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Seized {new Date(e.collectionDate).toLocaleDateString()} by {e.collectingOfficerName}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-300 font-medium">
                      {e.category}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-300">
                      {e.storageLocker}
                    </td>

                    <td className="py-3 px-3">
                      <Badge type="evidenceStatus" value={e.status} size="sm" />
                    </td>

                    <td className="py-3 px-3 font-mono text-indigo-400">
                      {e.caseId}
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(ev) => ev.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate(`/evidence/${e.id}`)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View Chain of Custody History"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(e)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                          title="Edit Evidence Item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingEvidence(e)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Delete Evidence Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit / Edit Evidence Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  {editingEvidence ? `Update Evidence ${editingEvidence.id}` : 'Deposit Forensic Evidence Item'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Associate with Case *</label>
                <select
                  required
                  value={formData.caseId}
                  onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="">Select open case investigation...</option>
                  {allCases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Evidence Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="Physical">Physical Evidence</option>
                  <option value="Forensic">Forensic Biological Trace</option>
                  <option value="Digital / Cyber">Digital Media / Hard Drive</option>
                  <option value="Weapon">Ballistics / Lethal Weapon</option>
                  <option value="Narcotics">Narcotics / Controlled Substance</option>
                  <option value="Documentary">Documentary Ledger</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Item Description &amp; Identifying Marks *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Make, model, serial number, packaging state, color, physical condition..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Certified Storage Locker Reference *</label>
                <input
                  type="text"
                  required
                  value={formData.storageLocker}
                  onChange={(e) => setFormData({ ...formData, storageLocker: e.target.value })}
                  placeholder="E.g. Central Vault A, Rack 3, Lockbox 19"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Recovery Circumstances &amp; Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Chain of recovery, search warrant authorization reference..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="p-3 bg-purple-950/30 rounded-lg border border-purple-900/40 text-xs text-purple-300">
                <strong>Chain of Custody Guarantee:</strong> Logging this item will automatically register an initial tamper-evident custody event under your badge (#{currentUser?.badgeNumber}) and generate an authorized barcode reference.
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm"
                >
                  {editingEvidence ? 'Save Changes' : 'Log into Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEvidence && (
        <ConfirmModal
          isOpen={!!deletingEvidence}
          title="Delete Forensic Evidence"
          message={`Are you sure you want to permanently delete evidence item ${deletingEvidence.id} ("${deletingEvidence.description}")? This will remove its chain of custody record.`}
          confirmText="Delete Evidence"
          cancelText="Cancel"
          isDestructive={true}
          onConfirm={handleDeleteEvidence}
          onCancel={() => setDeletingEvidence(null)}
        />
      )}
    </div>
  );
};
