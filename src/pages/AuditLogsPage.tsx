import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Shield,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Calendar,
  X,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  Check
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { AuditLog, UserRole } from '../types';
import { exportToCsv } from '../services/export';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const AuditLogsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Administrator';

  const [logs, setLogs] = useState<AuditLog[]>(() => storage.getAuditLogs(currentUser));
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Inspection Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Edit Log State
  const [editingLog, setEditingLog] = useState<AuditLog | null>(null);
  const [editFormData, setEditFormData] = useState({
    userName: '',
    userBadge: '',
    userRole: 'Administrator' as UserRole,
    action: '',
    resourceType: 'CriminalRecord' as AuditLog['resourceType'],
    resourceId: '',
    ipAddress: '',
    status: 'Success' as 'Success' | 'Failed' | 'Denied',
    details: ''
  });

  // Delete Log State
  const [deletingLog, setDeletingLog] = useState<AuditLog | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Success Notification toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const refreshLogs = () => {
    setLogs(storage.getAuditLogs(currentUser));
  };

  const filteredLogs = logs.filter(l => {
    const q = searchQuery.toLowerCase().trim();
    const matchQ =
      !q ||
      l.id.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q) ||
      l.userBadge.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.resourceId.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.ipAddress.toLowerCase().includes(q);

    const matchAction = actionFilter === 'ALL' || l.action === actionFilter;
    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchQ && matchAction && matchStatus;
  });

  const handleExportCsv = () => {
    const rows = filteredLogs.map(l => ({
      'Log ID': l.id,
      'Timestamp': l.timestamp,
      'User': l.userName,
      'Role': l.userRole,
      'Badge': l.userBadge,
      'Action': l.action,
      'Resource': `${l.resourceType} (${l.resourceId})`,
      'Status': l.status,
      'IP Address': l.ipAddress,
      'Details': l.details
    }));
    exportToCsv('CRMS_Security_Audit_Trail', rows);
    triggerNotice('Audit trail exported successfully.');
  };

  // Open Edit Modal
  const handleOpenEdit = (log: AuditLog) => {
    setEditingLog(log);
    setEditFormData({
      userName: log.userName,
      userBadge: log.userBadge,
      userRole: log.userRole,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      ipAddress: log.ipAddress,
      status: log.status,
      details: log.details
    });
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog || !currentUser) return;

    const updated: AuditLog = {
      ...editingLog,
      userName: editFormData.userName.trim(),
      userBadge: editFormData.userBadge.trim(),
      userRole: editFormData.userRole,
      action: editFormData.action.trim(),
      resourceType: editFormData.resourceType,
      resourceId: editFormData.resourceId.trim(),
      ipAddress: editFormData.ipAddress.trim(),
      status: editFormData.status,
      details: editFormData.details.trim()
    };

    storage.updateAuditLog(updated, currentUser);
    refreshLogs();
    setEditingLog(null);
    triggerNotice(`Audit record ${updated.id} was successfully modified.`);
  };

  // Confirm Delete Single Log
  const handleConfirmDelete = () => {
    if (!deletingLog) return;
    const targetId = deletingLog.id;
    storage.deleteAuditLog(targetId, currentUser || undefined);
    refreshLogs();
    setDeletingLog(null);
    triggerNotice(`Audit entry ${targetId} has been deleted permanently.`);
  };

  // Confirm Clear All Logs (Admin only)
  const handleConfirmClearAll = () => {
    storage.clearAuditLogs(currentUser || undefined);
    refreshLogs();
    setIsClearAllModalOpen(false);
    triggerNotice('All audit trail logs cleared by Administrator.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-emerald-950/90 text-emerald-200 border border-emerald-500/40 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-mono font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wide">
              Security Audit Trail &amp; System Logs
            </h1>
            <span className="px-2 py-0.5 rounded-sm bg-indigo-500/10 text-indigo-400 text-xs font-mono font-semibold border border-indigo-500/20">
              {logs.length} TOTAL LOGS
            </span>
            {isAdmin && (
              <span className="px-2 py-0.5 rounded-sm bg-red-500/10 text-red-400 text-xs font-mono font-semibold border border-red-500/20">
                ADMIN: FULL EDIT &amp; DELETE ACCESS
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            System activity ledger tracking user authentication, record modifications, arrests, and custody actions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV ({filteredLogs.length})
          </button>

          {isAdmin && logs.length > 0 && (
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-lg text-xs font-semibold uppercase tracking-wider border border-red-800/60 transition-colors"
              title="Delete all audit records"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              Purge All Logs
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
            placeholder="Search audit trail by actor, badge, IP, action, resource, or note details..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono flex-1 md:flex-initial"
          >
            <option value="ALL">All Actions</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="RECORD_CREATE">RECORD_CREATE</option>
            <option value="RECORD_UPDATE">RECORD_UPDATE</option>
            <option value="RECORD_DELETE">RECORD_DELETE</option>
            <option value="CASE_CREATE">CASE_CREATE</option>
            <option value="CASE_UPDATE">CASE_UPDATE</option>
            <option value="CASE_DELETE">CASE_DELETE</option>
            <option value="CUSTODY_TRANSFER">CUSTODY_TRANSFER</option>
            <option value="ARREST_CREATE">ARREST_CREATE</option>
            <option value="ARREST_UPDATE">ARREST_UPDATE</option>
            <option value="COMPLAINT_CREATE">COMPLAINT_CREATE</option>
            <option value="COMPLAINT_UPDATE">COMPLAINT_UPDATE</option>
            <option value="COMPLAINT_DELETE">COMPLAINT_DELETE</option>
            <option value="EVIDENCE_DELETE">EVIDENCE_DELETE</option>
            <option value="REPORT_EXPORT">REPORT_EXPORT</option>
            <option value="SETTINGS_UPDATE">SETTINGS_UPDATE</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono"
          >
            <option value="ALL">All Status</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Denied">Denied</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 font-mono text-slate-400 uppercase text-[11px]">
                <th className="py-2.5 px-3">Event Ref &amp; Time</th>
                <th className="py-2.5 px-3">Acting Official</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Target Resource</th>
                <th className="py-2.5 px-3">Subnet / IP</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Details</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="text-white font-bold">{l.id}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(l.timestamp).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-slate-200 font-sans font-medium">{l.userName}</div>
                      <div className="text-[10px] text-blue-400">{l.userBadge} ({l.userRole})</div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-sm text-[11px] border border-slate-700">
                        {l.action}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-slate-300">{l.resourceType}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{l.resourceId}</div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {l.ipAddress}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold border ${
                        l.status === 'Success'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : l.status === 'Failed'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {l.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-300" title={l.details}>
                      <span className="font-sans text-[11px] text-slate-400">{l.details}</span>
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedLog(l)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Admin Edit Button */}
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenEdit(l)}
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 rounded-md transition-colors"
                            title="Edit Audit Log"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Admin Delete Button */}
                        {isAdmin && (
                          <button
                            onClick={() => setDeletingLog(l)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-md transition-colors"
                            title="Delete Audit Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  Audit Inspection: {selectedLog.id}
                </h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-mono">Timestamp:</span>
                <span className="text-white font-mono">{selectedLog.timestamp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-mono">Acting Officer:</span>
                <span className="text-white font-mono">{selectedLog.userName} ({selectedLog.userBadge})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-mono">Role:</span>
                <span className="text-blue-400 font-mono font-semibold">{selectedLog.userRole}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-mono">Action Type:</span>
                <span className="text-indigo-400 font-mono font-bold">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-mono">Resource Reference:</span>
                <span className="text-white font-mono">{selectedLog.resourceType} - {selectedLog.resourceId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-mono">Network Subnet IP:</span>
                <span className="text-white font-mono">{selectedLog.ipAddress}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-mono">Outcome:</span>
                <span className={`font-mono font-bold ${
                  selectedLog.status === 'Success' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {selectedLog.status}
                </span>
              </div>

              <div className="pt-2">
                <span className="text-slate-400 font-mono block mb-1">Details &amp; Metadata:</span>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const log = selectedLog;
                      setSelectedLog(null);
                      handleOpenEdit(log);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Log
                  </button>
                  <button
                    onClick={() => {
                      const log = selectedLog;
                      setSelectedLog(null);
                      setDeletingLog(log);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Log
                  </button>
                </div>
              )}
              <button
                onClick={() => setSelectedLog(null)}
                className="ml-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Log Modal (Admin only) */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full my-8 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  Edit Audit Log: {editingLog.id}
                </h3>
              </div>
              <button onClick={() => setEditingLog(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Acting Official Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.userName}
                    onChange={(e) => setEditFormData({ ...editFormData, userName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Badge Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.userBadge}
                    onChange={(e) => setEditFormData({ ...editFormData, userBadge: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    User Role
                  </label>
                  <select
                    value={editFormData.userRole}
                    onChange={(e) => setEditFormData({ ...editFormData, userRole: e.target.value as UserRole })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Police Officer">Police Officer</option>
                    <option value="Investigator">Investigator</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Court Official">Court Official</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Action Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.action}
                    onChange={(e) => setEditFormData({ ...editFormData, action: e.target.value })}
                    placeholder="e.g. RECORD_UPDATE, CASE_CREATE"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Resource Type
                  </label>
                  <select
                    value={editFormData.resourceType}
                    onChange={(e) => setEditFormData({ ...editFormData, resourceType: e.target.value as AuditLog['resourceType'] })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden"
                  >
                    <option value="CriminalRecord">CriminalRecord</option>
                    <option value="Case">Case</option>
                    <option value="Arrest">Arrest</option>
                    <option value="Complaint">Complaint</option>
                    <option value="Evidence">Evidence</option>
                    <option value="User">User</option>
                    <option value="SystemSetting">SystemSetting</option>
                    <option value="ReportExport">ReportExport</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Resource ID
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.resourceId}
                    onChange={(e) => setEditFormData({ ...editFormData, resourceId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    IP Address
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.ipAddress}
                    onChange={(e) => setEditFormData({ ...editFormData, ipAddress: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Execution Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'Success' | 'Failed' | 'Denied' })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden"
                  >
                    <option value="Success">Success</option>
                    <option value="Failed">Failed</option>
                    <option value="Denied">Denied</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                  Details &amp; Summary Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={editFormData.details}
                  onChange={(e) => setEditFormData({ ...editFormData, details: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm"
                >
                  Save Log Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Single Log Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingLog)}
        title={`Delete Audit Entry: ${deletingLog?.id}`}
        message={`Are you sure you want to permanently delete this audit record? Action "${deletingLog?.action}" logged by ${deletingLog?.userName} (${deletingLog?.userBadge}) will be erased.`}
        confirmText="Permanently Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingLog(null)}
      />

      {/* Purge All Logs Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearAllModalOpen}
        title="Purge Entire Security Audit Trail"
        message="DANGER: This administrative operation will erase all audit entries from the ledger. Are you completely sure you want to proceed?"
        confirmText="Purge All Logs"
        cancelText="Abort"
        isDestructive={true}
        requiredConfirmationWord="PURGE"
        onConfirm={handleConfirmClearAll}
        onCancel={() => setIsClearAllModalOpen(false)}
      />
    </div>
  );
};
