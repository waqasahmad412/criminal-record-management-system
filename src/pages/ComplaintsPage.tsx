import React, { useState, useMemo } from 'react';
import {
  MessageSquareWarning,
  Search,
  Plus,
  Filter,
  Download,
  CheckCircle,
  ExternalLink,
  Shield,
  X,
  AlertTriangle,
  FolderPlus,
  ArrowRight,
  Edit2,
  Trash2
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { Complaint, ComplaintPriority, ComplaintStatus, ComplaintCategory } from '../types';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { exportToCsv } from '../services/export';

interface ComplaintsPageProps {
  onNavigate: (route: string) => void;
  openCreateModal?: boolean;
}

export const ComplaintsPage: React.FC<ComplaintsPageProps> = ({ onNavigate, openCreateModal = false }) => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>(() => storage.getComplaints());

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(openCreateModal);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [deletingComplaint, setDeletingComplaint] = useState<Complaint | null>(null);

  // Convert / Escalate to Case Modal
  const [convertingComplaint, setConvertingComplaint] = useState<Complaint | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    complainantName: '',
    complainantPhone: '',
    complainantEmail: '',
    complainantAddress: '',
    category: 'Suspicious Activity' as ComplaintCategory,
    priority: 'Medium' as ComplaintPriority,
    status: 'Received' as ComplaintStatus,
    incidentDate: new Date().toISOString().split('T')[0],
    incidentLocation: 'Sector 4 Metro Area',
    description: '',
    internalNotes: ''
  });

  const refreshComplaints = () => {
    setComplaints(storage.getComplaints());
  };

  const handleOpenCreate = () => {
    setEditingComplaint(null);
    setFormData({
      complainantName: '',
      complainantPhone: '',
      complainantEmail: '',
      complainantAddress: '',
      category: 'Suspicious Activity',
      priority: 'Medium',
      status: 'Received',
      incidentDate: new Date().toISOString().split('T')[0],
      incidentLocation: 'Sector 4 Metro Area',
      description: '',
      internalNotes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Complaint) => {
    setEditingComplaint(c);
    setFormData({
      complainantName: c.complainantName,
      complainantPhone: c.complainantPhone,
      complainantEmail: c.complainantEmail || '',
      complainantAddress: c.complainantAddress || '',
      category: c.category,
      priority: c.priority,
      status: c.status,
      incidentDate: c.incidentDate.split('T')[0],
      incidentLocation: c.incidentLocation,
      description: c.description,
      internalNotes: c.internalNotes || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteComplaint = () => {
    if (!currentUser || !deletingComplaint) return;
    storage.deleteComplaint(deletingComplaint.id, currentUser);
    setDeletingComplaint(null);
    refreshComplaints();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    storage.saveComplaint(
      {
        ...(editingComplaint ? { id: editingComplaint.id } : {}),
        complainantName: formData.complainantName.trim(),
        complainantPhone: formData.complainantPhone.trim(),
        complainantEmail: formData.complainantEmail.trim() || undefined,
        complainantAddress: formData.complainantAddress.trim() || undefined,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        incidentDate: new Date(formData.incidentDate).toISOString(),
        incidentLocation: formData.incidentLocation.trim(),
        description: formData.description.trim(),
        internalNotes: formData.internalNotes.trim()
      },
      currentUser
    );

    refreshComplaints();
    setIsModalOpen(false);
  };

  const handleEscalateToCase = (complaint: Complaint) => {
    if (!currentUser) return;

    // Create a new formal Case linked to this complaint
    const newCase = storage.saveCase(
      {
        title: `Investigation: ${complaint.category} (${complaint.complainantName})`,
        crimeCategory: 'Burglary & Theft',
        priority: complaint.priority === 'Urgent' ? 'Critical' : 'High',
        status: 'Under Investigation',
        incidentDate: complaint.incidentDate,
        incidentLocation: complaint.incidentLocation,
        description: `Formal investigation opened following citizen report ${complaint.id}.\nInitial Details: ${complaint.description}`,
        linkedComplaintIds: [complaint.id]
      },
      currentUser
    );

    // Update complaint state
    storage.saveComplaint(
      {
        id: complaint.id,
        complainantName: complaint.complainantName,
        description: complaint.description,
        status: 'Converted to Case',
        linkedCaseId: newCase.id,
        resolutionSummary: `Escalated to formal CID Case ${newCase.id}.`
      },
      currentUser
    );

    refreshComplaints();
    setConvertingComplaint(null);
    onNavigate(`/cases/${newCase.id}`);
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.complainantName.toLowerCase().includes(q) ||
        c.incidentLocation.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;

      return matchQuery && matchStatus && matchPriority;
    });
  }, [complaints, searchQuery, statusFilter, priorityFilter]);

  const handleExportCsv = () => {
    const rows = filteredComplaints.map(c => ({
      'Complaint ID': c.id,
      'Complainant': c.complainantName,
      'Category': c.category,
      'Priority': c.priority,
      'Status': c.status,
      'Incident Date': c.incidentDate,
      'Location': c.incidentLocation,
      'Assigned Officer': c.assignedOfficerName || 'Unassigned',
      'Linked Case': c.linkedCaseId || 'None',
      'Created Date': c.createdAt
    }));
    exportToCsv('CRMS_Complaints_Registry', rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wide">
              Citizen &amp; Incident Complaints
            </h1>
            <span className="px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 text-xs font-mono font-semibold border border-amber-500/20">
              {filteredComplaints.length} Intake Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Public reports, preliminary investigations, and escalation to CID felony dockets.
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
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Log Complaint
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
            placeholder="Search by complainant, complaint code (CMP-2026-...), category..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500"
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
            <option value="ALL">All Statuses</option>
            <option value="Received">Received</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Converted to Case">Converted to Case</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filteredComplaints.length === 0 ? (
          <EmptyState
            icon={MessageSquareWarning}
            title="No Complaints Found"
            description="No citizen complaints match your criteria."
            actionText="Log New Complaint"
            onAction={handleOpenCreate}
            secondaryActionText="Reset Filters"
            onSecondaryAction={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setPriorityFilter('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 font-mono text-slate-400 uppercase text-[11px]">
                  <th className="py-3 px-4">Complaint ID</th>
                  <th className="py-3 px-3">Complainant</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Incident Date</th>
                  <th className="py-3 px-4 text-right">Escalation / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredComplaints.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-amber-400">{c.id}</div>
                      <div className="text-[10px] text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{c.complainantName}</div>
                      {c.complainantPhone && (
                        <div className="text-[10px] font-mono text-slate-400">{c.complainantPhone}</div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-200 font-medium">
                      {c.category}
                    </td>

                    <td className="py-3 px-3">
                      <Badge type="casePriority" value={c.priority} size="sm" />
                    </td>

                    <td className="py-3 px-3">
                      <Badge type="complaintStatus" value={c.status} size="sm" />
                    </td>

                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(c.incidentDate).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                          title="Edit Complaint"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingComplaint(c)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Delete Complaint"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {c.linkedCaseId ? (
                          <button
                            onClick={() => onNavigate(`/cases/${c.linkedCaseId}`)}
                            className="px-2.5 py-1 bg-indigo-950/60 text-indigo-300 border border-indigo-700/50 rounded-md text-[11px] font-mono flex items-center gap-1 hover:bg-indigo-900/60"
                          >
                            <span>Case {c.linkedCaseId}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          c.status !== 'Resolved' && (
                            <button
                              onClick={() => setConvertingComplaint(c)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1"
                              title="Escalate to full Case Investigation"
                            >
                              <FolderPlus className="w-3.5 h-3.5" />
                              Escalate
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Escalate to Case Modal */}
      {convertingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono">Escalate to Official Case</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Convert complaint <strong>{convertingComplaint.id}</strong> ({convertingComplaint.category}) into an open CID Case investigation? The complaint history will be preserved.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg text-xs text-slate-300 border border-slate-800 space-y-1">
              <div><strong>Complainant:</strong> {convertingComplaint.complainantName}</div>
              <div><strong>Synopsis:</strong> {convertingComplaint.description}</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConvertingComplaint(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleEscalateToCase(convertingComplaint)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Complaint Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <MessageSquareWarning className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  {editingComplaint ? `Update Complaint ${editingComplaint.id}` : 'Register Citizen Complaint'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Complainant Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.complainantName}
                    onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                    placeholder="E.g. Arthur Pendelton"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.complainantPhone}
                    onChange={(e) => setFormData({ ...formData, complainantPhone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Complaint Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="Theft / Loss">Theft / Loss</option>
                    <option value="Noise / Disturbance">Noise / Disturbance</option>
                    <option value="Harassment / Stalking">Harassment / Stalking</option>
                    <option value="Vandalism">Vandalism</option>
                    <option value="Suspicious Activity">Suspicious Activity</option>
                    <option value="Cyber Harassment">Cyber Harassment</option>
                    <option value="Assault">Assault</option>
                    <option value="Fraud">Fraud</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="Received">Received</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Converted to Case">Converted to Case</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Dismissed">Dismissed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Incident Date</label>
                  <input
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Incident Location</label>
                  <input
                    type="text"
                    required
                    value={formData.incidentLocation}
                    onChange={(e) => setFormData({ ...formData, incidentLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Detailed Citizen Narrative *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Record full statement provided by complainant..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Restricted Internal Notes</label>
                <textarea
                  rows={2}
                  value={formData.internalNotes}
                  onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                  placeholder="Patrol observations, initial assessment, dispatch references..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-hidden"
                />
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm"
                >
                  {editingComplaint ? 'Save Changes' : 'Register Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingComplaint && (
        <ConfirmModal
          isOpen={!!deletingComplaint}
          title="Delete Citizen Complaint"
          message={`Are you sure you want to delete citizen complaint ${deletingComplaint.id} from "${deletingComplaint.complainantName}"?`}
          confirmText="Delete Complaint"
          cancelText="Cancel"
          isDestructive={true}
          onConfirm={handleDeleteComplaint}
          onCancel={() => setDeletingComplaint(null)}
        />
      )}
    </div>
  );
};
