import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  FileText,
  Shield,
  ShieldCheck,
  Briefcase,
  UserX,
  Package,
  Users,
  CheckCircle,
  FileCheck,
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
  RotateCcw,
  Clock,
  Building2,
  BadgePercent,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Search
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { exportToCsv, printReportDocument } from '../services/export';
import { Badge } from '../components/common/Badge';
import { ReportRecord, ReportStatus, ReportType } from '../types';

export const ReportsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [dbState, setDbState] = useState(storage.getState());

  // Listen to storage changes
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setDbState(storage.getState());
    });
    return unsub;
  }, []);

  const reports = dbState.reports || [];

  // Selected report ID
  const [selectedReportId, setSelectedReportId] = useState<string>('RPT-2026-001');
  const [viewMode, setViewMode] = useState<'report' | 'directory'>('report');

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Partial<ReportRecord> | null>(null);

  // Success message feedback
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Search filter for directory
  const [directorySearch, setDirectorySearch] = useState('');

  // Active report object
  const activeReport = useMemo(() => {
    return reports.find(r => r.id === selectedReportId) || reports[0] || null;
  }, [reports, selectedReportId]);

  // Sync date range with active report
  const [dateRange, setDateRange] = useState<'30' | '90' | '365' | 'all'>(
    activeReport?.dateRange || '90'
  );

  useEffect(() => {
    if (activeReport) {
      setDateRange(activeReport.dateRange || '90');
    }
  }, [activeReport?.id]);

  // Compute live analytical data
  const totalCases = dbState.cases.length;
  const closedCases = dbState.cases.filter(c => c.status === 'Closed').length;
  const clearanceRate = totalCases > 0 ? Math.round((closedCases / totalCases) * 100) : 0;

  // Officer Workload
  const officerWorkload = useMemo(() => {
    return dbState.users
      .filter(u => u.role === 'Investigator' || u.role === 'Police Officer')
      .map(u => {
        const assignedCases = dbState.cases.filter(c => c.primaryInvestigatorId === u.id || c.leadOfficerId === u.id).length;
        const assignedComplaints = dbState.complaints.filter(c => c.assignedOfficerId === u.id).length;
        const totalArrests = dbState.arrests.filter(a => a.arrestingOfficerId === u.id).length;
        return {
          officerName: u.name,
          role: u.role,
          badge: u.badgeNumber,
          assignedCases,
          assignedComplaints,
          totalArrests,
          totalActions: assignedCases + assignedComplaints + totalArrests
        };
      });
  }, [dbState]);

  // Open Edit Modal for a given report
  const handleOpenEdit = (reportToEdit?: ReportRecord) => {
    const target = reportToEdit || activeReport;
    if (!target) return;
    setEditingReport({ ...target });
    setIsEditModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingReport({
      id: '',
      title: '',
      subtitle: '',
      category: 'General Investigation',
      department: currentUser?.department || 'Metropolitan Police Department',
      status: 'Draft',
      reportType: 'cases_summary',
      benchmarkGoal: 70,
      dateRange: '90',
      summary: '',
      findings: '',
      recommendations: '',
      confidentialNotes: '',
      authorName: currentUser?.name || 'Officer',
      authorBadge: currentUser?.badgeNumber || 'PO-0000',
      authorRole: currentUser?.role || 'Police Officer'
    });
    setIsCreateModalOpen(true);
  };

  // Save report handler (used for both edit and create)
  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport || !editingReport.title || !currentUser) return;

    const saved = storage.saveReport(
      {
        ...editingReport,
        title: editingReport.title.trim()
      } as any,
      currentUser
    );

    setSelectedReportId(saved.id);
    setIsEditModalOpen(false);
    setIsCreateModalOpen(false);
    setEditingReport(null);

    setFeedbackMessage(`Report "${saved.title}" successfully saved and updated in registry.`);
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Delete report
  const handleDeleteReport = (reportId: string, title: string) => {
    if (!currentUser) return;
    if (confirm(`Are you sure you want to delete report "${title}"?`)) {
      storage.deleteReport(reportId, currentUser);
      if (selectedReportId === reportId) {
        const remaining = reports.filter(r => r.id !== reportId);
        if (remaining.length > 0) setSelectedReportId(remaining[0].id);
      }
      setFeedbackMessage(`Report "${title}" removed from database.`);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  // Export CSV Handler
  const handleExportCsv = () => {
    if (!currentUser || !activeReport) return;

    if (activeReport.reportType === 'cases_summary') {
      const rows = dbState.cases.map(c => ({
        'Case ID': c.id,
        'Title': c.title,
        'Category': c.crimeCategory,
        'Priority': c.priority,
        'Status': c.status,
        'Lead Investigator': c.primaryInvestigatorName,
        'Incident Date': c.incidentDate,
        'Court Docket': c.courtDocketNumber || 'N/A'
      }));
      exportToCsv(`CRMS_${activeReport.id}_Cases`, rows);
    } else if (activeReport.reportType === 'records_summary') {
      const rows = dbState.records.map(r => ({
        'Record ID': r.id,
        'National ID': r.nationalId,
        'Name': `${r.firstName} ${r.lastName}`,
        'Status': r.status,
        'Risk Level': r.riskLevel,
        'DOB': r.dateOfBirth
      }));
      exportToCsv(`CRMS_${activeReport.id}_Records`, rows);
    } else if (activeReport.reportType === 'officer_workload') {
      exportToCsv(`CRMS_${activeReport.id}_Workload`, officerWorkload);
    } else if (activeReport.reportType === 'evidence_inventory') {
      const rows = dbState.evidence.map(e => ({
        'Evidence ID': e.id,
        'Barcode': e.barcodeRef,
        'Category': e.category,
        'Description': e.description,
        'Status': e.status,
        'Locker': e.storageLocker
      }));
      exportToCsv(`CRMS_${activeReport.id}_Evidence`, rows);
    } else if (activeReport.reportType === 'arrests_summary') {
      const rows = dbState.arrests.map(a => ({
        'Arrest ID': a.id,
        'Suspect Name': a.suspectName,
        'Charges': a.statutoryCharges.join('; '),
        'Status': a.status,
        'Arresting Officer': a.arrestingOfficerName,
        'Date': a.arrestDate,
        'Facility': a.detentionFacility
      }));
      exportToCsv(`CRMS_${activeReport.id}_Arrests`, rows);
    } else {
      // Custom report generic export
      const rows = [
        {
          'Report ID': activeReport.id,
          'Title': activeReport.title,
          'Subtitle': activeReport.subtitle,
          'Status': activeReport.status,
          'Department': activeReport.department,
          'Author': `${activeReport.authorName} (${activeReport.authorBadge})`,
          'Executive Summary': activeReport.summary,
          'Findings': activeReport.findings,
          'Recommendations': activeReport.recommendations
        }
      ];
      exportToCsv(`CRMS_${activeReport.id}_CustomReport`, rows);
    }

    storage.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userBadge: currentUser.badgeNumber,
      action: 'REPORT_EXPORT',
      resourceType: 'ReportExport',
      resourceId: activeReport.id,
      resourceTitle: activeReport.title,
      status: 'Success',
      ipAddress: '10.240.10.2',
      details: `Generated CSV export for report docket ${activeReport.id}.`
    });
  };

  // Print Official PDF Report
  const handlePrintReport = () => {
    if (!currentUser || !activeReport) return;

    const title = activeReport.title.toUpperCase();
    const subtitle = `${activeReport.subtitle} | Author: ${activeReport.authorName} (${activeReport.authorBadge}) | Status: ${activeReport.status}`;

    let contentHtml = `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 6px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 6px 0; color: #0f172a; text-transform: uppercase; font-size: 13px;">Executive Summary</h4>
        <p style="margin: 0 0 10px 0; color: #334155; font-size: 12px; line-height: 1.6;">${activeReport.summary || 'No summary recorded.'}</p>
        
        <h4 style="margin: 0 0 6px 0; color: #0f172a; text-transform: uppercase; font-size: 13px;">Key Findings & Observations</h4>
        <p style="margin: 0 0 10px 0; color: #334155; font-size: 12px; line-height: 1.6;">${activeReport.findings || 'No key findings noted.'}</p>
        
        <h4 style="margin: 0 0 6px 0; color: #0f172a; text-transform: uppercase; font-size: 13px;">Department Directives & Recommendations</h4>
        <p style="margin: 0; color: #334155; font-size: 12px; line-height: 1.6;">${activeReport.recommendations || 'No recommendations recorded.'}</p>
      </div>
    `;

    if (activeReport.reportType === 'cases_summary') {
      const rosterHeading = activeReport.rosterTitle || 'Active and Historical Cases Roster';
      contentHtml += `
        <h3>${rosterHeading} (${dbState.cases.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Investigator</th>
              <th>Incident Date</th>
            </tr>
          </thead>
          <tbody>
            ${dbState.cases.map(c => `
              <tr>
                <td><strong>${c.id}</strong></td>
                <td>${c.title}</td>
                <td>${c.crimeCategory}</td>
                <td>${c.priority}</td>
                <td>${c.status}</td>
                <td>${c.primaryInvestigatorName}</td>
                <td>${new Date(c.incidentDate).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeReport.reportType === 'officer_workload') {
      contentHtml += `
        <h3>Officer Caseload & Enforcement Productivity Audit</h3>
        <table>
          <thead>
            <tr>
              <th>Officer Name</th>
              <th>Badge</th>
              <th>Rank / Role</th>
              <th>Assigned Cases</th>
              <th>Complaints</th>
              <th>Arrests Executed</th>
              <th>Total Output</th>
            </tr>
          </thead>
          <tbody>
            ${officerWorkload.map(o => `
              <tr>
                <td><strong>${o.officerName}</strong></td>
                <td>${o.badge}</td>
                <td>${o.role}</td>
                <td>${o.assignedCases}</td>
                <td>${o.assignedComplaints}</td>
                <td>${o.totalArrests}</td>
                <td><strong>${o.totalActions}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeReport.reportType === 'records_summary') {
      contentHtml += `
        <h3>Criminal Records Master Registry (${dbState.records.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Subject ID</th>
              <th>National ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Risk Level</th>
              <th>DOB</th>
            </tr>
          </thead>
          <tbody>
            ${dbState.records.map(r => `
              <tr>
                <td><strong>${r.id}</strong></td>
                <td>${r.nationalId}</td>
                <td>${r.firstName} ${r.lastName}</td>
                <td>${r.status}</td>
                <td>${r.riskLevel}</td>
                <td>${r.dateOfBirth}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeReport.reportType === 'evidence_inventory') {
      contentHtml += `
        <h3>Forensic Evidence Vault Inventory (${dbState.evidence.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Evidence ID</th>
              <th>Barcode</th>
              <th>Category</th>
              <th>Description</th>
              <th>Status</th>
              <th>Locker</th>
            </tr>
          </thead>
          <tbody>
            ${dbState.evidence.map(e => `
              <tr>
                <td><strong>${e.id}</strong></td>
                <td>${e.barcodeRef}</td>
                <td>${e.category}</td>
                <td>${e.description}</td>
                <td>${e.status}</td>
                <td>${e.storageLocker}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeReport.reportType === 'arrests_summary') {
      contentHtml += `
        <h3>Custodial Arrests & Detention Intake Ledger (${dbState.arrests.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Arrest ID</th>
              <th>Suspect Name</th>
              <th>Charges</th>
              <th>Facility</th>
              <th>Arresting Officer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${dbState.arrests.map(a => `
              <tr>
                <td><strong>${a.id}</strong></td>
                <td>${a.suspectName}</td>
                <td>${a.statutoryCharges.join(', ')}</td>
                <td>${a.detentionFacility}</td>
                <td>${a.arrestingOfficerName}</td>
                <td>${a.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    printReportDocument(title, subtitle, contentHtml, {
      sealText: activeReport.sealText || 'OFFICIAL CRMS SEAL\nDIGITALLY SIGNED & VERIFIED',
      sealReference: activeReport.sealReference || 'REF: R7Z78MS6',
      officerSignature: activeReport.officerSignature || 'Authorized Officer Signature: __________________________',
      signatureDateBadge: activeReport.signatureDateBadge || 'Date / Badge Number: __________________________'
    });

    storage.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userBadge: currentUser.badgeNumber,
      action: 'REPORT_PRINT',
      resourceType: 'ReportExport',
      resourceId: activeReport.id,
      resourceTitle: activeReport.title,
      status: 'Success',
      ipAddress: '10.240.10.2',
      details: `Printed official report docket ${activeReport.id}.`
    });
  };

  // Filtered reports for directory view
  const filteredDirectoryReports = useMemo(() => {
    if (!directorySearch.trim()) return reports;
    const q = directorySearch.toLowerCase().trim();
    return reports.filter(
      r =>
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.authorName.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [reports, directorySearch]);

  const getStatusBadgeColor = (status: ReportStatus) => {
    switch (status) {
      case 'Certified Official':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Approved':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Under Review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Draft':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-mono animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wide">
              Reports &amp; Analytics Dockets
            </h1>
            <span className="px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 text-xs font-mono font-semibold border border-blue-500/20">
              AUDITED DATABASE
            </span>
            {activeReport && (
              <span
                className={`px-2 py-0.5 rounded-sm text-xs font-mono font-semibold border ${getStatusBadgeColor(
                  activeReport.status
                )}`}
              >
                {activeReport.status.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Certified law enforcement summary tables, clearance metrics, officer workload, and fully editable official dossiers.
          </p>
        </div>

        {/* Action Buttons: Edit, Create, Export, Print */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit Report Button */}
          {activeReport && viewMode === 'report' && (
            <button
              onClick={() => handleOpenEdit()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              title="Edit this report's title, summary, findings, and directives"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Report
            </button>
          )}

          {/* New Report Button */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold uppercase tracking-wider border border-slate-700 transition-colors cursor-pointer"
            title="Create a new custom law enforcement report"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            New Report
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            disabled={!activeReport}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {/* Print PDF */}
          <button
            onClick={handlePrintReport}
            disabled={!activeReport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Official PDF
          </button>
        </div>
      </div>

      {/* Report Switcher & View Mode Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Report selection buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {reports.map(r => (
            <button
              key={r.id}
              onClick={() => {
                setSelectedReportId(r.id);
                setViewMode('report');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'report' && selectedReportId === r.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{r.title}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-xs ${
                  viewMode === 'report' && selectedReportId === r.id
                    ? 'bg-blue-700/60 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {r.id}
              </span>
            </button>
          ))}

          {/* Manage / Directory tab */}
          <button
            onClick={() => setViewMode('directory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'directory'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-950 text-indigo-400 hover:bg-slate-800 border border-indigo-500/20'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Manage All Reports ({reports.length})</span>
          </button>
        </div>

        {/* Date period dropdown */}
        {viewMode === 'report' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Archive Period:</span>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-hidden font-mono"
            >
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days (Quarter)</option>
              <option value="365">Last 12 Months (Annual)</option>
              <option value="all">Full Jurisdiction Archive</option>
            </select>
          </div>
        )}
      </div>

      {/* DIRECTORY VIEW: List and manage all reports with Edit buttons */}
      {viewMode === 'directory' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-400" />
                Department Reports Repository &amp; Docket Directory ({reports.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage, edit, review, and print all officially filed statistical and intelligence reports.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter reports by title, ID, author..."
                  value={directorySearch}
                  onChange={e => setDirectorySearch(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-hidden w-64"
                />
              </div>
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Report
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 font-mono text-slate-400 uppercase text-[11px]">
                  <th className="py-2.5 px-3">Docket ID</th>
                  <th className="py-2.5 px-3">Report Title</th>
                  <th className="py-2.5 px-3">Category / Department</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Author</th>
                  <th className="py-2.5 px-3">Last Modified</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredDirectoryReports.map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-blue-400">{r.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white font-sans">{r.title}</div>
                      <div className="text-[11px] text-slate-400 font-sans line-clamp-1">{r.subtitle}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-300">{r.category}</div>
                      <div className="text-[10px] text-slate-500">{r.department}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold border ${getStatusBadgeColor(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <div>{r.authorName}</div>
                      <div className="text-[10px] text-slate-500">{r.authorBadge}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {r.lastEditedAt
                        ? new Date(r.lastEditedAt).toLocaleDateString()
                        : new Date(r.updatedAt || r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedReportId(r.id);
                            setViewMode('report');
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-semibold cursor-pointer"
                          title="View complete report data and metrics"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Edit this report"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                        {reports.length > 1 && (
                          <button
                            onClick={() => handleDeleteReport(r.id, r.title)}
                            className="p-1 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                            title="Delete report docket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT VIEW: Details, editable briefing card, and data breakdown */}
      {viewMode === 'report' && activeReport && (
        <>
          {/* Editable Report Dossier Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400 tracking-wider">
                    {activeReport.id}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="font-mono text-xs text-slate-400">{activeReport.category}</span>
                  <span className="text-slate-600">•</span>
                  <span className="font-mono text-xs text-slate-400">{activeReport.department}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {activeReport.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">{activeReport.subtitle}</p>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-sm text-xs font-mono font-semibold border ${getStatusBadgeColor(
                      activeReport.status
                    )}`}
                  >
                    {activeReport.status}
                  </span>
                  <button
                    onClick={() => handleOpenEdit()}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Details
                  </button>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Lead: <span className="text-slate-200">{activeReport.authorName}</span> (
                  {activeReport.authorBadge})
                </div>
                {activeReport.lastEditedBy && (
                  <div className="text-[10px] font-mono text-amber-400/80">
                    Last edited by {activeReport.lastEditedBy} on{' '}
                    {activeReport.lastEditedAt
                      ? new Date(activeReport.lastEditedAt).toLocaleDateString()
                      : 'recently'}
                  </div>
                )}
              </div>
            </div>

            {/* Executive Summary, Findings & Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wide">
                  <span>Executive Summary</span>
                  <button
                    onClick={() => handleOpenEdit()}
                    className="text-slate-500 hover:text-amber-400 cursor-pointer"
                    title="Edit summary"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeReport.summary || 'No executive summary provided. Click Edit to add one.'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wide">
                  <span>Key Findings</span>
                  <button
                    onClick={() => handleOpenEdit()}
                    className="text-slate-500 hover:text-amber-400 cursor-pointer"
                    title="Edit findings"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeReport.findings || 'No key findings logged. Click Edit to record observations.'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wide">
                  <span>Directives &amp; Actions</span>
                  <button
                    onClick={() => handleOpenEdit()}
                    className="text-slate-500 hover:text-amber-400 cursor-pointer"
                    title="Edit recommendations"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeReport.recommendations ||
                    'No action directives configured. Click Edit to add recommendations.'}
                </p>
              </div>
            </div>
          </div>

          {/* KPI Cards for the Report */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Total Case Intake</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{totalCases} Cases</div>
              <div className="text-[10px] text-slate-400 mt-1">Classified incidents</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Resolved / Closed</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {closedCases} Cases
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Judicial finality</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                Clearance Benchmark ({activeReport.benchmarkGoal ?? 65}%)
              </div>
              <div className="text-2xl font-bold font-mono text-blue-400 mt-1">{clearanceRate}%</div>
              <div className="text-[10px] text-slate-400 mt-1">
                {clearanceRate >= (activeReport.benchmarkGoal ?? 65)
                  ? 'Target achieved'
                  : 'Requires monitoring'}
              </div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Custodial Arrests</div>
              <div className="text-2xl font-bold font-mono text-orange-400 mt-1">
                {dbState.arrests.length} Bookings
              </div>
              <div className="text-[10px] text-slate-400 mt-1">100% Warrants executed</div>
            </div>
          </div>

          {/* Data Tables depending on Report Type */}
          {activeReport.reportType === 'cases_summary' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  {activeReport.rosterTitle || 'Active and Historical Cases Roster'} ({dbState.cases.length})
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Docket Ref: {activeReport.id}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 font-mono text-slate-400 uppercase text-[11px]">
                      <th className="py-2.5 px-3">Case ID</th>
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Lead Investigator</th>
                      <th className="py-2.5 px-3">Incident Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {dbState.cases.map(c => (
                      <tr key={c.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-400">{c.id}</td>
                        <td className="py-2.5 px-3 font-semibold text-white">{c.title}</td>
                        <td className="py-2.5 px-3 text-slate-300">{c.crimeCategory}</td>
                        <td className="py-2.5 px-3">
                          <Badge type="casePriority" value={c.priority} size="sm" />
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge type="caseStatus" value={c.status} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{c.primaryInvestigatorName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {new Date(c.incidentDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport.reportType === 'officer_workload' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Officer Caseload &amp; Enforcement Output ({officerWorkload.length})
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Department Personnel Performance Audit
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 font-mono text-slate-400 uppercase text-[11px]">
                      <th className="py-2.5 px-3">Officer Name</th>
                      <th className="py-2.5 px-3">Badge</th>
                      <th className="py-2.5 px-3">Rank / Role</th>
                      <th className="py-2.5 px-3">Active Cases</th>
                      <th className="py-2.5 px-3">Complaints</th>
                      <th className="py-2.5 px-3">Arrest Bookings</th>
                      <th className="py-2.5 px-3 text-right">Workload Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {officerWorkload.map(o => (
                      <tr key={o.badge} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-semibold text-white">{o.officerName}</td>
                        <td className="py-2.5 px-3 font-mono text-blue-400">{o.badge}</td>
                        <td className="py-2.5 px-3 text-slate-300">{o.role}</td>
                        <td className="py-2.5 px-3 font-mono text-indigo-400 font-bold">
                          {o.assignedCases}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-amber-400">
                          {o.assignedComplaints}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-orange-400">
                          {o.totalArrests}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-white font-bold text-right">
                          {o.totalActions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport.reportType === 'records_summary' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Criminal Record Registry Breakdown ({dbState.records.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 font-mono text-slate-400 uppercase text-[11px]">
                      <th className="py-2.5 px-3">Subject ID</th>
                      <th className="py-2.5 px-3">Full Legal Name</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Risk Assessment</th>
                      <th className="py-2.5 px-3">DOB</th>
                      <th className="py-2.5 px-3">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {dbState.records.map(r => (
                      <tr key={r.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono text-blue-400 font-bold">{r.id}</td>
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {r.firstName} {r.lastName}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge type="recordStatus" value={r.status} size="sm" />
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge type="riskLevel" value={r.riskLevel} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">{r.dateOfBirth}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport.reportType === 'evidence_inventory' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Evidence Vault Forensic Inventory ({dbState.evidence.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 font-mono text-slate-400 uppercase text-[11px]">
                      <th className="py-2.5 px-3">Evidence ID</th>
                      <th className="py-2.5 px-3">Barcode</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Storage Locker</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {dbState.evidence.map(e => (
                      <tr key={e.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono text-purple-400 font-bold">{e.id}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{e.barcodeRef}</td>
                        <td className="py-2.5 px-3 text-slate-300">{e.category}</td>
                        <td className="py-2.5 px-3 font-medium text-white">{e.description}</td>
                        <td className="py-2.5 px-3">
                          <Badge type="evidenceStatus" value={e.status} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">{e.storageLocker}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport.reportType === 'arrests_summary' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Custodial Arrests &amp; Booking Intake Log ({dbState.arrests.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 font-mono text-slate-400 uppercase text-[11px]">
                      <th className="py-2.5 px-3">Arrest ID</th>
                      <th className="py-2.5 px-3">Suspect Name</th>
                      <th className="py-2.5 px-3">Statutory Charges</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Arresting Officer</th>
                      <th className="py-2.5 px-3">Booking Facility</th>
                      <th className="py-2.5 px-3">Arrest Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {dbState.arrests.map(a => (
                      <tr key={a.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono text-orange-400 font-bold">{a.id}</td>
                        <td className="py-2.5 px-3 font-semibold text-white">{a.suspectName}</td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {a.statutoryCharges.join(', ')}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge type="arrestStatus" value={a.status} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {a.arrestingOfficerName} ({a.arrestingOfficerBadge})
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {a.detentionFacility}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {new Date(a.arrestDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport.reportType === 'custom_investigation' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Custom Investigation Dossier Records
                </h3>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-3">
                <div>
                  <span className="font-mono text-slate-400">Reporting Officer: </span>
                  <span className="text-white font-semibold">
                    {activeReport.authorName} ({activeReport.authorBadge}) - {activeReport.authorRole}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-slate-400">Confidential Officer Remarks: </span>
                  <p className="mt-1 text-slate-300 italic">
                    {activeReport.confidentialNotes || 'No restricted notes logged.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* OFFICIAL CRMS SEAL & AUTHORIZED OFFICER SIGNATURE DOSSIER BLOCK */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                    Official CRMS Seal &amp; Attestation
                  </h4>
                  <p className="text-xs text-slate-400">
                    Statutory authorization, verified seal, and signing officer credentials.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingReport({ ...activeReport });
                  setIsEditModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Seal &amp; Signatures</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {/* Seal Stamp Box */}
              <div className="p-4 bg-slate-950 border-2 border-dashed border-slate-700 rounded-xl text-center space-y-1">
                <div className="inline-flex items-center justify-center p-2 rounded-full bg-blue-500/10 text-blue-400 mb-1 border border-blue-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider whitespace-pre-line leading-relaxed">
                  {activeReport.sealText || 'OFFICIAL CRMS SEAL\nDIGITALLY SIGNED & VERIFIED'}
                </div>
                <div className="text-[11px] font-mono text-emerald-400 font-bold tracking-widest pt-1">
                  {activeReport.sealReference || 'REF: R7Z78MS6'}
                </div>
              </div>

              {/* Authorized Signature Block */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block mb-1">Authorized Officer Signature:</span>
                  <div className="p-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-white font-semibold flex items-center justify-between">
                    <span className="truncate">
                      {activeReport.officerSignature || 'Authorized Officer Signature: __________________________'}
                    </span>
                    <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider shrink-0 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      Attested
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block mb-1">Date / Badge Number:</span>
                  <div className="p-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-300">
                    {activeReport.signatureDateBadge || 'Date / Badge Number: __________________________'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* EDIT / CREATE REPORT MODAL */}
      {(isEditModalOpen || isCreateModalOpen) && editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    {isCreateModalOpen ? 'Create New Law Enforcement Report' : `Edit Report: ${editingReport.id || 'Docket'}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isCreateModalOpen
                      ? 'Configure official report parameters and findings.'
                      : 'Modify report titles, classifications, executive summaries, and action plans.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setIsCreateModalOpen(false);
                  setEditingReport(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveReport} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    Report Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingReport.title || ''}
                    onChange={e => setEditingReport({ ...editingReport, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-sans"
                    placeholder="e.g. Case Clearance & Felony Audit Report"
                  />
                </div>

                {/* Subtitle */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    Docket Description / Subtitle
                  </label>
                  <input
                    type="text"
                    value={editingReport.subtitle || ''}
                    onChange={e => setEditingReport({ ...editingReport, subtitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-sans"
                    placeholder="e.g. Classified felony intake and judicial dispositions"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    Report Category
                  </label>
                  <input
                    type="text"
                    value={editingReport.category || ''}
                    onChange={e => setEditingReport({ ...editingReport, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                    placeholder="e.g. Case Clearance & Prosecution"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    Jurisdiction / Department
                  </label>
                  <input
                    type="text"
                    value={editingReport.department || ''}
                    onChange={e => setEditingReport({ ...editingReport, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                    placeholder="e.g. CID - Major Crimes Division"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    Classification Status
                  </label>
                  <select
                    value={editingReport.status || 'Draft'}
                    onChange={e => setEditingReport({ ...editingReport, status: e.target.value as ReportStatus })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 font-mono"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Certified Official">Certified Official</option>
                  </select>
                </div>

                {/* Benchmark Goal % */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    Clearance Benchmark Target (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingReport.benchmarkGoal ?? 65}
                    onChange={e =>
                      setEditingReport({ ...editingReport, benchmarkGoal: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>

                {/* Report Type (if creating new) */}
                {isCreateModalOpen && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                      Report Data Engine
                    </label>
                    <select
                      value={editingReport.reportType || 'cases_summary'}
                      onChange={e =>
                        setEditingReport({ ...editingReport, reportType: e.target.value as ReportType })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 font-mono"
                    >
                      <option value="cases_summary">Case Clearance &amp; Investigations</option>
                      <option value="records_summary">Criminal Record Master Registry</option>
                      <option value="officer_workload">Officer Caseload &amp; Output</option>
                      <option value="evidence_inventory">Forensic Vault Inventory</option>
                      <option value="arrests_summary">Custodial Arrests &amp; Bookings</option>
                      <option value="custom_investigation">Custom Task Force / Special Briefing</option>
                    </select>
                  </div>
                )}

                {/* Author Name */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    Reporting Officer / Author
                  </label>
                  <input
                    type="text"
                    value={editingReport.authorName || ''}
                    onChange={e => setEditingReport({ ...editingReport, authorName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 font-sans"
                  />
                </div>

                {/* Author Badge */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    Author Badge Number
                  </label>
                  <input
                    type="text"
                    value={editingReport.authorBadge || ''}
                    onChange={e => setEditingReport({ ...editingReport, authorBadge: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Executive Summary */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                  Executive Summary
                </label>
                <textarea
                  rows={3}
                  value={editingReport.summary || ''}
                  onChange={e => setEditingReport({ ...editingReport, summary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-sans leading-relaxed"
                  placeholder="Overview of jurisdiction performance, case closure ratios, or custody audit metrics..."
                />
              </div>

              {/* Key Findings */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                  Key Findings &amp; Officer Observations
                </label>
                <textarea
                  rows={3}
                  value={editingReport.findings || ''}
                  onChange={e => setEditingReport({ ...editingReport, findings: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-sans leading-relaxed"
                  placeholder="Highlight key clearance achievements, suspect apprehensions, forensic integrity flags..."
                />
              </div>

              {/* Directives & Recommendations */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                  Department Recommendations &amp; Action Plan
                </label>
                <textarea
                  rows={3}
                  value={editingReport.recommendations || ''}
                  onChange={e => setEditingReport({ ...editingReport, recommendations: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-sans leading-relaxed"
                  placeholder="Action directives, resource allocation, detective workload reassignments..."
                />
              </div>

              {/* Confidential Notes */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                  Confidential / Internal Notes (Restricted)
                </label>
                <textarea
                  rows={2}
                  value={editingReport.confidentialNotes || ''}
                  onChange={e => setEditingReport({ ...editingReport, confidentialNotes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono text-[11px]"
                  placeholder="Internal audit notes, internal affairs verification, or sealed judicial references..."
                />
              </div>

              {/* Official Roster, Verification Seal & Signatures Section */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Official Roster, Seal &amp; Verification Signatures</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Roster Title */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                      Active Cases / Record Roster Header Title
                    </label>
                    <input
                      type="text"
                      value={editingReport.rosterTitle ?? 'Active and Historical Cases Roster'}
                      onChange={e => setEditingReport({ ...editingReport, rosterTitle: e.target.value })}
                      placeholder="e.g. Active and Historical Cases Roster"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-sans"
                    />
                  </div>

                  {/* Official Seal Text */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                      Official Seal Stamp Text
                    </label>
                    <textarea
                      rows={2}
                      value={editingReport.sealText ?? 'OFFICIAL CRMS SEAL\nDIGITALLY SIGNED & VERIFIED'}
                      onChange={e => setEditingReport({ ...editingReport, sealText: e.target.value })}
                      placeholder="e.g. OFFICIAL CRMS SEAL&#10;DIGITALLY SIGNED &amp; VERIFIED"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono text-[11px]"
                    />
                  </div>

                  {/* Seal Reference Code */}
                  <div>
                    <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                      Digital Verification Ref (REF)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingReport.sealReference ?? 'REF: R7Z78MS6'}
                        onChange={e => setEditingReport({ ...editingReport, sealReference: e.target.value })}
                        placeholder="e.g. REF: R7Z78MS6"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-hidden focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newRef = `REF: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
                          setEditingReport({ ...editingReport, sealReference: newRef });
                        }}
                        className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded-lg border border-slate-700 shrink-0 cursor-pointer"
                        title="Generate a random reference code"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  {/* Signature Date & Badge Number */}
                  <div>
                    <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                      Date / Badge Number
                    </label>
                    <input
                      type="text"
                      value={editingReport.signatureDateBadge ?? 'Date / Badge Number: __________________________'}
                      onChange={e => setEditingReport({ ...editingReport, signatureDateBadge: e.target.value })}
                      placeholder="e.g. 2026-10-15 / Badge: ADM-001 or Date / Badge Number: __________________________"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
                    />
                  </div>

                  {/* Authorized Officer Signature */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                      Authorized Officer Signature
                    </label>
                    <input
                      type="text"
                      value={editingReport.officerSignature ?? 'Authorized Officer Signature: __________________________'}
                      onChange={e => setEditingReport({ ...editingReport, officerSignature: e.target.value })}
                      placeholder="e.g. Director Elena Vance (Assistant Commissioner) or Authorized Officer Signature: __________________________"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-sans font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setIsCreateModalOpen(false);
                    setEditingReport(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save &amp; Update Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
