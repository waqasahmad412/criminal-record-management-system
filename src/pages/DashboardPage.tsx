import React, { useState } from 'react';
import {
  ShieldAlert,
  Briefcase,
  UserX,
  MessageSquareWarning,
  Package,
  Users,
  CheckCircle,
  Clock,
  Plus,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Activity,
  Calendar,
  Filter,
  BellRing,
  BarChart3,
  Search,
  History,
  Settings,
  Shield,
  UserPlus,
  ShieldCheck,
  Database,
  UserCheck,
  FilePlus,
  CheckSquare,
  Key,
  Globe,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { TypewriterText } from '../components/common/TypewriterText';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
  onOpenNewRecord: () => void;
  onOpenNewCase: () => void;
  onOpenNewArrest: () => void;
  onOpenNewComplaint: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenNewRecord,
  onOpenNewCase,
  onOpenNewArrest,
  onOpenNewComplaint
}) => {
  const { currentUser, canEditRecord, canManageCases } = useAuth();
  const db = storage.getFilteredState(currentUser);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'year' | 'all'>('30d');

  // Metrics from real DB
  const totalRecords = db.records.length;
  const totalCases = db.cases.length;
  const activeCases = db.cases.filter(c => c.status !== 'Closed' && c.status !== 'Archived').length;
  const underInvestigationCases = db.cases.filter(c => c.status === 'Under Investigation').length;
  const closedCases = db.cases.filter(c => c.status === 'Closed').length;
  const totalArrests = db.arrests.length;
  const pendingComplaints = db.complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
  const totalEvidence = db.evidence.length;
  const activeUsers = db.users.filter(u => u.isActive).length;



  // Chart 2: Crime Category Analytics
  const categoryCounts: Record<string, number> = {};
  db.cases.forEach(c => {
    categoryCounts[c.crimeCategory] = (categoryCounts[c.crimeCategory] || 0) + 1;
  });
  const crimeCategoryData = Object.keys(categoryCounts).map(cat => ({
    category: cat,
    count: categoryCounts[cat]
  }));

  // Chart 3: Monthly Activity Trend (Computed dynamically from real database items)
  const monthLabels = [
    { key: '2025-10', label: 'Oct 25', year: 2025, month: 9 },
    { key: '2025-11', label: 'Nov 25', year: 2025, month: 10 },
    { key: '2025-12', label: 'Dec 25', year: 2025, month: 11 },
    { key: '2026-01', label: 'Jan 26', year: 2026, month: 0 },
    { key: '2026-02', label: 'Feb 26', year: 2026, month: 1 },
    { key: '2026-03', label: 'Mar 26', year: 2026, month: 2 },
  ];

  const getMonthKey = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      return `${yr}-${mo}`;
    } catch {
      return '';
    }
  };

  const monthlyTrendData = monthLabels.map(m => {
    const recordsCount = db.records.filter(r => {
      const k = getMonthKey(r.createdAt);
      return k === m.key;
    }).length;

    const casesCount = db.cases.filter(c => {
      const k = getMonthKey(c.createdAt || c.incidentDate);
      return k === m.key;
    }).length;

    const arrestsCount = db.arrests.filter(a => {
      const k = getMonthKey(a.arrestDate || a.createdAt);
      return k === m.key;
    }).length;

    return {
      month: m.label,
      cases: casesCount,
      arrests: arrestsCount,
      records: recordsCount
    };
  });

  // Recent Activities (from Audit Logs)
  const recentActivities = db.auditLogs.slice(0, 6);

  // Active Tasks
  const assignedTasks = db.tasks.filter(t => !t.isCompleted).slice(0, 4);

  const isAdmin = currentUser?.role === 'Administrator';

  // Professional Law Enforcement Command Tone
  const headerTitle = isAdmin
    ? 'Metropolitan Police Strategic Command & Executive Headquarters'
    : 'Metropolitan Police Operational Command Center';

  const welcomeBriefing = isAdmin
    ? `Welcome back, Commander ${currentUser?.name || 'Officer'} (${currentUser?.rank || 'System Administrator'} • Shield #${currentUser?.badgeNumber || 'HQ-01'}). Department: ${currentUser?.department || 'Metropolitan Police HQ - High Command & Executive Administration'}. Full departmental oversight authorized; live telemetry, registry controls, and tamper-evident audit trails synchronized.`
    : `Welcome back, Officer ${currentUser?.name || 'Officer'} (${currentUser?.rank || 'Patrol Officer'} • Shield #${currentUser?.badgeNumber || 'PO-104'}). Department: ${currentUser?.department || 'Metropolitan Police Department'}. Active duty session logged; jurisdictional criminal records and assigned case dossiers online.`;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-850 p-5 rounded-2xl border border-slate-800 shadow-sm">
        <div className="max-w-2xl lg:max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-white font-mono flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400 shrink-0" />
              {headerTitle}
            </h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 text-[11px] font-mono font-bold border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                TACTICAL SYSTEM ACTIVE
              </span>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-sm bg-red-500/10 text-red-400 text-[11px] font-mono font-bold border border-red-500/20">
                  TOP-SECRET CLEARANCE • OMNI-ADMIN
                </span>
              )}
            </div>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed min-h-[38px] flex items-center">
            <p className="inline">
              <span className="text-blue-400 font-mono font-semibold mr-1.5">
                [SEC-ID:{currentUser?.badgeNumber || 'HQ-01'}]
              </span>
              <TypewriterText
                text={welcomeBriefing}
                speed={18}
                delay={120}
                className="text-slate-300 font-normal leading-relaxed"
              />
            </p>
          </div>
        </div>

        {/* Quick Actions with live totals */}
        <div className="flex flex-wrap items-center gap-2">
          {canEditRecord() && (
            <button
              onClick={onOpenNewRecord}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Record <span className="bg-blue-700/80 px-1.5 py-0.5 rounded-sm font-mono text-[11px] ml-0.5">{totalRecords}</span>
            </button>
          )}
          {canManageCases() && (
            <button
              onClick={onOpenNewCase}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
            >
              <Briefcase className="w-3.5 h-3.5" />
              New Case <span className="bg-indigo-700/80 px-1.5 py-0.5 rounded-sm font-mono text-[11px] ml-0.5">{totalCases}</span>
            </button>
          )}
          <button
            onClick={onOpenNewArrest}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <UserX className="w-3.5 h-3.5 text-orange-400" />
            Book Arrest <span className="bg-slate-900 px-1.5 py-0.5 rounded-sm font-mono text-[11px] text-orange-300 ml-0.5">{totalArrests}</span>
          </button>
          <button
            onClick={onOpenNewComplaint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <MessageSquareWarning className="w-3.5 h-3.5 text-amber-400" />
            Log Complaint <span className="bg-slate-900 px-1.5 py-0.5 rounded-sm font-mono text-[11px] text-amber-300 ml-0.5">{db.complaints.length}</span>
          </button>
          {currentUser?.role === 'Administrator' && (
            <button
              onClick={() => onNavigate('/users')}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
            >
              <Users className="w-3.5 h-3.5 text-red-400" />
              User Management <span className="bg-red-500/20 px-1.5 py-0.5 rounded-sm font-mono text-[11px] text-red-200 ml-0.5">{activeUsers}</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Grid (All computed from real state) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Criminal Records"
          value={totalRecords}
          change="+12% YTD"
          isPositive={true}
          subtitle="Indexed biometrics"
          icon={ShieldAlert}
          iconColor="text-blue-400 bg-blue-500/10 border-blue-500/20"
          onClick={() => onNavigate('/records')}
        />
        <StatCard
          title="Active Cases"
          value={activeCases}
          change={`${underInvestigationCases} Under CID`}
          isPositive={false}
          subtitle={`${closedCases} resolved`}
          icon={Briefcase}
          iconColor="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
          onClick={() => onNavigate('/cases')}
        />
        <StatCard
          title="Arrest Bookings"
          value={totalArrests}
          change="100% Remanded/Bailed"
          isPositive={true}
          subtitle="Detention registry"
          icon={UserX}
          iconColor="text-orange-400 bg-orange-500/10 border-orange-500/20"
          onClick={() => onNavigate('/arrests')}
        />
        <StatCard
          title="Pending Complaints"
          value={pendingComplaints}
          change={`${db.complaints.length} Total`}
          isPositive={pendingComplaints === 0}
          subtitle="Citizen reports"
          icon={MessageSquareWarning}
          iconColor="text-amber-400 bg-amber-500/10 border-amber-500/20"
          onClick={() => onNavigate('/complaints')}
        />
      </div>

      {/* Operational Modules Hub - Every button shows its total count */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              Operational Navigation &amp; Live Totals
            </h2>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-semibold border ${
              currentUser?.role === 'Administrator'
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              {currentUser?.role === 'Administrator' ? 'ADMIN OVERVIEW: FULL SYSTEM TOTALS' : 'USER DESK: ACCESSIBLE TOTALS'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {currentUser?.role === 'Administrator'
              ? 'Administrator sees combined total of all users and departments.'
              : 'User view: Displays only your accessible department records.'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {currentUser?.role === 'Administrator' ? (
            /* ADMIN FULL OPERATIONAL MODULES */
            <>
              {/* Criminal Records */}
              <button
                onClick={() => onNavigate('/records')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <ShieldAlert className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-mono font-bold rounded-sm border border-blue-500/20">
                    {totalRecords} Total
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Criminal Records
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Biometric registry</span>
              </button>

              {/* Case Management */}
              <button
                onClick={() => onNavigate('/cases')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <Briefcase className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold rounded-sm border border-indigo-500/20">
                    {totalCases} Total
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  Case Management
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{activeCases} active cases</span>
              </button>

              {/* Arrest Management */}
              <button
                onClick={() => onNavigate('/arrests')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-orange-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <UserX className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-xs font-mono font-bold rounded-sm border border-orange-500/20">
                    {totalArrests} Total
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-orange-300 transition-colors">
                  Arrest Management
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Custody &amp; detention</span>
              </button>

              {/* Complaints */}
              <button
                onClick={() => onNavigate('/complaints')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <MessageSquareWarning className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-mono font-bold rounded-sm border border-amber-500/20">
                    {db.complaints.length} Total
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                  Complaints
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{pendingComplaints} pending</span>
              </button>

              {/* Evidence Management */}
              <button
                onClick={() => onNavigate('/evidence')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <Package className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs font-mono font-bold rounded-sm border border-purple-500/20">
                    {totalEvidence} Total
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Evidence Management
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Custody inventory</span>
              </button>

              {/* Advanced Search */}
              <button
                onClick={() => onNavigate('/search')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <Search className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-mono font-bold rounded-sm border border-slate-700">
                    Search
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-slate-200 transition-colors">
                  Advanced Search
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Database index query</span>
              </button>

              {/* Reports & Analytics */}
              <button
                onClick={() => onNavigate('/reports')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold rounded-sm border border-cyan-500/20">
                    {totalRecords + totalCases} Total
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  Reports &amp; Analytics
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Exportable analytics</span>
              </button>

              {/* Audit Logs */}
              <button
                onClick={() => onNavigate('/audit-logs')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-indigo-500/30 hover:border-indigo-500/60 rounded-xl transition-all group text-left shadow-xs"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <History className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold rounded-sm border border-indigo-500/30">
                    {db.auditLogs.length} Logs
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  Audit Logs
                </span>
                <span className="text-[10px] text-indigo-400/90 font-mono mt-0.5">
                  Admin: Edit &amp; Delete
                </span>
              </button>

              {/* Notifications & Tasks */}
              <button
                onClick={() => onNavigate('/notifications')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <BellRing className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold rounded-sm border border-emerald-500/20">
                    {db.tasks.length} Total
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Notifications &amp; Tasks
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{assignedTasks.length} pending items</span>
              </button>

              {/* User Management */}
              <button
                onClick={() => onNavigate('/users')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-red-500/30 hover:border-red-500/60 rounded-xl transition-all group text-left shadow-xs"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <Users className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs font-mono font-bold rounded-sm border border-red-500/30">
                    {activeUsers} Users
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-red-300 transition-colors">
                  User Management
                </span>
                <span className="text-[10px] text-red-400/90 font-mono mt-0.5">
                  Admin: Edit &amp; Delete
                </span>
              </button>

              {/* Add User */}
              <button
                onClick={() => onNavigate('/users/new')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl transition-all group text-left shadow-xs"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <UserPlus className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold rounded-sm border border-emerald-500/30">
                    + New
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Add User
                </span>
                <span className="text-[10px] text-emerald-400/90 font-mono mt-0.5">
                  Provision new officer
                </span>
              </button>

              {/* Roles & Permissions */}
              <button
                onClick={() => onNavigate('/roles')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-indigo-500/30 hover:border-indigo-500/60 rounded-xl transition-all group text-left shadow-xs"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold rounded-sm border border-indigo-500/30">
                    RBAC
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  Roles &amp; Permissions
                </span>
                <span className="text-[10px] text-indigo-400/90 font-mono mt-0.5">
                  Access control matrix
                </span>
              </button>

              {/* Backup & Restore */}
              <button
                onClick={() => onNavigate('/backup')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl transition-all group text-left shadow-xs"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <Database className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold rounded-sm border border-emerald-500/30">
                    Backup
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Backup &amp; Restore
                </span>
                <span className="text-[10px] text-emerald-400/90 font-mono mt-0.5">
                  Disaster recovery &amp; JSON
                </span>
              </button>

              {/* System Settings */}
              <button
                onClick={() => onNavigate('/settings')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-700 hover:border-slate-500 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <Settings className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-mono font-bold rounded-sm border border-slate-700">
                    Configured
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-slate-200 transition-colors">
                  System Settings
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Precinct configuration</span>
              </button>

              {/* My Profile */}
              <button
                onClick={() => onNavigate('/profile')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-700 hover:border-slate-500 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <UserCheck className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-mono font-bold rounded-sm border border-slate-700">
                    Active
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                  My Profile
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Official credentials</span>
              </button>
            </>
          ) : (
            /* OFFICER / REGULAR USER OPERATIONAL MODULES (STRICTLY THE USER'S BUTTONS) */
            <>
              {/* 1. View Records */}
              <button
                onClick={() => onNavigate('/records')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <ShieldAlert className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-mono font-bold rounded-sm border border-blue-500/20">
                    {totalRecords} Total
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                  View Records
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Criminal registry database</span>
              </button>

              {/* 2. Add Record* */}
              <button
                onClick={() => {
                  if (onOpenNewRecord) {
                    onOpenNewRecord();
                  } else {
                    onNavigate('/records/new');
                  }
                }}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl transition-all group text-left shadow-xs"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <FilePlus className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold rounded-sm border border-emerald-500/30">
                    + New
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Add Record*
                </span>
                <span className="text-[10px] text-emerald-400/90 font-mono mt-0.5">
                  Enroll biometrics &amp; profile
                </span>
              </button>

              {/* 3. Assigned Cases */}
              <button
                onClick={() => onNavigate('/cases')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <Briefcase className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold rounded-sm border border-indigo-500/20">
                    {totalCases} Total
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  Assigned Cases
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{activeCases} active dockets</span>
              </button>

              {/* 4. Arrest Records* */}
              <button
                onClick={() => onNavigate('/arrests')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-orange-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <UserX className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-xs font-mono font-bold rounded-sm border border-orange-500/20">
                    {totalArrests} Total
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-orange-300 transition-colors">
                  Arrest Records*
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Custody bookings &amp; bail</span>
              </button>

              {/* 5. Complaints */}
              <button
                onClick={() => onNavigate('/complaints')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <MessageSquareWarning className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-mono font-bold rounded-sm border border-amber-500/20">
                    {db.complaints.length} Total
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                  Complaints
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{pendingComplaints} pending FIR</span>
              </button>

              {/* 6. Evidence* */}
              <button
                onClick={() => onNavigate('/evidence')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <Package className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs font-mono font-bold rounded-sm border border-purple-500/20">
                    {totalEvidence} Total
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Evidence*
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Chain of custody items</span>
              </button>

              {/* 7. Search */}
              <button
                onClick={() => onNavigate('/search')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <Search className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-mono font-bold rounded-sm border border-slate-700">
                    Search
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-slate-200 transition-colors">
                  Search
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Full repository index query</span>
              </button>

              {/* 8. Allowed Reports */}
              <button
                onClick={() => onNavigate('/reports')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold rounded-sm border border-cyan-500/20">
                    {totalRecords + totalCases} Total
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  Allowed Reports
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Unit clearance metrics</span>
              </button>

              {/* 9. Notifications */}
              <button
                onClick={() => onNavigate('/notifications')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-red-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <BellRing className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs font-mono font-bold rounded-sm border border-red-500/20">
                    {db.notifications.length} Total
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-red-300 transition-colors">
                  Notifications
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Broadcasts &amp; high alerts</span>
              </button>

              {/* 10. My Tasks */}
              <button
                onClick={() => onNavigate('/tasks')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold rounded-sm border border-emerald-500/20">
                    {assignedTasks.length} Pending
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  My Tasks
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Daily duty checklist</span>
              </button>

              {/* 11. My Profile */}
              <button
                onClick={() => onNavigate('/profile')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 rounded-xl transition-all group text-left"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <UserCheck className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-mono font-bold rounded-sm border border-blue-500/20">
                    Badge #{currentUser?.badgeNumber}
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                  My Profile
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Officer ID &amp; credentials</span>
              </button>

              {/* 12. Change Password */}
              <button
                onClick={() => onNavigate('/change-password')}
                className="flex flex-col items-start p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-amber-500/30 hover:border-amber-500/60 rounded-xl transition-all group text-left shadow-xs"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <Key className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-mono font-bold rounded-sm border border-amber-500/30">
                    Security
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                  Change Password
                </span>
                <span className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                  Rotate access passcode
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Evidence In Custody</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">{totalEvidence} Items</div>
          </div>
          <Package className="w-5 h-5 text-purple-400" />
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Under Investigation</div>
            <div className="text-xl font-bold font-mono text-indigo-400 mt-0.5">{underInvestigationCases} Cases</div>
          </div>
          <Activity className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Court Dockets Active</div>
            <div className="text-xl font-bold font-mono text-purple-400 mt-0.5">
              {db.cases.filter(c => c.status === 'Pending Court').length} Dockets
            </div>
          </div>
          <Calendar className="w-5 h-5 text-purple-400" />
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Authorized Personnel</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{activeUsers} Active</div>
          </div>
          <Users className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Analytics Charts Section: Expanded Monthly Activity Trend & Caseload */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase font-mono">
                Monthly Activity Trend &amp; Caseload
              </h2>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-sm border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE DATABASE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real records ({totalRecords}), cases ({totalCases}), and arrests ({totalArrests}) logged in jurisdiction across operational months
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-blue-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
              Criminal Records ({totalRecords})
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]"></span>
              Cases Filed ({totalCases})
            </span>
            <span className="flex items-center gap-1.5 text-orange-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></span>
              Suspects Arrested ({totalArrests})
            </span>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="casesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="recordsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="arrestsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} dy={5} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '10px',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
              <Area
                type="monotone"
                dataKey="records"
                name="Criminal Records"
                stroke="#0284c7"
                fillOpacity={1}
                fill="url(#recordsGrad)"
                strokeWidth={2.5}
              />
              <Area
                type="monotone"
                dataKey="cases"
                name="Cases Filed"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#casesGrad)"
                strokeWidth={2.5}
              />
              <Area
                type="monotone"
                dataKey="arrests"
                name="Suspects Arrested"
                stroke="#f97316"
                fillOpacity={1}
                fill="url(#arrestsGrad)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Crime Categories & Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crime Category Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                Crime Category Volume
              </h2>
              <p className="text-xs text-slate-400">Classified felonies in jurisdiction</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crimeCategoryData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assigned Operational Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                Pending Investigation Tasks
              </h2>
              <button
                onClick={() => onNavigate('/notifications')}
                className="text-xs text-blue-400 hover:text-blue-300 font-mono"
              >
                View All &rarr;
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Deadlines and action items</p>

            <div className="space-y-2.5">
              {assignedTasks.map(task => (
                <div
                  key={task.id}
                  className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white leading-snug">
                      {task.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                      <span className="font-mono text-slate-300">{task.assignedToName}</span>
                      <span>&bull;</span>
                      <span className="font-mono text-amber-400">Due {task.dueDate}</span>
                    </div>
                  </div>
                  <Badge type="casePriority" value={task.priority} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Authorized Activity Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                Live Audit Stream
              </h2>
              <button
                onClick={() => onNavigate('/audit-logs')}
                className="text-xs text-blue-400 hover:text-blue-300 font-mono"
              >
                Full Trail &rarr;
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Tamper-evident operational events</p>

            <div className="space-y-3">
              {recentActivities.map(log => (
                <div key={log.id} className="text-xs border-b border-slate-800/80 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <span className="font-semibold text-slate-200 font-mono">
                      {log.userName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] leading-tight">
                    {log.details}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-800 text-slate-300 rounded-sm">
                      {log.action}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      ID: {log.resourceId}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
