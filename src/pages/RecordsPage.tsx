import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Plus,
  Filter,
  Download,
  AlertTriangle,
  Eye,
  Edit2,
  Trash2,
  UserCheck,
  X,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { CriminalRecord, RecordStatus, RiskLevel } from '../types';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { exportToCsv } from '../services/export';

interface RecordsPageProps {
  onNavigate: (route: string) => void;
  openCreateModal?: boolean;
}

export const RecordsPage: React.FC<RecordsPageProps> = ({ onNavigate, openCreateModal = false }) => {
  const { currentUser, canEditRecord, canDeleteRecord } = useAuth();
  const [records, setRecords] = useState<CriminalRecord[]>(() => storage.getRecords());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(openCreateModal);
  const [editingRecord, setEditingRecord] = useState<CriminalRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<CriminalRecord | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    aliases: '',
    dateOfBirth: '1990-01-01',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    nationality: 'United States',
    address: '',
    phone: '',
    status: 'Suspect' as RecordStatus,
    riskLevel: 'Medium' as RiskLevel,
    heightCm: 175,
    weightKg: 75,
    eyeColor: 'Brown',
    hairColor: 'Black',
    scarsMarksTattoos: '',
    fingerprintClass: 'Loop-Radial-A',
    gangAffiliation: '',
    notes: '',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
  });

  const [formError, setFormError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<CriminalRecord | null>(null);

  const refreshRecords = () => {
    setRecords(storage.getRecords());
  };

  // Duplicate Check logic
  const checkDuplicate = (first: string, last: string, nid: string, currentId?: string) => {
    if (!first && !last && !nid) return null;
    return records.find(r => {
      if (currentId && r.id === currentId) return false;
      const nameMatch =
        first &&
        last &&
        r.firstName.toLowerCase() === first.trim().toLowerCase() &&
        r.lastName.toLowerCase() === last.trim().toLowerCase();
      const nidMatch = nid && r.nationalId.toLowerCase() === nid.trim().toLowerCase();
      return nameMatch || nidMatch;
    }) || null;
  };

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setFormData({
      firstName: '',
      lastName: '',
      nationalId: `ID-${Math.floor(1000 + Math.random() * 9000)}-REG`,
      aliases: '',
      dateOfBirth: '1992-05-15',
      gender: 'Male',
      nationality: 'United States',
      address: '',
      phone: '',
      status: 'Suspect',
      riskLevel: 'Medium',
      heightCm: 178,
      weightKg: 78,
      eyeColor: 'Brown',
      hairColor: 'Black',
      scarsMarksTattoos: '',
      fingerprintClass: 'Plain-Whorl-Class-1',
      gangAffiliation: '',
      notes: '',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
    });
    setDuplicateWarning(null);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rec: CriminalRecord) => {
    setEditingRecord(rec);
    setFormData({
      firstName: rec.firstName,
      lastName: rec.lastName,
      nationalId: rec.nationalId,
      aliases: rec.aliases.join(', '),
      dateOfBirth: rec.dateOfBirth,
      gender: rec.gender,
      nationality: rec.nationality,
      address: rec.address,
      phone: rec.phone || '',
      status: rec.status,
      riskLevel: rec.riskLevel,
      heightCm: rec.heightCm,
      weightKg: rec.weightKg,
      eyeColor: rec.eyeColor,
      hairColor: rec.hairColor,
      scarsMarksTattoos: rec.scarsMarksTattoos,
      fingerprintClass: rec.fingerprintClass || '',
      gangAffiliation: rec.gangAffiliation || '',
      notes: rec.notes,
      photoUrl: rec.photoUrl
    });
    setDuplicateWarning(null);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setFormError('First and last names are mandatory.');
      return;
    }

    const dup = checkDuplicate(formData.firstName, formData.lastName, formData.nationalId, editingRecord?.id);
    if (dup && !editingRecord) {
      setDuplicateWarning(dup);
      setFormError(`Potential duplicate detected! Record ${dup.id} matches National ID or Name.`);
      return;
    }

    const aliasesArray = formData.aliases
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    storage.saveRecord(
      {
        ...(editingRecord ? { id: editingRecord.id } : {}),
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

    refreshRecords();
    setIsFormOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!currentUser || !deletingRecord) return;
    storage.deleteRecord(deletingRecord.id, currentUser);
    refreshRecords();
    setDeletingRecord(null);
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.nationalId.toLowerCase().includes(q) ||
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        r.aliases.some(a => a.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchRisk = riskFilter === 'ALL' || r.riskLevel === riskFilter;

      return matchQuery && matchStatus && matchRisk;
    });
  }, [records, searchQuery, statusFilter, riskFilter]);

  const handleExportCsv = () => {
    const rows = filteredRecords.map(r => ({
      'Record ID': r.id,
      'National ID': r.nationalId,
      'Full Name': `${r.firstName} ${r.lastName}`,
      'Aliases': r.aliases.join('; '),
      'Status': r.status,
      'Risk Level': r.riskLevel,
      'DOB': r.dateOfBirth,
      'Gender': r.gender,
      'Nationality': r.nationality,
      'Height (cm)': r.heightCm,
      'Weight (kg)': r.weightKg,
      'Linked Cases': r.linkedCaseIds.length,
      'Created Date': r.createdAt
    }));
    exportToCsv('CRMS_Criminal_Records', rows);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wide">
              Criminal Records Database
            </h1>
            <span className="px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 text-xs font-mono font-semibold border border-blue-500/20">
              {filteredRecords.length} Indexed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Biometric profiles, status tracking, and investigative linkages.
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
          {canEditRecord() && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Register New Record
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, internal ID (CR-2026-...), National ID, alias..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
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

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="Suspect">Suspect</option>
            <option value="Person of Interest">Person of Interest</option>
            <option value="Arrested">Arrested</option>
            <option value="Charged">Charged</option>
            <option value="Convicted">Convicted</option>
            <option value="Acquitted">Acquitted</option>
            <option value="Archived">Archived</option>
          </select>

          {/* Risk Level Dropdown */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
            <option value="Extreme">Extreme Risk</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filteredRecords.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="No Criminal Records Found"
            description="No records match your query. Clear filters or register a new subject."
            actionText={canEditRecord() ? "Register Record" : undefined}
            onAction={handleOpenCreate}
            secondaryActionText={searchQuery || statusFilter !== 'ALL' ? "Reset Filters" : undefined}
            onSecondaryAction={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setRiskFilter('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 font-mono text-slate-400 uppercase text-[11px]">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-3">Identifiers</th>
                  <th className="py-3 px-3">Legal Status</th>
                  <th className="py-3 px-3">Risk Assessment</th>
                  <th className="py-3 px-3">Linked Cases</th>
                  <th className="py-3 px-3">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map(record => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onNavigate(`/records/${record.id}`)}
                  >
                    {/* Subject Photo & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={record.photoUrl}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0 group-hover:border-blue-500 transition-colors"
                        />
                        <div>
                          <div className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                            {record.firstName} {record.lastName}
                          </div>
                          {record.aliases.length > 0 && (
                            <div className="text-[11px] text-slate-400 italic">
                              Alias: "{record.aliases.join(', ')}"
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Identifiers */}
                    <td className="py-3 px-3 font-mono">
                      <div className="text-blue-400 font-semibold">{record.id}</div>
                      <div className="text-[10px] text-slate-400">{record.nationalId}</div>
                    </td>

                    {/* Legal Status */}
                    <td className="py-3 px-3">
                      <Badge type="recordStatus" value={record.status} size="sm" />
                    </td>

                    {/* Risk Level */}
                    <td className="py-3 px-3">
                      <Badge type="riskLevel" value={record.riskLevel} size="sm" />
                    </td>

                    {/* Linked Cases */}
                    <td className="py-3 px-3 font-mono">
                      {record.linkedCaseIds.length > 0 ? (
                        <span className="px-2 py-0.5 bg-indigo-950/60 text-indigo-300 border border-indigo-700/50 rounded-sm text-[11px]">
                          {record.linkedCaseIds.length} Case{record.linkedCaseIds.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">None</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate(`/records/${record.id}`)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEditRecord() && (
                          <button
                            onClick={() => handleOpenEdit(record)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canDeleteRecord() && (
                          <button
                            onClick={() => setDeletingRecord(record)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title="Expunge/Delete Record (Admin)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Create / Edit Record Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  {editingRecord ? `Edit Record ${editingRecord.id}` : 'Register New Subject'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-950/60 border border-red-700/60 rounded-lg text-xs text-red-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <div>{formError}</div>
                </div>
              )}

              {/* Photo & Names */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <div className="sm:col-span-1 flex flex-col items-center">
                  <img
                    src={formData.photoUrl}
                    alt=""
                    className="w-28 h-28 rounded-xl object-cover border-2 border-slate-700 shadow-sm"
                  />
                  <div className="mt-2 w-full">
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">Mugshot URL</label>
                    <input
                      type="text"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="John"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Doe"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">National ID Reference *</label>
                    <input
                      type="text"
                      required
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      placeholder="ID-9921-X"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Known Aliases (comma separated)</label>
                    <input
                      type="text"
                      value={formData.aliases}
                      onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                      placeholder="The Fox, Johnny B"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status and Risk */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Legal Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as RecordStatus })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="Suspect">Suspect (Allegation only)</option>
                    <option value="Person of Interest">Person of Interest</option>
                    <option value="Arrested">Arrested</option>
                    <option value="Charged">Charged (Formal indictment)</option>
                    <option value="Convicted">Convicted</option>
                    <option value="Acquitted">Acquitted</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Risk Level</label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as RiskLevel })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Extreme">Extreme (Flight/Violence Risk)</option>
                  </select>
                </div>
              </div>

              {/* Biometrics & Demographics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Physical Marks & Address */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Scars / Marks / Tattoos</label>
                  <input
                    type="text"
                    value={formData.scarsMarksTattoos}
                    onChange={(e) => setFormData({ ...formData, scarsMarksTattoos: e.target.value })}
                    placeholder="E.g. Scar over left eyebrow, tribal sleeve on right arm"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Primary Known Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Residential or last known sector"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Investigative Notes &amp; Flags</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Restricted investigative remarks..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm"
                >
                  {editingRecord ? 'Save Changes' : 'Register Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation */}
      {deletingRecord && (
        <ConfirmModal
          isOpen={true}
          title="Expunge Criminal Record"
          message={`Are you absolutely certain you want to delete and purge the criminal record for ${deletingRecord.firstName} ${deletingRecord.lastName} (${deletingRecord.id})? This will be recorded permanently in the tamper-evident audit trail.`}
          confirmText="Authorize Deletion"
          requiredConfirmationWord="EXPUNGE"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingRecord(null)}
        />
      )}
    </div>
  );
};
