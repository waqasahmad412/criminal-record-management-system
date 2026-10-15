import React, { useState, useMemo } from 'react';
import {
  UserX,
  Search,
  Plus,
  Filter,
  Download,
  Printer,
  Calendar,
  MapPin,
  Shield,
  X,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Edit2,
  Trash2
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { Arrest, ArrestStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { exportToCsv, printReportDocument } from '../services/export';

interface ArrestsPageProps {
  onNavigate: (route: string) => void;
  openCreateModal?: boolean;
}

export const ArrestsPage: React.FC<ArrestsPageProps> = ({ onNavigate, openCreateModal = false }) => {
  const { currentUser } = useAuth();
  const [arrests, setArrests] = useState<Arrest[]>(() => storage.getArrests());

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(openCreateModal);
  const [editingArrest, setEditingArrest] = useState<Arrest | null>(null);
  const [deletingArrest, setDeletingArrest] = useState<Arrest | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    recordId: '',
    suspectName: '',
    caseId: '',
    arrestDate: new Date().toISOString(),
    arrestLocation: 'Highway 9 Southbound Rest Stop',
    statutoryCharges: 'Penal Code §211 - Armed Robbery',
    warrantNumber: '',
    mirandaRightsRead: true,
    bailAmount: 500000,
    status: 'In Custody' as ArrestStatus,
    detentionFacility: 'Central High Security Detention Complex',
    cellNumber: 'Block C-12',
    notes: ''
  });

  const allRecords = storage.getRecords();
  const allCases = storage.getCases();

  const refreshArrests = () => {
    setArrests(storage.getArrests());
  };

  const handleOpenCreate = () => {
    setEditingArrest(null);
    const firstRec = allRecords[0];
    setFormData({
      recordId: firstRec ? firstRec.id : '',
      suspectName: firstRec ? `${firstRec.firstName} ${firstRec.lastName}` : '',
      caseId: allCases[0]?.id || '',
      arrestDate: new Date().toISOString(),
      arrestLocation: 'Precinct 4 Jurisdiction',
      statutoryCharges: 'Penal Code §459 - Burglary',
      warrantNumber: `WRNT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      mirandaRightsRead: true,
      bailAmount: 150000,
      status: 'In Custody',
      detentionFacility: 'County Detention Center',
      cellNumber: 'Wing B',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Arrest) => {
    setEditingArrest(a);
    setFormData({
      recordId: a.recordId,
      suspectName: a.suspectName,
      caseId: a.caseId || '',
      arrestDate: a.arrestDate,
      arrestLocation: a.arrestLocation,
      statutoryCharges: a.statutoryCharges.join(', '),
      warrantNumber: a.warrantNumber || '',
      mirandaRightsRead: a.mirandaRightsRead,
      bailAmount: a.bailAmount || 0,
      status: a.status,
      detentionFacility: a.detentionFacility,
      cellNumber: a.cellNumber || '',
      notes: a.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteArrest = () => {
    if (!currentUser || !deletingArrest) return;
    storage.deleteArrest(deletingArrest.id, currentUser);
    setDeletingArrest(null);
    refreshArrests();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const chargesArray = formData.statutoryCharges
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    storage.saveArrest(
      {
        ...(editingArrest ? { id: editingArrest.id } : {}),
        recordId: formData.recordId,
        suspectName: formData.suspectName,
        caseId: formData.caseId || undefined,
        arrestDate: formData.arrestDate,
        arrestLocation: formData.arrestLocation,
        statutoryCharges: chargesArray,
        warrantNumber: formData.warrantNumber || undefined,
        mirandaRightsRead: formData.mirandaRightsRead,
        bailAmount: Number(formData.bailAmount),
        status: formData.status,
        detentionFacility: formData.detentionFacility,
        cellNumber: formData.cellNumber,
        notes: formData.notes
      },
      currentUser
    );

    refreshArrests();
    setIsModalOpen(false);
  };

  const handlePrintBookingSlip = (a: Arrest) => {
    const html = `
      <div style="font-size: 15px; font-weight: bold; margin-bottom: 5px;">BOOKING INTAKE &amp; CUSTODY COMMITTAL SLIP</div>
      <div style="font-size: 11px; color: #64748b; margin-bottom: 20px;">ARREST DOCKET: <strong>${a.id}</strong></div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; width: 30%; background: #f8fafc; font-weight: bold;">Detainee Name:</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${a.suspectName} (Record: ${a.recordId})</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">Arrest Timestamp:</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${new Date(a.arrestDate).toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">Arresting Officer:</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${a.arrestingOfficerName} (Badge #${a.arrestingOfficerBadge})</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">Location of Arrest:</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${a.arrestLocation}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">Statutory Charges:</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #b91c1c;">${a.statutoryCharges.join('; ')}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">Miranda Warning:</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${a.mirandaRightsRead ? 'AFFIRMATIVE - Read & Logged' : 'NO'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">Detention Placement:</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${a.detentionFacility} (${a.cellNumber || 'General Intake'})</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">Bail / Bond Assessment:</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">$${(a.bailAmount || 0).toLocaleString()}</td>
        </tr>
      </table>

      <p style="font-size: 11px; color: #475569; background: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1;">
        Booking Notes: ${a.notes || 'None recorded at intake.'}
      </p>
    `;

    printReportDocument(`ARREST BOOKING SLIP: ${a.id}`, a.suspectName, html);
  };

  const filteredArrests = useMemo(() => {
    return arrests.filter(a => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        a.id.toLowerCase().includes(q) ||
        a.suspectName.toLowerCase().includes(q) ||
        a.arrestLocation.toLowerCase().includes(q) ||
        a.statutoryCharges.some(ch => ch.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [arrests, searchQuery, statusFilter]);

  const handleExportCsv = () => {
    const rows = filteredArrests.map(a => ({
      'Arrest ID': a.id,
      'Suspect': a.suspectName,
      'Record ID': a.recordId,
      'Case ID': a.caseId || 'N/A',
      'Arrest Date': a.arrestDate,
      'Location': a.arrestLocation,
      'Officer': `${a.arrestingOfficerName} (${a.arrestingOfficerBadge})`,
      'Charges': a.statutoryCharges.join('; '),
      'Status': a.status,
      'Facility': a.detentionFacility,
      'Bail Amount': a.bailAmount || 0
    }));
    exportToCsv('CRMS_Arrests_Log', rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wide">
              Arrest &amp; Custody Management
            </h1>
            <span className="px-2 py-0.5 rounded-sm bg-orange-500/10 text-orange-400 text-xs font-mono font-semibold border border-orange-500/20">
              {filteredArrests.length} Bookings
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Custody intake, warrant execution logs, bail setting, and facility assignments.
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
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Book Arrest
          </button>
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
            placeholder="Search by suspect name, arrest reference (ARR-2026-...), charge..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-orange-500"
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono"
          >
            <option value="ALL">All Custody Statuses</option>
            <option value="In Custody">In Custody</option>
            <option value="Remanded">Remanded</option>
            <option value="Released on Bail">Released on Bail</option>
            <option value="Transferred">Transferred</option>
            <option value="Released without Charge">Released without Charge</option>
          </select>
        </div>
      </div>

      {/* Arrests Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filteredArrests.length === 0 ? (
          <EmptyState
            icon={UserX}
            title="No Arrest Records Found"
            description="No bookings match your current query."
            actionText="Book New Arrest"
            onAction={handleOpenCreate}
            secondaryActionText="Reset Filters"
            onSecondaryAction={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 font-mono text-slate-400 uppercase text-[11px]">
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-3">Detainee</th>
                  <th className="py-3 px-3">Statutory Charges</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Detention Facility</th>
                  <th className="py-3 px-3">Arresting Officer</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredArrests.map(a => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-orange-400">{a.id}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(a.arrestDate).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div
                        onClick={() => onNavigate(`/records/${a.recordId}`)}
                        className="font-bold text-white hover:text-blue-400 cursor-pointer"
                      >
                        {a.suspectName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">{a.recordId}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">
                        {a.statutoryCharges.slice(0, 2).join('; ')}
                      </div>
                      {a.warrantNumber && (
                        <div className="text-[10px] font-mono text-amber-400">
                          Warrant: {a.warrantNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <Badge type="arrestStatus" value={a.status} size="sm" />
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      <div>{a.detentionFacility}</div>
                      {a.cellNumber && (
                        <div className="text-[10px] font-mono text-slate-500">{a.cellNumber}</div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-400">
                      <div className="text-white">{a.arrestingOfficerName}</div>
                      <div className="text-[10px] font-mono text-slate-500">Badge #{a.arrestingOfficerBadge}</div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(a)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                          title="Edit Arrest Booking"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrintBookingSlip(a)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Print Booking Slip"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingArrest(a)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Delete Arrest Booking"
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

      {/* Book / Edit Arrest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <UserX className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  {editingArrest ? `Update Arrest Booking ${editingArrest.id}` : 'Book Formal Arrest'}
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
                <label className="text-xs font-semibold text-slate-300 block mb-1">Select Detained Subject *</label>
                <select
                  required
                  value={formData.recordId}
                  onChange={(e) => {
                    const sel = allRecords.find(r => r.id === e.target.value);
                    setFormData({
                      ...formData,
                      recordId: e.target.value,
                      suspectName: sel ? `${sel.firstName} ${sel.lastName}` : ''
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="">Select registered subject...</option>
                  {allRecords.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.firstName} {r.lastName} ({r.id} - {r.nationalId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Link to Case (Optional)</label>
                  <select
                    value={formData.caseId}
                    onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="">Unlinked Incident</option>
                    {allCases.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Warrant Number</label>
                  <input
                    type="text"
                    value={formData.warrantNumber}
                    onChange={(e) => setFormData({ ...formData, warrantNumber: e.target.value })}
                    placeholder="WRNT-2026-XXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Statutory Penal Charges (comma separated) *</label>
                <input
                  type="text"
                  required
                  value={formData.statutoryCharges}
                  onChange={(e) => setFormData({ ...formData, statutoryCharges: e.target.value })}
                  placeholder="Penal Code §211 - Robbery, Penal Code §245 - Assault"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Location of Arrest</label>
                  <input
                    type="text"
                    required
                    value={formData.arrestLocation}
                    onChange={(e) => setFormData({ ...formData, arrestLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Custody Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="In Custody">In Custody</option>
                    <option value="Remanded">Remanded</option>
                    <option value="Released on Bail">Released on Bail</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Detention Facility</label>
                  <input
                    type="text"
                    value={formData.detentionFacility}
                    onChange={(e) => setFormData({ ...formData, detentionFacility: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Bail / Bond ($)</label>
                  <input
                    type="number"
                    value={formData.bailAmount}
                    onChange={(e) => setFormData({ ...formData, bailAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mirandaRightsRead}
                    onChange={(e) => setFormData({ ...formData, mirandaRightsRead: e.target.checked })}
                    className="rounded-sm bg-slate-800 text-orange-600"
                  />
                  <span>
                    <strong>Miranda Rights Warning Read:</strong> Subject informed of right to remain silent and legal counsel representation.
                  </span>
                </label>
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
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm"
                >
                  {editingArrest ? 'Save Changes' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingArrest && (
        <ConfirmModal
          isOpen={!!deletingArrest}
          title="Delete Arrest Booking Record"
          message={`Are you sure you want to permanently expunge and delete arrest booking ${deletingArrest.id} for "${deletingArrest.suspectName}"? This action cannot be undone.`}
          confirmText="Delete Booking"
          cancelText="Cancel"
          isDestructive={true}
          onConfirm={handleDeleteArrest}
          onCancel={() => setDeletingArrest(null)}
        />
      )}
    </div>
  );
};
