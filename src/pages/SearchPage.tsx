import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Shield,
  Briefcase,
  UserX,
  MessageSquareWarning,
  Package,
  ArrowRight,
  RotateCcw,
  Calendar,
  Layers
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

interface SearchPageProps {
  onNavigate: (route: string) => void;
  initialQuery?: string;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onNavigate, initialQuery = '' }) => {
  const { currentUser } = useAuth();
  const db = storage.getState();

  // Search Controls
  const [query, setQuery] = useState(initialQuery);
  const [scope, setScope] = useState<'ALL' | 'records' | 'cases' | 'arrests' | 'complaints' | 'evidence'>('ALL');
  const [crimeCategory, setCrimeCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [assignedOfficer, setAssignedOfficer] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'id'>('recent');

  const handleResetFilters = () => {
    setQuery('');
    setScope('ALL');
    setCrimeCategory('ALL');
    setStatusFilter('ALL');
    setAssignedOfficer('ALL');
    setSortBy('recent');
  };

  const trimmed = query.trim().toLowerCase();

  // 1. Records Search
  const matchingRecords = useMemo(() => {
    if (scope !== 'ALL' && scope !== 'records') return [];
    return db.records.filter(r => {
      const matchText =
        !trimmed ||
        r.id.toLowerCase().includes(trimmed) ||
        r.nationalId.toLowerCase().includes(trimmed) ||
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(trimmed) ||
        r.aliases.some(a => a.toLowerCase().includes(trimmed)) ||
        r.address.toLowerCase().includes(trimmed) ||
        r.notes.toLowerCase().includes(trimmed);

      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchText && matchStatus;
    });
  }, [db.records, trimmed, scope, statusFilter]);

  // 2. Cases Search
  const matchingCases = useMemo(() => {
    if (scope !== 'ALL' && scope !== 'cases') return [];
    return db.cases.filter(c => {
      const matchText =
        !trimmed ||
        c.id.toLowerCase().includes(trimmed) ||
        c.title.toLowerCase().includes(trimmed) ||
        c.incidentLocation.toLowerCase().includes(trimmed) ||
        c.description.toLowerCase().includes(trimmed) ||
        (c.courtDocketNumber && c.courtDocketNumber.toLowerCase().includes(trimmed));

      const matchCategory = crimeCategory === 'ALL' || c.crimeCategory === crimeCategory;
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchOfficer = assignedOfficer === 'ALL' || c.primaryInvestigatorName === assignedOfficer;

      return matchText && matchCategory && matchStatus && matchOfficer;
    });
  }, [db.cases, trimmed, scope, crimeCategory, statusFilter, assignedOfficer]);

  // 3. Arrests Search
  const matchingArrests = useMemo(() => {
    if (scope !== 'ALL' && scope !== 'arrests') return [];
    return db.arrests.filter(a => {
      const matchText =
        !trimmed ||
        a.id.toLowerCase().includes(trimmed) ||
        a.suspectName.toLowerCase().includes(trimmed) ||
        a.statutoryCharges.some(ch => ch.toLowerCase().includes(trimmed)) ||
        (a.warrantNumber && a.warrantNumber.toLowerCase().includes(trimmed)) ||
        a.arrestLocation.toLowerCase().includes(trimmed);

      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      return matchText && matchStatus;
    });
  }, [db.arrests, trimmed, scope, statusFilter]);

  // 4. Complaints Search
  const matchingComplaints = useMemo(() => {
    if (scope !== 'ALL' && scope !== 'complaints') return [];
    return db.complaints.filter(c => {
      const matchText =
        !trimmed ||
        c.id.toLowerCase().includes(trimmed) ||
        c.complainantName.toLowerCase().includes(trimmed) ||
        c.category.toLowerCase().includes(trimmed) ||
        c.description.toLowerCase().includes(trimmed);

      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchText && matchStatus;
    });
  }, [db.complaints, trimmed, scope, statusFilter]);

  // 5. Evidence Search
  const matchingEvidence = useMemo(() => {
    if (scope !== 'ALL' && scope !== 'evidence') return [];
    return db.evidence.filter(e => {
      const matchText =
        !trimmed ||
        e.id.toLowerCase().includes(trimmed) ||
        e.barcodeRef.toLowerCase().includes(trimmed) ||
        e.description.toLowerCase().includes(trimmed) ||
        e.storageLocker.toLowerCase().includes(trimmed) ||
        e.caseId.toLowerCase().includes(trimmed);

      const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
      return matchText && matchStatus;
    });
  }, [db.evidence, trimmed, scope, statusFilter]);

  const totalResults =
    matchingRecords.length +
    matchingCases.length +
    matchingArrests.length +
    matchingComplaints.length +
    matchingEvidence.length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wide">
            Unified Multi-Entity Search Engine
          </h1>
          <span className="px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 text-xs font-mono font-semibold border border-blue-500/20">
            {totalResults} Results Found
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Federated querying across Biometrics, Incident Dockets, Arrest Warrants, Evidence Vault, and Complaints.
        </p>
      </div>

      {/* Main Search Bar & Multi-Field Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 text-blue-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, names, aliases, references (e.g., Kozlov, CASE-2026, M4, ID-8831)..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 font-sans"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Entity Scope</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden font-mono"
            >
              <option value="ALL">All Databases</option>
              <option value="records">Criminal Records</option>
              <option value="cases">Case Dockets</option>
              <option value="arrests">Arrest Bookings</option>
              <option value="complaints">Complaints</option>
              <option value="evidence">Evidence Vault</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Crime Category</label>
            <select
              value={crimeCategory}
              onChange={(e) => setCrimeCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden font-mono"
            >
              <option value="ALL">All Categories</option>
              <option value="Homicide">Homicide</option>
              <option value="Armed Robbery">Armed Robbery</option>
              <option value="Cybercrime">Cybercrime</option>
              <option value="Financial Fraud">Financial Fraud</option>
              <option value="Narcotics & Smuggling">Narcotics</option>
              <option value="Burglary & Theft">Burglary & Theft</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Workflow Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="Suspect">Suspect</option>
              <option value="Arrested">Arrested</option>
              <option value="Charged">Charged</option>
              <option value="Convicted">Convicted</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Pending Court">Pending Court</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Assigned Investigator</label>
            <select
              value={assignedOfficer}
              onChange={(e) => setAssignedOfficer(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden font-mono"
            >
              <option value="ALL">Any Personnel</option>
              {db.users.map(u => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {totalResults === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-sm text-slate-400">
            No matching records found across the selected database scopes. Try broadening keywords or clearing filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-3 text-xs text-blue-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Criminal Records Group */}
          {matchingRecords.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white font-mono uppercase">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Criminal Records ({matchingRecords.length})
                </div>
                <button
                  onClick={() => onNavigate('/records')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-mono"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchingRecords.map(r => (
                  <div
                    key={r.id}
                    onClick={() => onNavigate(`/records/${r.id}`)}
                    className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-colors flex items-center gap-3"
                  >
                    <img src={r.photoUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-xs truncate">
                        {r.firstName} {r.lastName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{r.id} &bull; {r.nationalId}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Badge type="recordStatus" value={r.status} size="sm" />
                        <Badge type="riskLevel" value={r.riskLevel} size="sm" />
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cases Group */}
          {matchingCases.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white font-mono uppercase">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  Case Dockets ({matchingCases.length})
                </div>
                <button
                  onClick={() => onNavigate('/cases')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-mono"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {matchingCases.map(c => (
                  <div
                    key={c.id}
                    onClick={() => onNavigate(`/cases/${c.id}`)}
                    className="p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-xs hover:text-indigo-400 transition-colors flex items-center gap-2">
                        {c.title}
                        <span className="font-mono text-[10px] text-slate-400">{c.id}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {c.crimeCategory} &bull; Inv: {c.primaryInvestigatorName} &bull; Location: {c.incidentLocation}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge type="caseStatus" value={c.status} size="sm" />
                      <Badge type="casePriority" value={c.priority} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Arrests Group */}
          {matchingArrests.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white font-mono uppercase">
                  <UserX className="w-4 h-4 text-orange-400" />
                  Arrest Bookings ({matchingArrests.length})
                </div>
                <button
                  onClick={() => onNavigate('/arrests')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-mono"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchingArrests.map(a => (
                  <div
                    key={a.id}
                    onClick={() => onNavigate('/arrests')}
                    className="p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-xs">{a.suspectName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{a.id} &bull; {a.statutoryCharges[0]}</div>
                    </div>
                    <Badge type="arrestStatus" value={a.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Group */}
          {matchingEvidence.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white font-mono uppercase">
                  <Package className="w-4 h-4 text-purple-400" />
                  Evidence Vault Items ({matchingEvidence.length})
                </div>
                <button
                  onClick={() => onNavigate('/evidence')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-mono"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {matchingEvidence.map(e => (
                  <div
                    key={e.id}
                    onClick={() => onNavigate(`/evidence/${e.id}`)}
                    className="p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-xs">{e.description}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {e.id} &bull; Barcode: {e.barcodeRef} &bull; Locker: {e.storageLocker}
                      </div>
                    </div>
                    <Badge type="evidenceStatus" value={e.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
