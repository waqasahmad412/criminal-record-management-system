import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  User,
  Shield,
  X,
  AlertCircle
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { Case, CaseStatus, CasePriority, CrimeCategory } from '../types';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { exportToCsv } from '../services/export';

interface CasesPageProps {
  onNavigate: (route: string) => void;
  openCreateModal?: boolean;
  assignedOnly?: boolean;
}

export const CasesPage: React.FC<CasesPageProps> = ({
  onNavigate,
  openCreateModal = false,
  assignedOnly = false
}) => {
  const { currentUser, canManageCases } = useAuth();
  const [cases, setCases] = useState<Case[]>(() => storage.getCases());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [assignedOnlyFilter, setAssignedOnlyFilter] = useState<boolean>(assignedOnly);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(openCreateModal);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [deletingCase, setDeletingCase] = useState<Case | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    crimeCategory: 'Burglary & Theft' as CrimeCategory,
    priority: 'Medium' as CasePriority,
    status: 'Registered' as CaseStatus,
    incidentDate: new Date().toISOString().split('T')[0],
    incidentLocation: '',
    description: '',
    primaryInvestigatorId: '',
    leadOfficerId: '',
    courtDocketNumber: '',
    courtHearingDate: '',
    linkedRecordIds: [] as string[]
  });

  const allRecords = storage.getRecords();
  const allUsers = storage.getUsers();
  const investigators = allUsers.filter(u => u.role === 'Investigator' || u.role === 'Administrator');

  const refreshCases = () => {
    setCases(storage.getCases());
  };

  const handleOpenCreate = () => {
    setEditingCase(null);
    setFormData({
      title: '',
      crimeCategory: 'Burglary & Theft',
      priority: 'Medium',
      status: 'Registered',
      incidentDate: new Date().toISOString().split('T')[0],
      incidentLocation: 'Sector 4, Metropolitan jurisdiction',
      description: '',
      primaryInvestigatorId: investigators[0]?.id || currentUser?.id || '',
      leadOfficerId: currentUser?.id || '',
      courtDocketNumber: '',
      courtHearingDate: '',
      linkedRecordIds: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Case) => {
    setEditingCase(c);
    setFormData({
      title: c.title,
      crimeCategory: c.crimeCategory,
      priority: c.priority,
      status: c.status,
      incidentDate: c.incidentDate.split('T')[0],
      incidentLocation: c.incidentLocation,
      description: c.description,
      primaryInvestigatorId: c.primaryInvestigatorId,
      leadOfficerId: c.leadOfficerId,
      courtDocketNumber: c.courtDocketNumber || '',
      courtHearingDate: c.courtHearingDate ? c.courtHearingDate.split('T')[0] : '',
      linkedRecordIds: c.linkedRecordIds
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const leadInvestigator = allUsers.find(u => u.id === formData.primaryInvestigatorId);
    const leadOfficer = allUsers.find(u => u.id === formData.leadOfficerId);

    storage.saveCase(
      {
        ...(editingCase ? { id: editingCase.id } : {}),
        title: formData.title.trim(),
        crimeCategory: formData.crimeCategory,
        priority: formData.priority,
        status: formData.status,
        incidentDate: new Date(formData.incidentDate).toISOString(),
        incidentLocation: formData.incidentLocation,
        description: formData.description,
        primaryInvestigatorId: formData.primaryInvestigatorId,
        primaryInvestigatorName: leadInvestigator?.name || currentUser.name,
        leadOfficerId: formData.leadOfficerId,
        leadOfficerName: leadOfficer?.name || currentUser.name,
        courtDocketNumber: formData.courtDocketNumber || undefined,
        courtHearingDate: formData.courtHearingDate ? new Date(formData.courtHearingDate).toISOString() : undefined,
        linkedRecordIds: formData.linkedRecordIds
      },
      currentUser
    );

    refreshCases();
    setIsModalOpen(false);
  };

  const handleDeleteCase = () => {
    if (!currentUser || !deletingCase) return;
    storage.deleteCase(deletingCase.id, currentUser);
    refreshCases();
    setDeletingCase(null);
  };

  // Filtered
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.primaryInvestigatorName.toLowerCase().includes(q) ||
        c.incidentLocation.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
      const matchCategory = categoryFilter === 'ALL' || c.crimeCategory === categoryFilter;

      const matchAssigned =
        !assignedOnlyFilter ||
        !currentUser ||
        c.primaryInvestigatorId === currentUser.id ||
        c.leadOfficerId === currentUser.id ||
        c.primaryInvestigatorName?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
        c.leadOfficerName?.toLowerCase().includes(currentUser.name.toLowerCase());

      return matchQuery && matchStatus && matchPriority && matchCategory && matchAssigned;
    });
  }, [cases, searchQuery, statusFilter, priorityFilter, categoryFilter, assignedOnlyFilter, currentUser]);

  const handleExportCsv = () => {
    const rows = filteredCases.map(c => ({
      'Case ID': c.id,
      'Title': c.title,
      'Category': c.crimeCategory,
      'Priority': c.priority,
      'Status': c.status,
      'Lead Investigator': c.primaryInvestigatorName,
      'Incident Date': c.incidentDate,
      'Location': c.incidentLocation,
      'Suspects Linked': c.linkedRecordIds.length,
      'Evidence Count': c.linkedEvidenceIds.length,
      'Docket Number': c.courtDocketNumber || 'N/A'
    }));
    exportToCsv('CRMS_Case_Registry', rows);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wide">
              Case Management Registry
            </h1>
            <span className="px-2 py-0.5 rounded-sm bg-indigo-500/10 text-indigo-400 text-xs font-mono font-semibold border border-indigo-500/20">
              {filteredCases.length} Cases
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            CID investigation dockets, assignment, court workflows, and status tracking.
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
          {canManageCases() && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Open New Case
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by case title, case number (CASE-2026-...), lead investigator, location..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
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

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="Registered">Registered</option>
            <option value="Under Review">Under Review</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Pending Court">Pending Court</option>
            <option value="Closed">Closed</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono"
          >
            <option value="ALL">All Categories</option>
            <option value="Homicide">Homicide</option>
            <option value="Armed Robbery">Armed Robbery</option>
            <option value="Cybercrime">Cybercrime</option>
            <option value="Narcotics & Smuggling">Narcotics</option>
            <option value="Financial Fraud">Financial Fraud</option>
            <option value="Burglary & Theft">Burglary & Theft</option>
          </select>

          <button
            type="button"
            onClick={() => setAssignedOnlyFilter(!assignedOnlyFilter)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold font-mono border transition-all ${
              assignedOnlyFilter
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                : 'bg-slate-950 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {assignedOnlyFilter ? '✓ Assigned To Me' : 'Assigned Cases'}
          </button>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filteredCases.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No Cases Found"
            description="No cases match your filters. Register a new incident or reset criteria."
            actionText={canManageCases() ? "Open New Case" : undefined}
            onAction={handleOpenCreate}
            secondaryActionText="Reset Filters"
            onSecondaryAction={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setPriorityFilter('ALL');
              setCategoryFilter('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 font-mono text-slate-400 uppercase text-[11px]">
                  <th className="py-3 px-4">Case Docket &amp; Title</th>
                  <th className="py-3 px-3">Classification</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Assigned Investigator</th>
                  <th className="py-3 px-3">Incident Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCases.map(c => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onNavigate(`/cases/${c.id}`)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                        {c.title}
                      </div>
                      <div className="text-[11px] font-mono text-indigo-400 mt-0.5 flex items-center gap-2">
                        <span>{c.id}</span>
                        {c.courtDocketNumber && (
                          <span className="text-purple-400">&bull; Docket: {c.courtDocketNumber}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-300 font-medium">
                      {c.crimeCategory}
                    </td>

                    <td className="py-3 px-3">
                      <Badge type="casePriority" value={c.priority} size="sm" />
                    </td>

                    <td className="py-3 px-3">
                      <Badge type="caseStatus" value={c.status} size="sm" />
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      <div className="font-medium text-white">{c.primaryInvestigatorName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">CID Unit</div>
                    </td>

                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(c.incidentDate).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate(`/cases/${c.id}`)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View Case Docket"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManageCases() && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                              title="Edit Case Details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingCase(c)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                              title="Delete Case"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
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

      {/* Case Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  {editingCase ? `Update Case ${editingCase.id}` : 'Open Formal Case Investigation'}
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
                <label className="text-xs font-semibold text-slate-300 block mb-1">Case Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Operation / Incident Reference Title"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Crime Category</label>
                  <select
                    value={formData.crimeCategory}
                    onChange={(e) => setFormData({ ...formData, crimeCategory: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="Homicide">Homicide</option>
                    <option value="Armed Robbery">Armed Robbery</option>
                    <option value="Cybercrime">Cybercrime</option>
                    <option value="Narcotics & Smuggling">Narcotics & Smuggling</option>
                    <option value="Financial Fraud">Financial Fraud</option>
                    <option value="Assault & Battery">Assault & Battery</option>
                    <option value="Burglary & Theft">Burglary & Theft</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Workflow Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
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
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Incident Location</label>
                  <input
                    type="text"
                    value={formData.incidentLocation}
                    onChange={(e) => setFormData({ ...formData, incidentLocation: e.target.value })}
                    placeholder="Sector / Address"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Primary Investigator</label>
                  <select
                    value={formData.primaryInvestigatorId}
                    onChange={(e) => setFormData({ ...formData, primaryInvestigatorId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Court Docket Reference (Optional)</label>
                  <input
                    type="text"
                    value={formData.courtDocketNumber}
                    onChange={(e) => setFormData({ ...formData, courtDocketNumber: e.target.value })}
                    placeholder="CR-2026-DIST-XXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Case Synopsis &amp; Probable Cause</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of incident, investigative hypotheses, and initial scene response..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              {/* Link Criminal Records */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Link Suspects / Persons of Interest</label>
                <div className="max-h-32 overflow-y-auto p-2 bg-slate-950 border border-slate-700 rounded-lg divide-y divide-slate-800">
                  {allRecords.map(r => {
                    const isChecked = formData.linkedRecordIds.includes(r.id);
                    return (
                      <label key={r.id} className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-900 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, linkedRecordIds: [...formData.linkedRecordIds, r.id] });
                            } else {
                              setFormData({ ...formData, linkedRecordIds: formData.linkedRecordIds.filter(id => id !== r.id) });
                            }
                          }}
                          className="rounded-sm bg-slate-800 border-slate-600 text-indigo-600"
                        />
                        <span className="font-semibold text-white">{r.firstName} {r.lastName}</span>
                        <span className="text-[10px] font-mono text-slate-400">({r.id} - {r.status})</span>
                      </label>
                    );
                  })}
                </div>
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm"
                >
                  {editingCase ? 'Update Case' : 'Register Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Case Confirmation */}
      {deletingCase && (
        <ConfirmModal
          isOpen={true}
          title="Delete Case Dossier"
          message={`Are you sure you want to delete case "${deletingCase.title}" (${deletingCase.id})? This will remove the case docket from active and archive registries.`}
          confirmText="Delete Case"
          onConfirm={handleDeleteCase}
          onCancel={() => setDeletingCase(null)}
        />
      )}
    </div>
  );
};
