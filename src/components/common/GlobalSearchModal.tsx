import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Shield, FileText, Lock, AlertCircle, Package, ArrowRight, CornerDownLeft } from 'lucide-react';
import { storage } from '../../services/storage';
import { Badge } from './Badge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();
  const db = storage.getState();

  const matchingRecords = trimmed
    ? db.records.filter(
        r =>
          r.id.toLowerCase().includes(trimmed) ||
          r.nationalId.toLowerCase().includes(trimmed) ||
          `${r.firstName} ${r.lastName}`.toLowerCase().includes(trimmed) ||
          r.aliases.some(a => a.toLowerCase().includes(trimmed))
      )
    : [];

  const matchingCases = trimmed
    ? db.cases.filter(
        c =>
          c.id.toLowerCase().includes(trimmed) ||
          c.title.toLowerCase().includes(trimmed) ||
          c.crimeCategory.toLowerCase().includes(trimmed) ||
          c.primaryInvestigatorName.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingArrests = trimmed
    ? db.arrests.filter(
        a =>
          a.id.toLowerCase().includes(trimmed) ||
          a.suspectName.toLowerCase().includes(trimmed) ||
          a.statutoryCharges.some(ch => ch.toLowerCase().includes(trimmed))
      )
    : [];

  const matchingComplaints = trimmed
    ? db.complaints.filter(
        c =>
          c.id.toLowerCase().includes(trimmed) ||
          c.complainantName.toLowerCase().includes(trimmed) ||
          c.category.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingEvidence = trimmed
    ? db.evidence.filter(
        e =>
          e.id.toLowerCase().includes(trimmed) ||
          e.barcodeRef.toLowerCase().includes(trimmed) ||
          e.description.toLowerCase().includes(trimmed) ||
          e.category.toLowerCase().includes(trimmed)
      )
    : [];

  const totalResults =
    matchingRecords.length +
    matchingCases.length +
    matchingArrests.length +
    matchingComplaints.length +
    matchingEvidence.length;

  const handleSelect = (route: string) => {
    onNavigate(route);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[75vh]">
        {/* Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records, cases, arrests, evidence, complaints (e.g. Kozlov, CASE-2026, M4)..."
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-sm focus:outline-hidden"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300 p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded-sm">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {!trimmed && (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm">Type any name, identifier, docket, or warrant code.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-mono">
                <span className="px-2 py-1 bg-slate-800 rounded-sm text-slate-300">Victor Kozlov</span>
                <span className="px-2 py-1 bg-slate-800 rounded-sm text-slate-300">CASE-2026-0142</span>
                <span className="px-2 py-1 bg-slate-800 rounded-sm text-slate-300">EVD-2026-0312</span>
                <span className="px-2 py-1 bg-slate-800 rounded-sm text-slate-300">ARR-2026-0091</span>
              </div>
            </div>
          )}

          {trimmed && totalResults === 0 && (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm">No matched records found across all databases for "{query}".</p>
              <button
                onClick={() => {
                  onNavigate(`/search?q=${encodeURIComponent(query)}`);
                  onClose();
                }}
                className="mt-3 text-xs text-blue-400 hover:underline"
              >
                Open Advanced Multi-Field Search &rarr;
              </button>
            </div>
          )}

          {/* Records Matches */}
          {matchingRecords.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" /> Criminal Records ({matchingRecords.length})
              </div>
              <div className="space-y-1">
                {matchingRecords.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(`/records/${r.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 transition-colors text-left border border-transparent hover:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <img src={r.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                          {r.firstName} {r.lastName}
                          <span className="font-mono text-xs text-slate-400">{r.id}</span>
                        </div>
                        <div className="text-xs text-slate-400">National ID: {r.nationalId}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge type="recordStatus" value={r.status} size="sm" />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cases Matches */}
          {matchingCases.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" /> Cases ({matchingCases.length})
              </div>
              <div className="space-y-1">
                {matchingCases.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(`/cases/${c.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 transition-colors text-left border border-transparent hover:border-slate-700"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        {c.title}
                        <span className="font-mono text-xs text-slate-400">{c.id}</span>
                      </div>
                      <div className="text-xs text-slate-400">{c.crimeCategory} &bull; Inv: {c.primaryInvestigatorName}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge type="caseStatus" value={c.status} size="sm" />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Arrests Matches */}
          {matchingArrests.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-400" /> Arrest Bookings ({matchingArrests.length})
              </div>
              <div className="space-y-1">
                {matchingArrests.map(a => (
                  <button
                    key={a.id}
                    onClick={() => handleSelect('/arrests')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 transition-colors text-left border border-transparent hover:border-slate-700"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        {a.suspectName}
                        <span className="font-mono text-xs text-slate-400">{a.id}</span>
                      </div>
                      <div className="text-xs text-slate-400">{a.statutoryCharges.slice(0, 1).join(', ')}</div>
                    </div>
                    <Badge type="arrestStatus" value={a.status} size="sm" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Matches */}
          {matchingEvidence.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-purple-400" /> Evidence Inventory ({matchingEvidence.length})
              </div>
              <div className="space-y-1">
                {matchingEvidence.map(e => (
                  <button
                    key={e.id}
                    onClick={() => handleSelect(`/evidence/${e.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 transition-colors text-left border border-transparent hover:border-slate-700"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        {e.description}
                        <span className="font-mono text-xs text-slate-400">{e.id}</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">Barcode: {e.barcodeRef} &bull; {e.storageLocker}</div>
                    </div>
                    <Badge type="evidenceStatus" value={e.status} size="sm" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Navigation shortcut</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-sm font-mono text-[10px]">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-sm font-mono text-[10px]">K</kbd>
          </div>
          <button
            onClick={() => {
              onNavigate(`/search?q=${encodeURIComponent(query)}`);
              onClose();
            }}
            className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            Detailed Search Engine <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
